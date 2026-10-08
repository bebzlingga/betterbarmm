#!/usr/bin/env python3
"""Write datasets/lgu/procurement.json — what each BARMM province, city and
municipality put out to bid and awarded on PhilGEPS, by year, 2020 onward.

What PhilGEPS publishes, and what of it is usable here (checked October 2026):

  - open.philgeps.gov.ph/analytics, "Agency Information": for each
    registered procuring entity, a table by year of bid notices posted, their
    approved budget for the contract (ABC), the amount awarded, and how many
    of those notices stand "Awarded". This is the only per-agency figure that
    can be fetched in bulk, and it is what this file holds. Its "Top
    Merchants" chart gives ten amounts for all years together with the
    supplier names blanked out, so there are no top suppliers here.
  - philgeps.gov.ph/CmsHomePages/open-data, "Datasets": a Power BI report.
    Its public query endpoint refuses scripted requests (403 / connection
    reset), and it offers no file download.
  - philgeps.gov.ph/Indexes/getAwardNotices and getAmpAwardNotices
    (modernized PhilGEPS): award notices one page each at
    /Indexes/viewAwardNotice/<n> (about 36,600 since 2021), but the lists show
    only the latest 100, their search has no agency filter, and
    getFormerOpportunities' agency-name search returns nothing for any BARMM
    name. Not harvested.
  - notices.philgeps.gov.ph/GEPSNONPILOT (legacy PhilGEPS): award search
    returns "No award notices found" for every query, even a title copied
    from its own recent-awards list.
  - data.gov.ph: once carried PhilGEPS notice and award CSVs (circa 2015);
    the current portal is a single-page app whose dataset search needs a key
    the page generates, and none was found linked from PhilGEPS. Not used.

So there is no contract-level list: no reference numbers, titles, awardees.

How a year is counted is PhilGEPS's: the table is keyed by year, and the
Award Summary's "TOTAL BID" is the number of notices the agency posted that
year; "CONTRACT AWARD" and the "Awarded" count belong to those notices. An
award is a contract signed, not money paid.

Entities are matched to the directory by name with sre.py's norm. The
analytics' agency list is PhilGEPS's registry, not the LGU list: about half
of BARMM's towns, the provinces of Tawi-Tawi and Maguindanao del Norte, the
pre-2022 province of Maguindanao, Marawi City and the Special Geographic
Area towns are not in it, so they have no figures here, not zeros.

    python3 datasets/lgu/scripts/build_procurement.py [cache dir]

The cache defaults to $TMPDIR/philgeps; pages already there are not fetched
again. Nothing fetched is committed.
"""
import datetime, html, json, os, pathlib, re, sys, tempfile, time, urllib.parse, urllib.request
from sre import ROOT, norm, provinces, towns, directory

OUT = ROOT / 'datasets/lgu/procurement.json'
CACHE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'philgeps'))
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'
SEARCH = 'https://api.philgeps.gov.ph/buyer/request'
AGENCY = 'https://open.philgeps.gov.ph/analytics/agency/load/'
# The token open.philgeps.gov.ph/analytics/load/agencyInfo posts with every agency request.
TEMPLATE = 'USQNaVZwBi9VFgM3BWVYNQ0xACkDGgRrAT1VPg=='
FIRST_YEAR = 2020

# Names PhilGEPS still files under, with the directory's name for the same LGU.
RENAMED = {'bumbaran': 'amai manabilang', 'montawal': 'pagagawan', 'datu montawal': 'pagagawan'}
# A province suffix on the entity name, and the directory provinces it may mean.
SUFFIX = {
    'basilan': {'basilan'},
    'lanao del sur': {'lanao-del-sur'},
    'tawi tawi': {'tawi-tawi'},
    'maguindanao del norte': {'maguindanao-del-norte'},
    'maguindanao del sur': {'maguindanao-del-sur'},
    # Pre-split and misspelt "Maguindanao" — either successor.
    'maguindanao': {'maguindanao-del-norte', 'maguindanao-del-sur'},
    'maguinadanao': {'maguindanao-del-norte', 'maguindanao-del-sur'},
    'maguindano': {'maguindanao-del-norte', 'maguindanao-del-sur'},
}
FORMER = {'maguindanao': 'maguindanao'}


def post(url, data):
    req = urllib.request.Request(url, urllib.parse.urlencode(data).encode(),
                                 {'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9'})
    for attempt in range(4):
        try:
            return urllib.request.urlopen(req, timeout=240).read()
        except OSError as e:
            print(f'retry {url}: {e}', file=sys.stderr)
            time.sleep(10)
    raise RuntimeError(f'gave up on {url}')


def find_agencies():
    """Every PhilGEPS entity whose name holds a directory name. The search returns at most 40."""
    path = CACHE / 'agencies.json'
    if path.exists():
        return json.loads(path.read_text())
    names = {p['name'] for p in directory['provinces']} | {m['name'] for p in directory['provinces'] for m in p['municipalities']}
    names |= {'Maguindanao', 'Bumbaran', 'Montawal', 'Tagoloan', 'Marawi', 'City of Cotabato'}
    found = {}
    for name in sorted(names):
        for kw in [name] + [f'{p} of {name}' for p in ('Province', 'City', 'Municipality')]:
            res = json.loads(post(SEARCH, {'keyword': kw, 'action': 'searchAgency', 'dp': 1}))['result']
            found.update({r['id']: r['text'] for r in res})
            time.sleep(0.7)
            if len(res) < 40:
                break
    path.write_text(json.dumps(found, indent=0))
    return found


def match(name):
    """(key, former?) for an LGU-shaped entity name, else None."""
    m = re.match(r'(PROVINCE|CITY|MUNICIPALITY|MUNICIPAL GOVERNMENT) OF (.+)', name.strip())
    if not m:
        return None
    kind, rest = m.group(1), norm(m.group(2))
    allowed = None
    for suffix in sorted(SUFFIX, key=len, reverse=True):
        if rest.endswith(' ' + suffix):
            rest, allowed = rest[: -len(suffix) - 1].strip(), SUFFIX[suffix]
            break
    if kind == 'PROVINCE':
        if rest in provinces:
            return provinces[rest], False
        return (FORMER[rest], True) if rest in FORMER else None
    rest = RENAMED.get(rest, rest)
    if rest == 'tagoloan' and allowed == {'lanao-del-sur'}:
        rest = 'tagoloan ii'  # Lanao del Norte has the other Tagoloan
    key = towns.get(rest)
    if key and (allowed is None or key.split('/')[0] in allowed):
        return key, False
    return None


def cell(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def number(s):
    return float(s.replace(',', ''))


def read_agency(agency_id):
    path = CACHE / 'agency' / f'{agency_id}.html'
    if not path.exists():
        path.parent.mkdir(parents=True, exist_ok=True)
        page = post(AGENCY + agency_id, {'template': TEMPLATE})
        path.write_bytes(page)
        time.sleep(1)
    s = re.sub(r'(?s)<!--.*?-->', '', path.read_text(errors='ignore'))
    award = re.search(r'(?s)id="agy-awardsum"(.*?)id="agy-personal"', s).group(1)
    bids = re.search(r'(?s)id="agy-personal"(.*?)id="agy-supdis"', s).group(1)
    years = {}
    for tr in re.findall(r'(?s)<tr>(.*?)</tr>', award):
        c = [cell(x) for x in re.findall(r'(?s)<th>(.*?)</th>', tr)]
        if c and c[0].isdigit():
            years[c[0]] = {'notices': int(number(c[1])), 'abc': number(c[2]), 'awarded': number(c[3])}
    # Bid Summary: one row a year; its status sub-table holds the "Awarded" count.
    for year, body in re.findall(r'(?s)<tr>\s*<th>(\d{4})</th>(.*?)(?=<tr>\s*<th>\d{4}</th>|$)', bids):
        n = re.search(r'Awarded</td><td>([\d,]+)</td>', body)
        assert year in years and n, f'{agency_id} {year}: bid summary without an award summary row'
        years[year]['contracts'] = int(number(n.group(1)))
    total = re.search(r'Total Awarded Bid: <span>([\d,]+)</span>.*?Total Awarded Contract: <span>([\d,.]+)</span>', s, re.S)
    return years, int(total.group(1).replace(',', '')), number(total.group(2))


agencies = find_agencies()
units, former, ids, unmatched, checks = {}, {}, {}, [], []
for agency_id, name in sorted(agencies.items(), key=lambda a: a[1]):
    if not re.match(r'(PROVINCE|CITY|MUNICIPALITY|MUNICIPAL GOVERNMENT) OF', name):
        continue
    hit = match(name)
    if hit is None:
        if re.search(r'BASILAN|LANAO DEL SUR|MAGUI|TAWI|COTABATO$|MARAWI', name):
            unmatched.append(name)
        continue
    key, is_former = hit
    years, n_total, amount_total = read_agency(agency_id)
    # The header totals every year, back to 2013; the rows must add up to it.
    if sum(y.get('contracts', 0) for y in years.values()) != n_total or abs(sum(y['awarded'] for y in years.values()) - amount_total) > len(years):
        checks.append(f'{key} ({name}): yearly rows do not add up to the header totals')
    ids.setdefault(key, []).append({'id': agency_id, 'name': name})
    target = (former if is_former else units).setdefault(key, {})
    for year, row in years.items():
        if int(year) < FIRST_YEAR:
            continue
        if year in target:  # one LGU under two PhilGEPS registrations (e.g. Datu Montawal and Montawal)
            for k, v in row.items():
                target[year][k] = target[year].get(k, 0) + v
        else:
            target[year] = row

years = sorted({int(y) for u in (*units.values(), *former.values()) for y in u})
data = {
    'name': 'Procurement by BARMM local governments on PhilGEPS',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [
        {'label': 'PhilGEPS Open Data — Analytics, Agency Information (per-agency award and bid summaries)',
         'href': 'https://open.philgeps.gov.ph/analytics/load/agencyInfo'},
        {'label': 'PhilGEPS agency search behind that page (agency IDs)', 'href': SEARCH},
    ],
    'note': (
        'For each province, city and town registered on PhilGEPS, by year the bid notice was posted: "notices" is how many '
        'it posted, "abc" their approved budget for the contract in pesos, "awarded" the contract amount PhilGEPS records '
        'as awarded on them, and "contracts" how many of those notices stand Awarded. Awards are contracts signed, not '
        'payments: what was actually paid is in finances.json. Figures are as PhilGEPS states them; a few rows carry an '
        'award amount with no notice marked Awarded, or the reverse, and are kept as published. PhilGEPS records only what '
        'an LGU posts: bids it never posted are not here, and a year with no row is absent, not zero. About half of '
        'BARMM\'s towns, the provinces of Tawi-Tawi and Maguindanao del Norte, Marawi City, the pre-2022 province of '
        'Maguindanao and the eight Special Geographic Area towns have no PhilGEPS registration in the analytics, so no '
        'figures. Rows stop at 2025; 2025 is partial, recorded as PhilGEPS moved agencies to its modernized system, '
        'whose award notices cannot be listed by agency. There is no contract-level list and no top suppliers: PhilGEPS '
        'publishes no bulk award file, its per-agency supplier chart blanks the names, and its notice searches return '
        'nothing usable by agency. Sulu is left out. "agencies" gives each unit\'s PhilGEPS registration(s).'
    ),
    'years': years,
    'units': dict(sorted(units.items())),
    'former': former,
    'agencies': dict(sorted(ids.items())),
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units + {len(former)} former, {years}')
print('unit-years:', sum(len(u) for u in units.values()))
print('BARMM-looking entities not matched:', unmatched or 'none')
print('header/row mismatches:', checks or 'none')
print('directory units with no PhilGEPS registration:', sorted(expected - set(units)) or 'none')
