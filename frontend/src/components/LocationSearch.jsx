import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Clock, Star } from 'lucide-react';
import LocationSearchService from '../utils/LocationSearchService';

const LocationSearch = ({ 
  placeholder = "Search locations in Madhya Pradesh...", 
  onLocationSelect, 
  currentLocation,
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popularLocations, setPopularLocations] = useState([]);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    // Load popular destinations on mount
    const loadPopularLocations = async () => {
      const popular = await LocationSearchService.searchLocations('', { limit: 15 });
      setPopularLocations(popular);
    };
    loadPopularLocations();
  }, []);

  useEffect(() => {
    // Handle search with debouncing
    const timeoutId = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await LocationSearchService.searchLocations(query, { 
            limit: 15, 
            nearLocation: currentLocation 
          });
          setResults(searchResults);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        }
        setIsLoading(false);
      } else if (query.length === 0) {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, currentLocation]);

  useEffect(() => {
    // Handle clicks outside to close dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    setQuery(location.displayName);
    setIsOpen(false);
    if (onLocationSelect) {
      onLocationSelect({
        lat: location.lat,
        lng: location.lng,
        name: location.displayName,
        fullName: location.fullName,
        type: location.type,
        district: location.district
      });
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = LocationSearchService.getRandomUjjainLocation();
      handleLocationSelect({
        ...location,
        displayName: location.name,
        fullName: location.name
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
    setIsLoading(false);
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'temple': return '🛕';
      case 'tourist': return '🏛️';
      case 'transport': return '🚉';
      case 'airport': return '✈️';
      case 'hospital': return '🏥';
      case 'education': return '🎓';
      case 'park': return '🌳';
      case 'ghat': return '🏞️';
      default: return '📍';
    }
  };

  const getLocationDistance = (location) => {
    if (currentLocation) {
      const distance = LocationSearchService.calculateDistance(
        currentLocation.lat, 
        currentLocation.lng, 
        location.lat, 
        location.lng
      );
      return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
    }
    return null;
  };

  return (
    <div className={`location-search ${className}`} ref={searchRef}>
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.length === 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="search-input"
        />
        <button
          onClick={handleCurrentLocation}
          className="current-location-btn"
          title="Use current location"
          disabled={isLoading}
        >
          <Navigation size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="search-results" ref={resultsRef}>
          {isLoading && (
            <div className="loading-item">
              <div className="loading-spinner"></div>
              <span>Searching locations...</span>
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="no-results">
              <MapPin size={20} />
              <span>No locations found for "{query}"</span>
              <small>Try searching for cities, temples, or tourist places in Madhya Pradesh</small>
            </div>
          )}

          {!isLoading && query.length >= 2 && results.length > 0 && (
            <>
              <div className="results-header">
                <span>Search Results</span>
              </div>
              {results.map((location, index) => (
                <div
                  key={`${location.name}-${index}`}
                  className="search-result-item"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="location-icon">
                    {getLocationIcon(location.type)}
                  </div>
                  <div className="location-info">
                    <div className="location-name">{location.name}</div>
                    <div className="location-details">
                      <span className="location-district">{location.district}, MP</span>
                      <span className="location-type">{location.type}</span>
                      {getLocationDistance(location) && (
                        <span className="location-distance">
                          <Clock size={12} />
                          {getLocationDistance(location)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!isLoading && query.length === 0 && (
            <>
              <div className="results-header">
                <Star size={16} />
                <span>Popular Destinations</span>
              </div>
              {popularLocations.slice(0, 10).map((location, index) => (
                <div
                  key={`popular-${location.name}-${index}`}
                  className="search-result-item popular"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="location-icon">
                    {getLocationIcon(location.type)}
                  </div>
                  <div className="location-info">
                    <div className="location-name">{location.name}</div>
                    <div className="location-details">
                      <span className="location-district">{location.district}, MP</span>
                      <span className="location-type">{location.type}</span>
                      {getLocationDistance(location) && (
                        <span className="location-distance">
                          <Clock size={12} />
                          {getLocationDistance(location)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .location-search {
          position: relative;
          width: 100%;
          max-width: 400px;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 0;
          transition: all 0.2s ease;
        }

        .search-input-container:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #6b7280;
          z-index: 1;
        }

        .search-input {
          flex: 1;
          padding: 12px 50px 12px 45px;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
          border-radius: 12px;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .current-location-btn {
          position: absolute;
          right: 8px;
          padding: 8px;
          border: none;
          background: #667eea;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .current-location-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .current-location-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 4px;
        }

        .results-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e1e5e9;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          position: sticky;
          top: 0;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }

        .search-result-item:hover {
          background: #f8fafc;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item.popular {
          background: linear-gradient(135deg, #fef7cd, #fef3c7);
        }

        .search-result-item.popular:hover {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
        }

        .location-icon {
          font-size: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 8px;
        }

        .location-info {
          flex: 1;
          min-width: 0;
        }

        .location-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .location-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
        }

        .location-district {
          font-weight: 500;
        }

        .location-type {
          background: #e5e7eb;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .location-distance {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #059669;
          font-weight: 500;
        }

        .loading-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 16px;
          text-align: center;
          color: #6b7280;
        }

        .no-results small {
          font-size: 12px;
          color: #9ca3af;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .location-search {
            max-width: 100%;
          }

          .search-results {
            max-height: 300px;
          }

          .location-details {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationSearch;