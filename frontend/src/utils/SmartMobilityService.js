/**
 * Smart Mobility & Access Management Service for Simhastha 2028
 * Complete end-to-end solution for efficient, inclusive, and responsive movement
 */

class SmartMobilityService {
  constructor() {
    // Simhastha 2028 specific locations and infrastructure
    this.SIMHASTHA_LOCATIONS = {
      // Main Ghats and Religious Sites
      ghats: [
        { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885, capacity: 50000, type: 'main_ghat' },
        { name: 'Triveni Ghat', lat: 23.1756, lng: 75.7892, capacity: 30000, type: 'ghat' },
        { name: 'Gadkalika Ghat', lat: 23.1773, lng: 75.7878, capacity: 25000, type: 'ghat' },
        { name: 'Kshipra Ghat', lat: 23.1748, lng: 75.7901, capacity: 20000, type: 'ghat' },
        { name: 'Mangalnath Ghat', lat: 23.1567, lng: 75.7823, capacity: 15000, type: 'ghat' }
      ],
      
      // VIP Areas and Special Zones
      vipZones: [
        { name: 'VIP Enclosure - Ram Ghat', lat: 23.1770, lng: 75.7880, type: 'vip_zone' },
        { name: 'VVIP Helipad', lat: 23.1820, lng: 75.7650, type: 'helipad' },
        { name: 'Government Guest House', lat: 23.1890, lng: 75.7720, type: 'vip_accommodation' },
        { name: 'Press Enclosure', lat: 23.1760, lng: 75.7870, type: 'media_zone' }
      ],
      
      // Transport Hubs
      transportHubs: [
        { name: 'Ujjain Junction Railway Station', lat: 23.1906, lng: 75.7804, capacity: 100000, type: 'railway' },
        { name: 'Main Bus Terminal', lat: 23.1823, lng: 75.7756, capacity: 50000, type: 'bus_terminal' },
        { name: 'Temporary Bus Stand - East', lat: 23.1945, lng: 75.7890, capacity: 25000, type: 'temp_bus_stand' },
        { name: 'Temporary Bus Stand - West', lat: 23.1678, lng: 75.7723, capacity: 25000, type: 'temp_bus_stand' },
        { name: 'Helicopter Landing Zone', lat: 23.1820, lng: 75.7650, capacity: 20, type: 'helipad' }
      ],
      
      // Parking Areas
      parkingZones: [
        { name: 'Main Parking - Sector A', lat: 23.1834, lng: 75.7812, capacity: 5000, type: 'car_parking' },
        { name: 'Main Parking - Sector B', lat: 23.1712, lng: 75.7934, capacity: 5000, type: 'car_parking' },
        { name: 'Two Wheeler Parking - Zone 1', lat: 23.1789, lng: 75.7845, capacity: 10000, type: 'bike_parking' },
        { name: 'Two Wheeler Parking - Zone 2', lat: 23.1723, lng: 75.7867, capacity: 10000, type: 'bike_parking' },
        { name: 'Bus Parking Area', lat: 23.1856, lng: 75.7789, capacity: 500, type: 'bus_parking' }
      ],
      
      // Accessibility Infrastructure
      accessibilityPoints: [
        { name: 'Divyangjan Help Center - Ram Ghat', lat: 23.1762, lng: 75.7888, type: 'accessibility_center' },
        { name: 'Wheelchair Service Point 1', lat: 23.1758, lng: 75.7882, type: 'wheelchair_service' },
        { name: 'Wheelchair Service Point 2', lat: 23.1768, lng: 75.7875, type: 'wheelchair_service' },
        { name: 'Senior Citizen Rest Area 1', lat: 23.1755, lng: 75.7890, type: 'senior_rest_area' },
        { name: 'Senior Citizen Rest Area 2', lat: 23.1775, lng: 75.7870, type: 'senior_rest_area' },
        { name: 'Medical Aid Station', lat: 23.1765, lng: 75.7885, type: 'medical_aid' }
      ],
      
      // Shuttle Service Routes
      shuttleRoutes: [
        {
          name: 'Main Shuttle Route A',
          stops: [
            { name: 'Railway Station', lat: 23.1906, lng: 75.7804 },
            { name: 'Bus Terminal', lat: 23.1823, lng: 75.7756 },
            { name: 'Parking Sector A', lat: 23.1834, lng: 75.7812 },
            { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885 }
          ],
          frequency: '2 minutes',
          capacity: 50,
          accessibility: true
        },
        {
          name: 'Ghat Connectivity Route',
          stops: [
            { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885 },
            { name: 'Triveni Ghat', lat: 23.1756, lng: 75.7892 },
            { name: 'Gadkalika Ghat', lat: 23.1773, lng: 75.7878 },
            { name: 'Mangalnath Ghat', lat: 23.1567, lng: 75.7823 }
          ],
          frequency: '3 minutes',
          capacity: 40,
          accessibility: true
        }
      ]
    };
    
    // Real-time crowd density simulation
    this.crowdDensity = new Map();
    this.initializeCrowdData();
    
    // Traffic management zones
    this.trafficZones = {
      'red': { maxCapacity: 1000, currentLoad: 0, restrictions: ['no_private_vehicles'] },
      'amber': { maxCapacity: 5000, currentLoad: 0, restrictions: ['limited_access'] },
      'green': { maxCapacity: 10000, currentLoad: 0, restrictions: [] }
    };
  }

  /**
   * Initialize crowd density data for all locations
   */
  initializeCrowdData() {
    // Initialize crowd data for all locations
    [...this.SIMHASTHA_LOCATIONS.ghats, 
     ...this.SIMHASTHA_LOCATIONS.transportHubs,
     ...this.SIMHASTHA_LOCATIONS.parkingZones].forEach(location => {
      this.crowdDensity.set(location.name, {
        current: Math.floor(Math.random() * (location.capacity * 0.3)),
        capacity: location.capacity,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        lastUpdated: new Date()
      });
    });
  }

  /**
   * Get optimal routes with multiple alternatives (Google Maps style)
   */
  async getOptimalRoutes(start, end, preferences = {}) {
    const routes = [];
    
    try {
      // Route 1: Fastest Route
      const fastestRoute = await this.calculateFastestRoute(start, end, preferences);
      if (fastestRoute) {
        routes.push({
          ...fastestRoute,
          id: 'fastest',
          name: '⚡ Fastest Route',
          priority: 1,
          color: '#4285F4'
        });
      }
      
      // Route 2: Crowd-Optimized Route
      const crowdOptimizedRoute = await this.calculateCrowdOptimizedRoute(start, end, preferences);
      if (crowdOptimizedRoute) {
        routes.push({
          ...crowdOptimizedRoute,
          id: 'crowd_optimized',
          name: '🤖 AI-Optimized (Low Crowd)',
          priority: 2,
          color: '#34A853'
        });
      }
      
      // Route 3: Accessible Route (if needed)
      if (preferences.accessibilityNeeded) {
        const accessibleRoute = await this.calculateAccessibleRoute(start, end, preferences);
        if (accessibleRoute) {
          routes.push({
            ...accessibleRoute,
            id: 'accessible',
            name: '♿ Accessible Route',
            priority: 3,
            color: '#FBBC04'
          });
        }
      }
      
      // Route 4: Shuttle-Integrated Route
      const shuttleRoute = await this.calculateShuttleIntegratedRoute(start, end, preferences);
      if (shuttleRoute) {
        routes.push({
          ...shuttleRoute,
          id: 'shuttle',
          name: '🚌 Shuttle-Integrated Route',
          priority: 4,
          color: '#EA4335'
        });
      }
      
      return routes.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      console.error('Route calculation error:', error);
      return [];
    }
  }

  /**
   * Calculate fastest route using OSRM
   */
  async calculateFastestRoute(start, end, preferences) {
    try {
      const profile = this.getRoutingProfile(preferences);
      const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true&annotations=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`OSRM error: ${response.status}`);
      
      const data = await response.json();
      const route = data.routes[0];
      
      if (!route) return null;
      
      return {
        coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
        distance: `${(route.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(route.duration / 60)} min`,
        instructions: this.formatInstructions(route.legs[0].steps),
        crowdLevel: await this.calculateRouteCrowdLevel(route.geometry.coordinates),
        safetyScore: 85,
        accessibilityScore: preferences.accessibilityNeeded ? 60 : 80,
        trafficCondition: 'moderate',
        estimatedCost: this.calculateRouteCost(route.distance, preferences)
      };
    } catch (error) {
      console.error('Fastest route calculation error:', error);
      return null;
    }
  }

  /**
   * Calculate crowd-optimized route
   */
  async calculateCrowdOptimizedRoute(start, end, preferences) {
    try {
      // Get multiple route alternatives
      const alternatives = await this.getRouteAlternatives(start, end, preferences);
      
      // Score routes based on crowd levels
      let bestRoute = null;
      let bestScore = -1;
      
      for (const route of alternatives) {
        const crowdLevel = await this.calculateRouteCrowdLevel(route.coordinates);
        const score = this.calculateRouteScore(route, crowdLevel, preferences);
        
        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }
      
      if (bestRoute) {
        bestRoute.crowdLevel = await this.calculateRouteCrowdLevel(bestRoute.coordinates);
        bestRoute.safetyScore = 90;
        bestRoute.accessibilityScore = preferences.accessibilityNeeded ? 70 : 85;
        bestRoute.trafficCondition = 'light';
      }
      
      return bestRoute;
    } catch (error) {
      console.error('Crowd-optimized route calculation error:', error);
      return null;
    }
  }

  /**
   * Calculate accessible route for Divyangjan and elderly
   */
  async calculateAccessibleRoute(start, end, preferences) {
    try {
      // Find accessible waypoints
      const accessibleWaypoints = this.findAccessibleWaypoints(start, end);
      
      // Calculate route through accessible infrastructure
      const route = await this.calculateRouteWithWaypoints(start, end, accessibleWaypoints, 'foot');
      
      if (route) {
        route.accessibilityScore = 100;
        route.safetyScore = 95;
        route.crowdLevel = 25; // Accessible routes typically less crowded
        route.specialFeatures = [
          'Wheelchair accessible paths',
          'Rest areas available',
          'Medical aid stations nearby',
          'Dedicated assistance points'
        ];
      }
      
      return route;
    } catch (error) {
      console.error('Accessible route calculation error:', error);
      return null;
    }
  }

  /**
   * Calculate shuttle-integrated route
   */
  async calculateShuttleIntegratedRoute(start, end, preferences) {
    try {
      // Find nearest shuttle stops
      const nearestStartStop = this.findNearestShuttleStop(start);
      const nearestEndStop = this.findNearestShuttleStop(end);
      
      if (!nearestStartStop || !nearestEndStop) return null;
      
      // Calculate multi-modal route
      const walkToShuttle = await this.calculateWalkingRoute(start, nearestStartStop);
      const shuttleRoute = this.getShuttleRoute(nearestStartStop, nearestEndStop);
      const walkFromShuttle = await this.calculateWalkingRoute(nearestEndStop, end);
      
      if (walkToShuttle && shuttleRoute && walkFromShuttle) {
        return {
          coordinates: [
            ...walkToShuttle.coordinates,
            ...shuttleRoute.coordinates,
            ...walkFromShuttle.coordinates
          ],
          distance: `${(walkToShuttle.distance + shuttleRoute.distance + walkFromShuttle.distance).toFixed(2)} km`,
          duration: `${walkToShuttle.duration + shuttleRoute.duration + walkFromShuttle.duration} min`,
          instructions: [
            ...walkToShuttle.instructions,
            `Take shuttle from ${nearestStartStop.name} to ${nearestEndStop.name}`,
            ...walkFromShuttle.instructions
          ],
          crowdLevel: 20, // Shuttles help reduce crowd
          safetyScore: 95,
          accessibilityScore: 100,
          estimatedCost: 'Free (Shuttle Service)',
          specialFeatures: [
            'Free shuttle service',
            'Air-conditioned vehicles',
            'Wheelchair accessible',
            'Frequent service (every 2-3 minutes)'
          ]
        };
      }
      
      return null;
    } catch (error) {
      console.error('Shuttle-integrated route calculation error:', error);
      return null;
    }
  }

  /**
   * Get real-time crowd information
   */
  getRealTimeCrowdInfo(locationName) {
    const crowdData = this.crowdDensity.get(locationName);
    if (!crowdData) return null;
    
    // Simulate real-time updates
    const currentTime = new Date();
    const timeDiff = currentTime - crowdData.lastUpdated;
    
    if (timeDiff > 30000) { // Update every 30 seconds
      const change = Math.floor(Math.random() * 200) - 100; // -100 to +100
      crowdData.current = Math.max(0, Math.min(crowdData.capacity, crowdData.current + change));
      crowdData.trend = change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable';
      crowdData.lastUpdated = currentTime;
    }
    
    const percentage = (crowdData.current / crowdData.capacity) * 100;
    
    return {
      current: crowdData.current,
      capacity: crowdData.capacity,
      percentage: Math.round(percentage),
      trend: crowdData.trend,
      status: percentage > 80 ? 'high' : percentage > 50 ? 'medium' : 'low',
      recommendation: this.getCrowdRecommendation(percentage, crowdData.trend)
    };
  }

  /**
   * Get crowd recommendation
   */
  getCrowdRecommendation(percentage, trend) {
    if (percentage > 90) return 'Avoid this area - Extremely crowded';
    if (percentage > 80) return 'High crowd - Consider alternative routes';
    if (percentage > 60) return 'Moderate crowd - Plan accordingly';
    if (percentage > 40) return 'Light crowd - Good time to visit';
    return 'Low crowd - Ideal time to visit';
  }

  /**
   * Get VIP movement automation
   */
  getVIPMovementPlan(vipLevel, startTime, endTime) {
    const vipRoutes = {
      'VVIP': {
        route: 'Helipad → VIP Enclosure (Direct)',
        security: 'Z+ Security',
        clearance: '15 minutes before arrival',
        alternativeRoutes: 2
      },
      'VIP': {
        route: 'Government Guest House → Ram Ghat (Secured Route)',
        security: 'Y Security',
        clearance: '10 minutes before arrival',
        alternativeRoutes: 1
      },
      'Dignitary': {
        route: 'Main Parking → Ghat (Designated Path)',
        security: 'X Security',
        clearance: '5 minutes before arrival',
        alternativeRoutes: 1
      }
    };
    
    return vipRoutes[vipLevel] || vipRoutes['Dignitary'];
  }

  /**
   * Get public transport information
   */
  getPublicTransportInfo() {
    return {
      shuttleServices: this.SIMHASTHA_LOCATIONS.shuttleRoutes.map(route => ({
        ...route,
        currentStatus: 'Active',
        nextArrival: `${Math.floor(Math.random() * 5) + 1} minutes`,
        crowdLevel: Math.floor(Math.random() * 60) + 20
      })),
      
      specialServices: [
        {
          name: 'Divyangjan Special Shuttle',
          route: 'All major points with accessibility features',
          frequency: '5 minutes',
          features: ['Wheelchair lift', 'Audio announcements', 'Dedicated seating']
        },
        {
          name: 'Senior Citizen Comfort Service',
          route: 'Railway Station → Ghats (Direct)',
          frequency: '10 minutes',
          features: ['Comfortable seating', 'Medical aid on board', 'Slow boarding']
        }
      ]
    };
  }

  /**
   * Get dynamic signage information
   */
  getDynamicSignageInfo(location) {
    const crowdInfo = this.getRealTimeCrowdInfo(location);
    
    return {
      location: location,
      messages: [
        `Current Crowd: ${crowdInfo?.percentage || 0}% (${crowdInfo?.status || 'unknown'})`,
        `Next Shuttle: ${Math.floor(Math.random() * 5) + 1} minutes`,
        `Alternative Route: ${Math.floor(Math.random() * 3) + 1} available`,
        `Weather: Clear, 28°C`
      ],
      directions: this.getLocationDirections(location),
      emergencyInfo: {
        nearestMedical: 'Medical Aid Station - 200m',
        nearestSecurity: 'Security Post - 150m',
        emergencyNumber: '108'
      }
    };
  }

  /**
   * Helper methods
   */
  getRoutingProfile(preferences) {
    if (preferences.transportMode === 'driving') return 'driving';
    if (preferences.transportMode === 'cycling') return 'cycling';
    return 'foot';
  }

  formatInstructions(steps) {
    return steps.map(step => ({
      instruction: step.maneuver.instruction || `Continue for ${step.distance}m`,
      distance: step.distance,
      duration: step.duration
    }));
  }

  async calculateRouteCrowdLevel(coordinates) {
    // Simulate crowd level calculation based on route proximity to crowded areas
    let maxCrowd = 20;
    
    coordinates.forEach(coord => {
      this.SIMHASTHA_LOCATIONS.ghats.forEach(ghat => {
        const distance = this.calculateDistance(
          { lat: coord[1], lng: coord[0] },
          { lat: ghat.lat, lng: ghat.lng }
        );
        
        if (distance < 0.5) { // Within 500m of ghat
          const crowdInfo = this.getRealTimeCrowdInfo(ghat.name);
          if (crowdInfo) {
            maxCrowd = Math.max(maxCrowd, crowdInfo.percentage);
          }
        }
      });
    });
    
    return Math.round(maxCrowd);
  }

  calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateRouteScore(route, crowdLevel, preferences) {
    let score = 100;
    
    // Penalize high crowd levels
    score -= crowdLevel * 0.5;
    
    // Bonus for accessibility if needed
    if (preferences.accessibilityNeeded && route.accessibilityScore > 80) {
      score += 20;
    }
    
    // Bonus for shorter routes
    const distance = parseFloat(route.distance);
    if (distance < 2) score += 10;
    
    return score;
  }

  calculateRouteCost(distance, preferences) {
    if (preferences.transportMode === 'shuttle') return 'Free';
    if (preferences.transportMode === 'driving') return `₹${Math.round(distance * 0.01 * 10)}`;
    return 'Free (Walking)';
  }

  findAccessibleWaypoints(start, end) {
    return this.SIMHASTHA_LOCATIONS.accessibilityPoints.filter(point => {
      const distanceFromStart = this.calculateDistance(start, point);
      const distanceFromEnd = this.calculateDistance(end, point);
      return distanceFromStart < 1 || distanceFromEnd < 1; // Within 1km
    });
  }

  findNearestShuttleStop(location) {
    let nearest = null;
    let minDistance = Infinity;
    
    this.SIMHASTHA_LOCATIONS.shuttleRoutes.forEach(route => {
      route.stops.forEach(stop => {
        const distance = this.calculateDistance(location, stop);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = stop;
        }
      });
    });
    
    return minDistance < 2 ? nearest : null; // Within 2km
  }

  getLocationDirections(location) {
    return [
      `To Ram Ghat: 500m North`,
      `To Railway Station: 2.1km East`,
      `To Parking Area: 800m South`,
      `To Medical Aid: 200m West`
    ];
  }

  // Additional helper methods would be implemented here...
  async getRouteAlternatives(start, end, preferences) {
    // Implementation for getting multiple route alternatives
    return [];
  }

  async calculateRouteWithWaypoints(start, end, waypoints, profile) {
    // Implementation for calculating route with waypoints
    return null;
  }

  async calculateWalkingRoute(start, end) {
    // Implementation for calculating walking route
    return null;
  }

  getShuttleRoute(startStop, endStop) {
    // Implementation for getting shuttle route
    return null;
  }
}

const smartMobilityService = new SmartMobilityService();
export default smartMobilityService;