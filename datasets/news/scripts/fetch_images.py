"""Give each story in datasets/news/news.json its picture: the one the outlet sets for sharing (og:image, else
twitter:image), read from the outlet's own page; for Inquirer, whose pages refuse automated reads, from its feeds.
A feed that carries a picture has already set it at the fetch.
A story is asked once: one whose page has no picture, or refuses automated reads, keeps `image: null`.

    python3 -I datasets/news/scripts/fetch_images.py

Run after check_dates.py. The pictures stay the outlets'; the page shows them small beside the link to the story.
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'news.json')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
META = [re.compile(p, re.I) for p in (
    r'<meta[^>]+property=["\']og:image(?::secure_url)?["\'][^>]*content=["\']([^"\']+)',
    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']',
    r'<meta[^>]+name=["\']twitter:image(?::src)?["\'][^>]*content=["\']([^"\']+)',
    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*name=["\']twitter:image["\']',
)]
# A site's logo, or the stock card from its theme (The Manila Times' TMT_1920x1008), is not the story's picture.
LOGO = re.compile(r'logo|default|placeholder|favicon|/icons?/|theme_|/themes?/', re.I)


def picture(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html'})
        with urllib.request.urlopen(req, timeout=20) as r:
            page = r.read(400_000).decode('utf-8', 'replace')
    except Exception:
        return None
    for m in (p.search(page) for p in META):
        if m:
            src = urllib.parse.urljoin(url, html.unescape(m.group(1).strip()))
            return src if src.startswith('http') and not LOGO.search(src) else None
    return None


# Inquirer's pages turn away automated reads, but its WordPress feeds carry each story's picture: the last few
# pages of them, matched by link, cover a week of its stories.
INQUIRER_FEEDS = ('https://newsinfo.inquirer.net/feed', 'https://newsinfo.inquirer.net/category/inquirer-headlines/regions/feed',
                  'https://newsinfo.inquirer.net/category/latest-stories/feed', 'https://globalnation.inquirer.net/feed', 'https://cebudailynews.inquirer.net/feed')
_inquirer = None


def inquirer_picture(url):
    global _inquirer
    if _inquirer is None:
        _inquirer = {}
        for base in INQUIRER_FEEDS:
            for page in range(1, 6):
                try:
                    req = urllib.request.Request(f'{base}?paged={page}', headers={'User-Agent': UA})
                    xml = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'replace')
                except Exception:
                    break
                items = re.findall(r'<item>(.*?)</item>', xml, re.S)
                for it in items:
                    link, img = re.search(r'<link>(.*?)</link>', it), re.search(r'<media:content[^>]*url="([^"]+)"', it)
                    if link and img:
                        _inquirer[link.group(1).strip()] = img.group(1)
                if not items:
                    break
                time.sleep(0.6)
    return _inquirer.get(url)


data = json.load(open(PATH))
# A story is asked once (`pictured`): the fetch sets `image` from the feed, so null there only means the feed had none.
todo = [i for i in data['items'] if not i.get('image') and not i.get('pictured') and 'news.google.com' not in i['url']]
found = 0
for n, item in enumerate(todo):
    item['image'] = picture(item['url']) or (inquirer_picture(item['url']) if 'inquirer.net' in item['url'] else None)
    item['pictured'] = True
    found += bool(item['image'])
    time.sleep(0.4)
    if n % 20 == 19:
        json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
json.dump(data, open(PATH, 'w'), indent=1, ensure_ascii=False); open(PATH, 'a').write('\n')
have = sum(bool(i.get('image')) for i in data['items'])
print(f'pictures: {found} found of {len(todo)} asked; {have} of {len(data["items"])} stories have one')
