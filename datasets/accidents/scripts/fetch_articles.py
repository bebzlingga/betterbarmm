"""Fetch each resolved article once and keep its readable text. Generic User-Agent, one request a second, resumable."""
import json, re, sys, time, html, os, urllib.request, urllib.parse
cand, decoded, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
BLOCKED = ('inquirer.net', 'mb.com.ph', 'mindanews.com', 'abs-cbn.com', 'brigadanews.ph', 'pia.gov.ph', 'facebook.com', 'pressreader.com')
urls = {}
for l in open(decoded):
    d = json.loads(l); urls[d['link']] = d['url']
rows = [json.loads(l) for l in open(cand)]

def text_of(page):
    page = re.sub(r'<(script|style|noscript|svg|header|footer|nav|aside)[^>]*>.*?</\1>', ' ', page, flags=re.S | re.I)
    paras = re.findall(r'<p[^>]*>(.*?)</p>', page, re.S | re.I)
    out = []
    for p in paras:
        t = html.unescape(re.sub(r'<[^>]+>', ' ', p)); t = re.sub(r'\s+', ' ', t).strip()
        if len(t) > 40: out.append(t)
    return '\n'.join(out)

for i, r in enumerate(rows):
    path = os.path.join(outdir, f'{i:04d}.json')
    if os.path.exists(path): continue
    url = urls.get(r['link'])
    if url is None and '--final' not in sys.argv: continue  # not resolved yet; a later pass will come back for it
    rec = {'n': i, 'title': r['title'], 'source': r['source'], 'pubDate': r['pubDate'], 'google_link': r['link'], 'url': url, 'description': r['description'], 'body': None, 'status': None}
    if url and not any(b in url for b in BLOCKED):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html'})
            with urllib.request.urlopen(req, timeout=25) as resp:
                page = resp.read(1_500_000).decode('utf-8', 'replace'); rec['status'] = resp.status
            body = text_of(page)
            rec['body'] = body[:6000] if len(body) > 200 else None
        except Exception as e:
            rec['status'] = str(e)[:80]
        time.sleep(1.0)
    elif url: rec['status'] = 'skipped: host blocks fetches'
    else: rec['status'] = 'unresolved'
    json.dump(rec, open(path, 'w'), ensure_ascii=False)
    print(i, rec['status'], (url or '')[:70], file=sys.stderr)
print('done')
