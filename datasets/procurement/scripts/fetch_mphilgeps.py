"""Bid notices on the modernized PhilGEPS (mPhilGEPS) for BARMM offices.

The Power BI dashboards fetch_philgeps.py reads stop at the old system and
carry only a fraction of the new one. The new system's own public pages
have the rest, and more per notice: source of funds, business category,
delivery location, closing date and status. This reads:

  - every open tender (the "View more" list, 20 a page);
  - closed ("former") notices, searched by each BARMM office's name;
  - each notice's detail page.

and keeps the notices of offices in BARMM. Writes mphilgeps.json, which
fetch_philgeps.py folds into philgeps.json.
"""
import html
import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from http.cookiejar import CookieJar
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'datasets/procurement/mphilgeps.json'
SITE = 'https://philgeps.gov.ph'
UA = {'User-Agent': 'Mozilla/5.0 (BetterBARMM procurement reader; support@betterbarmm.com)'}

# An office is BARMM's if PhilGEPS names it so, or by a place in the region.
BARMM = re.compile(r'\bBARMM\b|BANGSAMORO|MAGUINDANAO|LANAO DEL SUR|BASILAN|TAWI|COTABATO CITY|MARAWI|LAMITAN|SPECIAL GEOGRAPHIC', re.I)


def get(url, opener=None, data=None):
    for _ in range(3):
        try:
            req = urllib.request.Request(url, data=data, headers={**UA, 'Referer': url})
            return (opener or urllib.request.build_opener()).open(req, timeout=60).read().decode('utf-8', 'replace')
        except Exception:
            pass
    return ''


def text(fragment):
    return html.unescape(re.sub(r'<[^>]+>|\s+', ' ', fragment)).strip()


def rows(page):
    """List rows: {id, <column label>: value}."""
    out = []
    for tr in re.findall(r'<tr>.*?</tr>', page, re.S):
        found = re.search(r'viewLiveTenderDetails/(\d+)', tr)
        if found:
            cells = {m.group(1): text(m.group(2)) for m in re.finditer(r'data-label="([^"]+)"[^>]*>(.*?)</td>', tr, re.S)}
            out.append({'id': found.group(1), **cells})
    return out


def open_tenders():
    first = get(f'{SITE}/indexes/view-more-open-tenders?page=1&direction=Tenders.id+desc')
    pages = int(re.search(r'Page 1 of (\d+)', first).group(1))
    with ThreadPoolExecutor(6) as ex:
        rest = ex.map(lambda p: get(f'{SITE}/indexes/view-more-open-tenders?page={p}&direction=Tenders.id+desc'), range(2, pages + 1))
        return [r for page in [first, *rest] for r in rows(page)]


def former(agency, since='', until=''):
    """Closed notices whose agency name contains `agency`. The search returns
    at most 50, so a full answer is split by publish month."""
    jar = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(CookieJar()))
    form = get(f'{SITE}/Indexes/getFormerOpportunities', jar)
    token = re.search(r'name="_csrfToken"[^>]*value="([^"]+)"', form)
    if not token:
        return []
    fields = {'_csrfToken': token.group(1), 'searchAgencyName': agency, 'searchPublishDateFrom': since, 'searchPublishDateTo': until}
    found = rows(get(f'{SITE}/Indexes/getFormerOpportunities', jar, urllib.parse.urlencode(fields).encode()))
    if len(found) < 50:
        return found
    if since:  # a single month still full: take what came
        return found
    out = []
    for year in range(2021, datetime.now().year + 1):
        for month in range(1, 13):
            end = f'{year + (month == 12)}-{month % 12 + 1:02d}-01'
            out += former(agency, f'{year}-{month:02d}-01', end)
    return out


def detail(ref):
    page = get(f'{SITE}/Indexes/viewLiveTenderDetails/{ref}/OPEN_MORE')
    body = text(page[page.find('Notice Reference Number'):page.find('Date created')])
    labels = ['Status', 'Approved Budget of the Contract', 'Procurement Mode', 'Classification', 'Funding Source',
              'Delivery/Project Location', 'Business Category', 'Client Agency']
    pattern = '|'.join(re.escape(l) for l in labels + ['Bid Validity Period', 'Control Number', 'Lot Type', 'Applicable Procurement Rules',
                                                      'Delivery Period', 'Contact Person', 'Created By'])
    out = {}
    for m in re.finditer(rf'({pattern})[^:]*:\s*(.*?)(?=\s*(?:{pattern})[^:]*:|$)', body):
        out[m.group(1)] = m.group(2).strip()
    title = re.search(r'Project Name:\s*</[^>]+>\s*(.*?)<', page, re.S)
    return {
        'status': out.get('Status'), 'abc': float(out.get('Approved Budget of the Contract', '0').replace(',', '') or 0),
        'mode': out.get('Procurement Mode'), 'class': out.get('Classification'), 'fund': out.get('Funding Source'),
        'location': out.get('Delivery/Project Location'), 'category': out.get('Business Category'),
        'agency': out.get('Client Agency'), 'title': text(title.group(1)) if title else None,
    }


def day(s):
    """'12-Oct-2026' or '04-Nov-2026 09:15 AM' as '2026-10-12'."""
    return datetime.strptime(s.split(' ')[0], '%d-%b-%Y').strftime('%Y-%m-%d') if s else None


def main(extra_refs=()):
    listed = {}
    for r in open_tenders():
        if BARMM.search(r.get('Agency Name', '')):
            listed[r['id']] = {**r, 'open': True}
    agencies = {r['Agency Name'] for r in listed.values()} | {'BARMM', 'BANGSAMORO'}
    with ThreadPoolExecutor(4) as ex:
        for found in ex.map(former, sorted(agencies)):
            for r in found:
                if BARMM.search(r.get('Agency Name', '')):
                    listed.setdefault(r['id'], {**r, 'open': False})
    refs = sorted(set(listed) | set(extra_refs), key=int)
    with ThreadPoolExecutor(6) as ex:
        details = dict(zip(refs, ex.map(detail, refs)))
    notices = []
    for ref in refs:
        l, d = listed.get(ref, {}), details[ref]
        notices.append({
            'ref': ref, 'agency': l.get('Agency Name') or d['agency'], 'title': d['title'] or l.get('Notice Title'),
            'published': day(l.get('Publish Date')), 'closing': day(l.get('Closing date')),
            'open': l.get('open', False), 'status': l.get('Status') or d['status'],
            **{k: d[k] for k in ('abc', 'mode', 'class', 'fund', 'location', 'category')},
        })
    OUT.write_text(json.dumps({'generatedAt': datetime.now().strftime('%Y-%m-%d'), 'notices': notices}, ensure_ascii=False, indent=1))
    print(f'mPhilGEPS: {len(notices)} notices, {sum(n["open"] for n in notices)} open')


if __name__ == '__main__':
    import sys
    main(sys.argv[1:])
