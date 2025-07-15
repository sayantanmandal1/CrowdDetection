import React, { useEffect, useRef, useLayoutEffect } from "react";
import L from "leaflet";
import { fetchRealLocations } from "../api";
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

function MapView({ route }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);

  useLayoutEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    // Initialize map only once
    const map = L.map(mapRef.current).setView([23.1765, 75.7885], 13);
    mapInstanceRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    // Add real POI markers
    fetchRealLocations().then(data => {
      if (!mapInstanceRef.current) return;
      const all = [...(data.ghats || []), ...(data.safe_zones || []), ...(data.transport_hubs || [])];
      markersRef.current = all.map(loc => {
        if (!mapInstanceRef.current) return null;
        const marker = L.marker([loc.lat, loc.lon], { icon: new L.Icon.Default() })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<strong>${loc.name}</strong> (${loc.category})`);
        return marker;
      }).filter(Boolean);
    });
    return () => {
      // Cleanup markers and map
      markersRef.current.forEach(marker => marker && map.removeLayer(marker));
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Draw route if provided
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (route && route.path && route.path.length > 1) {
      const latlngs = route.path.map(([lat, lon]) => [lat, lon]);
      routeLayerRef.current = L.polyline(latlngs, { color: "blue", weight: 5 }).addTo(map);
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [30, 30] });
    }
  }, [route]);

  return <div ref={mapRef} id="map" style={{ height: "500px", width: "100%" }} />;
}

export default MapView;
