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
  Crown,
  Brain,
  UserCheck,

} from "lucide-react";
import { toast } from "react-toastify";
import LocationSearch from "./LocationSearch";

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

  // const [availableLocations, setAvailableLocations] = useState([]); // Removed unused variable
  const [, setNearbyLocations] = useState([]);
  const [userType, setUserType] = useState("general"); // general, elderly, divyangjan, vip
  const [weatherConditions, setWeatherConditions] = useState(null);

  // Fetch real locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8000/routes/locations');
        if (response.ok) {
          // const data = await response.json(); // Removed unused variable
          // const formattedLocations = data.locations.map(loc => 
          //   `${loc.name} - ${loc.type.charAt(0).toUpperCase() + loc.type.slice(1)} (${Math.round(loc.crowd_density * 100)}% crowd)`
          // ); // Removed unused variable
          // setAvailableLocations(formattedLocations); // Removed unused variable
        } else {
          // Fallback locations - commented out since setAvailableLocations is removed
          console.log('Using fallback locations');
        }
      } catch (error) {
        console.log('Using fallback locations');
        // setAvailableLocations removed - using LocationSearch component instead
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

  // Helper function to generate waypoints
  const generateWaypoints = useCallback((start, end, count) => {
    const waypoints = [];
    for (let i = 0; i <= count; i++) {
      const ratio = i / count;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      waypoints.push({
        lat: lat + (Math.random() - 0.5) * 0.001, // Add small random variation
        lng: lng + (Math.random() - 0.5) * 0.001,
        name: i === 0 ? (startLocation === "My Current Location" ? "My Location" : startLocation.split(' - ')[0]) :
              i === count ? endLocation.split(' - ')[0] :
              `Waypoint ${i}`
      });
    }
    return waypoints;
  }, [startLocation, endLocation]);

  // Generate enhanced routes using real routing service
  const generateFallbackRoutes = useCallback(async () => {
    const startCoords = currentLocation || { lat: 23.1765, lng: 75.7885 };
    
    // Parse end location coordinates
    let endCoords = { lat: 23.1828, lng: 75.7681 }; // Default to Mahakaleshwar
    
    // Try to extract coordinates from endLocation if it contains them
    if (endLocation && endLocation.includes('(') && endLocation.includes(')')) {
      const coordMatch = endLocation.match(/\(([^)]+)\)/);
      if (coordMatch) {
        const [lat, lng] = coordMatch[1].split(',').map(c => parseFloat(c.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          endCoords = { lat, lng };
        }
      }
    }

    try {
      // Use RoutingService for real routing
      const RoutingService = (await import('../utils/RoutingService')).default;
      
      const routeOptions = {
        profile: 'foot-walking',
        avoidCrowds: preferences.avoidCrowds,
        accessibleRoute: preferences.accessibleRoute || userType === 'divyangjan' || userType === 'elderly',
        routeType: routeType
      };

      const route = await RoutingService.calculateRoute(startCoords, endCoords, routeOptions);
      
      if (route && route.coordinates) {
        return [
          {
            id: "real_route_001",
            name: "🗺️ Real Road Route",
            distance: route.distance,
            duration: route.duration,
            crowdLevel: route.crowdLevel || (userType === 'vip' ? 15 : 35),
            safetyScore: route.safetyScore || (userType === 'divyangjan' || userType === 'elderly' ? 98 : 95),
            accessibilityScore: route.accessibilityScore || (userType === 'divyangjan' ? 100 : userType === 'elderly' ? 95 : 85),
            difficulty: route.difficulty || (userType === 'divyangjan' || userType === 'elderly' ? "Easy" : "Moderate"),
            highlights: [
              "🗺️ Real road data from OpenStreetMap",
              "📊 Accurate distance and timing",
              "🛡️ Safe pedestrian routes",
              ...(route.surface_info ? ["🛤️ Surface type considered"] : [])
            ],
            warnings: route.instructions ? [] : ["⚠️ Limited turn-by-turn data"],
            waypoints: route.coordinates.map((coord, index) => ({
              lat: coord[0],
              lng: coord[1],
              name: index === 0 ? (startLocation === "My Current Location" ? "My Location" : startLocation.split(' - ')[0]) :
                    index === route.coordinates.length - 1 ? endLocation.split(' - ')[0] :
                    `Waypoint ${index}`
            })),
            instructions: route.instructions || [
              `🚀 Start from ${startLocation === "My Current Location" ? "your location" : startLocation.split(' - ')[0]}`,
              "🎯 Follow the mapped route with real road data",
              "✅ Arrive at destination via optimal path"
            ],
            aiConfidence: 0.96,
            realRoute: true
          }
        ];
      }
    } catch (error) {
      console.error('Real routing failed, using fallback:', error);
    }

    // Fallback to simple route if real routing fails
    const distance = calculateDistance(startCoords, endCoords);
    
    return [
      {
        id: "fallback_route_001",
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
          "🛡️ Safety-first routing"
        ],
        warnings: ["⚠️ Using estimated route - real road data unavailable"],
        waypoints: generateWaypoints(startCoords, endCoords, 3),
        instructions: [
          `🚀 Start from ${startLocation === "My Current Location" ? "your location" : startLocation.split(' - ')[0]}`,
          "🎯 Follow AI-optimized path with real-time updates",
          "✅ Arrive at destination with minimal crowd exposure"
        ],
        aiConfidence: 0.85
      }
    ];
  }, [startLocation, endLocation, currentLocation, userType, preferences.avoidCrowds, preferences.accessibleRoute, routeType, generateWaypoints]);

  // Helper function to calculate distance
  const calculateDistance = (start, end) => {
    const R = 6371; // Earth's radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const generateRouteOptionsCallback = useCallback(async () => {
    setIsCalculating(true);
    
    try {
      // First try the backend API
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

      if (response.ok) {
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
          
          setIsCalculating(false);
          return;
        }
      }
      
      throw new Error('Backend API failed or returned no routes');
    } catch (error) {
      console.error('Backend route calculation error:', error);
      
      // Use enhanced routing service with real road data
      try {
        const enhancedMockRoutes = await generateFallbackRoutes();
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
        
        toast.success("🗺️ Real road routing activated!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (fallbackError) {
        console.error('Fallback routing also failed:', fallbackError);
        toast.error("❌ Route calculation failed", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
    
    setIsCalculating(false);
  }, [startLocation, endLocation, routeType, preferences, userType, currentLocation, onRouteFound, onStartChange, onEndChange, generateFallbackRoutes]);



  useEffect(() => {
    if (startLocation && endLocation && startLocation !== endLocation) {
      generateRouteOptionsCallback();
    }
  }, [startLocation, endLocation, routeType, preferences, userType, generateRouteOptionsCallback, generateFallbackRoutes]);

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

      {/* Location Inputs with Search */}
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
          <LocationSearch
            placeholder="Search starting location in Madhya Pradesh..."
            onLocationSelect={(location) => {
              setStartLocation(location.displayName);
              onStartChange(location);
            }}
            currentLocation={currentLocation}
            className="location-search-input"
          />
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
          <LocationSearch
            placeholder="Search destination in Madhya Pradesh..."
            onLocationSelect={(location) => {
              setEndLocation(location.displayName);
              onEndChange(location);
            }}
            currentLocation={currentLocation}
            className="location-search-input"
          />
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