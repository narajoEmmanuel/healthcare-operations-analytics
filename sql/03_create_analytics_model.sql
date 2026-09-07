CREATE TABLE IF NOT EXISTS analytics.dim_provider (
    provider_key bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporting_year smallint NOT NULL,
    provider_ccn varchar(6) NOT NULL,
    provider_name text,
    provider_street text,
    provider_city text,
    provider_state_fips varchar(2),
    provider_zip5 varchar(5),
    provider_state varchar(2),
    provider_ruca varchar(10),
    provider_ruca_description text,
    CONSTRAINT dim_provider_natural_key UNIQUE (reporting_year, provider_ccn)
);

CREATE TABLE IF NOT EXISTS analytics.dim_drg (
    drg_key bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporting_year smallint NOT NULL,
    drg_code varchar(3) NOT NULL,
    drg_description text,
    CONSTRAINT dim_drg_natural_key UNIQUE (reporting_year, drg_code)
);

CREATE TABLE IF NOT EXISTS analytics.fact_inpatient_service (
    reporting_year smallint NOT NULL,
    provider_key bigint NOT NULL REFERENCES analytics.dim_provider(provider_key),
    drg_key bigint NOT NULL REFERENCES analytics.dim_drg(drg_key),
    provider_ccn varchar(6) NOT NULL,
    drg_code varchar(3) NOT NULL,
    total_discharges integer,
    avg_submitted_covered_charge numeric(18,2),
    avg_total_payment numeric(18,2),
    avg_medicare_payment numeric(18,2),
    estimated_aggregate_total_payment numeric(24,2),
    estimated_aggregate_medicare_payment numeric(24,2),
    source_sha256 char(64) NOT NULL,
    CONSTRAINT fact_inpatient_service_pk
        PRIMARY KEY (reporting_year, provider_ccn, drg_code),
    CONSTRAINT fact_provider_drg_unique UNIQUE (provider_key, drg_key)
);

COMMENT ON TABLE analytics.fact_inpatient_service IS
    'One provider-DRG observation per reporting year. Aggregate payment fields are estimates: discharges multiplied by source average payment.';
