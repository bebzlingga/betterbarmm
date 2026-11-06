"""The news, kept a week to a file (user decision): datasets/news/weeks/<Monday>.json holds that week's stories,
Monday to Sunday on Manila's clock, and datasets/news/index.json what is about all of them (the note, the day the
record starts, the stories struck as off-topic). Nothing is deleted; the page shows the newest week and hides the
rest. load() hands a script the whole record as one dict, and save() splits it again."""
import json, os
from datetime import datetime, timedelta, timezone

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
WEEKS = os.path.join(ROOT, 'weeks')
INDEX = os.path.join(ROOT, 'index.json')
MANILA = timezone(timedelta(hours=8))

def monday(iso):
    d = datetime.fromisoformat(iso.replace('Z', '+00:00')).astimezone(MANILA).date()
    return (d - timedelta(days=d.weekday())).isoformat()

def _write(path, obj):
    text = json.dumps(obj, indent=1, ensure_ascii=False) + '\n'
    if not os.path.exists(path) or open(path).read() != text:
        open(path, 'w').write(text)

def load():
    data = json.load(open(INDEX))
    data['items'] = []
    for f in sorted(os.listdir(WEEKS)):
        if f.endswith('.json'):
            data['items'] += json.load(open(os.path.join(WEEKS, f)))['items']
    data['items'].sort(key=lambda i: i.get('published_at') or '', reverse=True)
    return data

def save(data):
    os.makedirs(WEEKS, exist_ok=True)
    weeks = {}
    for item in data['items']:
        weeks.setdefault(monday(item['published_at']), []).append(item)
    for week, items in weeks.items():
        items.sort(key=lambda i: i.get('published_at') or '', reverse=True)
        _write(os.path.join(WEEKS, f'{week}.json'), {'week': week, 'items': items})
    index = {k: v for k, v in data.items() if k != 'items'}
    index['weeks'] = sorted(weeks, reverse=True)
    _write(INDEX, index)

if __name__ == '__main__':
    # Self-check: what load() reads, save() writes back unchanged, and every story sits in its own week's file.
    before = {f: open(os.path.join(WEEKS, f)).read() for f in os.listdir(WEEKS)}
    data = load(); save(data)
    assert before == {f: open(os.path.join(WEEKS, f)).read() for f in os.listdir(WEEKS)}, 'a load and save changed the files'
    for f in before:
        assert all(monday(i['published_at']) == f[:-5] for i in json.load(open(os.path.join(WEEKS, f)))['items']), f
    print('ok:', len(data['items']), 'stories in', len(before), 'weeks')
