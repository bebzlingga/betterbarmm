"""National awards, seals and recognitions to BARMM provinces, cities and
municipalities, 2020 onwards, plus the MILG's regional ones — every row
transcribed from a published list or release that names the LGU, with the
link it was read from.

There is no single source: each agency publishes its own passer list, PDF
circular or press release, often only on a regional office's page. RECORDS
below is the transcription; this script checks every name against the
directory (via sre.py) and writes datasets/lgu/awards.json. The SGLG and DTI's
CMCI are not here: they have files of their own.

    python3 datasets/lgu/scripts/build_awards.py
"""
import datetime, json
from sre import ROOT, directory, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/awards.json'
FORMER = {'maguindanao': 'maguindanao'}
AREAS = {norm(a['name']): a['slug'] for a in directory['provinces']}  # provinces, Cotabato City, the SGA
# Source spellings the directory writes differently.
SPELLING = {'datu blah sinsuat': 'datu blah t sinsuat', 'buadiposo bunting': 'buadiposo buntong',
            'buadipuso buntong': 'buadiposo buntong', 'datu abdullah': 'datu abdullah sangki'}

AWARDS = [
    # id, name, agency, scope, what it recognises
    ('blgf-top-performer', 'National Top-Performing LGU in Local Revenue Generation / Local Government Finance',
     'Bureau of Local Government Finance (DOF)', 'national',
     'A top-10 national rank on one of BLGF’s finance indicators, computed from the LGU’s own SRE.'),
    ('gawad-kalasag', 'Gawad KALASAG Seal for Local DRRM Councils and Offices',
     'Office of Civil Defense / NDRRMC', 'national',
     'A local disaster risk reduction and management council and office assessed fully compliant or beyond compliant.'),
    ('ltia', 'Lupong Tagapamayapa Incentives Awards (national)', 'DILG', 'national',
     'A barangay’s Lupon among the best in the country at settling disputes under the Katarungang Pambarangay.'),
    ('scflg', 'Seal of Child-Friendly Local Governance', 'DILG / Council for the Welfare of Children', 'national',
     'An LGU that passed the Child-Friendly Local Governance Audit.'),
    ('galing-pook', 'Galing Pook Award', 'Galing Pook Foundation', 'national',
     'An innovative, replicable local governance programme; finalists are marked as such.'),
    ('prime-hrm', 'PRIME-HRM maturity level', 'Civil Service Commission', 'national',
     'The maturity of an LGU’s human resource management systems, assessed per HR system.'),
    ('tfbl-eclip', 'Best E-CLIP Committee', 'Task Force Balik-Loob', 'national',
     'The provincial committee running the Enhanced Comprehensive Local Integration Program for former rebels.'),
    ('red-orchid', 'Red Orchid Award', 'Ministry of Health – BARMM (DOH programme)', 'regional',
     'An LGU enforcing a 100% tobacco-free environment, assessed regionally.'),
    ('milg-ltia', 'Lupong Tagapamayapa Incentives Awards (regional)', 'MILG – BARMM', 'regional',
     'The best barangay Lupons in the region, by class of the town they sit in.'),
    ('milg-smb', 'Search for Model Barangays', 'MILG – BARMM', 'regional', 'A model barangay in the region.'),
    ('milg-lgaip', 'LGU Grant Assistance for Innovative Practices', 'MILG – BARMM', 'regional',
     'An innovative local practice, rewarded with a project grant.'),
    ('milg-logfa', 'Local Governance Functionality Award (LoGFA)', 'MILG – BARMM', 'regional',
     'An LGU assessed functional and performing across its mandated local bodies.'),
    ('milg-adac-special', 'Special Anti-Drug Abuse Council Award', 'MILG – BARMM', 'regional',
     'An LGU whose barangays were cleared of illegal drugs.'),
    ('milg-lla', 'Local Legislative Award', 'MILG – BARMM', 'regional', 'A local council’s legislative performance.'),
]

SOURCES = {
    'blgf20': ('BLGF Memorandum Circular No. 031.2021 — top-performing LGUs in local revenue generation, FY 2020',
               'https://blgf.gov.ph/wp-content/uploads/2021/12/BLGF-MC-No.-031.2021-National-Top-Performing-PCM-in-Local-Revenue-Generation-for-FY2020.pdf'),
    'blgf22': ('BLGF Memorandum Circular No. 017.2024 — top-performing LGUs in local government finance, FY 2022 and 2023',
               'https://blgf.gov.ph/wp-content/uploads/2024/09/BLGF-MC-No.-017.2024-National-Top-Performing-Provinces-Cities-and-Municipalities-in-Strengthening-Local-Government-finance-for-FY2022-and-2023.pdf'),
    'gk22': ('DILG — 16 BARMM LGUs conferred with Gawad KALASAG award (22nd cycle, 2 December 2022)',
             'https://calabarzon.dilg.gov.ph/dilg-16-barmm-lgus-conferred-with-gawad-kalasag-award/'),
    'gk23lds': ('PIA Lanao del Sur — more LGUs in Lanao del Sur earn Gawad KALASAG (December 2023)',
                'https://lanaodelsurinfocus.blogspot.com/2023/12/more-lgus-in-lanao-del-sur-earn-gawad.html'),
    'gk23ssb': ('Bangsamoro Today — Sultan sa Barongis honored at the 23rd Gawad KALASAG (8 May 2024)',
                'https://bangsamorotoday.com/2024/05/08/sultan-sa-barongis-of-mds-barmm-honored-for-exemplary-disaster-risk-reduction-efforts/'),
    'gk24lds': ('PIA Lanao del Sur — 17 LGUs in Lanao del Sur fully compliant, Gawad KALASAG 2024 (December 2024)',
                'https://lanaodelsurinfocus.blogspot.com/2024/12/17-lgus-in-lanao-del-sur-demonstrate.html'),
    'ltia22': ('DILG — 12 outstanding Lupons, LTIA 2022 national winners',
               'https://calabarzon.dilg.gov.ph/dilg-commends-12-outstanding-lupons-lauds-lgus-for-430k-disputes-settled-in-barangays/'),
    'gp22': ('Galing Pook — awardees database', 'https://www.galingpook.org/what-we-do/awards/awardees/?limit=340'),
    'gp22f': ('Galing Pook — finalists for the 2022 Galing Pook Awards', 'https://galingpook.org/blog/finalists-for-the-2022-galing-pook-awards'),
    'lds': ('Province of Lanao del Sur — awards and accomplishments (the LGU’s own page)', 'https://lanaodelsur.gov.ph/accomplishments/'),
    'tfbl': ('Province of Lanao del Sur — Best E-CLIP Committee for BARMM (21 May 2025)',
             'https://lanaodelsur.gov.ph/governor-mamintal-bombit-alonto-adiong-jr-received-the-award-for-the-best-e-clip-committee-for-the-bangsamoro-autonomous-region-in-muslim-mindanao-barmm-in-recognition-of-his-exe/'),
    'orchid21': ('BIO — MOH awards BARMM LGUs, offices for smoke-free environment (27 January 2022)',
                 'https://bangsamoro.gov.ph/news/latest-news/moh-awards-barmm-lgus-offices-for-smoke-free-environment/'),
    'milg20': ('BIO — MILG grants incentives to performing LGUs, launches Salamat Awards (18 December 2020)',
               'https://bangsamoro.gov.ph/news/latest-news/milg-grants-incentives-to-performing-lgus-launches-salamat-awards'),
    'milg20ps': ('Philstar — BARMM cites 54 local governments for efficiency (19 December 2020)',
                 'https://www.philstar.com/nation/2020/12/19/2064969/nation'),
    'milg22': ('BIO — SEAL awardees each get P2.5M incentive (Pagkilala, 19 January 2022)',
               'https://bangsamoro.gov.ph/news/latest-news/seal-awardees-each-get-p2-5-m-incentive-18k-gold-medallion-from-milg/'),
    'milg23': ('BIO — Pagkilala: BARMM honors 153 LGUs, officers (23 January 2023)',
               'https://bangsamoro.gov.ph/news/latest-news/pagkilala-barmm-govt-honors-153-lgus-officers-with-exemplary-performances/'),
    'milg26': ('BIO — Pagkilala awards honor top-performing LGUs (6th Pagkilala, 20 January 2026)',
               'https://bangsamoro.gov.ph/news/latest-news/barmms-pagkilala-awards-honor-top-performing-lgus-for-innovation-leadership/'),
}

# (award, year, province as the source names it, town or None, details, source key)
# `year` is the cycle or fiscal year the source gives; failing that, the year it was conferred.
# `conferred` is when it was handed out or announced, where the source says.
R = []
def add(award, year, src, province, places, **extra):
    for place in places:
        town, more = (place, {}) if isinstance(place, (str, type(None))) else place
        R.append((award, year, province, town, {**extra, **more}, src))

add('blgf-top-performer', 2020, 'blgf20', 'Tawi-Tawi', ['Languyan'], conferred='2021-12-01',
    category='Collection efficiency of locally sourced revenues — municipalities', rank=6)
add('blgf-top-performer', 2022, 'blgf22', 'Maguindanao', [None], conferred='2024-08-19',
    category='Current operating expenditures per capita — provinces', rank=3)
add('blgf-top-performer', 2022, 'blgf22', 'Basilan', [None], conferred='2024-08-19',
    category='Current operating expenditures per capita — provinces', rank=6)
add('blgf-top-performer', 2022, 'blgf22', 'Tawi-Tawi', [None], conferred='2024-08-19',
    category='Current operating expenditures per capita — provinces', rank=9)

GK = dict(conferred='2022-12-02', cycle='22nd')
add('gawad-kalasag', 2022, 'gk22', 'Maguindanao del Norte', ['Upi'], level='Beyond Compliant', **GK)
add('gawad-kalasag', 2022, 'gk22', 'Maguindanao del Norte', ['Parang'], level='Fully Compliant', **GK)
add('gawad-kalasag', 2022, 'gk22', 'Maguindanao', [None], level='Fully Compliant', **GK)
add('gawad-kalasag', 2022, 'gk22', 'Basilan', [None, 'Lamitan City', 'Tuburan'], level='Fully Compliant', **GK)
add('gawad-kalasag', 2022, 'gk22', 'Maguindanao del Sur', ['Ampatuan', 'Datu Abdullah Sangki', 'Guindulungan', 'Paglat',
    'South Upi', 'Sultan sa Barongis'], level='Fully Compliant', **GK)
add('gawad-kalasag', 2022, 'gk22', 'Lanao del Sur', ['Bubong', 'Piagapo', 'Wao'], level='Fully Compliant', **GK)
add('gawad-kalasag', 2023, 'gk23lds', 'Lanao del Sur', [None, 'Marawi City', 'Bubong', 'Butig', 'Buadipuso Buntong', 'Calanogas',
    'Piagapo', 'Taraka', 'Wao'], level='Fully Compliant', cycle='23rd', conferred='2023-12-13')
add('gawad-kalasag', 2023, 'gk23ssb', 'Maguindanao del Sur', ['Sultan sa Barongis'], cycle='23rd')
add('gawad-kalasag', 2024, 'gk24lds', 'Lanao del Sur', [None, 'Marawi City', 'Bacolod Kalawi', 'Balabagan', 'Balindong',
    'Binidayan', 'Buadipuso-Buntong', 'Bubong', 'Butig', 'Calanogas', 'Kapatagan', 'Lumba Bayabao', 'Saguiaran', 'Pagayawan',
    'Piagapo', 'Taraka', 'Wao'], level='Fully Compliant', cycle='24th', conferred='2024-12')

add('ltia', 2022, 'ltia22', 'Maguindanao', [('Ampatuan', {'barangay': 'Kauran'})],
    category='4th to 6th class municipalities', level='National 1st runner-up', conferred='2022-12')
add('scflg', 2025, 'milg26', 'Cotabato City', ['Cotabato City'], conferred='2026-01-20')
add('galing-pook', 2022, 'gp22', 'Basilan', [None], level='Winner',
    category='Advancing and Sustaining Good Governance and Community Actions towards Resiliency and Empowerment')
add('galing-pook', 2022, 'gp22f', 'Maguindanao', ['Paglat'], level='Finalist',
    category='Creation of Community Leaders and Military Police Advisory Council (CLAMP-AC)')
add('prime-hrm', 2022, 'lds', 'Lanao del Sur', [None], level='Maturity Level 2 (Bronze)',
    category='Learning and development; rewards and recognition')
add('tfbl-eclip', 2025, 'tfbl', 'Lanao del Sur', [None], level='Best E-CLIP Committee for BARMM', conferred='2025-05-21')
add('red-orchid', 2021, 'orchid21', 'Lanao del Sur', ['Kapai', 'Calanogas'], category='LGU', conferred='2022-01-27')

M20 = dict(conferred='2020-12-18')
add('milg-ltia', 2020, 'milg20', 'Maguindanao', [('Ampatuan', {'barangay': 'Kauran', 'level': 'Champion'}),
    ('Datu Abdullah Sangki', {'barangay': 'Mao', 'level': '1st place'})], category='4th to 6th class', **M20)
add('milg-ltia', 2020, 'milg20', 'Lanao del Sur', [('Buadiposo Bunting', {'barangay': 'Pindolonan', 'level': '2nd place'})],
    category='4th to 6th class', **M20)
add('milg-ltia', 2020, 'milg20', 'Maguindanao', [('Upi', {'barangay': 'Rempes', 'level': 'Champion'})], category='1st to 3rd class', **M20)
add('milg-ltia', 2020, 'milg20', 'Lanao del Sur', [('Wao', {'barangay': 'Cebuano Group', 'level': '1st place'})], category='1st to 3rd class', **M20)
add('milg-ltia', 2020, 'milg20', 'Basilan', [('Sumisip', {'barangay': 'Tumahubong', 'level': '2nd place'})], category='1st to 3rd class', **M20)
add('milg-ltia', 2020, 'milg20', 'Basilan', [('Lamitan City', {'barangay': 'Limo-ok', 'level': 'Top prize'})], category='City', **M20)
add('milg-logfa', 2020, 'milg20ps', 'Maguindanao', ['Upi'], **M20)
add('milg-logfa', 2020, 'milg20ps', 'Basilan', ['Maluso'], **M20)
add('milg-adac-special', 2020, 'milg20ps', 'Maguindanao', ['Datu Blah Sinsuat'], **M20)

M22 = dict(conferred='2022-01-19')
add('milg-ltia', 2022, 'milg22', 'Maguindanao', [('Upi', {'barangay': 'Rempes', 'category': '1st to 3rd class'}),
    ('Ampatuan', {'barangay': 'Kauran', 'category': '4th to 6th class'})], level='Champion', **M22)
add('milg-ltia', 2022, 'milg22', 'Basilan', [('Lamitan City', {'barangay': 'Limo-ok'})], level='Champion', category='City', **M22)
add('milg-smb', 2022, 'milg22', 'Maguindanao', [('Upi', {'barangay': 'Rempes'})], level='1st', **M22)
add('milg-lgaip', 2020, 'milg22', 'Maguindanao', ['Parang', 'Sultan Mastura', 'Buldon', 'Upi'], **M22)
add('milg-lgaip', 2020, 'milg22', 'Lanao del Sur', ['Buadiposo Buntong', 'Taraka', 'Wao'], **M22)
add('milg-lgaip', 2021, 'milg22', 'Maguindanao', ['Paglat'], **M22)
add('milg-lgaip', 2021, 'milg22', 'Lanao del Sur', ['Taraka'], **M22)

M23 = dict(conferred='2023-01-23')
add('milg-ltia', 2023, 'milg23', 'Maguindanao', [('Ampatuan', {'barangay': 'Kauran', 'level': 'Champion'}),
    ('Datu Abdullah Sangki', {'barangay': 'Mao', 'level': '1st place'}),
    ('Datu Abdullah', {'barangay': 'Kaya-Kaya', 'level': '2nd place'})], category='4th to 6th class', **M23)
add('milg-ltia', 2023, 'milg23', 'Maguindanao', [('Upi', {'barangay': 'Rempes', 'level': 'Champion'}),
    ('Upi', {'barangay': 'Borongotan', 'level': '1st place'})], category='1st to 3rd class', **M23)
add('milg-ltia', 2023, 'milg23', 'Lanao del Sur', [('Wao', {'barangay': 'Manila Group', 'level': '2nd place (tied)'})],
    category='1st to 3rd class', **M23)
add('milg-ltia', 2023, 'milg23', 'Basilan', [('Lamitan City', {'barangay': 'Maligaya', 'level': 'Champion'}),
    ('Lamitan City', {'barangay': 'Limo-ok', 'level': '1st place'})], category='City', **M23)
add('milg-lgaip', 2023, 'milg23', 'Maguindanao', ['Paglat', 'Upi'], **M23)
add('milg-logfa', 2023, 'lds', 'Lanao del Sur', [None], level='Ideal functionality')

# The 6th Pagkilala, held 20 January 2026, honoured the 2025 cycle (user, 2026-10-10); the
# BIO release names only the ceremony date, which `conferred` keeps.
M26 = dict(conferred='2026-01-20')
add('milg-lgaip', 2025, 'milg26', 'Basilan', ['Lamitan City'], **M26)
add('milg-lgaip', 2025, 'milg26', 'Maguindanao del Norte', ['Parang'], **M26)
add('milg-lla', 2025, 'milg26', 'Cotabato City', ['Cotabato City'], category='Independent component city', **M26)
add('milg-lla', 2025, 'milg26', 'Basilan', ['Lamitan City'], category='Component city', **M26)
add('milg-lla', 2025, 'milg26', 'Lanao del Sur', ['Marawi City'], category='Component city', **M26)
add('milg-lla', 2025, 'milg26', 'Maguindanao del Norte', ['Sultan Kudarat'], category='Municipality', **M26)
add('milg-lla', 2025, 'milg26', 'Maguindanao del Sur', ['Datu Piang', 'Datu Abdullah Sangki'], category='Municipality', **M26)
add('milg-smb', 2025, 'milg26', 'Maguindanao del Sur', [('Ampatuan', {'barangay': 'Kauran'})], **M26)

# What was looked for and not found, or found and left out. Missing is not failed.
CHECKED = [
    ('SGLG, DTI CMCI', 'Not here: each has a file of its own.'),
    ('Gawad KALASAG', '2020 and 2021: no cycle found. 23rd (2023) and 24th (2024): published lists found for Lanao del Sur only, plus Sultan sa Barongis; nothing for Basilan, the two Maguindanao provinces, Tawi-Tawi, Cotabato City or the SGA. 25th (2025): the national awarding was cancelled (Manila Times, 14 November 2025).'),
    ('Seal of Child-Friendly Local Governance', 'No DILG or CWC passer list naming BARMM LGUs for 2020–2025. The MILG gives counts only (41 CFLGA awardees, January 2024); the 2026 Pagkilala names only Cotabato City.'),
    ('DILG LTIA, national', '2021 list read: no BARMM barangay. 2023–2025: no full national list found.'),
    ('Good Financial Housekeeping', 'No public list for 2020 onwards; the last BARMM list found is 2018.'),
    ('ADAC Performance Award', 'National lists read (1st national ADAC awards; 63 top LGUs, 2025 audit): no BARMM LGU. MILG ceremonies give counts only (49, 38, 39, 16) apart from the one town named in 2020. A PIA list of Lanao del Sur’s top 20 ADACs (June 2023) could not be opened.'),
    ('Peace and Order Council audit; Full Disclosure Policy', 'No list naming a BARMM LGU found; MILG gives a count only (26 POC awardees, January 2024).'),
    ('NNC nutrition awards (Green Banner, CROWN, NHA, NNAC)', 'National lists read (2025 NNAC): no BARMM LGU. No BARMM regional nutrition list found.'),
    ('DOH Red Orchid', 'Only the 2021 cycle names LGUs; the 2022 cycle went to hospitals and jails.'),
    ('DOH Purple Ribbon, UHC, PhilHealth', 'No public list naming a BARMM LGU found.'),
    ('CSC PRIME-HRM', 'CSC publishes no list of accredited LGUs; the one record is the province’s own claim, corroborated by its 2025 account of a CSC-BARMM summit ("a bronze awardee").'),
    ('ARTA, DICT eLGU/eBOSS', 'Lists read (eBOSS-compliant LGUs, 2023–2024): no BARMM LGU. arta.gov.ph refused the request.'),
    ('Galing Pook', '2021: partial list only. 2023 finalists, 2024 winners, 2025 winners and finalists read: no BARMM LGU.'),
    ('DSWD, DepEd, DA, DOLE, DENR, DOT, PopCom, PSA, COA and others', 'No list naming a BARMM LGU found; in BARMM most of these programmes run through regional ministries.'),
    ('MILG Salamat Excellence Award for Leadership (SEAL)', 'Left out: it is given to officials, not LGUs.'),
    ('MILG LTIA and Search for Model Barangays, Barangay Tumbras', 'Left out: named under Midsayap or "SGA" with no SGA town to file it under.'),
    ('Unreachable', 'pia.gov.ph and its mirror, pna.gov.ph, ocd.gov.ph and mb.com.ph refused or timed out; milg.bangsamoro.gov.ph has no news archive. Lists published only there are not here.'),
]

ids = {a[0] for a in AWARDS}
units, former, unmatched = {}, {}, []
for award, year, province, town, extra, src in R:
    assert award in ids and src in SOURCES, (award, src)
    target, p = units, norm(province)
    if town is None:
        key = provinces.get(p)
        if key is None and p in FORMER:
            key, target = FORMER[p], former
    else:
        t = norm(town)
        key = towns.get(SPELLING.get(t, t))
        # The town must sit in the province the source names (pre-split Maguindanao's towns
        # are filed under the province they are in now).
        if key and p not in FORMER and not key.startswith(AREAS.get(p, '?') + '/'):
            key = None
    if key is None:
        unmatched.append(f'{award} {year} {town} / {province}')
        continue
    target.setdefault(key, []).append({'award': award, 'year': year, **extra, 'href': SOURCES[src][1]})
assert not unmatched, f'not in the directory: {unmatched}'
for rows in [*units.values(), *former.values()]:
    rows.sort(key=lambda r: (r['year'], r['award'], r.get('barangay', '')))

used = {s for *_, s in R}
data = {
    'name': 'Awards and recognitions to BARMM local governments',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [{'label': label, 'href': href} for k, (label, href) in SOURCES.items() if k in used],
    'note': (
        'National awards, seals and recognitions to BARMM provinces, cities and municipalities from 2020, and the '
        'Ministry of the Interior and Local Government’s own regional awards (scope "regional"). Each row was read from '
        'an agency list, circular or release, or a news report naming the LGU; "href" is where. "year" is the cycle or '
        'fiscal year the source gives, otherwise the year it was conferred; "conferred" is the date, where stated. '
        'These are passer and winner lists: they do not say which LGUs were assessed, so an LGU with no row did not '
        'necessarily fail — it may not have applied, or its list was never published. Coverage is uneven: Lanao del '
        'Sur’s Gawad KALASAG results are published, most other provinces’ are not. Barangay awards sit under their town '
        'with a "barangay" field. Pre-split Maguindanao’s provincial awards are under "former"; its towns sit under the '
        'province they are in now. Sulu is left out. The SGLG and DTI’s CMCI have files of their own. "notFound" lists '
        'what was looked for and not found.'
    ),
    'awards': [{'id': i, 'name': n, 'agency': a, 'scope': s, 'recognises': w} for i, n, a, s, w in AWARDS],
    'units': dict(sorted(units.items())),
    'former': former,
    'notFound': [{'award': a, 'result': r} for a, r in CHECKED],
}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
print(f'wrote {OUT.relative_to(ROOT)}: {len(R)} records, {len(units)} units + {len(former)} former')
