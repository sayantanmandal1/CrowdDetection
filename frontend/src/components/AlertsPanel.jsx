import React, { useState } from "react";
import { fetchAlert } from "../api";

function AlertsPanel() {
  const [locationId, setLocationId] = useState("ghat1");
  const [count, setCount] = useState(1200);
  const [alert, setAlert] = useState(null);

  const handleClick = async () => {
    const data = await fetchAlert(locationId, count, true, false);
    setAlert(data);
  };

  return (
    <div className="panel">
      <h3>🚨 Emergency Alert Panel</h3>
      <div>
        <label>Location ID: </label>
        <input value={locationId} onChange={e => setLocationId(e.target.value)} />
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