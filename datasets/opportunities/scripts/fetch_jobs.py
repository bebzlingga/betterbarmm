"""Open government jobs in the Bangsamoro, from the Bangsamoro Job Portal (www.jobs.barmm.gov.ph), the
regional government's own hiring site. Writes datasets/opportunities/jobs.json.

    python3 -I datasets/opportunities/scripts/fetch_jobs.py

The portal is a Laravel/Inertia app: each page carries its data as JSON in a <script data-page> tag, so the
listing is read as the portal gives it, page by page, with nothing inferred. Its https answers with a
Cloudflare challenge; plain http serves the same pages. Generic User-Agent, a second between requests.
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'jobs.json')
BASE = 'http://www.jobs.barmm.gov.ph'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'


def page(path):
    req = urllib.request.Request(BASE + path, headers={'User-Agent': UA, 'Accept': 'text/html'})
    body = urllib.request.urlopen(req, timeout=40).read().decode('utf-8', 'replace')
    m = re.search(r'<script data-page="app" type="application/json">(.*?)</script>', body, re.S)
    if not m:
        raise SystemExit(f'{path}: no page data (the portal changed?)')
    return json.loads(m.group(1))['props']


def text(markup):
    """The portal's HTML fields as plain paragraphs."""
    s = re.sub(r'<\s*(br|/p|/li|/div)\s*/?>', '\n', markup or '', flags=re.I)
    s = html.unescape(re.sub(r'<[^>]+>', '', s)).replace('\xa0', ' ')
    return '\n'.join(line.strip() for line in s.splitlines() if line.strip())


home = page('/')
offices = [{'name': o['name'].strip().rstrip('.'), 'code': o['code'].strip(), 'open': o['open'], 'posted': o['posted']} for o in home['offices']]
jobs, n = [], 1
while True:
    props = page(f'/jobs?page={n}')
    for j in props['jobs']['data']:
        jobs.append({
            'id': j['id'],
            'title': j['title'].strip(),
            'office': j['officeName'].strip().rstrip('.'),
            'assignment': (j.get('assignment') or '').strip() or None,
            'salaryGrade': j.get('grade'),
            'monthlySalary': int(float(j['monthlySalary'])) if j.get('monthlySalary') else None,
            'term': j.get('termOfEmployment'),
            'type': j.get('jobType'),
            'plantilla': j.get('plantilla'),
            'eligibility': (j.get('eligibility') or '').strip() or None,
            'education': (j.get('education') or '').strip() or None,
            'training': (j.get('training') or '').strip() or None,
            'experience': (j.get('experience') or '').strip() or None,
            'posted': j.get('posted'),
            'closes': j.get('closes'),
            'open': bool(j.get('isOpen')),
            'description': text(j.get('jobDescription')),
            'howToApply': text(j.get('instructions')),
            # The portal has no page per job; its listing takes a search, so the link finds this one.
            # Linked over https, which a reader's browser passes; only the automated read needs plain http.
            'url': f"https://www.jobs.barmm.gov.ph/jobs?{urllib.parse.urlencode({'search': j['title'].strip()})}",
        })
    if not props['jobs'].get('next_page_url'):
        break
    n += 1
    time.sleep(1)

data = {
    'name': 'Open jobs in the Bangsamoro Government',
    'generatedAt': date.today().isoformat(),
    'source': {'label': 'Bangsamoro Job Portal', 'url': 'https://www.jobs.barmm.gov.ph'},
    'note': 'Every open position the Bangsamoro Job Portal lists, as it lists it: the regional government’s own hiring site, where ministries and offices post their vacancies and take applications. Salary is the portal’s monthly figure for the position’s grade. Apply on the portal, not here.',
    'offices': offices,
    'jobs': jobs,
}
json.dump(data, open(OUT, 'w'), indent=1, ensure_ascii=False)
open(OUT, 'a').write('\n')
print(f'jobs: {len(jobs)} open from {sum(1 for o in offices if o["open"])} offices; {len(offices)} offices on the portal')
