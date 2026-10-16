"""The region's outline for the accident map: BARMM's provinces as GeoJSON, in longitude and latitude.

The same source the LGU directory draws from (faeldon/philippines-json-maps, PSA's PSGC
boundaries, 2023 edition, low resolution), at the region level, with Sulu left out — it
left the region in 2024 — and the Special Geographic Area named, since the source leaves
it nameless. Coordinates are rounded to four decimals, about 11 metres.

    python3 -I datasets/accidents/scripts/region_outline.py
"""
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'barmm-outline.json')
URL = 'https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/regions/lowres/provdists-region-1900000000.0.001.json'

def rounded(c): return [rounded(x) for x in c] if isinstance(c[0], list) else [round(c[0], 4), round(c[1], 4)]

with urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60) as r: source = json.load(r)
features = []
for f in source['features']:
    name = f['properties'].get('adm2_en') or 'Special Geographic Area'
    if name == 'Sulu': continue
    features.append({'type': 'Feature', 'properties': {'name': name}, 'geometry': {'type': f['geometry']['type'], 'coordinates': rounded(f['geometry']['coordinates'])}})
json.dump({'type': 'FeatureCollection', 'features': features}, open(OUT, 'w'), separators=(',', ':'))
print(len(features), 'areas,', os.path.getsize(OUT) // 1024, 'KB')

if __name__ == '__main__':
    # The check this leaves: every town centre in the directory falls inside the outline, Cotabato City included.
    def inside(pt, ring):
        x, y, hit = pt[0], pt[1], False
        for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: hit = not hit
        return hit
    def polys(g): return [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    centres = json.load(open(os.path.join(HERE, '..', 'municipality-centres.json')))['centres']
    out = [c['municipality'] for c in centres if not any(inside((c['lon'], c['lat']), p[0]) for f in features for p in polys(f['geometry']))]
    print('town centres outside the outline:', out or 'none')
