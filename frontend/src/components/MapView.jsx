import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { fetchGeoJSON } from "../api";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      const geoData = await fetchGeoJSON();

      const map = L.map(mapRef.current).setView([22.717, 75.857], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const zoneColors = {
        critical_zone: "#d62728",
        emergency: "#1f77b4",
        sanitation: "#2ca02c",
      };

      L.geoJSON(geoData, {
        style: feature => ({
          color: zoneColors[feature.properties.type] || "#888",
          weight: 2,
          fillOpacity: 0.5,
        }),
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
          }
        },
      }).addTo(map);
    };

    initMap();
  }, []);

  return <div className="map-container" ref={mapRef} />;
}

export default MapView;
