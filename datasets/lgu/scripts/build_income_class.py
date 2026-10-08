#!/usr/bin/env python3
"""Write datasets/lgu/income-class.json — the income class of each BARMM
province, city and municipality under the two classifications in force since
2008:

  "2024"  DOF Department Order No. 074-2024, the first general income
          reclassification under RA 11964 (the Automatic Income Classification
          of LGUs Act). Signed 5 November 2024, effective 1 January 2025
          (its Section 8). Five classes, on average annual regular income for
          FY 2021–2023 from the SRE as of 10 September 2024.
  "2008"  DOF Department Order No. 23-08, dated 29 July 2008, "effective
          immediately" (its Section 5) — six classes, on CY 2004–2007 income.
          The class lists are BLGF's own, updated 27 April 2016
          (municipalities), and 29 June 2018 (cities).

Where the numbers come from:
  - DO 074-2024 is a scan with no text layer, and tesseract mangles its tables.
    Its Annex A rows for BARMM were read off the page images (Annex pages 2,
    5, 29–32 = PDF pages 6, 9, 34–36) and are typed into ANNEX_A below. The
    Annex prints the class only — no peso figure — so no averageAnnualIncome
    is written.
  - The 2008 municipal and provincial lists have text layers and are parsed.
    The 2008 city list is a scan; its three BARMM rows (page 3) are typed into
    CITIES_2008.
  - Annex A also prints each LGU's class "Per DOF Order No. 23-08" next to
    the new one. That column is checked against the parsed 2008 lists; a
    mismatch is printed, not fixed.

Sources (blgf.gov.ph/lgu-income-class/, behind the same WAF as sre.py's —
use its curl line with Referer https://blgf.gov.ph/lgu-income-class/):

    https://blgf.gov.ph/wp-content/uploads/2025/01/DOF-DO-074.2024.pdf
    https://blgf.gov.ph/wp-content/uploads/2025/01/DOF-DO-No.23-08.pdf
    https://blgf.gov.ph/wp-content/uploads/2021/01/updated-reclass-CY-2008-4-27-16.pdf
    https://blgf.gov.ph/wp-content/uploads/2021/01/updated-reclassification-Province.pdf
    https://blgf.gov.ph/wp-content/uploads/2021/01/updatedreclass_cities.pdf

    python3 datasets/lgu/scripts/build_income_class.py <dir holding the PDFs>

Needs pdftotext (poppler). The PDFs are not committed.
"""
import datetime, json, pathlib, re, subprocess, sys
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/income-class.json'
if len(sys.argv) < 2:
    sys.exit(__doc__)
SRC = pathlib.Path(sys.argv[1])
UP = 'https://blgf.gov.ph/wp-content/uploads'
DO074 = f'{UP}/2025/01/DOF-DO-074.2024.pdf'
DO2308 = f'{UP}/2025/01/DOF-DO-No.23-08.pdf'
MUN08 = f'{UP}/2021/01/updated-reclass-CY-2008-4-27-16.pdf'
PROV08 = f'{UP}/2021/01/updated-reclassification-Province.pdf'
CITY08 = f'{UP}/2021/01/updatedreclass_cities.pdf'

# Older names the 2008 list uses for towns the directory holds under their current one.
ALIASES = {
    'bumbaran': 'amai manabilang',
    'p lima sugala': 'panglima sugala',
    'turtle island': 'turtle islands',
    'picong sultan gumander': 'picong',
    'salipada pendatun': 'gen s k pendatun',
    'tagoloan': 'tagoloan ii',
    'datu blah sinsuat': 'datu blah t sinsuat',
}

# DO 074-2024 Annex A, BARMM rows: (kind, name, class per DO 23-08 as printed, new class as printed, PDF page).
# A trailing * on the new class: computed lower than before, but the LGU keeps its
# current class (RA 11964 s. 10; Annex A note 1 names Tipo-Tipo and Sultan sa Barongis).
ANNEX_A = '''
P|Basilan|3rd|1st|6
P|Lanao Del Sur|1st|1st|6
P|Maguindanao Del Norte|New|4th|6
P|Maguindanao Del Sur|1st|1st|6
P|Tawi-Tawi|3rd|1st|6
C|Lamitan City|6th|3rd|9
C|Marawi City|4th|3rd|9
C|Cotabato City|3rd|1st|9
M|Akbar|New|4th|34
M|Al-Barka|New|4th|34
M|Hadji Mohammad Ajul|New|4th|34
M|Hadji Muhtamad|New|5th|34
M|Lantawan|3rd|2nd|34
M|Maluso|4th|2nd|34
M|Sumisip|1st|1st|34
M|Tabuan-Lasa|New|4th|34
M|Tipo-Tipo|3rd|4th*|34
M|Tuburan|2nd|2nd|34
M|Ungkaya Pukan|New|4th|34
M|Amai Manabilang|3rd|1st|34
M|Bacolod-Kalawi|3rd|1st|34
M|Balabagan|4th|2nd|34
M|Balindong|4th|2nd|34
M|Bayang|5th|3rd|34
M|Binidayan|4th|3rd|34
M|Buadiposo-Buntong|4th|3rd|34
M|Bubong|2nd|1st|34
M|Butig|6th|2nd|34
M|Calanogas|5th|4th|34
M|Ditsaan-Ramain|3rd|2nd|34
M|Ganassi|4th|2nd|34
M|Kapai|4th|2nd|34
M|Kapatagan|4th|2nd|34
M|Lumba-Bayabao|2nd|1st|34
M|Lumbaca-Unayan|New|5th|34
M|Lumbatan|5th|4th|34
M|Lumbayanague|4th|3rd|34
M|Madalum|3rd|1st|34
M|Madamba|4th|3rd|34
M|Maguing|2nd|1st|34
M|Malabang|3rd|1st|34
M|Marantao|2nd|1st|34
M|Marogong|4th|2nd|34
M|Masiu|5th|3rd|34
M|Mulondo|3rd|2nd|34
M|Pagayawan|5th|3rd|34
M|Piagapo|4th|2nd|34
M|Picong|4th|3rd|34
M|Poona Bayabao|4th|2nd|34
M|Pualas|5th|3rd|34
M|Saguiaran|4th|3rd|34
M|Sultan Dumalondong|6th|5th|34
M|Tagoloan Ii|4th|3rd|34
M|Tamparan|5th|3rd|34
M|Taraka|4th|2nd|34
M|Tubaran|4th|2nd|34
M|Tugaya|5th|3rd|34
M|Wao|2nd|1st|34
M|Barira|4th|2nd|34
M|Buldon|4th|1st|34
M|Datu Blah T. Sinsuat|New|3rd|34
M|Datu Odin Sinsuat|1st|1st|34
M|Kabuntalan|5th|4th|34
M|Matanog|4th|3rd|34
M|Northern Kabuntalan|5th|4th|35
M|Parang|1st|1st|35
M|Sultan Kudarat|1st|1st|35
M|Sultan Mastura|5th|3rd|35
M|Talitay|New|4th|35
M|Upi|1st|1st|35
M|Ampatuan|4th|2nd|35
M|Buluan|4th|1st|35
M|Datu Abdullah Sangki|New|2nd|35
M|Datu Anggal Midtimbang|New|4th|35
M|Datu Hoffer Ampatuan|New|4th|35
M|Datu Montawal|5th|2nd|35
M|Datu Paglas|4th|3rd|35
M|Datu Piang|2nd|2nd|35
M|Datu Salibo|New|4th|35
M|Datu Saudi-Ampatuan|4th|4th|35
M|Datu Unsay|5th|4th|35
M|Gen. S. K. Pendatun|4th|2nd|35
M|Guindulungan|New|4th|35
M|Mamasapano|5th|4th|35
M|Mangudadatu|New|3rd|35
M|Pagalungan|1st|1st|35
M|Paglat|New|4th|35
M|Pandag|New|4th|35
M|Rajah Buayan|New|4th|35
M|Shariff Aguak|2nd|2nd|35
M|Shariff Saydona Mustapha|New|4th|35
M|South Upi|4th|2nd|35
M|Sultan Sa Barongis|2nd|3rd*|35
M|Talayan|4th|3rd|35
M|Bongao|2nd|1st|35
M|Languyan|1st|1st|36
M|Mapun|4th|3rd|36
M|Panglima Sugala|3rd|1st|36
M|Sapa-Sapa|3rd|2nd|36
M|Sibutu|New|3rd|36
M|Simunul|4th|2nd|36
M|Sitangkai|1st|1st|36
M|South Ubian|3rd|2nd|36
M|Tandubas|2nd|1st|36
M|Turtle Islands|5th|5th|36
'''

# BLGF's 2008 city list (scan, page 3, "updated 6-29-2018").
CITIES_2008 = {'lamitan': '6th', 'cotabato': '3rd', 'marawi': '4th'}

BARMM_2008 = {'BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO', 'TAWI-TAWI'}
ALL_CAPS = re.compile(r'^\s+([A-Z][A-Z .\'-]+[A-Z])\s*$')
ROW = re.compile(r'^\s+\d+\.?\s+(.+?)\s{2,}(\d(?:st|nd|rd|th)\*?|Not Reclassified|NC)\s*$')


def text(name):
    path = SRC / name
    if not path.exists():
        sys.exit(f'missing {path}')
    return subprocess.run(['pdftotext', '-layout', str(path), '-'], capture_output=True, text=True, check=True).stdout


def key(name):
    n = norm(name)
    n = ALIASES.get(n, n)
    return towns.get(n)


units, former, unmatched, absent2008 = {}, {}, [], []

# 2024: Annex A.
for line in ANNEX_A.strip().splitlines():
    kind, name, old, new, page = line.split('|')
    slug = provinces.get(norm(name)) if kind == 'P' else key(name)
    if slug is None:
        unmatched.append(f'DO 074 {name}')
        continue
    rec = {'class': new.rstrip('*'), 'href': f'{DO074}#page={page}'}
    if new.endswith('*'):
        # Computed below the old class: by law it keeps the old one.
        rec = {'class': old, 'computedClass': new.rstrip('*'), 'retained': True, 'href': rec['href']}
    units.setdefault(slug, {})['2024'] = rec
    units[slug]['_annex2308'] = old

# 2008: provinces.
for name, cls in re.findall(r'\d+\.\s+([A-Z][A-Za-z -]+?)\s+(\d(?:st|nd|rd|th))', text('updated-reclassification-Province.pdf')):
    n = norm(name)
    rec = {'class': cls, 'href': PROV08}
    if n in provinces:
        units.setdefault(provinces[n], {})['2008'] = rec
    elif n == 'maguindanao':
        former.setdefault('maguindanao', {})['2008'] = rec

# 2008: municipalities.
section = None
for line in text('updated-reclass-CY-2008-4-27-16.pdf').splitlines():
    m = ALL_CAPS.match(line)
    if m and not line.strip().startswith('MUNICIPALITIES'):
        section = m.group(1).strip()
        continue
    m = ROW.match(line)
    if not m or section not in BARMM_2008:
        continue
    name, cls = m.group(1).strip(), m.group(2)
    slug = key(name)
    if slug is None:
        unmatched.append(f'2008 {section} / {name}')
        continue
    if not cls[0].isdigit():
        absent2008.append(slug)  # "Not Reclassified"/"NC": newly created, no COA-certified income
        continue
    rec = {'class': cls.rstrip('*'), 'href': MUN08}
    if cls.endswith('*'):
        rec['carriedOver'] = True  # incomplete income data: class from the reclassification before
    units.setdefault(slug, {})['2008'] = rec

for n, cls in CITIES_2008.items():
    units.setdefault(towns[n], {})['2008'] = {'class': cls, 'href': f'{CITY08}#page=3'}

# Cross-check Annex A's "per DO 23-08" column against BLGF's 2008 lists.
mismatch = []
for slug, u in units.items():
    old = u.pop('_annex2308', None)
    have = u.get('2008', {}).get('class')
    if old is not None and old != 'New' and old != have:
        mismatch.append(f'{slug}: Annex A says {old}, 2008 list says {have}')
    if old == 'New' and have:
        mismatch.append(f'{slug}: Annex A says New, 2008 list says {have}')

data = {
    'name': 'Income classification of BARMM local governments',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [
        {'label': 'DOF Department Order No. 074-2024 — Schedule of Income Classification for the First General Income '
                  'Reclassification under RA 11964 (signed 5 Nov 2024, effective 1 Jan 2025)', 'href': DO074, 'key': '2024'},
        {'label': 'DOF Department Order No. 23-08 — new income brackets (dated 29 Jul 2008, effective immediately)',
         'href': DO2308, 'key': '2008'},
        {'label': 'BLGF — Municipalities income classification per DO 23-08 (updated 27 Apr 2016)', 'href': MUN08, 'key': '2008'},
        {'label': 'BLGF — Provinces income classification per DO 23-08', 'href': PROV08, 'key': '2008'},
        {'label': 'BLGF — Cities income classification per DO 23-08 (updated 29 Jun 2018)', 'href': CITY08, 'key': '2008'},
    ],
    'effective': {'2024': '2025-01-01', '2008': '2008-07-29'},
    'note': (
        '"2024" is the class under DOF DO 074-2024, the first reclassification under RA 11964: five classes (1st–5th), '
        'on average annual regular income for FY 2021–2023, effective 1 January 2025. "2008" is the class under DOF '
        'DO 23-08 of 29 July 2008: six classes (1st–6th), on CY 2004–2007 income, as BLGF last listed it. Neither '
        'order prints the peso average per LGU, so no averageAnnualIncome is given. Under RA 11964 an LGU whose '
        'computed class falls keeps its old one: Tipo-Tipo and Sultan sa Barongis carry "retained" with the '
        'class they computed to. A 2008 class marked carriedOver was not recomputed in 2008 for lack of income '
        'data and is the class from the reclassification before. Towns created after 2008 (and the then-unclassified '
        'ones BLGF lists as "Not Reclassified") have no 2008 entry; Maguindanao del Norte, created in 2022, has '
        'none either, and pre-split Maguindanao\'s 2008 class is under "former". The eight Special Geographic '
        'Area towns, created in 2024, are in neither order. Sulu, in DO 074 under BARMM, is left out. '
        'The two sources disagree once: Annex A prints Datu Odin Sinsuat\'s DO 23-08 class as 1st, BLGF\'s 2008 '
        'list as 2nd (carried over); the 2008 entry here is BLGF\'s list. Maguindanao del Sur\'s Annex A row prints '
        'pre-split Maguindanao\'s 1st as its old class. '
        'DO 074-2024 is a scan: its BARMM rows were transcribed from the page images, page cited per record.'
    ),
    'units': {k: v for k, v in sorted(units.items())},
    'former': former,
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units + {len(former)} former')
print('unmatched rows:', unmatched or 'none')
print('Annex A vs 2008 list:', mismatch or 'agree')
print('no 2008 class (not reclassified):', sorted(absent2008) or 'none')
print('directory units with no 2024 class:', sorted(s for s in expected if '2024' not in units.get(s, {})) or 'none')
