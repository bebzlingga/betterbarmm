"""The Government Procurement Policy Board's blacklist, from its Online
Blacklisting Portal's public API: every blacklisted supplier, and for each,
the procuring entity that blacklisted it, the project, and the period.

Writes datasets/procurement/gppb-blacklist.json. The procurement workspace
matches these names to its suppliers.

    python3 datasets/procurement/scripts/fetch_gppb_blacklist.py
"""
import json
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

API = 'https://onlineblacklistingportal.gppb.gov.ph/obp-backend/dashboard'
OUT = Path(__file__).resolve().parents[1] / 'gppb-blacklist.json'
UA = {'User-Agent': 'Mozilla/5.0 (BetterBARMM procurement reader; support@betterbarmm.com)'}


def get(path):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(f'{API}{path}', headers=UA), timeout=60) as r:
                return json.load(r)
        except Exception:
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f'could not read {path}')


def pages(path):
    page, out = 1, []
    while True:
        d = get(f'{path}{"&" if "?" in path else "?"}page={page}')
        out += d['data']
        if not d.get('next_page'):
            return out
        page += 1
        time.sleep(0.3)


def main():
    entities = pages('/list-blacklisted-entities/')
    for e in entities:
        e['orders'] = pages(f'/child-list-blacklisted-entities/?be={urllib.parse.quote(e["blacklisted_entity"])}')
        time.sleep(0.3)
    # Unchanged list, untouched file: the nightly job only proposes real changes.
    if OUT.exists() and json.loads(OUT.read_text()).get('entities') == entities:
        print(f'{len(entities)} blacklisted entities, unchanged')
        return
    OUT.write_text(json.dumps({
        'name': 'GPPB blacklisted entities',
        'generatedAt': date.today().isoformat(),
        'source': [{'label': 'GPPB Online Blacklisting Portal', 'href': 'https://onlineblacklistingportal.gppb.gov.ph/'}],
        'note': 'Every entity on the Government Procurement Policy Board\'s blacklist, with each blacklisting order: the procuring entity that issued it, the project, and the period it runs. "min_date"/"max_date" span all of an entity\'s orders.',
        'entities': entities,
    }, ensure_ascii=False, indent=1) + '\n')
    print(f'{len(entities)} blacklisted entities, {sum(len(e["orders"]) for e in entities)} orders')


if __name__ == '__main__':
    main()
