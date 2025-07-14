from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CrowdDetectionResult(BaseModel):
    people_count: int = Field(..., description="Total number of people detected in the image")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Detection timestamp")
    location_id: Optional[str] = Field(None, description="Optional location tag for detection") 