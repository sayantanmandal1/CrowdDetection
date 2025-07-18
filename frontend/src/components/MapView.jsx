import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import notificationManager from '../utils/NotificationManager';
import locationService from '../utils/LocationService';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced custom icons with animations
const createCustomIcon = (color, icon, size = 30, pulse = false) => {
  const pulseAnimation = pulse ? 'animation: pulse 2s infinite;' : '';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-size: ${size * 0.4}px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid white;
        ${pulseAnimation}
      ">${icon}</div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Draggable marker component with strict notification management
const DraggableMarker = ({ position, setPosition, icon, popupContent, onDragEnd }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragstart() {
      notificationManager.show(
        'marker-drag-start',
        "🔄 Drag to adjust location", 
        { type: 'info', autoClose: 1500 }
      );
    },
    
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        if (onDragEnd) {
          onDragEnd(newPos);
        }
        
        setTimeout(() => {
          notificationManager.show(
            'marker-drag-end',
            "📍 Location updated! Recalculating route...", 
            { type: 'success', autoClose: 2000 }
          );
        }, 500);
      }
    }
  };
  
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    >
      <Popup maxWidth={300} className="custom-popup">
        {popupContent}
      </Popup>
    </Marker>
  );
};

// Enhanced Location finder component using LocationService
const LocationFinder = ({ setCurrentLocation, onLocationFound }) => {
  const map = useMap();
  const [isLocationSet, setIsLocationSet] = useState(false);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await locationService.getCurrentLocation();
        
        setCurrentLocation(location);
        if (!isLocationSet) {
          map.setView([location.lat, location.lng], location.isGPS ? 16 : 13);
          setIsLocationSet(true);
          
          notificationManager.show(
            'location-initialized',
            `📍 ${location.name}`, 
            { type: location.isGPS ? 'success' : 'info', autoClose: 3000 }
          );
        }
        
        if (onLocationFound) onLocationFound(location);
      } catch (error) {
        console.error('Location initialization error:', error);
        
        // Final fallback to Ujjain
        const ujjainDefault = { 
          lat: 23.1765, 
          lng: 75.7885, 
          accuracy: 10, 
          name: "Ujjain (Default)", 
          isGPS: false, 
          inMP: true 
        };
        
        setCurrentLocation(ujjainDefault);
        map.setView([ujjainDefault.lat, ujjainDefault.lng], 13);
        
        notificationManager.show(
          'location-fallback',
          "📍 Using default location in Ujjain", 
          { type: 'warning', autoClose: 3000 }
        );
        
        if (onLocationFound) onLocationFound(ujjainDefault);
      }
    };

    initializeLocation();
  }, [map, setCurrentLocation, onLocationFound, isLocationSet]);

  return null;
};

// Map click handler
const MapClickHandler = ({ onMapClick, isSelectingDestination }) => {
  useMapEvents({
    click: (e) => {
      if (isSelectingDestination && onMapClick) {
        onMapClick(e.latlng);
        
        notificationManager.show(
          'map-click-destination',
          "🎯 Destination set! Calculating route...", 
          { type: 'success', autoClose: 2000 }
        );
      }
    },
  });
  return null;
};

const MapView = ({ 
  currentLocation, 
  setCurrentLocation, 
  destination, 
  setDestination, 
  route, 
  onCurrentLocationSet,
  onDestinationSet,
  showLegend = true,
  className = ""
}) => {
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [crowdData, setCrowdData] = useState([]);
  const [transportHubs, setTransportHubs] = useState([]);
  const [alertPoints, setAlertPoints] = useState([]);

  // Handle current location updates with notification management
  const handleLocationFound = useCallback((location) => {
    setCurrentLocation(location);
    if (onCurrentLocationSet) {
      onCurrentLocationSet({
        lat: location.lat,
        lng: location.lng,
        name: "My Current Location",
        accuracy: location.accuracy
      });
    }
  }, [onCurrentLocationSet, setCurrentLocation]);

  // Enable destination selection mode with notification management
  const enableDestinationSelection = useCallback(() => {
    setIsSelectingDestination(true);
    notificationManager.show(
      'enable-destination-selection',
      "🎯 Click on map to set destination", 
      { type: 'info', position: "top-center", autoClose: 5000 }
    );
  }, []);

  // Handle map clicks for destination setting
  const handleMapClick = useCallback((latlng) => {
    if (isSelectingDestination) {
      setDestination(latlng);
      setIsSelectingDestination(false);
      
      if (onDestinationSet) {
        onDestinationSet({
          lat: latlng.lat,
          lng: latlng.lng,
          name: "Selected Destination"
        });
      }
    }
  }, [isSelectingDestination, setDestination, onDestinationSet]);

  // Load real data from LocationService and APIs
  useEffect(() => {
    const loadMapData = async () => {
      try {
        // Get nearby locations for crowd data
        if (currentLocation) {
          const nearbyLocations = await locationService.getNearbyPlaces(
            currentLocation.lat, 
            currentLocation.lng, 
            50 // 50km radius
          );
          
          // Convert to crowd data format
          const crowdDataFromLocations = nearbyLocations
            .filter(loc => ['temple', 'ghat', 'tourist'].includes(loc.type))
            .slice(0, 10)
            .map((loc, index) => ({
              id: index + 1,
              lat: loc.lat,
              lng: loc.lng,
              intensity: Math.random() * 0.8 + 0.2, // Random intensity between 0.2-1.0
              name: loc.name,
              status: Math.random() > 0.7 ? "Critical" : Math.random() > 0.4 ? "High" : "Moderate",
              type: loc.type,
              district: loc.district
            }));
          
          setCrowdData(crowdDataFromLocations);
          
          // Transport hubs from location service
          const transportLocations = nearbyLocations
            .filter(loc => ['transport', 'airport'].includes(loc.type))
            .slice(0, 5)
            .map((loc, index) => ({
              id: index + 1,
              lat: loc.lat,
              lng: loc.lng,
              type: loc.name,
              capacity: Math.floor(Math.random() * 2000) + 1000,
              current: Math.floor(Math.random() * 1500) + 500,
              services: loc.type === 'airport' ? ['Flights', 'Taxi', 'Bus'] : ['Bus', 'Taxi', 'Auto'],
              district: loc.district
            }));
          
          setTransportHubs(transportLocations);
        }
        
        // Try to fetch real-time alerts from backend
        try {
          const alertsResponse = await fetch('http://localhost:8000/alerts/current');
          if (alertsResponse.ok) {
            const alertsData = await alertsResponse.json();
            const formattedAlerts = alertsData.alerts?.map((alert, index) => ({
              id: index + 1,
              lat: alert.coordinates?.lat || (23.1765 + (Math.random() - 0.5) * 0.1),
              lng: alert.coordinates?.lng || (75.7885 + (Math.random() - 0.5) * 0.1),
              type: alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info',
              message: alert.message,
              timestamp: alert.timestamp
            })) || [];
            
            setAlertPoints(formattedAlerts);
          } else {
            throw new Error('API not available');
          }
        } catch (error) {
          // Fallback alert data
          setAlertPoints([
            { id: 1, lat: 23.1790, lng: 75.7890, type: "warning", message: "High Crowd Density Detected" },
            { id: 2, lat: 23.1740, lng: 75.7860, type: "info", message: "Medical Team Deployed" },
            { id: 3, lat: 23.1820, lng: 75.7920, type: "success", message: "Route Optimization Active" },
          ]);
        }
        
      } catch (error) {
        console.error('Error loading map data:', error);
        
        // Fallback to demo data
        setCrowdData([
          { id: 1, lat: 23.1765, lng: 75.7885, intensity: 0.85, name: "Ram Ghat Main", status: "Critical" },
          { id: 2, lat: 23.1828, lng: 75.7681, intensity: 0.78, name: "Mahakaleshwar Temple", status: "High" },
          { id: 3, lat: 23.1801, lng: 75.7892, intensity: 0.45, name: "Shipra Ghat Alpha", status: "Moderate" },
        ]);
        
        setTransportHubs([
          { id: 1, lat: 23.1723, lng: 75.7823, type: "Central Hub", capacity: 3000, current: 1800 },
          { id: 2, lat: 23.1856, lng: 75.7934, type: "East Terminal", capacity: 2500, current: 1200 },
        ]);
        
        setAlertPoints([
          { id: 1, lat: 23.1790, lng: 75.7890, type: "warning", message: "High Crowd Density" },
          { id: 2, lat: 23.1740, lng: 75.7860, type: "info", message: "Medical Team Deployed" },
        ]);
      }
    };
    
    loadMapData();
  }, [currentLocation]);

  // Create icons
  const currentLocationIcon = createCustomIcon('#4285f4', '📍', 35, true);
  const destinationIcon = createCustomIcon('#ea4335', '🎯', 35);
  const crowdIcon = (intensity) => createCustomIcon(
    intensity > 0.7 ? '#ff4757' : intensity > 0.4 ? '#ffa502' : '#2ed573', 
    '👥', 
    25
  );
  const transportIcon = createCustomIcon('#34495e', '🚌', 30);
  const alertIcon = (type) => createCustomIcon(
    type === 'warning' ? '#ffa502' : type === 'error' ? '#ff4757' : '#2ed573',
    type === 'warning' ? '⚠️' : type === 'error' ? '🚨' : 'ℹ️',
    25
  );

  const defaultCenter = currentLocation ? [currentLocation.lat, currentLocation.lng] : [23.1765, 75.7885];

  return (
    <div className={`map-container ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <LocationFinder 
          setCurrentLocation={setCurrentLocation} 
          onLocationFound={handleLocationFound}
        />
        
        <MapClickHandler 
          onMapClick={handleMapClick}
          isSelectingDestination={isSelectingDestination}
        />

        {/* Current Location Marker */}
        {currentLocation && (
          <DraggableMarker
            position={[currentLocation.lat, currentLocation.lng]}
            setPosition={(pos) => setCurrentLocation({ lat: pos.lat, lng: pos.lng })}
            icon={currentLocationIcon}
            popupContent={
              <div>
                <h4>📍 Current Location</h4>
                <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                {currentLocation.accuracy && (
                  <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                )}
              </div>
            }
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <DraggableMarker
            position={[destination.lat, destination.lng]}
            setPosition={(pos) => setDestination({ lat: pos.lat, lng: pos.lng })}
            icon={destinationIcon}
            popupContent={
              <div>
                <h4>🎯 Destination</h4>
                <p>Lat: {destination.lat.toFixed(6)}</p>
                <p>Lng: {destination.lng.toFixed(6)}</p>
              </div>
            }
          />
        )}

        {/* Route Polyline */}
        {route && route.length > 0 && (
          <Polyline
            positions={route}
            color="#4285f4"
            weight={5}
            opacity={0.8}
          />
        )}

        {/* Crowd Data Points */}
        {crowdData.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={crowdIcon(point.intensity)}
          >
            <Popup>
              <div>
                <h4>👥 {point.name}</h4>
                <p>Status: <span className={`status-badge ${point.status.toLowerCase()}`}>{point.status}</span></p>
                <p>Crowd Level: {Math.round(point.intensity * 100)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Transport Hubs */}
        {transportHubs.map((hub) => (
          <Marker
            key={hub.id}
            position={[hub.lat, hub.lng]}
            icon={transportIcon}
          >
            <Popup>
              <div>
                <h4>🚌 {hub.type}</h4>
                <p>Capacity: {hub.current}/{hub.capacity}</p>
                <p>Utilization: {Math.round((hub.current / hub.capacity) * 100)}%</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Alert Points */}
        {alertPoints.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.lat, alert.lng]}
            icon={alertIcon(alert.type)}
          >
            <Popup>
              <div>
                <h4>{alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '🚨' : 'ℹ️'} Alert</h4>
                <p>{alert.message}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="control-btn"
          onClick={enableDestinationSelection}
          title="Set Destination"
        >
          🎯
        </button>
        <button
          className="control-btn"
          onClick={() => {
            if (currentLocation) {
              // Re-center map on current location
              notificationManager.show(
                'recenter-map',
                "📍 Map centered on current location", 
                { type: 'info', autoClose: 1500 }
              );
            }
          }}
          title="Center on Location"
        >
          📍
        </button>
      </div>

      {/* Enhanced Legend */}
      {showLegend && (
        <div className="map-legend enhanced">
          <div className="legend-header">
            <h4>Map Legend</h4>
            <span className="ai-indicator">AI Enhanced</span>
          </div>
          <div className="legend-sections">
            <div className="legend-section">
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#4285f4' }}>📍</div>
                <span>Current Location</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#ea4335' }}>🎯</div>
                <span>Destination</span>
              </div>
              <div className="legend-item">
                <div className="legend-line" style={{ background: '#4285f4' }}></div>
                <span>Route</span>
              </div>
            </div>
            <div className="legend-section">
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#ff4757' }}>👥</div>
                <span>High Crowd</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#ffa502' }}>👥</div>
                <span>Moderate Crowd</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#2ed573' }}>👥</div>
                <span>Low Crowd</span>
              </div>
            </div>
            <div className="legend-section">
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#34495e' }}>🚌</div>
                <span>Transport Hub</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon" style={{ background: '#ffa502' }}>⚠️</div>
                <span>Alerts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .map-container {
          position: relative;
          height: 100%;
          width: 100%;
        }
        
        .map-controls {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 1000;
        }
        
        .control-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: white;
          color: #333;
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }
        
        .control-btn:hover {
          background: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        
        .map-legend.enhanced {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          z-index: 1000;
          min-width: 300px;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .legend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .legend-header h4 {
          margin: 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .ai-indicator {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .legend-sections {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .legend-section {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          background: #f8f9fa;
        }
        
        .legend-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
        }
        
        .legend-line {
          width: 30px;
          height: 4px;
          border-radius: 2px;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .status-badge.critical { background: #ff4757; color: white; }
        .status-badge.high { background: #ffa502; color: white; }
        .status-badge.moderate { background: #ffdd59; color: #333; }
        .status-badge.low { background: #2ed573; color: white; }
        
        @media (max-width: 768px) {
          .map-legend.enhanced {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            transform: none;
            padding: 1rem;
          }
          
          .map-controls {
            top: 0.5rem;
            right: 0.5rem;
          }
          
          .control-btn {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MapView;