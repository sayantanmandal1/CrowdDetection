/**
 * Enhanced Location Search Service for Madhya Pradesh
 * Uses multiple APIs for comprehensive location search
 */

class LocationSearchService {
  constructor() {
    // Nominatim (OpenStreetMap) - Free and comprehensive for India
    this.NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
    
    // MapBox Geocoding API (backup)
    this.MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    this.MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    
    // Madhya Pradesh bounds for filtering results
    this.MP_BOUNDS = {
      north: 26.87,
      south: 21.08,
      east: 82.75,
      west: 74.02
    };
    
    // Major cities and landmarks in Madhya Pradesh
    this.MP_MAJOR_PLACES = [
      // Major Cities
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'city' },
      { name: 'Indore', lat: 22.7196, lng: 75.8577, type: 'city' },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828, type: 'city' },
      { name: 'Jabalpur', lat: 23.1815, lng: 79.9864, type: 'city' },
      { name: 'Ujjain', lat: 23.1765, lng: 75.7885, type: 'city' },
      { name: 'Sagar', lat: 23.8388, lng: 78.7378, type: 'city' },
      { name: 'Dewas', lat: 22.9676, lng: 76.0534, type: 'city' },
      { name: 'Satna', lat: 24.5667, lng: 80.8167, type: 'city' },
      { name: 'Ratlam', lat: 23.3315, lng: 75.0367, type: 'city' },
      { name: 'Rewa', lat: 24.5364, lng: 81.2961, type: 'city' },
      { name: 'Murwara', lat: 23.8388, lng: 80.3931, type: 'city' },
      { name: 'Singrauli', lat: 24.1997, lng: 82.6739, type: 'city' },
      { name: 'Burhanpur', lat: 21.3009, lng: 76.2291, type: 'city' },
      { name: 'Khandwa', lat: 21.8245, lng: 76.3502, type: 'city' },
      { name: 'Bhind', lat: 26.5653, lng: 78.7875, type: 'city' },
      { name: 'Chhindwara', lat: 22.0572, lng: 78.9315, type: 'city' },
      { name: 'Guna', lat: 24.6469, lng: 77.3178, type: 'city' },
      { name: 'Shivpuri', lat: 25.4231, lng: 77.6581, type: 'city' },
      { name: 'Vidisha', lat: 23.5251, lng: 77.8081, type: 'city' },
      { name: 'Chhatarpur', lat: 24.9180, lng: 79.5941, type: 'city' },
      
      // Religious Places
      { name: 'Mahakaleshwar Temple, Ujjain', lat: 23.1828, lng: 75.7681, type: 'temple' },
      { name: 'Khajuraho Temples', lat: 24.8318, lng: 79.9199, type: 'temple' },
      { name: 'Omkareshwar', lat: 22.2394, lng: 76.1461, type: 'temple' },
      { name: 'Maheshwar', lat: 22.1761, lng: 75.5897, type: 'temple' },
      { name: 'Chitrakoot', lat: 25.2009, lng: 80.8322, type: 'temple' },
      { name: 'Amarkantak', lat: 22.6722, lng: 81.7561, type: 'temple' },
      { name: 'Orchha', lat: 25.3519, lng: 78.6420, type: 'heritage' },
      { name: 'Sanchi Stupa', lat: 23.4793, lng: 77.7398, type: 'heritage' },
      
      // Tourist Places
      { name: 'Pachmarhi', lat: 22.4676, lng: 78.4336, type: 'hill_station' },
      { name: 'Bandhavgarh National Park', lat: 23.7019, lng: 81.0169, type: 'wildlife' },
      { name: 'Kanha National Park', lat: 22.2734, lng: 80.6103, type: 'wildlife' },
      { name: 'Pench National Park', lat: 21.7679, lng: 79.2961, type: 'wildlife' },
      { name: 'Marble Rocks, Bhedaghat', lat: 23.1367, lng: 79.9667, type: 'natural' },
      
      // Educational Institutions
      { name: 'IIT Indore', lat: 22.6708, lng: 75.9061, type: 'education' },
      { name: 'IIM Indore', lat: 22.6953, lng: 75.8561, type: 'education' },
      { name: 'MANIT Bhopal', lat: 23.2156, lng: 77.4739, type: 'education' },
      { name: 'Barkatullah University, Bhopal', lat: 23.2156, lng: 77.4739, type: 'education' },
      
      // Airports
      { name: 'Raja Bhoj Airport, Bhopal', lat: 23.2875, lng: 77.3374, type: 'airport' },
      { name: 'Devi Ahilya Bai Holkar Airport, Indore', lat: 22.7279, lng: 75.8011, type: 'airport' },
      { name: 'Gwalior Airport', lat: 26.2930, lng: 78.2278, type: 'airport' },
      { name: 'Jabalpur Airport', lat: 23.1778, lng: 80.0524, type: 'airport' },
      
      // Railway Stations
      { name: 'Bhopal Junction', lat: 23.2627, lng: 77.4032, type: 'railway' },
      { name: 'Indore Junction', lat: 22.7179, lng: 75.8333, type: 'railway' },
      { name: 'Gwalior Junction', lat: 26.2124, lng: 78.1772, type: 'railway' },
      { name: 'Jabalpur Junction', lat: 23.1685, lng: 79.9338, type: 'railway' },
      { name: 'Ujjain Junction', lat: 23.1906, lng: 75.7804, type: 'railway' }
    ];
  }

  /**
   * Search for locations in Madhya Pradesh - Google Maps style
   */
  async searchLocations(query, options = {}) {
    const { limit = 10 } = options;
    
    if (!query || query.length < 1) {
      return this.getPopularPlaces(limit);
    }

    try {
      // Always search local database first (more reliable)
      const localResults = this.searchLocalDatabase(query, limit * 2);
      
      // If we have good local results, return them
      if (localResults.length >= 3) {
        return localResults.slice(0, limit);
      }
      
      // Try Nominatim API for additional results
      const nominatimResults = await this.searchNominatim(query, limit);
      
      // Combine all results
      const combinedResults = this.combineAndDeduplicateResults(localResults, nominatimResults);
      const mpResults = this.filterToMadhyaPradesh(combinedResults);
      const sortedResults = this.sortByRelevance(mpResults, query);
      
      return sortedResults.slice(0, limit);
    } catch (error) {
      console.error('Location search error:', error);
      // Always return local results as fallback
      return this.searchLocalDatabase(query, limit);
    }
  }

  /**
   * Search local database of MP places - Enhanced fuzzy search
   */
  searchLocalDatabase(query, limit) {
    const queryLower = query.toLowerCase().trim();
    
    // If query is empty, return popular places
    if (!queryLower) {
      return this.getPopularPlaces(limit);
    }
    
    // Enhanced search with multiple matching strategies
    const results = this.MP_MAJOR_PLACES
      .map(place => {
        const nameLower = place.name.toLowerCase();
        let score = 0;
        
        // Exact match gets highest score
        if (nameLower === queryLower) score += 100;
        
        // Starts with query gets high score
        if (nameLower.startsWith(queryLower)) score += 50;
        
        // Contains query gets medium score
        if (nameLower.includes(queryLower)) score += 25;
        
        // Word boundary matches get bonus
        const words = queryLower.split(' ');
        words.forEach(word => {
          if (word.length > 2 && nameLower.includes(word)) {
            score += 10;
          }
        });
        
        // Type matching
        if (place.type.toLowerCase().includes(queryLower)) score += 15;
        
        // District matching
        const district = this.getDistrictFromName(place.name).toLowerCase();
        if (district.includes(queryLower)) score += 20;
        
        return { ...place, score };
      })
      .filter(place => place.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(place => ({
        name: place.name,
        displayName: `${place.name}, Madhya Pradesh, India`,
        fullName: `${place.name}, Madhya Pradesh, India`,
        district: this.getDistrictFromName(place.name),
        lat: place.lat,
        lng: place.lng,
        type: place.type,
        importance: this.getPlaceImportance(place.type),
        source: 'local'
      }));
    
    return results;
  }

  /**
   * Search using Nominatim API
   */
  async searchNominatim(query, limit) {
    try {
      const params = new URLSearchParams({
        q: `${query}, Madhya Pradesh, India`,
        format: 'json',
        limit: limit,
        countrycodes: 'in',
        addressdetails: 1,
        extratags: 1,
        namedetails: 1,
        bounded: 1,
        viewbox: `${this.MP_BOUNDS.west},${this.MP_BOUNDS.south},${this.MP_BOUNDS.east},${this.MP_BOUNDS.north}`
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': 'CrowdDetectionApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.map(item => ({
        name: item.name || item.display_name.split(',')[0],
        displayName: item.display_name,
        fullName: item.display_name,
        district: item.address?.state_district || item.address?.county || 'Unknown',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: this.categorizePlace(item),
        importance: parseFloat(item.importance || 0.5),
        address: item.address,
        source: 'nominatim'
      }));
    } catch (error) {
      console.error('Nominatim search error:', error);
      return [];
    }
  }

  /**
   * Get reverse geocoding (coordinates to address)
   */
  async reverseGeocode(lat, lng) {
    try {
      const params = new URLSearchParams({
        lat: lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
        zoom: 18
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/reverse?${params}`, {
        headers: {
          'User-Agent': 'CrowdDetectionApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        name: data.name || data.display_name.split(',')[0],
        display_name: data.display_name,
        address: data.address,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon)
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        name: 'Unknown Location',
        display_name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat: lat,
        lng: lng
      };
    }
  }

  /**
   * Get popular places for empty search
   */
  getPopularPlaces(limit) {
    return this.MP_MAJOR_PLACES
      .sort((a, b) => this.getPlaceImportance(b.type) - this.getPlaceImportance(a.type))
      .slice(0, limit)
      .map(place => ({
        name: place.name,
        displayName: `${place.name}, Madhya Pradesh, India`,
        fullName: `${place.name}, Madhya Pradesh, India`,
        district: this.getDistrictFromName(place.name),
        lat: place.lat,
        lng: place.lng,
        type: place.type,
        importance: this.getPlaceImportance(place.type),
        source: 'local'
      }));
  }

  /**
   * Categorize place based on OSM data
   */
  categorizePlace(osmItem) {
    const category = osmItem.category;
    const type = osmItem.type;

    if (category === 'place') {
      if (['city', 'town'].includes(type)) return 'city';
      if (['village', 'hamlet'].includes(type)) return 'village';
    }
    
    if (category === 'amenity') {
      if (['place_of_worship', 'temple', 'mosque', 'church'].includes(type)) return 'temple';
      if (['hospital', 'clinic'].includes(type)) return 'hospital';
      if (['school', 'college', 'university'].includes(type)) return 'education';
      if (['restaurant', 'cafe', 'food_court'].includes(type)) return 'food';
    }
    
    if (category === 'tourism') {
      if (['attraction', 'museum', 'monument'].includes(type)) return 'tourist';
    }
    
    if (category === 'transport') {
      if (type === 'airport') return 'airport';
      if (['station', 'railway'].includes(type)) return 'railway';
    }
    
    if (category === 'natural') return 'natural';
    if (category === 'historic') return 'heritage';
    
    return 'general';
  }

  /**
   * Get district name from place name
   */
  getDistrictFromName(placeName) {
    const districtMap = {
      'Bhopal': 'Bhopal',
      'Indore': 'Indore',
      'Gwalior': 'Gwalior',
      'Jabalpur': 'Jabalpur',
      'Ujjain': 'Ujjain',
      'Sagar': 'Sagar',
      'Dewas': 'Dewas',
      'Satna': 'Satna',
      'Ratlam': 'Ratlam',
      'Rewa': 'Rewa',
      'Murwara': 'Katni',
      'Singrauli': 'Singrauli',
      'Burhanpur': 'Burhanpur',
      'Khandwa': 'Khandwa',
      'Bhind': 'Bhind',
      'Chhindwara': 'Chhindwara',
      'Guna': 'Guna',
      'Shivpuri': 'Shivpuri',
      'Vidisha': 'Vidisha',
      'Chhatarpur': 'Chhatarpur',
      'Khajuraho': 'Chhatarpur',
      'Omkareshwar': 'Khandwa',
      'Maheshwar': 'Khargone',
      'Chitrakoot': 'Satna',
      'Amarkantak': 'Anuppur',
      'Orchha': 'Tikamgarh',
      'Sanchi': 'Raisen',
      'Pachmarhi': 'Hoshangabad',
      'Bandhavgarh': 'Umaria',
      'Kanha': 'Mandla',
      'Pench': 'Seoni',
      'Bhedaghat': 'Jabalpur'
    };
    
    // Check if place name contains any district name
    for (const [place, district] of Object.entries(districtMap)) {
      if (placeName.toLowerCase().includes(place.toLowerCase())) {
        return district;
      }
    }
    
    return 'Madhya Pradesh';
  }

  /**
   * Get place importance score
   */
  getPlaceImportance(type) {
    const importance = {
      'city': 1.0,
      'temple': 0.9,
      'heritage': 0.8,
      'airport': 0.8,
      'railway': 0.7,
      'education': 0.7,
      'tourist': 0.6,
      'hospital': 0.6,
      'hill_station': 0.6,
      'wildlife': 0.5,
      'natural': 0.5,
      'village': 0.4,
      'food': 0.3,
      'general': 0.2
    };
    
    return importance[type] || 0.2;
  }

  /**
   * Filter results to Madhya Pradesh bounds
   */
  filterToMadhyaPradesh(results) {
    return results.filter(result => 
      result.lat >= this.MP_BOUNDS.south &&
      result.lat <= this.MP_BOUNDS.north &&
      result.lng >= this.MP_BOUNDS.west &&
      result.lng <= this.MP_BOUNDS.east
    );
  }

  /**
   * Combine and deduplicate results
   */
  combineAndDeduplicateResults(localResults, apiResults) {
    const combined = [...localResults, ...apiResults];
    const seen = new Set();
    
    return combined.filter(result => {
      const key = `${result.name.toLowerCase()}_${result.lat.toFixed(3)}_${result.lng.toFixed(3)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort results by relevance to query
   */
  sortByRelevance(results, query) {
    const queryLower = query.toLowerCase();
    
    return results.sort((a, b) => {
      // Exact name match gets highest priority
      const aExact = a.name.toLowerCase() === queryLower ? 2 : 0;
      const bExact = b.name.toLowerCase() === queryLower ? 2 : 0;
      
      // Name starts with query gets second priority
      const aStarts = a.name.toLowerCase().startsWith(queryLower) ? 1 : 0;
      const bStarts = b.name.toLowerCase().startsWith(queryLower) ? 1 : 0;
      
      // Combine with importance score
      const aScore = aExact + aStarts + a.importance;
      const bScore = bExact + bStarts + b.importance;
      
      return bScore - aScore;
    });
  }

  /**
   * Get nearby places
   */
  async getNearbyPlaces(lat, lng, radius = 10, types = []) {
    const nearbyPlaces = this.MP_MAJOR_PLACES.filter(place => {
      const distance = this.calculateDistance(
        { lat, lng },
        { lat: place.lat, lng: place.lng }
      );
      
      const typeMatch = types.length === 0 || types.includes(place.type);
      return distance <= radius && typeMatch;
    });

    return nearbyPlaces
      .map(place => ({
        ...place,
        distance: this.calculateDistance(
          { lat, lng },
          { lat: place.lat, lng: place.lng }
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Get current location with MP fallback
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            // Check if location is in Madhya Pradesh
            if (this.isInMadhyaPradesh(latitude, longitude)) {
              resolve({
                lat: latitude,
                lng: longitude,
                accuracy: accuracy,
                name: 'Current Location',
                inMP: true
              });
            } else {
              // Default to Ujjain if outside MP
              resolve(this.getDefaultUjjainLocation());
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
            resolve(this.getDefaultUjjainLocation());
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      } else {
        resolve(this.getDefaultUjjainLocation());
      }
    });
  }

  /**
   * Check if coordinates are in Madhya Pradesh
   */
  isInMadhyaPradesh(lat, lng) {
    return lat >= this.MP_BOUNDS.south &&
           lat <= this.MP_BOUNDS.north &&
           lng >= this.MP_BOUNDS.west &&
           lng <= this.MP_BOUNDS.east;
  }

  /**
   * Get default Ujjain location
   */
  getDefaultUjjainLocation() {
    return {
      lat: 23.1765,
      lng: 75.7885,
      accuracy: 10,
      name: 'Ujjain, Madhya Pradesh',
      inMP: true,
      isDefault: true
    };
  }

  /**
   * Get random location in Ujjain for default
   */
  getRandomUjjainLocation() {
    const ujjainLocations = [
      { name: 'Mahakaleshwar Temple', lat: 23.1828, lng: 75.7681 },
      { name: 'Ram Ghat', lat: 23.1765, lng: 75.7885 },
      { name: 'Ujjain Junction', lat: 23.1906, lng: 75.7837 },
      { name: 'Vikram University', lat: 23.1815, lng: 75.7849 },
      { name: 'Kaliadeh Palace', lat: 23.1654, lng: 75.7842 },
      { name: 'Chintaman Ganesh Temple', lat: 23.1889, lng: 75.7654 },
      { name: 'Sandipani Ashram', lat: 23.1723, lng: 75.7923 },
      { name: 'Harsiddhi Temple', lat: 23.1798, lng: 75.7698 },
      { name: 'Mangalnath Temple', lat: 23.1567, lng: 75.7823 },
      { name: 'Kal Bhairav Temple', lat: 23.1889, lng: 75.7794 }
    ];
    
    const randomLocation = ujjainLocations[Math.floor(Math.random() * ujjainLocations.length)];
    
    // Add small random offset to make it more realistic
    return {
      lat: randomLocation.lat + (Math.random() - 0.5) * 0.005,
      lng: randomLocation.lng + (Math.random() - 0.5) * 0.005,
      name: randomLocation.name,
      accuracy: 10,
      isGPS: false,
      inMP: true
    };
  }
}

const locationSearchService = new LocationSearchService();
export default locationSearchService;