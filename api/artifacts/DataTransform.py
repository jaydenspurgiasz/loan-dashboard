from dataclasses import dataclass, field
from typing import Dict, Tuple
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from pandas.api.types import is_numeric_dtype

@dataclass(frozen=True)
class DataPolicy:
    percent: Tuple[str, ...] = ("int_rate", "fed_funds_rate", "unemployment_rate", "debt_service_ratio", "revol_util") # 0 to 100
    non_negative: Tuple[str, ...] = ("loan_amnt", "installment", "annual_inc", "delinq_2yrs", "open_acc", "pub_rec", "revol_bal", "total_acc", "installment_to_income", "credit_age") # Will be winsorized
    skip: Tuple[str, ...] = ("term", "loan_rism", 'car', 'credit_card', 'debt_consolidation',
       'educational', 'home_improvement', 'house', 'major_purchase', 'medical',
       'moving', 'other', 'renewable_energy', 'small_business', 'vacation',
       'wedding', 'ANY', 'MORTGAGE', 'NONE', 'OTHER', 'OWN', 'RENT', "real_gdp") # Doesnt do anything, safety

    # Allowable ranges
    bounds: Dict[str, Tuple[int, int]] = field(default_factory=lambda: {
        "emp_length": (-1, 10),
        "dti": (-1, 100),
        "inq_last_6mths": (0, 10),
        "fico_score": (350, 850),
        "cpi": (100, 500)
    })

    upper_cap = 0.99

class DataTransform(BaseEstimator, TransformerMixin):
    def __init__(self, policy: DataPolicy = DataPolicy()):
        self.policy = policy
        self.caps = {}

    def binaryCol(self, c: pd.Series):
        return set(pd.unique(c.dropna())) == {0, 1}
        
    def fit(self, X: pd.DataFrame, y=None):
        df = X.copy()
        # Find cap for each column in non_negative policy
        for col in self.policy.non_negative:
            if col in df.columns and is_numeric_dtype(df[col]) and not self.binaryCol(df[col]):
                self.caps[col] = float(df[col].quantile(self.policy.upper_cap))

        return self

    def transform(self, X: pd.DataFrame):
        df = X.copy()

        skip = set(self.policy.skip) # For safety
        
        for col in self.policy.percent:
            if col in df.columns and col not in skip:
                df[col] = pd.to_numeric(df[col], errors="coerce").clip(0, 100) # Limit to between 0, 100

        for col in self.policy.non_negative:
            if col in df.columns and col not in skip:
                df[col] = pd.to_numeric(df[col], errors="coerce").clip(lower=0)
                if col in self.caps:
                    df[col] = pd.to_numeric(df[col], errors="coerce").clip(upper=self.caps[col])

        # Bounds
        bounds = self.policy.bounds
        for col in bounds:
            if col in df.columns and col not in skip:
                df[col] = pd.to_numeric(df[col], errors="coerce").clip(bounds[col][0], bounds[col][1])

        return df