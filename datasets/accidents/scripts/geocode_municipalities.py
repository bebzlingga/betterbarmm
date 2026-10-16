"""Municipality centres for BARMM from Nominatim (OSM). One request per second, generic User-Agent."""
import json, sys, time, urllib.parse, urllib.request

src, out = sys.argv[1], sys.argv[2]
UA = 'BetterBARMM-map/1.0 (accident map build)'

def nominatim(q):
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': q, 'format': 'jsonv2', 'limit': 5, 'countrycodes': 'ph', 'addressdetails': 1})
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

ADMIN = {'municipality', 'city', 'town', 'administrative', 'village'}

def pick(results, name):
    for r in results:
        if r.get('class') == 'boundary' and r.get('addresstype') in ADMIN:
            return r
    for r in results:
        if r.get('addresstype') in ADMIN or r.get('type') in ADMIN:
            return r
    return results[0] if results else None

data = json.load(open(src))
rows = []
for p in data['provinces']:
    for m in p['municipalities']:
        name = m['name']
        label = f"{name} City" if m.get('isCity') and not name.endswith('City') else name
        prov = p['name']
        # OSM may still file the two Maguindanaos under the old province.
        queries = [f"{label}, {prov}, Philippines"]
        if prov.startswith('Maguindanao'):
            queries.append(f"{label}, Maguindanao, Philippines")
        if prov == 'Special Geographic Area':
            queries = [f"{label}, Cotabato, Philippines", f"{label}, Bangsamoro, Philippines"]
        if prov == 'Cotabato City':
            queries = ["Cotabato City, Philippines"]
        hit = None
        for q in queries:
            try:
                res = nominatim(q)
            except Exception as e:
                print('ERR', q, e, file=sys.stderr); res = []
            time.sleep(1.1)
            hit = pick(res, name)
            if hit: break
        rows.append({'province': prov, 'municipality': name, 'slug': m['slug'], 'psgc': m['psgc'],
                     'lat': round(float(hit['lat']), 4) if hit else None, 'lon': round(float(hit['lon']), 4) if hit else None,
                     'matched': hit.get('display_name') if hit else None, 'addresstype': hit.get('addresstype') if hit else None})
        print(prov, '|', name, '->', rows[-1]['lat'], rows[-1]['lon'], '|', (hit or {}).get('display_name'), file=sys.stderr)
json.dump(rows, open(out, 'w'), indent=1, ensure_ascii=False)
print('wrote', len(rows), 'missing', sum(1 for r in rows if r['lat'] is None))
