"""Health facilities in the region's towns: the Department of Health's counts, and the
hospitals OpenStreetMap has mapped.

1. Counts: the DOH National Health Facility Registry's number of facilities of each type
   in each city and municipality, as of January 27, 2021, published by OCHA Philippines
   on the Humanitarian Data Exchange ("Philippines: Pre-Disaster Indicators"). The
   registry itself sits behind a bot check, so it is not read directly.
2. Hospitals: OpenStreetMap's health facilities, as exported by the Humanitarian
   OpenStreetMap Team (ODbL), keeping those mapped as hospitals and named as one.

Towns are matched by PSGC code to the directory (datasets/lgu/barmm-lgu.json), so
Cotabato City counts although DOH files it under Region XII. Sulu is left out, as the
directory follows the region since 2024.

    pip install openpyxl
    python3 datasets/health/scripts/build_facilities.py
"""
import io
import json
import re
import urllib.request
import zipfile
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/health/facilities.json'
DOH = 'https://data.humdata.org/dataset/f26a0a04-0549-4139-af91-81dfa6e56082/resource/7bfd3e06-762d-44d7-9b5d-0bb168b399f1/download/210127_health-facility-type_my-municipality.xlsx'
OSM = 'https://production-raw-data-api.s3.amazonaws.com/ISO3/PHL/health_facilities/hotosm_phl_health_facilities_osm_geojson.zip'
HOSPITAL = re.compile(r'hospital|medical cent(er|re)|infirmary|sanitarium|polyclinic', re.I)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=300).read()


def main() -> None:
    lgu = json.loads((ROOT / 'datasets/lgu/barmm-lgu.json').read_text())
    towns = {m['psgc']: (p['slug'], m['slug'], m['name']) for p in lgu['provinces'] for m in p['municipalities'] if m.get('psgc')}
    def key(name: str) -> str:
        return re.sub(r'[^a-z]', '', re.sub(r'\(.*?\)|city of|city', '', name.lower()))

    by_name = {key(m['name']): (p['slug'], m['slug'], m['name']) for p in lgu['provinces'] for m in p['municipalities']}

    # ---- 1. DOH counts ----
    wb = openpyxl.load_workbook(io.BytesIO(fetch(DOH)), read_only=True)
    rows = list(wb['Data'].iter_rows(values_only=True))
    head = rows[0]
    types = [h for h in head[7:] if h != 'Total']
    counts: dict[str, dict] = {}
    for r in rows[1:]:
        code = (r[5] or '').removeprefix('PH')
        if code not in towns:
            continue
        area, slug, name = towns[code]
        t = counts.setdefault(slug, {'area': area, 'town': slug, 'townName': name, 'government': {}, 'private': {}})
        owner = 'government' if r[6] == 'Government' else 'private'
        for i, h in enumerate(head[7:], 7):
            if h != 'Total' and r[i]:
                t[owner][h] = t[owner].get(h, 0) + int(r[i])

    # ---- 2. OSM hospitals ----
    z = zipfile.ZipFile(io.BytesIO(fetch(OSM)))
    geo = json.loads(z.read(next(n for n in z.namelist() if n.endswith('.geojson'))))
    hospitals = []
    for f in geo['features']:
        p = f['properties']
        if 'BARMM' not in (p.get('adm1_name') or '') or p.get('adm2_name') == 'Sulu':
            continue
        # A name that is only the kind of place ("INFIRMARY") says nothing a reader can use.
        if p.get('amenity') != 'hospital' or not HOSPITAL.search(p.get('name') or '') or not re.search(r'\w+\s+\w+', p['name']):
            continue
        code = (p.get('adm3_pcode') or '').removeprefix('PH')
        # OCHA's codes are ten digits; the directory's nine. Try the code, then the name.
        town = towns.get(code[:2] + code[3:] if len(code) == 10 else code)
        if not town:
            town = by_name.get(key(p.get('adm3_name') or ''))
        lon, lat = (f['geometry']['coordinates'] if f['geometry']['type'] == 'Point' else f['geometry']['coordinates'][0][0])[:2]
        hospitals.append({
            'osm': p['id'],
            'name': p['name'].strip(),
            'operator': p.get('operator_type'),
            'area': town[0] if town else None,
            'town': town[1] if town else None,
            'townName': town[2] if town else p.get('adm3_name'),
            'lat': round(lat, 5),
            'lon': round(lon, 5),
        })
    # One entry per name and town: OpenStreetMap sometimes has both a point and the building.
    seen, unique = set(), []
    for h in sorted(hospitals, key=lambda h: (h['townName'] or '', h['name'])):
        k = (h['name'].lower(), h['town'])
        if k not in seen:
            seen.add(k)
            unique.append(h)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'name': 'Health facilities in the region’s towns',
        'types': types,
        'counts': {
            'source': {
                'title': 'Number of health facilities by type and municipality, National Health Facility Registry',
                'publisher': 'Department of Health',
                'asOf': '2021-01-27',
                'url': 'https://nhfr.doh.gov.ph/',
                'via': 'https://data.humdata.org/dataset/philippines-pre-disaster-indicators',
            },
            'towns': sorted(counts.values(), key=lambda t: (t['area'], t['townName'])),
        },
        'hospitals': {
            'source': {
                'title': 'Health facilities of the Philippines (OpenStreetMap export)',
                'publisher': 'OpenStreetMap contributors, exported by the Humanitarian OpenStreetMap Team',
                'license': 'ODbL',
                'url': 'https://data.humdata.org/dataset/hotosm_phl_health_facilities',
            },
            'note': 'Only what volunteers have mapped and named as a hospital. Not a complete list.',
            'list': unique,
        },
    }, ensure_ascii=False, indent=1) + '\n')
    gov = sum(sum(t['government'].values()) for t in counts.values())
    pri = sum(sum(t['private'].values()) for t in counts.values())
    print(len(counts), 'towns;', gov, 'government and', pri, 'private facilities;', len(unique), 'hospitals mapped')
    print('unplaced hospitals:', [h['name'] for h in unique if not h['town']])


if __name__ == '__main__':
    main()
