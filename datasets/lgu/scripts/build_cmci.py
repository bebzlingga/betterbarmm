#!/usr/bin/env python3
"""Write datasets/lgu/cmci.json — DTI's Cities and Municipalities
Competitiveness Index (CMCI) for each BARMM province, city and
municipality, editions 2020 to the latest published: overall score and rank
within its category, and the five pillar scores and ranks (Economic
Dynamism, Government Efficiency, Infrastructure, Resiliency, Innovation).

The bulk source is the rankings page, one per category per edition, whose
table carries every ranked LGU with its five pillars:

    https://cmci.dti.gov.ph/rankings-data.php?unit=<category>&year=<edition>

Six categories × each edition. Provinces get only an overall score: CMCI
computes it as the population- and income-weighted average of its cities'
and towns' overall scores, and publishes no provincial pillar scores.

Rows are kept only where the table's Region column says BARMM, then matched
to the directory by name (sre.norm, with CMCI's "(LS)"-style province tags
dropped). Sulu is left out. Pre-split "Maguindanao" province rows go under
"former"; its towns match the successor province they sit in now.

    python3 datasets/lgu/scripts/build_cmci.py [cache dir]

Missing pages are fetched with browser headers (the site refuses nothing,
but be polite) into the cache dir, default $TMPDIR/cmci. Not committed.
"""
import datetime, html, json, os, pathlib, re, sys, tempfile, time, urllib.parse, urllib.request
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/cmci.json'
CACHE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'cmci'))
SITE = 'https://cmci.dti.gov.ph'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'

YEARS = range(2020, datetime.date.today().year + 1)
UNITS = ['Provinces', 'Highly Urbanized Cities', 'Component Cities', '1st to 2nd Class Municipalities',
         '3rd to 4th Class Municipalities', '5th to 6th Class Municipalities']
PILLARS = {'Economic Dynamism': 'economicDynamism', 'Government Efficiency': 'governmentEfficiency',
           'Infrastructure': 'infrastructure', 'Resiliency': 'resiliency', 'Innovation': 'innovation'}
FORMER = {'maguindanao': 'maguindanao'}
# CMCI's spelling → the directory's, where norm() alone does not meet.
ALIASES = {'datu blah sinsuat': 'datu blah t sinsuat'}


def page(unit, year):
    path = CACHE / f"rank-{unit.replace(' ', '_')}-{year}.html"
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        url = f'{SITE}/rankings-data.php?' + urllib.parse.urlencode({'unit': unit, 'year': year})
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9'})
        path.write_bytes(urllib.request.urlopen(req, timeout=120).read())
        time.sleep(1)
    return path.read_text(errors='replace')


def rows(doc):
    """Cells of each row of the rankings table (table_data1, not the most-improved one)."""
    table = re.search(r'<table id="table_data1".*?</table>', doc, re.S)
    for tr in re.findall(r'<tr>(.*?)</tr>', table.group() if table else '', re.S):
        cells = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
        if cells:
            yield cells


def text(cell):
    return html.unescape(re.sub(r'<[^>]+>', '', cell)).strip()


def num(cell, kind):
    m = re.search(r'\d+(\.\d+)?', text(cell))
    return kind(m.group()) if m else None


def key_of(name):
    k = norm(re.sub(r'\s*\([^)]*\)$', '', name))
    return ALIASES.get(k, k)


units, former, unmatched, mismatched, published = {}, {}, [], [], []
for year in YEARS:
    found = False
    for unit in UNITS:
        doc = page(unit, year)
        heading = re.search(r'<h1>(\d{4}) Rankings of', doc)
        if not heading or int(heading.group(1)) != year:
            continue
        # Pillar columns in the header's order; editions before 2022 have no Innovation.
        pillars = [PILLARS[p] for p in re.findall(r"<th[^>]*colspan=2>([^<]+)</th>", doc)]
        for c in rows(doc):
            found = True
            region = text(c[3] if unit == 'Provinces' else c[4])
            # Pre-split Maguindanao's province row has a blank Region cell.
            if not region.startswith('BARMM') and not (unit == 'Provinces' and key_of(text(c[2])) in FORMER):
                continue
            name = text(c[2])
            href = SITE + '/' + html.unescape(re.search(r'href="([^"]+)"', c[2]).group(1)).replace(' ', '%20')
            rec = {'overall': num(c[1], float), 'rank': num(c[0], int), 'rankCategory': unit}
            target = units
            if unit == 'Provinces':
                if key_of(name) == 'sulu':
                    continue
                key = provinces.get(key_of(name))
                if key is None and key_of(name) in FORMER:
                    key, target = FORMER[key_of(name)], former
            else:
                if key_of(text(c[3])) == 'sulu':
                    continue
                key = towns.get(key_of(name))
                rec['pillars'] = {p: {'score': num(c[6 + 2 * i], float), 'rank': num(c[5 + 2 * i], int)}
                                  for i, p in enumerate(pillars)}
            if key is None:
                unmatched.append(f'{year} {unit}: {name}')
                continue
            if 'pillars' in rec and abs(sum(v['score'] for v in rec['pillars'].values()) - rec['overall']) > 0.001:
                mismatched.append(f'{year} {key}')
            rec['href'] = href
            rec = {k: v for k, v in rec.items() if v is not None}
            assert str(year) not in target.get(key, {}), f'{year} {key} ranked twice'
            target.setdefault(key, {})[str(year)] = rec
    if found:
        published.append(year)

data = {
    'name': 'Cities and Municipalities Competitiveness Index — BARMM',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [{'label': f'DTI — CMCI {y} rankings', 'href': f'{SITE}/rankings-data.php?unit=Provinces&year={y}', 'edition': y}
               for y in published],
    'note': (
        'DTI’s Cities and Municipalities Competitiveness Index, as published on cmci.dti.gov.ph. A year is the CMCI '
        'edition, not the year the underlying data describes (an edition mostly uses the previous year’s data). '
        '"overall" is the sum of the pillar scores, each pillar worth up to 20 (four pillars before the 2022 edition, which added '
        'Innovation, so those totals are out of 80); "rank" is the rank within '
        '"rankCategory" nationally, not within BARMM. Ranks and scores are only comparable inside a category and '
        'edition. Provinces carry an overall score and rank only: CMCI derives it as the population- and '
        'income-weighted average of its component LGUs’ scores, excluding highly urbanized cities, and publishes '
        'no provincial pillars. An LGU missing from a year was not ranked that edition — CMCI participation is '
        'voluntary and data-dependent — not scored zero. The 2020 edition ranks only BARMM’s three cities '
        '(Cotabato, Lamitan, Marawi); no BARMM municipality or province appears in it. No edition after '
        f'{published[-1]} is published yet. '
        'Sulu, in BARMM until 2024, is left out. "Maguindanao" province rows before its split are under '
        '"former"; its towns sit under the province they are in now. The eight Special Geographic Area towns, '
        'created in 2024, have never been ranked.'
    ),
    'years': published,
    'units': dict(sorted(units.items())),
    'former': former,
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units + {len(former)} former, editions {published}')
for y in published:
    print(y, sum(str(y) in v for v in units.values()), 'units')
print('unmatched BARMM rows:', unmatched or 'none')
print('overall ≠ sum of pillars:', mismatched or 'none')
print('directory units never ranked:', sorted(expected - set(units)) or 'none')
