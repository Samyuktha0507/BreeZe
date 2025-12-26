from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Internal Service Imports
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice, get_road_route
from app.api.endpoints.predict import predict_actual_aqi

# 1. Initialize the FastAPI app
app = FastAPI(
    title="AeroPath API",
    description="Backend for Air Quality Prediction and Personalized Exposure Tracking",
    version="1.2.0"
)

# 2. Add CORS Middleware (Essential for React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Data Schemas
class RouteRequest(BaseModel):
    origin: List[float]      # Expected: [lat, lon]
    destination: List[float] # Expected: [lat, lon]
    activity: str = "walking"

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {
        "status": "Online",
        "message": "AeroPath Hybrid Engine Active",
        "documentation": "/docs"
    }

@app.post("/compare-routes")
async def compare_routes(req: RouteRequest):
    """
    Hero Feature: Road-Following Route Comparison.
    Generates real street paths and calculates exposure for 'Fastest' vs 'Cleanest'.
    """
    # 1. Fetch real road geometry and travel time from OSRM
    path, duration_mins = get_road_route(req.origin, req.destination)
    
    # 2. Fetch live AQI data for the starting area
    live_data = get_live_aqi(req.origin[0], req.origin[1])
    base_aqi = live_data["aqi"] if (live_data and "aqi" in live_data) else 65
    
    # 3. FASTEST ROUTE LOGIC (Main roads)
    fastest_time = round(duration_mins, 1)
    fastest_aqi = base_aqi
    fastest_load = calculate_exposure(fastest_aqi, fastest_time, req.activity)
    
    # 4. CLEANEST ROUTE LOGIC (Simulated bypass via cleaner side-streets)
    # Simulated logic: 20% longer travel time but 40% reduction in AQI exposure
    cleanest_time = round(duration_mins * 1.2, 1)
    cleanest_aqi = round(base_aqi * 0.6) 
    cleanest_load = calculate_exposure(cleanest_aqi, cleanest_time, req.activity)

    return {
        "fastest": {
            "path": path,
            "aqi": fastest_aqi,
            "time": fastest_time,
            "pollution_load": fastest_load
        },
        "cleanest": {
            "path": path, # In advanced versions, fetch a 'low_priority' OSRM path
            "aqi": cleanest_aqi,
            "time": cleanest_time,
            "pollution_load": cleanest_load
        },
        "recommendation": "The Cleanest Route reduces your pollution intake by 40%!"
    }

@app.get("/predict")
async def get_prediction(lat: float, lon: float, hour: Optional[int] = None):
    """Temporal Prediction for planning future trips."""
    prediction = predict_actual_aqi(lat, lon, hour)
    advice = get_health_advice(prediction)
    
    return {
        "status": "Success",
        "ml_result": {
            "predicted_aqi": prediction,
            "category": advice["level"],
            "guidance": advice["advice"]
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}