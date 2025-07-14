from fastapi import APIRouter, Query
from services.predictor import forecast_crowd_density
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/density/")
async def get_crowd_prediction(location_id: str = Query(...), hours_ahead: int = Query(3)):
    """
    Predict crowd density for the next few hours at a location
    """
    prediction = forecast_crowd_density(location_id, hours_ahead)
    return JSONResponse(content=prediction) 