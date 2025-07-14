from fastapi import APIRouter, Query
from services.routing_service import compute_safe_path
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/safe-path/")
async def get_safe_path(start: str = Query(...), end: str = Query(...)):
    """
    Return safest available route between two nodes (e.g., 'A' to 'F')
    """
    result = compute_safe_path(start, end)
    return JSONResponse(content=result) 