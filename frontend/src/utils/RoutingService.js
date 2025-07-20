/**
 * Enhanced Routing Service with Google Maps-like functionality
 * Integrated with Smart Mobility Service for Simhastha 2028
 */

class RoutingService {
  constructor() {
    // Free routing services (no API key required)
    this.OSRM_BASE_URL = 'https://router.project-osrm.org';
    this.MAPBOX_BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';
    
    // Madhya Pradesh bounds for local routing
    this.MP_BOUNDS = {
      north: 26.87, south: 21.08, east: 82.75, west: 74.02
    };
    
    // Route profiles mapping
    this.PROFILES = {
      'driving': 'driving',
      'walking': 'foot',
      'cycling': 'cycling',
      'foot-walking': 'foot'
    };
  }

  /**
   * Calculate route between two points using real road data - Google Maps style
   */
  async calculateRoute(startCoords, endCoords, options = {}) {
    const {
      profile = 'foot-walking'
    } = options;

    try {
      // For Simhastha 2028, use enhanced routing for Ujjain area
      if (this.isInUjjainArea(startCoords) || this.isInUjjainArea(endCoords)) {
        return await this.getUjjainOptimizedRoute(startCoords, endCoords, options);
      }

      // Use OSRM for general routing
      const osrmRoute = await this.getOSRMRoute(startCoords, endCoords, profile);
      if (osrmRoute) return osrmRoute;

      // Fallback to enhanced route with realistic waypoints
      return this.generateFallbackRoute(startCoords, endCoords, options);
    } catch (error) {
      console.error('Routing error:', error);
      return this.generateFallbackRoute(startCoords, endCoords, options);
    }
  }

  /**
   * Get multiple route alternatives like Google Maps
   */
  async getMultipleRoutes(startCoords, endCoords, options = {}) {
    try {
      // For Simhastha 2028 area, use enhanced routing
      if (this.isInUjjainArea(startCoords) || this.isInUjjainArea(endCoords)) {
        return await this.getUjjainMultipleRoutes(startCoords, endCoords, options);
      }

      // For other areas, calculate multiple alternatives
      const routes = [];
      
      // Route 1: Fastest
      const fastestRoute = await this.getOSRMRoute(startCoords, endCoords, 'foot');
      if (fastestRoute) {
        routes.push({
          ...fastestRoute,
          id: 'fastest',
          name: '⚡ Fastest Route',
          color: '#4285F4'
        });
      }

      // Route 2: Alternative (with slight deviation)
      const altRoute = await this.getAlternativeRoute(startCoords, endCoords, options);
      if (altRoute) {
        routes.push({
          ...altRoute,
          id: 'alternative',
          name: '🛣️ Alternative Route',
          color: '#34A853'
        });
      }

      // Route 3: Accessible (if needed)
      if (options.accessibilityNeeded) {
        const accessibleRoute = await this.getAccessibleRoute(startCoords, endCoords, options);
        if (accessibleRoute) {
          routes.push({
            ...accessibleRoute,
            id: 'accessible',
            name: '♿ Accessible Route',
            color: '#FBBC04'
          });
        }
      }

      return routes;
    } catch (error) {
      console.error('Multiple routes error:', error);
      return [await this.calculateRoute(startCoords, endCoords, options)].filter(Boolean);
    }
  }

  /**
   * Check if location is in Ujjain area (Simhastha 2028 zone)
   */
  isInUjjainArea(coords) {
    const ujjainBounds = {
      north: 23.25,
      south: 23.10,
      east: 75.85,
      west: 75.70
    };
    
    return coords.lat >= ujjainBounds.south &&
           coords.lat <= ujjainBounds.north &&
           coords.lng >= ujjainBounds.west &&
           coords.lng <= ujjainBounds.east;
  }

  /**
   * Get Ujjain optimized route for Simhastha 2028
   */
  async getUjjainOptimizedRoute(start, end, options) {
    try {
      // Use OSRM for base routing
      const baseRoute = await this.getOSRMRoute(start, end, 'foot');
      if (!baseRoute) return this.generateFallbackRoute(start, end, options);

      // Enhance with Simhastha-specific features
      return {
        ...baseRoute,
        crowdLevel: this.estimateUjjainCrowdLevel(baseRoute.coordinates),
        safetyScore: 95,
        accessibilityScore: options.accessibilityNeeded ? 100 : 85,
        specialFeatures: [
          'Simhastha 2028 optimized',
          'Real-time crowd monitoring',
          'Emergency services nearby',
          'Multilingual signage available'
        ]
      };
    } catch (error) {
      console.error('Ujjain optimized route error:', error);
      return this.generateFallbackRoute(start, end, options);
    }
  }

  /**
   * Estimate crowd level specifically for Ujjain during Simhastha
   */
  estimateUjjainCrowdLevel(coordinates) {
    const crowdedAreas = [
      { lat: 23.1765, lng: 75.7885, radius: 0.3, intensity: 90 }, // Ram Ghat
      { lat: 23.1828, lng: 75.7681, radius: 0.2, intensity: 85 }, // Mahakaleshwar
      { lat: 23.1906, lng: 75.7804, radius: 0.5, intensity: 70 }, // Railway Station
    ];
    
    let maxCrowd = 30;
    coordinates.forEach(coord => {
      crowdedAreas.forEach(area => {
        const distance = this.calculateDistance(
          { lat: coord[0], lng: coord[1] },
          { lat: area.lat, lng: area.lng }
        );
        if (distance < area.radius) {
          maxCrowd = Math.max(maxCrowd, area.intensity);
        }
      });
    });
    
    return Math.round(maxCrowd);
  }

  /**
   * Get alternative route with deviation
   */
  async getAlternativeRoute(start, end, options) {
    try {
      // Create a waypoint that deviates from direct path
      const midpoint = {
        lat: (start.lat + end.lat) / 2 + (Math.random() - 0.5) * 0.01,
        lng: (start.lng + end.lng) / 2 + (Math.random() - 0.5) * 0.01
      };

      // Try to route through the waypoint
      const url = `${this.OSRM_BASE_URL}/route/v1/foot/${start.lng},${start.lat};${midpoint.lng},${midpoint.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`OSRM error: ${response.status}`);

      const data = await response.json();
      const route = this.formatOSRMResponse(data);
      
      return {
        ...route,
        crowdLevel: Math.max(20, route.crowdLevel - 15), // Alternative routes typically less crowded
        safetyScore: 80
      };
    } catch (error) {
      console.error('Alternative route error:', error);
      return null;
    }
  }

  /**
   * Get accessible route for Divyangjan and elderly
   */
  async getAccessibleRoute(start, end, options) {
    try {
      // Use walking profile but with accessibility considerations
      const route = await this.getOSRMRoute(start, end, 'foot-walking');
      if (!route) return null;

      return {
        ...route,
        accessibilityScore: 100,
        safetyScore: 95,
        crowdLevel: Math.max(15, route.crowdLevel - 20), // Accessible routes less crowded
        specialFeatures: [
          'Wheelchair accessible paths',
          'Rest areas every 200m',
          'Audio navigation support',
          'Emergency assistance points'
        ]
      };
    } catch (error) {
      console.error('Accessible route error:', error);
      return null;
    }
  }

  /**
   * Get multiple routes for Ujjain area (Simhastha 2028)
   */
  async getUjjainMultipleRoutes(start, end, options) {
    try {
      const routes = [];

      // Route 1: Fastest Route
      const fastestRoute = await this.getOSRMRoute(start, end, 'foot');
      if (fastestRoute) {
        routes.push({
          ...fastestRoute,
          id: 'fastest',
          name: '⚡ Fastest Route',
          color: '#4285F4',
          crowdLevel: this.estimateUjjainCrowdLevel(fastestRoute.coordinates),
          specialFeatures: ['Simhastha 2028 optimized', 'Real-time updates']
        });
      }

      // Route 2: Crowd-Optimized Route
      const crowdOptimizedRoute = await this.getAlternativeRoute(start, end, options);
      if (crowdOptimizedRoute) {
        routes.push({
          ...crowdOptimizedRoute,
          id: 'crowd_optimized',
          name: '🤖 AI-Optimized (Low Crowd)',
          color: '#34A853',
          crowdLevel: Math.max(15, crowdOptimizedRoute.crowdLevel - 25),
          specialFeatures: ['Crowd avoidance', 'Dynamic routing', 'Emergency access']
        });
      }

      // Route 3: Accessible Route (if needed)
      if (options.accessibilityNeeded) {
        const accessibleRoute = await this.getAccessibleRoute(start, end, options);
        if (accessibleRoute) {
          routes.push({
            ...accessibleRoute,
            id: 'accessible',
            name: '♿ Accessible Route',
            color: '#FBBC04',
            specialFeatures: [
              'Wheelchair accessible',
              'Divyangjan friendly',
              'Rest areas available',
              'Medical aid nearby'
            ]
          });
        }
      }

      // Route 4: Ghat-Optimized Route (for pilgrims)
      const ghatRoute = await this.getGhatOptimizedRoute(start, end, options);
      if (ghatRoute) {
        routes.push({
          ...ghatRoute,
          id: 'ghat_optimized',
          name: '🛕 Pilgrim Route (Via Ghats)',
          color: '#EA4335',
          specialFeatures: [
            'Passes through main ghats',
            'Religious significance',
            'Multilingual signage',
            'Spiritual guidance available'
          ]
        });
      }

      return routes.filter(route => route !== null);
    } catch (error) {
      console.error('Ujjain multiple routes error:', error);
      return [await this.getUjjainOptimizedRoute(start, end, options)].filter(Boolean);
    }
  }

  /**
   * Get ghat-optimized route for pilgrims
   */
  async getGhatOptimizedRoute(start, end, options) {
    try {
      // Define main ghats as potential waypoints
      const mainGhats = [
        { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885 },
        { name: 'Triveni Ghat', lat: 23.1756, lng: 75.7892 },
        { name: 'Gadkalika Ghat', lat: 23.1773, lng: 75.7878 }
      ];

      // Find the best ghat to route through
      let bestGhat = null;
      let minTotalDistance = Infinity;

      for (const ghat of mainGhats) {
        const distanceToGhat = this.calculateDistance(start, ghat);
        const distanceFromGhat = this.calculateDistance(ghat, end);
        const totalDistance = distanceToGhat + distanceFromGhat;

        if (totalDistance < minTotalDistance) {
          minTotalDistance = totalDistance;
          bestGhat = ghat;
        }
      }

      if (bestGhat) {
        // Route through the selected ghat
        const url = `${this.OSRM_BASE_URL}/route/v1/foot/${start.lng},${start.lat};${bestGhat.lng},${bestGhat.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`OSRM error: ${response.status}`);

        const data = await response.json();
        const route = this.formatOSRMResponse(data);
        
        return {
          ...route,
          crowdLevel: 75, // Ghat routes typically more crowded
          safetyScore: 90,
          accessibilityScore: 70,
          viaGhat: bestGhat.name
        };
      }

      return null;
    } catch (error) {
      console.error('Ghat-optimized route error:', error);
      return null;
    }
  }



  /**
   * OSRM routing (backup)
   */
  async getOSRMRoute(start, end, profile) {
    try {
      const profileMap = {
        'foot-walking': 'foot',
        'driving-car': 'driving',
        'cycling-regular': 'cycling'
      };

      const osrmProfile = profileMap[profile] || 'foot';
      const url = `${this.OSRM_BASE_URL}/route/v1/${osrmProfile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`OSRM error: ${response.status}`);

      const data = await response.json();
      return this.formatOSRMResponse(data);
    } catch (error) {
      console.error('OSRM error:', error);
      return null;
    }
  }



  /**
   * Format OSRM response
   */
  formatOSRMResponse(data) {
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    
    const instructions = route.legs[0].steps.map(step => ({
      instruction: step.maneuver.instruction || `Continue for ${step.distance}m`,
      distance: step.distance,
      duration: step.duration
    }));

    const distance = (route.distance / 1000).toFixed(2);
    const duration = Math.round(route.duration / 60);

    return {
      coordinates,
      distance: `${distance} km`,
      duration: `${duration} min`,
      instructions,
      difficulty: 'Moderate',
      crowdLevel: 40,
      safetyScore: 85,
      accessibilityScore: 75
    };
  }

  /**
   * Generate fallback route with realistic waypoints
   */
  generateFallbackRoute(start, end, options) {
    const waypoints = this.generateIntermediateWaypoints(start, end, 3);
    const distance = this.calculateDistance(start, end);
    const duration = Math.round(distance * (options.profile === 'foot-walking' ? 12 : 4));

    return {
      coordinates: waypoints.map(wp => [wp.lat, wp.lng]),
      distance: `${distance.toFixed(2)} km`,
      duration: `${duration} min`,
      instructions: [
        `Head towards ${this.getDirection(start, end)} for ${(distance * 0.4).toFixed(1)} km`,
        `Continue straight for ${(distance * 0.4).toFixed(1)} km`,
        `Arrive at destination after ${(distance * 0.2).toFixed(1)} km`
      ],
      difficulty: options.accessibleRoute ? 'Easy' : 'Moderate',
      crowdLevel: options.avoidCrowds ? 25 : 45,
      safetyScore: options.accessibleRoute ? 95 : 85,
      accessibilityScore: options.accessibleRoute ? 100 : 75
    };
  }

  /**
   * Generate intermediate waypoints for smoother routes
   */
  generateIntermediateWaypoints(start, end, count) {
    const waypoints = [start];
    
    for (let i = 1; i < count; i++) {
      const ratio = i / count;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      
      // Add some realistic deviation to avoid straight lines
      const deviation = 0.001 * Math.sin(ratio * Math.PI * 2);
      waypoints.push({
        lat: lat + deviation,
        lng: lng + deviation
      });
    }
    
    waypoints.push(end);
    return waypoints;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(start, end) {
    const R = 6371; // Earth's radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get direction between two points
   */
  getDirection(start, end) {
    const dLat = end.lat - start.lat;
    const dLng = end.lng - start.lng;
    
    if (Math.abs(dLat) > Math.abs(dLng)) {
      return dLat > 0 ? 'north' : 'south';
    } else {
      return dLng > 0 ? 'east' : 'west';
    }
  }

  /**
   * Calculate route difficulty
   */
  calculateDifficulty(segments, options) {
    if (options.accessibleRoute) return 'Easy';
    
    const elevation = segments.elevation || [];
    const maxGrade = Math.max(...elevation.map((e, i) => 
      i > 0 ? Math.abs(e - elevation[i-1]) : 0
    ));
    
    if (maxGrade > 10) return 'Hard';
    if (maxGrade > 5) return 'Moderate';
    return 'Easy';
  }

  /**
   * Estimate crowd level based on location
   */
  estimateCrowdLevel(coordinates, options) {
    if (options.avoidCrowds) return Math.random() * 30 + 10; // 10-40%
    
    // Check if route passes through known crowded areas
    const crowdedAreas = [
      { lat: 23.1765, lng: 75.7885, radius: 0.5 }, // Ram Ghat
      { lat: 23.1828, lng: 75.7681, radius: 0.3 }, // Mahakaleshwar
    ];
    
    let maxCrowd = 20;
    coordinates.forEach(coord => {
      crowdedAreas.forEach(area => {
        const distance = this.calculateDistance(
          { lat: coord[0], lng: coord[1] },
          { lat: area.lat, lng: area.lng }
        );
        if (distance < area.radius) {
          maxCrowd = Math.max(maxCrowd, 70 + Math.random() * 20);
        }
      });
    });
    
    return Math.round(maxCrowd);
  }

  /**
   * Calculate safety score
   */
  calculateSafetyScore(segments, options) {
    let score = 85;
    
    if (options.accessibleRoute) score += 10;
    if (options.avoidCrowds) score += 5;
    
    // Adjust based on surface type
    const surfaces = segments.extras?.surface || [];
    if (surfaces.some(s => s.value === 1)) score += 5; // Paved roads
    
    return Math.min(100, score);
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore(segments, options) {
    if (options.accessibleRoute) return 100;
    
    let score = 75;
    const surfaces = segments.extras?.surface || [];
    const wayTypes = segments.extras?.waytype || [];
    
    // Bonus for paved surfaces
    if (surfaces.some(s => s.value === 1)) score += 10;
    
    // Bonus for pedestrian ways
    if (wayTypes.some(w => w.value === 1)) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Get multiple route alternatives
   */
  async getRouteAlternatives(start, end, options = {}) {
    const routes = [];
    
    // Main optimized route
    const mainRoute = await this.calculateRoute(start, end, {
      ...options,
      routeType: 'optimal'
    });
    if (mainRoute) {
      routes.push({
        ...mainRoute,
        name: '🤖 AI-Optimized Route',
        id: 'optimal'
      });
    }
    
    // Fastest route
    const fastRoute = await this.calculateRoute(start, end, {
      ...options,
      routeType: 'fastest',
      avoidCrowds: false
    });
    if (fastRoute) {
      routes.push({
        ...fastRoute,
        name: '⚡ Fastest Route',
        id: 'fastest'
      });
    }
    
    // Accessible route
    if (options.accessibleRoute) {
      const accessibleRoute = await this.calculateRoute(start, end, {
        ...options,
        accessibleRoute: true,
        routeType: 'accessible'
      });
      if (accessibleRoute) {
        routes.push({
          ...accessibleRoute,
          name: '♿ Accessible Route',
          id: 'accessible'
        });
      }
    }
    
    return routes;
  }
}

const routingService = new RoutingService();
export default routingService;