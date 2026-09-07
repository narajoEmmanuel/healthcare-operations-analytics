"""Validation shared by ingestion, staging, and tests."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

PROVIDER_FIELD = "Rndrng_Prvdr_CCN"
DRG_FIELD = "DRG_Cd"
EXPECTED_SOURCE_COLUMNS = (
    "Rndrng_Prvdr_CCN", "Rndrng_Prvdr_Org_Name", "Rndrng_Prvdr_City",
    "Rndrng_Prvdr_St", "Rndrng_Prvdr_State_FIPS", "Rndrng_Prvdr_Zip5",
    "Rndrng_Prvdr_State_Abrvtn", "Rndrng_Prvdr_RUCA",
    "Rndrng_Prvdr_RUCA_Desc", "DRG_Cd", "DRG_Desc", "Tot_Dschrgs",
    "Avg_Submtd_Cvrd_Chrg", "Avg_Tot_Pymt_Amt", "Avg_Mdcr_Pymt_Amt",
)


@dataclass(frozen=True)
class ValidationResult:
    row_count: int
    column_count: int
    unique_key_count: int
    duplicate_key_count: int
    columns: tuple[str, ...]


def validate_raw_records(
    records: list[dict[str, Any]],
    *,
    expected_row_count: int,
    expected_columns: tuple[str, ...] = EXPECTED_SOURCE_COLUMNS,
) -> ValidationResult:
    """Validate shape, consistent schema, and the provider/DRG candidate key."""
    if len(records) != expected_row_count:
        raise ValueError(
            f"Row-count mismatch: retrieved {len(records):,}; "
            f"expected {expected_row_count:,}"
        )
    if not records:
        raise ValueError("The raw snapshot is empty")

    columns = tuple(records[0].keys())
    if len(columns) != len(expected_columns):
        raise ValueError(
            f"Column-count mismatch: found {len(columns)}; "
            f"expected {len(expected_columns)}"
        )
    if set(columns) != set(expected_columns):
        missing = sorted(set(expected_columns) - set(columns))
        unexpected = sorted(set(columns) - set(expected_columns))
        raise ValueError(
            f"Source columns changed; missing={missing}, unexpected={unexpected}"
        )
    required = {PROVIDER_FIELD, DRG_FIELD}
    if not required.issubset(columns):
        raise ValueError(f"Candidate-key fields are missing: {sorted(required - set(columns))}")

    expected_fields = set(columns)
    keys: set[tuple[str, str]] = set()
    duplicate_count = 0
    for row_number, record in enumerate(records, start=1):
        if set(record) != expected_fields:
            raise ValueError(f"Row {row_number:,} has a different source schema")
        provider = record.get(PROVIDER_FIELD)
        drg = record.get(DRG_FIELD)
        if provider in (None, "") or drg in (None, ""):
            raise ValueError(f"Row {row_number:,} has a missing candidate-key value")
        key = (str(provider), str(drg))
        if key in keys:
            duplicate_count += 1
        keys.add(key)

    if duplicate_count:
        raise ValueError(
            f"Candidate key is not unique: {duplicate_count:,} duplicate rows"
        )
    return ValidationResult(
        row_count=len(records),
        column_count=len(columns),
        unique_key_count=len(keys),
        duplicate_key_count=duplicate_count,
        columns=columns,
    )
