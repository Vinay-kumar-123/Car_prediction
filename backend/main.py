from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

app = FastAPI(title="Car Price Predictor API")

model = pickle.load(open('car_price_model.pkl','rb'))  # FIXED

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
        
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

class CarInput(BaseModel):
    name : str
    company : str
    year : int
    kms_driven : int
    fuel_type : str

@app.get("/")
def home():
    return {"message": "API is running 🚀"}



@app.post("/predict")
def predict(data: CarInput):
    df = pd.DataFrame([data.model_dump()])
    pred = model.predict(df)

    final_price = np.expm1(pred)  

    return {"predicted_price": float(final_price[0])}



df = pd.read_csv("Cleaned car.csv")

@app.get("/options")
def get_options():
    return {
        "companies": sorted(df["company"].unique().tolist()),
        "cars": sorted(df["name"].unique().tolist()),
        "years": sorted(df["year"].unique().tolist()),
        "fuel_types": sorted(df["fuel_type"].unique().tolist())
    }

@app.get("/cars/{company}")
def get_cars(company: str):
    filtered = df[df["company"] == company]
    return sorted(filtered["name"].unique().tolist())