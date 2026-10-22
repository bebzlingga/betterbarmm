"""The one check the build leaves behind: run it and assert the dataset holds together.

    python3 -I datasets/accidents/scripts/build_accidents.check.py
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
subprocess.run([sys.executable, '-I', os.path.join(HERE, 'build_accidents.py'), '--no-geocode'], check=True, capture_output=True)
data = json.load(open(os.path.join(ROOT, 'accidents.json')))
incidents = data['incidents']
assert incidents, 'no incidents built'
ids = [a['id'] for a in incidents]
assert len(ids) == len(set(ids)), 'ids repeat'
assert ids == [a['id'] for a in sorted(incidents, key=lambda a: a['date'], reverse=True)], 'not newest first'
for a in incidents:
    assert re.match(r'^\d{4}-\d{2}(-\d{2})?$', a['date']), a['id']
    assert a['type'] in ('road', 'water', 'flood', 'fire', 'shooting', 'other'), a['id']
    assert 4.3 <= a['lat'] <= 8.4 and 118.3 <= a['lon'] <= 125.5, f"{a['id']} is outside the region"
    assert a['placed'] in ('barangay', 'municipality', 'province'), a['id']
    assert a['municipality'] or a['placed'] == 'province', a['id']
    assert a['sources'] and all(s['url'].startswith('http') for s in a['sources']), f"{a['id']} has no source"
    assert len({s['url'] for s in a['sources']}) == len(a['sources']), f"{a['id']} repeats a source"
    for k in ('deaths', 'injured', 'missing'):
        assert a[k] is None or (isinstance(a[k], int) and a[k] >= 0), f"{a['id']} {k}"
    assert a['title'] and a['summary'] and a['province'], a['id']
    assert 'Sulu' != a['province'], a['id']
    # An outlet's photo, linked where it lives; or, where its address would not last (a Facebook image), a copy the www
    # app serves from public/accident-photos, which is the only app that draws one.
    assert a.get('image') is None or ((a['image']['url'].startswith('http') or a['image']['url'].startswith('/accident-photos/')) and a['image']['href'].startswith('http') and a['image']['outlet']), f"{a['id']} image"
print(f"ok: {len(incidents)} incidents, {sum(a['deaths'] or 0 for a in incidents)} deaths, {sum(1 for a in incidents if a['placed'] == 'barangay')} placed at a barangay")
