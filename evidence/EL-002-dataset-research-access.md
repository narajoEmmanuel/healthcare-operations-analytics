# EL-002 — Dataset Research and Access

| Field | Value |
| --- | --- |
| Evidence ID | EL-002 |
| Milestone | Dataset Research and Live Access Verification |
| Date | September 4, 2026 |
| Status | Verified for selection and limited public access; acquisition pending |

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

## Verified facts

- The official primary landing page was reachable publicly and listed annual data for 2019–2024, with 2024 as latest available on the access date.
- CMS describes the primary data as Original Medicare fee-for-service Part A inpatient discharges at IPPS hospitals, aggregated by provider and MS-DRG.
- The official page exposed View Data, Access API, and Download options and identified the data as a free public-use file.
- The official data dictionary exposed provider, service, discharge, charge, average total payment, and average Medicare payment concepts.
- CMS states that provider/DRG observations with 10 or fewer discharges are suppressed.
- The Hospital General Information metadata endpoint returned public JSON metadata, and its datastore endpoint returned JSON records and schema without an account, API key, payment, or institutional affiliation.

## Live access procedure

1. Opened the CMS primary landing page and data dictionary and inspected their published content.
2. Opened Hospital General Information and its Provider Data Catalog metadata endpoint.
3. Issued an unauthenticated GET request on September 4, 2026 to:
   `https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0?offset=0&size=2`
4. Inspected the JSON response and confirmed it contained hospital records, a schema, a count field, and query metadata.

The requested `size=2` did not constrain the response as expected; the test returned substantially more content than intended. Nothing from that response was saved as project data, and this evidence does not treat its count or dimensions as an acquired-dataset manifest.

## What remains untested

- Primary dataset record API identifier and record response in the local shell
- Complete CSV downloads for any reporting year
- Exact filenames, bytes, row counts, column counts, checksums, encodings, and per-year schema consistency
- Join coverage between primary provider CCNs and Hospital General Information facility IDs
- Readmissions and value-based purchasing dataset endpoints and schemas
- Source licensing/terms review beyond the CMS public-use/access notices

## Repository evidence and related commit

Foundation commit: pending first substantive commit. This field will be updated in a separate evidence commit to avoid circular Git evidence.

## Limitations

Medicare fee-for-service inpatient data do not represent the full U.S. patient population. Records are aggregated, low-volume provider/DRG combinations are suppressed, charge and payment concepts differ, and aggregate observational data do not establish causality. Further temporal and schema validation is required before analysis.

## What this evidence does not prove

It does not prove successful full acquisition, data completeness, schema stability, relational join quality, analytical findings, dashboard completion, CMS endorsement, or production readiness.
