#!/usr/bin/env python3
"""Write datasets/procurement/philgeps.json — every bid notice a BARMM
procuring entity posted on PhilGEPS since 2019, the year BARMM began, and the
awards made on them.

Source: philgeps.gov.ph/CmsHomePages/open-data. Its dashboards are public
Power BI reports, and the query endpoint behind them answers a plain POST
with the report's resource key — the same call the page makes. Two reports
are read:

  - "Bids and Awards": the notice tables. TENDER BIDS AND AWARDS GEPS is the
    legacy system, one row per notice from 2015 (reference, entity, agency
    type, business category, approved budget, publish date);
    TENDER BIDS AND AWARDS MGEPS is the modernized system since 2024, with
    titles, procurement mode and status.
  - "Merchants": TENDERS,BIDS AND AWARDS, the legacy notices that reached
    an award — title, procurement mode, classification, awardee, contract
    amount, award date and contract number, one row per award (a notice in
    lots has several).

Region is PhilGEPS's: an entity registered under BARMM. Sulu's province and
towns, out of BARMM since 2024, and Isabela City, which PhilGEPS files under
BARMM but is in Region IX, are left out, as everywhere on the site, as are
offices filed under the old ARMM and every notice before 2019. Local
governments are matched to the LGU directory by name.

    python3 datasets/procurement/scripts/fetch_philgeps.py
"""
import json, pathlib, re, sys, urllib.request, uuid
from collections import Counter
from datetime import date, datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'datasets/lgu/scripts'))
sys.argv = sys.argv[:1]
from sre import norm, provinces, towns  # noqa: E402

OUT = ROOT / 'datasets/procurement/philgeps.json'
API = 'https://wabi-south-east-asia-d-primary-api.analysis.windows.net/public/reports/querydata?synchronous=true'
REPORTS = {
    'bids': {'key': 'd30759d8-e64f-4aca-831b-726185246fce', 'model': 762729,
             'context': {'DatasetId': '0be06f1e-de3a-41c5-983f-04321e1a811b', 'Sources': [{'ReportId': '4c368706-4fc5-4510-b3c1-bfcd4dc605b4'}]}},
    'merchants': {'key': 'e6600c7c-58e3-4c53-9f41-00e100d60d87', 'model': 612508,
                  'context': {'DatasetId': '5d1c884a-5916-4b4b-91ef-a63d308dc3fb', 'Sources': [{'ReportId': '28690c07-4c76-4f35-87d8-554c386dc957'}]}},
}
LGU_TYPES = {'Provincial Government', 'City Government', 'Municipal Government'}
ALIASES = {'datu hoffer': 'datu hoffer ampatuan'}
SULU_TOWNS = ['banguingui', 'hadji panglima tahil', 'indanan', 'jolo', 'kalingalan caluang', 'lugus', 'luuk', 'maimbung',
              'old panamao', 'omar', 'pandami', 'panglima estino', 'pangutaran', 'pata', 'patikul', 'siasi', 'talipao', 'tapul']


def query(report, entity, cols, where, count, restart=None):
    r = REPORTS[report]
    sel = [{'Column': {'Expression': {'SourceRef': {'Source': 't'}}, 'Property': c}, 'Name': f't.{c}'} for c in cols]
    cond = [{'Condition': {'In': {'Expressions': [{'Column': {'Expression': {'SourceRef': {'Source': 't'}}, 'Property': k}}],
                                  'Values': [[{'Literal': {'Value': v}}]]}}} for k, v in where.items()]
    window = {'Count': count, **({'RestartTokens': restart} if restart else {})}
    cmd = {'SemanticQueryDataShapeCommand': {
        'Query': {'Version': 2, 'From': [{'Name': 't', 'Entity': entity, 'Type': 0}], 'Select': sel, 'Where': cond},
        'Binding': {'Primary': {'Groupings': [{'Projections': list(range(len(cols)))}]},
                    'DataReduction': {'DataVolume': 4, 'Primary': {'Window': window}}, 'Version': 1},
        'ExecutionMetricsKind': 1}}
    body = {'version': '1.0.0', 'queries': [{'Query': {'Commands': [cmd]}, 'QueryId': '', 'ApplicationContext': r['context']}],
            'cancelQueries': [], 'modelId': r['model']}
    headers = {'Content-Type': 'application/json;charset=UTF-8', 'X-PowerBI-ResourceKey': r['key'],
               'ActivityId': str(uuid.uuid4()), 'RequestId': str(uuid.uuid4())}
    req = urllib.request.Request(API, data=json.dumps(body).encode(), headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=180) as res:
        return json.load(res)


def decode(res, width):
    """Power BI's compressed rows: each row carries only the values that
    changed, in "C" or under the column's own name ("R" marks repeats, "Ø"
    nulls); strings may index ValueDicts."""
    ds = res['results'][0]['result']['data']['dsr']['DS'][0]
    dicts, rows, prev, schema = ds.get('ValueDicts', {}), [], [None] * width, None
    for r in ds['PH'][0]['DM0']:
        schema = r.get('S', schema)
        values, row, ci = r.get('C', []), [], 0
        for i, s in enumerate(schema):
            if s['N'] in r:  # a value can also come under its column's name
                v = r[s['N']]
                if 'DN' in s and isinstance(v, int):
                    v = dicts[s['DN']][v]
            elif r.get('R', 0) >> i & 1:
                v = prev[i]
            elif r.get('Ø', 0) >> i & 1:
                v = None
            else:
                v = values[ci]; ci += 1
                if 'DN' in s and isinstance(v, int):
                    v = dicts[s['DN']][v]
            row.append(v)
        rows.append(prev := row)
    return rows, ds.get('RT')


def pull(report, entity, cols, where):
    out, rt = [], None
    while True:
        rows, rt = decode(query(report, entity, cols, where, 10000, rt), len(cols))
        out += rows
        print(f'{entity}: {len(out)}', file=sys.stderr)
        if not rt or not rows:
            return [dict(zip(cols, r)) for r in out]


def day(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).date().isoformat() if isinstance(ms, (int, float)) else None


# PhilGEPS files these regional bodies as local governments; they are not.
TYPE_FIXES = {
    'OFFICE OF THE CHIEF MINISTER  - BARMM': 'Department',
    'BANGSMORO TRANSITION AUTHORITY - BARMM': 'Department',
    'MINISTRY OF PUBLIC WORKS - BARMM MAGUINDANAO DEL NORTE DEO': 'Department',
}


def supplier_key(name):
    """One supplier however PhilGEPS spelled it: punctuation, '&' and the
    legal suffix (Inc., Corp., Co.) do not make a different firm."""
    s = name.lower().replace('&', ' and ').replace('phil.', 'phil ')
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    s = re.sub(r'\b(inc|incorporated|corp|corporation|co|ltd|opc|the)\b', ' ', s)
    return ' '.join(s.split())


def lgu_key(name, kind):
    """The directory key of a province, city or town, or None. Only a name
    that reads as a local government counts (PhilGEPS files some regional
    offices as LGUs), and only its first part: "Datu Hoffer - Shariff Aguak"
    is Datu Hoffer, then the town it was carved from."""
    s = name.lower().strip()
    if not re.match(r'(municipal|municipality|municipalty|city|province|provincial|local government)\b', s):
        return None
    s = re.sub(r'\b(provincial government of|province of|municipal government of|municipality of|municipalty|city government of|city of|local government unit of)\b', '', s)
    s = re.sub(r'\bmaguina?d?anao\b|\bmaguindano\b', 'maguindanao', s).replace('ditsa-an', 'ditsaan')
    first = re.split(r'\s+-\s*|\s*-\s+|,', s)[0].strip(' ,.')
    if kind == 'Provincial Government' and (k := provinces.get(norm(first))):
        return k
    # "Pandag Buluan Maguindanao": the town, then where it used to be.
    words = first.split()
    for n in range(len(words), 0, -1):
        candidate = ' '.join(words[:n])
        if (k := towns.get(norm(ALIASES.get(candidate, candidate)))):
            return k
    return None


ARMM = re.compile(r'\bARMM\b|AUTONOMOUS REGION IN MUSLIM MINDANAO', re.I)
SINCE = '2019-01-01'  # BARMM was ratified in January 2019; ARMM's years before it are left out.


def left_out(name, kind):
    # Offices filed under the old ARMM, the region BARMM replaced.
    if ARMM.search(name) and 'bangsamoro' not in name.lower():
        return True
    # National offices for Region XII that sit in Cotabato City and are filed
    # under BARMM by address; they serve SOCCSKSARGEN, not the region.
    if re.search(r'\bREGION\s*XII\b', name, re.I):
        return True
    s = name.lower()
    if kind in LGU_TYPES and ('sulu' in s or any(re.search(rf'\b{t}\b', s) for t in SULU_TOWNS)):
        return True
    return kind == 'City Government' and 'isabela' in s and 'tabuan' not in s


def main():
    legacy = pull('bids', 'TENDER BIDS AND AWARDS GEPS',
                  ['RefID', 'PublishDate', 'ProcuringEntity', 'AgencyType', 'BusinessCategory', 'TotalApprovedBudget'], {'Region': "'BARMM'"})
    modern = pull('bids', 'TENDER BIDS AND AWARDS MGEPS',
                  ['Bid Reference No.', 'PublishDate', 'ProcuringEntity', 'AgencyType', 'BusinessCategory', 'TotalApprovedBudget',
                   'Notice Title', 'ProcurementMode', 'Bid Notice Status'], {'Region': "'BARMM'"})
    awards = pull('merchants', 'TENDERS,BIDS AND AWARDS',
                  ['RefID', 'TenderTitle', 'ProcurementMode', 'Classification', 'TenderStatus', 'Awardee', 'ContractAmt', 'AwardDate', 'ContractNo'],
                  {'RegionID': '1L'})

    entities, index = [], {}
    def entity(name, kind):
        if name not in index:
            index[name] = len(entities)
            entities.append({'name': name, 'type': kind, 'unit': lgu_key(name, kind) if kind in LGU_TYPES else None})
        return index[name]

    # Each supplier under the spelling it is awarded under most often.
    spellings = {}
    for a in awards:
        if a['Awardee']:
            name = a['Awardee'].strip()
            spellings.setdefault(supplier_key(name), Counter())[name] += 1
    canonical = {k: c.most_common(1)[0][0] for k, c in spellings.items()}
    for a in awards:
        if a['Awardee']:
            a['Awardee'] = canonical[supplier_key(a['Awardee'].strip())]

    tenders = {}
    for a in awards:
        t = tenders.setdefault(a['RefID'], {'title': a['TenderTitle'], 'mode': a['ProcurementMode'], 'class': a['Classification'],
                                            'status': a['TenderStatus'], 'awards': []})
        if a['Awardee']:
            t['awards'].append([a['Awardee'], a['ContractAmt'], day(a['AwardDate']), a['ContractNo']])

    notices, seen, dropped = [], set(), set()
    for n, system in [(r, 'legacy') for r in legacy] + [(r, 'modern') for r in modern]:
        ref = n.get('RefID') or n.get('Bid Reference No.')
        name, kind = n['ProcuringEntity'], n['AgencyType']
        kind = TYPE_FIXES.get(name, kind)
        if not name or (system, ref) in seen:
            continue
        seen.add((system, ref))
        if left_out(name, kind):
            dropped.add(name)
            continue
        if not n['PublishDate'] or day(n['PublishDate']) < SINCE:
            continue
        t = tenders.get(ref, {}) if system == 'legacy' else {}
        notices.append({
            'ref': ref, 'system': system, 'date': day(n['PublishDate']), 'entity': entity(name, kind),
            'category': n['BusinessCategory'], 'abc': n['TotalApprovedBudget'],
            'title': n.get('Notice Title') or t.get('title'), 'mode': n.get('ProcurementMode') or t.get('mode'),
            'class': t.get('class'), 'status': n.get('Bid Notice Status') or t.get('status'), 'awards': t.get('awards', []),
        })
    # The modernized system's own pages (fetch_mphilgeps.py): source of funds,
    # closing date and whether still open for the notices above, and the
    # notices the dashboards have not caught up with.
    MP = OUT.parent / 'mphilgeps.json'
    mp = {n['ref']: n for n in json.loads(MP.read_text())['notices']} if MP.exists() else {}
    # The new system spells some offices differently from the old.
    MP_ALIASES = {
        'MPW BASILAN DISTRICT ENGINEERING OFFICE': 'MINISTRY OF PUBLIC WORKS - BARMM, BASILAN DEO',
        'MINISTRY OF PUBLIC WORKS - BARMM COTABATO CITY (DEO)': 'MINISTRY OF PUBLIC WORKS - BARMM, COTABATO CITY (DEO)',
        'MINISTRY OF PUBLIC WORKS - BARMM LANAO DEL SUR 2ND DEO': 'MINISTRY OF PUBLIC WORKS - BARMM LANAO DEL SUR 2ND DISTRICT ENGINEERING OFFICE',
        'MINISTRY OF THE INTERIOR AND LOCAL GOVERNMENT - BANGSAMORO AUTONOMOUS REGION IN MUSLIM MINDANAO': 'MINISTRY OF THE INTERIOR AND LOCAL GOVERNMENT - BARMM',
        'PUBLIC ATTORNEYS OFFICE - MARAWI CITY': "PUBLIC ATTORNEY'S OFFICE - BARMM REGIONAL OFFICE, MARAWI CITY",
    }
    squash = lambda s: re.sub(r'\s+', ' ', s).strip().upper()
    names = {squash(e['name']): e['name'] for e in entities}
    for n in notices:
        m = mp.pop(n['ref'], None) if n['system'] == 'modern' else None
        if m:
            n.update({k: m[k] or n[k] for k in ('title', 'mode', 'class', 'status', 'category')})
            n.update({'fund': m['fund'], 'closing': m['closing'], 'open': m['open']})
    for m in mp.values():
        if not m['agency'] or not m['published'] or m['published'] < SINCE:
            continue
        key = squash(MP_ALIASES.get(squash(m['agency']), m['agency']))
        name = names.get(key, m['agency'])
        kind = entities[index[name]]['type'] if name in index else (
            'Municipal Government' if key.startswith('MUNICIPALITY OF') else
            'City Government' if key.startswith('CITY OF') else
            'Provincial Government' if key.startswith('PROVINCE OF') else
            'Barangay' if key.startswith('BARANGAY') else 'Department')
        if left_out(name, kind):
            continue
        notices.append({'ref': m['ref'], 'system': 'modern', 'date': m['published'], 'entity': entity(name, kind),
                        'category': m['category'], 'abc': m['abc'], 'title': m['title'], 'mode': m['mode'], 'class': m['class'],
                        'status': m['status'], 'awards': [], 'fund': m['fund'], 'closing': m['closing'], 'open': m['open']})
    notices.sort(key=lambda n: (n['date'] or '', n['ref']), reverse=True)

    lookups = {k: [] for k in ('category', 'mode', 'class', 'status', 'awardee', 'fund')}
    positions = {k: {} for k in lookups}
    def look(kind, value):
        if value is None:
            return None
        if value not in positions[kind]:
            positions[kind][value] = len(lookups[kind])
            lookups[kind].append(value)
        return positions[kind][value]
    rows = [[n['ref'], 1 if n['system'] == 'modern' else 0, n['date'], n['entity'], look('category', n['category']), n['abc'],
             n['title'], look('mode', n['mode']), look('class', n['class']), look('status', n['status']),
             [[look('awardee', a[0]), a[1], a[2], a[3]] for a in n['awards']],
             look('fund', n.get('fund')), n.get('closing'), 1 if n.get('open') else 0] for n in notices]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        'name': 'PhilGEPS bid notices and awards of BARMM procuring entities',
        'generatedAt': date.today().isoformat(),
        'source': [{'label': 'PhilGEPS Open Data — Bids and Awards, and Merchants dashboards', 'href': 'https://philgeps.gov.ph/CmsHomePages/open-data'}],
        'note': 'Every bid notice a procuring entity PhilGEPS files under BARMM posted from 2019, when BARMM began, to date, in pesos. "abc" is the approved budget for the contract; "awards" are the contracts PhilGEPS records on the notice (awardee, contract amount, award date, contract number), several for a notice in lots. A notice is an intention to buy, an award a contract signed; neither is a payment. Titles, procurement mode and status are only published for notices that reached an award or were posted on the modernized system since 2024; source of funds, closing date and "open" (still taking bids when read) only for the modernized system, read from its own notice pages. Sulu\'s province and towns, Isabela City, offices named for the old ARMM (national agencies\' regional offices still filed as ARMM among them) and notices before 2019 are left out. "unit" links a local government to the LGU directory.',
        'columns': ['ref', 'modern', 'date', 'entity', 'category', 'abc', 'title', 'mode', 'class', 'status', 'awards', 'fund', 'closing', 'open'],
        'awardColumns': ['awardee', 'amount', 'date', 'contractNo'],
        'entities': entities,
        **{f'{k}s' if k != 'class' else 'classes': v for k, v in lookups.items()},
        'notices': rows,
    }, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'wrote {OUT.relative_to(ROOT)}: {len(notices)} notices, {len(entities)} entities, '
          f'{sum(len(n["awards"]) for n in notices)} awards; left out {len(dropped)} entities', file=sys.stderr)
    unmatched = [e['name'] for e in entities if e['type'] in LGU_TYPES and not e['unit']]
    print('LGU entities not matched to the directory:', unmatched, file=sys.stderr)


if __name__ == '__main__':
    main()
