from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice
from app.api.endpoints.predict import predict_actual_aqi

# 1. Initialize the FastAPI app
app = FastAPI(
    title="GreenNav API",
    description="Backend for Air Quality Prediction and Personalized Exposure Tracking",
    version="1.0.0"
)

# 2. Add CORS Middleware (Essential for Frontend integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Data Schemas for Route Comparison
class RoutePoint(BaseModel):
    lat: float
    lon: float
    time_spent_minutes: float

class RouteRequest(BaseModel):
    route_name: str
    points: List[RoutePoint]
    activity: str = "walking"

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {
        "status": "Online",
        "message": "Welcome to GreenNav API - Data Integration & Logic Core Active",
        "documentation": "/docs"
    }

@app.get("/predict")
async def get_prediction(lat: float, lon: float, hour: int = None):
    """Person A's ML Prediction Hooked to Live Weather"""
    prediction = predict_actual_aqi(lat, lon, hour)
    advice = get_health_advice(prediction)
    
    return {
        "status": "Success",
        "input_location": {"lat": lat, "lon": lon},
        "ml_result": {
            "predicted_aqi": prediction,
            "category": advice["level"],
            "guidance": advice["advice"]
        },
        "source": "XGBoost Regressor"
    }

@app.post("/compare-routes")
async def compare_routes(routes: List[RouteRequest]):
    """Hero Feature: Calculates total pollution exposure for multiple routes."""
    results = []
    for route in routes:
        total_exposure = 0
        for point in route.points:
            # INTEGRATION: Use ML prediction if it's a future hour, else live data
            # For now, we use live data as the primary source
            data = get_live_aqi(point.lat, point.lon)
            aqi = data["aqi"] if (data and "aqi" in data) else 50 
            
            segment_score = calculate_exposure(aqi, point.time_spent_minutes, route.activity)
            total_exposure += segment_score
            
        results.append({
            "route_name": route.route_name,
            "total_pollution_load": round(total_exposure, 2)
        })
    
    results.sort(key=lambda x: x["total_pollution_load"])
    return {
        "comparison": results,
        "recommendation": f"The cleanest route is {results[0]['route_name']}"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}