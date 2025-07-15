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
    <div className="card alerts-panel">
      <div className="card-body">
        <h3 className="card-title mb-3" aria-label="Emergency Alert Panel">🚨 Emergency Alert Panel</h3>
        <div className="mb-3 form-row">
          <label htmlFor="alert-location" className="form-label">Location: </label>
          <select id="alert-location" className="form-select" value={locationId} onChange={e => setLocationId(e.target.value)} aria-label="Select location">
            {locations.map(loc => (
              <option key={loc.name} value={loc.name}>{loc.name} ({loc.category})</option>
            ))}
          </select>
        </div>
        <div className="mb-3 form-row">
          <label htmlFor="alert-count" className="form-label">People Count: </label>
          <input id="alert-count" className="form-control" type="number" value={count} onChange={e => setCount(+e.target.value)} aria-label="People count" />
        </div>
        <button className="btn btn-primary w-100 alert-btn" onClick={handleClick} aria-label="Check Alert">Check Alert</button>
        {alert && (
          <div className="alert alert-info mt-3">
            <p className="mb-1"><strong>Level:</strong> {alert.alert_level}</p>
            <p className="mb-1"><strong>Reasons:</strong> {alert.trigger_reasons.join(", ")}</p>
            <p className="mb-0"><strong>Action:</strong> {alert.recommended_action}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsPanel; 