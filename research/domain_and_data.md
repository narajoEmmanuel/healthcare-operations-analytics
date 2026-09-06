# Domain and Data

## CMS inpatient dataset

| Item | Current understanding |
| --- | --- |
| Official source | [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service) |
| Population | Original Medicare fee-for-service Part A discharges from hospitals paid under the Inpatient Prospective Payment System (IPPS) |
| Published grain | Provider and Medicare Severity Diagnosis Related Group (MS-DRG); exact uniqueness will be tested after acquisition |
| Provisional period | 2019–2024, subject to schema and comparability checks |
| Access status | Public landing page, documentation, download options, and unauthenticated record API verified on September 4, 2026 |

The [latest record API](https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data?size=2) returned two requested JSON records with HTTP 200. The sample was inspected in memory and not retained as project data. Full downloads, local dimensions, filenames, file sizes, checksums, and cross-year consistency remain unverified.

## Data Source Discovery Path

The primary dataset was identified directly through the official CMS Data portal rather than through a third-party repository.

**Navigation path**

```text
CMS Data
→ Provider Summary by Type of Service
→ Medicare Inpatient Hospitals
→ Medicare Inpatient Hospitals, by Provider and Service
→ Access API
→ 2024 dataset
→ Official CMS Data API endpoint
```

**Why this dataset**

The provider-and-service level was selected because the analysis requires both hospital-level identification and inpatient service categories represented by DRGs. This granularity supports comparisons of discharge volume and Medicare payment patterns for the same type of hospitalization across hospitals.

**Official dataset page:** [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service)

**API endpoint used:** [Official CMS Data API endpoint](https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data)

The endpoint was first tested with `size=2` before any full acquisition was attempted. The API provides a reproducible programmatic path from CMS to the analytical workflow and supports HTTP requests, JSON handling, pagination, validation, and automated ingestion.

## Medicare and MS-DRG context

An MS-DRG classifies an inpatient case using factors including diagnoses, procedures, complicating conditions, age, sex, and discharge status. The groups are intended to combine clinically coherent cases with similar expected hospital resource use.

Under IPPS, each case is assigned to a DRG with a relative weight based on the average resources required for that group. Payment also reflects factors such as the hospital wage index and applicable teaching, disproportionate-share, capital, and outlier adjustments. Provider payment differences therefore require contextual interpretation; they are not direct measures of efficiency, quality, or profitability.

## Relevant variables

The dataset contains provider identifiers and location attributes, MS-DRG classifications, discharge volume, and three distinct monetary measures. The complete variable-level interpretation and proposed analytical treatment are maintained in the [`Analytical Data Dictionary`](data_dictionary.md).

The evolving data-understanding process—including variable inspection, dimension and measure roles, the candidate row grain, and primary-key validation—is recorded in the [`Python data-understanding notebook`](../python/01_data_understanding.ipynb).

### Payment variables

- **Submitted covered charge (`Avg_Submtd_Cvrd_Chrg`):** the provider's average charge for Medicare-covered services in the DRG. It is not the amount paid and does not represent the provider's cost.
- **Average total payment (`Avg_Tot_Pymt_Amt`):** includes the DRG payment and applicable teaching, disproportionate-share, capital, and outlier components, plus beneficiary cost sharing and qualifying third-party payments.
- **Average Medicare payment (`Avg_Mdcr_Pymt_Amt`):** Medicare's share of the payment, excluding beneficiary copayments and deductibles and additional third-party payments.

These measures must not be used interchangeably. The dataset does not provide the hospital cost and margin information required for direct profitability conclusions.

## Data limitations

- The population does not represent Medicare Advantage, other payers, or the full U.S. inpatient population.
- Records are aggregated provider/MS-DRG observations, not patient encounters.
- CMS suppresses provider/MS-DRG combinations with 10 or fewer discharges; missing combinations cannot be interpreted as zero volume.
- Payment variation may reflect case classification, wage geography, hospital characteristics, and statutory adjustments as well as differences in service mix.
- Annual schema, MS-DRG definitions, payment policy, and reporting coverage may change and must be tested before trend analysis.
- Aggregate observational data can describe variation but cannot establish causality or measure care quality by themselves.

## Sources

- Centers for Medicare & Medicaid Services, [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service), accessed September 4, 2026.
- Centers for Medicare & Medicaid Services, [dataset data dictionary](https://data.cms.gov/resources/medicare-inpatient-hospitals-by-provider-and-service-data-dictionary-0), accessed September 4, 2026.
- Centers for Medicare & Medicaid Services, [Medicare Inpatient Hospitals methodology](https://data.cms.gov/resources/medicare-inpatient-hospitals-methodology), accessed September 4, 2026.
- Centers for Medicare & Medicaid Services, [CMS Program Statistics Glossary: MS-DRGs](https://data.cms.gov/resources/cms-program-statistics-glossary), accessed September 4, 2026.
- Centers for Medicare & Medicaid Services, [Acute Inpatient Prospective Payment System](https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps), accessed September 4, 2026.
