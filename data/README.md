# Data Governance and Provenance

No project dataset has been acquired into this repository yet. This directory documents how future acquisitions will be governed.

## Directory policy

- `raw/` will contain source files exactly as acquired. Raw files must never be edited in place.
- `processed/` will contain reproducible derived outputs only.
- Large raw and processed files are ignored by default. A small public source file may be versioned only after source terms, provenance, dimensions, size, and checksum are documented and the value of versioning it is clear.
- Credentials, tokens, protected data, and environment files must never be committed.

## Required manifest fields

Each acquired dataset version must record:

| Field | Requirement |
| --- | --- |
| Dataset | Official published title and reporting year/release |
| Official source | Publishing organization |
| Source URL | Direct landing or download URL |
| Access date | ISO date when acquired |
| Raw filename | Exact stored filename |
| File size | Measured bytes after acquisition |
| Row count | Measured data rows with counting method documented |
| Column count | Measured columns after schema inspection |
| SHA-256 checksum | Checksum of the unmodified raw file |
| Licensing/access notes | Public-use status, source terms, and relevant notices |

Blank or unknown values must be marked pending—not estimated. The manifest will be created when acquisition begins.

## Acquisition validation

For every raw file, verify successful download, preserve the original bytes and filename where practical, calculate SHA-256, inspect encoding and delimiter, record dimensions, compare columns with official documentation, and test whether identifiers such as CCNs retain leading zeros. Transformations must read raw files and write new processed artifacts.

The MIT License for repository code and original documentation does not override CMS or other publishers' dataset terms.
