# Project Charter

## Purpose

Build a focused healthcare operations analytics portfolio project that converts public CMS data into defensible business analysis. The work should demonstrate how a question moves from stakeholder requirements through governed data preparation, relational modeling, validation, SQL analysis, KPI definition, and a clear Power BI product.

## Employability objective

The project is designed to strengthen Emmanuel Naranjo Blanco's candidacy for entry-level and early-career analytical roles. It prioritizes credible evidence of SQL, PostgreSQL, Power BI, Power Query, DAX, data modeling, data quality, KPI development, and business communication over technical novelty.

## Target roles

- Data Analyst
- Business Intelligence Analyst
- Healthcare or Clinical Data Analyst
- Operations Analyst
- Business Analyst with analytics responsibilities
- Data Integration Analyst
- HealthTech Analyst

## Skills being strengthened

Primary development areas are SQL, PostgreSQL, relational modeling, Power Query, Power BI, DAX, multi-source integration, validation, KPI design, dashboard development, and stakeholder-oriented analytical communication. Existing Python, pandas, statistical analysis, healthcare, and project skills will support—not displace—those areas.

## Core philosophy

- Employability and interview defensibility before unnecessary complexity
- Business requirements before tools and visuals
- Reproducibility before one-off results
- Explicit grain, keys, relationships, definitions, and assumptions
- Evidence before résumé or portfolio claims
- Small, auditable scope before optional platform engineering

## Scope

- Define a healthcare operations/business problem and stakeholder needs
- Acquire documented public CMS datasets with recorded provenance
- Design and implement a PostgreSQL analytical model
- Build reproducible transformations and data-quality controls
- Develop SQL analyses and governed KPI definitions
- Build a Power BI semantic model and decision-oriented dashboard
- Communicate limitations and findings for technical and nontechnical audiences

The provisional analytical period is 2019–2024 and is subject to schema, size, and comparability validation.

## Out of scope for the MVP

- Protected health information or patient-level clinical records
- Production deployment, hospital adoption, or CMS endorsement
- Machine learning or predictive modeling without a justified analytical need
- dbt, Spark, PySpark, Databricks, Fabric, cloud infrastructure, Airflow, advanced orchestration, and CI/CD
- Clinical decision support or causal claims

## Professional standards

- Use only authorized public data and preserve source terms and provenance.
- Keep raw acquisitions unchanged; transformations produce separate artifacts.
- Never commit credentials, secrets, or protected data.
- Validate record grain, types, keys, joins, nulls, ranges, and reconciliation totals.
- Define every KPI, denominator, filter, and time basis.
- Separate verified facts, analytical interpretation, and assumptions.
- Use concise English documentation and accessible dashboard design.
- Maintain Git traceability without circular commit evidence.

## Preliminary technology stack

PostgreSQL, SQL, Python, pandas, Jupyter, Power Query, Power BI, DAX, Git, and GitHub. Exact versions will be recorded when implementation begins.

## Acceptance criteria

- Public source provenance and acquisition metadata are complete.
- A documented relational model supports the approved analytical questions.
- Transformations and quality checks are reproducible.
- SQL queries and KPI definitions are readable, tested, and business-aligned.
- The Power BI model has intentional relationships and documented measures.
- Findings are supported by inspected outputs and qualified by limitations.
- Evidence records support major milestones and eventual portfolio claims.

## Definition of Done

The project is complete only when all acceptance criteria are met and all five tests pass:

1. **Recruiter test:** A recruiter can understand the problem, tools, and findings in roughly 60 seconds.
2. **Analyst test:** A Data Analyst can inspect the repository, architecture, and SQL and understand the technical decisions.
3. **Reproducibility test:** Core outputs can be reconstructed from documented public sources.
4. **Interview test:** Emmanuel can explain each major table, query, KPI, relationship, and DAX measure.
5. **CV test:** Every quantitative or technological CV claim is supported by repository evidence.
