from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class PredictionItem(BaseModel):
    ds: datetime = Field(..., description="Timestamp for prediction")
    yhat: float = Field(..., description="Predicted crowd density")

class CrowdPredictionResponse(BaseModel):
    location_id: str = Field(..., description="Location ID for the forecast")
    forecast: List[PredictionItem] = Field(..., description="List of forecasted crowd densities") 