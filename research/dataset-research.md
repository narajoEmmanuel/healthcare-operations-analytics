# Dataset Research

**Research date:** September 4, 2026
**Decision:** Use the official CMS hospital data ecosystem; retain scope as provisional until acquisition profiling.

## Selection criteria

The source must be public and lawful to access, credible, documented, relevant to hospital operations or payment questions, suitable for multi-year analysis, compatible with relational modeling and Power BI, and manageable for an early-career portfolio. Supporting data must answer a defined requirement rather than merely increase dataset count.

## Alternatives considered

- **New York SPARCS:** rich state discharge data, but a state-specific context and more complex interpretation would narrow the initial national portfolio narrative.
- **CDC datasets:** authoritative for population and public-health questions, but less directly aligned with provider/service payment analysis.
- **Mexican government hospital-discharge data:** professionally relevant, but the initial source-access and documentation comparison favored CMS for a reproducible SQL/BI portfolio.
- **Secondary copies such as Kaggle:** convenient but inferior to publisher-controlled provenance and current documentation.

## Why CMS was selected

CMS provides official public-use data, a documented data dictionary and methodology, stable public landing pages, CSV/API access, and fields that support provider, service, utilization, charge, and payment analysis. It also offers potential facility-level companion data with a shared provider identifier. This combination supports transparent joins, dimensional modeling, SQL validation, and an understandable BI narrative.

## Primary dataset

**Medicare Inpatient Hospitals — by Provider and Service** is the working primary dataset. CMS describes it as Original Medicare fee-for-service Part A inpatient discharge information for IPPS hospitals, aggregated by provider and MS-DRG. On September 4, 2026, the official page listed annual files for 2019 through 2024 and identified 2024 as latest available.

The latest primary API returned the following field names in a two-record access test: `Rndrng_Prvdr_CCN`, `Rndrng_Prvdr_Org_Name`, `Rndrng_Prvdr_City`, `Rndrng_Prvdr_St`, `Rndrng_Prvdr_State_FIPS`, `Rndrng_Prvdr_Zip5`, `Rndrng_Prvdr_State_Abrvtn`, `Rndrng_Prvdr_RUCA`, `Rndrng_Prvdr_RUCA_Desc`, `DRG_Cd`, `DRG_Desc`, `Tot_Dschrgs`, `Avg_Submtd_Cvrd_Chrg`, `Avg_Tot_Pymt_Amt`, and `Avg_Mdcr_Pymt_Amt`. Exact schemas will still be profiled by year before modeling.

## Potential supporting datasets

1. **Hospital General Information:** candidate facility dimension for name, address, type, ownership, emergency-services status, and rating attributes. Its stable catalog identifier was verified and its API returned records during this task.
2. **Hospital Readmissions Reduction Program:** candidate performance context, only if an approved question requires readmission measures or payment-reduction context.
3. **Hospital Value-Based Purchasing / Total Performance Score:** candidate quality/payment-program context, only if an approved question requires it.

The primary dataset and Hospital General Information received record-level API access tests in this phase. Readmissions and value-based purchasing pages/data remain untested and are not in the committed scope.

## Analytical suitability

- **Relational potential:** provider CCN can support a provider dimension; MS-DRG can support a service dimension; year can support a time dimension; utilization and payment fields can form a provider-service-year fact table. Join coverage and identifier formatting must be tested rather than assumed.
- **SQL suitability:** multi-year files invite type normalization, uniqueness checks at declared grain, constraint testing, joins, aggregations, window calculations, and reconciliation.
- **Power BI suitability:** provider, geography, service, year, utilization, and payment concepts can support a star model and drillable business views after requirements are defined.
- **Healthcare/business relevance:** the data can support descriptive questions about service mix, utilization, geographic variation, and differences among charge and payment measures for Original Medicare inpatient activity.

## Strengths

- Official CMS publication with public-use access
- Documented measure definitions and methodology resources
- Provider-and-service aggregation suitable for business intelligence
- Multiple annual releases currently listed for the provisional period
- Potential linkage to official facility characteristics

## Limitations and interpretation caveats

- The population is Original Medicare fee-for-service Part A activity at IPPS hospitals; it does not represent the entire U.S. patient population or all hospital activity.
- Records are aggregate provider/service observations, not individual patient encounters.
- CMS states that provider/DRG combinations with 10 or fewer discharges are suppressed. Absence therefore does not necessarily mean zero activity.
- Submitted charges, average total payments, and average Medicare payments are different concepts. CMS defines charges as provider billing amounts; total payments include Medicare plus applicable beneficiary and third-party components, while Medicare payments exclude beneficiary and third-party amounts.
- Aggregated observational data can identify patterns and associations but cannot by itself establish causality.
- Year-to-year schema, methodology, code definitions, coverage, and inflation effects require validation before trend claims.
- Provider identifiers may require preservation as text, including leading zeros.

## Public access

The primary dataset landing page, data dictionary, and API documentation were publicly reachable without an account. On September 4, 2026, CMS's Access API dialog identified the latest endpoint as:

`https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data`

An unauthenticated request to that endpoint with `?size=2` returned HTTP 200, `application/json`, and exactly two records. The response was inspected in memory and was not saved as analytical project data. The Hospital General Information metadata endpoint and record API also returned JSON without authentication. No complete project datasets were downloaded or accepted into the repository during this phase.

See [`references.md`](references.md) for official sources and [`../evidence/EL-002-dataset-research-access.md`](../evidence/EL-002-dataset-research-access.md) for the exact verification record.
