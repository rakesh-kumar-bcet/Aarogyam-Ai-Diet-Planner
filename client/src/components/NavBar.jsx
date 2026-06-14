import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../Services/authService";
import { fetchContactHistory } from "../Services/contactService";
import { connectSocket, subscribe } from "../Services/socketService";
import { FaBell } from "react-icons/fa";
import Logo from "./Logo";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name =
    localStorage.getItem("userName") || localStorage.getItem("name");

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const pollingRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetchContactHistory();
        const items = res.data || [];
        const count = items.reduce((acc, it) => {
          return acc + (it.resolved ? 0 : 1);
        }, 0);
        setNotifCount(count);
      } catch (err) {
        // ignore notification failures silently
      }
    };

    const showToast = (message) => {
      if (!message) return;
      setToast({ visible: true, message });
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        setToast({ visible: false, message: '' });
      }, 4500);
    };

    const handleSocketEvent = (event) => {
      if (!event || !event.type) return;
      loadNotifications();

      if (event.type === 'notification') {
        const type = event.payload?.eventType;
        const label = type === 'call_request' ? 'Call request' : type === 'new_contact_request' ? 'Contact request' : 'New notification';
        const text = event.payload?.message || `${label} received.`;
        showToast(text);
      }
      if (event.type === 'contact_response') {
        const text = event.payload?.response || 'Your nutritionist replied to your request.';
        showToast(text);
      }
      if (event.type === 'chat_message') {
        if (role === 'nutrenist') {
          const sender = event.payload?.senderName || 'A patient';
          showToast(`${sender} sent a new message.`);
        } else {
          showToast('Your nutritionist sent a new chat message.');
        }
      }
    };

    loadNotifications();
    connectSocket();

    const notificationUnsubscribe = subscribe('notification', handleSocketEvent);
    const chatUnsubscribe = subscribe('chat_message', handleSocketEvent);
    const responseUnsubscribe = subscribe('contact_response', handleSocketEvent);

    pollingRef.current = setInterval(loadNotifications, 30000);

    return () => {
      clearInterval(pollingRef.current);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      notificationUnsubscribe();
      chatUnsubscribe();
      responseUnsubscribe();
    };
  }, [role]);

  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/auth-entry" ||
    location.pathname === "/guest-diet-plan";
  if (hideNav) {
    return null;
  }

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout API error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    // clear any stored weight data on logout to avoid showing stale values
    localStorage.removeItem("weight");
    localStorage.removeItem("weightProvided");
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white/10 backdrop-blur-md border border-white/10 text-slate-900 p-4 rounded-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <Logo showText={false} iconClassName="h-14 w-14" />
              <div className="hidden sm:flex flex-col">
                <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Aarogyam</p>
                <p className="text-xs text-slate-500">Diet Planner • Health • Fitness</p>
              </div>
            </Link>
          </div>

          {/* hamburger for small screens */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          <div
            className={`space-x-4 ${menuOpen ? "block" : "hidden"} md:flex md:items-center md:space-x-4`}
          >
            {!token ? (
              <>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/login"
                  className="hover:underline block md:inline"
                >
                  Login
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/register"
                  className="hover:underline block md:inline"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/dashboard"
                  className="hover:underline block md:inline"
                >
                  Dashboard
                </Link>
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/calories"
                  className="hover:underline block md:inline"
                >
                  Calories
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="relative p-2 rounded-md hover:bg-white/5"
                  aria-label="Notifications"
                >
                  <FaBell className="text-lg" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-xs w-5 h-5">{notifCount}</span>
                  )}
                </button>
                {role === "nutrenist" && (
                  <Link
                    onClick={() => setMenuOpen(false)}
                    to="/nutrenist"
                    className="hover:underline block md:inline"
                  >
                    Nutrenist Panel
                  </Link>
                )}
                {role === "admin" && (
                  <Link
                    onClick={() => setMenuOpen(false)}
                    to="/admin"
                    className="hover:underline block md:inline"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="relative inline-block text-left">
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); setProfileOpen((s) => !s); }}
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition rounded-full"
                    aria-expanded={profileOpen}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 text-base">
                      👤
                    </span>
                    <span className="text-sm font-medium text-slate-700">{name || "User"}</span>
                  </button>
                  {profileOpen && (
                    <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                        <button
                          onClick={() => { logout(); setProfileOpen(false); setMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      {toast.visible && (
        <div className="fixed right-4 top-24 z-50 max-w-sm rounded-2xl border border-slate-200 bg-slate-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </>
  );
}
