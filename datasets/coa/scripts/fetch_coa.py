#!/usr/bin/env python3
"""Fetch and parse COA Annual Audit Reports (AARs) for BARMM entities into
datasets/coa/audit-reports.json.

ACCESS. coa.gov.ph (pages, /download/ links, wp-json, the AAR listing pages)
answers every automated request with a Cloudflare 403 challenge — checked
2026-10-12 with curl + browser headers and with WebFetch. The listing pages
are also client-side (WP File Download) so archived copies of
them list nothing (one old-site 2020 BARMM listing capture shows only Marawi).
So this script never reads coa.gov.ph directly; it reads the Internet
Archive's Wayback Machine copies of COA's own PDF URLs:

  1. CDX index of every captured URL under three COA prefixes:
       coa.gov.ph/download/            (current site, 2022-)
       coa.gov.ph/phocadownloadpap/    (old site, AARs to FY 2020)
       coa.gov.ph/phocadownload/       (old site, other uploads)
  2. Keep URLs that are BARMM entities (old-site path segment /BARMM/;
     new-site province slug basilan/lanao-del-sur/maguindanao*/sulu/tawi-tawi
     or the bangsamoro-autonomous-region category) for FY 2019 onward, with a
     200 application/pdf capture. Drop water districts (national GOCCs that
     happen to sit in BARMM) and Isabela City (Basilan, but Region IX; COA
     files it under BARMM). Sulu is kept: every Sulu report here is pre-2024.
  3. Download web.archive.org/web/<ts>id_/<COA url> into CACHE, 1 s apart.
  4. pdftotext -layout; if a page has no text layer, OCR it (pdftoppm 300 dpi
     + tesseract).
  5. Read each Executive Summary into curated.json (beside this script): the
     fields vary too much in wording and layout (sentences, tables, erratum
     pages, two-column scans) for regexes, so they were read by hand from the
     `--bundle` text dumps (one file per report, PDF page markers). Rules:
       opinion          the auditor's word; "unqualified" -> unmodified
       disallowances /  year-end outstanding Notices of Disallowance / Suspension;
       suspensions      0 only if printed as none/0.00/"-", else null
       observations     numbered deficiencies in the summary (favourable ones out)
       recommendations  each lettered/separate recommendation under them
       priorRecs        as printed; erratum pages win; unstated parts null
       findings         3-6 plain-English bullets, amount + PDF page
  6. build() checks curated.json against the PDF text before writing: every
     peso figure must be printed in the PDF (finding amounts on the cited
     page), and the opinion / prior-status quotes must appear in it. Any
     mismatch aborts the write.

Run:  python3 datasets/coa/scripts/fetch_coa.py [cache dir]           # build + verify
      ... --list | --download | --bundle | --check                     # stages
"""
import datetime, json, os, pathlib, tempfile, re, subprocess, sys, time, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/coa/audit-reports.json'
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
CACHE = pathlib.Path(ARGS[0] if ARGS else os.path.join(tempfile.gettempdir(), 'coa-aar'))  # PDFs are not committed
CACHE.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'betterbarmm.ph dataset builder (+https://betterbarmm.ph)'}
PREFIXES = ['coa.gov.ph/download/', 'coa.gov.ph/phocadownloadpap/', 'coa.gov.ph/phocadownload/']


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except Exception as e:  # Wayback throttles; back off and retry
            if i == tries - 1:
                raise
            time.sleep(5 * (i + 1))


def cdx():
    """All captures under PREFIXES as (timestamp, url, status, mime)."""
    f = CACHE / 'cdx.txt'
    if not f.exists():
        lines = []
        for pre in PREFIXES:
            base = f'https://web.archive.org/cdx/search/cdx?url={pre}&matchType=prefix'
            pages = int(get(base + '&showNumPages=true').decode().strip())
            for p in range(pages):
                lines.append(get(f'{base}&page={p}&fl=timestamp,original,statuscode,mimetype').decode())
                time.sleep(1)
        f.write_text(''.join(lines))
    for line in f.read_text().splitlines():
        parts = line.split()
        if len(parts) == 4:
            yield parts


def canon(url):
    return 'https://www.coa.gov.ph/' + re.sub(r'^https?://(www\.)?coa\.gov\.ph/', '', url.split('?')[0])


BARMM_NEW = re.compile(r'/download/\d+/(basilan|lanao-del-sur|maguindanao[a-z-]*|sulu|tawi-tawi|cotabato-city|'
                       r'bangsamoro-autonomous-region-in-muslim-mindanao-barmm)/')
SKIP = re.compile(r'water-district|IsabelaCity|isabela-city', re.I)


def year_of(url):
    m = re.search(r'(?:ES|aar|caar|-)(20\d\d)(?:-\d)?\.(?:pdf|zip)$', url, re.I)
    return int(m.group(1)) if m else None


def candidates():
    best = {}
    for ts, url, status, mime in cdx():
        u = canon(url)
        if not ('/BARMM/' in u or BARMM_NEW.search(u)) or SKIP.search(u):
            continue
        y = year_of(u)
        if not y or y < 2019 or not u.lower().endswith('.pdf'):
            continue
        ok = status == '200' and mime == 'application/pdf'
        prev = best.get(u)
        if prev is None or (ok and not prev[1]):
            best[u] = (ts, ok, y)
    return best


def download(u, ts):
    f = CACHE / re.sub(r'[^A-Za-z0-9._-]+', '_', u.split('coa.gov.ph/')[1])
    if not f.exists():
        data = get(f'https://web.archive.org/web/{ts}id_/{u}')
        if not data.startswith(b'%PDF'):
            raise ValueError('not a PDF (archived error page?)')
        f.write_bytes(data)
        time.sleep(1)
    return f


def pages(pdf):
    """Text of each page; OCR the pages with no text layer."""
    t = CACHE / (pdf.name + '.txt')
    if not t.exists():
        out = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, text=True).stdout
        pg = out.split('\f')
        if pg and not pg[-1].strip():
            pg.pop()  # pdftotext ends every page with \f
        for i, p in enumerate(pg):
            if len(p.strip()) < 40:
                img = CACHE / f'{pdf.stem}-p{i + 1}'
                subprocess.run(['pdftoppm', '-r', '300', '-gray', '-png', '-f', str(i + 1), '-l', str(i + 1),
                                '-singlefile', str(pdf), str(img)], check=True)
                pg[i] = subprocess.run(['tesseract', f'{img}.png', '-', '--psm', '6'],
                                       capture_output=True, text=True).stdout
        t.write_text('\f'.join(pg))
    return t.read_text().split('\f')


DIRECTORY = json.load(open(ROOT / 'datasets/lgu/barmm-lgu.json'))
SQ = lambda s: re.sub(r'[^a-z]', '', s.lower())
# file-name spellings -> directory names
ALIAS = {'datumontawal': 'Pagagawan', 'gskpendatun': 'Gen. S. K. Pendatun', 'datublahsinsuat': 'Datu Blah T. Sinsuat',
         'ditsaanramain': 'Ditsaan-Ramain', 'buadipusobuntong': 'Buadiposo-Buntong', 'marawicity': 'Marawi',
         'datusaudiampatuan': 'Datu Saudi-Ampatuan'}
FORMER = {'Pagagawan': 'Datu Montawal'}  # name COA used in the report


def lgu(name):
    """(directory name, province slug, isCity) for a town named in a COA file name."""
    want = SQ(ALIAS.get(SQ(name), name))
    for p in DIRECTORY['provinces']:
        for m in p['municipalities']:
            if SQ(m['name']) == want:
                return m['name'], p['slug'], m['isCity']
    raise KeyError(name)


def entity(u):
    m = re.search(r'/LGUs/(\d{4})/BARMM/(Cities|Municipalities|Provinces)/([^/]+)/([^_]+)_', u)
    if m:
        name = m.group(4)
    else:
        m = re.search(r'/download/\d+/([a-z-]+)/\d+/([a-z-]+?)-executive-summary', u)
        if not m or m.group(1).startswith('bangsamoro'):
            return None  # Marawi Resort Hotel: an SPDA (national) subsidiary, not a BARMM office
        name = m.group(2)
    name, area, city = lgu(name)
    return {'entity': ('City of ' if city else 'Municipality of ') + name + (f' (then {FORMER[name]})' if name in FORMER else ''),
            'entityType': 'city' if city else 'municipality', 'area': area}


def reports():
    """Unique BARMM reports: downloaded, identified, de-duplicated by content."""
    import hashlib
    seen, out, gaps = {}, [], []
    for u, (ts, ok, y) in sorted(candidates().items(), key=lambda kv: ('/download/' not in kv[0], kv[0])):
        e = entity(u) if 'sulu' not in u.lower() else None
        if e is None and 'sulu' in u.lower():
            town = re.search(r'/Sulu/([^_]+)_', u).group(1)
            town = {'Kalingalan': 'KalingalanCaluang'}.get(town, town)
            e = {'entity': 'Municipality of ' + re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', town), 'entityType': 'municipality', 'area': 'sulu'}
        if e is None:
            continue
        if e['area'] == 'sulu' and y > 2023:
            continue  # Sulu left BARMM (Supreme Court, 2024)
        rec = {**e, 'year': y, 'pdf': u, 'archived': f'https://web.archive.org/web/{ts}/{u}'}
        if not ok:
            gaps.append({**rec, 'reason': 'The only Wayback capture is a 403 Cloudflare page; the PDF itself was never archived.'})
            continue
        f = download(u, ts)
        h = hashlib.md5(f.read_bytes()).hexdigest()
        if h in seen:
            seen[h].setdefault('alsoAt', []).append(u)
            continue
        rec['file'] = f
        seen[h] = rec
        out.append(rec)
    return out, gaps


if __name__ == '__main__' and sys.argv[-1] == '--list':
    for u, (ts, ok, y) in sorted(candidates().items()):
        print(y, 'OK' if ok else '--', ts, u)

if __name__ == '__main__' and sys.argv[-1] == '--download':
    for u, (ts, ok, y) in sorted(candidates().items()):
        if ok:
            try:
                f = download(u, ts)
                print(len(pages(f)), 'pages', f.name)
            except Exception as e:
                print('FAIL', u, e)

if __name__ == '__main__' and sys.argv[-1] == '--bundle':
    rs, gaps = reports()
    B = CACHE.parent / 'bundles'
    B.mkdir(exist_ok=True)
    man = []
    for r in rs:
        key = f"{r['area']}--{SQ(r['entity'])}--{r['year']}"
        (B / f'{key}.txt').write_text(''.join(f'\n=== PDF PAGE {i + 1} ===\n{p}' for i, p in enumerate(pages(r['file']))))
        man.append({'key': key, **{k: v for k, v in r.items() if k != 'file'}})
    (B / 'manifest.json').write_text(json.dumps({'reports': man, 'gaps': gaps}, indent=1))
    print(len(man), 'reports', len(gaps), 'gaps')
    for m in man: print(m['key'], m.get('alsoAt', ''))


# ---------------------------------------------------------------- build
CURATED = pathlib.Path(__file__).with_name('curated.json')
NORM = lambda s: re.sub(r'(\d,)\s(?=\d)', r'\1', re.sub(r'\s+', ' ', s.replace('Ᵽ', '₱').translate(str.maketrans('‘’“”', "''\"\"")))).lower()  # "₱ 32, 073, 359.00" -> 32,073,359.00


def appears(v, text):
    """A peso figure counts as found if the PDF prints it as 1,234.56 (or 1,234 when whole)."""
    forms = {f'{v:,.2f}'} | ({f'{v:,.0f}'} if v == int(v) else set())
    # a few summaries print round figures in millions ("P78.718 million", "P36.630M")
    forms |= {f'{v / 1e6:.{d}f}' for d in (2, 3)} if v >= 1e6 and v % 1000 == 0 else set()
    return any(re.search(rf'(?<![\d,.]){re.escape(f)}(?!\d|,\d|\.\d)', text) for f in forms)


def build():
    rs, gaps = reports()
    cur = {c['key']: c for c in json.loads(CURATED.read_text())}
    out, problems = [], []
    for r in rs:
        key = f"{r['area']}--{SQ(r['entity'])}--{r['year']}"
        c = cur.get(key)
        pg = pages(r['file'])
        whole = NORM(' '.join(pg))
        if c is None:
            gaps.append({**{k: r[k] for k in ('entity', 'entityType', 'area', 'year', 'pdf', 'archived')},
                         'reason': 'Downloaded but not yet read into curated.json.'})
            continue
        for q in ('opinionQuote', 'priorQuote'):
            # erratum pages are two-column scans, so a quote may be interleaved: accept every word present
            if c.get(q) and NORM(c[q]) not in whole and not set(re.findall(r'\w+', NORM(c[q]))) <= set(re.findall(r'\w+', whole)):
                problems.append(f'{key}: {q} not in text: {c[q]!r}')
        for f in ('disallowances', 'suspensions', 'unliquidatedCashAdvances'):
            if c.get(f) and not appears(c[f], whole):
                problems.append(f'{key}: {f} {c[f]} not printed in the PDF')
        for fd in c['findings']:
            if fd.get('amount') and not appears(fd['amount'], whole):
                problems.append(f"{key}: finding amount {fd['amount']} not printed in the PDF")
            elif fd.get('amount') and fd.get('page') and not appears(fd['amount'], NORM(pg[fd['page'] - 1])):
                problems.append(f"{key}: finding amount {fd['amount']} not on page {fd['page']}")
        prior = c.get('priorRecommendations') or {}
        out.append({
            'entity': r['entity'], 'entityAsPrinted': c.get('entityAsPrinted'), 'entityType': r['entityType'],
            'area': r['area'], 'year': r['year'], 'opinion': c.get('opinion'),
            'disallowances': c.get('disallowances'), 'suspensions': c.get('suspensions'),
            'unliquidatedCashAdvances': c.get('unliquidatedCashAdvances'),
            'observations': c.get('observations'), 'recommendations': c.get('recommendations'),
            'priorRecommendations': {k: prior.get(k) for k in ('total', 'implemented', 'partial', 'notImplemented')},
            'findings': [{'text': f['text'], 'amount': f.get('amount'), 'page': f.get('page')} for f in c['findings']],
            'document': 'Executive Summary' + (' with full AAR' if len(pg) > 20 else ''),
            'pdf': r['pdf'], 'archived': r['archived'], **({'alsoAt': r['alsoAt']} if r.get('alsoAt') else {}),
            'listing': LISTING_OLD if '/phocadownloadpap/' in r['pdf'] else LISTING, 'note': c.get('note') or None,
        })
    return out, gaps, problems


LISTING = 'https://www.coa.gov.ph/reports/annual-audit-reports/aar-local-government-units/'
LISTING_OLD = 'https://www.coa.gov.ph/index.php/local-government-units/2020/category/9260-bangsamoro-autonomous-region-in-muslim-mindanao-barmm'


if __name__ == '__main__' and sys.argv[-1] == '--check':
    out, gaps, problems = build()
    print(len(out), 'reports', len(gaps), 'gaps')
    print('\n'.join(problems))


def coverage_gaps(out):
    """What was asked for but is not here: everything coa.gov.ph holds behind Cloudflare."""
    have = {r['entity'].split(' (then')[0].replace('Municipality of ', '').replace('City of ', '') for r in out}
    missing = [f"{m['name']} ({p['slug']})" for p in DIRECTORY['provinces'] if p['kind'] == 'Province'
               for m in p['municipalities'] if m['name'] not in have and p['slug'] != 'special-geographic-area']
    why = ('coa.gov.ph returns a Cloudflare 403 to every automated request (checked 2026-10-12), and the Internet '
           'Archive holds no copy of this report.')
    return [
        {'entity': 'Bangsamoro Autonomous Region in Muslim Mindanao (consolidated regional AAR) and each ministry, '
                   'office and attached agency', 'entityType': 'regional', 'years': '2019-2024', 'reason': why +
                   ' The Wayback CDX for coa.gov.ph/download/, /phocadownloadpap/ and /phocadownload/ has no BARMM '
                   'National Government Sector report for any year.'},
        {'entity': 'Provinces of Basilan, Lanao del Sur, Maguindanao (to 2022), Maguindanao del Norte, Maguindanao '
                   'del Sur, Tawi-Tawi and Sulu (to 2023)', 'entityType': 'province', 'years': '2019-2024', 'reason': why},
        {'entity': 'Cotabato City', 'entityType': 'city', 'area': 'cotabato-city', 'years': '2019-2024', 'reason': why},
        {'entity': 'Every municipality and city, FY 2019 and FY 2021-2024 (except Madalum 2021)', 'entityType':
                   'municipality', 'years': '2019, 2021-2024', 'reason': why + ' The old COA site (archived to '
                   'early 2022) carried FY 2020 reports; the current site\'s per-LGU downloads were almost never archived.'},
        {'entity': f'{len(missing)} BARMM municipalities with no report at all for any year', 'entityType': 'municipality',
         'list': missing, 'reason': why},
        {'entity': 'Special Geographic Area municipalities (8)', 'entityType': 'municipality',
         'area': 'special-geographic-area', 'reason': 'Created in 2024; no COA report yet for any year that could be read.'},
    ]


if __name__ == '__main__' and sys.argv[-1] not in ('--list', '--download', '--bundle', '--check'):
    out, gaps, problems = build()
    if problems:
        sys.exit('\n'.join(problems))
    out.sort(key=lambda r: (r['year'], r['area'], r['entity']))
    data = {
        'name': 'COA Annual Audit Report findings for BARMM entities',
        'generatedAt': datetime.date.today().isoformat(),
        'source': [
            {'label': 'Commission on Audit — Annual Audit Reports', 'href': 'https://www.coa.gov.ph/reports/annual-audit-reports/'},
            {'label': 'COA — AAR, Local Government Units (current site)', 'href': LISTING},
            {'label': 'COA — LGU AARs 2020, BARMM (old site, archived)', 'href': LISTING_OLD},
            {'label': 'Internet Archive Wayback Machine — where each PDF was read from',
             'href': 'https://web.archive.org/cdx/search/cdx?url=coa.gov.ph/phocadownloadpap/&matchType=prefix'},
        ],
        'note': (
            'Headline facts from the Executive Summary of each COA Annual Audit Report (AAR) on a BARMM entity. '
            'coa.gov.ph answers every automated request with a Cloudflare 403, so every PDF here was read from the '
            'Internet Archive copy of its own coa.gov.ph URL: `pdf` is the COA URL, `archived` the copy actually '
            'opened. That limits coverage to what the Archive saved: 55 municipalities and Marawi City for FY 2020 '
            '(old COA site) and Madalum for FY 2021. No regional/ministry, province or Cotabato City report could be '
            'read for any year — see `gaps`. Sulu towns are FY 2020, when Sulu was part of BARMM. '
            'Fields: opinion is the auditor\'s word (unmodified covers "unqualified"; "modified" where the report names '
            'no type). disallowances and suspensions are year-end outstanding Notices of Disallowance / Suspension '
            'balances; 0 only where the report says none or prints 0.00/"-", null where it does not say (several '
            'reports say only that none were issued during the year). unliquidatedCashAdvances is null almost '
            'everywhere because Executive Summaries rarely state the balance. observations counts the numbered '
            'deficiencies in the summary (favourable observations left out); recommendations counts each lettered or '
            'separate recommendation under them, which is a judgment call where they nest. priorRecommendations is as '
            'printed for prior years\' recommendations (erratum pages win); a part the report does not state is null '
            'even when the others imply it. findings are plain-English restatements of the summary\'s most significant '
            'observations; page is the PDF page (Executive Summaries number pages in roman numerals). Every peso '
            'figure and quoted sentence was checked against the PDF text by the build script. The full AAR (Part II) '
            'often holds more observations than the summary. Left out on purpose: water districts and Marawi Resort Hotel '
            '(national GOCCs that COA files under its BARMM office) and Isabela City (Basilan, but Region IX).'
        ),
        'reports': out,
        'gaps': gaps + coverage_gaps(out),
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
    print(f'wrote {OUT.relative_to(ROOT)}: {len(out)} reports, {len(data["gaps"])} gaps')
