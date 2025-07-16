"""
Advanced Routing Engine for Simhastha 2028
Implements sophisticated algorithms for accurate route calculation
"""

import math
import heapq
import json
import random
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np

@dataclass
class Location:
    """Represents a geographical location"""
    lat: float
    lng: float
    name: str
    type: str = "general"
    capacity: int = 1000
    current_crowd: int = 0
    accessibility_score: float = 1.0
    safety_score: float = 1.0

@dataclass
class RouteSegment:
    """Represents a segment of a route"""
    start: Location
    end: Location
    distance: float
    duration: float
    crowd_factor: float
    safety_factor: float
    accessibility_factor: float
    surface_type: str = "paved"
    width: float = 3.0  # meters
    elevation_gain: float = 0.0

@dataclass
class Route:
    """Represents a complete route"""
    segments: List[RouteSegment]
    total_distance: float
    total_duration: float
    route_type: str
    safety_score: float
    accessibility_score: float
    crowd_level: float
    waypoints: List[Dict]
    instructions: List[str]
    estimated_cost: float = 0.0

class AdvancedRoutingEngine:
    """
    Advanced routing engine with realistic calculations
    """
    
    def __init__(self):
        self.locations = self._initialize_ujjain_locations()
        self.road_network = self._build_road_network()
        self.crowd_data = self._initialize_crowd_data()
        self.weather_conditions = self._get_current_weather()
        
    def _initialize_ujjain_locations(self) -> Dict[str, Location]:
        """Initialize realistic Ujjain locations for Simhastha"""
        locations = {
            "main_ghat": Location(23.1765, 75.7885, "Main Ghat - Ram Ghat", "ghat", 5000, 3200, 0.9, 0.95),
            "mahakal_temple": Location(23.1828, 75.7681, "Mahakaleshwar Temple", "temple", 8000, 5500, 0.8, 0.98),
            "shipra_ghat_1": Location(23.1801, 75.7892, "Shipra Ghat 1", "ghat", 3000, 1800, 0.85, 0.92),
            "shipra_ghat_2": Location(23.1789, 75.7901, "Shipra Ghat 2", "ghat", 3500, 2100, 0.88, 0.94),
            "transport_hub_central": Location(23.1723, 75.7823, "Central Transport Hub", "transport", 2000, 800, 0.95, 0.99),
            "transport_hub_east": Location(23.1856, 75.7934, "East Transport Hub", "transport", 1500, 600, 0.92, 0.97),
            "parking_north": Location(23.1890, 75.7845, "North Parking Complex", "parking", 1000, 400, 0.98, 0.96),
            "parking_south": Location(23.1678, 75.7912, "South Parking Complex", "parking", 1200, 500, 0.97, 0.95),
            "medical_center_1": Location(23.1756, 75.7834, "Primary Medical Center", "medical", 500, 50, 1.0, 1.0),
            "medical_center_2": Location(23.1812, 75.7867, "Emergency Medical Center", "medical", 300, 30, 1.0, 1.0),
            "food_court_1": Location(23.1745, 75.7856, "Main Food Court", "food", 800, 450, 0.9, 0.93),
            "food_court_2": Location(23.1823, 75.7823, "Temple Food Court", "food", 600, 320, 0.88, 0.91),
            "rest_area_families": Location(23.1734, 75.7878, "Family Rest Area", "rest", 400, 180, 0.95, 0.96),
            "information_center": Location(23.1767, 75.7845, "Tourist Information Center", "info", 200, 80, 1.0, 0.98),
            "security_post_1": Location(23.1778, 75.7867, "Security Post Alpha", "security", 100, 20, 1.0, 1.0),
            "security_post_2": Location(23.1798, 75.7889, "Security Post Beta", "security", 100, 25, 1.0, 1.0),
            "vip_area": Location(23.1834, 75.7712, "VIP Accommodation Area", "vip", 500, 200, 0.7, 0.99),
            "media_center": Location(23.1743, 75.7823, "Media & Press Center", "media", 300, 120, 0.9, 0.97),
            "volunteer_base": Location(23.1789, 75.7834, "Volunteer Coordination Base", "volunteer", 200, 80, 0.95, 0.96),
            "emergency_exit_1": Location(23.1712, 75.7834, "Emergency Exit Point 1", "emergency", 1000, 0, 1.0, 1.0),
            "emergency_exit_2": Location(23.1867, 75.7889, "Emergency Exit Point 2", "emergency", 1000, 0, 1.0, 1.0),
        }
        return locations
    
    def _build_road_network(self) -> Dict[str, List[Tuple[str, float, Dict]]]:
        """Build realistic road network with accurate distances and properties"""
        network = {}
        
        # Define road connections with realistic properties
        connections = [
            # Main arterial roads
            ("main_ghat", "mahakal_temple", {"distance": 1.8, "type": "arterial", "width": 8.0, "speed_limit": 20}),
            ("main_ghat", "shipra_ghat_1", {"distance": 0.4, "type": "pedestrian", "width": 4.0, "speed_limit": 5}),
            ("shipra_ghat_1", "shipra_ghat_2", {"distance": 0.3, "type": "pedestrian", "width": 3.0, "speed_limit": 5}),
            
            # Transport connections
            ("transport_hub_central", "main_ghat", {"distance": 0.8, "type": "main_road", "width": 6.0, "speed_limit": 30}),
            ("transport_hub_east", "mahakal_temple", {"distance": 1.2, "type": "main_road", "width": 6.0, "speed_limit": 25}),
            
            # Parking connections
            ("parking_north", "mahakal_temple", {"distance": 0.9, "type": "access_road", "width": 4.0, "speed_limit": 15}),
            ("parking_south", "main_ghat", {"distance": 1.1, "type": "access_road", "width": 4.0, "speed_limit": 15}),
            
            # Service connections
            ("medical_center_1", "main_ghat", {"distance": 0.3, "type": "service_road", "width": 3.5, "speed_limit": 10}),
            ("medical_center_2", "mahakal_temple", {"distance": 0.5, "type": "service_road", "width": 3.5, "speed_limit": 10}),
            
            # Food and rest areas
            ("food_court_1", "main_ghat", {"distance": 0.4, "type": "pedestrian", "width": 3.0, "speed_limit": 5}),
            ("food_court_2", "mahakal_temple", {"distance": 0.3, "type": "pedestrian", "width": 3.0, "speed_limit": 5}),
            ("rest_area_families", "main_ghat", {"distance": 0.6, "type": "pedestrian", "width": 4.0, "speed_limit": 5}),
            
            # Information and security
            ("information_center", "main_ghat", {"distance": 0.2, "type": "pedestrian", "width": 2.5, "speed_limit": 5}),
            ("security_post_1", "main_ghat", {"distance": 0.3, "type": "service_road", "width": 2.0, "speed_limit": 10}),
            ("security_post_2", "shipra_ghat_1", {"distance": 0.2, "type": "service_road", "width": 2.0, "speed_limit": 10}),
            
            # VIP and special areas
            ("vip_area", "mahakal_temple", {"distance": 0.7, "type": "restricted", "width": 5.0, "speed_limit": 20}),
            ("media_center", "main_ghat", {"distance": 0.5, "type": "service_road", "width": 3.0, "speed_limit": 15}),
            ("volunteer_base", "information_center", {"distance": 0.4, "type": "service_road", "width": 2.5, "speed_limit": 10}),
            
            # Emergency exits
            ("emergency_exit_1", "transport_hub_central", {"distance": 0.6, "type": "emergency", "width": 6.0, "speed_limit": 40}),
            ("emergency_exit_2", "transport_hub_east", {"distance": 0.8, "type": "emergency", "width": 6.0, "speed_limit": 40}),
            
            # Cross connections for better routing
            ("transport_hub_central", "transport_hub_east", {"distance": 2.1, "type": "main_road", "width": 7.0, "speed_limit": 35}),
            ("parking_north", "parking_south", {"distance": 2.8, "type": "bypass", "width": 5.0, "speed_limit": 25}),
            ("medical_center_1", "medical_center_2", {"distance": 1.2, "type": "service_road", "width": 4.0, "speed_limit": 20}),
        ]
        
        # Build bidirectional network
        for start, end, props in connections:
            if start not in network:
                network[start] = []
            if end not in network:
                network[end] = []
            
            network[start].append((end, props["distance"], props))
            network[end].append((start, props["distance"], props))
        
        return network
    
    def _initialize_crowd_data(self) -> Dict[str, Dict]:
        """Initialize realistic crowd data with time-based variations"""
        base_time = datetime.now()
        crowd_data = {}
        
        for loc_id, location in self.locations.items():
            # Simulate crowd patterns based on location type and time
            crowd_factor = self._calculate_crowd_factor(location, base_time)
            
            crowd_data[loc_id] = {
                "current_density": min(location.current_crowd / location.capacity, 1.0),
                "predicted_density": min(crowd_factor * location.current_crowd / location.capacity, 1.0),
                "peak_times": self._get_peak_times(location.type),
                "flow_rate": random.uniform(50, 200),  # people per minute
                "wait_time": max(0, (location.current_crowd - location.capacity * 0.8) / 100) if location.current_crowd > location.capacity * 0.8 else 0
            }
        
        return crowd_data
    
    def _calculate_crowd_factor(self, location: Location, time: datetime) -> float:
        """Calculate crowd factor based on location type and time"""
        hour = time.hour
        
        if location.type == "temple":
            # Temples are busiest during morning and evening prayers
            if 5 <= hour <= 8 or 17 <= hour <= 20:
                return 1.5
            elif 9 <= hour <= 16:
                return 1.2
            else:
                return 0.8
        elif location.type == "ghat":
            # Ghats are busiest during early morning and evening
            if 4 <= hour <= 7 or 16 <= hour <= 19:
                return 1.8
            elif 8 <= hour <= 15:
                return 1.0
            else:
                return 0.6
        elif location.type == "transport":
            # Transport hubs have consistent traffic
            if 6 <= hour <= 22:
                return 1.2
            else:
                return 0.7
        elif location.type == "food":
            # Food courts are busiest during meal times
            if 7 <= hour <= 9 or 12 <= hour <= 14 or 19 <= hour <= 21:
                return 1.4
            else:
                return 0.9
        else:
            return 1.0
    
    def _get_peak_times(self, location_type: str) -> List[str]:
        """Get peak times for different location types"""
        peak_times = {
            "temple": ["05:00-08:00", "17:00-20:00"],
            "ghat": ["04:00-07:00", "16:00-19:00"],
            "transport": ["06:00-10:00", "16:00-20:00"],
            "food": ["07:00-09:00", "12:00-14:00", "19:00-21:00"],
            "parking": ["05:00-09:00", "17:00-21:00"],
            "medical": ["24/7"],
            "rest": ["10:00-16:00"],
            "info": ["08:00-20:00"]
        }
        return peak_times.get(location_type, ["08:00-18:00"])
    
    def _get_current_weather(self) -> Dict:
        """Get current weather conditions affecting routing"""
        return {
            "temperature": random.uniform(18, 35),
            "humidity": random.uniform(40, 80),
            "wind_speed": random.uniform(5, 20),
            "precipitation": random.choice([0, 0, 0, 0.1, 0.5, 1.0]),  # mm/hour
            "visibility": random.uniform(8, 15),  # km
            "uv_index": random.uniform(3, 9)
        }
    
    def calculate_accurate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate accurate distance using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c  # Distance in meters
    
    def calculate_travel_time(self, distance: float, road_props: Dict, crowd_factor: float, weather_factor: float) -> float:
        """Calculate realistic travel time considering all factors"""
        base_speed = road_props.get("speed_limit", 15)  # km/h
        
        # Adjust speed based on road type
        road_type_multipliers = {
            "arterial": 1.0,
            "main_road": 0.9,
            "access_road": 0.7,
            "pedestrian": 0.3,
            "service_road": 0.6,
            "emergency": 1.2,
            "restricted": 0.8,
            "bypass": 1.1
        }
        
        speed_multiplier = road_type_multipliers.get(road_props.get("type", "pedestrian"), 0.5)
        adjusted_speed = base_speed * speed_multiplier
        
        # Apply crowd factor (more crowd = slower movement)
        crowd_speed_reduction = max(0.3, 1.0 - (crowd_factor * 0.7))
        adjusted_speed *= crowd_speed_reduction
        
        # Apply weather factor
        adjusted_speed *= weather_factor
        
        # Convert to m/s and calculate time
        speed_ms = (adjusted_speed * 1000) / 3600
        travel_time = distance / speed_ms if speed_ms > 0 else distance / 1.0
        
        return travel_time  # seconds
    
    def get_weather_factor(self) -> float:
        """Calculate weather impact on travel speed"""
        weather = self.weather_conditions
        factor = 1.0
        
        # Rain impact
        if weather["precipitation"] > 0:
            factor *= max(0.6, 1.0 - (weather["precipitation"] * 0.2))
        
        # Temperature impact
        if weather["temperature"] > 35 or weather["temperature"] < 10:
            factor *= 0.9
        
        # Wind impact
        if weather["wind_speed"] > 25:
            factor *= 0.95
        
        # Visibility impact
        if weather["visibility"] < 5:
            factor *= 0.8
        
        return factor
    
    def dijkstra_routing(self, start_id: str, end_id: str, preferences: Dict) -> Optional[Route]:
        """
        Advanced Dijkstra algorithm with preference-based weighting
        """
        if start_id not in self.locations or end_id not in self.locations:
            return None
        
        # Priority queue: (cost, current_node, path, total_distance, total_time)
        pq = [(0, start_id, [start_id], 0, 0)]
        visited = set()
        weather_factor = self.get_weather_factor()
        
        while pq:
            current_cost, current_node, path, total_distance, total_time = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            if current_node == end_id:
                return self._build_route_from_path(path, preferences, total_distance, total_time)
            
            if current_node not in self.road_network:
                continue
            
            for neighbor, distance, road_props in self.road_network[current_node]:
                if neighbor in visited:
                    continue
                
                # Calculate various costs
                crowd_factor = self.crowd_data.get(neighbor, {}).get("current_density", 0.5)
                travel_time = self.calculate_travel_time(distance * 1000, road_props, crowd_factor, weather_factor)
                
                # Calculate weighted cost based on preferences
                cost = self._calculate_route_cost(distance, travel_time, crowd_factor, road_props, preferences)
                
                new_path = path + [neighbor]
                new_distance = total_distance + distance
                new_time = total_time + travel_time
                
                heapq.heappush(pq, (current_cost + cost, neighbor, new_path, new_distance, new_time))
        
        return None
    
    def _calculate_route_cost(self, distance: float, time: float, crowd_factor: float, road_props: Dict, preferences: Dict) -> float:
        """Calculate weighted cost based on user preferences"""
        base_cost = distance  # Base cost is distance
        
        # Apply preference weights
        if preferences.get("route_type") == "fastest":
            base_cost = time * 0.1  # Prioritize time over distance
        elif preferences.get("route_type") == "safest":
            safety_penalty = (1.0 - road_props.get("safety_score", 0.8)) * 10
            base_cost += safety_penalty
        elif preferences.get("route_type") == "scenic":
            scenic_bonus = road_props.get("scenic_score", 0.5) * -2
            base_cost += scenic_bonus
        
        # Crowd avoidance
        if preferences.get("avoid_crowds", True):
            crowd_penalty = crowd_factor * 5
            base_cost += crowd_penalty
        
        # Accessibility requirements
        if preferences.get("accessible_route", False):
            accessibility_penalty = (1.0 - road_props.get("accessibility_score", 0.8)) * 8
            base_cost += accessibility_penalty
        
        # Road type preferences
        road_type_costs = {
            "pedestrian": 0.5,
            "service_road": 1.0,
            "access_road": 1.2,
            "main_road": 1.5,
            "arterial": 2.0,
            "emergency": 0.8,
            "restricted": 3.0
        }
        
        road_cost = road_type_costs.get(road_props.get("type", "pedestrian"), 1.0)
        base_cost *= road_cost
        
        return base_cost
    
    def _build_route_from_path(self, path: List[str], preferences: Dict, total_distance: float, total_time: float) -> Route:
        """Build detailed route object from path"""
        segments = []
        waypoints = []
        instructions = []
        
        for i in range(len(path) - 1):
            start_loc = self.locations[path[i]]
            end_loc = self.locations[path[i + 1]]
            
            # Find road properties
            road_props = {}
            if path[i] in self.road_network:
                for neighbor, distance, props in self.road_network[path[i]]:
                    if neighbor == path[i + 1]:
                        road_props = props
                        break
            
            # Calculate segment details
            segment_distance = self.calculate_accurate_distance(
                start_loc.lat, start_loc.lng, end_loc.lat, end_loc.lng
            ) / 1000  # Convert to km
            
            crowd_factor = self.crowd_data.get(path[i + 1], {}).get("current_density", 0.5)
            weather_factor = self.get_weather_factor()
            segment_time = self.calculate_travel_time(segment_distance * 1000, road_props, crowd_factor, weather_factor)
            
            segment = RouteSegment(
                start=start_loc,
                end=end_loc,
                distance=segment_distance,
                duration=segment_time,
                crowd_factor=crowd_factor,
                safety_factor=road_props.get("safety_score", 0.8),
                accessibility_factor=road_props.get("accessibility_score", 0.8),
                surface_type=road_props.get("surface", "paved"),
                width=road_props.get("width", 3.0)
            )
            
            segments.append(segment)
            
            # Add waypoint
            waypoints.append({
                "lat": end_loc.lat,
                "lng": end_loc.lng,
                "name": end_loc.name,
                "type": end_loc.type
            })
            
            # Generate instruction
            instruction = self._generate_instruction(start_loc, end_loc, road_props, segment_distance)
            instructions.append(instruction)
        
        # Calculate overall scores
        safety_score = sum(s.safety_factor for s in segments) / len(segments) if segments else 0.8
        accessibility_score = sum(s.accessibility_factor for s in segments) / len(segments) if segments else 0.8
        crowd_level = sum(s.crowd_factor for s in segments) / len(segments) if segments else 0.5
        
        # Determine route type
        route_type = preferences.get("route_type", "optimal")
        
        return Route(
            segments=segments,
            total_distance=total_distance,
            total_duration=total_time,
            route_type=route_type,
            safety_score=safety_score,
            accessibility_score=accessibility_score,
            crowd_level=crowd_level,
            waypoints=waypoints,
            instructions=instructions,
            estimated_cost=0.0  # Free for pilgrims
        )
    
    def _generate_instruction(self, start: Location, end: Location, road_props: Dict, distance: float) -> str:
        """Generate turn-by-turn instructions"""
        road_type = road_props.get("type", "path")
        
        if road_type == "pedestrian":
            return f"Walk {distance*1000:.0f}m along pedestrian path to {end.name}"
        elif road_type == "main_road":
            return f"Continue {distance*1000:.0f}m on main road towards {end.name}"
        elif road_type == "service_road":
            return f"Take service road for {distance*1000:.0f}m to reach {end.name}"
        elif road_type == "emergency":
            return f"Follow emergency route {distance*1000:.0f}m to {end.name}"
        else:
            return f"Proceed {distance*1000:.0f}m to {end.name}"
    
    def calculate_multiple_routes(self, start_id: str, end_id: str, preferences: Dict) -> List[Route]:
        """Calculate multiple route options with different optimizations"""
        routes = []
        
        # Generate different route types
        route_types = ["optimal", "fastest", "safest", "scenic"]
        
        for route_type in route_types:
            modified_preferences = preferences.copy()
            modified_preferences["route_type"] = route_type
            
            route = self.dijkstra_routing(start_id, end_id, modified_preferences)
            if route:
                route.route_type = route_type
                routes.append(route)
        
        # Sort by preference score
        routes.sort(key=lambda r: self._calculate_preference_score(r, preferences))
        
        return routes[:3]  # Return top 3 routes
    
    def _calculate_preference_score(self, route: Route, preferences: Dict) -> float:
        """Calculate how well a route matches user preferences"""
        score = 0.0
        
        if preferences.get("route_type") == "fastest":
            score += (1.0 / (route.total_duration / 3600)) * 100  # Favor shorter time
        elif preferences.get("route_type") == "safest":
            score += route.safety_score * 100
        elif preferences.get("route_type") == "scenic":
            score += 50  # Base scenic score
        else:  # optimal
            score += (route.safety_score * 30 + 
                     (1.0 - route.crowd_level) * 30 + 
                     route.accessibility_score * 20 + 
                     (1.0 / route.total_distance) * 20)
        
        return score

# Global routing engine instance
routing_engine = AdvancedRoutingEngine()