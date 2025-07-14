from fastapi import APIRouter
from services.map_service import get_geojson_map
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/geojson/")
async def fetch_geojson():
    """
    Return simplified GeoJSON map features with zones and overlays
    """
    geojson_data = get_geojson_map()
    return JSONResponse(content=geojson_data) 