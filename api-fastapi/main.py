from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/marine-weather")
def get_weather():
    # Fetching live wave data for the Red Sea coordinates
    url = "https://marine-api.open-meteo.com/v1/marine?latitude=20.0&longitude=38.0&hourly=wave_height&timezone=auto"
    response = requests.get(url)
    data = response.json()
    
    current_wave = data["hourly"]["wave_height"][0]
    return {"region": "Red Sea", "wave_height_meters": current_wave}