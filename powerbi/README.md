# Power BI report

The local report is implemented as a Power BI Project (PBIP) and is ready for final rendering and metric verification in Power BI Desktop. The editable PBIR report and TMDL semantic-model definitions are versionable source; no `.pbix`, screenshots, PDF, Power BI Service publication, or cloud dependency is claimed.

Open [`Medicare_Inpatient_Service_Payment_Analytics.pbip`](Medicare_Inpatient_Service_Payment_Analytics.pbip) in Power BI Desktop to perform the final validation.

## PBIP architecture

- Report: enhanced PBIR definitions in `Medicare_Inpatient_Service_Payment_Analytics.Report/definition/`
- Semantic model: TMDL definitions in `Medicare_Inpatient_Service_Payment_Analytics.SemanticModel/definition/`
- Connection: PostgreSQL `127.0.0.1:5432`, database `healthcare_analytics`
- Storage mode: Import
- Authentication: local PostgreSQL credentials held outside version control

The imported tables preserve the curated SQL grains:

- `Portfolio Overview` from `analytics.v_portfolio_overview`
- `DRG Benchmark` from `analytics.v_drg_benchmark`
- `Provider DRG Review` from `analytics.v_provider_drg_review_priority`

Power Query performs source selection and typing only. Benchmark and review-priority logic remains in PostgreSQL. Identifiers such as `provider_ccn`, `drg_code`, and `provider_ruca` remain text so leading zeros are preserved.

## Model strategy

The three tables are intentionally independent. No model relationships are defined because the views have different reporting grains and relationships would risk ambiguous or many-to-many filter behavior. Each page uses its appropriate curated table. Technical columns `provider_key`, `drg_key`, and `source_sha256` are retained but hidden from report authorship.

The semantic model contains these numeric measures with model-level count, currency, and percentage formats:

- Total Discharges
- Estimated Aggregate Total Payment
- Estimated Aggregate Medicare Payment
- Provider Count
- DRG Count
- Average Total Payment
- Average Medicare Payment
- Review Priority Count
- High Priority Count
- Moderate Priority Count
- Routine Review Count
- High Priority Share
- Selected DRG Median Total Payment
- Payment Difference from DRG Median
- Payment Difference Percent

## Report pages

1. **Executive Overview** — four KPI cards, top-10 DRGs by estimated aggregate payment, top-10 DRGs by discharge volume, and a scope note.
2. **Service Category Analysis** — searchable DRG code and description slicers, top-15 volume and payment charts, and a sortable DRG benchmark table.
3. **Payment Benchmarking** — single-select DRG code plus description, state, and RUCA slicers; context cards; a provider payment comparison against the selected same-DRG median; and a detailed benchmark table.
4. **Review Priorities** — priority, state, DRG code, and description slicers; four priority KPI cards; and the transparent provider/DRG screening table.

Default same-table interactions provide page filtering. The lack of cross-table relationships prevents unrelated executive visuals from changing provider-level cards. Payment comparison is constrained to a selected DRG, and the priority measures preserve slicer context.

The report uses the checked-in healthcare finance theme, a 1920 × 1080 canvas, restrained color, actual card visuals, horizontal ranking charts, compact tables, and human-readable titles. Estimated aggregate payment is explicitly described as a materiality estimate—not revenue, cost, margin, or profit.

## Desktop validation checklist

After data refresh, compare the report with the read-only queries in [`validation.sql`](validation.sql):

- `Portfolio Overview`: 1 row
- `DRG Benchmark`: 540 rows
- `Provider DRG Review`: 145,879 rows
- Provider Count: 2,906
- DRG Count: 540
- Total Discharges: 4,952,481
- Estimated Aggregate Total Payment: $90,927,479,915.25
- Estimated Aggregate Medicare Payment: $75,111,479,728.47
- High / Moderate / Routine: 5,142 / 20,560 / 120,177
- Review Priority Count: 145,879
- High Priority Share: approximately 3.52%

Then select DRG `871` and confirm 577,119 discharges, 2,661 providers, approximately $10.521 billion estimated aggregate total payment, and a $16,181.67 provider median. Filtering that DRG to California should show 261 providers, 71,060 discharges, and $1,635,779,544.36 estimated aggregate total payment. Verify the DRG, state, RUCA, and priority slicers update only the intended same-page visuals.

Local `.pbi/` cache and editor-state directories are ignored. The PBIP entry file, `.Report/`, and `.SemanticModel/` definitions remain reproducible source. Run `node validate_pbip_project.mjs` for repository-local structural checks; `build_pbip_report.mjs` deterministically regenerates the PBIR page definitions.

## Limitations

Final status remains pending until Power BI Desktop renders all four pages, refreshes the imported data, and confirms the metrics and interactions above. Payment differences are screening signals and may reflect legitimate geographic or institutional adjustments. Review priority does not establish profitability, internal cost, operational efficiency, inappropriate reimbursement, causation, staffing requirements, patient outcomes, or service expansion or closure decisions.
