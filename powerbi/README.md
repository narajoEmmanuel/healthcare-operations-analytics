# Power BI report

The local report is implemented as a Power BI Project (PBIP) with enhanced PBIR page definitions and a TMDL semantic model. Power BI Desktop rendered the four report pages and exported the PDF at [`../report/Medicare_Inpatient_Service_Payment_Analytics.pdf`](../report/Medicare_Inpatient_Service_Payment_Analytics.pdf). README screenshots in [`../assets/powerbi/`](../assets/powerbi/) are lossless PNG rasters of that Power BI Desktop PDF export. No Power BI Service publication and no Azure cloud deployment are claimed.

Open [`Medicare_Inpatient_Service_Payment_Analytics.pbip`](Medicare_Inpatient_Service_Payment_Analytics.pbip) in Power BI Desktop against the local PostgreSQL database.

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
3. **Payment Benchmarking** — single-select DRG code plus description, state, and RUCA slicers; context cards for median, average, providers, discharges, and estimated aggregate payment; a provider payment comparison against the selected same-DRG median; and a detailed benchmark table.
4. **Review Priorities** — priority, state, DRG code, and description slicers; four priority KPI cards; and the transparent provider/DRG screening table.

Default same-table interactions provide page filtering. The lack of cross-table relationships prevents unrelated executive visuals from changing provider-level cards. Payment comparison is constrained to a selected DRG, and the priority measures preserve slicer context.

The report uses the checked-in healthcare finance theme, a 1920 × 1080 canvas, restrained color, actual card visuals, horizontal ranking charts, compact tables, and human-readable titles. The model and source-query cultures are `en-US`; cards, chart labels, percentages, currencies, and table projections use numeric format metadata so values retain numeric behavior while rendering with English separators and `M`/`B` abbreviations. Visual-level display names replace source `snake_case` in tables, and auto-generated field-list subtitles are disabled. Estimated aggregate payment is explicitly described as a materiality estimate—not revenue, cost, margin, or profit.

## Desktop rendering and SQL comparison targets

Power BI Desktop rendered all four pages and produced the checked-in PDF. Interactive slicer walkthroughs in Desktop are not separately recorded here.

Report-level `settings.locale` is `en-US` and `defaultDisplayUnitsToNone` is enabled in `definition/report.json`. Card and chart custom numeric formats retain explicit M/B/K suffixes.

After a local data refresh, compare the report with the read-only queries in [`validation.sql`](validation.sql):

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

SQL comparison targets for DRG `871`: 577,119 discharges, 2,661 providers, approximately $10.521 billion estimated aggregate total payment, and a $16,181.67 provider median. The California subset of that DRG is 261 providers, 71,060 discharges, and $1,635,779,544.36 estimated aggregate total payment.

Local `.pbi/` cache and editor-state directories are ignored. The PBIP entry file, `.Report/`, and `.SemanticModel/` definitions remain reproducible source. Run `node validate_pbip_project.mjs` for repository-local structural checks; `build_pbip_report.mjs` regenerates the PBIR page definitions from the build specification.

## Limitations

Payment differences are screening signals and may reflect legitimate geographic or institutional adjustments. Review priority does not establish profitability, internal cost, operational efficiency, inappropriate reimbursement, causation, staffing requirements, patient outcomes, or service expansion or closure decisions.
