"""Collect resolved Google News links into datasets/accidents/links.json: {google link: outlet URL}."""
import json, sys
links = {}
for l in open(sys.argv[1]):
    d = json.loads(l)
    if d.get('url'): links[d['link']] = d['url']
json.dump(links, open(sys.argv[2], 'w'), indent=0, ensure_ascii=False)
print(len(links), 'links')
