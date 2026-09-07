TRUNCATE TABLE analytics.fact_inpatient_service;
TRUNCATE TABLE analytics.dim_provider RESTART IDENTITY CASCADE;
TRUNCATE TABLE analytics.dim_drg RESTART IDENTITY CASCADE;

INSERT INTO analytics.dim_provider (
    reporting_year, provider_ccn, provider_name, provider_street,
    provider_city, provider_state_fips, provider_zip5, provider_state,
    provider_ruca, provider_ruca_description
)
SELECT DISTINCT ON (reporting_year, provider_ccn)
    reporting_year, provider_ccn, provider_name, provider_street,
    provider_city, provider_state_fips, provider_zip5, provider_state,
    provider_ruca, provider_ruca_description
FROM staging.cms_inpatient
ORDER BY reporting_year, provider_ccn, drg_code;

INSERT INTO analytics.dim_drg (reporting_year, drg_code, drg_description)
SELECT DISTINCT ON (reporting_year, drg_code)
    reporting_year, drg_code, drg_description
FROM staging.cms_inpatient
ORDER BY reporting_year, drg_code, provider_ccn;

INSERT INTO analytics.fact_inpatient_service (
    reporting_year, provider_key, drg_key, provider_ccn, drg_code,
    total_discharges, avg_submitted_covered_charge, avg_total_payment,
    avg_medicare_payment, estimated_aggregate_total_payment,
    estimated_aggregate_medicare_payment, source_sha256
)
SELECT
    s.reporting_year, p.provider_key, d.drg_key, s.provider_ccn, s.drg_code,
    s.total_discharges, s.avg_submitted_covered_charge, s.avg_total_payment,
    s.avg_medicare_payment,
    s.total_discharges * s.avg_total_payment,
    s.total_discharges * s.avg_medicare_payment,
    s.source_sha256
FROM staging.cms_inpatient AS s
JOIN analytics.dim_provider AS p
  ON p.reporting_year = s.reporting_year AND p.provider_ccn = s.provider_ccn
JOIN analytics.dim_drg AS d
  ON d.reporting_year = s.reporting_year AND d.drg_code = s.drg_code;

CREATE OR REPLACE VIEW analytics.v_portfolio_overview AS
SELECT
    reporting_year,
    count(DISTINCT provider_key) AS provider_count,
    count(DISTINCT drg_key) AS drg_count,
    sum(total_discharges) AS total_discharges,
    sum(estimated_aggregate_total_payment) AS estimated_aggregate_total_payment,
    sum(estimated_aggregate_medicare_payment) AS estimated_aggregate_medicare_payment
FROM analytics.fact_inpatient_service
GROUP BY reporting_year;

CREATE OR REPLACE VIEW analytics.v_drg_benchmark AS
SELECT
    f.reporting_year,
    f.drg_code,
    d.drg_description,
    count(*) AS provider_count,
    sum(f.total_discharges) AS total_discharges,
    sum(f.total_discharges)::numeric
        / NULLIF(sum(sum(f.total_discharges)) OVER (
            PARTITION BY f.reporting_year
          ), 0) AS discharge_share_national,
    sum(f.estimated_aggregate_total_payment) AS estimated_aggregate_total_payment,
    avg(f.avg_total_payment) AS provider_average_total_payment,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY f.avg_total_payment)
        AS provider_median_total_payment,
    sum(f.estimated_aggregate_total_payment)
        / NULLIF(sum(f.total_discharges), 0) AS discharge_weighted_total_payment
FROM analytics.fact_inpatient_service AS f
JOIN analytics.dim_drg AS d ON d.drg_key = f.drg_key
GROUP BY f.reporting_year, f.drg_code, d.drg_description;

CREATE OR REPLACE VIEW analytics.v_provider_drg_review_priority AS
WITH state_benchmark AS (
    SELECT
        f.reporting_year, f.drg_key, p.provider_state,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY f.avg_total_payment)
            AS state_median_total_payment
    FROM analytics.fact_inpatient_service AS f
    JOIN analytics.dim_provider AS p ON p.provider_key = f.provider_key
    WHERE p.provider_state IS NOT NULL
    GROUP BY f.reporting_year, f.drg_key, p.provider_state
),
ruca_benchmark AS (
    SELECT
        f.reporting_year, f.drg_key, p.provider_ruca,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY f.avg_total_payment)
            AS ruca_median_total_payment
    FROM analytics.fact_inpatient_service AS f
    JOIN analytics.dim_provider AS p ON p.provider_key = f.provider_key
    WHERE p.provider_ruca IS NOT NULL
    GROUP BY f.reporting_year, f.drg_key, p.provider_ruca
),
scoped AS (
    SELECT
        f.*,
        p.provider_name,
        p.provider_state,
        p.provider_ruca,
        p.provider_ruca_description,
        d.drg_description,
        b.provider_median_total_payment AS drg_median_total_payment,
        sb.state_median_total_payment,
        rb.ruca_median_total_payment,
        f.avg_total_payment - b.provider_median_total_payment
            AS payment_difference_from_drg_median,
        (f.avg_total_payment - b.provider_median_total_payment)
            / NULLIF(b.provider_median_total_payment, 0) AS payment_difference_pct,
        f.total_discharges::numeric
            / NULLIF(sum(f.total_discharges) OVER (
                PARTITION BY f.reporting_year, f.provider_key
              ), 0) AS discharge_share_within_provider,
        percent_rank() OVER (
            PARTITION BY f.reporting_year, f.drg_key
            ORDER BY f.avg_total_payment
        ) AS payment_percentile_within_drg,
        percent_rank() OVER (
            PARTITION BY f.reporting_year
            ORDER BY f.estimated_aggregate_total_payment
        ) AS exposure_percentile,
        percent_rank() OVER (
            PARTITION BY f.reporting_year
            ORDER BY f.total_discharges
        ) AS discharge_percentile
    FROM analytics.fact_inpatient_service AS f
    JOIN analytics.dim_provider AS p ON p.provider_key = f.provider_key
    JOIN analytics.dim_drg AS d ON d.drg_key = f.drg_key
    JOIN analytics.v_drg_benchmark AS b
      ON b.reporting_year = f.reporting_year AND b.drg_code = f.drg_code
    LEFT JOIN state_benchmark AS sb
      ON sb.reporting_year = f.reporting_year
     AND sb.drg_key = f.drg_key
     AND sb.provider_state = p.provider_state
    LEFT JOIN ruca_benchmark AS rb
      ON rb.reporting_year = f.reporting_year
     AND rb.drg_key = f.drg_key
     AND rb.provider_ruca = p.provider_ruca
)
SELECT
    scoped.*,
    CASE
        WHEN discharge_percentile >= 0.75
         AND exposure_percentile >= 0.75
         AND (payment_percentile_within_drg <= 0.10
              OR payment_percentile_within_drg >= 0.90)
            THEN 'High review priority'
        WHEN (discharge_percentile >= 0.75 OR exposure_percentile >= 0.75)
         AND (payment_percentile_within_drg <= 0.25
              OR payment_percentile_within_drg >= 0.75)
            THEN 'Moderate review priority'
        ELSE 'Routine review'
    END AS review_priority
FROM scoped;

COMMENT ON VIEW analytics.v_provider_drg_review_priority IS
    'Transparent screening only: national volume/exposure percentiles plus payment position inside the same DRG; not a validated financial or clinical score.';
