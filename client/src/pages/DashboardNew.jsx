import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLastPlan } from "../Services/dietService";
import { fetchContactHistory, resolveContactRequest, sendContactMessage } from "../Services/contactService";
import { submitFeedback } from "../Services/feedbackService";
import {
  FaBell,
  FaBrain,
  FaCalendarAlt,
  FaChartLine,
  FaBookOpen,
  FaCheckCircle,
  FaHeart,
  FaLeaf,
  FaPaperPlane,
  FaFire,
  FaWeight,
  FaArrowUp,
} from "react-icons/fa";
import UserHeader from "../components/UserHeader";
import { logoutUser } from "../Services/authService";
import profile from "../assets/profile.png";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastPlan, setLastPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactHistory, setContactHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [messageText, setMessageText] = useState({});
  const [messageSending, setMessageSending] = useState({});
  const [ratingPayload, setRatingPayload] = useState({});
  const [ratingStatus, setRatingStatus] = useState({});
  const [resolveMessage, setResolveMessage] = useState("");

  useEffect(() => {
    const loadLastPlan = async () => {
      try {
        const plan = await getLastPlan();
        if (plan && !plan.message) {
          setLastPlan(plan);
        }
      } catch (err) {
        console.error("Failed to load last plan:", err);
        setError(err.message || "Unable to load your most recent plan.");
      } finally {
        setLoading(false);
      }
    };

    const loadContactHistory = async () => {
      try {
        const res = await fetchContactHistory();
        setContactHistory(res.data || []);
      } catch (err) {
        console.error("Failed to load contact history:", err);
        setHistoryError("Unable to load your nutritionist contact history.");
      } finally {
        setHistoryLoading(false);
      }
    };

    loadLastPlan();
    loadContactHistory();
  }, []);

  const handleResolve = async (requestId) => {
    try {
      const res = await resolveContactRequest(requestId);
      const updated = res.data.request;
      setContactHistory((prev) => prev.map((item) => (item._id === requestId ? updated : item)));
      setResolveMessage("Conversation closed. You can now leave a rating and review.");
    } catch (err) {
      console.error("Failed to resolve contact request:", err);
      setResolveMessage("Unable to close this conversation at the moment.");
    }
  };

  const handleSendMessage = async (requestId) => {
    const text = messageText[requestId]?.trim();
    if (!text) return;

    setMessageSending((prev) => ({ ...prev, [requestId]: true }));

    try {
      const res = await sendContactMessage(requestId, text);
      const updated = res.data.request;
      setContactHistory((prev) => prev.map((item) => (item._id === requestId ? updated : item)));
      setMessageText((prev) => ({ ...prev, [requestId]: "" }));
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setMessageSending((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRatingChange = (requestId, field, value) => {
    setRatingPayload((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmitRating = async (request) => {
    const payload = ratingPayload[request._id] || {};
    const rating = Number(payload.rating);
    const comment = payload.comment || "";

    if (!rating || rating < 1) {
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Please choose a rating before submitting.",
      }));
      return;
    }

    try {
      const nutritionistId = request.nutritionistId._id || request.nutritionistId;
      await submitFeedback(nutritionistId, rating, comment);
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Thank you! Your review has been submitted.",
      }));
      setRatingPayload((prev) => ({
        ...prev,
        [request._id]: { rating: 0, comment: "" },
      }));
    } catch (err) {
      console.error("Submit rating error:", err);
      setRatingStatus((prev) => ({
        ...prev,
        [request._id]: "Unable to submit review, please try again.",
      }));
    }
  };

  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "User";
  const activeDays = lastPlan?.durationDays || 7;

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <div className="dashboard-page min-h-screen overflow-hidden bg-[#f5fcf5] text-slate-900">
      <div className="dashboard-decorations" aria-hidden="true">
        <span className="dashboard-circle circle-1" />
        <span className="dashboard-circle circle-2" />
        <span className="dashboard-circle circle-3" />
        <span className="dashboard-wave" />
        <span className="dashboard-grid-dot dot-1" />
        <span className="dashboard-grid-dot dot-2" />
        <span className="dashboard-network network-1" />
        <span className="dashboard-network network-2" />
        <span className="dashboard-float-icon icon-salad">🥗</span>
        <span className="dashboard-float-icon icon-apple">🍎</span>
        <span className="dashboard-float-icon icon-progress">📈</span>
        <span className="dashboard-float-icon icon-heartbeat">❤️</span>
        <span className="dashboard-float-icon icon-ai">🤖</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="dashboard-navbar mb-8 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-inner shadow-emerald-200/70">
                <FaLeaf className="text-2xl" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Aarogyam</p>
                <p className="text-sm text-slate-500">AI Nutrition • Health • Wellness</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto relative">
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((s) => !s)}
                  className="dashboard-icon-button"
                  aria-label="Notifications"
                >
                  <FaBell className="text-lg" />
                  <span className="dashboard-badge">{contactHistory.filter(i => !i.resolved).length}</span>
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-72 overflow-auto rounded-lg bg-white shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b text-sm font-semibold">Notifications</div>
                    {historyLoading ? (
                      <div className="p-4 text-sm text-gray-500">Loading...</div>
                    ) : contactHistory.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No notifications</div>
                    ) : (
                      contactHistory.map((c) => (
                        <div key={c._id} className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0">
                          <div className="text-sm font-medium text-slate-800">{c.nutritionistId?.name || 'Nutritionist'}</div>
                          <div className="text-xs text-slate-500">{c.message || 'New message'}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt || c.timestamp).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button onMouseDown={(e) => { e.stopPropagation(); setProfileOpen((s) => !s); }} onClick={(e) => e.preventDefault()} className="dashboard-profile-pill rounded-full bg-white px-3 py-2 shadow-sm flex items-center gap-3">
                  <img src={profile} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                  <div className="hidden min-w-[90px] flex-col md:flex">
                    <span className="text-sm font-semibold text-slate-900">{userName}</span>
                    <span className="text-xs text-slate-500">Premium Member</span>
                  </div>
                </button>

                {profileOpen && (
                  <div onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button onClick={() => { navigate('/profile'); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</button>
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="hero-grid grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              AI Nutrition Assistant
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Welcome back, {userName} <span>👋</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Plan smarter, eat better, and achieve your health goals with personalized nutrition.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button onClick={() => navigate("/generate-plan")} className="dashboard-primary-btn">
                Generate Plan
              </button>
              <button onClick={() => navigate("/my-plans")} className="dashboard-secondary-btn">
                View History
              </button>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <div className="hero-profile-card relative overflow-visible rounded-full bg-transparent p-0 shadow-none border-0 mt-6">
              <span className="hero-profile-icon hero-frame-icon-salad">🥗</span>
              <span className="hero-profile-icon hero-frame-icon-apple">🍎</span>
              <span className="hero-profile-icon hero-frame-icon-progress">📈</span>
              <span className="hero-profile-icon hero-frame-icon-heartbeat">❤️</span>
              <span className="hero-profile-icon hero-frame-icon-ai">🤖</span>
              <div className="relative z-10 flex justify-center">
                <img src={profile} alt="Eating healthy" className="hero-profile-image rounded-full border-8 border-white shadow-2xl" />
              </div>
              <div className="recommendation-card absolute right-4 top-6 w-64 rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <FaBrain /> AI Recommendation
                </div>
                <h3 className="text-base font-semibold text-slate-900">High Protein Diet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Optimized for muscle recovery and sustained energy.</p>
                <button onClick={() => navigate("/diet-plan")} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  View Plan
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="feature-card animate-fade-in">
            <div className="feature-icon bg-emerald-50 text-emerald-700">
              <FaHeart />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Contact Nutritionist</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Connect with our certified nutritionist for personalized guidance and support.</p>
            </div>
            <button onClick={() => navigate("/nutritionist-directory")} className="feature-action">
              Connect Now
            </button>
          </div>
          <div className="feature-card animate-fade-in">
            <div className="feature-icon bg-emerald-50 text-emerald-700">
              <FaChartLine />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Improve Your Routine</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Get AI-powered tips and recommendations to improve your daily habits.</p>
            </div>
            <button onClick={() => navigate("/improvement")} className="feature-action">
              Improve Now
            </button>
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Nutritionist Conversations</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Communicate with your nutritionists, continue conversations, and leave reviews when problems are resolved.</p>
            </div>
            {resolveMessage ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{resolveMessage}</div>
            ) : null}
          </div>

          <div className="mt-6 space-y-6">
            {historyLoading ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading conversations...</div>
            ) : historyError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{historyError}</div>
            ) : contactHistory.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">No conversations yet. Start by contacting a nutritionist to get personalized support.</div>
            ) : (
              contactHistory.map((item) => {
                const nutritionist = item.nutritionistId || {};
                const isExpanded = expandedRequestId === item._id;

                return (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{nutritionist.name || "Nutritionist"}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.message || "Review your last meal plan and request a follow-up."}</p>
                        <p className="mt-3 text-xs text-slate-500">{new Date(item.createdAt || item.timestamp).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => setExpandedRequestId(isExpanded ? null : item._id)}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                        <p className="text-sm text-slate-600">Here you can continue the conversation and close the request when done.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <button
                            onClick={() => handleResolve(item._id)}
                            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Resolve Conversation
                          </button>
                          <button
                            onClick={() => navigate("/nutritionist-directory")}
                            className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                          >
                            Contact Nutritionist
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-10 rounded-[32px] border border-slate-200/90 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recent Plan Summary</h2>
              <p className="text-slate-600 mt-2">Your latest saved plan gives you a quick overview of calories, note warnings, and recommendations.</p>
            </div>
            <button onClick={() => navigate("/my-plans")} className="dashboard-secondary-btn">
              View My Plans
            </button>
          </div>

          {loading ? (
            <div className="mt-8 text-slate-600">Loading latest plan...</div>
          ) : error ? (
            <div className="mt-8 rounded-2xl bg-yellow-50 border border-yellow-200 p-6 text-yellow-700">{error}</div>
          ) : lastPlan ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="bg-blue-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Daily Calories</p>
                <p className="text-3xl font-bold text-blue-700">{lastPlan.dailyCalories}</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Recommended Foods</p>
                <p className="text-lg font-semibold text-emerald-700">{(lastPlan.prefer || []).slice(0, 2).join(", ") || "No data"}</p>
              </div>
              <div className="bg-rose-50 rounded-2xl p-6">
                <p className="text-sm text-slate-600">Avoid</p>
                <p className="text-lg font-semibold text-rose-700">{(lastPlan.avoid || []).slice(0, 2).join(", ") || "No data"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-slate-700">No recent plan found. Generate your first personalized plan to get started.</div>
          )}
        </section>
      </div>
    </div>
  );
}
