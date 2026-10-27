"""Scholarships, grants and paid training for Bangsamoro residents, drawn from the offices' programs in
datasets/services/offices.json (each with the official page it was read from), with an application status
only where an official page states one. Writes datasets/opportunities/scholarships.json.

    python3 -I datasets/opportunities/scripts/build_scholarships.py

Most offices announce their calls on Facebook, which no automated reader can open, so a program with no
stated status says so rather than guessing open or closed.
"""
import json, os, re
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
SERVICES = os.path.join(HERE, '..', '..', 'services', 'offices.json')
OUT = os.path.join(HERE, '..', 'scholarships.json')

# Which programs count, by name, and what kind each is.
PICK = [
    (r'^Access to Higher and Modern Education Scholarship', 'scholarship'),
    (r'^AHME College Assistance', 'scholarship'),
    (r'^Bangsamoro Medical Scholarship', 'scholarship'),
    (r'^Bangsamoro Assistance for Science Education', 'scholarship'),
    (r'^Mujahidin Assistance for Science Education', 'scholarship'),
    (r'^Bangsamoro Special Assistance for Science Education', 'scholarship'),
    (r'^Professional Assistance for Science Education', 'scholarship'),
    (r'^Bangsamoro International Graduate Study', 'scholarship'),
    (r'^Bangsamoro Scholarship Program for Technical-Vocational', 'training'),
    (r'^Regional Manpower Development Center', 'training'),
    (r'^Special Program for the Employment of Students', 'work'),
    (r'^Government Internship Program', 'work'),
]
# Where an official page states the current window, the status and the page that says it.
STATUS = {
    'Access to Higher and Modern Education Scholarship Program (AHME-SP)': {
        'state': 'closed',
        'note': 'Applications for school year 2026–2027 (the 7th cohort) are closed; the online application form is marked not available.',
        'source': 'https://ahme-mbhte.bangsamoro.gov.ph/',
        'checked': '2026-10-25',
    },
}

offices = json.load(open(SERVICES))
offices = offices if isinstance(offices, list) else offices.get('offices') or offices.get('items')
out = []
for o in offices:
    for p in o.get('programs', []):
        kind = next((k for rx, k in PICK if re.search(rx, p['name'])), None)
        if not kind:
            continue
        out.append({
            'name': p['name'],
            'kind': kind,
            'office': o['name'],
            'officeSlug': o['slug'],
            'summary': p.get('summary'),
            'for': p.get('for') or [],
            'how': p.get('how'),
            'source': p.get('source'),
            'website': o.get('website'),
            'status': STATUS.get(p['name'], {'state': 'unknown', 'note': 'No open call on an official page we can read; the office announces calls on its own pages and Facebook.'}),
        })
order = {'scholarship': 0, 'training': 1, 'work': 2}
out.sort(key=lambda x: (order[x['kind']], x['office'], x['name']))
data = {
    'name': 'Scholarships, grants and paid training in the Bangsamoro',
    'generatedAt': date.today().isoformat(),
    'note': 'Programs the Bangsamoro Government runs for students, out-of-school youth and job-seekers, each traced to the official page it was read from. A status is given only where an official page states one.',
    'programs': out,
}
json.dump(data, open(OUT, 'w'), indent=1, ensure_ascii=False)
open(OUT, 'a').write('\n')
print(f'programs: {len(out)} ({sum(1 for x in out if x["kind"] == "scholarship")} scholarships)')
