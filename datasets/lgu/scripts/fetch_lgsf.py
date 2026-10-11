#!/usr/bin/env python3
"""Write datasets/lgu/lgsf.json — every Local Government Support Fund project
DBM lists for a BARMM local government, FY 2022 to date.

Source: DBM's COMPASS portal (compass.dbm.gov.ph/lgsf), read through the same
public tRPC endpoint its pages call. One row per project as DBM lists it:
the program, the fiscal year, the LGU (province, city or municipality,
barangay where named), the project, and two amounts — the SARO (allotment,
authority to obligate) and the NCA (cash released). A SARO and its NCA are
the same money; never add the two.

    python3 datasets/lgu/scripts/fetch_lgsf.py
"""
import json, pathlib, sys, urllib.parse, urllib.request
from datetime import date

sys.argv = sys.argv[:1]
from sre import norm, provinces, towns

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/lgu/lgsf.json'
API = 'https://compass-api.dbm.gov.ph/trpc'
REGION = 'Bangsamoro Autonomous Region in Muslim Mindanao'
PROGRAMS = {
    'LGSF_FA': ('FALGU', 'Financial Assistance to LGUs', 'falgu'),
    'LGSF_GEF': ('GEF', 'Growth Equity Fund', 'gef'),
    'LGSF_GGG': ('GGG', 'Green, Green, Green Program', 'ggg'),
    'LGSF_SBDP': ('SBDP', 'Support to the Barangay Development Program', 'sbdp'),
    'LGSF_SAFPB': ('SAFPB', 'Support and Assistance Fund to Participatory Budgeting', 'safpb'),
}
SIZE = 200


def call(proc, params):
    url = f'{API}/{proc}?batch=1&input=' + urllib.parse.quote(json.dumps({'0': params}))
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://compass.dbm.gov.ph/'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)[0]['result']['data']


def main():
    datasets = call('meta.datasets', {})['items']
    years = {}
    for d in datasets:
        if d['sourceType'] in PROGRAMS:
            years.setdefault(d['sourceType'], set()).add(d['fiscalYear'])

    projects = []
    for source, (code, name, _) in PROGRAMS.items():
        for fy in sorted(years.get(source, ())):
            page, got = 1, []
            while True:
                data = call('lgsf.projects', {'source': source, 'fy': fy, 'region': REGION, 'page': page, 'pageSize': SIZE})
                got += data['rows']
                if len(got) >= data['total'] or not data['rows']:
                    break
                page += 1
            assert len(got) == data['total'], (source, fy, len(got), data['total'])
            for r in got:
                # Sulu left BARMM in 2024, and Isabela City is in Basilan but in
                # Region IX: neither is in the directory. The rest get the
                # directory key of the LGU named, or the province's.
                if r['province'] == 'Sulu' or norm(r['cityMunicipality'] or '') == 'isabela':
                    continue
                town = towns.get(norm(r['cityMunicipality'] or ''))
                province = provinces.get(norm(r['province'] or ''))
                assert (town or not r['cityMunicipality']) and (town or province) or norm(r['province']) == 'special geographic area', r
                projects.append({
                    'unit': town or province,
                    'program': code,
                    'year': r['fiscalYear'],
                    'province': r['province'],
                    'lgu': r['cityMunicipality'],
                    'barangay': r['barangay'],
                    'project': ' '.join((r['projectName'] or '').split()),
                    'saro': r['amountSaro'] if r['amountSaro'] is not None else r['amountTotal'],
                    'nca': r['amountNca'],
                })
            print(code, fy, data['total'], data['totalAmountSaro'])

    OUT.write_text(json.dumps({
        'name': 'Local Government Support Fund projects of BARMM local governments',
        'generatedAt': date.today().isoformat(),
        'source': [{'label': f'DBM COMPASS — LGSF, {name}', 'href': f'https://compass.dbm.gov.ph/lgsf/{slug}'} for code, name, slug in PROGRAMS.values()],
        'note': 'Each project DBM lists under the Local Government Support Fund for a BARMM province, city, municipality or barangay, in pesos. "saro" is the allotment (authority to obligate) and "nca" the cash released so far; they are the same money, so never add them. A release is not spending: it says what an LGU was given, not what it built. "lgu" is null where DBM names only the province. Names are as DBM writes them; "unit" is the directory key they match. Sulu, in BARMM until 2024, is left out, as is Isabela City, which DBM files under BARMM but is in Region IX.',
        'programs': [{'code': code, 'name': name} for code, name, _ in PROGRAMS.values()],
        'projects': projects,
    }, ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__':
    main()
