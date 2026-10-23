"""Shared by build_nta.py and build_finances.py: reading BLGF's Statement of
Receipts and Expenditures (SRE) by LGU workbooks, and matching their rows to
the directory.

The workbooks sit behind a WAF at blgf.gov.ph that refuses curl's defaults
but lets a browser's headers through:

    curl --http1.1 -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' \\
         -H 'Accept-Language: en-US,en;q=0.9' -H 'Referer: https://blgf.gov.ph/lgu-fiscal-data/' -O <url>
"""
import json, os, pathlib, re, sys, tempfile, unicodedata, zipfile
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[3]
DIRECTORY = ROOT / 'datasets/lgu/barmm-lgu.json'
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'blgf-sre'))
BLGF = 'https://blgf.gov.ph/wp-content/uploads'

# PSGC 153822000: BLGF still files it under the name it had, the directory under the one it has.
# The rest are BLGF spellings (FY 2020 LDRRMF/SEF, the borrowing certificates).
ALIASES = {
    'datu montawal': 'pagagawan',
    'bumbaran': 'amai manabilang',
    'datu salibu': 'datu salibo',
    'shariff saydona mustahpa': 'shariff saydona mustapha',
    'datu blah sinsuat': 'datu blah t sinsuat',  # FY 2016–2017 ARI
}

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'


def first_sheet(path):
    """Rows of the workbook's first sheet. The stdlib reads xlsx well enough."""
    z = zipfile.ZipFile(path)
    shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
              for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(NS + 'si')]
    sheet = sorted(n for n in z.namelist() if re.fullmatch(r'xl/worksheets/sheet\d+\.xml', n))[0]
    for r in ET.fromstring(z.read(sheet)).iter(NS + 'row'):
        row = {}
        for c in r.findall(NS + 'c'):
            v = c.find(NS + 'v')
            if v is None:
                continue
            col = 0
            for ch in re.match(r'[A-Z]+', c.get('r')).group():
                col = col * 26 + ord(ch) - 64
            row[col - 1] = shared[int(v.text)] if c.get('t') == 's' else (v.text if c.get('t') else float(v.text))
        yield [row.get(i) for i in range(max(row, default=-1) + 1)]


def norm(name):
    s = unicodedata.normalize('NFKD', name).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)', '', s)  # FY 2020 files add the old name: "Balindong (Watu)"
    s = re.sub(r'\bcity of\b|\bcity\b', '', s)
    s = re.sub(r'[^a-z0-9]+', ' ', s).strip()
    return ALIASES.get(s, s)


directory = json.load(open(DIRECTORY))
provinces = {norm(p['name']): p['slug'] for p in directory['provinces'] if p['kind'] == 'Province'}
towns = {}
for p in directory['provinces']:
    for m in p['municipalities']:
        key = norm(m['name'])
        assert key not in towns, f'two directory towns normalise to {key!r}'
        towns[key] = f"{p['slug']}/{m['slug']}"
