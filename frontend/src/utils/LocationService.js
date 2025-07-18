/**
 * Enhanced Location Service for Madhya Pradesh
 * Ensures all locations default to MP with Ujjain as fallback
 */

import LocationSearchService from './LocationSearchService';

class LocationService {
  constructor() {
    // Madhya Pradesh bounds
    this.MP_BOUNDS = {
      north: 26.87,
      south: 21.08,
      east: 82.75,
      west: 74.02
    };

    // Default location in Ujjain
    this.DEFAULT_LOCATION = {
      lat: 23.1765,
      lng: 75.7885,
      accuracy: 10,
      name: "Ujjain, Madhya Pradesh",
      isGPS: false,
      inMP: true,
      isDefault: true
    };
  }

  /**
   * Get current location with MP bounds checking
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            // Check if location is within Madhya Pradesh
            if (this.isInMadhyaPradesh(latitude, longitude)) {
              resolve({
                lat: latitude,
                lng: longitude,
                accuracy: accuracy,
                name: "Current Location in Madhya Pradesh",
                isGPS: true,
                inMP: true,
                isDefault: false
              });
            } else {
              // Outside MP - use Ujjain default
              resolve({
                ...this.DEFAULT_LOCATION,
                name: "Ujjain (Outside MP - Default Location)"
              });
            }
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Always fallback to Ujjain on error
            resolve(this.DEFAULT_LOCATION);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      } else {
        // No geolocation support - use Ujjain
        resolve({
          ...this.DEFAULT_LOCATION,
          name: "Ujjain (No Geolocation Support)"
        });
      }
    });
  }

  /**
   * Check if coordinates are within Madhya Pradesh
   */
  isInMadhyaPradesh(lat, lng) {
    return lat >= this.MP_BOUNDS.south &&
      lat <= this.MP_BOUNDS.north &&
      lng >= this.MP_BOUNDS.west &&
      lng <= this.MP_BOUNDS.east;
  }

  /**
   * Get location by name with MP filtering
   */
  async getLocationByName(locationName) {
    try {
      const results = await LocationSearchService.searchLocations(locationName, { limit: 1 });

      if (results.length > 0) {
        const location = results[0];
        return {
          lat: location.lat,
          lng: location.lng,
          name: location.display_name,
          type: location.type,
          accuracy: 50,
          isGPS: false,
          inMP: true,
          isDefault: false
        };
      } else {
        // No results found - return Ujjain default
        return {
          ...this.DEFAULT_LOCATION,
          name: `${locationName} (Not Found - Using Ujjain Default)`
        };
      }
    } catch (error) {
      console.error('Location search error:', error);
      return this.DEFAULT_LOCATION;
    }
  }

  /**
   * Get nearby places within MP
   */
  async getNearbyPlaces(lat, lng, radius = 10, types = []) {
    try {
      // Ensure coordinates are in MP
      if (!this.isInMadhyaPradesh(lat, lng)) {
        lat = this.DEFAULT_LOCATION.lat;
        lng = this.DEFAULT_LOCATION.lng;
      }

      return await LocationSearchService.getNearbyPlaces(lat, lng, radius, types);
    } catch (error) {
      console.error('Nearby places error:', error);
      return [];
    }
  }

  /**
   * Reverse geocode with MP bounds
   */
  async reverseGeocode(lat, lng) {
    try {
      // Ensure coordinates are in MP
      if (!this.isInMadhyaPradesh(lat, lng)) {
        return {
          ...this.DEFAULT_LOCATION,
          name: "Outside Madhya Pradesh - Using Ujjain"
        };
      }

      return await LocationSearchService.reverseGeocode(lat, lng);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return this.DEFAULT_LOCATION;
    }
  }

  /**
   * Get popular destinations in MP
   */
  async getPopularDestinations(limit = 20) {
    try {
      return await LocationSearchService.getPopularPlaces(limit);
    } catch (error) {
      console.error('Popular destinations error:', error);
      return this.getFallbackDestinations();
    }
  }

  /**
   * Fallback destinations if API fails
   */
  getFallbackDestinations() {
    return [
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'city' },
      { name: 'Indore', lat: 22.7196, lng: 75.8577, type: 'city' },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828, type: 'city' },
      { name: 'Jabalpur', lat: 23.1815, lng: 79.9864, type: 'city' },
      { name: 'Ujjain', lat: 23.1765, lng: 75.7885, type: 'city' },
      { name: 'Mahakaleshwar Temple', lat: 23.1828, lng: 75.7681, type: 'temple' },
      { name: 'Khajuraho', lat: 24.8318, lng: 79.9199, type: 'heritage' },
      { name: 'Sanchi', lat: 23.4793, lng: 77.7398, type: 'heritage' },
      { name: 'Pachmarhi', lat: 22.4676, lng: 78.4336, type: 'hill_station' },
      { name: 'Omkareshwar', lat: 22.2394, lng: 76.1461, type: 'temple' }
    ];
  }

  /**
   * Validate and correct coordinates to MP bounds
   */
  validateAndCorrectCoordinates(lat, lng) {
    if (this.isInMadhyaPradesh(lat, lng)) {
      return { lat, lng, corrected: false };
    } else {
      return {
        lat: this.DEFAULT_LOCATION.lat,
        lng: this.DEFAULT_LOCATION.lng,
        corrected: true
      };
    }
  }

  /**
   * Get distance between two points
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get MP state info
   */
  getMPInfo() {
    return {
      name: 'Madhya Pradesh',
      capital: 'Bhopal',
      bounds: this.MP_BOUNDS,
      majorCities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
      area: '308,245 km²',
      population: '72.6 million',
      languages: ['Hindi', 'English'],
      timezone: 'IST (UTC+5:30)'
    };
  }
}

const locationService = new LocationService();
export default locationService;