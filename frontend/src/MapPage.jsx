import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import RoutePlanner from "./components/RoutePlanner";
import AlertsPanel from "./components/AlertsPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function MapPage() {
  const [route, setRoute] = useState(null);
  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [showAccessible, setShowAccessible] = useState(false);
  const [showTransport, setShowTransport] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <div className="map-page-root">
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={darkMode ? "dark" : "light"} />
      <MapView
        route={route}
        startLoc={startLoc}
        endLoc={endLoc}
        showAccessible={showAccessible}
        showTransport={showTransport}
        showAlerts={showAlerts}
        showVIP={showVIP}
        darkMode={darkMode}
      />
      {showSidebar && (
        <div className="map-overlay-sidebar">
          <button className="btn btn-secondary toggle-dark-btn" onClick={() => setDarkMode(v => !v)} aria-label="Toggle dark mode">
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className={`btn btn-secondary overlay-btn${showAccessible ? ' active' : ''}`} onClick={() => setShowAccessible(v => !v)} aria-pressed={showAccessible} aria-label="Toggle Accessibility Overlay">
            {showAccessible ? 'Hide' : 'Show'} Accessibility
          </button>
          <button className={`btn btn-secondary overlay-btn${showTransport ? ' active' : ''}`} onClick={() => setShowTransport(v => !v)} aria-pressed={showTransport} aria-label="Toggle Public Transport">
            {showTransport ? 'Hide' : 'Show'} Transport
          </button>
          <button className={`btn btn-secondary overlay-btn${showAlerts ? ' active' : ''}`} onClick={() => setShowAlerts(v => !v)} aria-pressed={showAlerts} aria-label="Toggle Alerts">
            {showAlerts ? 'Hide' : 'Show'} Alerts
          </button>
          <button className={`btn btn-secondary overlay-btn${showVIP ? ' active' : ''}`} onClick={() => setShowVIP(v => !v)} aria-pressed={showVIP} aria-label="Toggle VIP Route">
            {showVIP ? 'Hide' : 'Show'} VIP Route
          </button>
          <RoutePlanner onRouteFound={setRoute} onStartChange={setStartLoc} onEndChange={setEndLoc} />
          <AlertsPanel />
        </div>
      )}
      <button className="sidebar-toggle-fab" onClick={() => setShowSidebar(v => !v)} aria-label="Toggle sidebar">
        {showSidebar ? '❌' : '☰'}
      </button>
    </div>
  );
}

export default MapPage; 