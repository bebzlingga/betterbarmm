"""Resolve Google News RSS article links to the outlet's own URL (the batchexecute method). Generic User-Agent."""
import json, re, sys, time, urllib.parse, urllib.request
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

def get(req):
    # Google answers 429 when asked too often; wait it out rather than lose the link.
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            print('429, waiting', 90 * (attempt + 1), file=sys.stderr); time.sleep(90 * (attempt + 1))
    raise RuntimeError('still 429')

def decode(link):
    m = re.search(r'/articles/([^?/]+)', link)
    if not m: return None
    gid = m.group(1)
    req = urllib.request.Request(f'https://news.google.com/articles/{gid}', headers={'User-Agent': UA})
    page = get(req)
    sg = re.search(r'data-n-a-sg="([^"]+)"', page); ts = re.search(r'data-n-a-ts="([^"]+)"', page)
    if not sg or not ts: return None
    inner = json.dumps(['garturlreq', [['en-US', 'US', ['FINANCE_TOP_INDICES', 'WEB_TEST_1_0_0'], None, None, 1, 1, 'US:en', None, 180, None, None, None, None, None, 0, None, None, [1608992183, 723341000]], 'en-US', 'US', 1, [2, 3, 4, 8], 1, 0, '655000234', 0, 0, None, 0], gid, int(ts.group(1)), sg.group(1)])
    body = urllib.parse.urlencode({'f.req': json.dumps([[['Fbv4je', inner, None, 'generic']]])}).encode()
    req = urllib.request.Request('https://news.google.com/_/DotsSplashUi/data/batchexecute', data=body, headers={'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'})
    out = get(req)
    m = re.search(r'\[\\"garturlres\\",\\"(.*?)\\"', out)
    return json.loads('"' + m.group(1) + '"') if m else None

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    done = {}
    try:
        for l in open(dst):
            d = json.loads(l)
            if d.get('url'): done[d['link']] = d['url']  # a failed attempt is not done; it is tried again next run
    except FileNotFoundError: pass
    rows = [json.loads(l) for l in open(src)]
    with open(dst, 'a') as f:
        for i, r in enumerate(rows):
            if r['link'] in done: continue
            try: url = decode(r['link'])
            except Exception as e: url = None; print('ERR', e, r['link'][:60], file=sys.stderr)
            if url: f.write(json.dumps({'link': r['link'], 'url': url}) + '\n'); f.flush(); done[r['link']] = url
            print(i, url, file=sys.stderr); time.sleep(6)
