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
    <div className="landing-page">
      <div className="landing-accents">
        <div className="landing-accent landing-accent-fruit" />
        <div className="landing-accent landing-accent-dumbbell" />
        <div className="landing-accent landing-accent-salad" />
      </div>

      <div className="landing-logo">
        <Logo showText={false} iconClassName="h-full w-full object-contain" />
      </div>

      <main className="landing-main">
        <section className="landing-visual">
          <Carousel interval={4000} />
        </section>

        <section className="landing-copy landing-copy-right">
          <span className="landing-badge">AI Diet Planner</span>
          <h1>Personalized nutrition plans tailored to your goals.</h1>
          <p>
            Get a tailored diet plan fast with a mobile-friendly experience that feels
            native on every device.
          </p>
          <button
            onClick={() => navigate("/auth-entry")}
            className="landing-cta"
          >
            Get Started
          </button>
        </section>
      </main>
    </div>
  );
}
