import React, { useState, useEffect } from "react";
import { fetchAlert, fetchRealLocations } from "../api";

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
  };

  return (
    <div className="panel">
      <h3>🚨 Emergency Alert Panel</h3>
      <div>
        <label>Location: </label>
        <select value={locationId} onChange={e => setLocationId(e.target.value)}>
          {locations.map(loc => (
            <option key={loc.name} value={loc.name}>{loc.name} ({loc.category})</option>
          ))}
        </select>
      </div>
      <div>
        <label>People Count: </label>
        <input type="number" value={count} onChange={e => setCount(+e.target.value)} />
      </div>
      <button onClick={handleClick}>Check Alert</button>
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