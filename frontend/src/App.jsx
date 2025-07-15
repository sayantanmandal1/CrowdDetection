import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import RoutePlanner from "./components/RoutePlanner";
import AlertsPanel from "./components/AlertsPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [route, setRoute] = useState(null);
  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [showAccessible, setShowAccessible] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={darkMode ? "dark" : "light"} />
      <div className="header">
        <span role="img" aria-label="Simhastha">🔉</span> Simhastha 2028 Smart Mobility & Access Management
        <button
          className="toggle-theme-btn"
          onClick={() => setDarkMode(v => !v)}
          aria-pressed={darkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <div className="app-container">
        <div className="sidebar">
          <button
            className={`sidebar-btn${showAccessible ? ' active' : ''}`}
            onClick={() => setShowAccessible(v => !v)}
            aria-pressed={showAccessible}
            aria-label="Toggle Accessibility Overlay"
          >
            {showAccessible ? 'Hide' : 'Show'} Accessibility Overlay
          </button>
          <button
            className={`sidebar-btn${showTransport ? ' active' : ''}`}
            onClick={() => setShowTransport(v => !v)}
            aria-pressed={showTransport}
            aria-label="Toggle Public Transport"
          >
            {showTransport ? 'Hide' : 'Show'} Public Transport
          </button>
          <button
            className={`sidebar-btn${showAlerts ? ' active' : ''}`}
            onClick={() => setShowAlerts(v => !v)}
            aria-pressed={showAlerts}
            aria-label="Toggle Alerts"
          >
            {showAlerts ? 'Hide' : 'Show'} Alerts
          </button>
          <button
            className={`sidebar-btn${showVIP ? ' active' : ''}`}
            onClick={() => setShowVIP(v => !v)}
            aria-pressed={showVIP}
            aria-label="Toggle VIP Route"
          >
            {showVIP ? 'Hide' : 'Show'} VIP Route
          </button>
          <RoutePlanner onRouteFound={setRoute} onStartChange={setStartLoc} onEndChange={setEndLoc} />
          <AlertsPanel />
        </div>
        <div className="main-content">
          <MapView route={route} startLoc={startLoc} endLoc={endLoc} showAccessible={showAccessible} showTransport={showTransport} showAlerts={showAlerts} showVIP={showVIP} darkMode={darkMode} />
        </div>
      </div>
    </>
  );
}

export default App; 