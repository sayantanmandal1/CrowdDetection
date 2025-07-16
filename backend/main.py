from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import crowd, prediction, map, alerts, routing
from api import router as api_router

app = FastAPI(title="AI-Powered Smart Mobility Platform", version="2.0", description="Comprehensive smart mobility solution for Simhastha 2028")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🚀 AI-Powered Smart Mobility Platform for Simhastha 2028",
        "version": "2.0",
        "status": "operational",
        "features": [
            "AI-powered route optimization",
            "Real-time crowd analysis",
            "Universal accessibility support",
            "Dynamic transport integration",
            "Emergency response system"
        ]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-15T10:30:00Z",
        "services": {
            "ai_routing_engine": "operational",
            "crowd_prediction": "operational",
            "real_time_data": "operational",
            "transport_integration": "operational",
            "emergency_system": "operational"
        }
    }

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
app.include_router(alerts.router, prefix="/alerts", tags=["Emergency Alerts"])
app.include_router(routing.router, prefix="/routes", tags=["Routing"])
app.include_router(routing.router, prefix="/transport", tags=["Transport"])
app.include_router(routing.router, prefix="/infrastructure", tags=["Infrastructure"])
app.include_router(api_router) 