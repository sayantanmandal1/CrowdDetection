import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
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

function MapView({ route, startLoc, endLoc, showAccessible, showTransport, showAlerts, darkMode, showVIP }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const accessibleMarkersRef = useRef([]);
  const transportMarkersRef = useRef([]);
  const transportRouteRef = useRef(null);
  const alertMarkersRef = useRef([]);
  const tileLayerRef = useRef(null);
  const vipRouteRef = useRef(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [nearestSafeZone, setNearestSafeZone] = useState(null);
  const nearestMarkerRef = useRef(null);

  useLayoutEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    // Initialize map only once
    const map = L.map(mapRef.current).setView([23.1765, 75.7885], 13);
    mapInstanceRef.current = map;
    // Add tile layer
    tileLayerRef.current = L.tileLayer(
      darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: darkMode
          ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
          : '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);
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
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
    };
  }, [darkMode]);

  // Switch tile layer on darkMode change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    tileLayerRef.current = L.tileLayer(
      darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: darkMode
          ? '&copy; <a href="https://carto.com/attributions">CARTO</a>'
          : '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);
  }, [darkMode]);

  // Draw route if provided, with animation
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (route && route.path && route.path.length > 1) {
      let frame = null;
      let idx = 1;
      const latlngs = route.path.map(([lat, lon]) => [lat, lon]);
      const animatedLine = L.polyline([latlngs[0]], { color: "blue", weight: 5 }).addTo(map);
      routeLayerRef.current = animatedLine;
      map.fitBounds(animatedLine.getBounds(), { padding: [30, 30] });
      function animate() {
        if (idx < latlngs.length) {
          animatedLine.addLatLng(latlngs[idx]);
          idx++;
          frame = setTimeout(animate, 40); // 25fps
        }
      }
      animate();
      return () => { if (frame) clearTimeout(frame); };
    }
  }, [route]);

  // Add or update start/end markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Remove previous markers
    if (startMarkerRef.current) { map.removeLayer(startMarkerRef.current); startMarkerRef.current = null; }
    if (endMarkerRef.current) { map.removeLayer(endMarkerRef.current); endMarkerRef.current = null; }
    // Add new start marker
    if (startLoc && startLoc.lat && startLoc.lon) {
      startMarkerRef.current = L.marker([startLoc.lat, startLoc.lon], {
        icon: L.icon({
          iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png",
          iconSize: [28, 42],
          iconAnchor: [14, 42],
          popupAnchor: [0, -36],
          className: "start-marker"
        })
      })
        .addTo(map)
        .bindPopup(`<strong>Start:</strong> ${startLoc.name || 'Unknown'}<br/><em>${startLoc.category || ''}</em>`)
        .openPopup();
    }
    // Add new end marker
    if (endLoc && endLoc.lat && endLoc.lon) {
      endMarkerRef.current = L.marker([endLoc.lat, endLoc.lon], {
        icon: L.icon({
          iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-red.png",
          iconSize: [28, 42],
          iconAnchor: [14, 42],
          popupAnchor: [0, -36],
          className: "end-marker"
        })
      })
        .addTo(map)
        .bindPopup(`<strong>End:</strong> ${endLoc.name || 'Unknown'}<br/><em>${endLoc.category || ''}</em>`)
        .openPopup();
    }
  }, [startLoc, endLoc]);

  // Accessibility overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Remove previous accessible markers
    accessibleMarkersRef.current.forEach(m => map.removeLayer(m));
    accessibleMarkersRef.current = [];
    if (showAccessible) {
      fetchRealLocations().then(data => {
        const accessible = data.safe_zones || [];
        accessibleMarkersRef.current = accessible.map(loc => {
          const marker = L.circleMarker([loc.lat, loc.lon], {
            radius: 14,
            color: '#43a047',
            fillColor: '#43a047',
            fillOpacity: 0.25,
            weight: 3
          })
            .addTo(map)
            .bindPopup(`<strong>Accessible:</strong> ${loc.name || 'Unknown'}<br/><em>${loc.category || ''}</em>`);
          return marker;
        });
      });
    }
    // Cleanup
    return () => {
      accessibleMarkersRef.current.forEach(m => map.removeLayer(m));
      accessibleMarkersRef.current = [];
    };
  }, [showAccessible]);

  // Public transport overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Remove previous transport markers/routes
    transportMarkersRef.current.forEach(m => map.removeLayer(m));
    transportMarkersRef.current = [];
    if (transportRouteRef.current) { map.removeLayer(transportRouteRef.current); transportRouteRef.current = null; }
    if (showTransport) {
      fetchRealLocations().then(data => {
        const hubs = data.transport_hubs || [];
        transportMarkersRef.current = hubs.map(loc => {
          const marker = L.marker([loc.lat, loc.lon], {
            icon: L.icon({
              iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-blue.png",
              iconSize: [28, 42],
              iconAnchor: [14, 42],
              popupAnchor: [0, -36],
              className: "transport-marker"
            })
          })
            .addTo(map)
            .bindPopup(`<strong>Transport Hub:</strong> ${loc.name || 'Unknown'}<br/><em>${loc.category || ''}</em>`);
          return marker;
        });
        // Draw a sample route between first two hubs
        if (hubs.length > 1) {
          transportRouteRef.current = L.polyline([
            [hubs[0].lat, hubs[0].lon],
            [hubs[1].lat, hubs[1].lon]
          ], { color: '#4f8cff', weight: 4, dashArray: '8 8' }).addTo(map);
        }
      });
    }
    // Cleanup
    return () => {
      transportMarkersRef.current.forEach(m => map.removeLayer(m));
      transportMarkersRef.current = [];
      if (transportRouteRef.current) { map.removeLayer(transportRouteRef.current); transportRouteRef.current = null; }
    };
  }, [showTransport]);

  // Dynamic alerts overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Remove previous alert markers
    alertMarkersRef.current.forEach(m => map.removeLayer(m));
    alertMarkersRef.current = [];
    if (showAlerts) {
      fetchRealLocations().then(data => {
        // Simulate alerts: randomly assign alert levels to some POIs
        const all = [...(data.ghats || []), ...(data.safe_zones || []), ...(data.transport_hubs || [])];
        const alertLevels = ["LOW", "MEDIUM", "HIGH"];
        const alertColors = { LOW: "#ffb300", MEDIUM: "#ff7043", HIGH: "#e53935" };
        const alertIcons = {
          LOW: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f7e1.png", // yellow circle
          MEDIUM: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f7e0.png", // orange circle
          HIGH: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f534.png", // red circle
        };
        // Pick 6 random locations for demo
        const alertLocs = all.sort(() => 0.5 - Math.random()).slice(0, 6);
        alertMarkersRef.current = alertLocs.map((loc, i) => {
          const level = alertLevels[i % 3];
          const marker = L.marker([loc.lat, loc.lon], {
            icon: L.icon({
              iconUrl: alertIcons[level],
              iconSize: [32, 32],
              iconAnchor: [16, 32],
              popupAnchor: [0, -28],
              className: "alert-marker"
            })
          })
            .addTo(map)
            .bindPopup(`<strong>Alert: ${level}</strong><br/>${loc.name || 'Unknown'}<br/><em>${loc.category || ''}</em><br/><span style='color:${alertColors[level]}'>${level} alert at this location</span>`);
          return marker;
        });
      });
    }
    // Cleanup
    return () => {
      alertMarkersRef.current.forEach(m => map.removeLayer(m));
      alertMarkersRef.current = [];
    };
  }, [showAlerts]);

  // VIP route overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (vipRouteRef.current) { map.removeLayer(vipRouteRef.current); vipRouteRef.current = null; }
    if (showVIP) {
      fetchRealLocations().then(data => {
        // Simulate VIP route between first and last transport hub
        const hubs = data.transport_hubs || [];
        if (hubs.length > 1) {
          vipRouteRef.current = L.polyline([
            [hubs[0].lat, hubs[0].lon],
            [hubs[hubs.length-1].lat, hubs[hubs.length-1].lon]
          ], { color: 'gold', weight: 8, dashArray: '12 8', opacity: 0.85 }).addTo(map).bindPopup('VIP Priority Route');
        }
      });
    }
    // Cleanup
    return () => {
      if (vipRouteRef.current) { map.removeLayer(vipRouteRef.current); vipRouteRef.current = null; }
    };
  }, [showVIP]);

  // Find nearest safe zone (simulate user at city center)
  const handleFindNearestSafeZone = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    fetchRealLocations().then(data => {
      const safeZones = data.safe_zones || [];
      const userLat = 23.1765, userLon = 75.7885; // Simulated user location (city center)
      let minDist = Infinity, nearest = null;
      for (const sz of safeZones) {
        const d = Math.sqrt(Math.pow(sz.lat - userLat, 2) + Math.pow(sz.lon - userLon, 2));
        if (d < minDist) { minDist = d; nearest = sz; }
      }
      setNearestSafeZone(nearest);
      if (nearest && map) {
        map.setView([nearest.lat, nearest.lon], 16, { animate: true });
        if (nearestMarkerRef.current) { map.removeLayer(nearestMarkerRef.current); }
        nearestMarkerRef.current = L.circleMarker([nearest.lat, nearest.lon], {
          radius: 18,
          color: '#4f8cff',
          fillColor: '#4f8cff',
          fillOpacity: 0.35,
          weight: 5
        }).addTo(map).bindPopup(`<strong>Nearest Safe Zone</strong><br/>${nearest.name || 'Unknown'}`)
          .openPopup();
      }
    });
    setFabOpen(false);
  };

  // Cleanup nearest marker on unmount or when nearestSafeZone changes
  useEffect(() => {
    return () => {
      const map = mapInstanceRef.current;
      if (nearestMarkerRef.current && map) {
        map.removeLayer(nearestMarkerRef.current);
        nearestMarkerRef.current = null;
      }
    };
  }, [nearestSafeZone]);

  return (
    <div className="mapview-root">
      <div ref={mapRef} id="map" className="mapview-map" aria-label="Map" />
      <div className="fab-container">
        <button
          className={"fab" + (darkMode ? " fab-dark" : "")}
          onClick={() => setFabOpen(v => !v)}
          aria-label="Quick Actions"
        >
          {fabOpen ? '✖' : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><lightning x1="12" y1="8" x2="12" y2="16"/><polyline points="12 8 16 12 12 16"/></svg>}
        </button>
        {fabOpen && (
          <div className="fab-menu">
            <button className="fab-menu-btn" onClick={handleFindNearestSafeZone} aria-label="Find Nearest Safe Zone">
              🛡️ Find Nearest Safe Zone
            </button>
            {/* Add more quick actions here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
