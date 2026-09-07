"""Build the analytics model and fail if its quality checks fail."""

from __future__ import annotations

import logging
from pathlib import Path

from common import connect, execute_sql_file, load_environment

LOGGER = logging.getLogger("analytics_build")


def main() -> None:
    load_environment()
    with connect() as connection:
        execute_sql_file(connection, "sql/03_create_analytics_model.sql")
        execute_sql_file(connection, "sql/04_transform_analytics.sql")
        quality_sql = (
            Path(__file__).resolve().parents[2] / "sql" / "05_quality_checks.sql"
        ).read_text(encoding="utf-8")
        failures = connection.execute(quality_sql).fetchall()
        if failures:
            details = "; ".join(f"{name}={count}" for name, count in failures)
            raise RuntimeError(f"Analytics quality checks failed: {details}")
        counts = connection.execute(
            """
            SELECT
              (SELECT count(*) FROM analytics.dim_provider),
              (SELECT count(*) FROM analytics.dim_drg),
              (SELECT count(*) FROM analytics.fact_inpatient_service)
            """
        ).fetchone()
    LOGGER.info(
        "Analytics built: %s providers, %s DRGs, %s facts",
        *(f"{count:,}" for count in counts),
    )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    main()
