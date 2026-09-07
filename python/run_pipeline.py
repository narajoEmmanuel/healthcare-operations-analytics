"""Run all local pipeline stages while keeping each stage independently runnable."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGES = (
    ROOT / "python" / "ingestion" / "cms_inpatient_ingest.py",
    ROOT / "python" / "database" / "load_staging.py",
    ROOT / "python" / "database" / "build_analytics.py",
)


def main() -> None:
    for stage in STAGES:
        print(f"\n==> Running {stage.relative_to(ROOT)}", flush=True)
        subprocess.run([sys.executable, str(stage)], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
