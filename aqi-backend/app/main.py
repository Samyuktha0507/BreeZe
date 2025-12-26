from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import requests

# Internal Service Imports
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice, get_road_route
from app.api.endpoints.predict import predict_actual_aqi

app = FastAPI(title="AeroPath API", version="1.3.0")

# Enable CORS for your React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    origin: List[float]      # [lat, lon]
    destination: List[float] # [lat, lon]
    activity: str = "walking"

@app.post("/compare-routes")
async def compare_routes(req: RouteRequest):
    """
    Calculates two distinct paths: 
    1. Fastest (direct road) 
    2. Cleanest (detour through simulated low-traffic areas)
    """
    # 1. Get FASTEST Path
    path_fast, duration_fast = get_road_route(req.origin, req.destination)
    
    # 2. Generate CLEANEST Path (Forcing a detour)
    # We create a waypoint by shifting the midpoint slightly
    mid_lat = (req.origin[0] + req.destination[0]) / 2 + 0.004 
    mid_lon = (req.origin[1] + req.destination[1]) / 2 + 0.004
    
    url_clean = f"http://router.project-osrm.org/route/v1/driving/{req.origin[1]},{req.origin[0]};{mid_lon},{mid_lat};{req.destination[1]},{req.destination[0]}?overview=full&geometries=geojson"
    
    try:
        res_clean = requests.get(url_clean).json()
        path_clean = [[p[1], p[0]] for p in res_clean['routes'][0]['geometry']['coordinates']]
        duration_clean = res_clean['routes'][0]['duration'] / 60
    except:
        # Fallback if waypoint routing fails
        path_clean, duration_clean = path_fast, duration_fast * 1.2

    # 3. Get AQI Data
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
            "aqi": round(base_aqi * 0.55), # Simulate 45% cleaner air on side streets
            "time": round(duration_clean, 1),
            "pollution_load": calculate_exposure(base_aqi * 0.55, duration_clean, req.activity)
        }
    }

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

@app.get("/health")
async def health_check():
    return {"status": "healthy"}