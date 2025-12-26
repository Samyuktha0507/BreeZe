from fastapi import FastAPI, Query
from app.services.maps_api import get_live_aqi
from app.services.exposure_calc import calculate_exposure, get_health_advice

# 1. Initialize the FastAPI app
app = FastAPI(
    title="GreenNav API",
    description="Backend for Air Quality Prediction and Personalized Exposure Tracking",
    version="1.0.0"
)

# 2. Root Endpoint - Basic Health Check
@app.get("/")
async def root():
    return {
        "status": "Online",
        "message": "Welcome to GreenNav API - Data Integration & Logic Core Active",
        "documentation": "/docs"
    }

# 3. Simple Test Endpoint - Fetch Raw Data from WAQI
@app.get("/test-live-data")
async def test_api(
    lat: float = Query(28.6139, description="Latitude of the location"), 
    lon: float = Query(77.2090, description="Longitude of the location")
):
    """Fetches real-time AQI data for specific coordinates."""
    data = get_live_aqi(lat, lon)
    if data:
        return {"status": "success", "data": data}
    return {"status": "error", "message": "Could not fetch data from WAQI API. Check your .env key."}

# 4. Smart Endpoint - Personalized Health & Exposure Analysis
@app.get("/analyze-air")
async def analyze_air(
    lat: float, 
    lon: float, 
    activity: str = Query("walking", enum=["resting", "walking", "running", "cycling"]), 
    duration: int = Query(60, description="Duration in minutes")
):
    """
    Calculates the 'Pollution Load' based on real-time data and user activity.
    Hero Feature Logic for Person B.
    """
    # Step A: Get Live Data
    raw_data = get_live_aqi(lat, lon)
    
    if not raw_data:
        return {"error": "Could not fetch air quality data"}
    
    aqi = raw_data["aqi"]
    
    # Step B: Calculate personalized metrics using our Service logic
    health = get_health_advice(aqi)
    exposure = calculate_exposure(aqi, duration, activity)
    
    return {
        "location": {
            "city": raw_data["city"],
            "latitude": lat,
            "longitude": lon
        },
        "air_quality": {
            "current_aqi": aqi,
            "status": health["level"],
            "recommendation": health["advice"]
        },
        "personalized_impact": {
            "estimated_exposure_score": exposure,
            "activity_context": f"{activity} for {duration} minutes",
            "formula_used": "AQI * Time(hrs) * Activity_Factor"
        }
    }

# 5. Health Check for the server
@app.get("/health")
async def health_check():
    return {"status": "healthy"}