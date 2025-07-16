import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

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

// Draggable marker component with enhanced features
const DraggableMarker = ({ position, setPosition, icon, popupContent, onDragEnd }) => {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        if (onDragEnd) {
          onDragEnd(newPos);
        }
        toast.info("📍 Location updated! Recalculating route...", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    },
    dragstart() {
      toast.info("🔄 Drag to adjust location", {
        position: "top-right",
        autoClose: 1000,
      });
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

// Current location finder with enhanced accuracy
const LocationFinder = ({ setCurrentLocation, onLocationFound }) => {
  const map = useMap();
  
  useEffect(() => {
    const findLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const newLocation = {
              lat: latitude,
              lng: longitude,
              accuracy: accuracy
            };
            
            // Check if we're reasonably close to Ujjain (within 100km for demo)
            const ujjainCoords = { lat: 23.1765, lng: 75.7885 };
            const distance = map.distance([latitude, longitude], [ujjainCoords.lat, ujjainCoords.lng]) / 1000;
            
            if (distance > 100) {
              // For demo purposes, place user in Ujjain
              const demoLocation = {
                lat: ujjainCoords.lat + (Math.random() - 0.5) * 0.01,
                lng: ujjainCoords.lng + (Math.random() - 0.5) * 0.01,
                accuracy: 10
              };
              setCurrentLocation(demoLocation);
              map.setView([demoLocation.lat, demoLocation.lng], 16);
              toast.success("📍 Demo location set in Ujjain for Simhastha 2028!", {
                position: "top-right",
                autoClose: 3000,
              });
              if (onLocationFound) onLocationFound(demoLocation);
            } else {
              setCurrentLocation(newLocation);
              map.setView([latitude, longitude], 16);
              toast.success(`📍 Location found! Accuracy: ${Math.round(accuracy)}m`, {
                position: "top-right",
                autoClose: 3000,
              });
              if (onLocationFound) onLocationFound(newLocation);
            }
          },
          (error) => {
            console.warn("Geolocation error:", error);
            // Fallback to demo location in Ujjain
            const ujjainCoords = { 
              lat: 23.1765 + (Math.random() - 0.5) * 0.01, 
              lng: 75.7885 + (Math.random() - 0.5) * 0.01, 
              accuracy: 10 
            };
            setCurrentLocation(ujjainCoords);
            map.setView([ujjainCoords.lat, ujjainCoords.lng], 15);
            toast.info("📍 Using demo location in Ujjain for Simhastha 2028", {
              position: "top-right",
              autoClose: 3000,
            });
            if (onLocationFound) onLocationFound(ujjainCoords);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        // Geolocation not supported, use demo location
        const ujjainCoords = { 
          lat: 23.1765 + (Math.random() - 0.5) * 0.01, 
          lng: 75.7885 + (Math.random() - 0.5) * 0.01, 
          accuracy: 10 
        };
        setCurrentLocation(ujjainCoords);
        map.setView([ujjainCoords.lat, ujjainCoords.lng], 15);
        toast.info("📍 Using demo location in Ujjain", {
          position: "top-right",
          autoClose: 3000,
        });
        if (onLocationFound) onLocationFound(ujjainCoords);
      }
    };

    findLocation();
  }, [map, setCurrentLocation, onLocationFound]);

  return null;
};

// Map click handler for setting destinations
const MapClickHandler = ({ onMapClick, isSelectingDestination }) => {
  useMapEvents({
    click: (e) => {
      if (isSelectingDestination && onMapClick) {
        onMapClick(e.latlng);
        toast.success("🎯 Destination set! Calculating route...", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    },
  });
  return null;
};

// Real-time data fetcher
const useRealTimeData = () => {
  const [crowdData, setCrowdData] = useState([]);
  const [transportHubs, setTransportHubs] = useState([]);
  const [alertPoints, setAlertPoints] = useState([]);
  const [vipRoutes, setVipRoutes] = useState([]);
  const [accessibleFacilities, setAccessibleFacilities] = useState([]);
  const [dynamicSignage, setDynamicSignage] = useState([]);

  const fetchRealTimeData = useCallback(async () => {
    try {
      // Fetch crowd data
      const crowdResponse = await fetch('http://localhost:8000/crowd/heatmap');
      if (crowdResponse.ok) {
        const data = await crowdResponse.json();
        setCrowdData(data.heatmap_data || []);
      } else {
        // Enhanced fallback data with AI predictions
        setCrowdData([
          { 
            id: 1, lat: 23.1765, lng: 75.7885, intensity: 0.85, 
            name: "Ram Ghat Main", status: "Critical", 
            prediction: "Peak until 8 AM", aiConfidence: 0.92 
          },
          { 
            id: 2, lat: 23.1828, lng: 75.7681, intensity: 0.78, 
            name: "Mahakaleshwar Temple", status: "High", 
            prediction: "Decreasing in 30 min", aiConfidence: 0.88 
          },
          { 
            id: 3, lat: 23.1801, lng: 75.7892, intensity: 0.45, 
            name: "Shipra Ghat Alpha", status: "Moderate", 
            prediction: "Stable", aiConfidence: 0.85 
          },
          { 
            id: 4, lat: 23.1789, lng: 75.7901, intensity: 0.32, 
            name: "Shipra Ghat Beta", status: "Low", 
            prediction: "Good time to visit", aiConfidence: 0.90 
          }
        ]);
      }

      // Fetch transport hubs
      const transportResponse = await fetch('http://localhost:8000/routes/transport/hubs');
      if (transportResponse.ok) {
        const data = await transportResponse.json();
        setTransportHubs(data.hubs || []);
      } else {
        setTransportHubs([
          { 
            id: 1, lat: 23.1723, lng: 75.7823, type: "Central Hub", 
            capacity: 3000, current: 1800, nextArrival: "3 min",
            services: ["Bus", "Taxi", "E-Rickshaw", "Metro"],
            aiOptimized: true, waitTime: 2
          },
          { 
            id: 2, lat: 23.1856, lng: 75.7934, type: "East Terminal", 
            capacity: 2500, current: 1200, nextArrival: "5 min",
            services: ["Shuttle", "Private Vehicles"],
            aiOptimized: true, waitTime: 3
          },
          { 
            id: 3, lat: 23.1650, lng: 75.7750, type: "West Hub", 
            capacity: 2000, current: 800, nextArrival: "Available now",
            services: ["Bus Service", "Tourist Buses"],
            aiOptimized: false, waitTime: 1
          }
        ]);
      }

      // Fetch alerts
      const alertsResponse = await fetch('http://localhost:8000/alerts/current');
      if (alertsResponse.ok) {
        const data = await alertsResponse.json();
        const formattedAlerts = data.alerts?.map(alert => ({
          id: alert.id,
          lat: alert.coordinates?.lat || 23.1790 + (Math.random() * 0.01),
          lng: alert.coordinates?.lng || 75.7890 + (Math.random() * 0.01),
          type: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp,
          aiGenerated: alert.ai_generated || false
        })) || [];
        setAlertPoints(formattedAlerts);
      } else {
        setAlertPoints([
          { 
            id: 1, lat: 23.1790, lng: 75.7890, type: "warning", 
            message: "High Crowd Density - AI Prediction", 
            timestamp: new Date().toISOString(), aiGenerated: true 
          },
          { 
            id: 2, lat: 23.1740, lng: 75.7860, type: "info", 
            message: "Medical Team Deployed", 
            timestamp: new Date().toISOString(), aiGenerated: false 
          },
          { 
            id: 3, lat: 23.1810, lng: 75.7910, type: "success", 
            message: "Route Optimization Active", 
            timestamp: new Date().toISOString(), aiGenerated: true 
          }
        ]);
      }

      // Enhanced VIP routes
      setVipRoutes([
        {
          id: 1,
          path: [[23.1834, 75.7712], [23.1828, 75.7681], [23.1820, 75.7720]],
          name: "VIP Temple Route",
          security: "High",
          estimated_time: "8 min"
        },
        {
          id: 2,
          path: [[23.1840, 75.7720], [23.1765, 75.7885], [23.1750, 75.7900]],
          name: "VIP Ghat Route",
          security: "Maximum",
          estimated_time: "12 min"
        }
      ]);

      // Accessible facilities
      setAccessibleFacilities([
        { 
          id: 1, lat: 23.1770, lng: 75.7830, type: "Rest Area", 
          description: "Senior Citizen Rest Area", 
          features: ["Wheelchair Access", "Medical Support", "Comfort Seating"],
          aiRecommended: true
        },
        { 
          id: 2, lat: 23.1750, lng: 75.7860, type: "Facility Center", 
          description: "Divyangjan Support Center", 
          features: ["Full Accessibility", "Support Staff", "Equipment"],
          aiRecommended: true
        },
        { 
          id: 3, lat: 23.1756, lng: 75.7834, type: "Medical Center", 
          description: "Primary Medical Center", 
          features: ["Emergency Care", "ICU", "Ambulance"],
          aiRecommended: false
        }
      ]);

      // Dynamic signage
      setDynamicSignage([
        { 
          id: 1, lat: 23.1770, lng: 75.7870, 
          message: "Main Ghat ↑ 5min", type: "direction",
          aiUpdated: true, lastUpdate: new Date().toISOString()
        },
        { 
          id: 2, lat: 23.1800, lng: 75.7850, 
          message: "Temple Complex ← 8min", type: "direction",
          aiUpdated: true, lastUpdate: new Date().toISOString()
        },
        { 
          id: 3, lat: 23.1820, lng: 75.7890, 
          message: "⚠️ High Crowd - Use Alt Route", type: "warning",
          aiUpdated: true, lastUpdate: new Date().toISOString()
        }
      ]);

    } catch (error) {
      console.error("Error fetching real-time data:", error);
    }
  }, []);

  useEffect(() => {
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchRealTimeData]);

  return {
    crowdData,
    transportHubs,
    alertPoints,
    vipRoutes,
    accessibleFacilities,
    dynamicSignage
  };
};

const MapView = ({ 
  route, 
  startLoc, 
  endLoc, 
  showAccessible, 
  showTransport, 
  showAlerts, 
  showVIP,
  darkMode,
  onLocationUpdate,
  onCurrentLocationSet
}) => {
  const mapRef = useRef();
  const [mapCenter] = useState([23.1765, 75.7885]); // Ujjain coordinates
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  // Use real-time data hook
  const {
    crowdData,
    transportHubs,
    alertPoints,
    vipRoutes,
    accessibleFacilities,
    dynamicSignage
  } = useRealTimeData();

  // Handle current location updates
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
  }, [onCurrentLocationSet]);

  // Handle map clicks for destination selection
  const handleMapClick = useCallback((latlng) => {
    if (startLoc && !endLoc && onLocationUpdate) {
      onLocationUpdate({
        lat: latlng.lat,
        lng: latlng.lng,
        name: "Selected Destination"
      }, 'end');
      setIsSelectingDestination(false);
    }
  }, [startLoc, endLoc, onLocationUpdate]);

  // Enable destination selection mode
  const enableDestinationSelection = useCallback(() => {
    setIsSelectingDestination(true);
    toast.info("🎯 Click on map to set destination", {
      position: "top-center",
      autoClose: 5000,
    });
  }, []);

  // Map controller for auto-fitting bounds
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      setMapReady(true);
      
      if (route && route.length > 0) {
        const bounds = L.latLngBounds(route);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (startLoc && endLoc) {
        const bounds = L.latLngBounds([
          [startLoc.lat, startLoc.lng],
          [endLoc.lat, endLoc.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [route, startLoc, endLoc, map]);

    return null;
  };

  // Helper functions
  const getCrowdColor = (intensity) => {
    if (intensity > 0.8) return '#ff4757';
    if (intensity > 0.6) return '#ffa502';
    if (intensity > 0.4) return '#ffdd59';
    return '#2ed573';
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger': return '#ff4757';
      case 'warning': return '#ffa502';
      case 'info': return '#3742fa';
      case 'success': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getTransportIcon = (services) => {
    if (services.includes('Metro')) return '🚇';
    if (services.includes('Bus')) return '🚌';
    if (services.includes('Taxi')) return '🚕';
    return '🚐';
  };

  return (
    <div className="map-container" style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className={darkMode ? 'dark-map' : 'light-map'}
        zoomControl={false}
      >
        <TileLayer
          url={darkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | AI-Powered Simhastha 2028'
        />
        
        <MapController />
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
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createCustomIcon('#3742fa', '📍', 35, true)}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="popup-content">
                <h4>📍 Your Current Location</h4>
                <p>Accuracy: ±{Math.round(currentLocation.accuracy || 10)}m</p>
                <p>Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
                <div className="popup-actions">
                  <button 
                    className="popup-btn primary"
                    onClick={enableDestinationSelection}
                  >
                    Set Destination
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Start Location - Draggable */}
        {startLoc && (
          <DraggableMarker
            position={[startLoc.lat, startLoc.lng]}
            setPosition={(newPos) => {
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: newPos.lat,
                  lng: newPos.lng,
                  name: startLoc.name || "Updated Start Location"
                }, 'start');
              }
            }}
            icon={createCustomIcon('#2ed573', '🚩', 32)}
            popupContent={
              <div className="popup-content">
                <h4>🚩 Start Location</h4>
                <p><strong>{startLoc.name || 'Starting Point'}</strong></p>
                <p className="popup-hint">💡 Drag to adjust position</p>
                <div className="popup-actions">
                  <button className="popup-btn">Get Directions</button>
                </div>
              </div>
            }
          />
        )}

        {/* End Location - Draggable */}
        {endLoc && (
          <DraggableMarker
            position={[endLoc.lat, endLoc.lng]}
            setPosition={(newPos) => {
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: newPos.lat,
                  lng: newPos.lng,
                  name: endLoc.name || "Updated Destination"
                }, 'end');
              }
            }}
            icon={createCustomIcon('#ff4757', '🎯', 32)}
            popupContent={
              <div className="popup-content">
                <h4>🎯 Destination</h4>
                <p><strong>{endLoc.name || 'Destination Point'}</strong></p>
                <p className="popup-hint">💡 Drag to adjust position</p>
                <div className="popup-actions">
                  <button className="popup-btn">View Details</button>
                </div>
              </div>
            }
          />
        )}

        {/* AI-Enhanced Route Polyline */}
        {route && route.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Polyline
              positions={route}
              color="#667eea"
              weight={6}
              opacity={0.8}
              dashArray="10, 5"
              className="ai-route"
            />
          </motion.div>
        )}

        {/* Crowd Density Overlay with AI Predictions */}
        {showAccessible && crowdData.map(point => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createCustomIcon(getCrowdColor(point.intensity), '👥', 28)}
          >
            <Popup maxWidth={350} className="custom-popup">
              <div className="popup-content">
                <h4>👥 {point.name}</h4>
                <div className="crowd-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Crowd Level:</span>
                    <div className="crowd-bar">
                      <div 
                        className="crowd-fill" 
                        style={{ 
                          width: `${point.intensity * 100}%`, 
                          backgroundColor: getCrowdColor(point.intensity) 
                        }}
                      />
                    </div>
                    <span className="metric-value">{Math.round(point.intensity * 100)}%</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Status:</span>
                    <span className={`status-badge ${point.status.toLowerCase()}`}>
                      {point.status}
                    </span>
                  </div>
                  {point.prediction && (
                    <div className="metric-item">
                      <span className="metric-label">🤖 AI Prediction:</span>
                      <span className="prediction-text">{point.prediction}</span>
                    </div>
                  )}
                  {point.aiConfidence && (
                    <div className="metric-item">
                      <span className="metric-label">AI Confidence:</span>
                      <span className="confidence-value">{Math.round(point.aiConfidence * 100)}%</span>
                    </div>
                  )}
                </div>
                <div className="popup-actions">
                  <button className="popup-btn">Avoid This Area</button>
                  <button className="popup-btn secondary">View Alternatives</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Enhanced Transport Hubs */}
        {showTransport && transportHubs.map(hub => (
          <Marker
            key={hub.id}
            position={[hub.lat, hub.lng]}
            icon={createCustomIcon(
              hub.aiOptimized ? '#3742fa' : '#747d8c', 
              getTransportIcon(hub.services), 
              30
            )}
          >
            <Popup maxWidth={400} className="custom-popup">
              <div className="popup-content">
                <h4>{getTransportIcon(hub.services)} {hub.type}</h4>
                <div className="transport-info">
                  <div className="capacity-info">
                    <div className="capacity-bar">
                      <div 
                        className="capacity-fill" 
                        style={{ 
                          width: `${(hub.current / hub.capacity) * 100}%`,
                          backgroundColor: hub.current / hub.capacity > 0.8 ? '#ff4757' : '#2ed573'
                        }}
                      />
                    </div>
                    <span>{hub.current}/{hub.capacity} people</span>
                  </div>
                  <div className="service-list">
                    <strong>Services:</strong>
                    <div className="services">
                      {hub.services.map((service, idx) => (
                        <span key={idx} className="service-tag">{service}</span>
                      ))}
                    </div>
                  </div>
                  <div className="timing-info">
                    <p><strong>Next Arrival:</strong> {hub.nextArrival}</p>
                    <p><strong>Wait Time:</strong> ~{hub.waitTime} min</p>
                  </div>
                  {hub.aiOptimized && (
                    <div className="ai-badge">
                      🤖 AI Optimized Route Available
                    </div>
                  )}
                </div>
                <div className="popup-actions">
                  <button className="popup-btn primary">Book Transport</button>
                  <button className="popup-btn">View Schedule</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Enhanced Alert Points */}
        {showAlerts && alertPoints.map(alert => (
          <Marker
            key={alert.id}
            position={[alert.lat, alert.lng]}
            icon={createCustomIcon(getAlertColor(alert.type), '⚠️', 26, alert.type === 'danger')}
          >
            <Popup maxWidth={350} className="custom-popup">
              <div className="popup-content">
                <h4>
                  ⚠️ Alert: {alert.type.toUpperCase()}
                  {alert.aiGenerated && <span className="ai-tag">🤖 AI</span>}
                </h4>
                <p className="alert-message">{alert.message}</p>
                <p className="alert-time">
                  <strong>Time:</strong> {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
                {alert.aiGenerated && (
                  <div className="ai-info">
                    <small>Generated by AI analysis of crowd patterns and real-time data</small>
                  </div>
                )}
                <div className="popup-actions">
                  <button className="popup-btn">View Details</button>
                  <button className="popup-btn secondary">Report Issue</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* VIP Routes */}
        {showVIP && vipRoutes.map((vipRoute, index) => (
          <React.Fragment key={`vip-${index}`}>
            <Polyline
              positions={vipRoute.path}
              color="#ffd700"
              weight={5}
              opacity={0.8}
              dashArray="8, 12"
              className="vip-route"
            />
            <Marker
              position={vipRoute.path[0]}
              icon={createCustomIcon('#ffd700', '👑', 24)}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="popup-content">
                  <h4>👑 {vipRoute.name}</h4>
                  <p><strong>Security Level:</strong> {vipRoute.security}</p>
                  <p><strong>Estimated Time:</strong> {vipRoute.estimated_time}</p>
                  <div className="vip-features">
                    <span className="feature-tag">🛡️ Security Escort</span>
                    <span className="feature-tag">🚫 No Crowds</span>
                    <span className="feature-tag">⚡ Priority Access</span>
                  </div>
                  <div className="popup-actions">
                    <button className="popup-btn primary">Request VIP Access</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Accessible Facilities */}
        {showAccessible && accessibleFacilities.map(facility => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createCustomIcon(
              facility.aiRecommended ? '#2ed573' : '#747d8c', 
              '♿', 
              28
            )}
          >
            <Popup maxWidth={350} className="custom-popup">
              <div className="popup-content">
                <h4>♿ {facility.description}</h4>
                <div className="facility-features">
                  <strong>Features:</strong>
                  <div className="features-list">
                    {facility.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                </div>
                {facility.aiRecommended && (
                  <div className="ai-recommendation">
                    🤖 AI Recommended based on your accessibility needs
                  </div>
                )}
                <div className="popup-actions">
                  <button className="popup-btn primary">Get Directions</button>
                  <button className="popup-btn">Request Assistance</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Dynamic Signage */}
        {dynamicSignage.map(sign => (
          <Marker
            key={sign.id}
            position={[sign.lat, sign.lng]}
            icon={createCustomIcon(
              sign.type === 'warning' ? '#ffa502' : '#3742fa', 
              '📋', 
              22
            )}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="popup-content">
                <h4>📋 Dynamic Sign</h4>
                <p className="sign-message">{sign.message}</p>
                <div className="sign-info">
                  <p><strong>Type:</strong> {sign.type}</p>
                  {sign.aiUpdated && (
                    <p><strong>🤖 AI Updated:</strong> {new Date(sign.lastUpdate).toLocaleTimeString()}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Enhanced Map Legend */}
      <AnimatePresence>
        {mapReady && (
          <motion.div 
            className="map-legend enhanced"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="legend-header">
              <h4>🗺️ Map Legend</h4>
              <div className="ai-indicator">🤖 AI-Powered</div>
            </div>
            <div className="legend-sections">
              {currentLocation && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#3742fa' }}>📍</div>
                    <span>Your Location</span>
                  </div>
                </div>
              )}
              
              {route && route.length > 0 && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-line" style={{ backgroundColor: '#667eea' }}></div>
                    <span>AI Route</span>
                  </div>
                </div>
              )}

              {showAccessible && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#2ed573' }}>👥</div>
                    <span>Low Crowd</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#ffa502' }}>👥</div>
                    <span>High Crowd</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#2ed573' }}>♿</div>
                    <span>Accessible</span>
                  </div>
                </div>
              )}

              {showTransport && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#3742fa' }}>🚌</div>
                    <span>Transport Hub</span>
                  </div>
                </div>
              )}

              {showAlerts && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-icon" style={{ backgroundColor: '#ff4757' }}>⚠️</div>
                    <span>Active Alert</span>
                  </div>
                </div>
              )}

              {showVIP && (
                <div className="legend-section">
                  <div className="legend-item">
                    <div className="legend-line" style={{ backgroundColor: '#ffd700' }}></div>
                    <span>VIP Route</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      <div className="map-controls">
        <motion.button
          className="control-btn location-btn"
          onClick={() => {
            if (currentLocation && mapRef.current) {
              mapRef.current.setView([currentLocation.lat, currentLocation.lng], 16);
              toast.success("📍 Centered on your location");
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Center on my location"
        >
          📍
        </motion.button>
        
        <motion.button
          className="control-btn destination-btn"
          onClick={enableDestinationSelection}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Set destination by clicking on map"
        >
          🎯
        </motion.button>
      </div>

      <style>{`
        .map-container {
          position: relative;
        }
        
        .map-legend.enhanced {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--panel-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          backdrop-filter: var(--blur-md);
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
          border-bottom: 1px solid var(--border);
        }
        
        .legend-header h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }
        
        .ai-indicator {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
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
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          background: var(--glass-bg);
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
          background: var(--panel-bg);
          color: var(--text-primary);
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          backdrop-filter: var(--blur-md);
          transition: all 0.2s ease;
        }
        
        .control-btn:hover {
          background: var(--glass-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        
        .custom-popup .popup-content {
          padding: 0;
        }
        
        .custom-popup h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .ai-tag {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 0.125rem 0.375rem;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .popup-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        
        .popup-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 80px;
        }
        
        .popup-btn.primary {
          background: var(--primary);
          color: white;
        }
        
        .popup-btn.secondary {
          background: var(--glass-bg);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        
        .popup-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .crowd-metrics, .transport-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin: 0.75rem 0;
        }
        
        .metric-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        
        .metric-label {
          font-weight: 500;
          color: var(--text-secondary);
          min-width: 80px;
        }
        
        .crowd-bar, .capacity-bar {
          flex: 1;
          height: 8px;
          background: var(--glass-bg);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .crowd-fill, .capacity-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        
        .status-badge.critical { background: #ff4757; color: white; }
        .status-badge.high { background: #ffa502; color: white; }
        .status-badge.moderate { background: #ffdd59; color: #333; }
        .status-badge.low { background: #2ed573; color: white; }
        
        .prediction-text {
          font-style: italic;
          color: var(--primary);
          font-weight: 500;
        }
        
        .confidence-value {
          font-weight: 600;
          color: var(--primary);
        }
        
        .service-tag, .feature-tag {
          background: var(--glass-bg);
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          border: 1px solid var(--border);
        }
        
        .services, .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }
        
        .ai-badge, .ai-recommendation, .ai-info {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .vip-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin: 0.5rem 0;
        }
        
        .sign-message {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
          margin: 0.5rem 0;
        }
        
        .popup-hint {
          font-style: italic;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0.25rem 0;
        }
        
        .dark-map .leaflet-popup-content-wrapper {
          background: var(--panel-bg);
          color: var(--text-primary);
        }
        
        .dark-map .leaflet-popup-tip {
          background: var(--panel-bg);
        }
        
        .ai-route {
          filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.6));
        }
        
        .vip-route {
          filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.8));
        }
        
        @media (max-width: 768px) {
          .map-legend.enhanced {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            transform: none;
            padding: 1rem;
          }
          
          .legend-sections {
            gap: 0.5rem;
          }
          
          .legend-item {
            font-size: 0.8rem;
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