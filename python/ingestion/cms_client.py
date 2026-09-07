"""Small, explicit client for the CMS Data API."""

from __future__ import annotations

import logging
from collections.abc import Iterator
from typing import Any

import requests

LOGGER = logging.getLogger(__name__)


class CmsApiError(RuntimeError):
    """Raised when CMS responses cannot support a complete retrieval."""


def _find_integer(value: Any, candidate_keys: set[str]) -> int | None:
    """Find a known count field in a nested stats response."""
    if isinstance(value, dict):
        for key, nested in value.items():
            if key.lower() in candidate_keys:
                try:
                    return int(nested)
                except (TypeError, ValueError):
                    pass
        for nested in value.values():
            result = _find_integer(nested, candidate_keys)
            if result is not None:
                return result
    elif isinstance(value, list):
        for nested in value:
            result = _find_integer(nested, candidate_keys)
            if result is not None:
                return result
    return None


class CmsDataClient:
    """Retrieve one CMS dataset completely using offset pagination."""

    def __init__(
        self,
        dataset_id: str,
        *,
        page_size: int = 5_000,
        timeout_seconds: int = 60,
        session: requests.Session | None = None,
    ) -> None:
        if not 1 <= page_size <= 5_000:
            raise ValueError("page_size must be between 1 and 5,000")
        self.dataset_id = dataset_id
        self.page_size = page_size
        self.timeout_seconds = timeout_seconds
        self.session = session or requests.Session()
        base = f"https://data.cms.gov/data-api/v1/dataset/{dataset_id}/data"
        self.data_url = base
        self.stats_url = f"{base}/stats"

    def expected_row_count(self) -> int:
        response = self.session.get(self.stats_url, timeout=self.timeout_seconds)
        response.raise_for_status()
        count = _find_integer(
            response.json(),
            {"found_rows_num", "total", "total_rows", "row_count", "count"},
        )
        if count is None or count < 0:
            raise CmsApiError("CMS stats response did not contain a usable row count")
        LOGGER.info("CMS stats reports %s expected records", f"{count:,}")
        return count

    def pages(self, expected_count: int) -> Iterator[list[dict[str, str]]]:
        """Yield every page and reject early termination or over-retrieval."""
        offset = 0
        page_number = 0
        while offset < expected_count:
            response = self.session.get(
                self.data_url,
                params={"offset": offset, "size": self.page_size},
                timeout=self.timeout_seconds,
            )
            response.raise_for_status()
            page = response.json()
            if not isinstance(page, list):
                raise CmsApiError("CMS data endpoint returned a non-list response")
            if not page:
                raise CmsApiError(
                    f"CMS pagination stopped at offset {offset:,} before "
                    f"the expected {expected_count:,} rows"
                )
            if len(page) > self.page_size:
                raise CmsApiError("CMS returned more rows than the requested page size")
            page_number += 1
            offset += len(page)
            if offset > expected_count:
                raise CmsApiError("CMS returned more records than its stats endpoint reported")
            LOGGER.info(
                "Retrieved page %d: %s rows (%s/%s)",
                page_number,
                f"{len(page):,}",
                f"{offset:,}",
                f"{expected_count:,}",
            )
            yield page

        if offset != expected_count:
            raise CmsApiError(
                f"Retrieved {offset:,} rows; CMS stats expected {expected_count:,}"
            )
