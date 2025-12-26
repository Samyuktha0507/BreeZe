import requests

def calculate_exposure(aqi: float, duration_minutes: float, activity_type: str = "walking"):
    """Calculates the pollution load based on AQI and activity level."""
    activity_factors = {
        "resting": 0.7,
        "walking": 1.0,
        "running": 2.5,
        "cycling": 2.0
    }
    factor = activity_factors.get(activity_type.lower(), 1.0)
    duration_hours = duration_minutes / 60
    exposure_score = aqi * duration_hours * factor
    return round(exposure_score, 2)

def get_health_advice(aqi: float):
    """Returns status and advice based on AQI thresholds."""
    if aqi <= 50:
        return {"level": "Good", "advice": "Air is fresh. Great for a run!"}
    elif aqi <= 100:
        return {"level": "Moderate", "advice": "Sensitive people should limit outdoor time."}
    elif aqi <= 150:
        return {"level": "Unhealthy", "advice": "Wear a mask if you have asthma."}
    else:
        return {"level": "Hazardous", "advice": "Avoid outdoors. Use an air purifier."}

def get_road_route(start_coords, end_coords):
    """Fetches real road geometry from OSRM API."""
    try:
        # OSRM expects [lon, lat]
        url = f"http://router.project-osrm.org/route/v1/driving/{start_coords[1]},{start_coords[0]};{end_coords[1]},{end_coords[0]}?overview=full&geometries=geojson"
        response = requests.get(url).json()
        
        if response.get('routes'):
            # Extract points and flip to [lat, lon] for Leaflet
            path = [[p[1], p[0]] for p in response['routes'][0]['geometry']['coordinates']]
            duration_mins = response['routes'][0]['duration'] / 60
            return path, duration_mins
        return [start_coords, end_coords], 10.0
    except Exception as e:
        print(f"OSRM Error: {e}")
        return [start_coords, end_coords], 10.0