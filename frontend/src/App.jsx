import React, { useState } from "react";
import MapView from "./components/MapView";
import RoutePlanner from "./components/RoutePlanner";
import AlertsPanel from "./components/AlertsPanel";
import "./App.css";

function App() {
  const [route, setRoute] = useState(null);

  return (
    <>
      <div className="header">
        <span role="img" aria-label="Simhastha">🕉️</span> Simhastha 2028 Smart Mobility & Access Management
      </div>
      <div className="app-container">
        <div className="sidebar">
          <RoutePlanner onRouteFound={setRoute} />
          <AlertsPanel />
        </div>
        <div className="main-content">
          <MapView route={route} />
        </div>
      </div>
    </>
  );
}

export default App; 