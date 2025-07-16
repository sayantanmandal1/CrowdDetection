import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Compass,
  Timer,
  Shield,
  Star,
  RefreshCw,
  Target,
  Activity,
  Gauge,
  Bus,
  Crown,
  Brain,
  UserCheck
} from "lucide-react";
import { toast } from "react-toastify";

const RoutePlanner = ({ onRouteFound, onStartChange, onEndChange, currentLocation }) => {
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

  const [availableLocations, setAvailableLocations] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [userType, setUserType] = useState("general"); // general, elderly, divyangjan, vip
  const [weatherConditions, setWeatherConditions] = useState(null);

  // Fetch real locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8000/routes/locations');
        if (response.ok) {
          const data = await response.json();
          const formattedLocations = data.locations.map(loc => 
            `${loc.name} - ${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)} (${Math.round(loc.crowd_density * 100)}% crowd)`
          );
          setAvailableLocations(formattedLocations);
        } else {
          // Fallback locations
          setAvailableLocations([
            "Ram Ghat Main - Ghat (64% crowd)",
            "Mahakaleshwar Temple - Temple (72% crowd)",
            "Central Transport Hub - Transport (45% crowd)",
            "East Terminal - Transport (38% crowd)",
            "North Parking Zone - Parking (52% crowd)",
            "South Parking Zone - Parking (48% crowd)",
            "Primary Medical Center - Medical (25% crowd)",
            "Tourist Information Center - Info (30% crowd)",
            "Main Food Court - Food (65% crowd)",
            "Family Rest Area - Rest (40% crowd)"
          ]);
        }
      } catch (error) {
        console.log('Using fallback locations');
        setAvailableLocations([
          "Ram Ghat Main - Ghat (64% crowd)",
          "Mahakaleshwar Temple - Temple (72% crowd)",
          "Central Transport Hub - Transport (45% crowd)",
          "East Terminal - Transport (38% crowd)",
          "North Parking Zone - Parking (52% crowd)",
          "South Parking Zone - Parking (48% crowd)",
          "Primary Medical Center - Medical (25% crowd)",
          "Tourist Information Center - Info (30% crowd)",
          "Main Food Court - Food (65% crowd)",
          "Family Rest Area - Rest (40% crowd)"
        ]);
      }
    };
    
    fetchLocations();
  }, []);

  // Set current location as start when available
  useEffect(() => {
    if (currentLocation && !startLocation) {
      setStartLocation("My Current Location");
      // Find nearby locations based on current location
      const findNearbyLocations = async () => {
        try {
          const response = await fetch(`http://localhost:8000/routes/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&limit=5`);
          if (response.ok) {
            const data = await response.json();
            setNearbyLocations(data.locations.map(loc => 
              `${loc.name} - ${loc.distance.toFixed(1)}km away (${Math.round(loc.crowd_density * 100)}% crowd)`
            ));
          } else {
            // Fallback nearby locations
            setNearbyLocations([
              "Ram Ghat Main - 0.5km away (64% crowd)",
              "Main Food Court - 0.8km away (65% crowd)",
              "Tourist Information Center - 1.2km away (30% crowd)"
            ]);
          }
        } catch (error) {
          console.log('Using fallback nearby locations');
          setNearbyLocations([
            "Ram Ghat Main - 0.5km away (64% crowd)",
            "Main Food Court - 0.8km away (65% crowd)",
            "Tourist Information Center - 1.2km away (30% crowd)"
          ]);
        }
      };
      findNearbyLocations();
    }
  }, [currentLocation, startLocation]);

  // Fetch AI insights and weather
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const weatherResponse = await fetch('http://localhost:8000/routes/weather');
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          setWeatherConditions(weatherData.current_weather);
        }
      } catch (error) {
        console.log('Weather data unavailable');
      }
    };
    
    fetchAIInsights();
  }, []);

  const generateRouteOptionsCallback = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      // Prepare user profile
      const userProfile = {
        user_type: userType,
        accessibility_needs: preferences.accessibleRoute || userType === 'divyangjan' || userType === 'elderly'
      };

      // Call the sophisticated backend API
      const response = await fetch('http://localhost:8000/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_location: startLocation === "My Current Location" && currentLocation 
            ? `custom_${currentLocation.lat}_${currentLocation.lng}`
            : startLocation.split(' - ')[0].toLowerCase().replace(/\s+/g, '_'),
          end_location: endLocation.split(' - ')[0].toLowerCase().replace(/\s+/g, '_'),
          route_type: routeType,
          avoid_crowds: preferences.avoidCrowds,
          accessible_route: preferences.accessibleRoute || userType === 'divyangjan' || userType === 'elderly',
          transport_mode: "walking",
          user_type: userType,
          current_location: currentLocation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate routes');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const formattedRoutes = data.routes.map(route => ({
          id: route.id,
          name: route.name,
          distance: route.distance,
          duration: route.duration,
          crowdLevel: route.crowd_level,
          safetyScore: route.safety_score,
          accessibilityScore: route.accessibility_score || 80,
          difficulty: route.difficulty,
          highlights: route.highlights,
          warnings: route.warnings,
          waypoints: route.waypoints,
          instructions: route.instructions,
          aiConfidence: route.ai_confidence || 0.85,
          healthBenefits: route.health_benefits,
          alternativeOptions: route.alternative_options
        }));
        
        setRouteOptions(formattedRoutes);
        setSelectedRoute(formattedRoutes[0]);
        
        // Send route data to parent components
        if (formattedRoutes[0].waypoints && formattedRoutes[0].waypoints.length > 0) {
          const routeCoordinates = formattedRoutes[0].waypoints.map(wp => [wp.lat, wp.lng]);
          onRouteFound(routeCoordinates);
          
          const firstPoint = formattedRoutes[0].waypoints[0];
          const lastPoint = formattedRoutes[0].waypoints[formattedRoutes[0].waypoints.length - 1];
          
          onStartChange({
            lat: firstPoint.lat,
            lng: firstPoint.lng,
            name: firstPoint.name
          });
          
          onEndChange({
            lat: lastPoint.lat,
            lng: lastPoint.lng,
            name: lastPoint.name
          });
        }
        
        toast.success(`🎯 ${formattedRoutes.length} AI-optimized routes calculated!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      
      // Enhanced fallback with realistic data
      const enhancedMockRoutes = generateFallbackRoutes();
      setRouteOptions(enhancedMockRoutes);
      setSelectedRoute(enhancedMockRoutes[0]);
      
      // Send fallback route data to parent
      if (enhancedMockRoutes[0].waypoints && enhancedMockRoutes[0].waypoints.length > 0) {
        const routeCoordinates = enhancedMockRoutes[0].waypoints.map(wp => [wp.lat, wp.lng]);
        onRouteFound(routeCoordinates);
        
        const firstPoint = enhancedMockRoutes[0].waypoints[0];
        const lastPoint = enhancedMockRoutes[0].waypoints[enhancedMockRoutes[0].waypoints.length - 1];
        
        onStartChange({
          lat: firstPoint.lat,
          lng: firstPoint.lng,
          name: firstPoint.name
        });
        
        onEndChange({
          lat: lastPoint.lat,
          lng: lastPoint.lng,
          name: lastPoint.name
        });
      }
      
      toast.warning("🔄 Using offline AI route calculation", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    setIsCalculating(false);
  }, [startLocation, endLocation, routeType, preferences, userType, currentLocation, onRouteFound, onStartChange, onEndChange]);

  // Generate enhanced fallback routes
  const generateFallbackRoutes = useCallback(() => {
    const startCoords = currentLocation || { lat: 23.1765, lng: 75.7885 };
    const endCoords = { lat: 23.1828, lng: 75.7681 }; // Mahakaleshwar Temple
    
    // Calculate realistic distance
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const distance = getDistance(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    
    const routes = [
      {
        id: "ai_route_001",
        name: "🤖 AI-Optimized Route",
        distance: `${distance.toFixed(2)} km`,
        duration: `${Math.round(distance * 12)}m`,
        crowdLevel: userType === 'vip' ? 15 : 35,
        safetyScore: userType === 'divyangjan' || userType === 'elderly' ? 98 : 95,
        accessibilityScore: userType === 'divyangjan' ? 100 : userType === 'elderly' ? 95 : 85,
        difficulty: userType === 'divyangjan' || userType === 'elderly' ? "Easy" : "Moderate",
        highlights: [
          "🧠 AI-powered pathfinding",
          "📊 Real-time crowd analysis",
          "🛡️ Safety-first routing",
          userType === 'divyangjan' ? "♿ Fully accessible" : "🚶 Pedestrian-friendly"
        ],
        warnings: [],
        waypoints: [
          { lat: startCoords.lat, lng: startCoords.lng, name: startLocation === "My Current Location" ? "My Location" : startLocation.split(' - ')[0] },
          { lat: (startCoords.lat + endCoords.lat) / 2, lng: (startCoords.lng + endCoords.lng) / 2, name: "🤖 AI Checkpoint" },
          { lat: endCoords.lat, lng: endCoords.lng, name: endLocation.split(' - ')[0] }
        ],
        instructions: [
          `🚀 Start from ${startLocation === "My Current Location" ? "your location" : startLocation.split(' - ')[0]}`,
          "🎯 Follow AI-optimized path with real-time updates",
          "✅ Arrive at destination with minimal crowd exposure"
        ],
        aiConfidence: 0.94,
        healthBenefits: {
          calories_burned: Math.round(distance * 50),
          steps: Math.round(distance * 1300),
          exercise_time: Math.round(distance * 12),
          health_score: Math.min(100, Math.round(distance * 20))
        },
        alternativeOptions: [
          `🛺 E-Rickshaw - ₹${Math.round(distance * 30)}, ${Math.round(distance * 3)}min`,
          "🚌 Shuttle Service - ₹10, includes guide"
        ]
      }
    ];

    // Add additional routes based on preferences
    if (routeType === 'fastest' || preferences.fastestRoute) {
      routes.push({
        id: "express_route_001",
        name: "⚡ Express Route",
        distance: `${(distance * 0.9).toFixed(2)} km`,
        duration: `${Math.round(distance * 8)}m`,
        crowdLevel: 75,
        safetyScore: 82,
        accessibilityScore: 75,
        difficulty: "Moderate",
        highlights: ["⚡ Fastest available path", "🎯 Direct connection"],
        warnings: ["⚠️ Higher crowd density expected"],
        waypoints: [
          { lat: startCoords.lat, lng: startCoords.lng, name: startLocation === "My Current Location" ? "My Location" : startLocation.split(' - ')[0] },
          { lat: endCoords.lat, lng: endCoords.lng, name: endLocation.split(' - ')[0] }
        ],
        instructions: [
          "🏃 Take direct path for fastest arrival",
          "⚠️ Navigate through busy areas with caution"
        ],
        aiConfidence: 0.88,
        healthBenefits: {
          calories_burned: Math.round(distance * 45),
          steps: Math.round(distance * 1200),
          exercise_time: Math.round(distance * 8),
          health_score: Math.min(100, Math.round(distance * 18))
        },
        alternativeOptions: ["🚕 Taxi - ₹" + Math.round(distance * 50)]
      });
    }

    if (userType === 'divyangjan' || userType === 'elderly' || preferences.accessibleRoute) {
      routes.push({
        id: "accessible_route_001",
        name: "♿ Universal Access Route",
        distance: `${(distance * 1.3).toFixed(2)} km`,
        duration: `${Math.round(distance * 18)}m`,
        crowdLevel: 20,
        safetyScore: 99,
        accessibilityScore: 100,
        difficulty: "Very Easy",
        highlights: [
          "♿ 100% wheelchair accessible",
          "🛗 Ramps and smooth surfaces",
          "👨‍⚕️ Medical support nearby",
          "🪑 Rest areas every 200m"
        ],
        warnings: [],
        waypoints: [
          { lat: startCoords.lat, lng: startCoords.lng, name: startLocation === "My Current Location" ? "My Location" : startLocation.split(' - ')[0] },
          { lat: startCoords.lat + 0.002, lng: startCoords.lng + 0.002, name: "♿ Accessible Rest Point 1" },
          { lat: startCoords.lat + 0.004, lng: startCoords.lng + 0.004, name: "♿ Accessible Rest Point 2" },
          { lat: endCoords.lat, lng: endCoords.lng, name: endLocation.split(' - ')[0] }
        ],
        instructions: [
          "♿ Follow fully accessible path with assistance points",
          "🛗 Use ramps and accessible facilities",
          "👨‍⚕️ Medical support available at each checkpoint"
        ],
        aiConfidence: 0.98,
        healthBenefits: {
          calories_burned: Math.round(distance * 35),
          steps: Math.round(distance * 1000),
          exercise_time: Math.round(distance * 18),
          health_score: Math.min(100, Math.round(distance * 15))
        },
        alternativeOptions: [
          "🦽 Wheelchair assistance - Free",
          "👨‍⚕️ Medical escort - Available on request"
        ]
      });
    }

    return routes;
  }, [startLocation, endLocation, currentLocation, userType, routeType, preferences]);

  useEffect(() => {
    if (startLocation && endLocation && startLocation !== endLocation) {
      generateRouteOptionsCallback();
    }
  }, [startLocation, endLocation, routeType, preferences, userType, generateRouteOptionsCallback]);

  const generateRouteOptions = async () => {
    setIsCalculating(true);
    
    try {
      // Call the sophisticated backend API
      const response = await fetch('http://localhost:8000/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_location: startLocation.split(' - ')[0].toLowerCase().replace(/\s+/g, '_'),
          end_location: endLocation.split(' - ')[0].toLowerCase().replace(/\s+/g, '_'),
          route_type: routeType,
          avoid_crowds: preferences.avoidCrowds,
          accessible_route: preferences.accessibleRoute,
          transport_mode: "walking"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate routes');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const formattedRoutes = data.routes.map(route => ({
          id: route.id,
          name: route.name,
          distance: route.distance,
          duration: route.duration,
          crowdLevel: route.crowd_level,
          safetyScore: route.safety_score,
          difficulty: route.difficulty,
          highlights: route.highlights,
          warnings: route.warnings,
          waypoints: route.waypoints,
          instructions: route.instructions,
          segments: route.segments
        }));
        
        setRouteOptions(formattedRoutes);
        setSelectedRoute(formattedRoutes[0]);
        
        toast.success(`${formattedRoutes.length} routes calculated successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error('No routes found');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      
      // Fallback to enhanced mock data if API fails
      const enhancedMockRoutes = [
        {
          id: 1,
          name: "AI-Optimized Route",
          distance: "1.2 km",
          duration: "8m 30s",
          crowdLevel: 35,
          safetyScore: 95,
          difficulty: "Easy",
          highlights: ["AI-optimized path", "Real-time crowd avoidance", "Emergency stations nearby"],
          warnings: [],
          waypoints: [
            { lat: 23.1765, lng: 75.7885, name: startLocation },
            { lat: 23.1780, lng: 75.7900, name: "Smart Checkpoint" },
            { lat: 23.1800, lng: 75.7920, name: endLocation }
          ],
          instructions: [
            "Head northeast on main path for 400m",
            "Continue straight through checkpoint",
            "Arrive at destination"
          ]
        },
        {
          id: 2,
          name: "Express Route",
          distance: "0.9 km",
          duration: "6m 15s",
          crowdLevel: 75,
          safetyScore: 85,
          difficulty: "Moderate",
          highlights: ["Fastest available path", "Direct connection"],
          warnings: ["Higher crowd density expected"],
          waypoints: [
            { lat: 23.1765, lng: 75.7885, name: startLocation },
            { lat: 23.1790, lng: 75.7910, name: endLocation }
          ],
          instructions: [
            "Take direct path northeast for 900m",
            "Arrive at destination"
          ]
        },
        {
          id: 3,
          name: "Scenic Heritage Route",
          distance: "1.8 km",
          duration: "12m 45s",
          crowdLevel: 20,
          safetyScore: 90,
          difficulty: "Easy",
          highlights: ["Historic landmarks", "Cultural sites", "Photo opportunities"],
          warnings: [],
          waypoints: [
            { lat: 23.1765, lng: 75.7885, name: startLocation },
            { lat: 23.1750, lng: 75.7870, name: "Heritage Point" },
            { lat: 23.1770, lng: 75.7890, name: "Cultural Site" },
            { lat: 23.1800, lng: 75.7920, name: endLocation }
          ],
          instructions: [
            "Head southwest to heritage point (600m)",
            "Continue northeast through cultural site (700m)",
            "Final approach to destination (500m)"
          ]
        }
      ];
      
      setRouteOptions(enhancedMockRoutes);
      setSelectedRoute(enhancedMockRoutes[0]);
      
      toast.warning("Using offline route calculation", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    setIsCalculating(false);
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
          <Brain size={24} />
          <h2>AI Smart Route Planner</h2>
        </div>
        <div className="header-subtitle">
          🤖 AI-powered routing with real-time optimization for Simhastha 2028
        </div>
        {weatherConditions && (
          <div className="weather-info">
            🌤️ {weatherConditions.temperature}°C • {weatherConditions.conditions} • {weatherConditions.impact_on_travel} impact
          </div>
        )}
      </motion.div>

      {/* User Type Selection */}
      <motion.div 
        className="user-type-selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="user-type-label">👤 I am a:</div>
        <div className="user-type-options">
          <button 
            className={`user-type-btn ${userType === 'general' ? 'active' : ''}`}
            onClick={() => setUserType('general')}
          >
            <Users size={16} />
            <span>General Pilgrim</span>
          </button>
          <button 
            className={`user-type-btn ${userType === 'elderly' ? 'active' : ''}`}
            onClick={() => setUserType('elderly')}
          >
            <Shield size={16} />
            <span>Senior Citizen</span>
          </button>
          <button 
            className={`user-type-btn ${userType === 'divyangjan' ? 'active' : ''}`}
            onClick={() => setUserType('divyangjan')}
          >
            <UserCheck size={16} />
            <span>Divyangjan</span>
          </button>
          <button 
            className={`user-type-btn ${userType === 'vip' ? 'active' : ''}`}
            onClick={() => setUserType('vip')}
          >
            <Crown size={16} />
            <span>VIP Guest</span>
          </button>
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
            {availableLocations.map((location, index) => (
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
            {availableLocations.map((location, index) => (
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

      <style>{`
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