from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import crowd, prediction, map, alerts, routing

app = FastAPI(title="Crowd Intelligence API", version="1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(crowd.router, prefix="/crowd", tags=["Crowd Detection"])
app.include_router(prediction.router, prefix="/predict", tags=["Crowd Prediction"])
app.include_router(map.router, prefix="/map", tags=["Map GeoJSON"])
app.include_router(alerts.router, prefix="/alerts", tags=["Emergency Alerts"])
app.include_router(routing.router, prefix="/routes", tags=["Routing"]) 