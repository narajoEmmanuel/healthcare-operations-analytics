import requests

url = "https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data"

params = {
    "size": 2
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

if not data:
    raise ValueError("The API returned no records.")

columns = list(data[0].keys())

print("Names of all columns:")
for number, column in enumerate(columns, start=1):
    print(f"{number}. {column}")

print("\nFirst row:")
first_row = data[0]
for column, value in first_row.items():
    print(f"{column}: {value}")
