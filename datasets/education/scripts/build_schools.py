"""The region's schools, placed in the directory's towns.

Which schools there are, their names, districts and learners: DepEd's Project Bukas files for the
latest school year (datasets/education/deped, built by deped_subset.py), every sector. The 2019
masterlist below gives what DepEd's files do not: where each school stands, the year it was founded
and its pupils in 2012 and 2015, matched by school ID or, for a renumbered school, by name in its town.

Source: OSMaPaaralan, the OpenStreetMap Philippines community's cleaned copy of the
Department of Education's school masterlist (school ID, name, level, district, the
year founded and enrolment), 2019 edition:
https://github.com/OSMPH/deped_schools_db (via the Humanitarian Data Exchange).

Kept: schools the masterlist files under the Autonomous Region in Muslim Mindanao,
placed in a town of the directory (datasets/lgu/barmm-lgu.json). Sulu's schools are
left out, as the directory follows the region since 2024. Maguindanao's schools are
placed in del Norte or del Sur by their town. Cotabato City's schools, which the 2019
list files under Region XII, are kept with the city. The Special Geographic Area's
schools are the ones the list files under the Cotabato-province towns its 63 barangays
came from, picked out by barangay (or, where the list leaves the barangay blank, by a
school named after one) and placed in the SGA town the barangay now belongs to.

Where a school sits: the masterlist's own coordinates where it has them; otherwise the one
school of the same name in the same town on OpenStreetMap (the Humanitarian OpenStreetMap
Team's export, ODbL); otherwise its town's centre, marked so a map can say the pin is the
town and not the school.

Besides the public schools, OpenStreetMap adds what the masterlist leaves out: private
schools, madaris, and colleges and universities, each named as one and not already on the
list. OpenStreetMap's own government schools are not added, so a public school written two
ways is not counted twice. Whether one is public or private is taken from OpenStreetMap's
operator tag, or from a name that leaves no doubt (a foundation or an incorporated school, a
Notre Dame or church school; a state university or college, or a school the ministry funds by
name); otherwise it is "not stated".

Last, school-additions.json: the colleges Wikipedia lists in the region that neither source has,
and a few schools with a record of their own, placed at their town unless Wikidata has their
coordinates. And school-photos.json gives a school its photograph, by its id.

    python3 datasets/education/scripts/build_schools.py
"""
import csv
import io
import json
import math
import re
import unicodedata
import urllib.request
import zipfile
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SRC = 'https://raw.githubusercontent.com/OSMPH/deped_schools_db/master/data/2019/OSMaPaaralan_v2019-282-full.tsv'
OSM = 'https://production-raw-data-api.s3.amazonaws.com/ISO3/PHL/education_facilities/hotosm_phl_education_facilities_osm_geojson.zip'
OUT = ROOT / 'datasets/education/schools.json'

LEVELS = {
    '0': 'Kindergarten',
    '0-1': 'Elementary',
    '1': 'Elementary',
    '2': 'Junior high',
    '2-3': 'Junior and senior high',
    '3': 'Senior high',
}


# Towns the 2019 list names otherwise: renamed since (Picong was Sultan Gumander,
# Amai Manabilang was Bumbaran), written without the middle initial, or misspelt.
ALIASES = {
    'Sultan Gumander': 'Picong',
    'Bumbaran': 'Amai Manabilang',
    'Datu Blah Sinsuat': 'Datu Blah T. Sinsuat',
    'Satu Salibo': 'Datu Salibo',
    'General Salipada K. Pendatun': 'Gen. S. K. Pendatun',
    'Datu Montawal': 'Pagagawan',
}


def fold(s: str) -> str:
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)', ' ', s)
    s = re.sub(r'\bcity of\b|\bcity\b', ' ', s)
    return re.sub(r'[^a-z0-9]+', '', s)


# The words every school name shares; a name is matched on what is left.
GENERIC = r'\b(elementary|primary|school|es|ps|national|high|integrated|central|annex|of|the|and)\b'


# The barangay a school is named after: "Macasendeg Elementary School" is Macasendeg's.
def named_after(s: str) -> str:
    return re.sub(r'(?i)\b(elementary|primary|school|national|high|integrated|central|annex|memorial|of|the|and)\b.*$', '', s).strip()


def name_key(s: str) -> str:
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', re.sub(GENERIC, ' ', s))


def osm_schools() -> tuple[dict, dict[tuple[str, str], list[dict]]]:
    """OpenStreetMap's education facilities, and its named schools in the region by (town, name key)."""
    req = urllib.request.Request(OSM, headers={'User-Agent': 'Mozilla/5.0'})
    z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(req, timeout=600).read()))
    geo = json.loads(z.read(next(n for n in z.namelist() if n.endswith('.geojson'))))
    out: dict[tuple[str, str], list[dict]] = {}
    for f in geo['features']:
        p = f['properties']
        if 'BARMM' not in (p.get('adm1_name') or '') or not p.get('name') or not f.get('geometry'):
            continue
        g = f['geometry']
        ring = g['coordinates'] if g['type'] == 'Point' else (g['coordinates'][0] if g['type'] == 'Polygon' else g['coordinates'][0][0])
        if g['type'] == 'Point':
            lon, lat = ring[:2]
        else:
            lon, lat = sum(c[0] for c in ring) / len(ring), sum(c[1] for c in ring) / len(ring)
        out.setdefault((fold(p.get('adm3_name') or ''), name_key(p['name'])), []).append({'id': p['id'], 'lat': lat, 'lon': lon})
    return geo, out


PRIVATE_NAME = re.compile(r"(?i)\binc\b\.?|foundation|notre dame|adventist|christian|episcopal|catholic|parochial|\bsaint\b|\bst\.|\bama\b|system technology|\bsti\b|montessori|claret|la purisima")
PUBLIC_NAME = re.compile(r"(?i)state (university|college)|mindanao state university|university of southern mindanao|college of technology and oceanography|agricultural (college|school)|cotabato foundation college of science and technology")
MADRASAH = re.compile(r"(?i)madras|ma.?had|markaz|jami.?a|islamic|arabic|darul|darus")
# Campus units and annexes OpenStreetMap names as if they were schools.
NOT_A_SCHOOL = re.compile(r"(?i)building|^college of |^school of (?!living)|^department|press$|c(a)?nteen|dorm|gym|library|covered court|graduate school|^(admin|ipdm|cad\.it|cnsm annex|cssh annex|msu cspear)$")

# Entries OpenStreetMap has twice under two spellings: the misspelt one is left out.
DUPLICATES = {'AR Pacheco Collge'}

# Names OpenStreetMap gives that the school's own record corrects. MSU's Wao unit closed its
# college programme and went back to being a community high school (msumain.edu.ph/?p=20854).
RENAMED = {'Mindanao State University - Wao': 'MSU Wao Community High School'}

# Freely licensed photographs on Wikimedia Commons, by the school's id.
PHOTOS = json.loads((ROOT / 'datasets/education/school-photos.json').read_text())['photos']


def type_of(level: str) -> str:
    return 'High school' if 'high' in level.lower() else level


def osm_extra(geo: dict, schools: list[dict], by_name: dict, centres: dict) -> list[dict]:
    """Private schools, madaris, colleges and universities OpenStreetMap names that the masterlist does not have."""
    used = {s.get('osm') for s in schools}
    listed = {(s['town'], name_key(s['name'])) for s in schools}
    out, seen = [], set()
    for f in geo['features']:
        p = f['properties']
        name = (p.get('name') or '').strip()
        if 'BARMM' not in (p.get('adm1_name') or '') or p.get('adm2_name') == 'Sulu' or not name or not f.get('geometry'):
            continue
        if p['id'] in used or NOT_A_SCHOOL.search(name):
            continue
        amenity, operator = p.get('amenity'), p.get('operator_type')
        higher = amenity in ('college', 'university') or re.search(r'(?i)\bcolleges?\b|\buniversity\b', name)
        if operator in ('government', 'autonomous_regional_government', 'public') and not higher:
            continue
        if not (operator in ('private', 'religious') or PRIVATE_NAME.search(name) or higher or MADRASAH.search(name)):
            continue
        town_raw = re.sub(r'\(.*?\)', '', p.get('adm3_name') or '').strip()
        hits = by_name.get(fold(town_raw), [])
        if hits:
            area, town, town_name = hits[0]
        elif town_raw.lower().startswith('special geographic area'):
            area, town, town_name = 'special-geographic-area', 'special-geographic-area', 'Special Geographic Area'
        else:
            continue
        if name in DUPLICATES:
            continue
        name = RENAMED.get(name, name)
        key = (town, re.sub(r'inc$', '', name_key(name)))
        if key in seen or (town, name_key(name)) in listed:
            continue
        seen.add(key)
        # A university's elementary department or community high school is that level, not the university.
        if re.search(r'(?i)elementary|primary', name):
            kind = 'Elementary'
        elif re.search(r'(?i)high school', name):
            kind = 'High school'
        elif amenity == 'kindergarten' or re.search(r'(?i)kinder|learning cent', name):
            kind = 'Kindergarten'
        elif higher:
            kind = 'College or university'
        elif MADRASAH.search(name):
            kind = 'Madrasah or Islamic school'
        else:
            kind = 'Other school'
        # A state college named a foundation is still a state college: the public names are read first.
        if operator in ('government', 'autonomous_regional_government', 'public') or PUBLIC_NAME.search(name):
            management = 'Public'
        elif operator in ('private', 'religious') or PRIVATE_NAME.search(name):
            management = 'Private'
        else:
            management = 'Not stated'
        g = f['geometry']
        ring = g['coordinates'] if g['type'] == 'Point' else (g['coordinates'][0] if g['type'] == 'Polygon' else g['coordinates'][0][0])
        lon, lat = (ring[:2] if g['type'] == 'Point' else (sum(c[0] for c in ring) / len(ring), sum(c[1] for c in ring) / len(ring)))
        out.append({
            'id': 'osm-' + p['id'].replace('/', '-'),
            'name': name,
            'level': kind,
            'type': kind,
            'management': management,
            'source': 'openstreetmap',
            'area': area,
            'town': town,
            'townName': town_name,
            'district': None,
            'founded': None,
            'pupils2012': None,
            'pupils2015': None,
            'lat': round(lat, 6),
            'lon': round(lon, 6),
            'placed': 'openstreetmap',
            'osm': p['id'],
        })
    return out


# ---- DepEd's Project Bukas files (datasets/education/deped, see its README) ----

DEPED = ROOT / 'datasets/education/deped'
# The school years the files cover, oldest first; the last is the list the directory follows.
YEARS = ['2023-24', '2024-25', '2025-26']

# DepEd's curricular classification, as a level a reader knows, and the map's kind.
OFFERING = {
    'Purely ES': ('Elementary', 'Elementary'),
    'Purely JHS': ('Junior high', 'High school'),
    'Purely SHS': ('Senior high', 'High school'),
    'JHS with SHS': ('Junior and senior high', 'High school'),
    'ES and JHS': ('Elementary and junior high', 'High school'),
    'ES with SHS': ('Elementary and senior high', 'High school'),
    'All Offering': ('Elementary to senior high', 'High school'),
}

# DepEd's short forms, spelt out when they end a name or stand before "Annex".
SHORT = {'ES': 'Elementary School', 'PS': 'Primary School', 'CES': 'Central Elementary School', 'NHS': 'National High School', 'HS': 'High School', 'SHS': 'Senior High School'}


def spell_out(name: str) -> str:
    name = re.sub(r'\s+', ' ', name).strip()
    return re.sub(r'\b(ES|PS|CES|NHS|HS|SHS)\b(?=\s*(?:$|[-–(,]|Annex|Extension))', lambda m: SHORT[m.group(1)], name)


def learners(r: dict) -> int:
    return sum(int(float(v or 0)) for k, v in r.items() if k.endswith(('_male', '_female')))


def district_of(r: dict) -> str | None:
    d = re.sub(r'\s+', ' ', r['school_district']).strip()
    if not d or d.lower().startswith('(no district'):
        return None
    return d if re.search(r'(?i)\bdistrict\b', d) else f'{d} District'


def division_of(r: dict) -> str:
    v = re.sub(r'\s+', ' ', r['division']).strip()
    return v if 'division' in v.lower() else f'{v} Schools Division'


def deped_current(old: list[dict], osm: dict, by_name: dict, sga: dict, centres: dict) -> tuple[list[dict], list[dict], Counter]:
    """DepEd's latest school year, every sector, each school with its learners in each year the files cover.

    A school on the 2019 list keeps what that list knew of it (its pin, the year it was founded, its pupils in
    2012 and 2015), matched by its ID or, where DepEd has renumbered it, by its name in the same town. A school
    new since 2019 is placed in its town from DepEd's own address, and pinned as the 2019 schools were."""
    by_year = {}
    for y in YEARS:
        with open(DEPED / f'enrollment_{y}.csv', newline='', encoding='utf-8') as f:
            by_year[y] = {r['school_id']: r for r in csv.DictReader(f)}
    latest = by_year[YEARS[-1]]
    old_by_id = {s['id']: s for s in old}
    old_by_name = {(s['town'], name_key(s['name'])): s for s in old}
    aliases = {fold(k): v for k, v in ALIASES.items()}
    want = {'lanao del sur': 'lanao-del-sur', 'basilan': 'basilan', 'tawi-tawi': 'tawi-tawi', 'city of cotabato': 'cotabato-city'}

    def town_of(r: dict):
        if 'special geographic' in r['division'].lower():
            hit = sga.get(fold(r['barangay'])) or sga.get(fold(named_after(spell_out(r['school_name']))))
            return hit[0] if hit else None
        town = aliases.get(fold(r['municipality']), r['municipality'])
        hits = by_name.get(fold(town), [])
        province = r['province'].strip().lower()
        if province.startswith('maguindanao'):
            hits = [h for h in hits if h[0].startswith('maguindanao') or h[0] in ('cotabato-city', 'special-geographic-area')]
        else:
            hits = [h for h in hits if h[0] == want.get(province)]
        return hits[0] if len(hits) == 1 else None

    out, used, unplaced = [], set(), Counter()
    for sid, r in latest.items():
        name = spell_out(r['school_name'])
        was = old_by_id.get(sid)
        place = (was['area'], was['town'], was['townName']) if was else town_of(r)
        if not place:
            unplaced[f"{r['division']} / {r['municipality']}"] += 1
            continue
        area, town, town_name = place
        was = was or old_by_name.get((town, name_key(name)))
        if was:
            used.add(was['id'])
        level, kind = OFFERING.get(r['Modified Curricular Offering Classification'].strip(), ('Other', 'Other school'))
        enrolment = {y: learners(by_year[y][sid]) for y in YEARS if sid in by_year[y]}
        sc = {
            'id': sid,
            'name': name,
            'level': level,
            'type': kind,
            'management': 'Private' if r['sector'].strip() == 'Private' else 'Public',
            'sector': 'State or local college' if r['sector'].strip().startswith('SUC') else r['sector'].strip(),
            'source': 'deped',
            'area': area,
            'town': town,
            'townName': town_name,
            'district': district_of(r),
            'division': division_of(r),
            'founded': was['founded'] if was else None,
            'pupils': enrolment.get(YEARS[-1]) or None,
            'enrolment': enrolment,
            'pupils2012': was['pupils2012'] if was else None,
            'pupils2015': was['pupils2015'] if was else None,
        }
        if was and was.get('placed') in ('masterlist', 'openstreetmap'):
            sc.update(lat=was['lat'], lon=was['lon'], placed=was['placed'])
            if was.get('osm'):
                sc['osm'] = was['osm']
        else:
            hits = osm.get((fold(town_name), name_key(name)), [])
            if len(hits) == 1 and name_key(name):
                sc.update(lat=round(hits[0]['lat'], 6), lon=round(hits[0]['lon'], 6), placed='openstreetmap', osm=hits[0]['id'])
            elif town in centres:
                sc.update(lat=centres[town]['lat'], lon=centres[town]['lon'], placed='town')
            else:
                sc.update(lat=None, lon=None, placed=None)
        out.append(sc)
    gone = [s for s in old if s['id'] not in used]
    return out, gone, unplaced


def main() -> None:
    lgu = json.loads((ROOT / 'datasets/lgu/barmm-lgu.json').read_text())
    towns: dict[tuple[str, str], tuple[str, str, str]] = {}
    by_name: dict[str, list[tuple[str, str, str]]] = {}
    for p in lgu['provinces']:
        for m in p['municipalities']:
            entry = (p['slug'], m['slug'], m['name'])
            by_name.setdefault(fold(m['name']), []).append(entry)
            for alias in filter(None, [m.get('alsoKnownAs')]):
                by_name.setdefault(fold(alias), []).append(entry)

    # The Special Geographic Area's barangays, each with the SGA town it is in and the Cotabato-province town it came from.
    sga: dict[str, tuple[tuple[str, str, str], str]] = {}
    for m in next(p for p in lgu['provinces'] if p['slug'] == 'special-geographic-area')['municipalities']:
        for b in m['barangays']:
            sga[fold(b['name'])] = (('special-geographic-area', m['slug'], m['name']), m['formedFrom'].lower())
    sga['rajahmuda'] = sga['rajamuda']  # the list's spelling

    req = urllib.request.Request(SRC, headers={'User-Agent': 'Mozilla/5.0'})
    text = urllib.request.urlopen(req, timeout=120).read().decode('utf-8')
    rows = [r for r in csv.DictReader(io.StringIO(text), delimiter='\t') if 'Muslim Mindanao' in r['addr:region'] or r['addr:province'] in ('City of Cotabato', 'Cotabato', 'North Cotabato')]

    schools, unplaced = [], Counter()
    for r in rows:
        province = r['addr:province'].strip()
        if province.lower() == 'sulu':
            continue
        town = (r['addr:town'] or r['addr:city']).strip()
        town = ALIASES.get(town, town)
        if province in ('Cotabato', 'North Cotabato'):
            # Only the schools in the barangays that joined the region: by the barangay the list gives, or the one the school is named after.
            hit = sga.get(fold(r['addr:village'])) or sga.get(fold(named_after(r['name'])))
            if not hit or town.lower() not in hit[1]:
                continue
            hits = [hit[0]]
        else:
            hits = by_name.get(fold(town), [])
            if province.lower().startswith('maguindanao'):
                hits = [h for h in hits if h[0].startswith('maguindanao') or h[0] in ('cotabato-city', 'special-geographic-area')]
            else:
                want = {'lanao del sur': 'lanao-del-sur', 'basilan': 'basilan', 'tawi-tawi': 'tawi-tawi', 'city of cotabato': 'cotabato-city'}.get(province.lower())
                hits = [h for h in hits if h[0] == want]
        if len(hits) != 1:
            unplaced[f'{province} / {town}'] += 1
            continue
        area, slug, name = hits[0]
        founded = r['date_started'][:4] if re.match(r'^\d{4}', r['date_started'] or '') else None
        pupils = r['population:pupils:2015']
        schools.append({
            'id': r['@id'],
            'name': r['name'].strip(),
            'level': LEVELS.get(r['isced:level'].strip(), 'Other'),
            'type': type_of(LEVELS.get(r['isced:level'].strip(), 'Other')),
            'management': 'Public',
            'source': 'deped',
            'area': area,
            'town': slug,
            'townName': name,
            'district': (r['operator'] or '').strip() or None,
            'founded': int(founded) if founded else None,
            'pupils2012': int(r['population:pupils:2012']) if r['population:pupils:2012'].isdigit() else None,
            'pupils2015': int(pupils) if pupils.isdigit() else None,
            'lat': float(r['latitude']) if r['latitude'] else None,
            'lon': float(r['longitude']) if r['longitude'] else None,
        })

    # ---- Where each school sits ----
    geo, osm = osm_schools()
    centres = {c['slug']: c for c in json.loads((ROOT / 'datasets/accidents/municipality-centres.json').read_text())['centres']}
    placed = Counter()
    def km(a_lat, a_lon, b_lat, b_lon):
        return math.hypot((a_lon - b_lon) * math.cos(math.radians((a_lat + b_lat) / 2)), a_lat - b_lat) * 111.2

    distrusted = []
    for sc in schools:
        # A few of the masterlist's coordinates are plainly wrong (one Lanao del Sur school sits in
        # Batangas). One more than 40 km from the school's own town is not trusted.
        c = centres.get(sc['town'])
        if sc['lat'] is not None and c and km(sc['lat'], sc['lon'], c['lat'], c['lon']) > 40:
            distrusted.append(sc['name'])
            sc['lat'] = sc['lon'] = None
        if sc['lat'] is not None and sc['lon'] is not None:
            sc['placed'] = 'masterlist'
        else:
            hits = osm.get((fold(sc['townName']), name_key(sc['name'])), [])
            if len(hits) == 1 and name_key(sc['name']):
                sc['lat'], sc['lon'], sc['placed'], sc['osm'] = round(hits[0]['lat'], 6), round(hits[0]['lon'], 6), 'openstreetmap', hits[0]['id']
            elif sc['town'] in centres:
                c = centres[sc['town']]
                sc['lat'], sc['lon'], sc['placed'] = c['lat'], c['lon'], 'town'
            else:
                sc['placed'] = None
        placed[sc['placed']] += 1

    # ---- DepEd's current list decides which schools there are ----
    schools, gone, dep_unplaced = deped_current(schools, osm, by_name, sga, centres)
    placed = Counter(s['placed'] for s in schools)

    extra = osm_extra(geo, schools, by_name, centres)
    schools += extra

    # ---- The schools added by hand ----
    added = json.loads((ROOT / 'datasets/education/school-additions.json').read_text())
    listed = {(s['town'], name_key(s['name'])) for s in schools}
    for a in added['schools']:
        hits = by_name.get(fold(ALIASES.get(a['town'], a['town'])), [])
        if len(hits) != 1:
            print('addition in an unknown town:', a['name'], a['town'])
            continue
        area, slug, town_name = hits[0]
        if (slug, name_key(a['name'])) in listed:
            print('addition already listed:', a['name'])
            continue
        listed.add((slug, name_key(a['name'])))
        c = centres.get(slug)
        schools.append({
            'id': 'wp-' + re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', a['name']).encode('ascii', 'ignore').decode().lower()).strip('-'),
            'name': a['name'],
            'level': a['level'],
            'type': a['type'],
            'management': a['management'],
            'source': 'wikipedia',
            'area': area,
            'town': slug,
            'townName': town_name,
            'district': None,
            'founded': a.get('founded'),
            'pupils2012': None,
            'pupils2015': None,
            'lat': a['lat'] if a.get('lat') is not None else (c['lat'] if c else None),
            'lon': a['lon'] if a.get('lon') is not None else (c['lon'] if c else None),
            'placed': 'wikidata' if a.get('lat') is not None else ('town' if c else None),
            'url': a['url'],
            **({'note': a['note']} if a.get('note') else {}),
        })

    for sc in schools:
        if sc['id'] in PHOTOS:
            sc['image'] = PHOTOS[sc['id']]
        # One shape for every school: what DepEd's files give, empty for the rest.
        for k, v in (('sector', None), ('division', None), ('pupils', None), ('enrolment', {})):
            sc.setdefault(k, v)

    schools.sort(key=lambda s: (s['area'], s['townName'], s['name']))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'name': 'Schools in the region’s towns: every school on DepEd’s list for school year 2025–26, public and private, with the madaris, colleges and universities OpenStreetMap and Wikipedia add',
        'additions': added['source'],
        'source': {
            'title': 'Department of Education, Project Bukas: school-level enrolment, SY 2023–24 to 2025–26',
            'url': 'https://www.deped.gov.ph/machine-ready-files/',
            'publisher': 'Department of Education',
            'retrieved': '2026-11-13',
            'licence': 'DepEd’s Terms of Use and Fair Use Policy: credit DepEd; no edits beyond editorial ones; work built on it under the same terms; no suggestion that DepEd made or backs this site',
        },
        'pins': {
            'title': 'OSMaPaaralan: DepEd school masterlist, cleaned by OpenStreetMap Philippines (2019 edition)',
            'url': 'https://github.com/OSMPH/deped_schools_db',
            'via': 'https://data.humdata.org/dataset/schools-mapping-in-the-philippines-by-openstreetmap',
            'publisher': 'Department of Education; OpenStreetMap Philippines',
            'gives': 'where each school stands, the year it was founded, and its pupils in 2012–13 and 2015–16',
        },
        'years': YEARS,
        'placed': {'masterlist': 'the 2019 masterlist’s own coordinates', 'openstreetmap': 'the school of the same name in the same town on OpenStreetMap (ODbL)', 'wikidata': 'the coordinates Wikidata records for it', 'town': 'its town’s centre, not the school'},
        'note': 'The schools, their names, districts and learners are DepEd’s for school year 2025–26; learners count formal schooling, not the Alternative Learning System or community learning centres. Sulu, which has left the region, is not on it. Where a school stands comes from DepEd’s 2019 masterlist, so a school new since then is shown at its town’s centre until someone maps it.',
        'notOnTheLatestList': [{'id': g['id'], 'name': g['name'], 'town': g['townName']} for g in gone],
        'unplaced': dict((unplaced + dep_unplaced).most_common()),
        'schools': schools,
    }, ensure_ascii=False, indent=1) + '\n')
    print('masterlist coordinates not trusted:', distrusted)
    print(len(extra), 'added from OpenStreetMap', Counter(x['type'] for x in extra), Counter(x['management'] for x in extra))
    print(sum(1 for s in schools if s['source'] == 'wikipedia'), 'added by hand from Wikipedia')
    print(len(schools), 'schools;', len(gone), 'on the 2019 list but not the latest;', sum(dep_unplaced.values()), 'of DepEd\'s not placed', dep_unplaced.most_common(15), dict(placed))


if __name__ == '__main__':
    main()
