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
        <span role="img" aria-label="Simhastha">🕉️</span> Simhastha 2028 Smart Mobility & Access Management
        <button
          style={{ float: 'right', marginRight: 32, background: darkMode ? '#222' : '#fff', color: darkMode ? '#fff' : '#222', border: '1.5px solid #bbb', fontSize: '1.1rem', padding: '8px 18px', borderRadius: 8, boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }}
          onClick={() => setDarkMode(v => !v)}
          aria-pressed={darkMode}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <div className="app-container">
        <div className="sidebar">
          <button
            style={{marginBottom: 12, background: showAccessible ? '#43a047' : undefined}}
            onClick={() => setShowAccessible(v => !v)}
            aria-pressed={showAccessible}
          >
            {showAccessible ? 'Hide' : 'Show'} Accessibility Overlay
          </button>
          <button
            style={{marginBottom: 12, background: showTransport ? '#4f8cff' : undefined}}
            onClick={() => setShowTransport(v => !v)}
            aria-pressed={showTransport}
          >
            {showTransport ? 'Hide' : 'Show'} Public Transport
          </button>
          <button
            style={{marginBottom: 12, background: showAlerts ? '#e53935' : undefined}}
            onClick={() => setShowAlerts(v => !v)}
            aria-pressed={showAlerts}
          >
            {showAlerts ? 'Hide' : 'Show'} Alerts
          </button>
          <button
            style={{marginBottom: 18, background: showVIP ? 'gold' : undefined, color: showVIP ? '#222' : undefined, fontWeight: showVIP ? 700 : undefined}}
            onClick={() => setShowVIP(v => !v)}
            aria-pressed={showVIP}
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