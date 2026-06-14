import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "../components/Carousel";
import Logo from "../components/Logo";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Secret admin access: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        navigate("/admin-login");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  return (
    <div className="w-full min-h-screen relative">
      <div className="fixed top-6 left-6 z-50 rounded-full border-2 border-white/70 w-32 h-32 overflow-hidden shadow-lg">
        <Logo showText={false} iconClassName="h-full w-full object-cover" />
      </div>

      <Carousel interval={5000} />

      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 md:bottom-8 z-50 pointer-events-auto">
        <button
          onClick={() => navigate("/auth-entry")}
          className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base sm:text-lg font-bold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-black/30 transform hover:-translate-y-0.5"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
