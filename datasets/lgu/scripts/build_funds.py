#!/usr/bin/env python3
"""Write datasets/lgu/funds.json — the rest of what the Bureau of Local
Government Finance publishes per LGU, for each BARMM province, city and
municipality, beside the SRE in finances.json:

  dependency     Annual Regular Income and how much of it is the NTA,
                 FY 2009–2025 (BLGF computes the ratios; they are copied).
  disasterFund   The Local DRRM Fund — what the council APPROPRIATED and what
                 was SPENT, 70% mitigation part and 30% Quick Response Fund,
                 FY 2018–2025. The only per-LGU record here that sets a budget
                 beside its spending.
  educationFund  Special Education Fund — the SEF real property tax collected
                 and what it was spent on, FY 2009–2025.
  propertyRoll   Real property assessment roll, FY 2022 only: taxable land
                 area, property units, market and assessed value, and the tax
                 collectible on them.
  borrowing      Every Certificate of Net Debt Service Ceiling and Borrowing
                 Capacity DOF issued to a BARMM LGU, January 2022 – September
                 2026: the loan proposed, its purpose, and the ceiling and
                 capacity BLGF certified. A certificate is permission to
                 borrow, not a loan.

Rows are BARMM's by province (BARMM_PROVINCES), since BLGF's region column
says ARMM before 2019 and is wrong in FY 2021's LDRRMF; they are matched to
the directory exactly as in build_finances.py: Sulu is left out, pre-split Maguindanao's province rows go under "former", and a row
whose every figure is zero is a year the LGU did not report — left out.

Sources (blgf.gov.ph/lgu-fiscal-data/ — sre.py has the curl line); every
URL is in the output's `source` lists.

    python3 datasets/lgu/scripts/build_funds.py [dir holding the .xlsx files]
"""
import datetime, json, re, sys, zipfile
from sre import BLGF, NS, ROOT, SRC, ET, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/funds.json'
FORMER = {'maguindanao': 'maguindanao'}
KINDS = ('Province', 'City', 'Municipality')
# A row is BARMM's by its province, not by BLGF's region column: before 2019 the region is "ARMM" and Cotabato City
# sits under Region XII, and FY 2021's LDRRMF workbook files every BARMM LGU under Region IX or XII. Isabela City is in
# Basilan province but was never in the region.
# Cotabato City is admitted by name and type: norm() reads the province "Cotabato" (North Cotabato) the same way.
BARMM_PROVINCES = {'basilan', 'lanao del sur', 'maguindanao', 'maguindanao del norte', 'maguindanao del sur', 'tawi tawi'}
NOT_BARMM = {'isabela'}


def sheets(path):
    """Every sheet's rows. Unlike sre.first_sheet, keeps inline strings and reads all sheets."""
    z = zipfile.ZipFile(path)
    shared = [''.join(t.text or '' for t in si.iter(NS + 't'))
              for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(NS + 'si')]
    names = sorted((n for n in z.namelist() if re.fullmatch(r'xl/worksheets/sheet\d+\.xml', n)),
                   key=lambda n: int(re.findall(r'\d+', n)[-1]))
    for name in names:
        rows = []
        for r in ET.fromstring(z.read(name)).iter(NS + 'row'):
            row = {}
            for c in r.findall(NS + 'c'):
                v = c.find(NS + 'v')
                if v is None:
                    t = c.find(NS + 'is')
                    if t is None:
                        continue
                    val = ''.join(x.text or '' for x in t.iter(NS + 't'))
                else:
                    val = shared[int(v.text)] if c.get('t') == 's' else (v.text if c.get('t') else float(v.text))
                col = 0
                for ch in re.match(r'[A-Z]+', c.get('r')).group():
                    col = col * 26 + ord(ch) - 64
                row[col - 1] = val
            rows.append([row.get(i) for i in range(max(row, default=-1) + 1)])
        yield rows


def number(v):
    try:
        return float(str(v).replace(',', ''))
    except (TypeError, ValueError):
        return None


def match(name, kind):
    """(table, slug) for a BLGF row, or (None, None)."""
    if kind == 'Province':
        if norm(name) in provinces:
            return 'units', provinces[norm(name)]
        if norm(name) in FORMER:
            return 'former', FORMER[norm(name)]
        return None, None
    return ('units', towns[norm(name)]) if norm(name) in towns else (None, None)


def table(rows):
    """(id columns, header text per column, data rows) for a by-LGU sheet, or None.
    Header text is every header row's cell in that column, joined — no guessing at merged cells."""
    h = next((i for i, r in enumerate(rows[:20]) if any(str(v).strip().upper() == 'LGU NAME' for v in r)), None)
    if h is None:
        return None
    labels = rows[h]
    first = next(i for i in range(h + 1, len(rows)) if any(str(v).strip() in KINDS for v in rows[i][:6]))
    ids = {str(v).strip().upper(): c for c, v in enumerate(labels) if v not in (None, '')}
    ids['LGU TYPE'] = ids.get('LGU TYPE', ids.get('LGU CODE'))  # FY 2021 LDRRMF heads the type column "LGU CODE"
    ids = {k: ids[label] for k, label in
           (('region', 'REGION'), ('province', 'PROVINCE'), ('name', 'LGU NAME'), ('kind', 'LGU TYPE'))}
    width = max(len(r) for r in rows[:first + 1])
    text = [' '.join(str(r[c]).replace('\n', ' ') for r in rows[:first] if c < len(r) and r[c] not in (None, ''))
            for c in range(width)]
    return ids, text, rows[first:]


def by_lgu(spec, files, sheet=0, shift=None):
    """Read one by-LGU table per year into {units, former}, as rows of values in `spec` order.
    spec is [(key, 'n'|'text', column, header keyword)]; `shift(text)` moves the columns for older layouts."""
    out = {'units': {}, 'former': {}}
    unmatched, unreported, missing = [], [], []
    for year, (folder, name) in files.items():
        path = SRC / name
        if not path.exists():
            sys.exit(f'missing {path} — download {BLGF}/{folder}/{name}')
        ids, text, rows = [t for t in map(table, sheets(path)) if t][sheet]
        d = shift(text) if shift else 0
        for key, _, col, keyword in spec:
            assert keyword.lower() in text[col + d].lower(), f'{name}: column {col + d} is {text[col + d]!r}, expected {key}'
        seen = False
        for r in rows:
            cell = lambda c: r[c] if c < len(r) else None
            city = norm(str(cell(ids['name']))) == 'cotabato' and str(cell(ids['kind'])).strip() == 'City'
            if (norm(str(cell(ids['province']))) not in BARMM_PROVINCES and not city) or norm(str(cell(ids['name']))) in NOT_BARMM:
                continue
            seen = True
            where, key = match(str(cell(ids['name'])), str(cell(ids['kind'])).strip())
            if key is None:
                unmatched.append(f'{year} {cell(ids["province"])} / {cell(ids["name"])}')
                continue
            values = [cell(col + d) if kind == 'text' else number(cell(col + d)) for _, kind, col, _ in spec]
            values = [round(v, 4) if isinstance(v, float) else v for v in values]
            if not any(v for v, (_, kind, _, _) in zip(values, spec) if kind != 'text'):
                unreported.append(f'{year} {key}')
                continue
            assert str(year) not in out[where].get(key, {}), f'{year} {key} twice'
            out[where].setdefault(key, {})[str(year)] = values
        if not seen:
            missing.append(year)
    return out, unmatched, unreported, missing


def sources(label, files):
    return [{'label': f'BLGF — {label}, FY {y}', 'href': f'{BLGF}/{folder}/{name}', 'fiscalYear': y}
            for y, (folder, name) in files.items()]


report = {}

# ---- Annual Regular Income and dependency ---------------------------------
ARI_FILES = {y: ('2025/03', f'By-LGU-ARI-and-Dependencies-{y}.xlsx') for y in range(2009, 2024)}
ARI_FILES[2024] = ('2026/03', 'By-LGU-ARI-and-Dependencies-2024.xlsx')
ARI_FILES[2025] = ('2026/05', 'By-LGU-ARI-and-Dependencies-2025Preliminary.xlsx')
ARI = [  # (key, kind, column, header keyword) — FY 2020–2022 have INCOME CLASS at 5, one column earlier
    ('localSources', 'n', 13, 'TOTAL L'),
    ('interestIncome', 'n', 14, 'INTEREST INCOME'),
    ('nta', 'n', 15, 'ALLOTMENT'),
    ('economicZoneShare', 'n', 16, 'Economic Zone'),
    ('evatShare', 'n', 17, 'EVAT'),
    ('nationalWealthShare', 'n', 18, 'National Wealth'),
    ('gamingShare', 'n', 19, 'Pagcor'),
    ('tobaccoShare', 'n', 20, 'Tobacco'),
    ('otherShares', 'n', 21, 'Others'),
    ('otherSharesTotal', 'n', 22, 'TOTAL OTHER SHARES'),
    ('annualRegularIncome', 'n', 23, 'ANNUAL REGULAR INCOME'),
    ('localSourcesDependency', 'n', 24, 'LSR DEPENDENCY'),
    ('ntaDependency', 'n', 25, 'A DEPENDENCY'),
    ('otherSharesDependency', 'n', 26, 'OTHER SHARES FROM NATIONAL TAX DEPENDENCY'),
]
ARI_LABELS = {
    'localSources': 'Total locally sourced revenue', 'interestIncome': 'Interest income',
    'nta': 'National Tax Allotment (IRA before FY 2022)', 'economicZoneShare': 'Share from economic zones (RA 7227)',
    'evatShare': 'Share from EVAT', 'nationalWealthShare': 'Share from national wealth',
    'gamingShare': 'Share from PAGCOR, PCSO and lotto', 'tobaccoShare': 'Share from tobacco excise tax (RA 7171)',
    'otherShares': 'Other shares, other', 'otherSharesTotal': 'Total other shares from national tax collections',
    'annualRegularIncome': 'Annual Regular Income', 'localSourcesDependency': 'Locally sourced revenue ÷ ARI',
    'ntaDependency': 'NTA ÷ ARI', 'otherSharesDependency': 'Other national shares ÷ ARI',
}
dependency, *report['dependency'] = by_lgu(ARI, ARI_FILES, shift=lambda text: int('INCOME CLASS' in text[5].upper()))

# Cross-check: BLGF's ARI and its SRE are the same treasurer's report.
fin = json.load(open(ROOT / 'datasets/lgu/finances.json'))
fk = [f['key'] for f in fin['fields']]
off = [f'{y} {k}' for k, ys in dependency['units'].items() for y, v in ys.items()
       if y in fin['units'].get(k, {}) and abs(v[2] - fin['units'][k][y][fk.index('nta')]) > 1]
report['dependency'].append(off)

# ---- Local DRRM Fund ------------------------------------------------------
DRRM_FILES = {
    2018: ('2025/01', 'FY2018-LDRRMF-by-LGU.xlsx'), 2019: ('2025/01', 'FY2019-LDRRMF-by-LGU.xlsx'),
    2020: ('2025/04', 'FY2020-LDRRMF-by-LGU.xlsx'), 2021: ('2025/01', 'FY2021-LDRRMF-by-LGU.xlsx'),
    2022: ('2025/04', 'FY2022-LDRRMF-by-LGU.xlsx'), 2023: ('2026/09', 'FY2023-LDRRMF-by-LGU.xlsx'),
    2024: ('2026/01', 'FY2024-LDRRMF-by-LGU.xlsx'), 2025: ('2026/06', 'FY2025-LDRRMF-by-LGU.xlsx'),
}
DRRM = [
    ('mitigationAppropriated', 'n', 5, '70% LDRRMF'),
    ('mitigationSpent', 'n', 6, 'Expenditures'),
    ('quickResponseAppropriated', 'n', 7, 'QUICK RESPONSE'),
    ('quickResponseSpent', 'n', 8, 'Expenditures'),
    ('appropriated', 'n', 9, 'TOTAL Budget Appropriation'),
    ('spent', 'n', 10, 'Expenditures'),
]
DRRM_LABELS = {
    'mitigationAppropriated': '70% LDRRMF — appropriated', 'mitigationSpent': '70% LDRRMF — spent',
    'quickResponseAppropriated': '30% Quick Response Fund — appropriated',
    'quickResponseSpent': '30% Quick Response Fund — spent',
    'appropriated': 'Total LDRRMF — appropriated', 'spent': 'Total LDRRMF — spent',
}
disaster, *report['disasterFund'] = by_lgu(DRRM, DRRM_FILES)

# ---- Special Education Fund (two sheets: income, then spending) -----------
SEF_FILES = {y: ('2025/06', f'FY{y}-SEF-Income-and-Expenditures.xlsx') for y in range(2009, 2024)}
SEF_FILES[2024] = ('2026/01', 'FY2024-SEF-Income-and-Expenditures.xlsx')
SEF_FILES[2025] = ('2026/06', 'FY2025-SEF-Income-and-Expenditures.xlsx')
SEF_IN = [('rptCollected', 'n', 5, 'RPT Collections')]
SEF_OUT = [
    ('generalAdministration', 'n', 5, 'General Administration'),
    ('subsidiaryServices', 'n', 6, 'Subsidiary'),
    ('elementary', 'n', 7, 'Elementary'),
    ('secondary', 'n', 8, 'Secondary'),
    ('vocational', 'n', 9, 'Vocational'),
    ('tertiary', 'n', 10, 'University'),
    ('adultEducation', 'n', 11, 'Adult'),
    ('sportsFacilities', 'n', 12, 'Sports'),
    ('manpowerDevelopment', 'n', 13, 'Manpower'),
    ('other', 'n', 14, 'Others'),
    ('debtPrincipal', 'n', 15, 'Loan Amortization'),
    ('debtInterest', 'n', 16, 'Interest Payment'),
    ('spent', 'n', 17, 'Total Expenditures'),
]
SEF_LABELS = {
    'rptCollected': 'Real property tax collected for the SEF', 'generalAdministration': 'General administration',
    'subsidiaryServices': 'Education subsidiary services', 'elementary': 'Elementary schools',
    'secondary': 'Secondary schools', 'vocational': 'Vocational and technical schools',
    'tertiary': 'University and college education', 'adultEducation': 'Adult education',
    'sportsFacilities': 'Sports centres, athletic fields and playgrounds',
    'manpowerDevelopment': 'Manpower development', 'other': 'Other', 'debtPrincipal': 'Loan principal repaid',
    'debtInterest': 'Loan interest paid', 'spent': 'Total SEF spending',
}
sef_in, *r_in = by_lgu(SEF_IN, SEF_FILES, sheet=0)
sef_out, *r_out = by_lgu(SEF_OUT, SEF_FILES, sheet=1)
education = {'units': {}, 'former': {}}
for part, at in ((sef_in, 0), (sef_out, 1)):
    for where in ('units', 'former'):
        for key, ys in part[where].items():
            for y, v in ys.items():
                row = education[where].setdefault(key, {}).setdefault(y, [None] * (1 + len(SEF_OUT)))
                row[at:at + len(v)] = v
report['educationFund'] = [r_in[0] + r_out[0], r_in[1] + r_out[1], sorted(set(r_in[2]) | set(r_out[2]))]

# ---- Real property assessment roll, FY 2022 -------------------------------
RPAR_FILES = {2022: ('2024/05', 'Annex-A-FY2022-RPAR-by-LGUs.xlsx')}
RPAR = [
    ('incomeClass', 'text', 5, 'Income Class'),
    ('taxableLandArea', 'n', 7, 'Land Area'),
    ('taxableUnits', 'n', 12, 'Total'),
    ('taxableMarketValue', 'n', 18, 'Total'),
    ('taxableAssessedValue', 'n', 23, 'Total'),
    ('collectibleBasic', 'n', 24, 'Basic'),
    ('collectibleSef', 'n', 25, 'SEF'),
    ('collectible', 'n', 26, 'Total Net Collectible'),
]
RPAR_LABELS = {
    'incomeClass': 'Income class', 'taxableLandArea': 'Taxable land area (sq. m)',
    'taxableUnits': 'Taxable real property units', 'taxableMarketValue': 'Market value of taxable property',
    'taxableAssessedValue': 'Assessed value of taxable property', 'collectibleBasic': 'Basic RPT collectible',
    'collectibleSef': 'SEF RPT collectible', 'collectible': 'Total net RPT collectible',
}
roll, *report['propertyRoll'] = by_lgu(RPAR, RPAR_FILES)

# ---- Borrowing certificates -----------------------------------------------
CERT_FILES = [
    ('2024/06', 'RE-List-of-Issued-CNDSCBC-as-of-December-2022.xlsx'),
    ('2024/06', 'RE-List-of-issued-CNDSCBC-as-of-December-2023.xlsx'),
    ('2025/01', 'List-of-issued-CNDSCBC-as-of-December-2024.xlsx'),
    ('2026/01', 'List-of-issued-CNDSCBC-as-of-December-2025.xlsx'),
    ('2026/09', 'List-of-issued-CNDSCBC-as-of-August-2026.xlsx'),
    ('2026/10', 'List-of-issued-CNDSCBC-as-of-September-2026.xlsx'),
]
certificates, cert_unmatched = {}, []
for folder, name in CERT_FILES:
    path = SRC / name
    if not path.exists():
        sys.exit(f'missing {path} — download {BLGF}/{folder}/{name}')
    for rows in sheets(path):
        for i, r in enumerate(rows):
            labels = [str(v).strip() if v is not None else '' for v in r]
            if 'Name of LGU' in labels and 'Purpose' in labels:
                break
        else:
            continue
        at = {l: c for c, l in enumerate(labels[:12]) if l}
        ctl = at.get('Control No.', at.get('Certification No.'))
        date = at.get('Date of Certification', at.get('Date of Released'))
        status = at.get('Status', at.get('Certificate Type'))
        dsc = at.get('Net DSC', at.get('Net NDSC', at.get('NDSC')))
        for r in rows[i + 1:]:
            cell = lambda c: r[c] if c is not None and c < len(r) else None
            control = str(cell(ctl) or '').strip()
            if not control.startswith('15-'):  # BLGF's region code 15 is BARMM
                continue
            lgu = re.sub(r'\s*-\s*AMEND\w*$', '', str(cell(at['Name of LGU'])).strip(), flags=re.I)
            kind = str(cell(at['LGU Type'])).strip().title()
            if 'sulu' in lgu.lower():
                continue
            barangay = None
            if kind == 'Province':
                key = provinces.get(norm(re.sub(r'^Province of ', '', lgu, flags=re.I)))
            elif kind == 'Barangay':  # "Barangay X, Town, Province" — filed under the town
                barangay, town = [p.strip() for p in lgu.split(',')][:2]
                barangay = re.sub(r'^Barangay\s+', '', barangay, flags=re.I)
                key = towns.get(norm(town))
            else:
                key = towns.get(norm(lgu.split(',')[0]))
            if key is None:
                cert_unmatched.append(f'{control} {lgu} ({kind})')
                continue
            serial = number(cell(date))
            entry = {
                'control': control,
                **({'barangay': barangay} if barangay else {}),
                'status': str(cell(status) or '').strip().title() or None,
                'date': (datetime.date(1899, 12, 30) + datetime.timedelta(days=serial)).isoformat() if serial else None,
                'purpose': re.sub(r'\s+', ' ', str(cell(at['Purpose']) or '')).strip(),
                # The lists are in thousands of pesos; written here in pesos.
                'proposedAmount': round(number(cell(at['Proposed Amount'])) * 1000, 2) if number(cell(at['Proposed Amount'])) is not None else None,
                'netDebtServiceCeiling': round(number(cell(dsc)) * 1000, 2) if number(cell(dsc)) is not None else None,
                'borrowingCapacity': round(number(cell(at['BC'])) * 1000, 2) if number(cell(at['BC'])) is not None else None,
                'href': f'{BLGF}/{folder}/{name}',
            }
            # The same certificate recurs in monthly sheets, the summary sheet and the next year's list;
            # keep one, preferring the latest list (it carries amendments).
            certificates.setdefault(key, {})[control + (entry['status'] or '')] = entry
borrowing = {k: sorted(v.values(), key=lambda e: (e['date'] or '', e['control'])) for k, v in sorted(certificates.items())}


def section(label, files, spec, labels, data, note):
    return {
        'source': sources(label, files), 'note': note, 'years': sorted(files),
        'fields': [{'key': k, 'label': labels[k]} for k, *_ in spec],
        'units': dict(sorted(data['units'].items())), 'former': data['former'],
    }


data = {
    'name': 'Other fiscal records of BARMM local governments (BLGF)',
    'generatedAt': datetime.date.today().isoformat(),
    'note': (
        'Each section is one BLGF publication, in pesos unless a field says otherwise. Each unit’s year is a row of '
        'values in the order of the section’s "fields". A year left out is a year the LGU reported nothing. Sulu, in '
        'BARMM until 2024, is left out; pre-split Maguindanao’s province rows are under "former"; the eight Special '
        'Geographic Area towns have no rows. Barangays are not in any of these. Years before 2019 are the ARMM’s, and '
        'Cotabato City’s rows before 2019 are from when it was a Region XII city; a town has rows only from the year '
        'it reported.'
    ),
    'dependency': section(
        'Annual Regular Income and Dependencies by LGU', ARI_FILES, ARI, ARI_LABELS, dependency,
        'Annual Regular Income (ARI) is locally sourced revenue, interest, the NTA and other national shares. '
        'The three dependency ratios are BLGF’s own, as fractions of ARI (0.95 = 95%). FY 2025 is preliminary.'),
    'disasterFund': section(
        'Local Disaster Risk Reduction and Management Fund by LGU', DRRM_FILES, DRRM, DRRM_LABELS, disaster,
        'The LDRRMF is at least 5% of an LGU’s estimated regular revenue: 70% for mitigation and preparedness, '
        '30% held as a Quick Response Fund. "Appropriated" is the budget the council passed; "spent" is what was '
        'paid out. Spending above the appropriation can come from continuing appropriations of earlier years. '
        'BLGF’s FY 2021 workbook files BARMM’s LGUs under Region IX and XII; they are read by province. '
        'FY 2025 is preliminary.'),
    'educationFund': section(
        'Special Education Fund income and expenditures by LGU', SEF_FILES, SEF_IN + SEF_OUT,
        SEF_LABELS, education,
        'The SEF is the extra 1% real property tax that provinces and cities (and Metro Manila towns) levy for '
        'schools; ordinary municipalities share the province’s. "rptCollected" is the SEF tax collected; the rest is '
        'SEF spending by purpose. null = that sheet had no row for the LGU.'),
    'propertyRoll': section(
        'Real Property Assessment Report by LGU', RPAR_FILES, RPAR, RPAR_LABELS, roll,
        'Taxable property only, FY 2022 — the one year BLGF has published per LGU. "Collectible" is the tax due '
        'on the roll, not what was collected (see finances.json for collections).'),
    'borrowing': {
        'source': [{'label': f'BLGF — List of issued Certificates of Net Debt Service Ceiling and Borrowing Capacity ({n.split("as-of-")[1][:-5].replace("-", " ")})',
                    'href': f'{BLGF}/{f}/{n}'} for f, n in CERT_FILES],
        'note': (
            'A Certificate of Net Debt Service Ceiling and Borrowing Capacity is DOF’s clearance for an LGU to borrow: '
            'it states the loan proposed and the most the LGU can afford to service. It is not a loan — whether one '
            'was taken shows in finances.json (borrowings). Amounts are converted from the lists’ thousands of pesos. '
            'BLGF also publishes lists for 2016–2021, in an older layout not read here yet.'),
        'units': borrowing,
    },
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

print(f'wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)')
for name, sec in (('dependency', dependency), ('disasterFund', disaster), ('educationFund', education), ('propertyRoll', roll)):
    unmatched, unreported, missing, *extra = report[name]
    print(f'{name}: {len(sec["units"])} units + {len(sec["former"])} former')
    print('   unmatched:', unmatched or 'none')
    print('   reported nothing (left out):', unreported or 'none')
    print('   years with no BARMM rows:', missing or 'none')
    if extra:
        print('   NTA differing from finances.json:', extra[0] or 'none')
print(f'borrowing: {sum(map(len, borrowing.values()))} certificates for {len(borrowing)} LGUs')
print('   unmatched:', cert_unmatched or 'none')
