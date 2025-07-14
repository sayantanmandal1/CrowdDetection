from pydantic import BaseModel, Field
from typing import List, Dict, Union

class Geometry(BaseModel):
    type: str = Field(..., description="Geometry type (Point, Polygon, etc.)")
    coordinates: Union[List[float], List[List[float]], List[List[List[float]]]] = Field(..., description="GeoJSON coordinates")

class GeoFeature(BaseModel):
    type: str = Field(default="Feature")
    properties: Dict[str, Union[str, int, float]] = Field(..., description="Feature properties")
    geometry: Geometry = Field(..., description="Geometry object")

class GeoJSONMap(BaseModel):
    type: str = Field(default="FeatureCollection")
    features: List[GeoFeature] = Field(..., description="List of geo features") 