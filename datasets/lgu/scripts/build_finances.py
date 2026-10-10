#!/usr/bin/env python3
"""Write datasets/lgu/finances.json — every line of BLGF's Statement of
Receipts and Expenditures (SRE) for each BARMM province, city and
municipality, FY 2016 to FY 2025: local taxes and fees, the NTA and other
transfers, spending by sector, capital outlay, borrowing, debt service and
cash balances.

These are what each local treasurer reported collecting and spending, not
what the council appropriated. A town's approved budget is in its own
ordinance, and nobody publishes those together.

Debt comes from the SRE's own lines: loans and bonds taken in a year
(receipts from loans and borrowings), interest paid (operating debt
service) and principal repaid. BLGF's separate indebtedness files report
outstanding balances only nationally, by lender — there is no per-LGU stock
of debt anywhere public.

Rows are matched to the directory by name. Three things the directory does
not hold:
  - Sulu (in BARMM until the Supreme Court's 2024 ruling) — left out, as in
    every other dataset here.
  - Maguindanao before its 2022 split — its province rows for FY 2016–2022
    go under "former", since neither successor province can claim them. Its
    towns match the successor they sit in now.
  - The eight Special Geographic Area towns (created 2024) — no SRE rows yet.

A row whose total current operating income is zero is a town that did not
file that year; the year is left out, not written as zeros. Inside a filed
row a zero is a zero. The workbooks' header says "In Php Million"; the
figures are in pesos (the NTA here matches nta.json, which matches DBM's
LBM 90-A totals to the peso).

Sources (blgf.gov.ph/lgu-fiscal-data/ — sre.py has the curl line):

    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2016.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2017.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2018.xlsx
    https://blgf.gov.ph/wp-content/uploads/2025/02/By-LGU-SRE-2019.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2020.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2021.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2022.xlsx
    https://blgf.gov.ph/wp-content/uploads/2024/09/By-LGU-SRE-2023.xlsx
    https://blgf.gov.ph/wp-content/uploads/2026/01/By-LGU-SRE-2024.xlsx
    https://blgf.gov.ph/wp-content/uploads/2026/05/By-LGU-SRE-2025.xlsx

    python3 datasets/lgu/scripts/build_finances.py [dir holding the .xlsx files]

The directory defaults to $TMPDIR/blgf-sre. The workbooks are not committed.
"""
import datetime, json, sys
from sre import BLGF, ROOT, SRC, first_sheet, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/finances.json'

FILES = {
    2016: ('2024/09', 'FY 2016'),
    2017: ('2024/09', 'FY 2017'),
    2018: ('2024/09', 'FY 2018'),
    2019: ('2025/02', 'FY 2019'),
    2020: ('2024/09', 'FY 2020'),
    2021: ('2024/09', 'FY 2021'),
    2022: ('2024/09', 'FY 2022'),
    2023: ('2024/09', 'FY 2023 (Final)'),
    2024: ('2026/01', 'FY 2024 (Final)'),
    2025: ('2026/05', 'FY 2025 (Preliminary)'),
}
FORMER = {'maguindanao': 'maguindanao'}

# Columns 5–57 of every workbook, in order. The layout is the same in all six
# years; only labels moved (Internal Revenue Allotment → National Tax
# Allotment in FY 2022). `check` is the header text the column must contain.
FIELDS = [
    ('rptGeneralFund', 'Real property tax — General Fund', 'General Fund'),
    ('rptSef', 'Real property tax — Special Education Fund', 'Special Education Fund'),
    ('rptTotal', 'Real property tax — total', 'Total'),
    ('businessTax', 'Tax on business', 'Tax on Business'),
    ('otherTaxes', 'Other taxes', 'Other Taxes'),
    ('taxRevenue', 'Total tax revenue', 'Total Tax Revenue'),
    ('regulatoryFees', 'Regulatory fees', 'Regulatory Fees'),
    ('serviceCharges', 'Service and user charges', 'User Charges'),
    ('economicEnterprises', 'Receipts from economic enterprises', 'Economic Enterprises'),
    ('otherReceipts', 'Other receipts', 'Other Receipts'),
    ('nonTaxRevenue', 'Total non-tax revenue', 'Total Non-Tax Revenue'),
    ('localSources', 'Total local sources', 'TOTAL LOCAL SOURCES'),
    ('nta', 'National Tax Allotment (IRA before FY 2022)', 'Allotment'),
    ('otherNationalShares', 'Other shares from national tax collections', 'Other Shares'),
    ('interLocalTransfers', 'Inter-local transfers', 'Inter-Local Transfers'),
    ('grants', 'Extraordinary receipts, grants, donations and aid', 'Grants'),
    ('externalSources', 'Total external sources', 'TOTAL EXTERNAL SOURCES'),
    ('operatingIncome', 'Total current operating income', 'TOTAL CURRENT OPERATING INCOME'),
    ('generalPublicServices', 'General public services', 'GENERAL PUBLIC SERVICES'),
    ('education', 'Education, culture, sports and manpower development', 'Education'),
    ('health', 'Health, nutrition and population control', 'Health'),
    ('labor', 'Labor and employment', 'Labor'),
    ('housing', 'Housing and community development', 'Housing'),
    ('socialWelfare', 'Social services and social welfare', 'Social Welfare'),
    ('socialServices', 'Total social services', 'TOTAL SOCIAL SERVICES'),
    ('economicServices', 'Economic services', 'ECONOMIC SERVICES'),
    ('debtInterest', 'Debt service — interest and other charges', 'Interest Expense'),
    ('operatingExpenditures', 'Total current operating expenditures', 'TOTAL CURRENT OPERATING EXPENDITURES'),
    ('netOperatingIncome', 'Net operating income (loss) from current operations', 'NET OPERATING INCOME'),
    ('saleOfAssets', 'Proceeds from sale of assets', 'Sale of Assets'),
    ('saleOfDebtSecurities', 'Proceeds from sale of debt securities of other entities', 'Sale of Debt Securities'),
    ('loansCollected', 'Collection of loans receivable', 'Collection of Loans'),
    ('capitalReceipts', 'Total capital and investment receipts', 'TOTAL CAPITAL/INVESTMENT RECEIPTS'),
    ('loansAcquired', 'Borrowing — loans acquired', 'Acquisition of Loans'),
    ('bondsIssued', 'Borrowing — bonds issued', 'Issuance of Bonds'),
    ('borrowings', 'Total receipts from loans and borrowings', 'TOTAL RECEIPTS FROM LOANS AND BORROWINGS'),
    ('otherNonIncomeReceipts', 'Other non-income receipts', 'Other Non-Income Receipts'),
    ('nonIncomeReceipts', 'Total non-income receipts', 'TOTAL NON-INCOME RECEIPTS'),
    ('capitalOutlay', 'Capital outlay — property, plant and equipment', 'Capital Outlay'),
    ('investmentInDebtSecurities', 'Purchase of debt securities of other entities', 'Purchase of Debt Securities'),
    ('loansGranted', 'Loans granted to other entities', 'Make Loan'),
    ('capitalExpenditures', 'Total capital and investment expenditures', 'TOTAL CAPITAL/ INVESTMENT EXPENDITURES'),
    ('loanAmortization', 'Debt service — loan principal repaid', 'Loan Amortization'),
    ('bondsRedeemed', 'Debt service — bonds redeemed', 'Redemption of Bonds'),
    ('debtPrincipal', 'Total debt service, principal', 'TOTAL DEBT SERVICE'),
    ('otherNonOperatingExpenditures', 'Other non-operating expenditures', 'Other Non-Operating Expenditures'),
    ('nonOperatingExpenditures', 'Total non-operating expenditures', 'TOTAL NON-OPERATING EXPENDITURES'),
    ('netIncreaseInFunds', 'Net increase (decrease) in funds', 'NET INCREASE'),
    ('cashBeginning', 'Cash balance, beginning', 'CASH BALANCE, BEGINNING'),
    ('fundsAvailable', 'Fund or cash available', 'FUND/ CASH AVAILABLE'),
    ('priorYearPayables', 'Payment of prior years’ accounts payable', 'Accounts Payable'),
    ('continuingAppropriation', 'Continuing appropriation', 'CONTINUING'),
    ('cashEnd', 'Fund or cash balance, end', 'BALANCE, END'),
]
FIRST = 5
COL = {key: FIRST + i for i, (key, _, _) in enumerate(FIELDS)}

# Totals the workbook states and its parts must reproduce. A miss is reported, not fixed.
SUMS = {
    'rptTotal': ['rptGeneralFund', 'rptSef'],
    'taxRevenue': ['rptTotal', 'businessTax', 'otherTaxes'],
    'operatingIncome': ['localSources', 'externalSources'],
    'borrowings': ['loansAcquired', 'bondsIssued'],
    'debtPrincipal': ['loanAmortization', 'bondsRedeemed'],
}

units, former, unmatched, unfiled, mismatched = {}, {}, [], [], []
for year, (folder, _) in FILES.items():
    path = SRC / f'By-LGU-SRE-{year}.xlsx'
    if not path.exists():
        sys.exit(f'missing {path} — download {BLGF}/{folder}/{path.name}')
    rows = list(first_sheet(path))
    head = next(i for i, r in enumerate(rows) if len(r) > 4 and r[4] in ('Province', 'City', 'Municipality'))
    for key, _, check in FIELDS:
        text = ' '.join(str(rows[i][COL[key]]) for i in range(head) if len(rows[i]) > COL[key] and rows[i][COL[key]])
        # Spacing in the labels varies by year ("CAPITAL/ INVESTMENT"), so compare without it.
        squash = lambda t: ''.join(t.lower().split())
        assert squash(check) in squash(text), f'{path.name}: column {COL[key]} is {text!r}, expected {key}'
    for r in rows[head:]:
        # Before 2019 the region was ARMM, and Cotabato City sat in Region XII; it
        # joined in the 2019 plebiscite, and the directory holds it throughout.
        if len(r) <= FIRST:
            continue
        in_region = r[1] in ('BARMM', 'ARMM') or str(r[3]).strip().lower() == 'cotabato city'
        if not in_region or norm(r[2]) == 'sulu':
            continue
        name, kind = r[3], r[4]
        target = units
        if kind == 'Province':
            key = provinces.get(norm(name))
            if key is None and norm(name) in FORMER:
                key, target = FORMER[norm(name)], former
        else:
            key = towns.get(norm(name))
        if key is None:
            unmatched.append(f'{year} {r[2]} / {name} ({kind})')
            continue
        values = [round(float(r[c] or 0), 2) if c < len(r) else 0.0 for c in range(FIRST, FIRST + len(FIELDS))]
        if not values[COL['operatingIncome'] - FIRST]:
            unfiled.append(f'{year} {key}')
            continue
        v = dict(zip(COL, values))
        for total, parts in SUMS.items():
            if abs(v[total] - sum(v[p] for p in parts)) > 1:
                mismatched.append(f'{year} {key} {total}')
        assert str(year) not in target.get(key, {}), f'{year} {key} appears twice'
        target.setdefault(key, {})[str(year)] = values

# Cross-check: the NTA line here is the line nta.json was built from.
nta = json.load(open(ROOT / 'datasets/lgu/nta.json'))['units']
i = COL['nta'] - FIRST
for key, levels in nta.items():
    for year, amount in next(iter(levels.values())).items():
        assert units[key][year][i] == amount, f'{key} {year}: NTA {units[key][year][i]} ≠ nta.json {amount}'

years = sorted(FILES)
data = {
    'name': 'Receipts and expenditures of BARMM local governments',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [
        {'label': f'BLGF — Statement of Receipts and Expenditures by LGU, {FILES[y][1]}',
         'href': f'{BLGF}/{FILES[y][0]}/By-LGU-SRE-{y}.xlsx', 'fiscalYear': y}
        for y in years
    ],
    'note': (
        'What each province, city and municipality’s treasurer reported collecting and spending, in pesos, to the '
        'Bureau of Local Government Finance — actuals, not the budget the council appropriated. Each unit’s year is a '
        'row of numbers in the order of "fields". Debt is the flow in a year: loans and bonds taken, interest paid, '
        'principal repaid; no public source gives a per-LGU outstanding balance. A year left out is a year the LGU did '
        'not file (zero operating income); inside a filed year a zero is a zero. FY 2025 is BLGF’s preliminary release '
        'and some rows are part-year. FY 2016–2018 are ARMM, before the Bangsamoro region existed; Cotabato City was then in Region XII. Barangays have no SRE: their money is not here. Sulu, in BARMM until 2024, is '
        'left out. Maguindanao’s province rows before its 2022 split are under "former"; its towns sit under the '
        'province they are in now. The eight Special Geographic Area towns, created in 2024, have no SRE rows yet. '
        'No per-LGU figure for FY 2026 is published yet.'
    ),
    'years': years,
    'fields': [{'key': k, 'label': label} for k, label, _ in FIELDS],
    'units': dict(sorted(units.items())),
    'former': former,
}
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {len(units)} units + {len(former)} former, {years}')
print('unmatched SRE rows:', unmatched or 'none')
print('did not file (left out):', unfiled or 'none')
print('stated totals their parts do not reproduce:', mismatched or 'none')
print('directory units with no figure:', sorted(expected - set(units)) or 'none')
