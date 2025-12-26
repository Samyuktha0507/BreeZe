from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    hour: int = Field(None, ge=0, le=23)

class PredictionOutput(BaseModel):
    predicted_aqi: float
    health_category: str
    recommendation: str