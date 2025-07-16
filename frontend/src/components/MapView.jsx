import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${icon}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const MapView = ({ 
  route, 
  startLoc, 
  endLoc, 
  showAccessible, 
  showTransport, 
  showAlerts, 
  showVIP,
  darkMode 
}) => {
  const mapRef = useRef();
  const [mapCenter] = useState([23.1765, 75.7885]); // Ujjain coordinates
  const [crowdData, setCrowdData] = useState([]);
  const [transportHubs, setTransportHubs] = useState([]);
  const [alertPoints, setAlertPoints] = useState([]);
  const [vipRoutes, setVipRoutes] = useState([]);

  useEffect(() => {
    // Generate mock data for different overlays
    setCrowdData([
      { id: 1, lat: 23.1765, lng: 75.7885, density: 85, name: "Main Ghat" },
      { id: 2, lat: 23.1800, lng: 75.7900, density: 65, name: "Temple Complex" },
      { id: 3, lat: 23.1750, lng: 75.7850, density: 90, name: "Market Area" },
      { id: 4, lat: 23.1820, lng: 75.7920, density: 45, name: "Parking Zone" }
    ]);

    setTransportHubs([
      { id: 1, lat: 23.1700, lng: 75.7800, type: "Bus Station", capacity: 200 },
      { id: 2, lat: 23.1850, lng: 75.7950, type: "Metro Station", capacity: 500 },
      { id: 3, lat: 23.1780, lng: 75.7820, type: "Taxi Stand", capacity: 50 }
    ]);

    setAlertPoints([
      { id: 1, lat: 23.1790, lng: 75.7890, type: "High Crowd", severity: "warning" },
      { id: 2, lat: 23.1740, lng: 75.7860, type: "Medical Emergency", severity: "danger" },
      { id: 3, lat: 23.1810, lng: 75.7910, type: "Route Blocked", severity: "info" }
    ]);

    setVipRoutes([
      [[23.1765, 75.7885], [23.1800, 75.7900], [23.1820, 75.7920]],
      [[23.1750, 75.7850], [23.1780, 75.7880], [23.1810, 75.7910]]
    ]);
  }, []);

  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      if (route && route.length > 0) {
        const bounds = L.latLngBounds(route);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, [route, map]);

    return null;
  };

  const getCrowdColor = (density) => {
    if (density > 80) return '#f5576c';
    if (density > 60) return '#ffd700';
    return '#43e97b';
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'danger': return '#f5576c';
      case 'warning': return '#ffd700';
      case 'info': return '#4facfe';
      default: return '#43e97b';
    }
  };

  return (
    <div className="map-container" style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className={darkMode ? 'dark-map' : 'light-map'}
      >
        <TileLayer
          url={darkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController />

        {/* Start and End Markers */}
        {startLoc && (
          <Marker 
            position={[startLoc.lat, startLoc.lng]}
            icon={createCustomIcon('#43e97b', '🚀')}
          >
            <Popup>
              <div className="custom-popup">
                <h4>Start Location</h4>
                <p>{startLoc.name || 'Starting Point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {endLoc && (
          <Marker 
            position={[endLoc.lat, endLoc.lng]}
            icon={createCustomIcon('#f5576c', '🎯')}
          >
            <Popup>
              <div className="custom-popup">
                <h4>Destination</h4>
                <p>{endLoc.name || 'Destination Point'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {route && route.length > 0 && (
          <Polyline
            positions={route}
            color="#667eea"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          />
        )}

        {/* Crowd Density Overlay */}
        {showAccessible && crowdData.map(point => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createCustomIcon(getCrowdColor(point.density), '👥')}
          >
            <Popup>
              <div className="custom-popup">
                <h4>{point.name}</h4>
                <p>Crowd Density: {point.density}%</p>
                <div className="density-bar">
                  <div 
                    className="density-fill" 
                    style={{ 
                      width: `${point.density}%`, 
                      backgroundColor: getCrowdColor(point.density) 
                    }}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Transport Hubs */}
        {showTransport && transportHubs.map(hub => (
          <Marker
            key={hub.id}
            position={[hub.lat, hub.lng]}
            icon={createCustomIcon('#4facfe', '🚌')}
          >
            <Popup>
              <div className="custom-popup">
                <h4>{hub.type}</h4>
                <p>Capacity: {hub.capacity} people</p>
                <p>Status: Available</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Alert Points */}
        {showAlerts && alertPoints.map(alert => (
          <Marker
            key={alert.id}
            position={[alert.lat, alert.lng]}
            icon={createCustomIcon(getAlertColor(alert.severity), '⚠️')}
          >
            <Popup>
              <div className="custom-popup">
                <h4>Alert: {alert.type}</h4>
                <p>Severity: {alert.severity}</p>
                <p>Time: {new Date().toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* VIP Routes */}
        {showVIP && vipRoutes.map((vipRoute, index) => (
          <Polyline
            key={index}
            positions={vipRoute}
            color="#ffd700"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        ))}
      </MapContainer>

      {/* Map Legend */}
      <motion.div 
        className="map-legend"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4>Legend</h4>
        <div className="legend-items">
          {showAccessible && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#43e97b' }}></div>
              <span>Low Crowd</span>
            </div>
          )}
          {showTransport && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4facfe' }}></div>
              <span>Transport Hub</span>
            </div>
          )}
          {showAlerts && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f5576c' }}></div>
              <span>Active Alert</span>
            </div>
          )}
          {showVIP && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ffd700' }}></div>
              <span>VIP Route</span>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .map-legend {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--panel-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
          backdrop-filter: var(--blur-md);
          z-index: 1000;
          min-width: 200px;
        }

        .map-legend h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .custom-popup {
          min-width: 150px;
        }

        .custom-popup h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .custom-popup p {
          margin: 0.25rem 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .density-bar {
          width: 100%;
          height: 8px;
          background: var(--glass-bg);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .density-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .dark-map .leaflet-popup-content-wrapper {
          background: var(--panel-bg);
          color: var(--text-primary);
        }

        .dark-map .leaflet-popup-tip {
          background: var(--panel-bg);
        }
      `}</style>
    </div>
  );
};

export default MapView;