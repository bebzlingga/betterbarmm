"""The region's rows from DepEd's Project Bukas school files.

DepEd publishes school-level data for the whole country as zipped CSVs at
https://www.deped.gov.ph/machine-ready-files/ (enrolment SY 2017-18 to
2025-26; facilities, personnel and more for SY 2023-24). This keeps the
BARMM schools outside Sulu, which has left the region, and writes them as
UTF-8 beside this folder, in datasets/education/deped/. Rows and columns
are copied as published: the only changes are which rows are kept and the
text encoding (the 2025-26 file is Windows-1252, not UTF-8).

Usage, from the repo root, with the zips unpacked into one folder:
    python3 -I datasets/education/scripts/deped_subset.py <unpacked folder>
"""

import csv
import glob
import os
import sys

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'deped')


def read(path):
    raw = open(path, 'rb').read()
    try:
        text = raw.decode('utf-8-sig')
    except UnicodeDecodeError:
        text = raw.decode('cp1252')
    return list(csv.DictReader(text.splitlines()))


def write(name, rows, fields):
    with open(os.path.join(OUT, name), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f'{name}: {len(rows):,} schools')


def main(src):
    os.makedirs(OUT, exist_ok=True)
    keep_2023 = set()
    for path in sorted(glob.glob(os.path.join(src, '*', 'enrollment_*.csv'))):
        rows = read(path)
        region = [r for r in rows if r['region'] == 'BARMM' and r['division'] != 'Sulu']
        assert region, f'no BARMM rows in {path}'
        if path.endswith('2023-24.csv'):
            keep_2023 = {r['school_id'] for r in region}
        write(os.path.basename(path), region, list(rows[0].keys()))
    # Facilities and personnel carry no region of their own: they join the year's enrolment by school ID.
    for path in sorted(glob.glob(os.path.join(src, '*', '*_2023-24.csv'))):
        if 'enrollment' in path:
            continue
        rows = read(path)
        write(os.path.basename(path), [r for r in rows if r['school_id'] in keep_2023], list(rows[0].keys()))


if __name__ == '__main__':
    main(sys.argv[1])
