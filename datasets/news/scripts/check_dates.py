"""Read each story's own date from its page: strike any older than the file's week, and set the rest to the
outlet's date and time. Google News dates a story by when it indexed it, not when the outlet published it: a
Rappler piece from October 2023 came in as 22 October 2026, and a Manila Standard story of the 23rd as the 24th.
A struck story moves to `dropped`, which the fetch reads so it does not come back.

    python3 -I datasets/news/scripts/check_dates.py          # the stories not yet checked
    python3 -I datasets/news/scripts/check_dates.py --all    # every story again

Run after resolve_links.py, so the page read is the outlet's. Each story is read once (`checked`); a page that
refuses automated reads, or carries no date, keeps the feed's.
"""
import json, os, re, sys, time, urllib.request
from datetime import date, datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'accidents', 'scripts'))
from gnews_decode import decode  # the decoder resolve_links.py uses

PATH = os.path.join(HERE, '..', 'news.json')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
# Not news reports, whatever the index calls them.
NOT_NEWS = ('volcanodiscovery.com',)
STAMP = re.compile(r'(?:article:published_time|datePublished|"pubdate"|name="date")[^0-9]{0,40}(20\d\d-\d\d-\d\d(?:[T ]\d\d:\d\d(?::\d\d)?(?:\.\d+)?(?:Z|[+-]\d\d:?\d\d)?)?)')
OWN = re.compile(r'property="article:published_time"[^>]*content="(20\d\d-\d\d-\d\d[^"]*)"|content="(20\d\d-\d\d-\d\d[^"]*)"[^>]*property="article:published_time"')
MANILA = timezone(timedelta(hours=8))

data = json.load(open(PATH))
data.setdefault('dropped', [])
since = date.fromisoformat(data['since'])
today = date.today().isoformat()
again = '--all' in sys.argv


def parse(stamp):
    """A page's stamp as an aware datetime. A stamp with no zone is read as Manila's clock."""
    s = stamp.replace(' ', 'T')
    if len(s) == 10:
        return datetime.fromisoformat(s).replace(tzinfo=MANILA)
    s = re.sub(r'Z$', '+00:00', s)
    s = re.sub(r'([+-]\d\d)(\d\d)$', r'\1:\2', s)
    d = datetime.fromisoformat(s)
    return d if d.tzinfo else d.replace(tzinfo=MANILA)


def page_stamp(url):
    """The outlet's own publication time, or None. A date in the address counts when the page cannot be read."""
    in_url = re.search(r'/(20\d\d)/(\d\d)/(\d\d)/', url)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html'})
        with urllib.request.urlopen(req, timeout=20) as r:
            page = r.read(600_000).decode('utf-8', 'replace')
        # The page's own tag first (article:published_time sits in its head); a datePublished can belong to a related story.
        own = OWN.search(page)
        if own:
            return parse(own.group(1) or own.group(2))
        found = STAMP.findall(page)
        if found:
            return parse(found[0])
    except Exception:
        pass
    return datetime(*map(int, in_url.groups()), tzinfo=MANILA) if in_url else None


manila_day = lambda d: d.astimezone(MANILA).date()
kept, struck, moved = [], 0, 0
for item in data['items']:
    if item.get('checked') and not again:
        kept.append(item); continue
    host = re.sub(r'^https?://(www\.)?', '', item['url']).split('/')[0]
    reason = None
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
        real = page_stamp(item['url'])
        time.sleep(0.5)
        if real:
            # A day's grace for striking: the feed's clock and the page's can sit either side of midnight.
            if manila_day(real) < since - timedelta(days=1):
                reason = f'published {manila_day(real).isoformat()}'
            else:
                fed = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00')) if item.get('published_at') else None
                local = real.astimezone(MANILA)
                if (local.hour, local.minute, local.second) != (0, 0, 0):
                    # The outlet's time, when the feed's is more than an hour off it.
                    new = real if not fed or abs((fed - real).total_seconds()) > 3600 else None
                elif not fed or manila_day(fed) != local.date():
                    # Only a date (from the address): the outlet's day, at the feed's time of day.
                    clock = fed.astimezone(MANILA).timetz() if fed else local.timetz()
                    new = datetime.combine(local.date(), clock)
                else:
                    new = None
                if new:
                    stamp = new.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    print(f"  dated: {item['title'][:60]} - {(item.get('published_at') or '')[:16]} -> {stamp[:16]}", file=sys.stderr)
                    item['published_at'] = stamp
                    moved += 1
    if reason:
        data['dropped'].append({'url': item['url'], 'via': item.get('via'), 'title': item['title'], 'reason': reason})
        print('  struck:', item['title'][:70], '-', reason, file=sys.stderr)
        struck += 1
        continue
    item['checked'] = today
    kept.append(item)
kept.sort(key=lambda i: i.get('published_at') or '', reverse=True)
data['items'] = kept
json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
print(f'checked the dates; struck {struck}, re-dated {moved}, {len(kept)} remain')
