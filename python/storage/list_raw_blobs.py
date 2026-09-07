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

print("Blobs in the raw container (read-only):")

# Listing and property retrieval do not download or modify blob contents.
for item in container_client.list_blobs(include=["metadata"]):
    blob_client = container_client.get_blob_client(item.name)
    properties = blob_client.get_blob_properties()
    print(f"\nName: {item.name}")
    print(f"Size: {properties.size} bytes")
    print(f"Content type: {properties.content_settings.content_type}")
    print(f"Last modified: {properties.last_modified}")
    print(f"ETag (version identifier, not a content checksum): {properties.etag}")
    print("Metadata:")
    if properties.metadata:
        for key, value in sorted(properties.metadata.items()):
            print(f"  {key}: {value}")
    else:
        print("  (none)")
