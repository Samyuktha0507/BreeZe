from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import requests
from datetime import datetime

# Internal Service Imports
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice, get_road_route
from app.api.endpoints.predict import predict_actual_aqi

app = FastAPI(title="BreeZe API", version="1.5.0")

# 1. CORS Middleware - Essential for React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Data Schemas
class RouteRequest(BaseModel):
    origin: List[float]      # [lat, lon]
    destination: List[float] # [lat, lon]
    activity: str = "walking"

# --- MODULE 1: ML HEATMAP ENDPOINT ---
@app.get("/heatmap-data")
async def get_heatmap_data(lat: float, lon: float):
    """Generates a grid of predictions for the heatmap visualization"""
    points = []
    # Create a 7x7 grid of points around the user location (roughly 10km x 10km)
    for i in range(-3, 4):
        for j in range(-3, 4):
            # 0.015 degrees is roughly 1.6km
            p_lat = lat + (i * 0.015)
            p_lon = lon + (j * 0.015)
            
            # Call your ML model prediction function
            aqi_prediction = predict_actual_aqi(p_lat, p_lon)
            
            # Format: [lat, lon, intensity/weight]
            points.append([p_lat, p_lon, aqi_prediction])
            
    return {"heatmap_points": points}

# --- MODULE 2: GREEN ROUTE COMPARISON ---
@app.post("/compare-routes")
async def compare_routes(req: RouteRequest):
    # 1. Get FASTEST Path (Direct from OSRM)
    path_fast, duration_fast = get_road_route(req.origin, req.destination)
    
    # 2. Generate CLEANEST Path (Forced detour via waypoint nudge)
    mid_lat = (req.origin[0] + req.destination[0]) / 2 + 0.004 
    mid_lon = (req.origin[1] + req.destination[1]) / 2 + 0.004
    url_clean = f"http://router.project-osrm.org/route/v1/driving/{req.origin[1]},{req.origin[0]};{mid_lon},{mid_lat};{req.destination[1]},{req.destination[0]}?overview=full&geometries=geojson"
    
    try:
        res_clean = requests.get(url_clean).json()
        path_clean = [[p[1], p[0]] for p in res_clean['routes'][0]['geometry']['coordinates']]
        duration_clean = res_clean['routes'][0]['duration'] / 60
    except:
        path_clean, duration_clean = path_fast, duration_fast * 1.2

    # 3. AQI logic from Live API
    live_data = get_live_aqi(req.origin[0], req.origin[1])
    base_aqi = live_data["aqi"] if (live_data and "aqi" in live_data) else 75
    
    return {
        "fastest": {
            "path": path_fast,
            "aqi": base_aqi,
            "time": round(duration_fast, 1),
            "pollution_load": calculate_exposure(base_aqi, duration_fast, req.activity)
        },
        "cleanest": {
            "path": path_clean,
            "aqi": round(base_aqi * 0.55), # Simulated 45% cleaner air on side streets
            "time": round(duration_clean, 1),
            "pollution_load": calculate_exposure(base_aqi * 0.55, duration_clean, req.activity)
        }
    }

# --- MODULE 3: PLAN SCHEDULER ---
@app.get("/scheduler-advice")
async def get_scheduler_advice(lat: float, lon: float):
    """Predicts a schedule based on ML temporal patterns"""
    # Sample different times of day
    hours_to_test = [6, 9, 13, 18, 21] # Early morning, Rush, Afternoon, Evening Rush, Night
    schedule = []
    
    for test_hour in hours_to_test:
        aqi_val = predict_actual_aqi(lat, lon, test_hour)
        advice = get_health_advice(aqi_val)
        
        schedule.append({
            "hour": f"{test_hour}:00",
            "aqi": aqi_val,
            "status": advice["level"],
            "is_safe": aqi_val < 100
        })
    return {"schedule": schedule}

# --- MODULE 4 & 5: PREDICT & HEALTH ---
@app.get("/predict")
async def get_prediction(lat: float, lon: float, hour: Optional[int] = None):
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

@app.get("/")
async def root():
    return {"status": "Online", "project": "BreeZe"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}