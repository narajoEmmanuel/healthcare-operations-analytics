# Medicare Inpatient Service & Payment Analytics

An independent analysis of inpatient service-line performance and Medicare payment variation using public CMS data.

**Status:** The business decision, analytical objectives, and scope are defined. The primary data source and record-level access are verified; data acquisition, analysis, and dashboard development have not started.

## Data source

The primary source is CMS's *Medicare Inpatient Hospitals — by Provider and Service*, provisionally covering 2019–2024. Dataset grain, variables, payment context, access verification, and analytical limitations are documented in [`research/domain_and_data.md`](research/domain_and_data.md).

**Data provenance:** Official CMS Data → Medicare Inpatient Hospitals → Provider and Service → Public Data API. See the documented [discovery path](research/domain_and_data.md#data-source-discovery-path).

## Planned stack

PostgreSQL, SQL, Python, pandas, Power Query, Power BI, DAX, Git, and GitHub.

## Repository navigation

- [`research/business_case.md`](research/business_case.md): business decision, stakeholders, analytical objectives, scope, and decision boundaries
- [`research/domain_and_data.md`](research/domain_and_data.md): CMS inpatient data, MS-DRG and IPPS context, payment variables, and limitations
- [`research/data_dictionary.md`](research/data_dictionary.md): narrative definitions and analytical treatment of the source variables
- [`python/data_dictionary_analysis.ipynb`](python/data_dictionary_analysis.ipynb): interactively prints every variable name returned by the CMS API and then the complete first row
- [`data/README.md`](data/README.md): acquisition provenance and raw-data controls
- `sql/`, `python/`, `powerbi/`, `assets/`, and `report/`: implementation artifacts when work begins

Source datasets retain their original publisher terms and are not relicensed by this repository.
