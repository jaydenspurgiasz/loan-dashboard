from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from validation import clean_input
import joblib
from contextlib import asynccontextmanager
import hashlib
from pydantic import BaseModel
from typing import List, Dict, Any
import io
import numpy as np
from artifacts.DataTransform import DataTransform, DataPolicy
import sys
import lightgbm

API_TITLE = "Loan Dashboard API"
MODEL_PATH = "artifacts/lgbm_model.pkl"
MAX_BYTES = 10**7
ORIGINS = ["http://localhost:3000"]
MODEL = None

class ValidateResponse(BaseModel):
    rows: int
    cols: int
    features: List[str]
    key: str


class ScoreResponse(BaseModel):
    rows: int
    cols: int
    scored: List[Dict[str, Any]]
    key: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL
    try:
        print("Loading model...")
        setattr(sys.modules['__main__'], 'DataTransform', DataTransform)
        setattr(sys.modules['__main__'], 'DataPolicy', DataPolicy)
        MODEL = joblib.load(MODEL_PATH)
        print("Loaded model.")
    except Exception as e:
        print(f"Error when loading model: {e}")
    yield


app = FastAPI(title=API_TITLE, version="0.1", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods = ["GET", "POST"],
    allow_headers = ["Content-Type"]
)

def score_data(df: pd.DataFrame) -> np.ndarray:
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        preds = MODEL.predict_proba(df)
        preds = np.clip(np.asarray(preds[:, 1], dtype=float).reshape(-1), 0.0, 1.0)
        return preds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {e}")


@app.get("/status")
async def status():
    return {"status": "ok", "model_loaded": MODEL is not None, "model_type": str(type(MODEL))}

@app.get("/")
async def root():
    return {"message": "Welcome to the Loan Dashboard API"}

@app.post("/validate")
async def validate(file: UploadFile = File(...)):
    # Logic to validate/transform file, then give preview at /preview
    # Store using IndexedDB for persistence
    # Check file size limit and file type(CSV)
    blob = await file.read()
    if len(blob) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"CSV too large (>{MAX_BYTES} bytes)")
    if not file.filename.endswith(".csv") or not file.content_type == "text/csv":
        raise HTTPException(status_code=415, detail="not CSV")
    
    # Else, we can validate and clean input
    try:
        clean_input(blob)
    except Exception as e:
        raise e

    df = pd.read_csv(io.BytesIO(blob))
    fp = hashlib.sha256(blob).hexdigest()
    return ValidateResponse(
        rows=len(df),
        cols=len(df.columns),
        features=df.columns.tolist(),
        key=fp
    )


@app.post("/score")
async def score(file: UploadFile = File(...), fp: str | None = None):
    # Score the uploaded data and add loan_risk column to IndexedDB data
    blob = await file.read()
    if len(blob) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"CSV too large (>{MAX_BYTES} bytes)")
    if not file.filename.endswith(".csv") or not file.content_type == "text/csv":
        raise HTTPException(status_code=415, detail="not CSV")
    if hashlib.sha256(blob).hexdigest() != fp:
        raise HTTPException(status_code=409, detail="File key mismatch")
    
    df = clean_input(blob)
    preds = score_data(df)
    df["loan_risk"] = preds

    return ScoreResponse(
        rows=len(df),
        cols=len(df.columns),
        scored=df.to_dict(orient="records"),
        key=fp
    )

'''
Handle on Next js
@app.get("/preview")
async def preview():
    # Give user a preview of their validated data(after one-hot encoding)

@app.get("/analytics")
async def analytics():
    # Provide analytics on the IndexedDB data after scoring
'''
