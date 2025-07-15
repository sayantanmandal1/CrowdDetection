import React, { useState, useEffect } from "react";
import { fetchAlert, fetchRealLocations } from "../api";
import { toast } from "react-toastify";

function AlertsPanel() {
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [count, setCount] = useState(100);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchRealLocations().then(data => {
      const all = [...(data.ghats || []), ...(data.safe_zones || []), ...(data.transport_hubs || [])];
      setLocations(all);
      if (all.length > 0) setLocationId(all[0].name);
    });
  }, []);

  const handleClick = async () => {
    const data = await fetchAlert(locationId, count, false, false);
    setAlert(data);
    if (data && data.alert_level === "HIGH") {
      toast.warn(`HIGH alert at ${locationId}!`, { icon: "🚨" });
    } else if (data && data.alert_level) {
      toast.info(`${data.alert_level} alert at ${locationId}.`, { icon: "⚠️" });
    }
  };

  return (
    <div className="panel alerts-panel">
      <h3 aria-label="Emergency Alert Panel">🚨 Emergency Alert Panel</h3>
      <div className="form-row">
        <label htmlFor="alert-location">Location: </label>
        <select id="alert-location" value={locationId} onChange={e => setLocationId(e.target.value)} aria-label="Select location">
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name} ({loc.category})</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="alert-count">People Count: </label>
        <input id="alert-count" type="number" value={count} onChange={e => setCount(+e.target.value)} aria-label="People count" />
      </div>
      <button className="alert-btn" onClick={handleClick} aria-label="Check Alert">Check Alert</button>
      {alert && (
        <div className="alert">
          <p><strong>Level:</strong> {alert.alert_level}</p>
          <p><strong>Reasons:</strong> {alert.trigger_reasons.join(", ")}</p>
          <p><strong>Action:</strong> {alert.recommended_action}</p>
        </div>
      )}
    </div>
  );
}

export default AlertsPanel; 