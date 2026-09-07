-- Portfolio overview.
SELECT * FROM analytics.v_portfolio_overview ORDER BY reporting_year;

-- Highest-materiality DRGs based on the explicitly estimated payment measure.
SELECT reporting_year, drg_code, drg_description, provider_count,
       total_discharges, discharge_share_national,
       estimated_aggregate_total_payment,
       provider_median_total_payment
FROM analytics.v_drg_benchmark
ORDER BY estimated_aggregate_total_payment DESC NULLS LAST
LIMIT 20;

-- Transparent provider/DRG screening output.
SELECT provider_ccn, provider_name, provider_state, drg_code, drg_description,
       total_discharges, estimated_aggregate_total_payment, avg_total_payment,
       drg_median_total_payment, state_median_total_payment,
       ruca_median_total_payment, payment_difference_from_drg_median,
       payment_difference_pct, review_priority
FROM analytics.v_provider_drg_review_priority
WHERE review_priority <> 'Routine review'
ORDER BY CASE WHEN review_priority = 'High review priority' THEN 1 ELSE 2 END,
         estimated_aggregate_total_payment DESC NULLS LAST;

-- Geographic benchmark; state is context, not a full hospital peer definition.
WITH state_benchmark AS (
    SELECT f.reporting_year, f.drg_code, p.provider_state,
           sum(f.total_discharges) AS total_discharges,
           sum(f.estimated_aggregate_total_payment)
             / NULLIF(sum(f.total_discharges), 0) AS weighted_total_payment
    FROM analytics.fact_inpatient_service AS f
    JOIN analytics.dim_provider AS p ON p.provider_key = f.provider_key
    GROUP BY f.reporting_year, f.drg_code, p.provider_state
)
SELECT *, rank() OVER (
    PARTITION BY reporting_year, drg_code
    ORDER BY weighted_total_payment DESC NULLS LAST
) AS state_payment_rank_within_drg
FROM state_benchmark
WHERE provider_state IS NOT NULL;
