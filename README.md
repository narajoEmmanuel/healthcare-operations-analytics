# Medicare Inpatient Service & Payment Analytics

**Hospital benchmarking using public CMS data**

## Business Problem

This local screening system helps **Hospital Strategy & Finance Leadership** decide which Medicare inpatient service categories warrant deeper review based on activity, estimated payment exposure, and payment variation for the same DRG. It does not determine profitability, internal cost, operational efficiency, reimbursement appropriateness, staffing, patient outcomes, or causes of payment differences.

## Architecture

```text
CMS Data API
  -> Python ingestion and validation
  -> Azurite Blob Storage (authoritative raw snapshot)
  -> Python typed load
  -> PostgreSQL staging
  -> PostgreSQL star model and analytical views
  -> Power BI-ready source
```

Docker Compose runs Azurite Blob Storage on `127.0.0.1:10000` and PostgreSQL on `127.0.0.1:5432`, with persistent named volumes. No Azure subscription or paid cloud service is required.

## Data Source

The system uses the 2024 CMS [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service) dataset and its [official data dictionary](https://data.cms.gov/resources/medicare-inpatient-hospitals-by-provider-and-service-data-dictionary-0). The verified snapshot contains 145,879 rows and 15 columns at one provider plus one DRG per row, with no duplicated `Rndrng_Prvdr_CCN + DRG_Cd` keys. Provenance and limitations are in [`research/domain_and_data.md`](research/domain_and_data.md).

## Pipeline

The ingestion client obtains the expected count from the CMS stats endpoint, retrieves all pages at up to 5,000 rows, preserves source field names and strings, validates the shape and candidate key, computes SHA-256, and uploads JSON with operational metadata. The typed loader reads only from Azurite, verifies the checksum, replaces the selected year in staging inside a transaction, and builds analytics tables and views. Reruns do not append duplicates.

## Analytical Model

- `staging.cms_inpatient`: typed source snapshot, keyed by year, provider CCN, and DRG code.
- `analytics.dim_provider`: year-aware provider and geographic attributes.
- `analytics.dim_drg`: year-aware DRG definitions.
- `analytics.fact_inpatient_service`: one provider–DRG observation per year.
- `analytics.v_portfolio_overview`: annual portfolio KPIs.
- `analytics.v_drg_benchmark`: volume, estimated exposure, and same-DRG payment benchmarks.
- `analytics.v_provider_drg_review_priority`: retained component measures and transparent review categories.

`Estimated Aggregate Total Payment` is `Total Discharges × Average Total Payment`. It is an estimate derived from aggregated source measures—not revenue, cost, margin, or profit. Geography and RUCA fields support contextual benchmarks, not fully matched hospital peer groups.

## Reproduction

Copy `.env.example` to `.env`, set a local PostgreSQL password, and insert the documented Azurite `devstoreaccount1` connection string already used by the local emulator.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip install -r requirements-dev.txt
.\scripts\preflight.ps1
docker compose up -d --wait
python python/run_pipeline.py
```

The preflight detects a running legacy `healthcare-azurite` container, port conflicts, and whether `healthcare_azurite_data` will be reused. It never removes a container or volume. If the legacy container is running, stop—but do not remove—it before starting Compose.

Each stage is independently runnable:

```powershell
python python/ingestion/cms_inpatient_ingest.py
python python/database/load_staging.py
python python/database/build_analytics.py
python python/storage/list_raw_blobs.py
python -m pytest
jupyter nbconvert --to notebook --execute notebooks/02_data_profiling.ipynb --inplace
```

Run business queries with:

```powershell
Get-Content -Raw sql/06_business_analysis.sql | docker compose exec -T postgres psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB
```

## Current Results

The source facts already validated in the preserved Data Understanding notebook are 145,879 rows, 15 columns, 145,879 unique provider–DRG combinations, and zero duplicates. Runtime-generated checksum, blob, profiling, database, and analytical results are recorded only after their corresponding stage executes successfully; the ingestion manifest is created at `artifacts/ingestion_manifest.json`.

## Limitations

The source covers Original Medicare fee-for-service IPPS activity and suppresses provider/DRG combinations with 10 or fewer discharges. It is aggregated rather than patient-level. Payment differences can reflect geographic and institutional payment adjustments. Outputs identify potential outliers and review priorities; they do not establish causation or recommend expansion, closure, or corrective action.

## Repository Structure

```text
docker-compose.yml             Local Azurite and PostgreSQL services
python/ingestion/              CMS retrieval, validation, checksum, Blob upload
python/database/               Typed staging load and analytics build
python/storage/                Read-only Blob inspection
python/run_pipeline.py         Lightweight orchestration
sql/                           Schemas, model, transformations, checks, analysis
notebooks/                     Preserved understanding and profiling workflows
powerbi/README.md              Power BI connection and report specification
research/                      Business case, provenance, and data dictionary
scripts/preflight.ps1          Non-destructive collision and volume checks
tests/                         Lightweight raw-validation tests
```

Raw datasets, secrets, temporary files, and Docker volume state are excluded from Git. No Power BI report or Azure cloud deployment is claimed.
