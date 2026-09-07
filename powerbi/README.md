# Power BI preparation

Power BI Desktop can connect to PostgreSQL at `127.0.0.1:5432` using the database and credentials in the local `.env`. Import these curated views rather than rebuilding pipeline logic in Power Query:

- `analytics.v_portfolio_overview` — annual headline KPIs.
- `analytics.v_drg_benchmark` — DRG materiality and national payment benchmarks.
- `analytics.v_provider_drg_review_priority` — provider/DRG detail, national/state/RUCA benchmarks, and transparent screening fields.

Power Query should set identifier fields (`provider_ccn`, `drg_code`, ZIP, FIPS, and RUCA) to text and monetary fields to fixed decimal. It should not change the view grain or recalculate benchmarks.

## Proposed report pages

1. **Executive Overview:** total discharges, estimated aggregate payment, providers, DRGs, and highest-materiality DRGs.
2. **Service Category Analysis:** DRG volume, estimated payment exposure, provider count, and concentration.
3. **Payment Benchmarking:** provider payment versus the same-DRG median, distribution, percentile, state, and RUCA filters.
4. **Review Priorities:** sortable detail with volume, exposure, benchmark difference, and priority category.

## KPI and measure definitions

- **Total Discharges:** sum of source-reported discharges.
- **Estimated Aggregate Total Payment:** total discharges multiplied by average total payment, summed at the selected grain. This is an estimate from aggregated values, not revenue, cost, margin, or profit.
- **Provider Count / DRG Count:** distinct keys in the selected context.
- **Payment Difference from DRG Median:** provider average total payment minus the national provider median for the same DRG and year.

Suggested DAX measures:

```DAX
Total Discharges = SUM(v_provider_drg_review_priority[total_discharges])

Estimated Aggregate Total Payment =
SUM(v_provider_drg_review_priority[estimated_aggregate_total_payment])

Provider Count = DISTINCTCOUNT(v_provider_drg_review_priority[provider_ccn])

DRG Count = DISTINCTCOUNT(v_provider_drg_review_priority[drg_code])
```

No `.pbix` is included. Layout, interactions, credentials, refresh behavior, and measure results must be validated in Power BI Desktop before claiming a completed dashboard.
