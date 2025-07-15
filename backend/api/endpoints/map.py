from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from models.poi import POI
from services.map_service import SessionLocal, load_osm_pois
from pydantic import BaseModel

router = APIRouter()

# --- Pydantic Schemas ---
class POISchema(BaseModel):
    id: int
    name: str
    type: Optional[str]
    lat: float
    lon: float
    accessibility: Optional[str]
    extra: Optional[dict]
    class Config:
        orm_mode = True

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---
@router.get("/pois", response_model=List[POISchema])
def list_pois(
    type: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    radius: Optional[float] = Query(None, description="Radius in meters for proximity search"),
    bbox: Optional[str] = Query(None, description="Bounding box: minlat,minlon,maxlat,maxlon"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(POI)
    if type:
        query = query.filter(POI.type == type)
    if name:
        query = query.filter(POI.name.ilike(f"%{name}%"))
    if bbox:
        try:
            minlat, minlon, maxlat, maxlon = map(float, bbox.split(","))
            query = query.filter(POI.lat >= minlat, POI.lat <= maxlat, POI.lon >= minlon, POI.lon <= maxlon)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid bbox format")
    if lat is not None and lon is not None and radius:
        # Simple haversine filter (not as fast as PostGIS/Redis, but works for now)
        from math import radians, cos, sin, asin, sqrt
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371000  # meters
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            return R * c
        pois = query.all()
        pois = [p for p in pois if haversine(lat, lon, p.lat, p.lon) <= radius]
        return pois[skip:skip+limit]
    return query.offset(skip).limit(limit).all()

@router.get("/pois/{poi_id}", response_model=POISchema)
def get_poi(poi_id: int, db: Session = Depends(get_db)):
    poi = db.query(POI).filter(POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return poi

@router.get("/pois/nearest", response_model=List[POISchema])
def nearest_pois(
    lat: float = Query(...),
    lon: float = Query(...),
    limit: int = 10,
    db: Session = Depends(get_db),
):
    from math import radians, cos, sin, asin, sqrt
    def haversine(lat1, lon1, lat2, lon2):
        R = 6371000  # meters
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        return R * c
    pois = db.query(POI).all()
    pois = sorted(pois, key=lambda p: haversine(lat, lon, p.lat, p.lon))
    return pois[:limit]

@router.get("/map/locations/real")
def get_real_locations():
    """Return real ghats, safe zones, and transport hubs from OSM data."""
    return load_osm_pois() 