from fastapi import FastAPI, Query
from typing import List
from pydantic import BaseModel
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice

# 1. Initialize the FastAPI app
app = FastAPI(
    title="GreenNav API",
    description="Backend for Air Quality Prediction and Personalized Exposure Tracking",
    version="1.0.0"
)

# --- DATA SCHEMAS FOR POST REQUESTS ---

class RoutePoint(BaseModel):
    lat: float
    lon: float
    time_spent_minutes: float

class RouteRequest(BaseModel):
    route_name: str
    points: List[RoutePoint]
    activity: str = "walking"

# --- ENDPOINTS ---

# 2. Root Endpoint
@app.get("/")
async def root():
    return {
        "status": "Online",
        "message": "Welcome to GreenNav API - Logic Core Active",
        "documentation": "/docs"
    }

# 3. Simple Test Endpoint - Fetch Raw Data from WAQI
@app.get("/test-live-data")
async def test_api(
    lat: float = Query(28.6139, description="Latitude"), 
    lon: float = Query(77.2090, description="Longitude")
):
    """Fetches real-time AQI data for specific coordinates."""
    data = get_live_aqi(lat, lon)
    if data:
        return {"status": "success", "data": data}
    return {"status": "error", "message": "Could not fetch data. Check WAQI_API_KEY."}

# 4. Smart Endpoint - Single Location Analysis
@app.get("/analyze-air")
async def analyze_air(
    lat: float, 
    lon: float, 
    activity: str = Query("walking", enum=["resting", "walking", "running", "cycling"]), 
    duration: int = Query(60, description="Duration in minutes")
):
    """Calculates personalized impact for one location."""
    raw_data = get_live_aqi(lat, lon)
    if not raw_data:
        return {"error": "Could not fetch air quality data"}
    
    aqi = raw_data["aqi"]
    health = get_health_advice(aqi)
    exposure = calculate_exposure(aqi, duration, activity)
    
    return {
        "location": raw_data["city"],
        "current_aqi": aqi,
        "health_status": health["level"],
        "recommendation": health["advice"],
        "estimated_exposure_score": exposure
    }

# 5. Hero Feature - Route Comparison (POST Request)
@app.post("/compare-routes")
async def compare_routes(routes: List[RouteRequest]):
    """
    Takes multiple routes and calculates total pollution exposure for each.
    Helps Person C show 'Fastest' vs 'Cleanest'.
    """
    results = []
    
    for route in routes:
        total_exposure = 0
        
        for point in route.points:
            # Fetch AQI for each point in the route
            data = get_live_aqi(point.lat, point.lon)
            # Default to 50 if API fails
            aqi = data["aqi"] if (data and "aqi" in data) else 50 
            
            # Calculate exposure for this segment
            segment_score = calculate_exposure(aqi, point.time_spent_minutes, route.activity)
            total_exposure += segment_score
            
        results.append({
            "route_name": route.route_name,
            "total_pollution_load": round(total_exposure, 2)
        })
        
    # Sort results by lowest pollution load
    results.sort(key=lambda x: x["total_pollution_load"])
    
    return {
        "comparison": results,
        "recommendation": f"The cleanest route is {results[0]['route_name']}"
    }

# 6. Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}