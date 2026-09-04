# Hiring Market Research

**Research date:** September 4, 2026
**Scope:** Directional requirements research for early-career analytics portfolio design

## Target job families

The project targets data, business intelligence, healthcare/clinical data, operations, business analysis, data integration, and HealthTech analyst roles. Job titles vary, so the research focuses on recurring work rather than title alone.

## Method and evidence boundary

Prior research supplied by the project owner identified recurring requirements across a broader sample. During repository initialization, a current sample of official employer career pages was re-checked. The live sample supports the central themes below but is not a statistical labor-market study, does not establish prevalence percentages, and should be refreshed before publication of the final portfolio.

## Recurring requirements

Current official Optum/UnitedHealth Group and CVS Health postings connect analyst work with SQL, structured or relational data, Power BI or comparable visualization, dashboards, semantic/data models, data validation or quality, requirements gathering, KPI/metric reporting, stakeholder engagement, and clear recommendations. Different roles emphasize different subsets and experience levels.

## Priority matrix

| Priority | Capabilities | Project response |
| --- | --- | --- |
| Critical | SQL; relational databases; Power BI; Power Query; DAX; modeling; transformation; validation; data quality; KPI and dashboard development; business analysis; requirements translation; stakeholder communication | Make these visible in the core architecture, documentation, and evidence log. |
| Strong support | Python; pandas; Git/GitHub; ETL/ELT concepts; multi-source integration; healthcare domain understanding; professional documentation | Use these to make the core workflow reproducible and credible. |
| Future work | dbt; Spark/PySpark; Databricks; Fabric; cloud platforms; Airflow; advanced orchestration; CI/CD; machine learning | Exclude from the MVP unless a later requirement creates a clear need. |

## Required skills and architectural implications

- **SQL and relational modeling:** use PostgreSQL with explicit grain, keys, constraints, and documented relationships.
- **Transformation and validation:** separate raw, staging, and analytical concerns; implement inspectable quality controls.
- **Power BI, Power Query, and DAX:** build an intentional semantic model and governed measures after requirements are approved.
- **KPI and dashboard development:** trace each visual and measure to a business question and definition.
- **Business analysis:** document stakeholders, decisions, acceptance criteria, and limitations before implementation.
- **Communication:** provide recruiter-level summaries alongside analyst-level technical artifacts.

## Optional skills

The broader research found modern cloud and engineering tools in some postings, especially more senior roles. They are not required to prove the core capability sought here and could obscure the portfolio's main signal. Machine learning is likewise excluded unless a real business question later requires prediction.

## Sources

Full access metadata and URLs are maintained in [`references.md`](references.md). The current re-verification sample includes official career pages from Optum/UnitedHealth Group and CVS Health. Individual postings are time-sensitive and may be removed after positions close.
