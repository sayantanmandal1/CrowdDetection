import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-root">
      <div className="landing-content">
        <h1 className="landing-title">Simhastha 2028 Smart Mobility Platform</h1>
        <h2 className="landing-subtitle">Hackathon Project</h2>
        <p className="landing-desc">
          Welcome to the next generation of crowd management and smart routing for Simhastha 2028.<br/>
          Experience real-time alerts, accessibility overlays, and intelligent route planning.<br/>
          Built for the future, by innovators.
        </p>
        <button
          className="try-btn"
          onClick={() => navigate("/map")}
          aria-label="Try the Smart Map"
        >
          <span className="try-btn-text">🚀 Try it Yourself</span>
        </button>
      </div>
      <div className="landing-footer">
        <span>Made with ❤️ for the Simhastha 2028 Hackathon</span>
      </div>
    </div>
  );
}

export default LandingPage; 