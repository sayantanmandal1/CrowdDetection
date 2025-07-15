from fastapi import APIRouter, Query
from services.routing_service import compute_smart_path
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/smart-path/")
async def get_smart_path(
    start: str = Query(...),
    end: str = Query(...),
    user_type: str = Query("public", description="User type: public, VIP, Divyangjan, elderly")
):
    """
    Return the best available route between two nodes, considering user type (public, VIP, Divyangjan, elderly)
    """
    result = compute_smart_path(start, end, user_type)
    return JSONResponse(content=result) 