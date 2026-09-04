# Healthcare Operations Analytics Platform

**Status:** Repository and evidence foundation established; analysis has not started.

This is an **independent portfolio analysis using public CMS data**. Its professional objective is to demonstrate an employable, reproducible analytics workflow spanning requirements, relational data modeling, SQL, data quality, KPI design, and business intelligence communication.

## Provisional analytical scope

The working scope is U.S. Medicare inpatient hospital utilization and payment data for 2019–2024. The primary candidate is CMS's *Medicare Inpatient Hospitals — by Provider and Service*, with supporting hospital information or performance data included only when a defined business requirement justifies it. The period remains provisional until acquisition size, schema stability, and comparability are validated.

No findings, production database, SQL analysis, Power BI dashboard, or DAX measures exist yet.

## Intended stack

- PostgreSQL and SQL for relational storage, transformation, validation, and analysis
- Python, pandas, and Jupyter for acquisition support and reproducible quality checks
- Power Query, Power BI, and DAX for the analytical model, KPIs, and dashboard
- Git and GitHub for version control, evidence, and reviewability

## Repository navigation

- [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md): purpose, scope, standards, and completion tests
- [`EVIDENCE_LOG.md`](EVIDENCE_LOG.md): evidence index
- [`research/`](research/): hiring, dataset, and source research
- [`data/README.md`](data/README.md): provenance and raw-data policy
- `sql/`, `python/`, `analysis/`, `powerbi/`, `assets/`, and `report/`: reserved for later phases when substantive artifacts exist

## Evidence-first methodology

Claims are registered only after their supporting output has been inspected. Each milestone has a detailed record under [`evidence/`](evidence/), linked from the master evidence log. Metrics, dataset dimensions, checksums, findings, and technology claims will not be reported before verification.

## Current phase

This phase establishes the charter, source research, data-governance policy, and Git evidence pattern. The next phase is business problem and stakeholder definition.

## Independence and data terms

This project was not commissioned by CMS or a healthcare organization and does not imply CMS endorsement. Repository code and original documentation are licensed under the MIT License. Source datasets remain subject to the terms and notices of their publishers; the repository license does not replace them.
