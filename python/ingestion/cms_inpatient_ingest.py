"""Retrieve, validate, checksum, and publish the CMS raw snapshot to Azurite."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from blob_storage import upload_snapshot
from cms_client import CmsDataClient
from validation import validate_raw_records

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = PROJECT_ROOT / "artifacts" / "ingestion_manifest.json"
LOGGER = logging.getLogger("cms_ingestion")


def main() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    dataset_id = os.environ.get(
        "CMS_DATASET_ID", "690ddc6c-2767-4618-b277-420ffb2bf27c"
    )
    reporting_year = os.environ.get("CMS_REPORTING_YEAR", "2024")
    connection_string = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
    container_name = os.environ.get("AZURE_BLOB_CONTAINER", "raw")
    blob_name = (
        "cms/medicare-inpatient/"
        f"reporting_year={reporting_year}/medicare_inpatient_{reporting_year}.json"
    )

    client = CmsDataClient(dataset_id)
    expected_count = client.expected_row_count()
    records: list[dict[str, str]] = []
    page_count = 0
    for page in client.pages(expected_count):
        records.extend(page)
        page_count += 1

    validation = validate_raw_records(records, expected_row_count=expected_count)
    LOGGER.info(
        "Raw validation passed: %s rows, %d columns, %s unique keys, %d duplicates",
        f"{validation.row_count:,}",
        validation.column_count,
        f"{validation.unique_key_count:,}",
        validation.duplicate_key_count,
    )
    retrieved_at = datetime.now(timezone.utc).isoformat()

    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="wb", suffix=".json", prefix="cms_inpatient_", delete=False
        ) as temp_file:
            temp_path = Path(temp_file.name)
            digest = hashlib.sha256()
            temp_file.write(b"[")
            digest.update(b"[")
            for index, record in enumerate(records):
                if index:
                    temp_file.write(b",")
                    digest.update(b",")
                encoded = json.dumps(
                    record, ensure_ascii=False, separators=(",", ":")
                ).encode("utf-8")
                temp_file.write(encoded)
                digest.update(encoded)
            temp_file.write(b"]")
            digest.update(b"]")
        sha256 = digest.hexdigest()
        LOGGER.info("Serialized raw snapshot SHA-256: %s", sha256)

        metadata = {
            "source": "cms",
            "reporting_year": reporting_year,
            "dataset": "medicare_inpatient_by_provider_and_service",
            "row_count": str(validation.row_count),
            "column_count": str(validation.column_count),
            "sha256": sha256,
            "ingested_at_utc": retrieved_at,
        }
        properties = upload_snapshot(
            connection_string,
            container_name,
            blob_name,
            temp_path,
            metadata,
        )
    finally:
        records.clear()
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

    manifest = {
        "dataset": "Medicare Inpatient Hospitals - by Provider and Service",
        "dataset_id": dataset_id,
        "reporting_year": int(reporting_year),
        "source_endpoint": client.data_url,
        "retrieved_at_utc": retrieved_at,
        "expected_rows": expected_count,
        "actual_rows": validation.row_count,
        "column_count": validation.column_count,
        "columns": list(validation.columns),
        "candidate_key": ["Rndrng_Prvdr_CCN", "DRG_Cd"],
        "unique_candidate_keys": validation.unique_key_count,
        "duplicate_candidate_keys": validation.duplicate_key_count,
        "sha256": sha256,
        "blob_container": container_name,
        "blob_path": blob_name,
        "blob_size_bytes": properties.size,
        "page_count": page_count,
        "validation_status": "passed",
    }
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    LOGGER.info(
        "Validated %s rows and %d columns",
        f"{validation.row_count:,}",
        validation.column_count,
    )
    LOGGER.info("SHA-256: %s", sha256)
    LOGGER.info("Uploaded azurite://%s/%s", container_name, blob_name)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    logging.getLogger("azure").setLevel(logging.WARNING)
    main()
