import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "python" / "ingestion"))

from validation import EXPECTED_SOURCE_COLUMNS, validate_raw_records


def record(provider: str = "000001", drg: str = "001") -> dict[str, str]:
    values = {column: "value" for column in EXPECTED_SOURCE_COLUMNS}
    values["Rndrng_Prvdr_CCN"] = provider
    values["DRG_Cd"] = drg
    return values


class RawValidationTests(unittest.TestCase):
    def test_valid_candidate_key(self):
        result = validate_raw_records(
            [record(), record("000002", "001")], expected_row_count=2
        )
        self.assertEqual(result.unique_key_count, 2)
        self.assertEqual(result.duplicate_key_count, 0)

    def test_duplicate_candidate_key_fails(self):
        with self.assertRaisesRegex(ValueError, "not unique"):
            validate_raw_records([record(), record()], expected_row_count=2)

    def test_row_count_mismatch_fails(self):
        with self.assertRaisesRegex(ValueError, "Row-count mismatch"):
            validate_raw_records([record()], expected_row_count=2)


if __name__ == "__main__":
    unittest.main()
