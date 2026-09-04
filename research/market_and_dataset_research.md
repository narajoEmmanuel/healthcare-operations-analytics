# Market and Dataset Research

**Reviewed:** September 4, 2026

## Hiring requirements

### Target roles

Data Analyst, Business Intelligence Analyst, Healthcare or Clinical Data Analyst, Operations Analyst, analytics-focused Business Analyst, Data Integration Analyst, and HealthTech Analyst.

Official Optum/UnitedHealth Group and CVS Health postings reviewed on the access date repeatedly connected analyst work with SQL, structured or relational data, dashboards, BI tools, data quality, requirements gathering, KPI reporting, stakeholder engagement, and actionable communication. The sample is directional—not a quantified labor-market study—and includes multiple experience levels and regions.

| Priority | Skills | Project implication |
| --- | --- | --- |
| Core | SQL, relational modeling, PostgreSQL, Power BI, Power Query, DAX, transformation, validation, KPIs, dashboards, business communication | Make these the visible analytical workflow. |
| Supporting | Python, pandas, Git/GitHub, ETL concepts, multi-source integration, healthcare context, documentation | Use them for reproducibility and quality control. |
| Deferred unless justified | dbt, Spark, Databricks, Fabric, cloud platforms, Airflow, CI/CD, machine learning | Keep them outside the initial scope. |

## Dataset selection

### Criteria and alternatives

The source needed official provenance, public access, documentation, multi-year relevance, relational potential, and a manageable scope for SQL and Power BI.

| Source considered | Decision |
| --- | --- |
| CMS hospital data | Selected for official documentation, provider/service measures, public API/CSV access, and facility-level linkage potential. |
| New York SPARCS | Not selected for the initial project; its state-specific scope narrows the intended national narrative. |
| CDC data | Not selected; better aligned with population-health questions than provider/service payment analysis. |
| Mexican government discharge data | Retained as a future option; CMS offered clearer initial documentation and access for this portfolio objective. |
| Secondary copies such as Kaggle | Rejected in favor of publisher-controlled provenance. |

### Selected source

The primary dataset is [CMS Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service). CMS describes it as Original Medicare fee-for-service Part A inpatient discharges at IPPS hospitals, aggregated by provider and MS-DRG. The page listed 2019–2024 on the review date.

Hospital General Information is a candidate provider dimension. Readmissions and value-based purchasing data will be included only if approved analytical questions require them.

## Access verification

| Check | Verified result |
| --- | --- |
| Primary endpoint | `https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data?size=2` |
| Date and access | September 4, 2026; unauthenticated request |
| Response | HTTP 200, `application/json`, exactly two requested records |
| Storage | Inspected in memory; sample not retained as project data |
| Supporting source | Hospital General Information metadata and records also responded without authentication; its earlier size parameter did not limit the response as expected |

Observed primary fields:

`Rndrng_Prvdr_CCN`, `Rndrng_Prvdr_Org_Name`, `Rndrng_Prvdr_City`, `Rndrng_Prvdr_St`, `Rndrng_Prvdr_State_FIPS`, `Rndrng_Prvdr_Zip5`, `Rndrng_Prvdr_State_Abrvtn`, `Rndrng_Prvdr_RUCA`, `Rndrng_Prvdr_RUCA_Desc`, `DRG_Cd`, `DRG_Desc`, `Tot_Dschrgs`, `Avg_Submtd_Cvrd_Chrg`, `Avg_Tot_Pymt_Amt`, and `Avg_Mdcr_Pymt_Amt`.

This verifies public record-level access and the sample field names. Full downloads, local filenames, dimensions, file sizes, checksums, year-to-year consistency, joins, and analytical suitability remain unverified.

## Key limitations

The data cover Original Medicare fee-for-service Part A activity at IPPS hospitals, not the entire U.S. patient population or all hospital activity. Records are aggregated rather than patient encounters; CMS suppresses provider/DRG combinations with 10 or fewer discharges. Charges, total payments, and Medicare payments are distinct measures. Aggregate observational data do not establish causality. These constraints are carried into the [business case](business_case.md).

## Sources

| Source | Use |
| --- | --- |
| [CMS primary dataset](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service) | Scope, years, access options, public-use status, and suppression guidance |
| [CMS data dictionary](https://data.cms.gov/resources/medicare-inpatient-hospitals-by-provider-and-service-data-dictionary-0) | Field and payment definitions |
| [CMS methodology](https://data.cms.gov/resources/medicare-inpatient-hospitals-methodology) | Population and methodological context |
| [CMS Data API documentation](https://data.cms.gov/api-docs) | Primary API behavior |
| [Hospital General Information](https://data.cms.gov/provider-data/dataset/xubh-q36u) and [Provider Data API documentation](https://data.cms.gov/provider-data/docs) | Candidate provider attributes and supporting API |
| [Optum/UnitedHealth Group Data Analyst](https://careers.unitedhealthgroup.com/job/dublin/data-analyst/34088/99111973552), [Senior Developer, Visualizations](https://careers.unitedhealthgroup.com/en/job/eden-prairie/senior-developer-visualizations/34088/95975893712), and [CVS Health Analyst, Resource Planning](https://jobs.cvshealth.com/us/en/job/R1025059/Analyst-Resource-Planning) | Directional hiring requirements; postings are time-sensitive |
