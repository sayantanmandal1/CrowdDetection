import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import locationService from '../utils/LocationService';
import notificationManager from '../utils/NotificationManager';

const RouteCalculator = ({ 
  map, 
  startLocation, 
  endLocation, 
  onRouteCalculated, 
  routingProfile = 'driving' 
}) => {
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !startLocation || !endLocation) return;

    const calculateRoute = async () => {
      try {
        // Remove existing routing control
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }

        // Show loading notification
        notificationManager.show(
          'route-calculating',
          "🔄 Calculating optimal route...", 
          { type: 'info', autoClose: 2000 }
        );

        // Try to get route using OSRM API first
        const routeData = await locationService.getRoute(
          { lat: startLocation.lat, lng: startLocation.lng },
          { lat: endLocation.lat, lng: endLocation.lng },
          routingProfile
        );

        if (routeData.success && routeData.coordinates) {
          // Use the real route coordinates
          if (onRouteCalculated) {
            onRouteCalculated({
              coordinates: routeData.coordinates,
              distance: routeData.distance,
              duration: routeData.duration,
              instructions: routeData.instructions,
              isRealRoute: true
            });
          }

          notificationManager.show(
            'route-calculated',
            `✅ Route calculated: ${routeData.distance}km, ${routeData.duration}min`, 
            { type: 'success', autoClose: 3000 }
          );
        } else {
          // Fallback to Leaflet Routing Machine
          const routingControl = L.Routing.control({
            waypoints: [
              L.latLng(startLocation.lat, startLocation.lng),
              L.latLng(endLocation.lat, endLocation.lng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: () => null, // Don't create default markers
            lineOptions: {
              styles: [
                { color: '#4285f4', weight: 6, opacity: 0.8 }
              ]
            },
            router: L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: routingProfile === 'walking' ? 'foot' : 'driving'
            }),
            formatter: new L.Routing.Formatter({
              language: 'en',
              units: 'metric'
            })
          });

          routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
              const route = routes[0];
              const coordinates = route.coordinates.map(coord => [coord.lat, coord.lng]);
              
              if (onRouteCalculated) {
                onRouteCalculated({
                  coordinates: coordinates,
                  distance: (route.summary.totalDistance / 1000).toFixed(2),
                  duration: Math.round(route.summary.totalTime / 60),
                  instructions: route.instructions?.map(inst => ({
                    instruction: inst.text,
                    distance: inst.distance,
                    duration: inst.time
                  })) || [],
                  isRealRoute: true
                });
              }

              notificationManager.show(
                'route-calculated-fallback',
                `✅ Route found: ${(route.summary.totalDistance / 1000).toFixed(2)}km`, 
                { type: 'success', autoClose: 3000 }
              );
            }
          });

          routingControl.on('routingerror', (e) => {
            console.error('Routing error:', e);
            
            // Final fallback to straight line
            const straightDistance = locationService.calculateDistance(
              startLocation.lat, startLocation.lng,
              endLocation.lat, endLocation.lng
            );
            
            const estimatedRoadDistance = straightDistance * 1.4; // Estimate road distance
            
            if (onRouteCalculated) {
              onRouteCalculated({
                coordinates: [[startLocation.lat, startLocation.lng], [endLocation.lat, endLocation.lng]],
                distance: estimatedRoadDistance.toFixed(2),
                duration: Math.round(estimatedRoadDistance * (routingProfile === 'walking' ? 12 : 2)),
                instructions: [
                  { instruction: `Head towards ${endLocation.name || 'destination'}`, distance: estimatedRoadDistance * 1000, duration: 0 }
                ],
                isRealRoute: false,
                isFallback: true
              });
            }

            notificationManager.show(
              'route-fallback',
              "⚠️ Using estimated route - road data unavailable", 
              { type: 'warning', autoClose: 4000 }
            );
          });

          // Add to map
          routingControl.addTo(map);
          routingControlRef.current = routingControl;
        }

      } catch (error) {
        console.error('Route calculation error:', error);
        
        // Final fallback to straight line
        const straightDistance = locationService.calculateDistance(
          startLocation.lat, startLocation.lng,
          endLocation.lat, endLocation.lng
        );
        
        const estimatedRoadDistance = straightDistance * 1.4;
        
        if (onRouteCalculated) {
          onRouteCalculated({
            coordinates: [[startLocation.lat, startLocation.lng], [endLocation.lat, endLocation.lng]],
            distance: estimatedRoadDistance.toFixed(2),
            duration: Math.round(estimatedRoadDistance * (routingProfile === 'walking' ? 12 : 2)),
            instructions: [
              { instruction: `Head towards ${endLocation.name || 'destination'}`, distance: estimatedRoadDistance * 1000, duration: 0 }
            ],
            isRealRoute: false,
            isFallback: true
          });
        }

        notificationManager.show(
          'route-error',
          "⚠️ Route calculation failed - using estimated path", 
          { type: 'warning', autoClose: 4000 }
        );
      }
    };

    calculateRoute();

    // Cleanup function
    return () => {
      if (routingControlRef.current && map) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn('Error removing routing control:', e);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, startLocation, endLocation, routingProfile, onRouteCalculated]);

  return null; // This component doesn't render anything visible
};

export default RouteCalculator;