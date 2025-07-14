import React from "react";
import MapView from "./components/MapView";
import AlertsPanel from "./components/AlertsPanel";
import RoutePlanner from "./components/RoutePlanner";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <h1>🕉️ Crowd Management Dashboard</h1>
      <MapView />
      <div className="panel-row">
        <AlertsPanel />
        <RoutePlanner />
      </div>
    </div>
  );
}

export default App; 