# Medicare Inpatient Service & Payment Analytics

**Hospital benchmarking using public CMS data**

This portfolio project supports Hospital Strategy & Finance Leadership in screening Medicare inpatient service categories for deeper review based on activity volume, payment contribution, and payment variation relative to comparable hospitals. It is a benchmarking tool, not a profitability, cost, efficiency, reimbursement-appropriateness, or causal model.

## Data source

The project uses the 2024 [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service) dataset from CMS. The complete API retrieval contains 145,879 rows and 15 columns. Source discovery, provenance, grain, candidate-key validation, and limitations are summarized in [`research/domain_and_data.md`](research/domain_and_data.md).

## Current status

### Implemented

- official CMS source and Data Dictionary review
- small-sample CMS API exploration
- complete 2024 API retrieval and retrieval validation
- Data Understanding, including dimension and measure interpretation
- validation of one provider + one DRG per row for the selected reporting year
- validation that `Rndrng_Prvdr_CCN + DRG_Cd` is unique across all 145,879 retrieved rows

### Planned

- local Azure Storage emulation with Azurite as the raw object-storage layer
- reusable Python ingestion and ingestion metadata
- interactive Data Profiling and validation
- PostgreSQL staging and analytics layers
- SQL transformations and analytical models
- Power BI Desktop reporting

Planned components have not been implemented. In particular, this repository does not represent an Azure cloud deployment.

## Target pipeline

```text
CMS Data API
→ Python ingestion
→ Azurite Blob Storage (local emulation)
→ Python profiling / validation
→ PostgreSQL staging
→ SQL transformations
→ PostgreSQL analytics layer
→ Power BI Desktop
```

## Repository organization

- [`research/business_case.md`](research/business_case.md): business decision, stakeholders, objectives, scope, and decision boundaries
- [`research/domain_and_data.md`](research/domain_and_data.md): CMS source, discovery path, validated understanding, provenance, and limitations
- [`research/data_dictionary.md`](research/data_dictionary.md): source-variable interpretation and intended analytical treatment
- [`python/ingestion/00_api_source_probe.py`](python/ingestion/00_api_source_probe.py): compact first interaction with the CMS API
- [`notebooks/01_data_understanding.ipynb`](notebooks/01_data_understanding.ipynb): completed and executed Data Understanding work
- [`notebooks/02_data_profiling.ipynb`](notebooks/02_data_profiling.ipynb): profiling purpose and questions for the next interactive analysis stage
- `sql/`, `powerbi/`, `report/`, and `assets/`: future implementation areas, created only when needed

Source datasets retain their original publisher terms and are not relicensed by this repository.
