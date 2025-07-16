import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  Route,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Compass,
  Timer,
  TrendingUp,
  Shield,
  Star,
  RefreshCw,
  Target,
  Activity,
  Gauge
} from "lucide-react";
import { toast } from "react-toastify";

const RoutePlanner = ({ onRouteFound, onStartChange, onEndChange }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeType, setRouteType] = useState("optimal");
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [preferences, setPreferences] = useState({
    avoidCrowds: true,
    accessibleRoute: false,
    fastestRoute: false,
    scenicRoute: false
  });

  const routeTypes = [
    { 
      id: 'optimal', 
      label: 'Smart Route', 
      icon: Zap, 
      color: '#667eea',
      description: 'AI-optimized for current conditions'
    },
    { 
      id: 'fastest', 
      label: 'Fastest', 
      icon: Timer, 
      color: '#f5576c',
      description: 'Shortest time regardless of crowds'
    },
    { 
      id: 'safest', 
      label: 'Safest', 
      icon: Shield, 
      color: '#43e97b',
      description: 'Maximum safety and accessibility'
    },
    { 
      id: 'scenic', 
      label: 'Scenic', 
      icon: Star, 
      color: '#ffd700',
      description: 'Beautiful route with landmarks'
    }
  ];

  const mockLocations = [
    "Main Ghat - Primary Bathing Area",
    "Temple Complex - Mahakaleshwar",
    "Transport Hub A - Central Station",
    "Transport Hub B - East Terminal",
    "Parking Zone 1 - North Entrance",
    "Parking Zone 2 - South Entrance",
    "Medical Center - Emergency Services",
    "Information Center - Tourist Help",
    "Food Court - Dining Area",
    "Rest Area - Family Zone"
  ];

  useEffect(() => {
    if (startLocation && endLocation && startLocation !== endLocation) {
      generateRouteOptions();
    }
  }, [startLocation, endLocation, routeType, preferences]);

  const generateRouteOptions = async () => {
    setIsCalculating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockRoutes = [
      {
        id: 1,
        name: "Smart Route",
        distance: "1.2 km",
        duration: "8 min",
        crowdLevel: 35,
        safetyScore: 95,
        difficulty: "Easy",
        highlights: ["Accessible path", "Well-lit route", "Emergency stations"],
        waypoints: [
          { lat: 23.1765, lng: 75.7885, name: startLocation },
          { lat: 23.1780, lng: 75.7900, name: "Checkpoint 1" },
          { lat: 23.1800, lng: 75.7920, name: endLocation }
        ]
      },
      {
        id: 2,
        name: "Express Route",
        distance: "0.9 km",
        duration: "6 min",
        crowdLevel: 75,
        safetyScore: 85,
        difficulty: "Moderate",
        highlights: ["Fastest path", "Direct route", "Some crowds"],
        waypoints: [
          { lat: 23.1765, lng: 75.7885, name: startLocation },
          { lat: 23.1790, lng: 75.7910, name: endLocation }
        ]
      },
      {
        id: 3,
        name: "Scenic Route",
        distance: "1.8 km",
        duration: "12 min",
        crowdLevel: 20,
        safetyScore: 90,
        difficulty: "Easy",
        highlights: ["Beautiful views", "Historic landmarks", "Photo spots"],
        waypoints: [
          { lat: 23.1765, lng: 75.7885, name: startLocation },
          { lat: 23.1750, lng: 75.7870, name: "Scenic Point" },
          { lat: 23.1770, lng: 75.7890, name: "Historic Site" },
          { lat: 23.1800, lng: 75.7920, name: endLocation }
        ]
      }
    ];
    
    setRouteOptions(mockRoutes);
    setSelectedRoute(mockRoutes[0]);
    setIsCalculating(false);
    
    toast.success("Routes calculated successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    onRouteFound(route.waypoints);
    onStartChange({ lat: route.waypoints[0].lat, lng: route.waypoints[0].lng, name: startLocation });
    onEndChange({ lat: route.waypoints[route.waypoints.length - 1].lat, lng: route.waypoints[route.waypoints.length - 1].lng, name: endLocation });
    
    toast.info(`${route.name} selected - ${route.duration} journey`, {
      position: "top-right",
      autoClose: 4000,
    });
  };

  const getCrowdColor = (level) => {
    if (level < 30) return '#43e97b';
    if (level < 70) return '#ffd700';
    return '#f5576c';
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return '#43e97b';
    if (score >= 80) return '#ffd700';
    return '#f5576c';
  };

  return (
    <div className="route-planner-premium">
      <motion.div 
        className="planner-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-title">
          <Navigation size={24} />
          <h2>Smart Route Planner</h2>
        </div>
        <div className="header-subtitle">
          AI-powered routing with real-time optimization
        </div>
      </motion.div>

      {/* Location Inputs */}
      <motion.div 
        className="location-inputs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="input-group">
          <div className="input-label">
            <div className="location-dot start-dot" />
            <span>From</span>
          </div>
          <select
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="location-select premium-select"
          >
            <option value="">Select starting point...</option>
            {mockLocations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <motion.div 
          className="route-connector"
          animate={{ rotate: 90 }}
          transition={{ duration: 0.5 }}
        >
          <ArrowRight size={20} />
        </motion.div>

        <div className="input-group">
          <div className="input-label">
            <div className="location-dot end-dot" />
            <span>To</span>
          </div>
          <select
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="location-select premium-select"
          >
            <option value="">Select destination...</option>
            {mockLocations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Route Type Selection */}
      <motion.div 
        className="route-types"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="section-title">Route Preferences</div>
        <div className="route-type-grid">
          {routeTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <motion.button
                key={type.id}
                className={`route-type-btn ${routeType === type.id ? 'active' : ''}`}
                onClick={() => setRouteType(type.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{ '--accent-color': type.color }}
              >
                <div className="route-type-icon">
                  <IconComponent size={20} />
                </div>
                <div className="route-type-content">
                  <div className="route-type-label">{type.label}</div>
                  <div className="route-type-desc">{type.description}</div>
                </div>
                <div className="route-type-indicator" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Advanced Preferences */}
      <motion.div 
        className="preferences-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="section-title">Advanced Options</div>
        <div className="preferences-grid">
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="preference-checkbox"
                />
                <div className="checkbox-custom">
                  {value && <CheckCircle size={14} />}
                </div>
                <span className="preference-text">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calculate Button */}
      <motion.button
        className="calculate-btn premium-btn"
        onClick={generateRouteOptions}
        disabled={!startLocation || !endLocation || isCalculating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {isCalculating ? (
          <>
            <RefreshCw size={20} className="spinning" />
            Calculating Routes...
          </>
        ) : (
          <>
            <Compass size={20} />
            Find Best Routes
          </>
        )}
      </motion.button>

      {/* Route Options */}
      <AnimatePresence>
        {routeOptions.length > 0 && (
          <motion.div 
            className="route-options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-title">Available Routes</div>
            <div className="routes-list">
              {routeOptions.map((route, index) => (
                <motion.div
                  key={route.id}
                  className={`route-card ${selectedRoute?.id === route.id ? 'selected' : ''}`}
                  onClick={() => handleRouteSelect(route)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="route-header">
                    <div className="route-name">{route.name}</div>
                    <div className="route-badge">
                      {selectedRoute?.id === route.id ? 'Selected' : 'Available'}
                    </div>
                  </div>
                  
                  <div className="route-metrics">
                    <div className="metric">
                      <MapPin size={16} />
                      <span>{route.distance}</span>
                    </div>
                    <div className="metric">
                      <Clock size={16} />
                      <span>{route.duration}</span>
                    </div>
                    <div className="metric">
                      <Users size={16} />
                      <span style={{ color: getCrowdColor(route.crowdLevel) }}>
                        {route.crowdLevel}% crowd
                      </span>
                    </div>
                    <div className="metric">
                      <Shield size={16} />
                      <span style={{ color: getSafetyColor(route.safetyScore) }}>
                        {route.safetyScore}% safe
                      </span>
                    </div>
                  </div>

                  <div className="route-highlights">
                    {route.highlights.map((highlight, idx) => (
                      <span key={idx} className="highlight-tag">
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="route-difficulty">
                    <Gauge size={14} />
                    <span>Difficulty: {route.difficulty}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Route Summary */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div 
            className="route-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="summary-header">
              <Target size={20} />
              <span>Active Route</span>
            </div>
            <div className="summary-content">
              <div className="summary-main">
                <h4>{selectedRoute.name}</h4>
                <p>{selectedRoute.distance} • {selectedRoute.duration}</p>
              </div>
              <div className="summary-stats">
                <div className="stat-item">
                  <Activity size={14} />
                  <span>{selectedRoute.crowdLevel}%</span>
                </div>
                <div className="stat-item">
                  <Shield size={14} />
                  <span>{selectedRoute.safetyScore}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .route-planner-premium {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .planner-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .header-title h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .header-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .location-inputs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .location-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid;
        }

        .start-dot {
          background: var(--success);
          border-color: var(--success);
          box-shadow: 0 0 8px rgba(67, 233, 123, 0.5);
        }

        .end-dot {
          background: var(--danger);
          border-color: var(--danger);
          box-shadow: 0 0 8px rgba(245, 87, 108, 0.5);
        }

        .route-connector {
          align-self: center;
          color: var(--text-secondary);
          margin: 0.5rem 0;
        }

        .premium-select {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .premium-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: var(--panel-bg);
        }

        .section-title {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .route-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .route-type-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .route-type-btn:hover {
          background: var(--glass-hover);
          border-color: var(--accent-color);
        }

        .route-type-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          box-shadow: 0 4px 16px rgba(var(--accent-color), 0.3);
        }

        .route-type-icon {
          flex-shrink: 0;
        }

        .route-type-content {
          flex: 1;
          text-align: left;
        }

        .route-type-label {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .route-type-desc {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .preferences-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .preference-item {
          display: flex;
          align-items: center;
        }

        .preference-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .preference-checkbox {
          display: none;
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: white;
        }

        .preference-checkbox:checked + .checkbox-custom {
          background: var(--primary);
          border-color: var(--primary);
        }

        .calculate-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--gradient-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .calculate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .calculate-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .route-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .route-card:hover {
          background: var(--glass-hover);
          border-color: var(--primary);
        }

        .route-card.selected {
          background: rgba(102, 126, 234, 0.1);
          border-color: var(--primary);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
        }

        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .route-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .route-badge {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .route-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .route-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .highlight-tag {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .route-difficulty {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .route-summary {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          border-left: 4px solid var(--primary);
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
        }

        .summary-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-main h4 {
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .summary-main p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .summary-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .route-type-grid {
            grid-template-columns: 1fr;
          }
          
          .preferences-grid {
            grid-template-columns: 1fr;
          }
          
          .route-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RoutePlanner;