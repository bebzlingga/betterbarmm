#!/usr/bin/env python3
"""Write datasets/lgu/fund-releases.json — national fund releases that DBM's
own release listings name as going to a particular BARMM province, city or
municipality, FY 2020 to date.

The listings are DBM's yearly registers of every Special Allotment Release
Order (SARO, an allotment: authority to obligate) and Notice of Cash
Allocation (NCA, cash: authority to pay). A release is neither an obligation
nor spending, and a SARO and the NCA that funds it are the same money twice —
never add the two kinds together.

What the listings can and cannot say. Local Government Support Fund releases
(Financial Assistance to LGUs, SGLG Incentive Fund, Growth Equity Fund,
Support to Barangay Development Program …) are issued to the Bureau of the
Treasury, almost always "for the recipient LGU per attached Schedule A" — and
Schedule A is not published. Only a handful of SAROs/NCAs write the LGU's name
into the purpose; those are what this file holds. The per-LGU LGSF figures sit
in DBM's Power BI dashboard (dbm.gov.ph/index.php/local-government-support-fund),
which has no export.

A row counts only when (1) it is issued to the Department of Finance (Bureau
of the Treasury) or to DBM itself — the two channels for money that goes to an
LGU as an LGU — and (2) its purpose names a BARMM LGU as "Municipality of X",
"City of X", "X City" or "Province of X". That excludes SAROs to DPWH's Cotabato
City district office, DepEd's Marawi City division, or national agencies
building in Marawi: money spent in a place, not released to its government.
The purpose is kept as printed, and `fund` only where the purpose names one
("chargeable against …"). Pre-split Maguindanao goes under "former".

Sources (dbm.gov.ph/index.php/special-allotment-release-order-saro and
…/notice-of-cash-allocation-nca-listing; sre.py has the curl line, without the
Referer):

    https://www.dbm.gov.ph/wp-content/uploads/SARO/2020/SARO-2020.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/2021/SARO-Releases-FY-2021.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/2022/UPDATED_SARO_2022.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/2023/UPDATED_SARO_2023.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/2024/SARO_2024.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/2025/SARO_2025.pdf
    https://www.dbm.gov.ph/wp-content/uploads/SARO/UPDATED_SARO.PDF   (FY 2026 to date)
    https://www.dbm.gov.ph/wp-content/uploads/NCA/... (same pattern; see NCA below)

    python3 datasets/lgu/scripts/build_fund_releases.py <dir holding the PDFs>

Files are looked up by their URL path with "/" turned into "_"
(SARO_2020_SARO-2020.pdf). A listing that is missing or has no text layer is
reported and skipped. Needs pdftotext (poppler). The PDFs are not committed.
"""
import datetime, html, json, pathlib, re, subprocess, sys, unicodedata
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/fund-releases.json'
DBM = 'https://www.dbm.gov.ph/wp-content/uploads'
if len(sys.argv) < 2:
    sys.exit(__doc__)
SRC = pathlib.Path(sys.argv[1])

SARO = {
    2020: 'SARO/2020/SARO-2020.pdf',
    2021: 'SARO/2021/SARO-Releases-FY-2021.pdf',
    2022: 'SARO/2022/UPDATED_SARO_2022.pdf',
    2023: 'SARO/2023/UPDATED_SARO_2023.pdf',
    2024: 'SARO/2024/SARO_2024.pdf',
    2025: 'SARO/2025/SARO_2025.pdf',
    2026: 'SARO/UPDATED_SARO.PDF',
}
NCA = {
    2020: 'NCA/2020/NCA-2020.pdf',
    2021: 'NCA/2021/NCA-Releases-FY-2021.pdf',
    2022: 'NCA/2022/NCA-Releases-FY-2022.pdf',
    2023: 'NCA/2023/NCA-Releases-FY-2023.pdf',
    2024: 'NCA/2024/NCA_2024.pdf',
    2025: 'NCA/2025/NCA_2025.pdf',
    2026: 'NCA/UPDATED_NCA.PDF',
}

WORD = re.compile(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="[\d.]+" yMax="[\d.]+">(.*?)</word>')


def pages(pdf):
    """Words as (x, y, text) in PDF points, per page.

    A listing with no text layer (FY 2023's NCAs are a scan) is read from
    tesseract TSV files in <pdf stem>.ocr/, made at 200 dpi:
        pdftoppm -r 200 -gray -png -f N -l N -singlefile <pdf> <dir>/i-NNNN
        tesseract <dir>/i-NNNN.png <dir>/p-NNNN --psm 6 tsv
    """
    out = subprocess.run(['pdftotext', '-bbox', str(pdf), '-'], capture_output=True, text=True).stdout
    found = WORD.search(out) is not None
    for page in out.split('<page ')[1:]:
        yield [(float(x), float(y), html.unescape(t)) for x, y, t in WORD.findall(page)]
    ocr = pdf.with_suffix('.ocr')
    if not found and ocr.is_dir():
        for tsv in sorted(ocr.glob('p-*.tsv')):
            words = []
            for row in tsv.read_text(errors='replace').splitlines()[1:]:
                f = row.split('\t')
                if len(f) == 12 and f[0] == '5' and f[11].strip():
                    words.append((int(f[6]) * 0.36, int(f[7]) * 0.36, f[11]))  # 200 dpi px -> pt
            yield words


def despace(s):
    """The FY 2023 SARO listing is partly letter-spaced: 'T o cover t h e' -> 'To cover the'."""
    return re.sub(r'\b(?:\w ){2,}\w\b', lambda m: m.group().replace(' ', ''), s)


def records(pdf, kind):
    """(number, text left of the purpose column, purpose) per listed SARO/NCA.

    Columns are found by the x of the PURPOSE header, which some listings
    print only on page 1; the last one seen carries over."""
    purpose_x = None
    for words in pages(pdf):
        head = [x for x, _, t in words if t == 'PURPOSE']
        purpose_x = head[0] if head else purpose_x
        if purpose_x is None:  # FY 2023 SARO has no header at all; its purpose column is where "To" sits most
            xs = [round(x) for x, _, t in words if t in ('To', 'T', 'Release', 'Funding')]
            purpose_x = max(set(xs), key=xs.count) if xs else None
            if purpose_x is None:
                continue
        starts = sorted((y, t) for x, y, t in words if x < 30 and t.startswith(kind + '-'))
        for i, (y, number) in enumerate(starts):
            nxt = starts[i + 1][0] if i + 1 < len(starts) else 1e9
            left = ' '.join(t for x, yy, t in sorted(words) if abs(yy - y) < 2 and x < purpose_x - 3)
            rows = []  # lines of the purpose cell; OCR'd words on one line differ in y by a point or two
            for yy, x, t in sorted((yy, x, t) for x, yy, t in words if y - 2 < yy < nxt - 2 and x >= purpose_x - 3):
                if not rows or yy - rows[-1][0] > 3:
                    rows.append((yy, []))
                rows[-1][1].append((x, t))
            first = sorted(rows[0][1]) if rows and rows[0][0] < y + 2 else []
            if first and first[-1][0] > purpose_x + 100 and MONEY.fullmatch(first[-1][1]):
                # FY 2021's NCA listing prints the amount right of the purpose
                left += ' ' + first[-1][1]
                rows[0][1].remove(first[-1])
            purpose = ' '.join(' '.join(t for _, t in sorted(r)) for _, r in rows)
            yield number, left, despace(purpose)


def squash(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())


# Matching runs on squashed text (letters and digits only), which survives the
# FY 2023 letter-spacing. Names the purposes may use beside the directory's.
TOWN = {squash(k): v for k, v in towns.items()}
TOWN.update({'datumontawal': towns['pagagawan'], 'salipadakpendatun': towns['gen s k pendatun'],
             'generalsalipadakpendatun': towns['gen s k pendatun'], 'datublahsinsuat': towns['datu blah t sinsuat'],
             'bumbaran': towns['amai manabilang'], 'tagoloan2': towns['tagoloan ii']})
CITY = {'marawi', 'lamitan', 'cotabato'}
PROV = {squash(k): v for k, v in provinces.items()}


NAMED = re.compile(r'(Municipality|City|Province|Provinces|(?:City|Municipal|Provincial) Government) of (?:the )?'
                   r'([A-Z][\w\'-]*(?: (?:del|de|sa|and|[A-Z][\w\'.-]*))*)')
BARMM_PROV = set(PROV) | {'maguindanao'}
LGU = r'(?:municipalityof|lguof|municipalgovernmentof)(?:the)?'


def recipients(purpose):
    """[(slug, is pre-split Maguindanao)] for each BARMM LGU the purpose names as recipient.

    Empty when the purpose names an LGU outside BARMM (Tuburan, Cebu shares a
    name with Tuburan, Basilan; the City of Isabela sits in Basilan province
    but not in BARMM)."""
    for level, name in NAMED.findall(purpose):
        n = squash(name)
        ok = BARMM_PROV if level.startswith('Provinc') else TOWN
        if not any(n.startswith(k) for k in ok):
            return []
    s, found = squash(purpose), []
    for name in sorted(TOWN, key=len, reverse=True):  # longest first: northernkabuntalan before kabuntalan
        pat = f'(?:cityof|citygovernmentof)(?:the)?{name}|{name}city' if name in CITY else LGU + name
        if re.search(pat, s):
            found.append((TOWN[name], False))
            s = re.sub(pat, '#', s)
    if found:
        return found
    for m in re.finditer(r'(?:provinces?of|provincialgovernmentof)(?:the)?(.{0,60})', s):
        tail = m.group(1)
        for name in sorted(PROV, key=len, reverse=True):
            if tail.startswith(name) or 'and' + name in tail[:40]:
                found.append((PROV[name], False))
                tail = tail.replace(name, '#')
        if re.match(r'maguindanao(?!del)|.{0,30}andmaguindanao(?!del)', tail):
            found.append(('maguindanao', True))
    if re.search(r'maguindanaoprovince', s) and not found:
        found.append(('maguindanao', True))
    return list(dict.fromkeys(found))


# The matching rules, on purposes as DBM prints them.
assert recipients('projects of Municipality of Tuburan, Province of Cebu per attached Schedule A') == []
assert recipients('project of the City of Isabela, Province of Basilan per attached Schedule A') == []
assert recipients('project of the City of Marawi, Province of Lanao del Sur') == [(towns['marawi'], False)]
assert recipients('Activities of the City Government of Marawi per attached Annex A') == [(towns['marawi'], False)]
assert recipients('of the Municipality of Northern Kabuntalan, Maguindanao') == [(towns['northern kabuntalan'], False)]
assert recipients('of the Provinces of Lanao del Sur and Maguindanao per attached') == [('lanao-del-sur', False), ('maguindanao', True)]
assert recipients('share of the Province of Maguindanao from the CY 2012') == [('maguindanao', True)]
assert recipients('devolved to the Province of Cotabato per attached Schedule A') == []


CHANNEL = re.compile(r'Department of Finance|Bureau of the Treasury|Department of Budget|Budget and Management', re.I)
DATE = re.compile(r'(\d\d)/(\d\d)/(\d{2,4})')


MONEY = re.compile(r'-?\d{1,3}(?:,\d{3})+(?:\.\d\d)?|-?\d+\.\d\d|-?\.\d\d')


def parse_left(kind, number, left):
    """Amount and release date from the columns outside the purpose."""
    rest = left[len(number):].strip()
    if kind == 'SARO':  # amount first; FY 2023 glues it to the date: "66,550,000.0012/29/2023"
        m = re.match(r'-?[\d,]*\d(?:\.\d\d)?|-?\.\d\d', rest)
        amount, rest = (m.group(), rest[m.end():]) if m else (None, rest)
    else:  # NCA: the last money-shaped token
        found = [t for t in rest.split() if MONEY.fullmatch(t)]
        amount = found[-1] if found else None
    rest = re.sub(r'(?<=[\d/]) (?=[\d/])', '', rest)  # "1 2 / 2 9 / 2 0 2 3" -> "12/29/2023"
    dates = [d for d in DATE.findall(rest) if d[0] != '00']
    date = None
    if dates:
        mm, dd, yy = dates[-1]  # released date when both are printed
        date = f'{int(yy) + 2000 if len(yy) == 2 else yy}-{mm}-{dd}'
    return (float(amount.replace(',', '')) if amount and amount.strip('-.,') else 0.0 if amount else None), date


FUND = re.compile(r'chargeable against (?:the )?(.+?)(?:,? (?:under the )?(?:FY \d{4} )?General Appropriations|,? Republic Act|,? RA No|\.?$)', re.I)

units, former, shared, read, skipped, odd = {}, {}, [], [], [], []
for kind, files in (('SARO', SARO), ('NCA', NCA)):
    for year, rel in files.items():
        path = SRC / rel.replace('/', '_')
        if not path.exists():
            skipped.append(f'{kind} {year}: not downloaded ({DBM}/{rel})')
            continue
        ocr = not subprocess.run(['pdftotext', '-l', '1', str(path), '-'], capture_output=True, text=True).stdout.strip()
        n = 0
        for number, left, purpose in records(path, kind):
            n += 1
            if not CHANNEL.search(left):
                continue
            named = recipients(purpose)
            if not named:
                continue
            amount, date = parse_left(kind, number, left)
            if amount is None or date is None:
                odd.append(f'{number}: could not read amount/date from {left!r}')
                continue
            fund = FUND.search(purpose)
            rec = {'kind': kind, 'number': number, 'fund': fund.group(1).strip() if fund else None,
                   'purpose': purpose, 'amount': amount, 'date': date, 'href': f'{DBM}/{rel}'}
            if ocr:
                rec['ocr'] = True  # read by tesseract from a scan: checked against the page image
            brgy = re.search(r'Barangay ([A-Z][\w\'-]*(?: [A-Z][\w\'-]*)*)', purpose)
            if brgy:
                rec['barangay'] = brgy.group(1)
            if len(named) > 1:  # one amount for several LGUs: not split, kept whole
                shared.append({**rec, 'units': [slug for slug, _ in named]})
                continue
            slug, was = named[0]
            (former if was else units).setdefault(slug, {}).setdefault(date[:4], []).append(rec)
        if n == 0:
            skipped.append(f'{kind} {year}: no text layer and no OCR ({DBM}/{rel})')
        else:
            read.append({'label': f'DBM — {kind} listing, FY {year}' + (' (to date)' if year == 2026 else ''),
                         'href': f'{DBM}/{rel}', 'fiscalYear': year, 'kind': kind, 'records': n})

for target in (units, former):
    for years in target.values():
        for recs in years.values():
            recs.sort(key=lambda r: (r['date'], r['number']))

data = {
    'name': 'National fund releases named to BARMM local governments',
    'generatedAt': datetime.date.today().isoformat(),
    'source': read,
    'note': (
        'Releases DBM\'s SARO and NCA listings name as going to one BARMM province, city or municipality, in pesos. '
        'A SARO is an allotment (authority to obligate) and an NCA is cash (authority to pay): a release is not '
        'spending, and a SARO and its NCA are the same money, so never add the two kinds. Only releases issued to the '
        'Bureau of the Treasury or DBM whose purpose writes the LGU\'s name are here; a negative amount is a '
        'withdrawal. This is NOT the LGUs\' full Local Government Support Fund take: nearly every LGSF release '
        '(Financial Assistance to LGUs, SGLG Incentive Fund, Growth Equity Fund, Support to Barangay Development '
        'Program) is listed as "for the recipient LGU per attached Schedule A", and DBM does not publish Schedule A. '
        'The per-LGU LGSF releases are only in DBM\'s Power BI dashboard, which offers no export and could not be '
        'read. Releases to the Bangsamoro Government itself (Allocations to LGUs — BARMM) are regional, not local, '
        'and are left out, as is money national agencies spend in a place (a DPWH district office, a DepEd '
        'division, a hospital in Marawi). The NTA is in nta.json. Sulu is left out; pre-split Maguindanao is '
        'under "former". A release that names several LGUs for one amount is under "shared", not split. "fund" is what the purpose says it is chargeable against, null where it says nothing; '
        '"barangay" is set where the purpose names one. DBM\'s FY 2023 NCA listing is a scan: its records were read '
        'by OCR, are flagged "ocr", and were checked by eye against the page. Listings that could not be read are '
        'named in "missing".'
    ),
    'missing': skipped,
    'years': sorted({int(y) for t in (units, former) for v in t.values() for y in v}),
    'units': dict(sorted(units.items())),
    'former': former,
    'shared': shared,
}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')

print(f'wrote {OUT.relative_to(ROOT)}: {sum(len(r) for v in units.values() for r in v.values())} releases to '
      f'{len(units)} units, {sum(len(r) for v in former.values() for r in v.values())} former')
print('listings read:', [(s['kind'], s['fiscalYear'], s['records']) for s in read])
print('skipped:', skipped or 'none')
print('rows matched but unreadable:', odd or 'none')
