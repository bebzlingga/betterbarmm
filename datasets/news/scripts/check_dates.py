"""Read each new story's own date from its page and strike any older than the file's week. Google News re-dates
old stories when it re-indexes them (a Rappler piece from October 2023 came in as 22 October 2026), so the feed's
date is not enough. A struck story moves to `dropped`, which the fetch reads so it does not come back.

    python3 -I datasets/news/scripts/check_dates.py

Run after resolve_links.py, so the page read is the outlet's. Each story is read once (`checked`); a page that
refuses automated reads, or carries no date, keeps the feed's.
"""
import json, os, re, sys, time, urllib.request
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'accidents', 'scripts'))
from gnews_decode import decode  # the decoder resolve_links.py uses

PATH = os.path.join(HERE, '..', 'news.json')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
# Not news reports, whatever the index calls them.
NOT_NEWS = ('volcanodiscovery.com',)
DATE = re.compile(r'(?:article:published_time|datePublished|"pubdate"|name="date")[^0-9]{0,40}(20\d\d-\d\d-\d\d)')

data = json.load(open(PATH))
data.setdefault('dropped', [])
since = date.fromisoformat(data['since'])
today = date.today().isoformat()

def page_date(url):
    m = re.search(r'/(20\d\d)/(\d\d)/(\d\d)/', url)
    if m: return '-'.join(m.groups())
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html'})
        with urllib.request.urlopen(req, timeout=20) as r:
            page = r.read(600_000).decode('utf-8', 'replace')
    except Exception:
        return None
    found = DATE.findall(page)
    return min(found) if found else None

kept, struck = [], 0
for item in data['items']:
    if item.get('checked'):
        kept.append(item); continue
    host = re.sub(r'^https?://(www\.)?', '', item['url']).split('/')[0]
    if any(host.endswith(h) for h in NOT_NEWS):
        reason = 'not a news report'
    else:
        # A Google link resolve_links.py could not swap is tried once more; one that still will not open waits for the next run.
        if 'news.google.com' in item['url']:
            try: url = decode(item['url'])
            except Exception: url = None
            time.sleep(1.2)
            if not url:
                kept.append(item); continue
            item['via'], item['url'] = item['url'], url
        real = page_date(item['url'])
        time.sleep(0.5)
        # A day's grace: the feed's clock and the page's can sit either side of midnight.
        reason = f'published {real}' if real and date.fromisoformat(real) < since - timedelta(days=1) else None
    if reason:
        data['dropped'].append({'url': item['url'], 'via': item.get('via'), 'title': item['title'], 'reason': reason})
        print('  struck:', item['title'][:70], '-', reason, file=sys.stderr)
        struck += 1
        continue
    item['checked'] = today
    kept.append(item)
data['items'] = kept
json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
print(f'checked the dates; struck {struck}, {len(kept)} remain')
