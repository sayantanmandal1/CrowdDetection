from fastapi import APIRouter, Query
from services.alert_service import generate_alert
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/")
async def alert_system(location_id: str = Query(...), people_count: int = Query(...), fire: bool = False, stampede: bool = False):
    """
    Compute emergency alert level based on input parameters
    """
    alert = generate_alert(location_id, people_count, fire, stampede)
    return JSONResponse(content=alert) 