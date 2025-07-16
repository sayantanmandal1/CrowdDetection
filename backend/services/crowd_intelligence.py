"""
Advanced Crowd Intelligence System for Simhastha 2028
Real-time crowd detection, prediction, and management
"""

import numpy as np
import cv2
import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import math

@dataclass
class CrowdDetection:
    """Represents crowd detection data"""
    location_id: str
    timestamp: datetime
    crowd_count: int
    density_level: float  # 0.0 to 1.0
    flow_rate: float  # people per minute
    age_distribution: Dict[str, float]
    gender_distribution: Dict[str, float]
    movement_patterns: Dict[str, float]
    safety_alerts: List[str]
    predicted_peak: Optional[datetime]

@dataclass
class SafetyAlert:
    """Represents a safety alert"""
    alert_id: str
    location_id: str
    alert_type: str
    severity: str  # low, medium, high, critical
    message: str
    timestamp: datetime
    affected_count: int
    response_time: float
    status: str  # active, resolving, resolved
    actions_taken: List[str]

class CrowdIntelligenceEngine:
    """
    Advanced crowd intelligence with AI-powered detection and prediction
    """
    
    def __init__(self):
        self.detection_history = {}
        self.alert_history = {}
        self.prediction_models = self._initialize_prediction_models()
        self.safety_thresholds = self._initialize_safety_thresholds()
        self.current_detections = self._generate_realistic_crowd_data()
        
    def _initialize_prediction_models(self) -> Dict:
        """Initialize AI prediction models (simulated)"""
        return {
            "crowd_flow": {
                "accuracy": 0.94,
                "prediction_horizon": 30,  # minutes
                "confidence_threshold": 0.85
            },
            "density_prediction": {
                "accuracy": 0.91,
                "prediction_horizon": 60,  # minutes
                "confidence_threshold": 0.80
            },
            "safety_risk": {
                "accuracy": 0.96,
                "prediction_horizon": 15,  # minutes
                "confidence_threshold": 0.90
            }
        }
    
    def _initialize_safety_thresholds(self) -> Dict:
        """Initialize safety thresholds for different location types"""
        return {
            "ghat": {
                "low": 0.6,
                "medium": 0.75,
                "high": 0.85,
                "critical": 0.95
            },
            "temple": {
                "low": 0.7,
                "medium": 0.8,
                "high": 0.9,
                "critical": 0.98
            },
            "transport": {
                "low": 0.5,
                "medium": 0.7,
                "high": 0.85,
                "critical": 0.95
            },
            "parking": {
                "low": 0.6,
                "medium": 0.75,
                "high": 0.9,
                "critical": 0.98
            },
            "food": {
                "low": 0.65,
                "medium": 0.8,
                "high": 0.9,
                "critical": 0.95
            },
            "medical": {
                "low": 0.3,
                "medium": 0.5,
                "high": 0.7,
                "critical": 0.85
            }
        }
    
    def _generate_realistic_crowd_data(self) -> Dict[str, CrowdDetection]:
        """Generate realistic crowd detection data"""
        detections = {}
        current_time = datetime.now()
        
        # Realistic location data based on Simhastha patterns
        locations_data = {
            "main_ghat": {
                "base_crowd": 3200,
                "capacity": 5000,
                "peak_multiplier": 1.8,
                "flow_rate": 180,
                "location_type": "ghat"
            },
            "mahakal_temple": {
                "base_crowd": 5500,
                "capacity": 8000,
                "peak_multiplier": 1.6,
                "flow_rate": 220,
                "location_type": "temple"
            },
            "shipra_ghat_1": {
                "base_crowd": 1800,
                "capacity": 3000,
                "peak_multiplier": 1.7,
                "flow_rate": 120,
                "location_type": "ghat"
            },
            "transport_hub_central": {
                "base_crowd": 800,
                "capacity": 2000,
                "peak_multiplier": 1.4,
                "flow_rate": 150,
                "location_type": "transport"
            },
            "food_court_1": {
                "base_crowd": 450,
                "capacity": 800,
                "peak_multiplier": 1.5,
                "flow_rate": 80,
                "location_type": "food"
            }
        }
        
        for loc_id, data in locations_data.items():
            # Calculate time-based crowd variations
            hour = current_time.hour
            crowd_multiplier = self._get_time_based_multiplier(data["location_type"], hour)
            
            current_crowd = int(data["base_crowd"] * crowd_multiplier)
            density = min(current_crowd / data["capacity"], 1.0)
            
            # Generate realistic demographics
            age_dist = self._generate_age_distribution(data["location_type"])
            gender_dist = {"male": 0.52, "female": 0.48}  # Typical for religious gatherings
            
            # Generate movement patterns
            movement_patterns = {
                "stationary": random.uniform(0.3, 0.6),
                "slow_moving": random.uniform(0.2, 0.4),
                "fast_moving": random.uniform(0.1, 0.3),
                "entering": random.uniform(0.05, 0.15),
                "exiting": random.uniform(0.05, 0.15)
            }
            
            # Normalize movement patterns
            total = sum(movement_patterns.values())
            movement_patterns = {k: v/total for k, v in movement_patterns.items()}
            
            # Generate safety alerts based on density
            safety_alerts = self._generate_safety_alerts(loc_id, density, data["location_type"])
            
            # Predict next peak
            predicted_peak = self._predict_next_peak(data["location_type"], current_time)
            
            detection = CrowdDetection(
                location_id=loc_id,
                timestamp=current_time,
                crowd_count=current_crowd,
                density_level=density,
                flow_rate=data["flow_rate"] * crowd_multiplier,
                age_distribution=age_dist,
                gender_distribution=gender_dist,
                movement_patterns=movement_patterns,
                safety_alerts=safety_alerts,
                predicted_peak=predicted_peak
            )
            
            detections[loc_id] = detection
        
        return detections
    
    def _get_time_based_multiplier(self, location_type: str, hour: int) -> float:
        """Get crowd multiplier based on time and location type"""
        if location_type == "ghat":
            # Ghats are busiest during early morning (4-7 AM) and evening (5-8 PM)
            if 4 <= hour <= 7:
                return 1.8
            elif 17 <= hour <= 20:
                return 1.6
            elif 8 <= hour <= 16:
                return 1.0
            else:
                return 0.4
        elif location_type == "temple":
            # Temples have consistent high traffic with peaks during prayer times
            if 5 <= hour <= 8 or 17 <= hour <= 20:
                return 1.5
            elif 9 <= hour <= 16:
                return 1.2
            else:
                return 0.8
        elif location_type == "transport":
            # Transport hubs have steady traffic during day hours
            if 6 <= hour <= 22:
                return 1.2
            else:
                return 0.6
        elif location_type == "food":
            # Food courts peak during meal times
            if 7 <= hour <= 9 or 12 <= hour <= 14 or 19 <= hour <= 21:
                return 1.4
            else:
                return 0.8
        else:
            return 1.0
    
    def _generate_age_distribution(self, location_type: str) -> Dict[str, float]:
        """Generate realistic age distribution based on location type"""
        if location_type == "ghat":
            return {
                "children": 0.15,
                "youth": 0.25,
                "adults": 0.35,
                "middle_aged": 0.20,
                "elderly": 0.05
            }
        elif location_type == "temple":
            return {
                "children": 0.12,
                "youth": 0.20,
                "adults": 0.30,
                "middle_aged": 0.25,
                "elderly": 0.13
            }
        else:
            return {
                "children": 0.18,
                "youth": 0.30,
                "adults": 0.32,
                "middle_aged": 0.15,
                "elderly": 0.05
            }
    
    def _generate_safety_alerts(self, location_id: str, density: float, location_type: str) -> List[str]:
        """Generate safety alerts based on crowd density and conditions"""
        alerts = []
        thresholds = self.safety_thresholds.get(location_type, self.safety_thresholds["ghat"])
        
        if density >= thresholds["critical"]:
            alerts.extend([
                "CRITICAL: Extremely high crowd density",
                "Immediate crowd control measures required",
                "Emergency evacuation routes activated"
            ])
        elif density >= thresholds["high"]:
            alerts.extend([
                "HIGH: Very crowded conditions",
                "Entry restrictions may be implemented",
                "Alternative routes recommended"
            ])
        elif density >= thresholds["medium"]:
            alerts.extend([
                "MEDIUM: Moderate crowd levels",
                "Monitor for further increases",
                "Prepare crowd management protocols"
            ])
        
        # Add location-specific alerts
        if location_type == "ghat" and density > 0.8:
            alerts.append("Slippery conditions near water - exercise caution")
        elif location_type == "temple" and density > 0.85:
            alerts.append("Queue management system activated")
        elif location_type == "transport" and density > 0.7:
            alerts.append("Additional transport services deployed")
        
        return alerts
    
    def _predict_next_peak(self, location_type: str, current_time: datetime) -> Optional[datetime]:
        """Predict next peak time for the location"""
        hour = current_time.hour
        
        if location_type == "ghat":
            if hour < 4:
                return current_time.replace(hour=5, minute=30, second=0, microsecond=0)
            elif hour < 17:
                return current_time.replace(hour=18, minute=0, second=0, microsecond=0)
            else:
                next_day = current_time + timedelta(days=1)
                return next_day.replace(hour=5, minute=30, second=0, microsecond=0)
        elif location_type == "temple":
            if hour < 6:
                return current_time.replace(hour=7, minute=0, second=0, microsecond=0)
            elif hour < 18:
                return current_time.replace(hour=19, minute=0, second=0, microsecond=0)
            else:
                next_day = current_time + timedelta(days=1)
                return next_day.replace(hour=7, minute=0, second=0, microsecond=0)
        
        return None
    
    def get_crowd_analytics(self) -> Dict:
        """Get comprehensive crowd analytics"""
        total_crowd = sum(detection.crowd_count for detection in self.current_detections.values())
        avg_density = sum(detection.density_level for detection in self.current_detections.values()) / len(self.current_detections)
        
        # Calculate hotspots
        hotspots = []
        for loc_id, detection in self.current_detections.items():
            if detection.density_level > 0.8:
                hotspots.append({
                    "location": loc_id,
                    "density": round(detection.density_level * 100, 1),
                    "crowd_count": detection.crowd_count,
                    "severity": "critical" if detection.density_level > 0.95 else "high"
                })
        
        # Calculate flow statistics
        total_flow = sum(detection.flow_rate for detection in self.current_detections.values())
        
        return {
            "total_crowd_count": total_crowd,
            "average_density": round(avg_density * 100, 1),
            "total_locations": len(self.current_detections),
            "hotspots": hotspots,
            "total_flow_rate": round(total_flow, 1),
            "safety_status": "critical" if avg_density > 0.9 else "high" if avg_density > 0.7 else "moderate",
            "prediction_accuracy": self.prediction_models["crowd_flow"]["accuracy"],
            "last_updated": datetime.now().isoformat()
        }
    
    def get_location_details(self, location_id: str) -> Optional[Dict]:
        """Get detailed information for a specific location"""
        if location_id not in self.current_detections:
            return None
        
        detection = self.current_detections[location_id]
        
        return {
            "location_id": location_id,
            "current_crowd": detection.crowd_count,
            "density_percentage": round(detection.density_level * 100, 1),
            "flow_rate": round(detection.flow_rate, 1),
            "demographics": {
                "age_distribution": detection.age_distribution,
                "gender_distribution": detection.gender_distribution
            },
            "movement_analysis": detection.movement_patterns,
            "safety_alerts": detection.safety_alerts,
            "predicted_peak": detection.predicted_peak.isoformat() if detection.predicted_peak else None,
            "recommendations": self._generate_recommendations(detection),
            "timestamp": detection.timestamp.isoformat()
        }
    
    def _generate_recommendations(self, detection: CrowdDetection) -> List[str]:
        """Generate recommendations based on crowd conditions"""
        recommendations = []
        
        if detection.density_level > 0.9:
            recommendations.extend([
                "Avoid this location if possible",
                "Use alternative routes",
                "Wait for crowd levels to decrease"
            ])
        elif detection.density_level > 0.7:
            recommendations.extend([
                "Exercise patience - expect delays",
                "Stay hydrated and take breaks",
                "Follow crowd management instructions"
            ])
        elif detection.density_level > 0.5:
            recommendations.extend([
                "Good time to visit",
                "Moderate crowd levels expected",
                "Plan for short waiting times"
            ])
        else:
            recommendations.extend([
                "Excellent time to visit",
                "Low crowd levels",
                "Minimal waiting expected"
            ])
        
        # Add time-based recommendations
        hour = detection.timestamp.hour
        if 4 <= hour <= 7:
            recommendations.append("Early morning - ideal for peaceful experience")
        elif 12 <= hour <= 16:
            recommendations.append("Afternoon - carry sun protection")
        elif 17 <= hour <= 20:
            recommendations.append("Evening - beautiful lighting but expect crowds")
        
        return recommendations
    
    def generate_safety_alerts(self) -> List[SafetyAlert]:
        """Generate current safety alerts"""
        alerts = []
        current_time = datetime.now()
        
        for loc_id, detection in self.current_detections.items():
            if detection.safety_alerts:
                for i, alert_msg in enumerate(detection.safety_alerts):
                    severity = "critical" if "CRITICAL" in alert_msg else \
                              "high" if "HIGH" in alert_msg else \
                              "medium" if "MEDIUM" in alert_msg else "low"
                    
                    alert = SafetyAlert(
                        alert_id=f"{loc_id}_{i}_{int(current_time.timestamp())}",
                        location_id=loc_id,
                        alert_type="crowd_density",
                        severity=severity,
                        message=alert_msg,
                        timestamp=current_time,
                        affected_count=detection.crowd_count,
                        response_time=random.uniform(2.0, 8.0),
                        status="active",
                        actions_taken=self._generate_response_actions(severity)
                    )
                    alerts.append(alert)
        
        return alerts
    
    def _generate_response_actions(self, severity: str) -> List[str]:
        """Generate appropriate response actions based on severity"""
        if severity == "critical":
            return [
                "Emergency response team deployed",
                "Crowd control barriers installed",
                "Alternative routes activated",
                "Medical teams on standby"
            ]
        elif severity == "high":
            return [
                "Additional security personnel deployed",
                "Crowd monitoring increased",
                "Public announcements initiated"
            ]
        elif severity == "medium":
            return [
                "Monitoring situation closely",
                "Preparing additional resources",
                "Informing nearby facilities"
            ]
        else:
            return [
                "Standard monitoring protocols",
                "Regular status updates"
            ]
    
    def update_crowd_data(self):
        """Update crowd data with new detections (simulates real-time updates)"""
        self.current_detections = self._generate_realistic_crowd_data()

# Global crowd intelligence engine instance
crowd_engine = CrowdIntelligenceEngine()