# Medicare Inpatient Service & Payment Analytics

**Hospital benchmarking using public CMS data**

## Business Decision

Hospital strategy and finance teams cannot review every inpatient service with the same level of attention. The analysis will support one decision:

> **Which Medicare inpatient service categories should be prioritized for deeper financial and performance review based on their activity volume, payment contribution, and payment variation relative to comparable hospitals?**

The project is an independent portfolio analysis using public CMS data. It does not represent work performed for CMS or for a hospital.

## Business Problem

Medicare inpatient activity is distributed across many hospitals and types of hospitalizations. CMS groups clinically similar inpatient cases into Diagnosis Related Groups (DRGs) and reports discharge volume, hospital charges, average total payments, and average Medicare payments for each hospital and DRG combination (Centers for Medicare & Medicaid Services [CMS], 2024, 2026a).

Reviewing volume alone may prioritize common services without considering their financial significance. Reviewing average payment alone may overemphasize expensive but low-volume services. A more useful screening approach combines **how frequently a service occurs, its estimated payment contribution, and how its payment compares with the same type of hospitalization across other hospitals**.

The purpose is not to label hospitals as efficient, inefficient, underpaid, or overpaid. Medicare inpatient payments are influenced by the DRG assigned to the case and additional factors such as geographic wage adjustments, teaching-hospital status, treatment of low-income populations, and unusually costly cases (CMS, 2026b). Payment differences therefore identify areas for further investigation, not their underlying cause.

## Stakeholders

| Stakeholder | Decision need |
| --- | --- |
| **Hospital Strategy & Finance Leadership** | Determine which inpatient services merit deeper financial and performance review. |
| **Service Management** | Understand the relative importance and payment profile of specific inpatient services. |
| **Finance / Revenue Analytics** | Benchmark payment patterns for comparable hospitalizations. |
| **BI / Analytics** | Provide reproducible metrics, comparisons, and decision-support reporting. |

## Analytical Objectives

1. **Measure portfolio importance:** identify the inpatient service categories that account for the greatest Medicare discharge volume and estimated payment contribution.
2. **Benchmark payment variation:** compare average Medicare payments for the same DRG across hospitals and appropriate peer groups.
3. **Prioritize review:** identify high-materiality service categories and hospital-service combinations with payment patterns that warrant deeper investigation.

Any project-derived estimate of payment contribution will be explicitly defined and validated before use. It will not be presented as hospital revenue or profitability.

## Scope

The analysis will use CMS public data for Original Medicare fee-for-service Part A beneficiaries treated at hospitals paid through the Inpatient Prospective Payment System. The primary dataset is organized by hospital and DRG and includes utilization and payment information (CMS, 2026a).

The core analysis will focus on:

- inpatient discharge volume
- DRG-based service mix
- estimated payment contribution
- payment variation within comparable DRGs
- hospital and geographic benchmarking
- prioritization of material or unusual patterns for further review

## What the Analysis Cannot Conclude

The available data do not by themselves establish:

- hospital profitability or actual internal costs
- operational efficiency
- inappropriate or excessive Medicare reimbursement
- staffing or capacity problems
- patient-level clinical outcomes
- causes of payment differences
- whether a hospital should expand, reduce, or discontinue a service

The output is a **screening and benchmarking tool**, not a final operational or financial decision model.

## References

Centers for Medicare & Medicaid Services. (2024). *Medicare Inpatient Hospitals: By Provider and Service data dictionary*. CMS Data. https://data.cms.gov/resources/medicare-inpatient-hospitals-by-provider-and-service-data-dictionary-0

Centers for Medicare & Medicaid Services. (2026a). *Medicare Inpatient Hospitals: By Provider and Service*. CMS Data. https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service

Centers for Medicare & Medicaid Services. (2026b). *Acute Inpatient Prospective Payment System (IPPS)*. U.S. Department of Health and Human Services. https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps
