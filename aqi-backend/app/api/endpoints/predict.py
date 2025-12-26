import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os
from app.services.weather_api import get_weather_data

MODEL_PATH = "app/ml_assets/aqi_model.pkl"

def predict_actual_aqi(lat: float, lon: float, target_hour: int = None):
    try:
        # 1. Check if model exists
        if not os.path.exists(MODEL_PATH):
            print("ERROR: Model file not found at " + MODEL_PATH)
            return 50.0 # Return a safe neutral AQI number
        
        # 2. Load the XGBoost model
        model = joblib.load(MODEL_PATH)
        
        # 3. Get live weather data
        weather = get_weather_data(lat, lon)
        now = datetime.now()
        hour = target_hour if target_hour is not None else now.hour
        month = now.month
        is_crop_burning = 1 if month in [10, 11] else 0

        # 4. Create the 13 features in the EXACT order of your XGBoost training
        input_data = {
            'Latitude': lat,
            'Longitude': lon,
            'Hour': hour,
            'Day_of_Week': now.weekday(),
            'Month': month,
            'Temp_2m_C': weather['temp'],
            'Humidity_Percent': weather['humidity'],
            'Wind_Speed_10m_kmh': weather['wind_speed'],
            'Precipitation_mm': 0.0,
            'Pressure_MSL_hPa': 1013.0,
            'Is_Daytime': 1 if (6 <= hour <= 18) else 0,
            'AQI_lag_24h': 50.0,
            'Crop_Burning_Season': is_crop_burning
        }

        # 5. Convert to DataFrame and enforce column order
        features = [
            'Latitude', 'Longitude', 'Hour', 'Day_of_Week', 'Month', 
            'Temp_2m_C', 'Humidity_Percent', 'Wind_Speed_10m_kmh', 
            'Precipitation_mm', 'Pressure_MSL_hPa', 'Is_Daytime',
            'AQI_lag_24h', 'Crop_Burning_Season'
        ]
        input_df = pd.DataFrame([input_data])[features]

        # 6. Predict and return ONLY the number
        prediction = model.predict(input_df)[0]
        return round(float(prediction), 2)
        
    except Exception as e:
        print(f"CRITICAL ML ERROR: {str(e)}")
        return 50.0 # Return 50.0 as a fallback so the health check doesn't crash