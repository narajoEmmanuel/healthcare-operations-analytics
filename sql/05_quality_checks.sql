-- Returns zero rows when all checks pass.
WITH checks AS (
    SELECT 'staging_duplicate_natural_key' AS check_name, count(*) AS failure_count
    FROM (
        SELECT reporting_year, provider_ccn, drg_code
        FROM staging.cms_inpatient
        GROUP BY reporting_year, provider_ccn, drg_code
        HAVING count(*) > 1
    ) AS duplicates
    UNION ALL
    SELECT 'provider_attribute_variants', count(*)
    FROM (
        SELECT reporting_year, provider_ccn
        FROM staging.cms_inpatient
        GROUP BY reporting_year, provider_ccn
        HAVING count(DISTINCT ROW(
            provider_name, provider_street, provider_city, provider_state_fips,
            provider_zip5, provider_state, provider_ruca, provider_ruca_description
        )) > 1
    ) AS variants
    UNION ALL
    SELECT 'drg_description_variants', count(*)
    FROM (
        SELECT reporting_year, drg_code
        FROM staging.cms_inpatient
        GROUP BY reporting_year, drg_code
        HAVING count(DISTINCT drg_description) > 1
    ) AS variants
    UNION ALL
    SELECT 'fact_count_mismatch', abs(
        (SELECT count(*) FROM analytics.fact_inpatient_service)
        - (SELECT count(*) FROM staging.cms_inpatient)
    )
    UNION ALL
    SELECT 'unresolved_provider_fk', count(*)
    FROM analytics.fact_inpatient_service AS f
    LEFT JOIN analytics.dim_provider AS p ON p.provider_key = f.provider_key
    WHERE p.provider_key IS NULL
    UNION ALL
    SELECT 'unresolved_drg_fk', count(*)
    FROM analytics.fact_inpatient_service AS f
    LEFT JOIN analytics.dim_drg AS d ON d.drg_key = f.drg_key
    WHERE d.drg_key IS NULL
)
SELECT check_name, failure_count
FROM checks
WHERE failure_count > 0;
