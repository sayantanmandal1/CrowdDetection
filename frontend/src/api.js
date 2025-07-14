import axios from "axios";

const BASE_URL = "http://localhost:8000";

export const fetchGeoJSON = async () => {
  const res = await axios.get(`${BASE_URL}/map/geojson/`); // Added trailing slash
  return res.data;
};

export const fetchAlert = async (location_id, people_count, fire = false, stampede = false) => {
  const res = await axios.get(`${BASE_URL}/alerts`, {
    params: { location_id, people_count, fire, stampede },
  });
  return res.data;
};

export const fetchRoute = async (start, end) => {
  const res = await axios.get(`${BASE_URL}/routes/safe-path`, {
    params: { start, end },
  });
  return res.data;
}; 