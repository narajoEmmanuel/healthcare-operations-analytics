# EL-002 — Dataset Research and Access

| Field | Value |
| --- | --- |
| Evidence ID | EL-002 |
| Milestone | Dataset Research and Live Access Verification |
| Date | September 4, 2026 |
| Status | Access verified; acquisition pending |

## Objective

Select an official, documented healthcare dataset ecosystem suitable for relational SQL and business intelligence work, and verify lightweight public access without downloading the full project data.

## What Emmanuel personally completed

Emmanuel defined the selection goals, reviewed candidate ecosystems in the prior research, selected CMS provisionally, and required an evidence-first acquisition standard. Repository drafting and the current live source/API checks were performed with AI assistance and remain subject to Emmanuel's review.

## Technologies used

CMS public web pages and APIs, web search, a Python standard-library HTTP client for a local unauthenticated GET test, Git, and Markdown.

## Data and sources used

- Primary: *Medicare Inpatient Hospitals — by Provider and Service*
- Supporting candidate tested: *Hospital General Information* (`xubh-q36u`)
- Other supporting candidates researched but not API-tested: Hospital Readmissions Reduction Program and Hospital Value-Based Purchasing/Total Performance Score

## Evidence produced

- [`../research/dataset-research.md`](../research/dataset-research.md)
- [`../research/references.md`](../research/references.md)
- [`../data/README.md`](../data/README.md)

## Verified

- The official primary landing page was reachable publicly and listed annual data for 2019–2024, with 2024 as latest available on the access date.
- CMS describes the primary data as Original Medicare fee-for-service Part A inpatient discharges at IPPS hospitals, aggregated by provider and MS-DRG.
- The official page exposed View Data, Access API, and Download options and identified the data as a free public-use file.
- The official data dictionary exposed provider, service, discharge, charge, average total payment, and average Medicare payment concepts.
- CMS states that provider/DRG observations with 10 or fewer discharges are suppressed.
- The primary dataset's latest record endpoint returned HTTP 200 and `application/json` for an unauthenticated `size=2` request.
- The primary response contained exactly two requested sample records with the fields listed below.
- The Hospital General Information metadata endpoint returned public JSON metadata, and its datastore endpoint returned JSON records and schema without an account, API key, payment, or institutional affiliation.

### Primary sample fields observed

`Rndrng_Prvdr_CCN`, `Rndrng_Prvdr_Org_Name`, `Rndrng_Prvdr_City`, `Rndrng_Prvdr_St`, `Rndrng_Prvdr_State_FIPS`, `Rndrng_Prvdr_Zip5`, `Rndrng_Prvdr_State_Abrvtn`, `Rndrng_Prvdr_RUCA`, `Rndrng_Prvdr_RUCA_Desc`, `DRG_Cd`, `DRG_Desc`, `Tot_Dschrgs`, `Avg_Submtd_Cvrd_Chrg`, `Avg_Tot_Pymt_Amt`, and `Avg_Mdcr_Pymt_Amt`.

## Live access procedure

1. Opened the CMS primary landing page and data dictionary and inspected their published content.
2. Opened the primary page's Access API dialog, which identified the latest endpoint as:
   `https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data`
3. Issued an unauthenticated in-memory GET request on September 4, 2026 to:
   `https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data?size=2`
4. Inspected the HTTP 200 response, content type, record count, and actual keys. The response contained two JSON records and was not written to the repository.
5. Opened Hospital General Information and its Provider Data Catalog metadata endpoint.
6. Issued an unauthenticated GET request on September 4, 2026 to:
   `https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?offset=0&size=2`
7. Inspected the supporting JSON response and confirmed it contained hospital records, a schema, a count field, and query metadata.

The primary API honored `size=2`. The supporting Hospital General Information endpoint did not constrain its earlier response as expected and returned substantially more content than intended. Nothing from either response was saved as project data, and this evidence does not treat response counts or dimensions as an acquired-dataset manifest.

## Not yet verified

- Full raw dataset downloads for any reporting year
- Final raw filenames, local file sizes, complete local row counts, column counts, SHA-256 checksums, encodings, and per-year schema consistency
- Join coverage between primary provider CCNs and Hospital General Information facility IDs
- Readmissions and value-based purchasing dataset endpoints and schemas
- Source licensing/terms review beyond the CMS public-use/access notices
- PostgreSQL ingestion and full data profiling
- Analytical findings and Power BI integration

## Repository evidence and related commit

Foundation commit: `929738d7ee294ff62cfd0b721826d6262784f811` (`docs: establish project research and repository foundation`).

Primary access verification commit: `df315f37a43bba8a62cd313939ed3f63b0c673d4` (`docs: verify primary CMS dataset access`). This evidence update is committed separately so the reference is not circular.

## Limitations

Medicare fee-for-service inpatient data do not represent the full U.S. patient population. Records are aggregated, low-volume provider/DRG combinations are suppressed, charge and payment concepts differ, and aggregate observational data do not establish causality. Further temporal and schema validation is required before analysis.

## What this evidence does not prove

It does not prove successful full acquisition, data completeness, schema stability, relational join quality, analytical findings, dashboard completion, CMS endorsement, or production readiness.
