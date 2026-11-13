# DepEd school data, Bangsamoro

The region's schools from the Department of Education's **Project Bukas** files: every BARMM school outside Sulu, which has left the region, school by school.

- **Source:** Department of Education (DepEd), Project Bukas, machine-ready files: <https://www.deped.gov.ph/machine-ready-files/>
- **Downloaded:** 13 November 2026
- **Licence:** DepEd's Terms of Use and Fair Use Policy, accepted at download. You may share and adapt the files with credit to DepEd; work built on them is shared under the same terms; the content is not to be edited beyond editorial changes; and nothing may suggest that DepEd made, backs or is associated with this site. DepEd's name and logo are not used. Questions to DepEd: projectbukas.feedback@deped.gov.ph.

## Files

| File | What it holds | Schools |
|---|---|---|
| `enrollment_2023-24.csv` | Learners by grade, sex and senior high strand, SY 2023–24 | 2,463 |
| `enrollment_2024-25.csv` | The same, SY 2024–25 | 2,473 |
| `enrollment_2025-26.csv` | The same, SY 2025–26, the latest | 2,483 |
| `facilities_2023-24.csv` | Classrooms, buildings and their condition, temporary spaces, grounds, SY 2023–24 | 2,463 |
| `personnel_2023-24.csv` | Teachers and staff by position, SY 2023–24 | 2,463 |

Each file keeps DepEd's columns and values as published. Column meanings are in DepEd's technical notes and the README in each zip.

## What was changed

Only editorial changes:

- **Rows kept:** the schools DepEd files under BARMM, without the Sulu division.
- **Facilities and personnel:** these files carry no region, so they are joined to the SY 2023–24 enrolment by school ID.
- **Text encoding:** the 2025–26 file is published in Windows-1252 and is saved here as UTF-8.

Rebuild with `scripts/deped_subset.py` from the unpacked zips.

## Totals, without Sulu

| School year | Schools | Learners | Public | Private | State and local colleges |
|---|---|---|---|---|---|
| 2023–24 | 2,463 | 899,130 | 769,022 | 106,995 | 23,113 |
| 2024–25 | 2,473 | 922,116 | 775,513 | 125,093 | 21,510 |
| 2025–26 | 2,483 | 934,373 | 771,375 | 141,450 | 21,548 |

These count formal schooling only. Alternative Learning System learners, government madaris taught outside the public schools, and community learning centres are not in these files, which is why MBHTE's own totals run higher (see `../mbhte-figures.json`).
