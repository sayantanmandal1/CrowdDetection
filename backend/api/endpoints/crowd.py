from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.crowd_intelligence import crowd_engine
from datetime import datetime
import json

router = APIRouter()

class CrowdAnalysisRequest(BaseModel):
    location_ids: List[str]
    analysis_type: str = "current"  # current, historical, predictive
    time_range: Optional[int] = 60  # minutes

@router.get("/analytics")
async def get_crowd_analytics():
    """Get comprehensive crowd analytics across all locations"""
    try:
        analytics = crowd_engine.get_crowd_analytics()
        return {
            "status": "success",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")

@router.get("/location/{location_id}")
async def get_location_crowd_data(location_id: str):
    """Get detailed crowd data for a specific location"""
    try:
        location_data = crowd_engine.get_location_details(location_id)
        
        if not location_data:
            raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
        
        return {
            "status": "success",
            "data": location_data,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data retrieval failed: {str(e)}")

@router.get("/heatmap")
async def get_crowd_heatmap():
    """Get crowd density heatmap data for visualization"""
    try:
        heatmap_data = []
        
        for loc_id, detection in crowd_engine.current_detections.items():
            heatmap_data.append({
                "location_id": loc_id,
                "lat": 23.1765 + (hash(loc_id) % 100) * 0.001,  # Simulated coordinates
                "lng": 75.7885 + (hash(loc_id) % 100) * 0.001,
                "intensity": detection.density_level,
                "crowd_count": detection.crowd_count,
                "radius": min(50 + detection.crowd_count / 50, 200),  # Dynamic radius
                "color": _get_density_color(detection.density_level),
                "status": _get_density_status(detection.density_level)
            })
        
        return {
            "status": "success",
            "heatmap_data": heatmap_data,
            "legend": {
                "low": {"color": "#43e97b", "range": "0-50%"},
                "medium": {"color": "#ffd700", "range": "50-75%"},
                "high": {"color": "#ff8c00", "range": "75-90%"},
                "critical": {"color": "#f5576c", "range": "90-100%"}
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heatmap generation failed: {str(e)}")

def _get_density_color(density: float) -> str:
    """Get color based on crowd density"""
    if density >= 0.9:
        return "#f5576c"  # Critical - Red
    elif density >= 0.75:
        return "#ff8c00"  # High - Orange
    elif density >= 0.5:
        return "#ffd700"  # Medium - Yellow
    else:
        return "#43e97b"  # Low - Green

def _get_density_status(density: float) -> str:
    """Get status based on crowd density"""
    if density >= 0.9:
        return "critical"
    elif density >= 0.75:
        return "high"
    elif density >= 0.5:
        return "medium"
    else:
        return "low"

@router.get("/predictions")
async def get_crowd_predictions(
    location_id: Optional[str] = None,
    hours_ahead: int = Query(default=2, ge=1, le=24)
):
    """Get crowd predictions for locations"""
    try:
        predictions = []
        current_time = datetime.now()
        
        locations_to_predict = [location_id] if location_id else list(crowd_engine.current_detections.keys())
        
        for loc_id in locations_to_predict:
            if loc_id not in crowd_engine.current_detections:
                continue
                
            current_detection = crowd_engine.current_detections[loc_id]
            
            # Generate hourly predictions
            hourly_predictions = []
            for hour in range(1, hours_ahead + 1):
                future_time = current_time + timedelta(hours=hour)
                
                # Simulate prediction based on historical patterns
                base_density = current_detection.density_level
                time_factor = crowd_engine._get_time_based_multiplier(
                    _get_location_type(loc_id), 
                    future_time.hour
                )
                
                predicted_density = min(base_density * time_factor * 0.9, 1.0)  # 0.9 for prediction uncertainty
                predicted_crowd = int(predicted_density * _get_location_capacity(loc_id))
                
                hourly_predictions.append({
                    "time": future_time.isoformat(),
                    "predicted_density": round(predicted_density * 100, 1),
                    "predicted_crowd": predicted_crowd,
                    "confidence": round(crowd_engine.prediction_models["density_prediction"]["accuracy"] * 100, 1),
                    "recommendation": _get_prediction_recommendation(predicted_density)
                })
            
            predictions.append({
                "location_id": loc_id,
                "current_density": round(current_detection.density_level * 100, 1),
                "predictions": hourly_predictions,
                "next_peak": current_detection.predicted_peak.isoformat() if current_detection.predicted_peak else None
            })
        
        return {
            "status": "success",
            "predictions": predictions,
            "model_info": {
                "accuracy": crowd_engine.prediction_models["density_prediction"]["accuracy"],
                "prediction_horizon": f"{hours_ahead} hours",
                "last_trained": "2024-01-10T08:00:00Z"
            },
            "timestamp": current_time.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction generation failed: {str(e)}")

def _get_location_type(location_id: str) -> str:
    """Get location type from location ID"""
    if "ghat" in location_id:
        return "ghat"
    elif "temple" in location_id:
        return "temple"
    elif "transport" in location_id:
        return "transport"
    elif "food" in location_id:
        return "food"
    elif "parking" in location_id:
        return "parking"
    else:
        return "general"

def _get_location_capacity(location_id: str) -> int:
    """Get location capacity"""
    capacities = {
        "main_ghat": 5000,
        "mahakal_temple": 8000,
        "shipra_ghat_1": 3000,
        "transport_hub_central": 2000,
        "food_court_1": 800
    }
    return capacities.get(location_id, 1000)

def _get_prediction_recommendation(predicted_density: float) -> str:
    """Get recommendation based on predicted density"""
    if predicted_density >= 0.9:
        return "Avoid - Extremely crowded"
    elif predicted_density >= 0.75:
        return "Caution - Very crowded"
    elif predicted_density >= 0.5:
        return "Moderate - Plan accordingly"
    else:
        return "Good time to visit"

@router.get("/flow-analysis")
async def get_crowd_flow_analysis():
    """Get crowd flow analysis across all locations"""
    try:
        flow_data = []
        
        for loc_id, detection in crowd_engine.current_detections.items():
            flow_data.append({
                "location_id": loc_id,
                "current_flow_rate": round(detection.flow_rate, 1),
                "movement_patterns": detection.movement_patterns,
                "bottlenecks": _identify_bottlenecks(detection),
                "flow_direction": _analyze_flow_direction(detection),
                "efficiency_score": _calculate_flow_efficiency(detection)
            })
        
        # Calculate overall flow metrics
        total_flow = sum(detection.flow_rate for detection in crowd_engine.current_detections.values())
        avg_efficiency = sum(_calculate_flow_efficiency(detection) for detection in crowd_engine.current_detections.values()) / len(crowd_engine.current_detections)
        
        return {
            "status": "success",
            "flow_analysis": {
                "locations": flow_data,
                "total_flow_rate": round(total_flow, 1),
                "average_efficiency": round(avg_efficiency, 2),
                "peak_flow_location": max(flow_data, key=lambda x: x["current_flow_rate"])["location_id"],
                "bottleneck_locations": [loc["location_id"] for loc in flow_data if loc["bottlenecks"]]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow analysis failed: {str(e)}")

def _identify_bottlenecks(detection) -> List[str]:
    """Identify potential bottlenecks"""
    bottlenecks = []
    
    if detection.movement_patterns.get("stationary", 0) > 0.6:
        bottlenecks.append("High stationary crowd")
    
    if detection.density_level > 0.8 and detection.flow_rate < 100:
        bottlenecks.append("Low flow despite high density")
    
    if detection.movement_patterns.get("entering", 0) > detection.movement_patterns.get("exiting", 0) * 1.5:
        bottlenecks.append("Entry exceeds exit capacity")
    
    return bottlenecks

def _analyze_flow_direction(detection) -> Dict[str, float]:
    """Analyze primary flow directions"""
    return {
        "inbound": detection.movement_patterns.get("entering", 0),
        "outbound": detection.movement_patterns.get("exiting", 0),
        "circulation": detection.movement_patterns.get("slow_moving", 0) + detection.movement_patterns.get("fast_moving", 0),
        "stagnation": detection.movement_patterns.get("stationary", 0)
    }

def _calculate_flow_efficiency(detection) -> float:
    """Calculate flow efficiency score (0-1)"""
    # Higher efficiency = good flow rate relative to density
    if detection.density_level == 0:
        return 1.0
    
    expected_flow = detection.density_level * 200  # Expected flow based on density
    actual_flow = detection.flow_rate
    
    efficiency = min(actual_flow / expected_flow, 1.0) if expected_flow > 0 else 1.0
    
    # Penalize high stationary percentage
    stationary_penalty = detection.movement_patterns.get("stationary", 0) * 0.5
    
    return max(0, efficiency - stationary_penalty)

@router.post("/update")
async def update_crowd_data():
    """Manually trigger crowd data update (for testing/admin)"""
    try:
        crowd_engine.update_crowd_data()
        return {
            "status": "success",
            "message": "Crowd data updated successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.get("/demographics")
async def get_crowd_demographics():
    """Get demographic analysis of current crowds"""
    try:
        demographics = {
            "overall_age_distribution": {},
            "overall_gender_distribution": {},
            "location_demographics": []
        }
        
        # Aggregate demographics across all locations
        total_crowd = sum(detection.crowd_count for detection in crowd_engine.current_detections.values())
        
        age_totals = {}
        gender_totals = {}
        
        for detection in crowd_engine.current_detections.values():
            weight = detection.crowd_count / total_crowd if total_crowd > 0 else 0
            
            for age_group, percentage in detection.age_distribution.items():
                age_totals[age_group] = age_totals.get(age_group, 0) + (percentage * weight)
            
            for gender, percentage in detection.gender_distribution.items():
                gender_totals[gender] = gender_totals.get(gender, 0) + (percentage * weight)
        
        demographics["overall_age_distribution"] = {k: round(v, 3) for k, v in age_totals.items()}
        demographics["overall_gender_distribution"] = {k: round(v, 3) for k, v in gender_totals.items()}
        
        # Location-specific demographics
        for loc_id, detection in crowd_engine.current_detections.items():
            demographics["location_demographics"].append({
                "location_id": loc_id,
                "crowd_count": detection.crowd_count,
                "age_distribution": detection.age_distribution,
                "gender_distribution": detection.gender_distribution
            })
        
        return {
            "status": "success",
            "demographics": demographics,
            "total_crowd_analyzed": total_crowd,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demographics analysis failed: {str(e)}")

from datetime import timedelta