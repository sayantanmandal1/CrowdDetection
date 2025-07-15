import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const USER_TYPES = ["public", "VIP", "Divyangjan", "elderly"];

function RoutePlanner() {
  const [start, setStart] = useState("A");
  const [end, setEnd] = useState("E");
  const [userType, setUserType] = useState("public");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.get(`${BASE_URL}/routes/smart-path/`, {
        params: { start, end, user_type: userType },
      });
      setResult(res.data);
    } catch (err) {
      setError("No route found or server error.");
    } finally {
      setLoading(false);
    }
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
      <div>
        <label>User Type: </label>
        <select value={userType} onChange={e => setUserType(e.target.value)}>
          {USER_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Finding Route..." : "Get Smart Route"}
      </button>
      {error && <div className="alert">{error}</div>}
      {result && (
        <div className="route">
          <p><strong>Path:</strong> {result.path ? result.path.join(" ➝ ") : "No path"}</p>
          <p><strong>Distance:</strong> {result.total_distance || "N/A"}</p>
          <p><strong>User Type:</strong> {result.user_type}</p>
          {result.removed_nodes && result.removed_nodes.length > 0 && (
            <p><strong>Nodes avoided:</strong> {result.removed_nodes.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RoutePlanner; 