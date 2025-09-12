from fastapi import HTTPException
import pandera.pandas as pa
import pandas as pd
from pandera.pandas import Column, DataFrameSchema, Check
import io
from typing import Tuple, Optional
import numpy as np


schema = DataFrameSchema({
    "int_rate": Column(pa.Float, Check.in_range(0, 100), coerce=True),
    "fed_funds_rate": Column(pa.Float, Check.in_range(0, 100), coerce=True),
    "unemployment_rate": Column(pa.Float, Check.in_range(0, 100), coerce=True),
    "debt_service_ratio": Column(pa.Float, Check.in_range(0, 100), coerce=True),
    "revol_util": Column(pa.Float, Check.in_range(0, 120), coerce=True),

    "loan_amnt": Column(pa.Float, Check.ge(0), coerce=True),
    "installment": Column(pa.Float, Check.ge(0), coerce=True),
    "annual_inc": Column(pa.Float, Check.ge(0), coerce=True),
    "delinq_2yrs": Column(pa.Float, Check.ge(0), coerce=True),
    "open_acc": Column(pa.Float, Check.ge(1), coerce=True),
    "pub_rec": Column(pa.Float, Check.ge(0), coerce=True),
    "revol_bal": Column(pa.Float, Check.ge(0), coerce=True),
    "total_acc": Column(pa.Float, Check.ge(0), coerce=True),
    "installment_to_income": Column(pa.Float, Check.ge(0), coerce=True),
    "credit_age": Column(pa.Float, Check.ge(0), coerce=True),
    "real_gdp": Column(pa.Float, Check.ge(0), coerce=True),

    "issue_month": Column(pa.Float, Check.in_range(1, 12), coerce=True),
    "term": Column(pa.Float, Check.isin([36, 60]), coerce=True),
    "emp_length": Column(pa.Float, Check.in_range(-1, 10), coerce=True),
    "dti": Column(pa.Float, Check.ge(-1), coerce=True),
    "inq_last_6mths": Column(pa.Float, Check.in_range(0, 10), coerce=True),
    "fico_score": Column(pa.Float, Check.in_range(350, 850), coerce=True),
    "cpi": Column(pa.Float, Check.in_range(100, 500), coerce=True),

    "purpose": Column(pa.Category, Check.isin([
        "car", "credit_card", "debt_consolidation", "educational", "home_improvement",
        "house", "major_purchase", "medical", "moving", "other", "renewable_energy",
        "small_business", "vacation", "wedding"
    ]), coerce=True),
    "home_ownership": Column(pa.Category, Check.isin([
        "ANY", "MORTGAGE", "NONE", "OTHER", "OWN", "RENT"
    ]), coerce=True),
})

def validate_input(df: pd.DataFrame) -> Tuple[bool, Optional[pd.DataFrame]]:
    try:
        schema.validate(df)
        return True, None   
    except pa.errors.SchemaErrors as e:
        return False, e.failure_cases


NUMERIC_COLS = ["loan_amnt", "term", "int_rate", "installment", "emp_length", "annual_inc", "dti", "inq_last_6mths", "delinq_2yrs", "open_acc", "pub_rec", "revol_bal", "revol_util", "total_acc", "installment_to_income", "fico_score", "credit_age", "issue_month", "fed_funds_rate", "unemployment_rate", "cpi", "real_gdp", "debt_service_ratio" ]
COL_ORDER = ["loan_amnt", "term", "int_rate", "installment", "emp_length", "annual_inc", "dti", "inq_last_6mths", "delinq_2yrs", "open_acc", "pub_rec", "revol_bal", "revol_util", "total_acc", "installment_to_income", "fico_score", "credit_age", "issue_month", "fed_funds_rate", "unemployment_rate", "cpi", "real_gdp", "debt_service_ratio", "car", "credit_card", "debt_consolidation", "educational", "home_improvement", "house", "major_purchase", "medical", "moving", "other", "renewable_energy", "small_business", "vacation", "wedding", "ANY", "MORTGAGE", "NONE", "OTHER", "OWN", "RENT"]

EXPECTED_COLS = list(schema.columns.keys())

def tofloat(x):
    if isinstance(x, (int, float)):
        return float(x)
    if isinstance(x, str):
        try:
            clean_str = x.strip().replace("%", "").replace("$", "").replace(",", "")
            num_str = ''.join(c for c in clean_str if c.isdigit() or c == '.' or c == '-')
            return float(num_str)
        except:
            return np.nan
    return np.nan

def clean_input(file: bytes) -> pd.DataFrame:
    if len(file) > 10**7:
        raise HTTPException(status_code=413, detail="CSV too large (>10MB)")
    
    df = pd.read_csv(io.BytesIO(file))
    
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = df[col].apply(tofloat)
    df["term"] = df["term"].astype("int64")

    COLS = [col for col in EXPECTED_COLS if col in df.columns]
    df = df[COLS]
    
    valid, errors = validate_input(df)
    if not valid:
        raise HTTPException(status_code=422, detail=errors.to_dict(orient="records"))

    df = pd.get_dummies(df, columns=["purpose", "home_ownership"])
    out = df.reindex(columns=COL_ORDER, fill_value=0)

    return out
