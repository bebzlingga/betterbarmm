"""Swap each Google News link in datasets/news/news.json for the outlet's own address, so a reader lands
on the outlet. The Google link stays as `via`, which the fetch uses to know the story is already here.

    python3 -I datasets/news/scripts/resolve_links.py
"""
import json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'accidents', 'scripts'))
from gnews_decode import decode  # the decoder the incident sweeps use

PATH = os.path.join(HERE, '..', 'news.json')
data = json.load(open(PATH))
todo = [i for i in data['items'] if 'news.google.com' in i['url']]
done = 0
for n, item in enumerate(todo):
    try:
        url = decode(item['url'])
    except Exception as e:
        print('  failed:', item['title'][:60], e, file=sys.stderr); url = None
    if url:
        item['via'], item['url'] = item['url'], url; done += 1
    if n % 10 == 9:
        json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
    time.sleep(1.2)  # Google answers 429 when asked too often
json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
print(f'resolved {done} of {len(todo)} Google News links; {len(todo) - done} still go through Google')
