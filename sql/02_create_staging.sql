CREATE TABLE IF NOT EXISTS staging.cms_inpatient (
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
    drg_code varchar(3) NOT NULL,
    drg_description text,
    total_discharges integer,
    avg_submitted_covered_charge numeric(18,2),
    avg_total_payment numeric(18,2),
    avg_medicare_payment numeric(18,2),
    source_sha256 char(64) NOT NULL,
    loaded_at timestamptz NOT NULL DEFAULT current_timestamp,
    CONSTRAINT cms_inpatient_pk PRIMARY KEY (reporting_year, provider_ccn, drg_code)
);

COMMENT ON TABLE staging.cms_inpatient IS
    'Typed copy of the validated CMS Blob snapshot; one provider and DRG per reporting year.';
