from fastapi import APIRouter
from services.map_service import get_geojson_map, get_public_transport, get_shuttles, get_live_vehicles, get_accessible_facilities
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/geojson/")
async def fetch_geojson():
    """
    Return simplified GeoJSON map features with zones and overlays
    """
    geojson_data = get_geojson_map()
    return JSONResponse(content=geojson_data)

@router.get("/public-transport/")
async def fetch_public_transport():
    """
    Return GeoJSON for public transport stops (bus, train, etc.)
    """
    data = get_public_transport()
    return JSONResponse(content=data)

@router.get("/shuttles/")
async def fetch_shuttles():
    """
    Return GeoJSON for shuttle routes
    """
    data = get_shuttles()
    return JSONResponse(content=data)

@router.get("/live-vehicles/")
async def fetch_live_vehicles():
    """
    Return GeoJSON for live vehicle locations (buses, shuttles)
    """
    data = get_live_vehicles()
    return JSONResponse(content=data)

@router.get("/accessible/")
async def fetch_accessible_facilities():
    """
    Return GeoJSON for accessible facilities/zones only
    """
    data = get_accessible_facilities()
    return JSONResponse(content=data) 