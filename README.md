# Healthcare Operations Analytics Platform

An independent portfolio project using public CMS data to demonstrate a reproducible analytics workflow: business requirements, PostgreSQL modeling, SQL analysis, data quality, KPI design, and Power BI communication.

**Status:** Hiring and dataset research are complete, including unauthenticated record-level access verification. The business problem and analytical questions have not yet been defined; no findings or dashboard exist.

## Data source

The selected primary source is CMS's *Medicare Inpatient Hospitals — by Provider and Service*. The provisional period is 2019–2024, subject to acquisition and comparability checks. Selection rationale, API verification, and limitations are documented in [`research/market_and_dataset_research.md`](research/market_and_dataset_research.md).

## Intended stack

PostgreSQL, SQL, Python, pandas, Power Query, Power BI, DAX, Git, and GitHub.

## Repository navigation

- [`research/business_case.md`](research/business_case.md): business problem, stakeholders, objectives, scope, and analytical questions
- [`research/market_and_dataset_research.md`](research/market_and_dataset_research.md): hiring requirements, dataset selection, access verification, and sources
- [`research/project_log.md`](research/project_log.md): concise record of completed work and supporting commits
- [`data/README.md`](data/README.md): acquisition provenance and raw-data controls
- `sql/`, `python/`, `powerbi/`, `assets/`, and `report/`: implementation artifacts when work begins

Only inspected outputs will support project or CV claims. Source datasets retain their original publisher terms and are not relicensed by this repository.
