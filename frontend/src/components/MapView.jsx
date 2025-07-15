import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { fetchGeoJSON } from "../api";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

// Fix for missing default marker icons in some build setups
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapView() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const initMap = async () => {
      // Prevent multiple initializations
      if (mapInstanceRef.current) {
        return;
      }

      try {
        const geoData = await fetchGeoJSON();

        // Create map instance
        const map = L.map(mapRef.current).setView([22.717, 75.857], 13);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const zoneColors = {
          critical_zone: "#d62728",
          emergency: "#1f77b4",
          sanitation: "#2ca02c",
        };

        L.geoJSON(geoData, {
          style: feature =>
            feature.geometry.type === "Polygon"
              ? {
                  color: zoneColors[feature.properties.type] || "#888",
                  weight: 2,
                  fillOpacity: 0.5,
                }
              : undefined,
          pointToLayer: (feature, latlng) => {
            // Use a real marker for points
            return L.marker(latlng, { icon: new L.Icon.Default() });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }
          },
        }).addTo(map);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return <div className="map-container" ref={mapRef} />;
}

export default MapView;
