"""Azurite-facing raw snapshot operations."""

from __future__ import annotations

from pathlib import Path

from azure.core.exceptions import ResourceExistsError
from azure.storage.blob import BlobServiceClient, ContentSettings


def get_container(connection_string: str, container_name: str):
    service = BlobServiceClient.from_connection_string(connection_string)
    container = service.get_container_client(container_name)
    try:
        container.create_container()
    except ResourceExistsError:
        pass
    return container


def upload_snapshot(
    connection_string: str,
    container_name: str,
    blob_name: str,
    local_path: Path,
    metadata: dict[str, str],
):
    """Upload one validated snapshot and return verified blob properties."""
    container = get_container(connection_string, container_name)
    blob = container.get_blob_client(blob_name)
    with local_path.open("rb") as raw_file:
        blob.upload_blob(
            raw_file,
            overwrite=True,
            metadata=metadata,
            content_settings=ContentSettings(content_type="application/json"),
        )
    properties = blob.get_blob_properties()
    if properties.metadata.get("sha256") != metadata["sha256"]:
        raise RuntimeError("Uploaded blob metadata did not preserve the SHA-256")
    return properties


def download_snapshot(
    connection_string: str, container_name: str, blob_name: str
) -> tuple[bytes, dict[str, str]]:
    blob = BlobServiceClient.from_connection_string(connection_string).get_blob_client(
        container=container_name, blob=blob_name
    )
    data = blob.download_blob().readall()
    return data, blob.get_blob_properties().metadata
