#!/usr/bin/env python3
"""Write datasets/travel/cities/<slug>.json — a city's travel guide: where
to sleep, where and what to eat, what to see, events, practical tips, and
the essentials (banks, hospitals, terminals) — with map coordinates.

Two inputs:
  - research/<slug>-stay.json, -food.json, -see.json: sourced listings
    compiled from booking sites, Wikivoyage, blogs, news and the places'
    own pages. Every entry names the pages it came from.
  - OpenStreetMap, read live through the Overpass API: coordinates for the
    listings, the places OpenStreetMap knows that the research did not, and
    the essentials. © OpenStreetMap contributors, ODbL.

A listing is matched to OpenStreetMap by name. National fast-food chains
are folded into one line rather than listed branch by branch.

    python3 datasets/travel/scripts/build_city.py cotabato-city
"""
import json, pathlib, re, sys, unicodedata, urllib.parse, urllib.request
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[3]
CITIES = ROOT / 'datasets/travel/cities'
CONFIG = {
    'cotabato-city': {'name': 'Cotabato City', 'osm_area': 'area["name"~"^Cotabato( City)?$"]["admin_level"~"6|7"]->.c;'},
}
CHAINS = ['jollibee', 'mcdonald', 'chowking', 'mang inasal', 'greenwich', 'minute burger', 'potato corner', 'dunkin',
          'chooks to go', 'bee stop', 'kfc', '7-eleven', 'red ribbon', 'goldilocks', 'infinitea', 'ragus', 'shakey', 'max\'s',
          'razon', 'choobi']
# OpenStreetMap tags these as food; they are not places a visitor goes to eat.
NOT_EATERIES = re.compile(r'store|institute|catering|convention|canteen|cafeteria|university|boardwalk', re.I)
ESSENTIAL_KINDS = {
    'amenity=bank': 'Bank', 'amenity=atm': 'ATM', 'amenity=money_transfer': 'Remittance', 'amenity=hospital': 'Hospital',
    'amenity=clinic': 'Clinic', 'amenity=pharmacy': 'Pharmacy', 'amenity=bus_station': 'Terminal',
    'amenity=ferry_terminal': 'Ferry terminal', 'shop=mall': 'Mall', 'shop=department_store': 'Mall',
    'shop=supermarket': 'Supermarket', 'amenity=police': 'Police', 'aeroway=aerodrome': 'Airport',
    'amenity=marketplace': 'Market',
}
OSM_EAT = {'amenity=restaurant': 'restaurant', 'amenity=cafe': 'cafe', 'amenity=fast_food': 'restaurant',
           'amenity=food_court': 'foodpark', 'shop=bakery': 'bakery'}
OSM_STAY = {'tourism=hotel': 'hotel', 'tourism=guest_house': 'guesthouse', 'tourism=motel': 'inn',
            'tourism=hostel': 'guesthouse', 'tourism=apartment': 'apartment'}


def norm(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)', ' ', s)  # "Pedro Colina Hill (PC Hill)"
    s = re.sub(r"['’]", '', s)
    s = re.sub(r'\b(hotel|inn|pension( house)?|restaurant|resto|cafe|the|and|of|cotabato( city)?|branch)\b', ' ', s)
    return ' '.join(re.sub(r'[^a-z0-9]+', ' ', s).split())


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()).strip('-')[:60]


def overpass(area):
    q = f"""[out:json][timeout:120];{area}
(nwr(area.c)["tourism"];nwr(area.c)["amenity"~"^(restaurant|cafe|fast_food|food_court|marketplace|bank|atm|money_transfer|hospital|clinic|pharmacy|bus_station|ferry_terminal|police|place_of_worship)$"];nwr(area.c)["shop"~"mall|supermarket|department_store|bakery"];
 nwr(area.c)["aeroway"="aerodrome"];nwr(area.c)["leisure"="park"];nwr(area.c)["historic"];);out center tags;"""
    # The public Overpass servers are busy; a timeout on one is tried on the next.
    for server in ('https://overpass-api.de', 'https://overpass.kumi.systems', 'https://overpass.private.coffee'):
        req = urllib.request.Request(f'{server}/api/interpreter', data=urllib.parse.urlencode({'data': q}).encode(),
                                     headers={'User-Agent': 'BetterBARMM/1.0 (support@betterbarmm.com)', 'Accept': 'application/json'})
        try:
            elements = json.load(urllib.request.urlopen(req, timeout=180))['elements']
            break
        except Exception as error:
            print(f'{server}: {error}', file=sys.stderr)
    else:
        sys.exit('no Overpass server answered')
    out = []
    for e in elements:
        t = e.get('tags', {})
        if not t.get('name'):
            continue
        kind = next((f'{k}={t[k]}' for k in ('tourism', 'amenity', 'shop', 'aeroway', 'leisure', 'historic') if k in t), None)
        out.append({'osm': f"{e['type']}/{e['id']}", 'name': t['name'].strip(), 'kind': kind,
                    'lat': e.get('lat') or e.get('center', {}).get('lat'), 'lon': e.get('lon') or e.get('center', {}).get('lon'),
                    'tags': t})
    return out


def match(name, pois, kinds):
    """The OpenStreetMap entry for a listing, by name: exact after
    normalising, else one name wholly containing the other."""
    n = norm(name)
    if not n:
        return None
    cands = [p for p in pois if p['kind'] in kinds]
    for p in cands:
        if norm(p['name']) == n:
            return p
    for p in cands:
        m = norm(p['name'])
        if m and len(min(m, n, key=len)) >= 5 and (m in n or n in m):
            return p
    return None


def main(city):
    cfg = CONFIG[city]
    research = CITIES / 'research'
    stay = json.load(open(research / f'{city}-stay.json'))
    food = json.load(open(research / f'{city}-food.json'))
    see = json.load(open(research / f'{city}-see.json'))
    pois = overpass(cfg['osm_area'])
    used = set()

    def place(item, kinds, extra):
        p = match(item['name'], pois, kinds)
        if p:
            used.add(p['osm'])
        return {
            'id': slug(item['name']), 'name': item['name'], 'kind': item.get('kind') or 'other',
            'area': item.get('area'), 'note': item.get('note', ''),
            'lat': p['lat'] if p else item.get('lat'), 'lon': p['lon'] if p else item.get('lon'),
            'website': item.get('website'), 'sources': item.get('sources', []), 'status': item.get('status', 'open'),
            **extra(item),
        }

    stays = [place(s, OSM_STAY, lambda s: {'onBookingSites': bool(s.get('onBookingSites'))}) for s in stay if s.get('status') != 'closed']
    eats = [place(e, OSM_EAT, lambda e: {'halal': e.get('halal')}) for e in food['eat'] if e.get('status') != 'closed']
    sees = [place(s, {k for k in {p['kind'] for p in pois} if k}, lambda s: {'photo': s.get('photo')}) for s in see['see'] if s.get('status') != 'closed']

    def osm_only(kinds, label, extra):
        out = []
        for p in pois:
            if p['kind'] not in kinds or p['osm'] in used:
                continue
            if any(c in p['name'].lower() for c in CHAINS) or NOT_EATERIES.search(p['name']):
                continue
            # A second branch, or a place the research already lists under a variant name.
            if any(norm(p['name']) == norm(x['name']) for x in out + eats):
                continue
            used.add(p['osm'])
            t = p['tags']
            cuisine = t.get('cuisine', '').replace(';', ', ').replace('_', ' ')
            out.append({
                'id': slug(p['name']) + '-' + p['osm'].split('/')[1][-4:], 'name': p['name'], 'kind': kinds[p['kind']],
                'area': t.get('addr:street'), 'note': f'{label}{f" Serves {cuisine}." if cuisine else ""}',
                'lat': p['lat'], 'lon': p['lon'], 'website': t.get('website') or t.get('contact:facebook'),
                'sources': [{'label': 'OpenStreetMap', 'url': f"https://www.openstreetmap.org/{p['osm']}"}], 'status': 'unclear',
                **extra(t),
            })
        return out

    # Lodging on OpenStreetMap alone is not added: the research checked each
    # one, and the ones it could not confirm were often not lodging at all.
    eats += osm_only(OSM_EAT, 'On OpenStreetMap; not yet described by a source this guide found.',
                     lambda t: {'halal': True if t.get('diet:halal') in ('yes', 'only') else None})

    # The research names the chains as they write themselves; OpenStreetMap's are a fallback.
    chains = food.get('chains') or sorted({c.title() for p in pois if p['kind'] in OSM_EAT for c in CHAINS if c in p['name'].lower()})
    essentials = [{'id': p['osm'].replace('/', '-'), 'name': p['name'], 'kind': ESSENTIAL_KINDS[p['kind']], 'lat': p['lat'], 'lon': p['lon']}
                  for p in pois if p['kind'] in ESSENTIAL_KINDS]

    # The same name twice (a chain's two branches, a listing found twice) keeps its first.
    def dedupe(items):
        seen, out = set(), []
        for i in items:
            if i['id'] in seen:
                i['id'] += '-2'
            seen.add(i['id'])
            out.append(i)
        return out

    out = {
        'slug': city, 'name': cfg['name'], 'generatedAt': date.today().isoformat(),
        'note': 'Listings from booking sites, Wikivoyage, news, blogs and the places’ own pages, each with the pages that name it; map positions and the essentials from OpenStreetMap (© OpenStreetMap contributors, ODbL). Entries marked "unclear" are on OpenStreetMap but no other source this guide found describes them. No rates, phone numbers or ratings: they change faster than a guide can follow.',
        'stay': dedupe(stays), 'eat': dedupe(eats), 'see': dedupe(sees),
        'dishes': food.get('dishes', []), 'events': see.get('events', []), 'practical': see.get('practical', []),
        'essentials': essentials, 'chains': chains,
    }
    (CITIES / f'{city}.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    located = lambda xs: sum(1 for x in xs if x['lat'])
    print(f"stay {len(out['stay'])} ({located(out['stay'])} on map), eat {len(out['eat'])} ({located(out['eat'])}), "
          f"see {len(out['see'])} ({located(out['see'])}), dishes {len(out['dishes'])}, events {len(out['events'])}, "
          f"tips {len(out['practical'])}, essentials {len(essentials)}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'cotabato-city')
