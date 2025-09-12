from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from validation import validate_input
import joblib
from contextlib import asynccontextmanager
import hashlib
from pydantic import BaseModel
from typing import List, Dict, Any
import io

API_TITLE = "Loan Dashboard API"
MODEL_PATH = "artifacts/model.pkl"
MAX_BYTES = 10**7
ORIGINS = ["http://localhost:3000"]

class ValidateResponse(BaseModel):
    rows: int
    cols: int
    features: List[str]
    key: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL
    try:
        MODEL = joblib.load(MODEL_PATH)
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
    
    df = pd.read_csv(io.BytesIO(blob))
    # Else, we can validate and clean input
    valid, schemaErrors = validate_input(df)
    if not valid:
        raise HTTPException(status_code=422, detail=schemaErrors.to_dict(orient="records"))

    fp = hashlib.sha256(blob).hexdigest()
    return ValidateResponse(
        rows=len(df),
        cols=len(df.columns),
        features=df.columns.tolist(),
        key=fp
    )

    
'''
@app.get("/preview")
async def preview():
    # Give user a preview of their validated data(after one-hot encoding)

@app.post("/score")
async def score():
    # Score the uploaded data and add loan_risk column to IndexedDB data

@app.get("/analytics")
async def analytics():
    # Provide analytics on the IndexedDB data after scoring
'''