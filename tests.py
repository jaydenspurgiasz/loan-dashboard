import requests
import json

'''
import joblib
import sklearn
from api.artifacts.DataTransform import DataTransform, DataPolicy

MODEL = joblib.load("api/artifacts/lgbm_model.pkl")

print(MODEL)
'''


with open('ztestdata/test_book.csv', 'rb') as f:
    try:
        response = requests.post('http://localhost:8000/validate', files={'file': ('test_book.csv', f, 'text/csv')})
        response.raise_for_status()
        print(response.json())
        key = response.json().get('key')
    except Exception as e:
        print(f"Error occurred:\n{e}")


with open('ztestdata/test_book.csv', 'rb') as f:
    try:
        response = requests.post('http://localhost:8000/score', files={'file': ('test_book.csv', f, 'text/csv')}, params={'fp': key})
        print(response.json())
    except Exception as e:
        print(f"Error occurred:\n{e.msg}")
