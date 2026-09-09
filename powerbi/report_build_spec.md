# Deterministic Power BI Desktop build specification

## Global setup

Use a 16:9 canvas, import `healthcare_finance_theme.json`, and use the same title block on every page: 24 pt page title, 11 pt subtitle, and a thin teal divider. Keep a white visual surface on the light gray canvas. Use teal for primary materiality, navy for comparison, amber for moderate review, muted brick for high review, and slate for routine review. Avoid alarm wording and red/green performance semantics.

Set currency fields to `$#,0` on charts and `$#,0.00` in tables. Set percentages to one decimal place, counts to whole numbers with thousands separators, and card display units to Auto. Sort code labels as text.

Create every measure in `measures.dax` on `Provider DRG Review`. Format payment measures as currency, count measures as whole numbers, and share/percent measures as percentages with one decimal place.

## Page 1 - Executive Overview

Subtitle: **Portfolio materiality across 2024 Medicare inpatient provider-DRG activity**

Top row contains four cards using `Provider DRG Review` measures:

1. Total Discharges
2. Estimated Aggregate Total Payment
3. Provider Count
4. DRG Count

Main visual: horizontal bar chart titled **Top DRGs by Estimated Aggregate Total Payment**.

- Y-axis: `drg_description`
- X-axis: `Estimated Aggregate Total Payment`
- Tooltips: `drg_code`, `Total Discharges`, `Provider Count`
- Visual filter: Top 10 `drg_description` by `Estimated Aggregate Total Payment`
- Sort descending by the measure

Second visual: horizontal bar chart titled **Top DRGs by Total Discharges**.

- Y-axis: `drg_description`
- X-axis: `Total Discharges`
- Tooltips: `drg_code`, `Estimated Aggregate Total Payment`
- Visual filter: Top 10 by `Total Discharges`
- Sort descending

Use no slicer on this single-year executive page. Add a short note: **Materiality reflects activity and estimated aggregate payment, not profitability, cost, or margin.**

## Page 2 - Service Category Analysis

Subtitle: **DRG scale by national discharge activity and estimated payment exposure**

Use only `DRG Benchmark` fields on this page.

Left chart: horizontal bar titled **Highest-volume DRGs**.

- Y-axis: `drg_description`
- X-axis: Sum of `total_discharges`
- Tooltips: `drg_code`, `provider_count`, `discharge_share_national`
- Top 15 by Sum of `total_discharges`

Right chart: horizontal bar titled **Highest estimated payment exposure**.

- Y-axis: `drg_description`
- X-axis: Sum of `estimated_aggregate_total_payment`
- Tooltips: `drg_code`, `provider_count`, `total_discharges`, `discharge_weighted_total_payment`
- Top 15 by Sum of `estimated_aggregate_total_payment`

Bottom matrix, sorted by estimated aggregate payment descending:

- `drg_code`
- `drg_description`
- `provider_count`
- `total_discharges`
- `discharge_share_national`
- `estimated_aggregate_total_payment`
- `provider_average_total_payment`
- `provider_median_total_payment`
- `discharge_weighted_total_payment`

Add dropdown slicers for `drg_code` and `drg_description`; enable Search. Select each chart and use **Edit interactions** so both slicers filter both charts and the matrix.

## Page 3 - Payment Benchmarking

Subtitle: **Provider payment variation relative to the national provider median for the same DRG**

Use only `Provider DRG Review`. Add a single-select dropdown slicer for `drg_code`; place `drg_description` beside it as a dropdown with Search. The user must select one DRG before interpreting provider comparisons. Add dropdown slicers for `provider_state` and `provider_ruca`.

Top cards:

- Average Total Payment
- Selected DRG Median Total Payment
- Provider Count
- Total Discharges

Main chart: clustered horizontal bar titled **Provider Average Payment vs Same-DRG Median**.

- Y-axis: `provider_name`
- X-axis values: `Average Total Payment` and `Selected DRG Median Total Payment`
- Tooltips: `provider_ccn`, `provider_state`, `total_discharges`, `payment_difference_pct`, `payment_percentile_within_drg`
- Visual filter: Top 20 providers by `Estimated Aggregate Total Payment`
- Sort by Average Total Payment descending

Bottom table:

- `provider_ccn`
- `provider_name`
- `provider_state`
- `total_discharges`
- `avg_total_payment`
- `drg_median_total_payment`
- `payment_difference_from_drg_median`
- `payment_difference_pct`
- `payment_percentile_within_drg`

Use data bars on `payment_difference_pct` with a restrained diverging scale centered at zero. Title the column **Difference from Same-DRG Median**. Add a note: **Variation identifies potential outliers that warrant review; it does not establish overpayment, underpayment, efficiency, or cause.**

Verify with **Edit interactions** that all four slicers filter the cards, chart, and table. Never mix DRGs in the provider comparison chart.

## Page 4 - Review Priorities

Subtitle: **Transparent screening based on volume, estimated exposure, and within-DRG payment position**

Top cards:

- High Priority Count
- Moderate Priority Count
- Routine Review Count
- High Priority Share

Slicers:

- `review_priority`
- `provider_state`
- `drg_code`
- `drg_description` with Search
- optional `provider_ruca`

Primary table, sorted first by priority category and then by estimated aggregate payment descending:

- `provider_name`
- `provider_state`
- `drg_code`
- `drg_description`
- `total_discharges`
- `estimated_aggregate_total_payment`
- `avg_total_payment`
- `drg_median_total_payment`
- `payment_difference_pct`
- `payment_percentile_within_drg`
- `review_priority`

Apply conditional background formatting only to `review_priority`: muted brick `#A64B4B` with white text for High, amber `#C28A27` with dark text for Moderate, and light slate `#D8E0E7` with dark text for Routine. Do not apply alarm icons. Add a note: **Review priority is a screening category, not a validated financial, clinical, or operational score.**

## Required interaction test

1. Select DRG `871` on Payment Benchmarking. All provider visuals must show only the 2,661 providers for that DRG and cards must show 577,119 discharges and $10,520,854,134.60 estimated aggregate total payment.
2. Add state `CA`. The context must show 261 providers, 71,060 discharges, and $1,635,779,544.36 estimated aggregate total payment.
3. Clear state, then test `provider_state` and `provider_ruca` independently.
4. On Review Priorities, selecting High must show 5,142 rows before any other slicer. Selecting Moderate must show 20,560; Routine must show 120,177.
5. Clear every filter and confirm the executive cards return to the portfolio totals in `validation.sql`.

## Save and export

Save the real report as `powerbi/Medicare_Inpatient_Service_Payment_Analytics.pbix`. Use **File > Export > Export to PDF** to create `report/Medicare_Inpatient_Service_Payment_Analytics.pdf`. For each page, use Power BI Desktop's page canvas at 100% zoom and capture the actual report surface to:

- `assets/powerbi/executive_overview.png`
- `assets/powerbi/service_category_analysis.png`
- `assets/powerbi/payment_benchmarking.png`
- `assets/powerbi/review_priorities.png`

Do not substitute mockups for report exports.
