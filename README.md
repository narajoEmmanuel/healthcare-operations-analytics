# Medicare Inpatient Service & Payment Analytics

**Hospital benchmarking using public CMS data**

This learning-driven portfolio project is developing a reproducible analytics workflow for Medicare inpatient service and payment benchmarking. It is designed to support **Hospital Strategy & Finance Leadership** in answering:

> Which Medicare inpatient service categories should be prioritized for deeper financial and performance review based on their activity volume, payment contribution, and payment variation relative to comparable hospitals?

The project is a screening and benchmarking tool. It does not determine profitability, actual hospital costs, operational efficiency, reimbursement appropriateness, staffing needs, patient outcomes, or the causes of payment differences.

## Data source

The analysis uses the 2024 CMS [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service) dataset, accessed through the public [CMS Data API](https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data).

Validated source facts:

- 145,879 rows and 15 columns retrieved
- one provider + one DRG per row for the selected reporting year
- 145,879 unique `Rndrng_Prvdr_CCN + DRG_Cd` combinations
- zero duplicated provider-DRG combinations

The provider CCN and DRG code therefore form a validated natural candidate key for the retrieved 2024 dataset. This is not yet a PostgreSQL primary-key design decision. Source discovery, provenance, definitions, and limitations are documented in [`research/domain_and_data.md`](research/domain_and_data.md).

## Project status

| Area | Technology or artifact | Status |
| --- | --- | --- |
| Source discovery | CMS Data Portal and official Data Dictionary | Completed |
| API exploration | Python and HTTP GET | Completed |
| Full acquisition | Paginated CMS Data API retrieval | Completed and validated |
| Data Understanding | Executed Jupyter notebook | Completed |
| Local container runtime | Docker Desktop with WSL 2 | Installed and validated locally |
| Raw object storage | Azurite Blob Storage and Storage Explorer | Local service, persistent volume, `raw` blob container, and first JSON blob validated |
| Reusable ingestion | Python ingestion pipeline and metadata | Planned; not implemented |
| Data Profiling | Jupyter notebook | Questions defined; analysis not started |
| Relational storage | PostgreSQL staging and analytics layers | Planned; not configured |
| Analytics | SQL transformations and models | Planned; not implemented |
| Reporting | Power BI Desktop | Planned; not connected |

Docker Desktop is the local infrastructure runtime and has passed the standard `hello-world` test. The official Azurite image was inspected, a named volume (`healthcare_azurite_data`) was created, and the `healthcare-azurite` container was validated with its Blob endpoint bound locally at `http://127.0.0.1:10000`. Microsoft Azure Storage Explorer 1.45.0 was connected to the local emulator, the `raw` blob container was created, and `medicare_inpatient_2024.json` was uploaded and verified as the first local blob. No Compose configuration or PostgreSQL service has been created yet.

## Target architecture

```text
CMS Data API
→ Python ingestion
→ Azurite Blob Storage (local Azure Storage emulation)
→ Python profiling / validation
→ PostgreSQL staging
→ SQL transformations
→ PostgreSQL analytics layer
→ Power BI Desktop
```

Azurite will emulate Azure Blob Storage locally to support object-storage learning without cloud billing. This project must not be represented as an Azure cloud deployment or production Azure experience.

## Repository structure

```text
healthcare-operations-analytics/
├── README.md
├── LICENSE
├── requirements.txt
├── docs/
│   └── docker-basics.md
├── research/
│   ├── business_case.md
│   ├── domain_and_data.md
│   └── data_dictionary.md
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   └── 02_data_profiling.ipynb
└── python/
    └── ingestion/
        └── 00_api_source_probe.py
```

Only folders containing current artifacts are shown. `sql/`, `powerbi/`, `report/`, and `assets/` will be added when their corresponding work begins. Raw datasets, local storage state, database volumes, credentials, and private connection strings are excluded from Git.

## Current artifacts

- [`research/business_case.md`](research/business_case.md): business decision, stakeholders, analytical objectives, scope, and decision boundaries
- [`research/domain_and_data.md`](research/domain_and_data.md): official CMS source, discovery path, provenance, validated understanding, and limitations
- [`research/data_dictionary.md`](research/data_dictionary.md): source-variable interpretation and intended analytical treatment
- [`python/ingestion/00_api_source_probe.py`](python/ingestion/00_api_source_probe.py): compact first direct interaction with the CMS API
- [`python/storage/list_raw_blobs.py`](python/storage/list_raw_blobs.py): Azurite exercise that lists `raw`, writes safe source metadata, and queries the blob's technical properties without downloading its contents
- [`notebooks/01_data_understanding.ipynb`](notebooks/01_data_understanding.ipynb): completed and executed Data Understanding workflow
- [`notebooks/02_data_profiling.ipynb`](notebooks/02_data_profiling.ipynb): purpose and questions reserved for the next interactive analytical stage
- [`docs/docker-basics.md`](docs/docker-basics.md): beginner-friendly, executed walkthrough covering Docker, Azurite, persistent storage, Storage Explorer, the `raw` blob container, and the first uploaded blob
- [`docs/python-azurite-basics.md`](docs/python-azurite-basics.md): beginner-friendly explanation of connecting Python to Azurite, listing blobs, and reading blob properties without downloading the JSON

## Run the current learning artifacts

Create and activate a Python virtual environment, then install the current dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Run the small API probe:

```powershell
python python/ingestion/00_api_source_probe.py
```

Open the notebooks:

```powershell
jupyter lab
```

The Data Understanding notebook contains the completed acquisition evidence and executed validation outputs. The Data Profiling notebook should not be executed or extended until the object-storage and ingestion milestones are understood and completed.

## Next milestone

Define the raw-object naming and metadata contract, then implement a small reusable Python upload step that reproduces the completed manual Storage Explorer workflow and validates the resulting blob properties. Automated infrastructure, Data Profiling, and PostgreSQL remain later milestones.

Source datasets retain their original publisher terms and are not relicensed by this repository.
