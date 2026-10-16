"""Google News RSS sweep for BARMM accident coverage. One request every ~1.3 s, generic User-Agent.
Writes one JSON line per item: {q, title, link, source, pubDate, description}.

    python3 -I gnews_crawl.py OUT.jsonl              # accidents, 2019 on
    python3 -I gnews_crawl.py OUT.jsonl --shootings  # shootings, 2025 on, half-year windows
"""
import json, re, sys, time, urllib.parse, urllib.request, html

OUT = sys.argv[1]
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

G_ROAD = '(accident OR crash OR collision OR "road mishap" OR "hit-and-run" OR aksidente OR nabangga OR banggaan OR bumaligtad OR "run over")'
G_WATER_FIRE = '(capsized OR capsizes OR sank OR sinks OR drowned OR drowning OR motorbanca OR "boat" OR fire OR blaze OR razed OR gutted OR nasunog OR sunog OR nalunod OR lumubog)'
G_OTHER = '(explosion OR exploded OR LPG OR electrocuted OR electrocution OR lightning OR landslide OR "flash flood" OR flooding OR "food poisoning" OR collapsed OR firecracker OR pumutok OR "fell" OR mishap)'
G_SHOOTING = '(shot OR shooting OR gunmen OR gunman OR "shot dead" OR "gunned down" OR ambush OR ambushed OR strafing OR strafed OR binaril OR pinagbabaril OR pamamaril)'
SHOOTINGS = '--shootings' in sys.argv
GROUPS = [G_SHOOTING] if SHOOTINGS else [G_ROAD, G_WATER_FIRE, G_OTHER]

PROVINCES = ['"Cotabato City"', 'Maguindanao', '"Lanao del Sur"', 'Marawi', 'Basilan', '"Tawi-Tawi"', '(BARMM OR Bangsamoro)']
TOWNS = ['"Datu Odin Sinsuat"', '"Parang, Maguindanao"', '"Sultan Kudarat, Maguindanao"', '"Upi, Maguindanao"', 'Kabuntalan', '"Buluan"', '"Shariff Aguak"', '"Datu Piang"', '"Pagalungan"', '"Datu Paglas"', '"South Upi"', '"Ampatuan"', '"Mamasapano"', '"Malabang"', '"Wao, Lanao"', '"Balabagan"', '"Marantao"', '"Saguiaran"', '"Lake Lanao"', '"Lamitan"', '"Maluso"', '"Sumisip"', '"Tipo-Tipo"', '"Bongao"', '"Sitangkai"', '"Panglima Sugala"', '"Mapun"', '"Simunul"', '"Languyan"', '"Polloc"', '"Awang"', '"Kusiong"', '"Pikit"']
YEARS = list(range(2025, 2027)) if SHOOTINGS else list(range(2019, 2027))
# Shootings are frequent enough that a year of one province overruns the feed's 100 items, so they go by half-years.
PERIODS = [(f'{y}-01-01', f'{y}-07-01') for y in YEARS] + [(f'{y}-07-01', f'{y+1}-01-01') for y in YEARS] if SHOOTINGS else [(f'{y}-01-01', f'{y+1}-01-01') for y in YEARS]

def rss(q):
    url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': q, 'hl': 'en-PH', 'gl': 'PH', 'ceid': 'PH:en'})
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(20 * (attempt + 1)); continue
            print('HTTP', e.code, q, file=sys.stderr); return ''
        except Exception as e:
            print('ERR', e, q, file=sys.stderr); time.sleep(5)
    return ''

def tag(item, name):
    m = re.search(rf'<{name}[^>]*>(.*?)</{name}>', item, re.S)
    return html.unescape(re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', m.group(1), flags=re.S)).strip() if m else ''

def items(xml):
    for it in re.findall(r'<item>(.*?)</item>', xml, re.S):
        yield {'title': tag(it, 'title'), 'link': tag(it, 'link'), 'pubDate': tag(it, 'pubDate'), 'source': tag(it, 'source'), 'description': re.sub(r'<[^>]+>', ' ', tag(it, 'description'))[:300]}

queries = []
for place in PROVINCES:
    for g in GROUPS:
        for a, b in PERIODS:
            queries.append(f'{place} {g} after:{a} before:{b}')
ALL = '(accident OR crash OR capsized OR sank OR drowned OR fire OR explosion OR electrocuted OR landslide OR aksidente OR nasunog OR nalunod OR lumubog OR nabangga)'
for town in TOWNS:
    for a, b in (((2025, 2027),) if SHOOTINGS else ((2019, 2023), (2023, 2027))):
        queries.append(f'{town} {G_SHOOTING if SHOOTINGS else ALL} after:{a}-01-01 before:{b}-01-01')

seen = set()
n = 0
with open(OUT, 'a') as f:
    for i, q in enumerate(queries):
        xml = rss(q)
        got = 0
        for it in items(xml):
            if not it['title'] or it['link'] in seen: continue
            seen.add(it['link']); it['q'] = q
            f.write(json.dumps(it, ensure_ascii=False) + '\n'); got += 1; n += 1
        f.flush()
        print(f'{i+1}/{len(queries)} +{got} total {n} | {q[:70]}', file=sys.stderr)
        time.sleep(1.3)
print('done', n)
