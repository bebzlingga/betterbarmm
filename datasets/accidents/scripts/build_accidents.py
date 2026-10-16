"""Build datasets/accidents/accidents.json from the report files in datasets/accidents/reports/.

Each report file is a JSON array of incidents as a research pass wrote them (see
the schema in the README section of DATA.md). This script normalises places
against the LGU directory, folds the fifteen fine kinds into the map's five
groups, places each incident (barangay through Nominatim where it can be found
within 25 km of the town, else the town's centre), merges records that describe
one incident, and writes the dataset.

Enrichment — a later look at one record: the barangay, the day, a corrected
toll, an outlet's own address, a photo — lives in `enrichment/*.json` as
patches keyed by the record's id, applied after the merge so the research
passes stay as they were written.

    python3 -I datasets/accidents/scripts/build_accidents.py [--no-geocode]
"""
import glob, json, os, re, sys, time, math, urllib.parse, urllib.request, unicodedata
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
LGU = json.load(open(os.path.join(ROOT, '..', 'lgu', 'barmm-lgu.json')))
CENTRES = json.load(open(os.path.join(ROOT, 'municipality-centres.json')))['centres']
CACHE_PATH = os.path.join(ROOT, 'barangay-centres.json')
LINKS_PATH = os.path.join(ROOT, 'links.json')
try: LINKS = json.load(open(LINKS_PATH))
except FileNotFoundError: LINKS = {}
GEOCODE = '--no-geocode' not in sys.argv
UA = 'BetterBARMM-map/1.0 (accident map build)'

GROUP = {'road': 'road', 'sea': 'water', 'drowning': 'water', 'fire': 'fire', 'explosion': 'fire', 'shooting': 'shooting'}
KIND = {'road': 'Road crash', 'sea': 'Boat mishap', 'drowning': 'Drowning', 'fire': 'Fire', 'explosion': 'Explosion', 'electrocution': 'Electrocution',
        'lightning': 'Lightning', 'landslide': 'Landslide', 'flood': 'Flood', 'collapse': 'Collapse', 'workplace': 'Workplace accident',
        'poisoning': 'Food poisoning', 'aviation': 'Aircraft crash', 'shooting': 'Shooting', 'other': 'Other'}

def norm(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode()
    s = re.sub(r'\b(city of|municipality of|city|town|municipality)\b', ' ', s, flags=re.I)
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

ALIASES = {'datu montawal': 'Pagagawan', 'sultan sumagka': 'Talitay', 'bumbaran': 'Amai Manabilang', 'sultan gumander': 'Picong',
           'general salipada k pendatun': 'Gen. S. K. Pendatun', 'gen salipada k pendatun': 'Gen. S. K. Pendatun', 'gen s k pendatun': 'Gen. S. K. Pendatun',
           'general s k pendatun': 'Gen. S. K. Pendatun', 'cagayan de tawi tawi': 'Mapun', 'balimbing': 'Panglima Sugala', 'poon a bayabao': 'Poona Bayabao',
           'cotabato': 'Cotabato City', 'kabuntalan': 'Kabuntalan', 'north upi': 'Upi', 'datu blah sinsuat': 'Datu Blah T. Sinsuat', 'datu blah t sinsuat': 'Datu Blah T. Sinsuat',
           'shariff saydona': 'Shariff Saydona Mustapha', 'datu saudi': 'Datu Saudi-Ampatuan', 'sultan sa barongis': 'Sultan Sa Barongis', 'tagoloan': 'Tagoloan II',
           'hadji mohammad ajul': 'Hadji Mohammad Ajul', 'buadipuso buntong': 'Buadiposo-Buntong', 'datu hoffer': 'Datu Hoffer Ampatuan', 'hadji muhtamad': 'Hadji Muhtamad', 'lumba bayabao': 'Lumba-Bayabao', 'ditsaan ramain': 'Ditsaan-Ramain'}
# Towns of Cotabato province whose BARMM barangays became the Special Geographic Area's municipalities.
SGA_HOST = {'pikit': 'Kadayangan', 'kabacan': 'Old Kaabakan', 'midsayap': 'Nabalawag', 'pigcawayan': 'Kapalawan', 'aleosan': 'Kapalawan', 'carmen': 'Malidegao', 'tulunan': 'Ligawasan'}

TOWNS = {}
for p in LGU['provinces']:
    for m in p['municipalities']:
        TOWNS[norm(m['name'])] = (m['name'], p['name'])
CENTRE = {(c['province'], c['municipality']): (c['lat'], c['lon']) for c in CENTRES}
# A province's centre is the mean of its towns' centres: where a report names a province and no town, the dot goes here.
PROV_CENTRE = {}
for c in CENTRES: PROV_CENTRE.setdefault(c['province'], []).append((c['lat'], c['lon']))
PROV_CENTRE = {p: (round(sum(x for x, _ in v) / len(v), 4), round(sum(y for _, y in v) / len(v), 4)) for p, v in PROV_CENTRE.items()}
PROVINCES = {norm(p): p for p in PROV_CENTRE}

def resolve_town(name, province):
    n = norm(re.sub(r'\(.*?\)', '', name or ''))
    if n in ALIASES: n = norm(ALIASES[n])
    if n in TOWNS: return TOWNS[n]
    if n in SGA_HOST: return TOWNS[norm(SGA_HOST[n])]
    for key, val in TOWNS.items():
        if n and (n in key or key in n) and abs(len(n) - len(key)) <= 4: return val
    return None

try: CACHE = json.load(open(CACHE_PATH))
except FileNotFoundError: CACHE = {'name': 'Barangay centres looked up for the accident map', 'source': {'label': 'OpenStreetMap, through Nominatim (ODbL)', 'href': 'https://nominatim.openstreetmap.org/'}, 'lookups': {}}

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))

def geocode_barangay(barangay, town, province, centre):
    key = f'{barangay}|{town}|{province}'
    if key in CACHE['lookups']: hit = CACHE['lookups'][key]
    else:
        if not GEOCODE: return None
        q = f'{barangay}, {town}, {province if not province.startswith("Maguindanao") else "Maguindanao"}, Philippines'
        url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'limit': 3, 'countrycodes': 'ph'})
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r: res = json.load(r)
        except Exception as e:
            print('  geocode error', q, e, file=sys.stderr); res = []
        time.sleep(1.1)
        hit = None
        for cand in res:
            pt = (float(cand['lat']), float(cand['lon']))
            if km(pt, centre) <= 25: hit = {'lat': round(pt[0], 4), 'lon': round(pt[1], 4), 'matched': cand.get('display_name')}; break
        CACHE['lookups'][key] = hit
    return hit

def slug(s): return re.sub(r'[^a-z0-9]+', '-', norm(s)).strip('-')

def jaccard(a, b):
    A = set(re.findall(r'[a-z0-9]+', a.lower())); B = set(re.findall(r'[a-z0-9]+', b.lower()))
    return len(A & B) / max(1, len(A | B))

# Shooting headlines share their furniture — "killed", "wounded", "in", "ambush", the province — so two different
# shootings read alike. For them the headline is compared on what is left once the furniture and the place are gone.
STOP = set('a an and at by for in of on the to with del sur norte city town province dead dies die died killed kill kills shot shoots shooting shootings gunned gunman gunmen wounded hurt injured ambush ambushed attack attacked maguindanao lanao basilan tawi cotabato barmm bangsamoro'.split())
def similar(m, r):
    if r['type'] != 'shooting': return jaccard(m['title'], r['title']) >= 0.3
    place = set(re.findall(r'[a-z0-9]+', f"{r['municipality'] or ''} {r['province']}".lower()))
    A = set(re.findall(r'[a-z0-9]+', m['title'].lower())) - STOP - place; B = set(re.findall(r'[a-z0-9]+', r['title'].lower())) - STOP - place
    return len(A & B) / max(1, len(A | B)) >= 0.3

records, dropped = [], []
for path in sorted(glob.glob(os.path.join(ROOT, 'reports', '*.json'))):
    for raw in json.load(open(path)):
        town = resolve_town(raw.get('municipality') or '', raw.get('province') or '')
        if town: municipality, province = town
        else:
            # A town that could not be matched stays out; a report that named none goes to its province's centre.
            province = PROVINCES.get(norm(raw.get('province') or ''))
            if not province or raw.get('municipality'):
                dropped.append((os.path.basename(path), raw.get('date'), raw.get('municipality'), raw.get('province'), raw.get('title'))); continue
            municipality = None
        if not re.match(r'^\d{4}-\d{2}(-\d{2})?$', raw.get('date') or ''): dropped.append((os.path.basename(path), raw.get('date'), municipality, 'bad date', raw.get('title'))); continue
        fine = (raw.get('type') or 'other').lower()
        # Weather that hurt nobody is not an accident: floods, storm surges, tornadoes and felled trees stay out unless someone was killed, hurt or lost.
        nobody = all(not raw.get(k) for k in ('deaths', 'injured', 'missing'))
        if nobody and (fine == 'flood' or (fine == 'other' and re.search(r'tornado|waterspout|storm|typhoon|wind|rain|flood', f"{raw.get('title')} {raw.get('summary')}", re.I))):
            dropped.append((os.path.basename(path), raw.get('date'), municipality, 'weather, no casualties', raw.get('title'))); continue
        centre = CENTRE[(province, municipality)] if municipality else PROV_CENTRE[province]
        lat, lon, placed = centre[0], centre[1], 'municipality' if municipality else 'province'
        barangay = (raw.get('barangay') or '').strip() or None
        if municipality and barangay and not re.search(r'\b(highway|road|km|kilometer|off |sea|strait|gulf|bay|waters|boundary|between)\b', barangay, re.I):
            hit = geocode_barangay(re.sub(r'^(brgy\.?|barangay)\s*', '', barangay, flags=re.I), municipality, province, centre)
            if hit: lat, lon, placed = hit['lat'], hit['lon'], 'barangay'
        # A report found through Google News keeps Google's link until the outlet's own address is recovered into links.json.
        sources = [{'outlet': s.get('outlet') or 'Source', 'url': LINKS.get(s['url'], s['url']), 'title': s.get('title') or '', 'date': s.get('date')} for s in raw.get('sources') or [] if s.get('url')]
        seen_urls = set(); sources = [x for x in sources if not (x['url'] in seen_urls or seen_urls.add(x['url']))]
        if not sources: dropped.append((os.path.basename(path), raw.get('date'), municipality, 'no source', raw.get('title'))); continue
        records.append({'date': raw['date'], 'type': GROUP.get(fine, 'other'), 'kind': KIND.get(fine, 'Other'), 'title': (raw.get('title') or '').strip(), 'summary': (raw.get('summary') or '').strip(),
                        'province': province, 'municipality': municipality, 'barangay': barangay, 'deaths': raw.get('deaths'), 'injured': raw.get('injured'), 'missing': raw.get('missing'),
                        'vehicles': raw.get('vehicles') or [], 'lat': lat, 'lon': lon, 'placed': placed, 'sources': sources, '_file': os.path.basename(path)})

# One incident once: same town, same group, dates within two days, and either a similar headline or the same death toll —
# except for shootings, where one dead is the usual toll and only the headline can tell two apart.
def day(d):
    y, m, *rest = d.split('-'); return date(int(y), int(m), int(rest[0]) if rest else 15).toordinal()
# A month-only date is within reach of any day of that month; two full dates must be within two days.
def near(a, b): return a[:7] == b[:7] if len(a) == 7 or len(b) == 7 else abs(day(a) - day(b)) <= 2
def latest(r): return max((s['date'] or '') for s in r['sources'])
merged = []
for r in sorted(records, key=lambda r: r['date']):
    for m in merged:
        if m['province'] == r['province'] and m['municipality'] == r['municipality'] and m['type'] == r['type'] and near(m['date'], r['date']) and (similar(m, r) or (m['deaths'] and m['deaths'] == r['deaths'] and r['type'] != 'shooting')):
            print('merge:', r['date'], r['municipality'], '|', r['title'][:60], '<=', m['title'][:60], file=sys.stderr)
            seen = {s['url'] for s in m['sources']}; m['sources'] += [s for s in r['sources'] if s['url'] not in seen]
            for k in ('deaths', 'injured'):
                if r[k] is not None and (m[k] is None or r[k] > m[k]): m[k] = r[k]
            # The missing fall as bodies are found, so the later report wins, not the larger figure.
            if r['missing'] is not None and (m['missing'] is None or latest(r) >= latest(m)): m['missing'] = r['missing']
            if len(r['summary']) > len(m['summary']): m['summary'] = r['summary']
            if len(r['date']) > len(m['date']): m['date'] = r['date']
            if r['placed'] == 'barangay' and m['placed'] != 'barangay': m.update(lat=r['lat'], lon=r['lon'], placed='barangay', barangay=r['barangay'])
            m['vehicles'] = sorted(set(m['vehicles']) | set(r['vehicles']))
            break
    else:
        merged.append(r)

def assign_ids(rows):
    counts = {}
    for r in sorted(rows, key=lambda r: r['date'], reverse=True):
        base = f"{r['date']}-{slug(r['municipality'] or r['province'])}-{r['type']}"
        counts[base] = counts.get(base, 0) + 1
        r['id'] = base if counts[base] == 1 else f'{base}-{counts[base]}'
assign_ids(merged)

# The enrichment: patches keyed by a record's id, applied file by file in name order. An earlier patch can move a
# record's date or town and so its id, so each record remembers every id it has carried, and a later file's patch
# keyed by the newer id still finds it.
for r in merged: r['_ids'] = {r['id']}
patched, dropped_by_patch = 0, []
def apply(r, patch):
    if patch.get('municipality'):
        town = resolve_town(patch['municipality'], patch.get('province') or r['province'])
        if town:
            r['municipality'], r['province'] = town
            centre = CENTRE[town[1], town[0]]
            r.update(lat=centre[0], lon=centre[1], placed='municipality')
        else: print('  patch names an unknown town:', patch['municipality'], 'for', r['id'], file=sys.stderr)
    for k in ('date', 'title', 'summary', 'deaths', 'injured', 'missing', 'vehicles', 'image'):
        if patch.get(k) is not None: r[k] = patch[k]
    # A source a later look found to be about a different incident comes off.
    wrong = set(patch.get('wrong_sources') or [])
    if wrong: r['sources'] = [s for s in r['sources'] if s['url'] not in wrong]
    barangay = patch.get('barangay') or (r['barangay'] if patch.get('municipality') else None)
    if barangay and r['municipality'] and (r['placed'] != 'barangay' or barangay != r['barangay']):
        r['barangay'] = barangay
        hit = geocode_barangay(re.sub(r'^(brgy\.?|barangay)\s*', '', barangay, flags=re.I), r['municipality'], r['province'], CENTRE[(r['province'], r['municipality'])])
        if hit: r.update(lat=hit['lat'], lon=hit['lon'], placed='barangay')
    seen = {s['url'] for s in r['sources']}
    r['sources'] += [s for s in patch.get('sources') or [] if s.get('url') and s['url'] not in seen and not seen.add(s['url'])]
for path in sorted(glob.glob(os.path.join(ROOT, 'enrichment', '*.json'))):
    patches = {}
    for patch in json.load(open(path)): patches.setdefault(patch['id'], []).append(patch)
    for r in list(merged):
        for pid in [i for i in patches if i in r['_ids']]:
            for patch in patches.pop(pid):
                patched += 1
                # A later report can drop a record — outside the region, a duplicate, not an incident.
                if patch.get('drop'):
                    merged.remove(r); dropped.append(('enrichment', r['date'], r['municipality'], 'dropped by patch', r['title'])); break
                apply(r, patch)
            else: continue
            break
    for pid in patches: print('  patch matches no record:', pid, 'in', os.path.basename(path), file=sys.stderr)
    assign_ids(merged)
    for r in merged: r['_ids'].add(r['id'])
for r in merged: r.pop('_ids', None); r.pop('_file', None)
if patched: print(f'{patched} patches applied from enrichment/', file=sys.stderr)
json.dump(CACHE, open(CACHE_PATH, 'w'), indent=1, ensure_ascii=False)
merged.sort(key=lambda r: r['date'], reverse=True)

out = {
    'name': 'Accidents in BARMM, as reported',
    'generatedAt': date.today().isoformat(),
    'since': min(r['date'][:4] for r in merged) if merged else '2019',
    'note': 'Compiled from news reports: the outlets’ own sites, Google News’s index of them, and public Facebook posts that index carried. One record per incident, every report linked. Nobody publishes a register of accidents in the region, so this is what was reported in English or Filipino and indexed, and only that: a crash nobody wrote up is not here, and a town whose news lives only on Facebook is under-counted.',
    'sources': {'reports': 'datasets/accidents/reports/', 'enrichment': 'datasets/accidents/enrichment/', 'centres': 'datasets/accidents/municipality-centres.json', 'barangays': 'datasets/accidents/barangay-centres.json'},
    'incidents': merged,
}
json.dump(out, open(os.path.join(ROOT, 'accidents.json'), 'w'), indent=1, ensure_ascii=False)
print(f'{len(merged)} incidents from {len(records)} records; {len(dropped)} dropped', file=sys.stderr)
for d in dropped: print('  dropped:', *d, file=sys.stderr)
