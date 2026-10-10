#!/usr/bin/env python3
"""Write datasets/lgu/fdpp-codes.json — the codes DILG's Full Disclosure
Policy Portal filters its public report by, for every BARMM unit.

The report takes them in the URL, so a page can link straight to one
unit's postings:

  /fdpp/report/index?region_filter=19&province_filter=007&lgu_filter=02
  &document_filter=1&docperiod_filter=on&year_filter=2025

`province_filter` is PSA's newer three-digit province code (Basilan 007,
Lanao del Sur 036, Tawi-Tawi 070, Maguindanao del Norte 087, del Sur 088,
the Special Geographic Area 999); `lgu_filter` is the two-digit municipal
code under it. The dropdowns that list them sit behind a login, so they
are found here by asking: each province code with lgu_filter 01 to 70,
and the town the answer names. Cotabato City is filed under Maguindanao
del Norte.

    python3 datasets/lgu/scripts/fdpp_codes.py
"""
import json, pathlib, re, subprocess, sys, time

sys.argv = sys.argv[:1]
from sre import norm, towns  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/lgu/fdpp-codes.json'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36'
PROVINCES = {'007': 'basilan', '036': 'lanao-del-sur', '070': 'tawi-tawi',
             '087': 'maguindanao-del-norte', '088': 'maguindanao-del-sur', '999': 'special-geographic-area'}


def town_named(province, lgu):
    url = f'https://fdpp.dilg.gov.ph/fdpp/report/index?region_filter=19&province_filter={province}&lgu_filter={lgu}'
    page = subprocess.run(['curl', '-sS', '--max-time', '90', '-A', UA, url], capture_output=True).stdout.decode('utf-8', 'replace')
    names = re.findall(r'<br>([^<]*?)</span>', page)
    return names[0].strip() if names else None


units = {slug: {'province': code} for code, slug in PROVINCES.items()}
for code, province in PROVINCES.items():
    for n in range(1, 71):
        lgu = f'{n:02d}'
        name = town_named(code, lgu)
        time.sleep(0.8)
        if not name:
            continue
        key = towns.get(norm(name))
        print(code, lgu, name, '->', key, file=sys.stderr)
        if key:
            units[key] = {'province': code, 'lgu': lgu}
OUT.write_text(json.dumps({'base': 'https://fdpp.dilg.gov.ph/fdpp/report/index?region_filter=19',
                           'units': dict(sorted(units.items()))}, indent=1) + '\n')
print(f'{len(units)} units -> {OUT}', file=sys.stderr)
