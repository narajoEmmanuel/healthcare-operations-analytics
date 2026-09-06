# Data Provenance

## Dataset

**CMS Medicare Inpatient Hospitals, by Provider and Service**

- Reporting year: 2024
- Source: Centers for Medicare & Medicaid Services
- Official dataset: [Medicare Inpatient Hospitals, by Provider and Service](https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service)
- Acquisition method: [CMS Data API](https://data.cms.gov/data-api/v1/dataset/690ddc6c-2767-4618-b277-420ffb2bf27c/data)
- Local raw file: `data/raw/medicare_inpatient_2024.json`
- Rows validated: 145,879
- Columns validated: 15

The raw file is intentionally excluded from Git. It can be reproduced using the documented API acquisition workflow in `python/01_data_understanding.ipynb`.
