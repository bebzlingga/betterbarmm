#!/usr/bin/env python3
"""Write datasets/lgu/barangay-population.json — PSA's 2024 census count for
each barangay the directory lists, keyed "<area>/<town>" and then by the
barangay's own key in barmm-lgu.json (its PSGC code, or its name where it has
none, as the barangay officials are keyed).

The counts are datasets/preparedness/population.json, which is keyed by the
current 10-digit PSGC. The directory files barangays under the older 9-digit
codes, and Maguindanao's split and Cotabato City renumbered theirs, so the
code alone misses a third of them. Each town is found by name in the hazard
table's barangay list (datasets/preparedness/exposure.json, which names every
barangay's town), and each barangay inside it by the last seven digits of its
code, then by name. A barangay neither finds is left out and counted in
"unmatched".

    python3 -I datasets/lgu/scripts/build_barangay_population.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/lgu/barangay-population.json'
lgu = json.loads((ROOT / 'datasets/lgu/barmm-lgu.json').read_text())
counts = json.loads((ROOT / 'datasets/preparedness/population.json').read_text())
exposure = json.loads((ROOT / 'datasets/preparedness/exposure.json').read_text())['barangays']

town = lambda s: re.sub(r'[^a-z0-9]', '', re.sub(r'\bcity of\b|\bcity\b', '', (s or '').lower()))
place = lambda s: re.sub(r'[^a-z0-9]', '', re.sub(r'\(pob\.?\)|poblacion', '', s.lower()))

towns = {}
for b in exposure:
    towns.setdefault((b['prov'], town(b['town'])), []).append(b)

units, unmatched = {}, []
for area in lgu['provinces']:
    for unit in area['municipalities']:
        listed = towns.get((area['slug'], town(unit['name'])), [])
        by_code = {b['psgc'][-7:]: b['psgc'] for b in listed}
        by_name = {place(b['name']): b['psgc'] for b in listed}
        found = {}
        for b in unit['barangays']:
            code = by_code.get((b['psgc'] or 'none')[-7:]) or by_name.get(place(b['name']))
            n = counts['population'].get(code) if code else None
            if n is None:
                unmatched.append(f"{area['slug']}/{unit['slug']}: {b['name']}")
            else:
                found[b['psgc'] or b['name']] = n
        units[f"{area['slug']}/{unit['slug']}"] = found

OUT.write_text(json.dumps({
    'name': 'Population of BARMM barangays, 2024, by town',
    'generatedAt': counts['generatedAt'],
    'source': counts['source'],
    'note': f"PSA's 2024 census count for {sum(len(u) for u in units.values())} of the directory's "
            f"{sum(len(u['barangays']) for a in lgu['provinces'] for u in a['municipalities'])} barangays. "
            "The rest are spelled or filed under another town in the newer PSGC, or (three in Marawi) not in it.",
    'unmatched': unmatched,
    'units': units,
}, ensure_ascii=False, indent=1) + '\n')
print(f'wrote {OUT.relative_to(ROOT)}: {len(unmatched)} unmatched')
