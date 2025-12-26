import requests

def get_weather_data(lat: float, lon: float):
    """
    Fetches real-time weather from Open-Meteo (No API Key Required).
    """
    # We ask only for the variables your model needs: Temp and Humidity
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=1"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            current = data["current"]
            return {
                "temp": current["temperature_2m"],
                "humidity": current["relative_humidity_2m"],
                "wind_speed": current["wind_speed_10m"]
            }
    except Exception as e:
        print(f"Weather API Error: {e}")
    
    # Fallback values if the internet is down or API fails
    return {"temp": 25.0, "humidity": 50.0, "wind_speed": 10.0}