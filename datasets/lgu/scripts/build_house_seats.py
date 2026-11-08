#!/usr/bin/env python3
"""Write datasets/lgu/house-seats.json — each BARMM town's seat in the House
of Representatives for the 2025–2028 term, as canvassed in May 2025.

From OpenHalalan's vote counts (see fetch_officials_history.py, whose cached
download this reuses). Each House row names the town the votes were cast in
and its district, so the districts are summed from the towns and every town
is placed in the district it voted in.

Five towns have no 2025 House rows in the source. Four are placed by their
2022 rows (Lanao del Sur's districts did not change between the two):
Balindong and Madamba in the Second, Lumba-Bayabao and Tagoloan II in the
First. Datu Salibo is in Maguindanao del Sur, which is one district.

The Special Geographic Area's towns are left out: the source has no House
rows for them, and they are not in any BARMM district.

    python3 -I datasets/lgu/scripts/build_house_seats.py
"""
import collections, csv, gzip, io, json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from fetch_officials_history import ROOT, VOTES, fetch

OUT = ROOT / 'datasets/lgu/house-seats.json'
lgu = json.loads((ROOT / 'datasets/lgu/barmm-lgu.json').read_text())

# The source's town names, where they are not the directory's.
TOWN = {'COTABATO': 'Cotabato City', 'TAGOLOAN': 'Tagoloan II'}
PLACED = {('LANAO DEL SUR', 'BALINDONG'): 'SECOND', ('LANAO DEL SUR', 'MADAMBA'): 'SECOND',
          ('LANAO DEL SUR', 'LUMBA BAYABAO'): 'FIRST', ('LANAO DEL SUR', 'TAGOLOAN II'): 'FIRST',
          ('MAGUINDANAO DEL SUR', 'DATU SALIBO'): 'LONE'}
ORDINAL = {'LONE': 'Lone district', 'FIRST': '1st district', 'SECOND': '2nd district'}
fold = lambda s: re.sub(r'[^A-Z]', '', s.upper().replace('CITY OF', '').replace(' CITY', ''))

votes = collections.defaultdict(collections.Counter)
parties, district_of = {}, {(province, fold(town)): district for (province, town), district in PLACED.items()}
for r in csv.DictReader(io.TextIOWrapper(gzip.open(io.BytesIO(fetch(VOTES))), encoding='utf-8')):
    if r['year'] != '2025' or r['region'] != 'BARMM' or r['position'] != 'MEMBER, HOUSE OF REPRESENTATIVES':
        continue
    seat = (r['province'], r['district'])
    votes[seat][r['candidate_name']] += int(r['votes'] or 0)
    parties[r['candidate_name']] = r['party'] or None
    district_of[(r['province'], fold(TOWN.get(r['city'], r['city'])))] = r['district']

districts = {}
# The winner only: the source's 2025 rows miss four Lanao del Sur towns, so
# its district totals are short and are not published as a canvass.
for (province, district), tally in votes.items():
    name = tally.most_common(1)[0][0]
    slug = province.lower().replace(' ', '-')
    districts[f'{slug}:{district.lower()}'] = {
        'province': next(area['name'] for area in lgu['provinces'] if area['slug'] == slug),
        'district': ORDINAL[district],
        'name': name,
        'party': parties[name],
    }

units, missing = {}, []
for area in lgu['provinces']:
    # Cotabato City's House votes are filed under Maguindanao del Norte.
    province = 'MAGUINDANAO DEL NORTE' if area['slug'] == 'cotabato-city' else area['name'].upper().replace('-', ' ')
    for unit in area['municipalities']:
        district = district_of.get((province, fold(unit['name'])))
        key = f"{area['slug']}/{unit['slug']}"
        if district:
            units[key] = f"{province.lower().replace(' ', '-')}:{district.lower()}"
        elif area['kind'] != 'Special area':
            missing.append(key)
assert not missing, missing
assert all(seat in districts for seat in units.values())

OUT.write_text(json.dumps({
    'name': 'BARMM seats in the House of Representatives, 2025–2028',
    'term': '2025-2028',
    'source': {'label': 'OpenHalalan, from COMELEC’s 2025 canvass', 'href': 'https://robertrleung.github.io/OpenHalalan/'},
    'note': 'The winner of each district. Each town is placed in the district its House votes were cast in. Balindong, Madamba, Lumba-Bayabao '
            'and Tagoloan II have no 2025 House rows in the source and are placed by their 2022 rows. The Special '
            'Geographic Area is not in any BARMM district.',
    'districts': dict(sorted(districts.items())),
    'units': units,
}, ensure_ascii=False, indent=1) + '\n')
print(f'wrote {OUT.relative_to(ROOT)}: {len(districts)} districts, {len(units)} towns')
