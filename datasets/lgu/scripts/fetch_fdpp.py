#!/usr/bin/env python3
"""Write datasets/lgu/fdpp.json — what each BARMM province, city and
municipality has posted under DILG's Full Disclosure Policy.

The policy (DILG MC 2010-83 and after) has every local government post 14
financial documents — its budget, its procurement plan, its quarterly
statements of receipts and of cash flow, how it spent its 20% development
fund and its disaster fund, and so on — in three conspicuous places and on
the national portal. The portal's public report lists every posting:

  https://fdpp.dilg.gov.ph/fdpp/report

It serves 10 rows a page and ignores any larger page size, so BARMM's
~15,000 postings (region 19, 2023 on) are read page by page, about one
request a second. Pages are newest first: a posting made mid-run pushes the
rest down a page, so walking forward can repeat a row but never skip one,
and rows are de-duplicated on the portal's own id.

Parsed rows are cached as JSON lines, one per page, so an interrupted run
picks up where it stopped:

    python3 datasets/lgu/scripts/fetch_fdpp.py            # fetch, then build
    python3 datasets/lgu/scripts/fetch_fdpp.py --build    # build from the cache

What a row records is that a document was posted, and for which period;
the portal holds the file itself, and `href` is DILG's own download
link. A missing posting is not proof a document was not produced — only that
it is not on the portal.
"""
import datetime, html, json, pathlib, re, subprocess, sys, tempfile, time

sys.argv = sys.argv[:1] + [a for a in sys.argv[1:] if a == '--build']  # sre.py reads argv[1]
from sre import norm, provinces, towns  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/lgu/fdpp.json'
CACHE = pathlib.Path(tempfile.gettempdir()) / 'fdpp-barmm.jsonl'
BASE = 'https://fdpp.dilg.gov.ph'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'

# The portal's own document list, in its order (document_filter ids).
DOCUMENTS = [
    (1, 'Annual Budget Report'),
    (2, 'Annual Gender and Development Accomplishment Report'),
    (3, 'Annual Procurement Plan'),
    (17, 'Supplemental Procurement Plan'),
    (7, 'Statement of Indebtedness, Payments and Balances'),
    (8, '20% of the National Tax Allotment Utilization'),
    (9, 'Bid Results on Civil Works, Goods and Services and Consulting Services'),
    (10, 'Local Disaster Risk Reduction and Management Fund Utilization'),
    (11, 'Manpower Complement'),
    (12, 'Statement of Receipts and Expenditures'),
    (13, 'Trust Fund Utilization'),
    (14, 'Quarterly Statement of Cash Flow'),
    (15, 'Report of Special Education Fund Utilization'),
    (16, 'Unliquidated Cash Advances'),
]
# Matched on the portal's own spelling, which the labels above tidy.
PORTAL_NAMES = {
    1: 'Annual Budget Report', 2: 'Annual Gender and Development Accomplishment Report',
    3: 'Annual Procurement Plan', 7: 'Statement of Indebtedness Payments and Balances',
    8: '20% of the National Tax Allotment Utilization',
    9: 'Bid Results on Civil Works Good and Services and Consulting Services',
    10: 'Local Disaster Risk Reduction and Management Fund Utilization', 11: 'Manpower Complement',
    12: 'Statement of Receipts and Expenditures', 13: 'Trust Fund Utilization',
    14: 'Quarterly Statement of Cash Flow', 15: 'Report of Special Education Fund Utilization',
    16: 'Unliquidated Cash Advances', 17: 'Supplemental Procurement Plan',
}
BY_NAME = {re.sub(r'[^a-z0-9]', '', name.lower()): doc for doc, name in PORTAL_NAMES.items()}


def text(fragment):
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fragment))).strip()


def parse(page):
    """Rows of one report page, and the total the page says there are."""
    total = re.search(r'Showing.{0,200}?of\s*(?:<[^>]+>\s*)*([\d,]+)', page, re.S)
    rows = []
    for rid, body in re.findall(r'<tr id="row(\d+)">(.*?)</tr>', page, re.S):
        cells = re.findall(r'<span class="ext-dark fw-bolder mb-1 fs-7[^"]*">(.*?)</span>', body, re.S)
        if len(cells) < 4:
            continue
        place = [text(p) for p in re.split(r'<br\s*/?>', cells[1])]
        rows.append({
            'id': int(rid),
            'document': text(cells[0]),
            'place': [p.rstrip(',').strip() for p in place if p.rstrip(',').strip()],
            'posted': text(cells[2]),
            'period': text(cells[3]),
            'where': text(cells[4]) if len(cells) > 4 else '',
        })
    return rows, int(total.group(1).replace(',', '')) if total else None


def fetch():
    done = {}
    if CACHE.exists():
        for line in CACHE.open():
            entry = json.loads(line)
            done[entry['page']] = entry['rows']
    page, total = 1, None
    with CACHE.open('a') as cache:
        while total is None or (page - 1) * 10 < total:
            if page in done and total is not None:
                page += 1
                continue
            url = f'{BASE}/fdpp/report/index?region_filter=19&page={page}&per-page=10'
            for attempt in range(5):
                # curl rather than urllib: this Python's CA bundle does not
                # carry the portal's issuer, and curl uses the system's.
                result = subprocess.run(['curl', '-sS', '-L', '--max-time', '90', '-A', UA, url],
                                        capture_output=True)
                body = result.stdout.decode('utf-8', 'replace')
                if result.returncode == 0 and '<tr id="row' in body:
                    break
                print(f'page {page}: curl {result.returncode} {result.stderr.decode()[:120]}; retrying', file=sys.stderr)
                time.sleep(10 * (attempt + 1))
            else:
                sys.exit(f'page {page} failed five times; rerun to resume')
            rows, total = parse(body)
            if page not in done:
                cache.write(json.dumps({'page': page, 'rows': rows}) + '\n')
                cache.flush()
                done[page] = rows
            if page % 50 == 0:
                print(f'page {page} of {-(-total // 10)}', file=sys.stderr)
            page += 1
            time.sleep(1)


def period(label):
    """'QUARTER 3 • CY 2026' -> {'year': 2026, 'quarter': 3}; 'CY 2025' -> {'year': 2025}."""
    year = re.search(r'(\d{4})', label)
    quarter = re.search(r'QUARTER\s*(\d)', label, re.I)
    out = {'year': int(year.group(1))} if year else {}
    if quarter:
        out['quarter'] = int(quarter.group(1))
    if not out:
        out['label'] = label
    return out


def unit(place, where=''):
    """['BANGSAMORO …', 'Lanao del Sur', 'Marogong'] -> 'lanao-del-sur/marogong'."""
    parts = [norm(p) for p in place[1:]]
    # 112 postings carry the region alone. Every one was posted from the
    # Provincial Capitol in Buluan — Maguindanao del Sur's government, filed
    # before and after the 2022 split.
    if not parts and 'PROVINCIAL CAPITOL BUILDING, BULUAN' in where.upper():
        return provinces[norm('Maguindanao del Sur')]
    if len(parts) >= 2 and parts[-1] in towns:
        return towns[parts[-1]]
    if len(parts) == 1 and parts[0] in towns:  # Cotabato City sits outside any province
        return towns[parts[0]]
    if len(parts) == 1 and parts[0] in provinces:
        return provinces[parts[0]]
    return None


def build():
    seen, unmatched, units = set(), {}, {}
    for line in CACHE.open():
        for row in json.loads(line)['rows']:
            if row['id'] in seen:
                continue
            seen.add(row['id'])
            key = unit(row['place'], row['where'])
            if key is None:
                unmatched[' / '.join(row['place'][1:])] = unmatched.get(' / '.join(row['place'][1:]), 0) + 1
                continue
            doc = BY_NAME.get(re.sub(r'[^a-z0-9]', '', row['document'].lower()))
            if doc is None:
                unmatched['document: ' + row['document']] = unmatched.get('document: ' + row['document'], 0) + 1
                continue
            # The free-text "where it was posted" is half the file and is left on the portal.
            entry = {'id': row['id'], 'document': doc, 'period': period(row['period']), 'posted': period(row['posted'])}
            units.setdefault(key, []).append(entry)
    for rows in units.values():
        rows.sort(key=lambda r: (-r['period'].get('year', 0), -r['period'].get('quarter', 0), r['document']))
    for name, count in sorted(unmatched.items(), key=lambda kv: -kv[1]):
        print(f'unmatched: {name} ({count})', file=sys.stderr)
    out = {
        'name': 'Full Disclosure Policy postings, BARMM',
        'generatedAt': datetime.date.today().isoformat(),
        'source': [{'label': 'DILG Full Disclosure Policy Portal', 'href': f'{BASE}/fdpp/report'}],
        'note': 'What each unit has posted to DILG’s Full Disclosure Policy Portal since 2023. A missing posting means '
                'it is not on the portal, not that the document was never produced. Files are DILG’s own downloads.',
        'download': f'{BASE}/fdpp/report/document-download?id=',
        'documents': [{'id': doc, 'label': label} for doc, label in DOCUMENTS],
        'units': dict(sorted(units.items())),
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f'{len(seen)} postings, {sum(map(len, units.values()))} matched across {len(units)} units -> {OUT}', file=sys.stderr)


if __name__ == '__main__':
    if '--build' not in sys.argv:
        fetch()
    build()
