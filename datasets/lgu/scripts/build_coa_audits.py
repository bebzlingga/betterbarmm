#!/usr/bin/env python3
"""Write datasets/lgu/coa-audits.json — the Commission on Audit's opinion on
each BARMM province, city and municipality's financial statements, the total
liabilities it reported, and how many audit observations COA raised, FY 2020
onward, from COA's Annual Audit Reports (AARs).

Coverage is thin, and the reason is access, not absence. COA publishes every
LGU's AAR and its Executive Summary at coa.gov.ph (Reports › Annual Audit
Reports › Local Government Units › region › province), but the whole domain —
pages, downloads, sitemap, wp-json — sits behind a Cloudflare "verify you are
human" check that curl, browser headers and headless browsers all fail. Nothing
here gets past it. The only copies reachable are the ones the Internet
Archive's Wayback Machine happened to save; a CDX search of
coa.gov.ph/download/* turned up nine BARMM LGU Executive Summaries for FY 2020
or later, one of which (Marawi City 2021) the Archive saved as a 403 page. The
eight that remain are below. COA-BARMM's own site (coa.bangsamoro.gov.ph) does
not answer, and its archived copy holds no AARs. COA's Annual Financial Report
on Local Governments, which might have per-LGU tables, is archived only for FY
2019 and 2020, both truncated at 1 MB and unreadable.

Every figure is checked against the PDF's own text when this runs: the
opinion sentence and the liabilities figure must appear as written. What each
record holds:
  - opinion: the word the auditor used. One report (Marogong 2020) says only
    "modified", which covers qualified, adverse and disclaimer alike; it is
    kept as "modified", not guessed into one of them.
  - liabilities: total liabilities at 31 December, in pesos, only where the
    report prints the figure. Datu Piang states it in thousands of pesos and
    carries liabilitiesNote. Tugaya shows it only as a bar chart, so it has
    none. Executive Summaries do not break liabilities down, so there is no
    loans-payable figure for anyone.
  - observations: the numbered audit observations in the Executive Summary's
    summary of observations, not counting favourable ones. The full AAR (Part
    II) can hold more.

Sources: the coa.gov.ph URL each PDF was published at (href) and the Wayback
capture it was read from (archived). To rebuild, fetch each `archived` URL
into one folder:

    python3 datasets/lgu/scripts/build_coa_audits.py [dir holding the PDFs]

The folder defaults to $TMPDIR/coa-aar. The PDFs are not committed.
"""
import datetime, json, os, pathlib, re, subprocess, sys, tempfile
from sre import ROOT, norm, provinces, towns

OUT = ROOT / 'datasets/lgu/coa-audits.json'
PDFS = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'coa-aar'))
COA = 'https://www.coa.gov.ph/download'

# (province, town, year, COA path, Wayback timestamp, opinion, sentence that states it,
#  liabilities in pesos, figure as printed, observations, extra fields)
REPORTS = [
    ('Lanao del Sur', 'Bubong', 2020, '1950/lanao-del-sur/26832/bubong-executive-summary-2020.pdf', '20240226204655',
     'qualified', 'rendered a qualified opinion', 348093.12, '348,093.12', 11, {}),
    ('Lanao del Sur', 'Marogong', 2020, '1950/lanao-del-sur/28844/marogong-executive-summary-2020.pdf', '20240617190017',
     'modified', 'rendered a modified opinion', 68636060.30, '68,636,060.30', 4, {}),
    ('Lanao del Sur', 'Lumbaca-Unayan', 2020, '1950/lanao-del-sur/29084/lumbaca-unayan-executive-summary-2020.pdf', '20240617231353',
     'qualified', 'rendered a qualified audit opinion', 3681340.73, '3,681,340.73', 5, {}),
    ('Lanao del Sur', 'Tugaya', 2020, '1950/lanao-del-sur/29086/tugaya-executive-summary-2020.pdf', '20231204094032',
     'qualified', 'rendered a qualified opinion', None, None, 5, {}),
    ('Maguindanao', 'Mamasapano', 2020, '1974/maguindanao/27396/mamasapano-executive-summary-2020.pdf', '20240809011825',
     'qualified', 'rendered a qualified opinion', 13419311.36, '13,419,311.36', 8, {}),
    ('Maguindanao', 'Datu Piang', 2020, '1974/maguindanao/27399/datu-piang-executive-summary-2020.pdf', '20240808085109',
     'qualified', 'rendered a qualified opinion', 14954000, '14,954', 7,
     {'liabilitiesNote': 'Stated in thousands of pesos.'}),
    ('Basilan', 'Hadji Mohammad Ajul', 2020, '3475/basilan/50127/hadji-mohammad-ajul-executive-summary-2020.pdf', '20220813030341',
     'qualified', 'rendered a qualified opinion', 1456319.24, '1,456,319.24', 11, {}),
    ('Lanao del Sur', 'Madalum', 2021, '5360/lanao-del-sur/70247/madalum-executive-summary-2021.pdf', '20230411142730',
     'qualified', 'rendered a qualified opinion', 2619497.04, '2,619,497.04', 5,
     {'liabilitiesNote': 'As printed; the same table gives total assets equal to total equity (₱116,346,044.28), so one of its lines is wrong.'}),
]


def text(path):
    return re.sub(r'\s+', ' ', subprocess.run(['pdftotext', '-layout', str(path), '-'], capture_output=True, text=True, check=True).stdout)


units = {}
for prov, town, year, path, stamp, opinion, says, liabilities, printed, observations, extra in REPORTS:
    key = towns[norm(town)]
    assert key.split('/')[0] in provinces.values()
    pdf = PDFS / path.rsplit('/', 1)[1]
    if not pdf.exists():
        sys.exit(f'missing {pdf} — download https://web.archive.org/web/{stamp}id_/{COA}/{path}')
    t = text(pdf)
    assert says in t, f'{pdf.name}: opinion sentence not found'
    assert printed is None or re.search(rf'(?<![\d,]){re.escape(printed)}(?![\d,])', t), f'{pdf.name}: liabilities {printed} not found'
    assert str(year) in t and town.split()[0].lower() in t.lower(), f'{pdf.name}: wrong report?'
    units.setdefault(key, {})[str(year)] = {
        'opinion': opinion, **({'liabilities': liabilities} if liabilities is not None else {}),
        'observations': observations, 'href': f'{COA}/{path}',
        'archived': f'https://web.archive.org/web/{stamp}/{COA}/{path}', **extra,
    }

years = list(range(2020, datetime.date.today().year))
data = {
    'name': 'COA audit opinions on BARMM local governments',
    'generatedAt': datetime.date.today().isoformat(),
    'source': [
        {'label': 'Commission on Audit — Annual Audit Reports, Local Government Units',
         'href': 'https://www.coa.gov.ph/reports/annual-audit-reports/aar-local-government-units/',
         'access': 'Behind a Cloudflare human check; reports here were read from Wayback Machine captures.'},
        {'label': 'Internet Archive — Wayback Machine captures of coa.gov.ph/download/',
         'href': 'https://web.archive.org/cdx/search/cdx?url=coa.gov.ph/download/*'},
    ],
    'note': (
        'What the Commission on Audit’s auditor said about each LGU’s financial statements, from its Annual Audit '
        'Report’s Executive Summary: the opinion, total liabilities at year-end in pesos, and the number of audit '
        'observations the summary lists. Only 8 LGU-years are here, all FY 2020 and 2021, all towns: coa.gov.ph '
        'blocks automated access with a Cloudflare human check, and these are the only BARMM LGU reports for FY 2020 '
        'onward that the Internet Archive saved. Every other province, city, town and year is missing because it '
        'could not be read, not because COA did not audit it. All 8 opinions are modified — 7 qualified and 1 '
        '(Marogong 2020) that says only "modified" without naming the type. Loans payable is given only where the '
        'full Statement of Financial Position is in the PDF; an Executive Summary does not break liabilities down. '
        'Observation counts are the summary’s numbered list; the full report can hold more. Each record links the '
        'COA URL (href) and the archived copy it was read from. Maguindanao towns before the 2022 split sit under '
        'the province they are in now. Sulu is left out.'
    ),
    'years': years,
    'units': dict(sorted(units.items())),
    'former': {},
}
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + '\n')

expected = set(provinces.values()) | set(towns.values())
print(f'wrote {OUT.relative_to(ROOT)}: {sum(map(len, units.values()))} LGU-years for {len(units)} units')
print(f'directory units with no report: {len(expected - set(units))} of {len(expected)}')
