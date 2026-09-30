#!/usr/bin/env python3
"""Write datasets/lgu/area-spending.json — what the Bangsamoro Government
appropriated for construction in each area, year by year.

This is NOT a local government unit's own budget. Nothing published anywhere
holds those: a town's appropriation is in its own ordinance and neither MILG
nor the region collects them. What this is instead is the other direction —
regional money landing in a place, read off the itemised infrastructure
projects in the seven enacted Acts, which are the one part of a budget that
carries a location at all.

Two things make it harder than summing a column:

  The region was redrawn inside the span. Maguindanao I and II become
  Del Norte and Del Sur, Lanao del Sur is printed as one province and as two
  districts in different years, Sulu stops appearing after FY 2022 when the
  Supreme Court removed it, and the Special Geographic Area is named two ways.
  Each Act's own spelling is kept in `printedAs` so a figure can be traced back
  to the page it came from.

  FY 2023 tagged almost nothing. That Act names a province on 3 areas where the
  others name 7 to 10, so its row is mostly blank — a gap in what was printed,
  not a year nothing was built. The page says so rather than drawing a zero.

    python3 datasets/lgu/scripts/build_area_spending.py
"""
import json, glob, pathlib, re, collections

# Every spelling the seven Acts use, mapped onto the area as it stands now.
# The Maguindanao split followed the two legislative districts, so district I
# becomes Del Norte and II becomes Del Sur.
AS_IT_STANDS = {
    'Maguindanao I': 'Maguindanao del Norte',
    'Maguindanao Del Norte': 'Maguindanao del Norte',
    'Maguindanao Ii': 'Maguindanao del Sur',
    'Maguindanao Del Sur': 'Maguindanao del Sur',
    'Lanao I': 'Lanao del Sur',
    'Lanao Ii': 'Lanao del Sur',
    'Lanao Del Sur I': 'Lanao del Sur',
    'Lanao Del Sur Ii': 'Lanao del Sur',
    'Basilan': 'Basilan',
    'Tawi-tawi': 'Tawi-Tawi',
    'Sulu I': 'Sulu',
    'Sulu Ii': 'Sulu',
    'Cotabato City': 'Cotabato City',
    'Special Geographic Area': 'Special Geographic Area',
    'Special Geographic Area (63 Barangays)': 'Special Geographic Area',
}

# Sulu was removed from the region by the Supreme Court in 2024 and stops
# appearing in the Acts; it is kept with that said rather than dropped, because
# a reader looking for the years it was funded should find them.
LEFT = {'Sulu': 'Removed from BARMM by the Supreme Court; last appears in the FY 2022 Act.'}

years = list(range(2020, 2027))
totals = collections.defaultdict(lambda: collections.defaultdict(float))
counts = collections.defaultdict(lambda: collections.defaultdict(int))
printed = collections.defaultdict(set)
unmapped = set()

for fy in years:
    path = glob.glob(f'datasets/budget/BAA*_FY{fy}_line_items.json')[0]
    for row in json.load(open(path))['line_items']:
        if row['item_type'] != 'infrastructure_project':
            continue
        raw = row.get('province')
        if not raw:
            continue
        area = AS_IT_STANDS.get(raw)
        if not area:
            unmapped.add(raw)
            continue
        totals[area][fy] += row['amount'] or 0
        counts[area][fy] += 1
        printed[area].add(raw)

if unmapped:
    raise SystemExit(f'an Act names an area this script has no mapping for: {sorted(unmapped)}')

areas = []
for area in sorted(totals, key=lambda a: -sum(totals[a].values())):
    areas.append({
        'name': area,
        'printedAs': sorted(printed[area]),
        'note': LEFT.get(area),
        'total': round(sum(totals[area].values()), 2),
        'years': {str(fy): {'amount': round(totals[area].get(fy, 0.0), 2),
                            'projects': counts[area].get(fy, 0)} for fy in years},
    })

# A year where the Acts tagged almost nothing is a gap in the record, and the
# page has to be able to say which years those are rather than drawing a floor.
tagged = {str(fy): sum(1 for a in areas if a['years'][str(fy)]['projects']) for fy in years}

out = {
    'name': 'Bangsamoro construction appropriated into each area, FY 2020 to FY 2026',
    'generatedAt': __import__('datetime').date.today().isoformat(),
    'note': (
        'The itemised infrastructure projects of the seven enacted Bangsamoro Acts, '
        'summed by the area each one names. This is regional money spent in a place, '
        'not that place’s own budget — a local government unit’s appropriation is in '
        'its own ordinance and is not published centrally by anyone. Areas are '
        'reconciled to their present names; every spelling the Acts used is kept.'
    ),
    'years': years,
    'areasTaggedPerYear': tagged,
    'areas': areas,
}

dest = pathlib.Path(__file__).resolve().parents[1] / 'area-spending.json'
dest.write_text(json.dumps(out, indent='\t', ensure_ascii=False) + '\n')
print(f'{len(areas)} areas -> {dest}')
print('areas tagged per year:', tagged)
print(f'{dest.stat().st_size/1024:.0f} KB')
