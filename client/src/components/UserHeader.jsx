import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export default function UserHeader() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const name =
      localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      "User";
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg transition-all hover:scale-105"
          title={userName}
        >
          <span className="text-xl">👤</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-semibold text-gray-900">{userName}</p>
            </div>

            <button
              onClick={() => {
                navigate("/profile");
                setIsDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <FaCog size={16} /> Profile Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
            >
              <FaSignOutAlt size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
