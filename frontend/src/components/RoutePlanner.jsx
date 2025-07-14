import React, { useState } from "react";
import { fetchRoute } from "../api";

function RoutePlanner() {
  const [start, setStart] = useState("A");
  const [end, setEnd] = useState("E");
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    const data = await fetchRoute(start, end);
    setResult(data);
  };

  return (
    <div className="panel">
      <h3>🧭 Route Planner</h3>
      <div>
        <label>Start: </label>
        <input value={start} onChange={e => setStart(e.target.value)} />
      </div>
      <div>
        <label>End: </label>
        <input value={end} onChange={e => setEnd(e.target.value)} />
      </div>
      <button onClick={handleClick}>Get Safe Route</button>
      {result && (
        <div className="route">
          <p><strong>Path:</strong> {result.path ? result.path.join(" ➝ ") : "No path"}</p>
          <p><strong>Distance:</strong> {result.total_distance || "N/A"}</p>
        </div>
      )}
    </div>
  );
}

export default RoutePlanner; 