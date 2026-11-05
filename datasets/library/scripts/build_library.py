"""Builds the library's records from the hand-curated shelf.

    python3 datasets/library/scripts/build_library.py

Reads datasets/library/shelf.json (books, authors, publishers, as editors keep them)
and writes books.json, authors.json and publishers.json beside it:

  · each book gets its links (a free copy, a shop, Amazon, Open Library, the
    Internet Archive, WorldCat, as the book has them) and a cover from Open
    Library's covers service, or failing that Amazon's image for the ISBN,
    saved to apps/library/public/covers with a .json note of where it came from;
  · a book Open Library describes gets that description as its blurb, credited;
  · an author with a Wikipedia article gets the article's opening as their life
    in brief, under CC BY-SA, and a link to it; the rest keep the shelf's own line.

Fetches are cached: a cover already on disk is kept, and Wikipedia openings are
kept in wiki-cache.json, so a rebuild is quick and offline-safe.
"""
import json, pathlib, re, sys, time, urllib.parse, urllib.request
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[3]
LIB = ROOT / 'datasets/library'
COVERS = ROOT / 'apps/library/public/covers'
COVERS.mkdir(parents=True, exist_ok=True)
UA = 'betterbarmm-library/1.0 (a catalogue of books about the Bangsamoro)'
shelf = json.loads((LIB / 'shelf.json').read_text())
cache_path = LIB / 'wiki-cache.json'
cache = json.loads(cache_path.read_text()) if cache_path.exists() else {}

def get(url, binary=False, timeout=40):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read()
            return (data if binary else json.loads(data)), r.headers.get('Content-Type', '')
    except Exception as e:
        return None, str(e)

def isbn10(isbn13):
    if not isbn13 or len(isbn13) != 13 or not isbn13.startswith('978'):
        return isbn13 if isbn13 and len(isbn13) == 10 else None
    core = isbn13[3:12]
    s = sum((10 - i) * int(c) for i, c in enumerate(core))
    d = (11 - s % 11) % 11
    return core + ('X' if d == 10 else str(d))

def host(url):
    return re.sub(r'^www\.', '', urllib.parse.urlparse(url).hostname or url)

# ---- covers -------------------------------------------------------------------
def cover_for(b):
    path = COVERS / f"{b['slug']}.jpg"
    tries = []
    if b.get('cover'):
        tries.append(('cover id', f"https://covers.openlibrary.org/b/id/{b['cover']}-L.jpg?default=false"))
    if b.get('isbn'):
        tries.append(('ISBN', f"https://covers.openlibrary.org/b/isbn/{b['isbn']}-L.jpg?default=false"))
    if b.get('ol'):
        tries.append(('work', f"https://covers.openlibrary.org/b/olid/{b['ol'].rsplit('/', 1)[-1]}-L.jpg?default=false"))
    # Amazon's cover image by ISBN-10, a 1x1 placeholder when it has none; used last, as a seller's copy.
    ten = isbn10(b.get('isbn'))
    if ten:
        tries.append(('Amazon', f'https://images-na.ssl-images-amazon.com/images/P/{ten}.01.LZZZZZZZ.jpg'))
    meta = COVERS / f"{b['slug']}.json"
    if path.exists() and path.stat().st_size > 1500 and meta.exists():
        return json.loads(meta.read_text())
    for how, url in tries:
        data, ctype = get(url, binary=True)
        time.sleep(0.6)
        if data and len(data) > 1500 and 'image' in ctype:
            path.write_bytes(data)
            rec = {'file': path.name, 'source': 'Amazon' if how == 'Amazon' else 'Open Library', 'url': url.split('?')[0]}
            meta.write_text(json.dumps(rec))
            print(f"  cover  {b['slug']} ({how})")
            return rec
    return None

# ---- links --------------------------------------------------------------------
def links_for(b):
    out = []
    if b.get('pdf'):
        out.append({'label': 'Read it free', 'url': b['pdf']})
    if b.get('shop'):
        out.append({'label': f"Buy from {host(b['shop'])}", 'url': b['shop']})
    ten = isbn10(b.get('isbn'))
    if ten and b['availability'] in ('for-sale', 'private'):
        out.append({'label': 'Amazon', 'url': f'https://www.amazon.com/dp/{ten}'})
    if b.get('ol'):
        out.append({'label': 'Open Library', 'url': f"https://openlibrary.org{b['ol']}"})
    if b.get('ia') and not (b.get('pdf') or '').startswith('https://archive.org'):
        out.append({'label': 'Borrow on the Internet Archive' if b['availability'] != 'open-access' else 'Internet Archive', 'url': f"https://archive.org/details/{b['ia']}"})
    if b.get('isbn'):
        out.append({'label': 'WorldCat', 'url': f"https://search.worldcat.org/isbn/{b['isbn']}"})
    else:
        out.append({'label': 'WorldCat', 'url': 'https://search.worldcat.org/search?q=' + urllib.parse.quote(f'ti:"{b["title"]}"')})
    return out

# ---- Wikipedia -----------------------------------------------------------------
def wiki(title):
    if title in cache:
        return cache[title]
    data, _ = get('https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title.replace(' ', '_')))
    time.sleep(0.4)
    entry = None
    if data and data.get('type') == 'standard' and data.get('extract'):
        entry = {'extract': data['extract'], 'url': data['content_urls']['desktop']['page']}
    cache[title] = entry
    print(f"  wiki   {title}: {'ok' if entry else 'none'}")
    return entry

def trim(text, limit=620):
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = max(cut.rfind('. '), cut.rfind('.\n'))
    return (cut[: end + 1] if end > 200 else cut.rstrip() + '…')

# ---- the publisher's own description, where Open Library has one ----------------
def blurb_for(b):
    if not b.get('ol'):
        return None
    key = 'blurb:' + b['ol']
    if key in cache:
        return cache[key]
    data, _ = get(f"https://openlibrary.org{b['ol']}.json")
    time.sleep(0.5)
    d = (data or {}).get('description')
    text = d.get('value') if isinstance(d, dict) else d
    text = re.sub(r'\s+', ' ', text).strip() if text else None
    # Open Library's descriptions are the publishers' or contributors' words; a line of
    # boilerplate or a bare sentence is not worth showing.
    if text and (len(text) < 80 or re.match(r'(?i)^(this book|a book)\b.{0,40}$', text)):
        text = None
    cache[key] = trim(text, 900) if text else None
    print(f"  blurb  {b['slug']}: {'ok' if cache[key] else 'none'}")
    return cache[key]

# ---- build ---------------------------------------------------------------------
books = []
for b in shelf['books']:
    rec = {k: b.get(k) for k in ('slug', 'title', 'subtitle', 'authors', 'role', 'publisher', 'year', 'edition', 'pages', 'isbn', 'language', 'kind', 'subjects', 'summary', 'availability', 'note')}
    rec['cover'] = cover_for(b)
    rec['links'] = links_for(b)
    rec['blurb'] = blurb_for(b)
    books.append(rec)

authors = []
for a in shelf['authors']:
    rec = {k: a.get(k) for k in ('slug', 'name', 'sort', 'bio', 'born', 'died', 'from', 'roles', 'local')}
    rec['links'] = []
    if a.get('wikipedia'):
        w = wiki(a['wikipedia'])
        if w and len(w['extract']) > 60:
            rec['bio'] = trim(w['extract'])
            rec['links'].append({'label': 'Wikipedia', 'url': w['url']})
            rec['bioSource'] = 'wikipedia'
    authors.append(rec)

publishers = [{k: p.get(k) for k in ('slug', 'name', 'kind', 'based', 'founded', 'about', 'url')} for p in shelf['publishers']]

today = date.today().isoformat()
(LIB / 'books.json').write_text(json.dumps({
    'name': 'Books about the Bangsamoro',
    'note': 'Chosen by hand; records from Open Library and the publishers, covers from Open Library’s covers service, links as checked on the build date. Edit shelf.json, not this file.',
    'built': today,
    'books': books,
}, ensure_ascii=False, indent='\t') + '\n')
(LIB / 'authors.json').write_text(json.dumps({'note': 'Lives in brief: from Wikipedia’s opening (CC BY-SA) where an article exists, else the shelf’s own line. Edit shelf.json, not this file.', 'built': today, 'authors': authors}, ensure_ascii=False, indent='\t') + '\n')
(LIB / 'publishers.json').write_text(json.dumps({'note': 'Edit shelf.json, not this file.', 'built': today, 'publishers': publishers}, ensure_ascii=False, indent='\t') + '\n')
cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent='\t') + '\n')
print(f"{len(books)} books, {sum(1 for b in books if b['cover'])} with covers; {len(authors)} authors, {sum(1 for a in authors if a.get('bioSource'))} from Wikipedia; {len(publishers)} publishers")
