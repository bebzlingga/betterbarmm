"""Second resolver: look the headline up on Brave Search and take the result on the outlet's own domain. Generic User-Agent, ~3 s pace, works from the end of the list."""
import json, re, sys, time, html, urllib.parse, urllib.request
cand, dst = sys.argv[1], sys.argv[2]
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
DOMAIN = {'Philstar': 'philstar.com', 'Inquirer': 'inquirer.net', 'GMA': 'gmanetwork.com', 'Manila Bulletin': 'mb.com.ph', 'SunStar': 'sunstar.com.ph', 'Rappler': 'rappler.com',
          'Philippine News Agency': 'pna.gov.ph', 'ABS-CBN': 'abs-cbn.com', 'Facebook': 'facebook.com', 'BARMM Official': 'bangsamoro.gov.ph', 'MindaNews': 'mindanews.com',
          'Manila Times': 'manilatimes.net', 'DZRH': 'dzrh.com.ph', 'BusinessWorld': 'bworldonline.com', 'Philippine Information Agency': 'pia.gov.ph', 'Daily Tribune': 'tribune.net.ph',
          'ReliefWeb': 'reliefweb.int', 'Interaksyon': 'interaksyon', 'olitiko': 'politiko.com.ph', 'Mindanao Times': 'mindanaotimes.com.ph', 'Bombo': 'bomboradyo.com', 'PTV': 'ptvnews.ph',
          'Cebu Daily News': 'cebudailynews', 'BusinessMirror': 'businessmirror.com.ph', 'Baird': 'bairdmaritime.com', 'Xinhua': 'news.cn', 'Davao Today': 'davaotoday.com', 'BBC': 'bbc.co',
          'Al Jazeera': 'aljazeera.com', 'Gulf News': 'gulfnews.com', 'Straits Times': 'straitstimes.com', 'Kami': 'kami.com.ph', 'rpnradio': 'rpnradio.com', 'metrocdo': 'metrocdodev.com',
          'Malaya': 'malaya.com.ph', 'Manila Standard': 'manilastandard.net', 'UCA News': 'ucanews.com', 'Bilyonaryo': 'bilyonaryo.com', 'Inside Manila': 'insidemanila', 'Sunstar': 'sunstar.com.ph'}
done = set()
try:
    for l in open(dst): done.add(json.loads(l)['link'])
except FileNotFoundError: pass
rows = [json.loads(l) for l in open(cand)]
def search(q):
    url = 'https://search.brave.com/search?' + urllib.parse.urlencode({'q': q, 'source': 'web'})
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html', 'Accept-Language': 'en-US,en;q=0.9'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            print('429, waiting', 60 * (attempt + 1), file=sys.stderr); time.sleep(60 * (attempt + 1))
    return ''
with open(dst, 'a') as f:
    for r in reversed(rows):
        if r['link'] in done: continue
        title = re.sub(r'\s+-\s+[^-]+$', '', r['title']).strip()
        dom = next((d for k, d in DOMAIN.items() if k.lower() in r['source'].lower()), None)
        url = None
        try:
            page = search(f'"{title}"')
            hrefs = [html.unescape(h) for h in re.findall(r'href="(https?://[^"]+)"', page)]
            hrefs = [h for h in hrefs if 'brave.com' not in h and 'google.' not in h]
            if dom: url = next((h for h in hrefs if dom in h), None)
        except Exception as e:
            print('ERR', e, title[:50], file=sys.stderr)
        # Only a confirmed outlet match is written; anything else is left for the other resolver.
        if url:
            f.write(json.dumps({'link': r['link'], 'url': url, 'via': 'brave'}) + '\n'); f.flush()
        done.add(r['link'])
        print('brave', r['source'][:14], '|', title[:50], '->', url, file=sys.stderr)
        time.sleep(8)
print('brave done')
