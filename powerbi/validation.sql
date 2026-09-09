-- Read-only source-of-truth checks for Power BI Desktop validation.
-- Run with the repository's documented psql command and compare the results
-- with the corresponding unfiltered or filtered report visuals.

-- 1. Imported row counts.
SELECT 'Portfolio Overview' AS power_bi_table, count(*) AS expected_rows
FROM analytics.v_portfolio_overview
UNION ALL
SELECT 'DRG Benchmark', count(*)
FROM analytics.v_drg_benchmark
UNION ALL
SELECT 'Provider DRG Review', count(*)
FROM analytics.v_provider_drg_review_priority;

-- 2. Unfiltered headline cards.
SELECT reporting_year,
       provider_count,
       drg_count,
       total_discharges,
       estimated_aggregate_total_payment,
       estimated_aggregate_medicare_payment
FROM analytics.v_portfolio_overview
ORDER BY reporting_year;

-- 3. Priority cards.
SELECT sum(total_discharges) AS total_discharges,
       sum(estimated_aggregate_total_payment) AS estimated_aggregate_total_payment,
       sum(estimated_aggregate_medicare_payment) AS estimated_aggregate_medicare_payment,
       count(DISTINCT provider_ccn) AS provider_count,
       count(DISTINCT drg_code) AS drg_count,
       avg(avg_total_payment) AS average_total_payment,
       avg(avg_medicare_payment) AS average_medicare_payment,
       count(*) AS review_priority_count
FROM analytics.v_provider_drg_review_priority
WHERE reporting_year = 2024;

SELECT review_priority,
       count(*) AS expected_count,
       round(100.0 * count(*) / sum(count(*)) OVER (), 2) AS expected_share_pct
FROM analytics.v_provider_drg_review_priority
WHERE reporting_year = 2024
GROUP BY review_priority
ORDER BY expected_count DESC;

-- 4. Representative DRG benchmark and DRG-filtered card context.
SELECT reporting_year,
       drg_code,
       drg_description,
       provider_count,
       total_discharges,
       discharge_share_national,
       estimated_aggregate_total_payment,
       provider_average_total_payment,
       provider_median_total_payment,
       discharge_weighted_total_payment
FROM analytics.v_drg_benchmark
WHERE reporting_year = 2024
  AND drg_code = '871';

SELECT count(DISTINCT provider_ccn) AS provider_count,
       count(DISTINCT drg_code) AS drg_count,
       sum(total_discharges) AS total_discharges,
       sum(estimated_aggregate_total_payment) AS estimated_aggregate_total_payment
FROM analytics.v_provider_drg_review_priority
WHERE reporting_year = 2024
  AND drg_code = '871';

-- 5. Representative provider/DRG row.
SELECT provider_ccn,
       provider_name,
       provider_state,
       drg_code,
       total_discharges,
       avg_total_payment,
       drg_median_total_payment,
       payment_difference_from_drg_median,
       payment_difference_pct,
       payment_percentile_within_drg,
       estimated_aggregate_total_payment,
       review_priority
FROM analytics.v_provider_drg_review_priority
WHERE reporting_year = 2024
  AND provider_ccn = '330101'
  AND drg_code = '871';

-- 6. DRG plus state interaction test.
SELECT count(*) AS provider_drg_rows,
       count(DISTINCT provider_ccn) AS provider_count,
       sum(total_discharges) AS total_discharges,
       sum(estimated_aggregate_total_payment) AS estimated_aggregate_total_payment
FROM analytics.v_provider_drg_review_priority
WHERE reporting_year = 2024
  AND drg_code = '871'
  AND provider_state = 'CA';

-- 7. Top service categories for chart spot-checking.
SELECT drg_code,
       drg_description,
       provider_count,
       total_discharges,
       estimated_aggregate_total_payment
FROM analytics.v_drg_benchmark
WHERE reporting_year = 2024
ORDER BY total_discharges DESC
LIMIT 10;

SELECT drg_code,
       drg_description,
       provider_count,
       total_discharges,
       estimated_aggregate_total_payment
FROM analytics.v_drg_benchmark
WHERE reporting_year = 2024
ORDER BY estimated_aggregate_total_payment DESC
LIMIT 10;
