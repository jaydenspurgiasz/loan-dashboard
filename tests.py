import requests

with open('ztestdata/test_book.csv', 'rb') as f:
    try:
        response = requests.post('http://localhost:8000/validate', files={'file': ('test_book.csv', f, 'text/csv')})
    except Exception as e:
        print(f"Error occurred:\n{e.msg}")

print(response.json())