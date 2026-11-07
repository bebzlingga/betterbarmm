"""DPWH's own projects inside the Bangsamoro, from its Transparency Portal.

The portal (transparency.dpwh.gov.ph) sits behind a bot check, so it is read
through a public copy of it: the c4rv3r/dpwh-transparency-data dataset on
Hugging Face (CC0), which holds every portal project with its contract,
bidders, progress, coordinates and document links.

DPWH has no regional office in BARMM — public works there are the Ministry of
Public Works' — so its projects inside the region are filed under the offices
around it: Regions IX, X and XII, and the Cotabato City and Isabela City
district offices. The portal's "province" is the implementing office, not the
place. A project is placed by its coordinates, inside the town outlines of
the PSGC (faeldon/philippines-json-maps, latest edition, which also draws the
Special Geographic Area's eight towns). Two guards keep the border honest:

  · a project an office outside the region implemented counts only when its
    description names a Bangsamoro place, because coordinates near a border
    land a river wall in Sultan Kudarat province inside Sultan sa Barongis;
  · a project whose description names a province outside the region and no
    place inside it is left out, wherever its point fell.

A project with no coordinates is placed by the one Bangsamoro town its
description names, if an office that works in the region implemented it.
Town names that also belong to places outside the region (Parang, Kapatagan,
Tagoloan, Tuburan, Sultan Kudarat) never place a project on their own.

Writes datasets/public-works/dpwh.json. Needs pyarrow (the copy is Parquet):

    python3 -m venv /tmp/dpwh-venv && /tmp/dpwh-venv/bin/pip install pyarrow
    /tmp/dpwh-venv/bin/python -I datasets/public-works/scripts/build_dpwh.py
"""
import json
import math
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

import pyarrow.parquet as pq

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public-works' / 'dpwh.json'
CACHE = Path.home() / '.cache' / 'betterbarmm' / 'dpwh'
UA = {'User-Agent': 'Mozilla/5.0 (compatible; research script)'}

MIRROR = 'c4rv3r/dpwh-transparency-data'
PARQUET = f'https://huggingface.co/datasets/{MIRROR}/resolve/main/dpwh_transparency_data_all_details.parquet'
MIRROR_API = f'https://huggingface.co/api/datasets/{MIRROR}'
OUTLINES = 'https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/latest/geojson/provdists/lowres/municities-provdist-{code}.0.001.json'

# PSGC province (or district) → the directory's area slug. Cotabato City is
# inside Maguindanao del Norte's file; the directory keeps it as an area of its own.
PROVINCES = {
    '1900700000': 'basilan',
    '1903600000': 'lanao-del-sur',
    '1908700000': 'maguindanao-del-norte',
    '1908800000': 'maguindanao-del-sur',
    '1907000000': 'tawi-tawi',
    '1999900000': 'special-geographic-area',
}

# The offices that build inside the region. Anything else needs a Bangsamoro place in its description.
OFFICES = {'Region IX', 'Region X', 'Region XII', 'Central Office', 'Cotabato City DEO', 'Isabela City DEO'}

# Names that are also towns or provinces outside the region.
AMBIGUOUS = {'parang', 'kapatagan', 'tagoloan', 'tuburan', 'sultan kudarat'}
REGION_WORDS = re.compile(r'\b(maguindanao|lanao del sur|basilan|tawi[- ]?tawi|special geographic area|barmm|bangsamoro|armm|marawi|cotabato city)\b', re.I)
ELSEWHERE = re.compile(
    r'\b(lanao del norte|sultan kudarat province|province of sultan kudarat|north cotabato|cotabato province|province of cotabato|'
    r'zamboanga|bukidnon|misamis|davao|sarangani|south cotabato|sulu|iligan|kidapawan|koronadal|general santos|isabela city)\b', re.I)


def get(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=600) as r:
            path.write_bytes(r.read())
    return path


def key(name):
    """A town's name, folded so the outline's "City of Marawi" meets the directory's "Marawi City"."""
    n = name.lower().replace('city of ', '').replace(' city', '')
    return re.sub(r'[^a-z0-9]+', ' ', n).strip()


# ---- the directory's towns ----
directory = json.loads((ROOT / 'lgu' / 'barmm-lgu.json').read_text())
towns = {}  # (area, key) -> (slug, name)
area_names = {}
for p in directory['provinces']:
    area_names[p['slug']] = p['name']
    for m in p['municipalities']:
        towns[(p['slug'], key(m['name']))] = (m['slug'], m['name'])
by_key = {}
for (area, k), v in towns.items():
    by_key.setdefault(k, []).append((area, v))

# ---- the outlines ----
polygons = []
for code, area in PROVINCES.items():
    data = json.loads(get(OUTLINES.format(code=code), CACHE / f'{code}.json').read_text())
    for f in data['features']:
        name = f['properties']['adm3_en']
        t_area = 'cotabato-city' if key(name) == 'cotabato' else area
        town = towns.get((t_area, key(name)))
        if not town:
            sys.exit(f'outline town not in the directory: {name} ({area})')
        g = f['geometry']
        for poly in g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]:
            xs, ys = [p[0] for p in poly[0]], [p[1] for p in poly[0]]
            polygons.append((t_area, town, poly[0], poly[1:], min(xs), max(xs), min(ys), max(ys)))


def inside(x, y, ring):
    c, j = False, len(ring) - 1
    for i in range(len(ring)):
        (xi, yi), (xj, yj) = ring[i], ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def locate(lon, lat):
    for area, town, ring, holes, x0, x1, y0, y1 in polygons:
        if x0 <= lon <= x1 and y0 <= lat <= y1 and inside(lon, lat, ring) and not any(inside(lon, lat, h) for h in holes):
            return area, town
    return None


# Longest names first, so "Northern Kabuntalan" wins over "Kabuntalan".
NAMES = sorted((k for k in by_key if k not in AMBIGUOUS and len(k) >= 4), key=len, reverse=True)


def named_town(text):
    """The one Bangsamoro town a description names, if exactly one area has it."""
    t = ' ' + re.sub(r'[^a-z0-9]+', ' ', text.lower()) + ' '
    for k in NAMES:
        if f' {k} ' in t and len(by_key[k]) == 1:
            area, town = by_key[k][0]
            return area, town
    return None


def clean(name):
    return re.sub(r'\s*\(\d+\)\s*$', '', str(name or '')).strip()


def day(v):
    s = str(v or '')[:10]
    return s if re.fullmatch(r'\d{4}-\d{2}-\d{2}', s) else None


def num(v):
    try:
        f = float(v)
        return None if math.isnan(f) else round(f, 2)
    except (TypeError, ValueError):
        return None


# ---- read the copy ----
table = pq.read_table(get(PARQUET, CACHE / 'all_details.parquet')).to_pylist()
mirror = json.loads(urllib.request.urlopen(urllib.request.Request(MIRROR_API, headers=UA), timeout=60).read())

projects, dropped = [], {'office outside, no Bangsamoro place named': 0, 'names a province outside': 0}
for r in table:
    text = f"{r.get('description') or ''} {r.get('contractName') or ''}"
    office = r.get('province') or ''
    lat, lon = num(r.get('latitude')), num(r.get('longitude'))
    place, how = None, None
    if lat is not None and lon is not None and 4.4 <= lat <= 8.4 and 119.2 <= lon <= 125.2:
        place = locate(lon, lat)
        how = 'coordinates'
        if place:
            names_region = REGION_WORDS.search(text) or named_town(text)
            if office not in OFFICES and place[0] != 'special-geographic-area' and not names_region:
                dropped['office outside, no Bangsamoro place named'] += 1
                continue
            if ELSEWHERE.search(text) and not names_region:
                dropped['names a province outside'] += 1
                continue
            # A point is approximate and a description is written by the office that built it: the town it names wins.
            named = named_town(text)
            if named:
                how = 'both' if named == place else 'name'
                place = named
    elif office in OFFICES:
        place = named_town(text)
        how = 'name'
        if place and ELSEWHERE.search(text):
            place = None
    if not place:
        continue
    area, (slug, tname) = place
    docs = {k: r.get(k) for k in ('advertisement', 'noticeOfAward', 'contractAgreement', 'noticeToProceed', 'programOfWork', 'engineeringDesign')}
    projects.append({
        'id': r['contractId'],
        'name': re.sub(r'\s+', ' ', str(r.get('description') or r.get('contractName') or '')).strip(),
        'category': r.get('category') or r.get('infraType') or None,
        'status': r.get('status') or None,
        'progress': num(r.get('progress')),
        'cost': num(r.get('budget')),
        'abc': num(r.get('abc')),
        'award': num(r.get('awardAmount')),
        'contractor': clean(r.get('winnerNames') or r.get('contractor')) or None,
        'bidders': [{'name': clean(b.get('name')), 'won': bool(b.get('isWinner'))} for b in (r.get('bidders') or []) if b and b.get('name')],
        'year': int(r['infraYear']) if str(r.get('infraYear') or '').isdigit() else None,
        'advertised': day(r.get('advertisementDate')),
        'start': day(r.get('startDate')),
        'end': day(r.get('completionDate')),
        'funds': r.get('sourceOfFunds') or None,
        'program': r.get('programName') or None,
        'office': office,
        'region': r.get('region') or None,
        'area': area,
        'areaName': area_names[area],
        'town': {'slug': slug, 'name': tname},
        'located': how,
        'lat': lat,
        'lon': lon,
        'docs': {k: v for k, v in docs.items() if isinstance(v, str) and v.startswith('http')},
        'images': int(r.get('totalImages') or 0),
        'live': r.get('livestreamUrl') if r.get('isLive') and isinstance(r.get('livestreamUrl'), str) else None,
    })

projects.sort(key=lambda p: (-(p['year'] or 0), -(p['cost'] or 0)))
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({
    'name': 'DPWH projects in the Bangsamoro',
    'generatedAt': date.today().isoformat(),
    'source': {
        'label': 'DPWH Transparency Portal',
        'href': 'https://transparency.dpwh.gov.ph/',
        'via': f'{MIRROR} on Hugging Face (CC0), updated {str(mirror.get("lastModified", ""))[:10]}',
        'viaHref': f'https://huggingface.co/datasets/{MIRROR}',
        'outlines': 'PSGC town outlines, faeldon/philippines-json-maps (latest)',
    },
    'note': 'DPWH has no regional office in BARMM; these are its projects inside the region, implemented by the offices around it. '
            'Placed by coordinates within PSGC town outlines, or, without coordinates, by the one Bangsamoro town the description names. '
            'The portal\'s amount paid is empty in the copy and is left out.',
    'dropped': dropped,
    'projects': projects,
}, ensure_ascii=False, indent=1) + '\n')
by = {}
for p in projects:
    by[p['located']] = by.get(p['located'], 0) + 1
print(f'{len(projects)} projects ({by}); dropped {dropped}; ₱{sum(p["cost"] or 0 for p in projects) / 1e9:.2f}B')
