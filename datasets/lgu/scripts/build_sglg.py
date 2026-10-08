#!/usr/bin/env python3
"""Write datasets/lgu/sglg.json — which BARMM provinces, cities and
municipalities DILG conferred the Seal of Good Local Governance (SGLG),
2020 to now, with the incentive fund each level was entitled to; and,
labelled separately, the Bangsamoro Government's own leadership award, the
MILG's Salamat Excellence Award for Leadership (SEAL).

The DILG lists are signed scans with no text layer, so they were read by
OCR (tesseract) and every BARMM name checked against the page image. The
transcription below is that reading, page cited. A check pins each year
to the count DILG's own summary page states for BARMM; if the transcription
drifts from it, the script refuses to write.

    2022  dilg-reports-resources-20221212_edc9f21a30.pdf — p. 3 province, p. 4 city, p. 10 towns; summary p. 2: BARMM 1 / 1 / 12
    2023  dilg-reports-resources-2023122_da533a136c.pdf  — p. 3 province, p. 4 city, p. 11 towns; summary p. 2: BARMM 1 / 1 / 26
    2024  dilg-reports-resources-20241114_3a530a4e56.pdf — p. 3 province, p. 5 city, p. 18 towns; summary p. 2: BARMM 1 / 1 / 27

(all under https://www.dilg.gov.ph/PDF_File/reports_resources/, listed at
https://www.dilg.gov.ph/reports-and-resources/seal-of-good-local-governance/12/)

    python3 datasets/lgu/scripts/build_sglg.py
"""
import datetime, json
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/sglg.json'
DILG = 'https://www.dilg.gov.ph/PDF_File/reports_resources'
FORMER = {'maguindanao': 'maguindanao'}
# DILG's spelling → the directory's, where norm() alone does not meet.
ALIASES = {'datu blah sinsuat': 'datu blah t sinsuat'}

# Per-level SGLG Incentive Fund as announced for the year's awardees. An
# entitlement, not a record of release to any one LGU.
INCENTIVE_SOURCES = {
    2022: ('https://www.dilg.gov.ph/regional-news/DILG-Caraga-awards-incentive-funds-to-SGLG-passers-in-the-region/NR-2022-1184',
           'DILG Caraga, 30 December 2022: P9.5 million provinces, P7 million cities, P5 million municipalities'),
    2023: ('https://car.dilg.gov.ph/23-cordi-lgus-get-p44-1-m-grant-urged-to-use-incentive-fund-for-high-impact-projects/',
           'DILG CAR, 22 January 2024: PHP 4 million provinces, PHP 2.3 million cities, PHP 1.8 million municipalities'),
    2024: ('https://newsinfo.inquirer.net/2014344/more-lgus-bag-this-years-dilg-seal-of-good-local-governance-award',
           'Philippine Daily Inquirer, citing DILG: P3 million provinces, P2 million cities, P1,153,000 municipalities; '
           'P980,281,000 in all (41 × 3M + 96 × 2M + 577 × 1.153M reproduces it)'),
}

# year → (pdf, BARMM counts DILG's summary states (province, city, municipality), incentive, rows)
# rows: (level, province as DILG prints it, name as DILG prints it)
LISTS = {
    2022: ('dilg-reports-resources-20221212_edc9f21a30.pdf', (1, 1, 12), (9_500_000, 7_000_000, 5_000_000), [
        ('province', None, 'Maguindanao'),
        ('city', 'Basilan', 'Lamitan City'),
        *[('municipality', p, n) for p, n in [
            ('Basilan', 'Sumisip'),
            ('Lanao del Sur', 'Buadiposo Buntong'), ('Lanao del Sur', 'Taraka'),
            ('Maguindanao', 'Barira'), ('Maguindanao', 'Kabuntalan'), ('Maguindanao', 'Paglat'),
            ('Maguindanao', 'Parang'), ('Maguindanao', 'South Upi'), ('Maguindanao', 'Sultan Kudarat'),
            ('Maguindanao', 'Sultan Mastura'), ('Maguindanao', 'Talayan'), ('Maguindanao', 'Upi'),
        ]],
    ]),
    2023: ('dilg-reports-resources-2023122_da533a136c.pdf', (1, 1, 26), (4_000_000, 2_300_000, 1_800_000), [
        ('province', None, 'Maguindanao'),
        ('city', 'Basilan', 'Lamitan City'),
        *[('municipality', p, n) for p, n in [
            ('Basilan', 'Maluso'), ('Basilan', 'Sumisip'),
            ('Lanao del Sur', 'Calanogas'), ('Lanao del Sur', 'Piagapo'), ('Lanao del Sur', 'Taraka'),
            ('Maguindanao', 'Ampatuan'), ('Maguindanao', 'Barira'), ('Maguindanao', 'Buldon'),
            ('Maguindanao', 'Datu Abdullah Sangki'), ('Maguindanao', 'Datu Hoffer Ampatuan'),
            ('Maguindanao', 'Datu Paglas'), ('Maguindanao', 'Datu Piang'), ('Maguindanao', 'Guindulungan'),
            ('Maguindanao', 'Kabuntalan'), ('Maguindanao', 'Matanog'), ('Maguindanao', 'Pagalungan'),
            ('Maguindanao', 'Paglat'), ('Maguindanao', 'Parang'), ('Maguindanao', 'Shariff Aguak'),
            ('Maguindanao', 'South Upi'), ('Maguindanao', 'Sultan Kudarat'), ('Maguindanao', 'Sultan Mastura'),
            ('Maguindanao', 'Sultan Sa Barongis'), ('Maguindanao', 'Talayan'), ('Maguindanao', 'Upi'),
            ('Sulu', 'Talipao'),
        ]],
    ]),
    2024: ('dilg-reports-resources-20241114_3a530a4e56.pdf', (1, 1, 27), (3_000_000, 2_000_000, 1_153_000), [
        ('province', None, 'Maguindanao del Sur'),
        ('city', 'Basilan', 'Lamitan City'),
        *[('municipality', p, n) for p, n in [
            ('Basilan', 'Maluso'), ('Basilan', 'Sumisip'),
            ('Lanao del Sur', 'Butig'), ('Lanao del Sur', 'Calanogas'), ('Lanao del Sur', 'Kapatagan'),
            ('Lanao del Sur', 'Taraka'),
            ('Maguindanao del Norte', 'Barira'), ('Maguindanao del Norte', 'Buldon'),
            ('Maguindanao del Norte', 'Datu Blah Sinsuat'), ('Maguindanao del Norte', 'Kabuntalan'),
            ('Maguindanao del Norte', 'Matanog'), ('Maguindanao del Norte', 'Parang'),
            ('Maguindanao del Norte', 'Sultan Kudarat'), ('Maguindanao del Norte', 'Upi'),
            ('Maguindanao del Sur', 'Ampatuan'), ('Maguindanao del Sur', 'Datu Abdullah Sangki'),
            ('Maguindanao del Sur', 'Datu Hoffer Ampatuan'), ('Maguindanao del Sur', 'Datu Paglas'),
            ('Maguindanao del Sur', 'Datu Piang'), ('Maguindanao del Sur', 'Datu Saudi Ampatuan'),
            ('Maguindanao del Sur', 'Gen. S.K. Pendatun'), ('Maguindanao del Sur', 'Guindulungan'),
            ('Maguindanao del Sur', 'Paglat'), ('Maguindanao del Sur', 'Shariff Aguak'),
            ('Maguindanao del Sur', 'South Upi'), ('Maguindanao del Sur', 'Sultan sa Barongis'),
            ('Maguindanao del Sur', 'Talayan'),
        ]],
    ]),
}

STATUS = {
    2020: 'No awards: the 2020 assessment was suspended for the COVID-19 pandemic; DILG posts no 2020 awardee list.',
    2021: 'No awards: no SGLG was conferred for 2021 (reported as a pilot field test year under the SGLG Act, RA 11292); DILG posts no 2021 awardee list.',
    2025: 'Deferred: DILG Memorandum Circular 2025-032 deferred the CY 2025 assessment while the SGLG is recalibrated.',
    2026: 'No awardee list published as of the build date.',
}

# MILG's own award. Conferred on a person, for the LGU they lead; keyed by
# the year of the Pagkilala ceremony that conferred it.
BIO = 'https://bangsamoro.gov.ph/news/latest-news'
SEAL = {
    2022: (f'{BIO}/seal-awardees-each-get-p2-5-m-incentive-18k-gold-medallion-from-milg/', False, 2_500_000, [
        ('basilan/maluso', 'Hanie Bud', 'Mayor'),
        ('lanao-del-sur/piagapo', 'Ali Sumandar', 'Mayor'),
        ('maguindanao-del-sur/paglat', 'Abdulkarim Langkuno', 'Mayor'),
        ('maguindanao-del-norte/sultan-kudarat', 'Datu Shameem Mastura', 'Mayor'),
        ('maguindanao-del-sur/guindulungan', 'Mibpantao Midtimbang Jr.', 'Mayor'),
        ('maguindanao-del-norte/upi', 'Ramon Piang Sr.', 'Mayor'),
    ]),
    2023: (f'{BIO}/pagkilala-barmm-govt-honors-153-lgus-officers-with-exemplary-performances/', False, 2_500_000, [
        ('maguindanao-del-sur/south-upi', 'Reynalbert Insular', 'Mayor'),
    ]),
    2024: (f'{BIO}/4th-pagkilala-4-bangsamoro-lces-bag-seal-award-for-efficient-public-service/', False, 2_500_000, [
        ('lanao-del-sur/taraka', 'Nashiba Gandamra-Sumagayan', 'Former mayor'),
        ('maguindanao-del-norte/datu-blah-t-sinsuat', 'Marshall Sinsuat', 'Mayor'),
        ('maguindanao-del-norte/kabuntalan', 'Salaban Diocolano', 'Mayor'),
        ('maguindanao-del-norte/upi', 'Irene Galanto', 'Former punong barangay, Borongotan'),
    ]),
    # Only a Lanao del Sur report survives: "among those honored". Others may have been conferred.
    2025: ('https://www.themindanaotoday.com/milg-recognizes-lanao-del-sur-lgus-for-governance-excellence/', True, 2_000_000, [
        ('lanao-del-sur/butig', 'Dimnatang LB Pansar', 'Mayor'),
        ('lanao-del-sur/pagayawan', 'Khalida D. Polao-Sanguila', 'Mayor'),
    ]),
    2026: (f'{BIO}/barmms-pagkilala-awards-honor-top-performing-lgus-for-innovation-leadership/', False, 5_000_000, [
        ('basilan', 'Hadjiman S. Hataman-Salliman', 'Vice governor'),
    ]),
}


def key_of(name):
    k = norm(name)
    return ALIASES.get(k, k)


slug_province = {v: k for k, v in provinces.items()}
units, former, unmatched = {}, {}, []
for year, (pdf, counts, amounts, rows) in LISTS.items():
    href = f'{DILG}/{pdf}'
    levels = ('province', 'city', 'municipality')
    got = tuple(sum(1 for r in rows if r[0] == lvl) for lvl in levels)
    assert got == counts, f'{year}: transcribed {got}, DILG summary states {counts} for BARMM'
    for level, prov, name in rows:
        target = units
        if prov and key_of(prov) == 'sulu':
            continue
        if level == 'province':
            key = provinces.get(key_of(name))
            if key is None and key_of(name) in FORMER:
                key, target = FORMER[key_of(name)], former
        else:
            key = towns.get(key_of(name))
            # A current province name must agree with the directory; pre-split "Maguindanao" can be either successor.
            if key and key_of(prov) in provinces:
                assert key.split('/')[0] == provinces[key_of(prov)], f'{year} {name}: DILG says {prov}, directory {key}'
        if key is None:
            unmatched.append(f'{year} {level} {prov} / {name}')
            continue
        assert str(year) not in target.get(key, {}), f'{year} {key} listed twice'
        target.setdefault(key, {})[str(year)] = {
            'passed': True,
            'award': f'Seal of Good Local Governance {year}',
            'incentive': amounts[levels.index(level)],
            'href': href,
        }

expected = set(provinces.values()) | set(towns.values())
for year, (_, _, _, rows) in SEAL.items():
    for slug, _, _ in rows:
        assert slug in expected, f'SEAL {year}: {slug} not in the directory'

data = {
    'name': 'Seal of Good Local Governance — BARMM passers',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [
        *[{'label': f'DILG — {y} List of Seal of Good Local Governance Awardees', 'href': f'{DILG}/{LISTS[y][0]}', 'year': y}
          for y in LISTS],
        *[{'label': f'SGLG Incentive Fund {y} — {text}', 'href': href, 'year': y}
          for y, (href, text) in INCENTIVE_SOURCES.items()],
        {'label': 'DILG — Seal of Good Local Governance reports and resources (no 2020 or 2021 list is posted)',
         'href': 'https://www.dilg.gov.ph/reports-and-resources/seal-of-good-local-governance/12/'},
    ],
    'note': (
        'Which BARMM provinces, cities and municipalities DILG conferred the Seal of Good Local Governance, by '
        'assessment year, transcribed from DILG’s signed awardee lists (scans, read by OCR and checked against the '
        'page and against the BARMM count on each list’s summary page). This is a passer list only: DILG does not '
        'publish who was assessed, so an LGU missing from a year either did not pass or was not assessed — the data '
        'cannot tell which, and it is never a recorded failure. "incentive" is the SGLG Incentive Fund amount DILG '
        'announced for that level that year (an entitlement, not a confirmed release to that LGU; sources in "source"). '
        'There are no awards for 2020 (assessment suspended for COVID-19), 2021 (no awards conferred) or '
        '2025 (assessment deferred while DILG recalibrated the SGLG); none for 2026 is published yet — see "status". '
        'The 2022 and 2023 lists name the province "Maguindanao"; it is under "former" because neither successor '
        'province can claim it (the 2023 list post-dates the September 2022 split and does not say which). Towns '
        'listed under "Maguindanao" sit under the province they are in now. Sulu (Talipao passed in 2023) is left '
        'out, as in every other dataset here. Barangay seals (SGLGB) are not here. "bangsamoroSeal" is a different '
        'award, by a different body: see its own note.'
    ),
    'years': sorted(LISTS),
    'status': {str(y): s for y, s in sorted(STATUS.items())},
    'units': dict(sorted(units.items())),
    'former': former,
    'bangsamoroSeal': {
        'name': 'Salamat Excellence Award for Leadership (SEAL) — Ministry of the Interior and Local Government, BARMM',
        'note': (
            'Not the DILG seal. The SEAL is the Bangsamoro Government’s own highest award for local leaders, '
            'conferred by MILG at its annual Pagkilala ceremony on a person — usually a mayor — for the LGU they lead, '
            'and made a regional law in 2025. Keyed by the year of the ceremony (held each January, so it recognises '
            'the year before). "incentive" is the cash award per awardee the source states for that edition, '
            'besides a gold medallion. 2025 is partial: the only surviving report covers Lanao del Sur and says the '
            'two named were "among those honored". MILG publishes no list of LGUs it assessed. Pagkilala also '
            'confers MILG’s functionality appraisals (LoGFA, ADAC, POC and others); those are not here.'
        ),
        'years': {
            str(y): {'href': href, 'partial': partial,
                     'awardees': [{'unit': u, 'awardee': who, 'office': office, 'incentive': amount} for u, who, office in rows]}
            for y, (href, partial, amount, rows) in SEAL.items()
        },
    },
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units + {len(former)} former, years {sorted(LISTS)}')
for y in LISTS:
    print(y, sum(str(y) in v for v in units.values()) + sum(str(y) in v for v in former.values()), 'passers')
print('unmatched:', unmatched or 'none')
