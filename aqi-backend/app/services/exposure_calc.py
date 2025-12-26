import requests
import math

def calculate_exposure(aqi: float, duration_minutes: float, activity_type: str = "walking"):
    """
    Calculates the pollution load based on AQI and activity level.
    Used for Module 2 (Routing) and Module 5 (Virtual Lung).
    """
    activity_factors = {
        "resting": 0.7,
        "walking": 1.0,
        "cycling": 1.5,
        "running": 2.5,
        "heavy_exercise": 3.0
    }
    
    factor = activity_factors.get(activity_type.lower(), 1.0)
    duration_hours = duration_minutes / 60
    
    # Formula: AQI * Time * Breathing Rate Factor
    exposure_score = aqi * duration_hours * factor
    return round(exposure_score, 2)

def get_health_advice(aqi: float):
    """
    Returns risk status and actionable advice.
    Used for Module 1, 3, and 5.
    """
    if aqi <= 50:
        return {"level": "Good", "advice": "Air is fresh. Great for outdoor exercise!"}
    elif aqi <= 100:
        return {"level": "Moderate", "advice": "Acceptable quality. Sensitive people should monitor symptoms."}
    elif aqi <= 150:
        return {"level": "Unhealthy", "advice": "Sensitive groups should reduce prolonged outdoor exertion."}
    elif aqi <= 200:
        return {"level": "Very Unhealthy", "advice": "Everyone should limit outdoor time. Wear an N95 mask."}
    else:
        return {"level": "Hazardous", "advice": "Health warning: everyone should avoid all outdoor exertion."}

def get_road_route(start_coords, end_coords):
    """
    Fetches real road geometry from OSRM API.
    Handles coordinate flipping for Leaflet compatibility.
    """
    try:
        # OSRM API expects [longitude, latitude]
        url = f"http://router.project-osrm.org/route/v1/driving/{start_coords[1]},{start_coords[0]};{end_coords[1]},{end_coords[0]}?overview=full&geometries=geojson"
        response = requests.get(url, timeout=5).json()
        
        if response.get('routes'):
            # Extract road coordinates and flip them to [lat, lon] for the Frontend
            path = [[p[1], p[0]] for p in response['routes'][0]['geometry']['coordinates']]
            duration_mins = response['routes'][0]['duration'] / 60
            return path, duration_mins
            
        # Fallback to straight line if no route found
        return [start_coords, end_coords], 10.0
    except Exception as e:
        print(f"OSRM Routing Error: {e}")
        return [start_coords, end_coords], 10.0

def get_detour_waypoint(start, end):
    """
    Helper for Module 2: Generates a 'nudge' coordinate to force
    OSRM to calculate a different path for the 'Cleanest Route'.
    """
    mid_lat = (start[0] + end[0]) / 2
    mid_lon = (start[1] + end[1]) / 2
    
    # Nudge the midpoint by approx 500m to find alternative streets
    return [mid_lat + 0.004, mid_lon + 0.004]

def get_pollutant_breakdown(aqi: float):
    """
    Helper for Module 1: Simulates individual pollutant levels
    based on the predicted AQI for the Heatmap breakdown.
    """
    return {
        "pm25": round(aqi * 0.45, 1),
        "pm10": round(aqi * 0.72, 1),
        "no2": round(aqi * 0.15, 1),
        "co": round(aqi * 0.01, 2)
    }