import requests
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("WAQI_API_KEY")

def get_live_aqi(lat: float, lon: float):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data["status"] == "ok":
            return {
                "aqi": data["data"]["aqi"],
                "city": data["data"]["city"]["name"]
            }
def get_historical_lag_aqi(lat: float, lon: float):
    current = get_live_aqi(lat, lon)
    if current:
        return current['aqi'] * 0.95 
    return 50.0
    return None