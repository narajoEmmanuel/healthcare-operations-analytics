import requests

url = "https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data"

params = {
    "size": 2
}

response = requests.get(url, params=params)
response.raise_for_status()

data = response.json()

if not data:
    raise ValueError("La API no devolvió registros.")

columnas = list(data[0].keys())

print("Nombres de todas las columnas:")
for numero, columna in enumerate(columnas, start=1):
    print(f"{numero}. {columna}")

print("\nPrimera fila:")
primera_fila = data[0]
for columna, valor in primera_fila.items():
    print(f"{columna}: {valor}")