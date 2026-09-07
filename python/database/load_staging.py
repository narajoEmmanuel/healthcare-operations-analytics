"""Load the validated Azurite raw snapshot into PostgreSQL staging."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT / "python" / "ingestion"))

from blob_storage import download_snapshot  # noqa: E402
from validation import validate_raw_records  # noqa: E402

from common import connect, execute_sql_file, load_environment

LOGGER = logging.getLogger("staging_load")

def parse_integer(value: object, field: str) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(str(value).replace(",", ""))
    except ValueError as error:
        raise ValueError(f"Invalid integer in {field}: {value!r}") from error


def parse_money(value: object, field: str) -> Decimal | None:
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value).replace("$", "").replace(",", ""))
    except InvalidOperation as error:
        raise ValueError(f"Invalid monetary value in {field}: {value!r}") from error


def staging_row(record: dict[str, object], year: int, sha256: str) -> tuple:
    return (
        year,
        record["Rndrng_Prvdr_CCN"],
        record["Rndrng_Prvdr_Org_Name"],
        record["Rndrng_Prvdr_St"],
        record["Rndrng_Prvdr_City"],
        record["Rndrng_Prvdr_State_FIPS"],
        record["Rndrng_Prvdr_Zip5"],
        record["Rndrng_Prvdr_State_Abrvtn"],
        record["Rndrng_Prvdr_RUCA"],
        record["Rndrng_Prvdr_RUCA_Desc"],
        record["DRG_Cd"],
        record["DRG_Desc"],
        parse_integer(record["Tot_Dschrgs"], "Tot_Dschrgs"),
        parse_money(record["Avg_Submtd_Cvrd_Chrg"], "Avg_Submtd_Cvrd_Chrg"),
        parse_money(record["Avg_Tot_Pymt_Amt"], "Avg_Tot_Pymt_Amt"),
        parse_money(record["Avg_Mdcr_Pymt_Amt"], "Avg_Mdcr_Pymt_Amt"),
        sha256,
    )


def main() -> None:
    load_environment()
    year = int(os.environ.get("CMS_REPORTING_YEAR", "2024"))
    container = os.environ.get("AZURE_BLOB_CONTAINER", "raw")
    blob_name = (
        "cms/medicare-inpatient/"
        f"reporting_year={year}/medicare_inpatient_{year}.json"
    )
    raw_bytes, metadata = download_snapshot(
        os.environ["AZURE_STORAGE_CONNECTION_STRING"], container, blob_name
    )
    actual_sha256 = hashlib.sha256(raw_bytes).hexdigest()
    if metadata.get("sha256") != actual_sha256:
        raise ValueError("Raw blob SHA-256 does not match its ingestion metadata")
    records = json.loads(raw_bytes)
    expected_rows = int(metadata["row_count"])
    result = validate_raw_records(records, expected_row_count=expected_rows)

    copy_sql = """
        COPY staging.cms_inpatient (
            reporting_year, provider_ccn, provider_name, provider_street,
            provider_city, provider_state_fips, provider_zip5, provider_state,
            provider_ruca, provider_ruca_description, drg_code, drg_description,
            total_discharges, avg_submitted_covered_charge,
            avg_total_payment, avg_medicare_payment, source_sha256
        ) FROM STDIN
    """
    with connect() as connection:
        execute_sql_file(connection, "sql/01_create_schemas.sql")
        execute_sql_file(connection, "sql/02_create_staging.sql")
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM staging.cms_inpatient WHERE reporting_year = %s",
                (year,),
            )
            with cursor.copy(copy_sql) as copy:
                for record in records:
                    copy.write_row(staging_row(record, year, actual_sha256))
            loaded = cursor.execute(
                "SELECT count(*) FROM staging.cms_inpatient WHERE reporting_year = %s",
                (year,),
            ).fetchone()[0]
            if loaded != result.row_count:
                raise RuntimeError(
                    f"Staging row-count mismatch: {loaded:,} vs {result.row_count:,}"
                )
    LOGGER.info("Loaded %s rows into staging.cms_inpatient", f"{loaded:,}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    main()
