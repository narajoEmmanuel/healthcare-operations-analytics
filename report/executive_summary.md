# Executive Summary

**Medicare Inpatient Service & Payment Analytics**  
Hospital benchmarking using public CMS data

Primary stakeholder: Hospital Strategy & Finance Leadership

## Business Question

Hospital Strategy & Finance Leadership cannot review every Medicare inpatient service with equal intensity. This system screens which service categories—and which provider–DRG combinations—should be prioritized for deeper financial and performance review based on activity volume, estimated payment exposure, and payment variation for the same DRG.

It is a screening and benchmarking system. It does not determine profitability, internal cost, operational efficiency, reimbursement appropriateness, or causes of payment differences.

## Data

Source: CMS [Medicare Inpatient Hospitals — by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service), reporting year 2024.

| Item | Verified value |
| --- | --- |
| Provider–DRG observations | 145,879 |
| Columns | 15 |
| Providers | 2,906 |
| DRGs | 540 |
| Total discharges | 4,952,481 |
| Estimated Aggregate Total Payment | $90,927,479,915.25 |
| Estimated Aggregate Medicare Payment | $75,111,479,728.47 |
| Natural candidate key | `Rndrng_Prvdr_CCN + DRG_Cd` |
| Duplicate natural keys | 0 |

## Analytical Approach

The analysis combines four screening views:

- **Portfolio materiality:** national discharge volume and estimated payment exposure by DRG.
- **Estimated aggregate payment exposure:** a derived materiality measure, not a financial statement line.
- **Same-DRG payment benchmarking:** provider average total payment compared with the national provider median for that DRG.
- **Transparent review-priority classification:** High, Moderate, or Routine based on material discharge volume, estimated payment exposure, and within-DRG payment position.

**Estimated Aggregate Total Payment = Total Discharges × Average Total Payment**

This quantity is an estimate constructed from aggregated CMS source measures. It is not revenue, profit, margin, or internal hospital cost.

## Key Findings

1. **DRG 871** is the largest category by both activity and estimated payment exposure: 577,119 discharges, 11.65% of national discharges, and approximately $10.52B estimated aggregate total payment (2,661 providers).

2. **DRG 291** accounts for 304,694 discharges and approximately $3.67B estimated aggregate total payment.

3. **DRG 853** accounts for only 79,560 discharges yet approximately $3.71B estimated aggregate total payment. Payment materiality and discharge volume should be examined together rather than assuming the highest-volume category always has the second-highest payment exposure.

4. Review-priority distribution across 145,879 provider–DRG observations:
   - High review priority: 5,142 (3.52%)
   - Moderate review priority: 20,560 (14.09%)
   - Routine review: 120,177 (82.38%)

5. Within DRG 871, the national provider median total payment is $16,181.67, the provider average is $17,799.58, and the discharge-weighted total payment is $18,229.96. These figures show observable within-DRG payment variation. They do not establish cause.

## Review Priorities

The ranking is a screening mechanism based on material discharge volume, estimated payment exposure, and within-DRG payment position. It is not a validated clinical or financial score, and it does not recommend service expansion, closure, or corrective action.

## Limitations

- The source is aggregated, not patient-level.
- Coverage is Original Medicare fee-for-service IPPS activity, not Medicare Advantage or other payers.
- CMS suppresses low-volume provider–DRG combinations (typically 10 or fewer discharges) where applicable.
- No internal hospital cost, charge-to-cost, or margin data are available.
- Geographic wage index, teaching, disproportionate-share, capital, and outlier adjustments can explain legitimate payment variation.
- The analysis does not support causal conclusions about why payments differ.

## Recommended Next Analysis

- Enrich selected high-priority provider–DRG combinations with hospital characteristics (teaching status, bed size, ownership) from public sources.
- Improve peer grouping beyond state and RUCA context fields.
- Examine a short list of High review-priority observations in more detail.
- Incorporate additional CMS reporting years for longitudinal comparison.
- Compare reimbursement variation after controlling for additional institutional and geographic characteristics.
