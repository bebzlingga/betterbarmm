#!/usr/bin/env python3
"""Write datasets/lgu/nta-shares.json — DBM's National Tax Allotment share for
each BARMM province, city and municipality, and the total for its barangays.

Source: DBM's COMPASS portal (compass.dbm.gov.ph/nta), whose export is the
per-LGU table DBM never published before: one sheet each for regions,
provinces, cities, municipalities and barangays. It holds the allocation
DBM set for the year, not what a treasurer reported receiving (that is the
BLGF figure in finances.json). The export carries FY 2026 and the FY 2027
figure alongside it; earlier years are not in it.

    python3 datasets/lgu/scripts/fetch_nta_shares.py
"""
import json, re, sys, tempfile, urllib.request, zipfile
import xml.etree.ElementTree as ET
from datetime import date

sys.argv = sys.argv[:1]
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/nta-shares.json'
URL = 'https://compass-api.dbm.gov.ph/api/v1/public/nta/export?fy=2026'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'


def sheets(path):
    """Every sheet's rows. The export writes its strings inline."""
    z = zipfile.ZipFile(path)
    names = [s.get('name') for s in ET.fromstring(z.read('xl/workbook.xml')).iter(NS + 'sheet')]
    out = {}
    for i, name in enumerate(names, 1):
        rows = []
        for _, el in ET.iterparse(z.open(f'xl/worksheets/sheet{i}.xml')):
            if el.tag != NS + 'row':
                continue
            row = {}
            for c in el.findall(NS + 'c'):
                col = 0
                for ch in re.match(r'[A-Z]+', c.get('r')).group():
                    col = col * 26 + ord(ch) - 64
                if c.get('t') == 'inlineStr':
                    row[col - 1] = ''.join(x.text or '' for x in c.iter(NS + 't'))
                elif (v := c.find(NS + 'v')) is not None:
                    row[col - 1] = float(v.text) if c.get('t') is None else v.text
            rows.append([row.get(k) for k in range(max(row) + 1)] if row else [])
            el.clear()
        out[name] = rows
    return out


def main():
    path = tempfile.gettempdir() + '/nta_export_2026.xlsx'
    urllib.request.urlretrieve(URL, path)
    book = sheets(path)
    head = book['Provinces'][0]
    years = [int(h[3:]) for h in head if isinstance(h, str) and re.fullmatch(r'FY \d{4}', h)]
    # Only years the export fills; the earlier columns are written as 0.
    years = [y for y in years if any(r and r[head.index(f'FY {y}')] for r in book['Provinces'][1:])]

    def figures(row, header):
        return {str(y): row[header.index(f'FY {y}')] for y in years}

    units, unmatched = {}, []
    for sheet, level in (('Provinces', 'province'), ('Cities', 'lgu'), ('Municipalities', 'lgu'), ('Barangays', 'barangays')):
        header = book[sheet][0]
        for r in book[sheet][1:]:
            if not r or r[0] != 'BARMM':
                continue
            if level == 'province':
                key = provinces.get(norm(r[1]))
            else:
                key = towns.get(norm(r[2]))
            if key is None:
                unmatched.append(f'{sheet}: {r[1]} / {r[2]}')
                continue
            slot = units.setdefault(key, {}).setdefault(level, {})
            for y, v in figures(r, header).items():
                slot[y] = round(slot.get(y, 0) + v, 2)

    region = next(r for r in book['Regions'] if r and r[0] == 'BARMM')
    OUT.write_text(json.dumps({
        'name': 'National Tax Allotment shares of BARMM local governments (DBM)',
        'generatedAt': date.today().isoformat(),
        'source': [{'label': 'DBM COMPASS — National Tax Allotment', 'href': 'https://compass.dbm.gov.ph/nta'}],
        'note': 'The NTA share DBM set for each BARMM LGU, in pesos: "province" is a province government\'s own share, "lgu" a city\'s or municipality\'s, "barangays" the total of its barangays\' shares. An allocation, not a receipt: what each treasurer reported receiving is BLGF\'s figure in finances.json. "region" is DBM\'s BARMM total, barangays included.',
        'years': years,
        'region': figures(region, book['Regions'][0]),
        'units': dict(sorted(units.items())),
    }, ensure_ascii=False, indent='\t') + '\n')
    print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units, {years}')
    print('unmatched:', unmatched or 'none')
    print('directory units with no figure:', sorted((set(provinces.values()) | set(towns.values())) - set(units)) or 'none')


if __name__ == '__main__':
    main()
