import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchRealLocations } from "../api";

const BASE_URL = "http://localhost:8000";
const USER_TYPES = ["public", "VIP", "Divyangjan", "elderly"];

function RoutePlanner({ onRouteFound }) {
  const [locations, setLocations] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userType, setUserType] = useState("public");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRealLocations().then(data => {
      const all = [...(data.ghats || []), ...(data.safe_zones || []), ...(data.transport_hubs || [])];
      setLocations(all);
      if (all.length > 1) {
        setStart(all[0].name);
        setEnd(all[1].name);
      }
    });
  }, []);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.get(`${BASE_URL}/routes/smart-path/`, {
        params: { start, end, user_type: userType },
      });
      setResult(res.data);
      if (onRouteFound) onRouteFound(res.data);
    } catch (err) {
      setError("No route found or server error.");
      if (onRouteFound) onRouteFound(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3>🧭 Route Planner</h3>
      <div>
        <label>Start: </label>
        <select value={start} onChange={e => setStart(e.target.value)} style={{maxWidth: '100%'}}>
          {locations.map(loc => (
            <option key={loc.name || loc.lat+','+loc.lon} value={loc.name || `${loc.lat},${loc.lon}`}>{loc.name || 'Unknown Location'} ({loc.category || 'Type Unknown'})</option>
          ))}
        </select>
      </div>
      <div>
        <label>End: </label>
        <select value={end} onChange={e => setEnd(e.target.value)} style={{maxWidth: '100%'}}>
          {locations.map(loc => (
            <option key={loc.name || loc.lat+','+loc.lon} value={loc.name || `${loc.lat},${loc.lon}`}>{loc.name || 'Unknown Location'} ({loc.category || 'Type Unknown'})</option>
          ))}
        </select>
      </div>
      <div>
        <label>User Type: </label>
        <select value={userType} onChange={e => setUserType(e.target.value)}>
          {USER_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <button onClick={handleClick} disabled={loading}>Find Route</button>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {result && result.path && (
        <div>
          <h4>Route Found</h4>
          <p>Distance: {result.total_distance_m.toFixed(1)} meters</p>
          <p>Path: {result.path.map(([lat, lon], i) => <span key={i}>({lat.toFixed(5)}, {lon.toFixed(5)}) </span>)}</p>
        </div>
      )}
      {result && result.message && <p style={{color: 'red'}}>{result.message}</p>}
    </div>
  );
}

export default RoutePlanner; 