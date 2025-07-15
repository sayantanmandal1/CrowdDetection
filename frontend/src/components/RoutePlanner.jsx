import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchRealLocations } from "../api";
import Select from "react-select";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:8000";
const USER_TYPES = ["public", "VIP", "Divyangjan", "elderly"];

function RoutePlanner({ onRouteFound, onStartChange, onEndChange }) {
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
        const startOpt = { value: all[0].name || `${all[0].lat},${all[0].lon}`, label: `${all[0].name || 'Unknown Location'} (${all[0].category || 'Type Unknown'})`, loc: all[0] };
        const endOpt = { value: all[1].name || `${all[1].lat},${all[1].lon}`, label: `${all[1].name || 'Unknown Location'} (${all[1].category || 'Type Unknown'})`, loc: all[1] };
        setStart(startOpt);
        setEnd(endOpt);
        if (onStartChange) onStartChange(all[0]);
        if (onEndChange) onEndChange(all[1]);
      }
    });
  }, [onStartChange, onEndChange]);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.get(`${BASE_URL}/routes/smart-path/`, {
        params: { start: start.value, end: end.value, user_type: userType },
      });
      setResult(res.data);
      if (onRouteFound) onRouteFound(res.data);
      if (res.data && res.data.path) {
        toast.success("Route found!", { icon: "🧭" });
      } else {
        toast.error(res.data.message || "No route found.", { icon: "❌" });
      }
    } catch (err) {
      setError("No route found or server error.");
      if (onRouteFound) onRouteFound(null);
      toast.error("No route found or server error.", { icon: "❌" });
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = locations.map(loc => ({
    value: loc.name || `${loc.lat},${loc.lon}`,
    label: `${loc.name || 'Unknown Location'} (${loc.category || 'Type Unknown'})`,
    loc,
  }));

  return (
    <div className="panel">
      <h3>🧭 Route Planner</h3>
      <div>
        <label>Start: </label>
        <Select
          value={start}
          onChange={opt => { setStart(opt); if (onStartChange) onStartChange(opt?.loc); }}
          options={locationOptions}
          placeholder="Select start location..."
          isSearchable
          styles={{ container: base => ({ ...base, maxWidth: '100%' }) }}
        />
      </div>
      <div>
        <label>End: </label>
        <Select
          value={end}
          onChange={opt => { setEnd(opt); if (onEndChange) onEndChange(opt?.loc); }}
          options={locationOptions}
          placeholder="Select end location..."
          isSearchable
          styles={{ container: base => ({ ...base, maxWidth: '100%' }) }}
        />
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