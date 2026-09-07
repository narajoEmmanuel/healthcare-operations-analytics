import os
from pathlib import Path

from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv


# Find the repository root from this script's location and load its local .env.
# The .env file is ignored by Git and must never be committed.
project_root = Path(__file__).resolve().parents[2]
load_dotenv(project_root / ".env")

connection_string = os.environ["AZURE_STORAGE_CONNECTION_STRING"]

blob_service_client = BlobServiceClient.from_connection_string(
    connection_string
)

container_client = blob_service_client.get_container_client("raw")

print("Blobs in the raw container:")

# This asks Azurite which objects exist in "raw".
# It does not open the JSON file from this computer's disk.
for blob in container_client.list_blobs():
    print(blob.name)


# Point to one existing blob, then ask Azurite for its technical properties.
# get_blob_properties() does not download the blob's JSON content.
blob_client = container_client.get_blob_client(
    "medicare_inpatient_2024.json"
)

properties = blob_client.get_blob_properties()

metadata = {
    "source": "cms",
    "reporting_year": "2024",
    "dataset": "medicare_inpatient_by_provider_and_service",
}

blob_client.set_blob_metadata(metadata)

updated_properties = blob_client.get_blob_properties()

print("\nUser-defined metadata:")

for key, value in updated_properties.metadata.items():
    print(f"{key}: {value}")

print("\nBlob properties:")
print(f"Name: {blob_client.blob_name}")
print(f"Size: {updated_properties.size} bytes")
print(
    "Content type: "
    f"{updated_properties.content_settings.content_type}"
)
print(f"Last modified: {updated_properties.last_modified}")
print(f"ETag: {updated_properties.etag}")
