#!/usr/bin/env python3
"""Write datasets/lgu/nta.json — the National Tax Allotment (NTA, formerly the
IRA) each BARMM province, city and municipality received, year by year.

The figures are NOT from DBM, and the reason is worth knowing. DBM sets every
LGU's share, but what it publishes is only the total by region and by level:
Annex A of the Local Budget Memoranda (LBM 90-A for FY 2025, LBM 92B for
FY 2026, LBM 94 for the indicative FY 2027) has one BARMM row split into
provinces, cities, municipalities and barangays, and nothing below it. Each
LGU is told its own share by letter. The GAA's Allocations to LGUs does not
itemise the NTA either.

What does carry a per-LGU figure is the Bureau of Local Government Finance's
Statement of Receipts and Expenditures (SRE) by LGU — what each local
treasurer reported receiving, line "External Sources › National Tax
Allotment". It is the LGU's own share only; barangay NTA goes to the
barangays and is not in any SRE row, so there is no barangay total here.

It agrees with DBM where the two can be compared: for FY 2025 the five
provinces and three cities sum to DBM's BARMM provincial and city totals in
LBM 90-A to the peso. Municipalities fall short of DBM's total by what the
SRE is missing — the eight Special Geographic Area towns (created 2024, no
SRE rows yet) and towns that filed nothing.

A zero in the SRE is a town that did not report, not one that received
nothing — the NTA is never zero — so zeros are dropped, not written. FY 2025
is BLGF's "Preliminary" release and a few rows are plainly part-year.

Sources (blgf.gov.ph/lgu-fiscal-data/ — behind a WAF; sre.py has the curl
line that gets through):

    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2023.xlsx
    https://blgf.gov.ph/wp-content/uploads/2026/01/By-LGU-SRE-2024.xlsx
    https://blgf.gov.ph/wp-content/uploads/2026/05/By-LGU-SRE-2025.xlsx

    python3 datasets/lgu/scripts/build_nta.py [dir holding the .xlsx files]

The directory defaults to $TMPDIR/blgf-sre. The workbooks are not committed.
"""
import json, sys
from sre import ROOT, SRC, first_sheet, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/nta.json'

FILES = {
    2023: ('2024/09', 'FY 2023 (Final)'),
    2024: ('2026/01', 'FY 2024 (Final)'),
    2025: ('2026/05', 'FY 2025 (Preliminary)'),
}
NTA_COLUMN = 17  # "EXTERNAL SOURCES › National Tax Allotment", same in all three

units, unmatched, dropped = {}, [], []
for year, (folder, label) in FILES.items():
    path = SRC / f'By-LGU-SRE-{year}.xlsx'
    if not path.exists():
        sys.exit(f'missing {path} — download https://blgf.gov.ph/wp-content/uploads/{folder}/{path.name}')
    rows = list(first_sheet(path))
    header = [r[NTA_COLUMN] if len(r) > NTA_COLUMN else None for r in rows[6:9]]
    assert 'National Tax Allotment' in header, f'{path.name}: column {NTA_COLUMN} is {header}'
    for r in rows:
        if len(r) <= NTA_COLUMN or r[1] != 'BARMM' or r[2] == 'Sulu':
            continue
        _, _, province, name, kind = r[:5]
        amount = r[NTA_COLUMN]
        if kind == 'Province':
            key, level = provinces.get(norm(name)), 'province'
        else:
            key, level = towns.get(norm(name)), 'lgu'
        if key is None:
            unmatched.append(f'{year} {province} / {name} ({kind})')
            continue
        if not amount:
            dropped.append(f'{year} {key}')
            continue
        units.setdefault(key, {}).setdefault(level, {})[str(year)] = round(amount, 2)

years = sorted(FILES)
blgf = 'https://blgf.gov.ph/wp-content/uploads'
data = {
    'name': 'National Tax Allotment of BARMM local governments',
    'generatedAt': __import__('datetime').date.today().isoformat(),
    'source': [
        {'label': f'BLGF — Statement of Receipts and Expenditures by LGU, {FILES[y][1]}',
         'href': f'{blgf}/{FILES[y][0]}/By-LGU-SRE-{y}.xlsx', 'fiscalYear': y}
        for y in years
    ] + [
        {'label': 'DBM — Local Budget Memorandum No. 90-A, Final FY 2025 NTA Shares of LGUs (Annex A, by region only)',
         'href': 'https://www.dbm.gov.ph/wp-content/uploads/Issuances/2024/Local-Budget-Memorandum/LOCAL-BUDGET-MEMORANDUM-NO.-90A.pdf',
         'fiscalYear': 2025},
    ],
    'note': (
        'The NTA each LGU reported receiving, in pesos, from the Bureau of Local Government Finance’s '
        'Statement of Receipts and Expenditures (line “National Tax Allotment”) — a DOF figure, not a DBM one. '
        'DBM sets each share but publishes only BARMM-wide totals by level; BLGF is the only published per-LGU source. '
        'It is the LGU’s own share: barangay NTA is paid to the barangays and is not included, so there is no barangay figure. '
        'Cross-check: for FY 2025 the five provinces and three cities here sum to DBM’s BARMM provincial and city totals in '
        'LBM 90-A to the peso. FY 2025 is BLGF’s preliminary release; a few towns reported part-year receipts '
        '(Datu Hoffer Ampatuan’s FY 2025 is about a fifth of its FY 2024). A town that reported zero did not file — '
        'that year is left out, not written as 0. The eight Special Geographic Area towns, created in 2024, have no SRE rows yet. '
        'No per-LGU figure for FY 2026 is published by anyone yet.'
    ),
    'years': years,
    'units': dict(sorted(units.items())),
}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent='\t') + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units, {years}')
print('unmatched SRE rows:', unmatched or 'none')
print('reported zero (left out):', dropped or 'none')
print('directory units with no figure:', sorted(expected - set(units)) or 'none')
