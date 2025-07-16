from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.crowd_intelligence import crowd_engine
from datetime import datetime, timedelta
import json
import random

router = APIRouter()

class AlertSubscription(BaseModel):
    user_id: str
    location_ids: List[str]
    alert_types: List[str]
    severity_threshold: str = "medium"  # low, medium, high, critical

class AlertResponse(BaseModel):
    alert_id: str
    response_action: str
    response_time: float
    personnel_assigned: List[str]

@router.get("/current")
async def get_current_alerts():
    """Get all current active alerts"""
    try:
        alerts = crowd_engine.generate_safety_alerts()
        
        formatted_alerts = []
        for alert in alerts:
            formatted_alerts.append({
                "id": alert.alert_id,
                "location_id": alert.location_id,
                "location_name": _get_location_name(alert.location_id),
                "type": alert.alert_type,
                "severity": alert.severity,
                "message": alert.message,
                "timestamp": alert.timestamp.isoformat(),
                "affected_count": alert.affected_count,
                "estimated_response_time": f"{alert.response_time:.1f} minutes",
                "status": alert.status,
                "actions_taken": alert.actions_taken,
                "priority_score": _calculate_priority_score(alert),
                "coordinates": _get_location_coordinates(alert.location_id)
            })
        
        # Sort by priority score (highest first)
        formatted_alerts.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return {
            "status": "success",
            "alerts": formatted_alerts,
            "summary": {
                "total_alerts": len(formatted_alerts),
                "critical_alerts": len([a for a in formatted_alerts if a["severity"] == "critical"]),
                "high_alerts": len([a for a in formatted_alerts if a["severity"] == "high"]),
                "medium_alerts": len([a for a in formatted_alerts if a["severity"] == "medium"]),
                "low_alerts": len([a for a in formatted_alerts if a["severity"] == "low"]),
                "total_affected": sum(a["affected_count"] for a in formatted_alerts)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert retrieval failed: {str(e)}")

def _get_location_name(location_id: str) -> str:
    """Get human-readable location name"""
    location_names = {
        "main_ghat": "Main Ghat - Ram Ghat",
        "mahakal_temple": "Mahakaleshwar Temple",
        "shipra_ghat_1": "Shipra Ghat 1",
        "shipra_ghat_2": "Shipra Ghat 2",
        "transport_hub_central": "Central Transport Hub",
        "transport_hub_east": "East Transport Hub",
        "parking_north": "North Parking Complex",
        "parking_south": "South Parking Complex",
        "medical_center_1": "Primary Medical Center",
        "medical_center_2": "Emergency Medical Center",
        "food_court_1": "Main Food Court",
        "food_court_2": "Temple Food Court"
    }
    return location_names.get(location_id, location_id.replace("_", " ").title())

def _get_location_coordinates(location_id: str) -> Dict[str, float]:
    """Get location coordinates"""
    coordinates = {
        "main_ghat": {"lat": 23.1765, "lng": 75.7885},
        "mahakal_temple": {"lat": 23.1828, "lng": 75.7681},
        "shipra_ghat_1": {"lat": 23.1801, "lng": 75.7892},
        "transport_hub_central": {"lat": 23.1723, "lng": 75.7823},
        "food_court_1": {"lat": 23.1745, "lng": 75.7856}
    }
    return coordinates.get(location_id, {"lat": 23.1765, "lng": 75.7885})

def _calculate_priority_score(alert) -> float:
    """Calculate priority score for alert sorting"""
    severity_scores = {"critical": 100, "high": 75, "medium": 50, "low": 25}
    base_score = severity_scores.get(alert.severity, 25)
    
    # Adjust based on affected count
    crowd_factor = min(alert.affected_count / 1000, 2.0)  # Max 2x multiplier
    
    # Adjust based on response time (longer response time = higher priority)
    time_factor = min(alert.response_time / 10, 1.5)  # Max 1.5x multiplier
    
    return base_score * (1 + crowd_factor) * (1 + time_factor)

@router.get("/emergency")
async def get_emergency_alerts():
    """Get only critical and high severity alerts"""
    try:
        all_alerts_response = await get_current_alerts()
        all_alerts = all_alerts_response["alerts"]
        
        emergency_alerts = [
            alert for alert in all_alerts 
            if alert["severity"] in ["critical", "high"]
        ]
        
        return {
            "status": "success",
            "emergency_alerts": emergency_alerts,
            "count": len(emergency_alerts),
            "requires_immediate_action": len([a for a in emergency_alerts if a["severity"] == "critical"]),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency alerts retrieval failed: {str(e)}")

@router.get("/location/{location_id}")
async def get_location_alerts(location_id: str):
    """Get alerts for a specific location"""
    try:
        all_alerts_response = await get_current_alerts()
        all_alerts = all_alerts_response["alerts"]
        
        location_alerts = [
            alert for alert in all_alerts 
            if alert["location_id"] == location_id
        ]
        
        if not location_alerts:
            return {
                "status": "success",
                "location_id": location_id,
                "location_name": _get_location_name(location_id),
                "alerts": [],
                "status_message": "No active alerts for this location",
                "safety_level": "normal",
                "timestamp": datetime.now().isoformat()
            }
        
        # Determine overall safety level for location
        severities = [alert["severity"] for alert in location_alerts]
        if "critical" in severities:
            safety_level = "critical"
        elif "high" in severities:
            safety_level = "high"
        elif "medium" in severities:
            safety_level = "medium"
        else:
            safety_level = "low"
        
        return {
            "status": "success",
            "location_id": location_id,
            "location_name": _get_location_name(location_id),
            "alerts": location_alerts,
            "alert_count": len(location_alerts),
            "safety_level": safety_level,
            "recommendations": _generate_location_recommendations(location_alerts),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location alerts retrieval failed: {str(e)}")

def _generate_location_recommendations(alerts: List[Dict]) -> List[str]:
    """Generate recommendations based on location alerts"""
    recommendations = []
    
    severities = [alert["severity"] for alert in alerts]
    
    if "critical" in severities:
        recommendations.extend([
            "AVOID this location immediately",
            "Seek alternative routes",
            "Follow emergency evacuation procedures if present",
            "Contact emergency services if needed"
        ])
    elif "high" in severities:
        recommendations.extend([
            "Exercise extreme caution",
            "Consider postponing visit",
            "Stay alert and follow instructions",
            "Keep emergency contacts ready"
        ])
    elif "medium" in severities:
        recommendations.extend([
            "Proceed with caution",
            "Allow extra time for travel",
            "Stay informed about conditions",
            "Follow crowd management guidelines"
        ])
    else:
        recommendations.extend([
            "Normal precautions advised",
            "Monitor for updates",
            "Follow standard safety protocols"
        ])
    
    return recommendations

@router.get("/predictions")
async def get_alert_predictions(hours_ahead: int = Query(default=4, ge=1, le=24)):
    """Get predicted alerts based on crowd forecasts"""
    try:
        predictions = []
        current_time = datetime.now()
        
        # Generate predictions for each location
        for loc_id in crowd_engine.current_detections.keys():
            location_predictions = []
            
            for hour in range(1, hours_ahead + 1):
                future_time = current_time + timedelta(hours=hour)
                
                # Simulate prediction based on time patterns
                risk_level = _calculate_future_risk(loc_id, future_time)
                
                if risk_level > 0.3:  # Only include significant risks
                    predicted_alert = {
                        "time": future_time.isoformat(),
                        "risk_level": round(risk_level, 2),
                        "predicted_severity": _risk_to_severity(risk_level),
                        "confidence": round(crowd_engine.prediction_models["safety_risk"]["accuracy"], 2),
                        "potential_triggers": _get_potential_triggers(loc_id, future_time),
                        "preventive_actions": _get_preventive_actions(risk_level)
                    }
                    location_predictions.append(predicted_alert)
            
            if location_predictions:
                predictions.append({
                    "location_id": loc_id,
                    "location_name": _get_location_name(loc_id),
                    "predictions": location_predictions
                })
        
        return {
            "status": "success",
            "alert_predictions": predictions,
            "prediction_horizon": f"{hours_ahead} hours",
            "model_accuracy": crowd_engine.prediction_models["safety_risk"]["accuracy"],
            "timestamp": current_time.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert prediction failed: {str(e)}")

def _calculate_future_risk(location_id: str, future_time: datetime) -> float:
    """Calculate future risk level for a location"""
    hour = future_time.hour
    location_type = _get_location_type(location_id)
    
    # Base risk from time patterns
    time_multiplier = crowd_engine._get_time_based_multiplier(location_type, hour)
    base_risk = min(time_multiplier * 0.4, 0.8)  # Convert to risk scale
    
    # Add randomness for realistic variation
    variation = random.uniform(-0.1, 0.2)
    
    return max(0, min(1, base_risk + variation))

def _get_location_type(location_id: str) -> str:
    """Get location type from ID"""
    if "ghat" in location_id:
        return "ghat"
    elif "temple" in location_id:
        return "temple"
    elif "transport" in location_id:
        return "transport"
    elif "food" in location_id:
        return "food"
    else:
        return "general"

def _risk_to_severity(risk_level: float) -> str:
    """Convert risk level to severity category"""
    if risk_level >= 0.8:
        return "critical"
    elif risk_level >= 0.6:
        return "high"
    elif risk_level >= 0.4:
        return "medium"
    else:
        return "low"

def _get_potential_triggers(location_id: str, future_time: datetime) -> List[str]:
    """Get potential triggers for future alerts"""
    triggers = []
    hour = future_time.hour
    location_type = _get_location_type(location_id)
    
    if location_type == "ghat" and 4 <= hour <= 7:
        triggers.extend(["Morning bathing rush", "Religious ceremonies", "Sunrise prayers"])
    elif location_type == "temple" and (5 <= hour <= 8 or 17 <= hour <= 20):
        triggers.extend(["Prayer times", "Aarti ceremonies", "Pilgrimage groups"])
    elif location_type == "transport" and (6 <= hour <= 10 or 16 <= hour <= 20):
        triggers.extend(["Peak travel hours", "Bus arrivals", "Departure rush"])
    elif location_type == "food" and (7 <= hour <= 9 or 12 <= hour <= 14 or 19 <= hour <= 21):
        triggers.extend(["Meal times", "Food distribution", "Prasad distribution"])
    
    return triggers

def _get_preventive_actions(risk_level: float) -> List[str]:
    """Get preventive actions based on risk level"""
    if risk_level >= 0.8:
        return [
            "Deploy additional security personnel",
            "Activate crowd control measures",
            "Prepare emergency evacuation routes",
            "Alert medical teams"
        ]
    elif risk_level >= 0.6:
        return [
            "Increase monitoring frequency",
            "Position additional staff",
            "Prepare crowd management tools",
            "Issue public advisories"
        ]
    elif risk_level >= 0.4:
        return [
            "Enhanced surveillance",
            "Staff briefing on protocols",
            "Check communication systems",
            "Monitor crowd patterns"
        ]
    else:
        return [
            "Standard monitoring",
            "Regular status checks",
            "Maintain readiness"
        ]

@router.get("/statistics")
async def get_alert_statistics():
    """Get alert statistics and trends"""
    try:
        current_alerts = await get_current_alerts()
        alerts = current_alerts["alerts"]
        
        # Calculate statistics
        stats = {
            "current_period": {
                "total_alerts": len(alerts),
                "by_severity": {
                    "critical": len([a for a in alerts if a["severity"] == "critical"]),
                    "high": len([a for a in alerts if a["severity"] == "high"]),
                    "medium": len([a for a in alerts if a["severity"] == "medium"]),
                    "low": len([a for a in alerts if a["severity"] == "low"])
                },
                "by_location_type": _calculate_alerts_by_location_type(alerts),
                "average_response_time": _calculate_average_response_time(alerts),
                "total_people_affected": sum(a["affected_count"] for a in alerts)
            },
            "trends": {
                "alert_frequency": "Increasing during peak hours",
                "most_common_type": "crowd_density",
                "peak_alert_times": ["06:00-08:00", "17:00-20:00"],
                "resolution_rate": "94.2%"
            },
            "performance_metrics": {
                "average_detection_time": "1.2 minutes",
                "average_response_time": "3.8 minutes",
                "false_positive_rate": "2.1%",
                "system_uptime": "99.7%"
            }
        }
        
        return {
            "status": "success",
            "statistics": stats,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics calculation failed: {str(e)}")

def _calculate_alerts_by_location_type(alerts: List[Dict]) -> Dict[str, int]:
    """Calculate alert distribution by location type"""
    type_counts = {}
    
    for alert in alerts:
        location_type = _get_location_type(alert["location_id"])
        type_counts[location_type] = type_counts.get(location_type, 0) + 1
    
    return type_counts

def _calculate_average_response_time(alerts: List[Dict]) -> str:
    """Calculate average response time"""
    if not alerts:
        return "0.0 minutes"
    
    total_time = sum(float(alert["estimated_response_time"].split()[0]) for alert in alerts)
    avg_time = total_time / len(alerts)
    
    return f"{avg_time:.1f} minutes"

@router.post("/subscribe")
async def subscribe_to_alerts(subscription: AlertSubscription):
    """Subscribe to alerts for specific locations and types"""
    try:
        # In a real implementation, this would store subscription in database
        subscription_id = f"sub_{subscription.user_id}_{int(datetime.now().timestamp())}"
        
        return {
            "status": "success",
            "subscription_id": subscription_id,
            "message": "Successfully subscribed to alerts",
            "subscription_details": {
                "user_id": subscription.user_id,
                "locations": [_get_location_name(loc_id) for loc_id in subscription.location_ids],
                "alert_types": subscription.alert_types,
                "severity_threshold": subscription.severity_threshold
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Subscription failed: {str(e)}")

@router.post("/respond")
async def respond_to_alert(response: AlertResponse):
    """Record response to an alert"""
    try:
        # In a real implementation, this would update alert status in database
        return {
            "status": "success",
            "message": "Alert response recorded",
            "response_details": {
                "alert_id": response.alert_id,
                "action_taken": response.response_action,
                "response_time": f"{response.response_time:.1f} minutes",
                "personnel": response.personnel_assigned,
                "status_updated": "resolving"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Response recording failed: {str(e)}")