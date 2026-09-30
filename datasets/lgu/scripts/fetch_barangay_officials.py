#!/usr/bin/env python3
"""Capture who holds office in each of BARMM's barangays.

The directory has always stopped at the municipality. Barangay officials are
elected separately, at the Barangay and Sangguniang Kabataan Elections, and
COMELEC publishes no canvass for them that survives in a readable form — so
the workspace could name the mayor of a town of forty thousand and not the
punong barangay of the village a reader actually lives in.

DILG publishes them, through the directory behind its public search:

  https://beta.dilg.gov.ph/barangay-officials-directory   the search itself
  .../get-province   .../get-citymun   .../get-barangay   the place lists
  https://bis.dilg.gov.ph/bops/default/master-filter      one barangay's roster

The roster is one request per barangay and there are 2,185 of them, so this
runs four at a time and appends each answer to a cache as it lands. A re-run
reads the cache and asks only for what is missing — a government server that
is under no obligation to carry us should not be made to serve the same 2,185
requests twice because the last pass died at 1,900.

Two things this deliberately drops. DILG returns each official's e-mail
address and a barangay hall telephone number; neither is republished here.
They are contact details for one person at a time, they add nothing to a
directory whose question is *who holds the office*, and a static site is a
harvesting surface in a way a search form is not. The page points at DILG's
own directory for anyone who needs to make contact.

What the source cannot do, this records rather than papers over:

  · Around a quarter of BARMM's barangays have no roster in the directory at
    all. That is a gap in DILG's record, not a barangay without officials, and
    the file marks those barangays present-but-empty so the page can say which
    it is.

  · DILG stamps no term on the data. It is a live directory, updated as
    barangays report, so what is written here is what it held on the capture
    date and is labeled that way rather than assigned to a term it may not
    match.

  · The directory's barangay lists and PSGC's disagree in a few places —
    spelling drift, mostly, in the Special Geographic Area, whose towns are
    two years old. Those are mapped by hand below. Marawi is the real
    disagreement: DILG carries five barangays PSGC does not, and rather than
    invent structure from a contact directory they are reported and skipped.

Writes datasets/lgu/barangay-officials.json.

    python3 datasets/lgu/scripts/fetch_barangay_officials.py
"""

from __future__ import annotations

import datetime as dt
import json
import pathlib
import re
import subprocess
import sys
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[3]
DATASET = ROOT / 'datasets' / 'lgu' / 'barmm-lgu.json'
OUT = ROOT / 'datasets' / 'lgu' / 'barangay-officials.json'
CACHE = pathlib.Path(__file__).parent / '.barangay-officials-cache.jsonl'

DIRECTORY = 'https://beta.dilg.gov.ph/barangay-officials-directory'
ROSTER = 'https://bis.dilg.gov.ph/bops/default/master-filter'
BARMM = '19'  # DILG's region id for the Bangsamoro region
AGENT = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
         'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36')

# The offices a barangay roster can name, in the order a reader wants them:
# the elected ones first, then the appointed staff of the barangay hall.
OFFICES = {
    'Punong Barangay': 'punongBarangay',
    'Sangguniang Barangay Member': 'council',
    'SK Chairperson': 'skChairperson',
    'Barangay Secretary': 'secretary',
    'Barangay Treasurer': 'treasurer',
}
ELECTED = {'punongBarangay', 'council', 'skChairperson'}

# Where DILG's spelling of a barangay differs from PSGC's, keyed by the
# municipality it happens in. Scoped rather than global on purpose: almost
# every name below is also a real, correctly-spelled barangay somewhere else
# in the region — fourteen Lanao del Sur towns have a Bagoaingud, and Wao and
# Nabalawag each have a Kadingilan — so a region-wide rewrite would break the
# towns that had it right to fix the one that did not.
SPELLINGS = {
    # The Special Geographic Area's municipalities were ratified in 2024 and
    # their barangay names are still settling between DILG and PSGC.
    ('KAPALAWAN', 'KIB AYAO'): 'KIBAYAO',
    ('OLD KAABAKAN', 'NANGA AN'): 'NANGAAN',
    ('NABALAWAG', 'DUNGUAN'): 'DUNGGUAN',
    ('PAHAMUDDIN', 'KADINGILAN'): 'KADILINGAN',
    ('PAHAMUDDIN', 'LOWER BAGUER'): 'LOWER BAQUER',
    ('MALIDEGAO', 'GOKOTON'): 'GOKOTAN',
    ('LIGAWASAN', 'BAGOAINGUD'): 'BAGOINGED',
    ('LIGAWASAN', 'GLIGLI'): 'GLI GLI',
    ('LIGAWASAN', 'RAJAH MUDA'): 'RAJAMUDA',
    # Shariff Saydona Mustapha has two barangays named Pagatin. DILG
    # distinguishes them; PSGC gives them codes and the same name. Matched in
    # the order both sources list them.
    ('SHARIFF SAYDONA MUSTAPHA', 'PAGATIN PAGATIN I'): 'PAGATIN',
}


def normalise(name: str) -> str:
    """A name reduced to letters and digits, for matching only."""
    # DILG serves a few names double-encoded — "BaÃ±as" for "Bañas".
    if 'Ã' in name:
        try:
            name = name.encode('latin-1').decode('utf-8')
        except UnicodeError:
            pass
    folded = unicodedata.normalize('NFKD', name or '').encode('ascii', 'ignore').decode()
    folded = re.sub(r'\b(CITY OF|CITY|POB|POBLACION)\b', ' ', folded.upper())
    return re.sub(r'[^A-Z0-9]+', ' ', folded).strip()


def get(url: str, tries: int = 4):
    """Fetch JSON over curl — python's ssl has no CA bundle on every box."""
    for attempt in range(tries):
        done = subprocess.run(
            ['curl', '-sS', '--max-time', '45', '-A', AGENT,
             '-H', f'Referer: {DIRECTORY}',
             '-H', 'Accept: application/json, text/javascript, */*', url],
            capture_output=True, text=True,
        )
        try:
            return json.loads(done.stdout)
        except ValueError:
            if attempt == tries - 1:
                raise RuntimeError(f'{url} answered {done.stdout[:160]!r}')
            time.sleep(2 * (attempt + 1))


def places() -> list[dict]:
    """DILG's own province → city/municipality → barangay tree for BARMM."""
    listed = lambda rows: [row for row in rows if row['id']]
    tree = []
    for province in listed(get(f'{DIRECTORY}/get-province?regionId={BARMM}')):
        units = []
        for unit in listed(get(
            f'{DIRECTORY}/get-citymun?regionId={BARMM}&provinceId={province["id"]}'
        )):
            barangays = listed(get(
                f'{DIRECTORY}/get-barangay?regionId={BARMM}'
                f'&provinceId={province["id"]}&citymunId={unit["id"]}'
            ))
            units.append({**unit, 'barangays': barangays})
            print(f'  {province["text"]:<24} {unit["text"]:<26} {len(barangays):>4}', flush=True)
            time.sleep(0.4)
        tree.append({**province, 'units': units})
    return tree


def rosters(tree: list[dict]) -> dict[tuple[str, str, str], list[dict]]:
    """Every barangay's roster, from the cache where we already have it."""
    wanted = [(province['id'], unit['id'], barangay['id'])
              for province in tree for unit in province['units']
              for barangay in unit['barangays']]

    held: dict[tuple[str, str, str], list[dict]] = {}
    if CACHE.exists():
        for line in CACHE.read_text().splitlines():
            row = json.loads(line)
            held[(row['province'], row['citymun'], row['brgy'])] = row['officials']

    missing = [place for place in wanted if place not in held]
    print(f'{len(wanted)} barangays, {len(held)} cached, {len(missing)} to fetch')

    def fetch(place):
        province, unit, barangay = place
        return place, get(f'{ROSTER}?region={BARMM}&province={province}'
                          f'&citymun={unit}&brgy={barangay}')

    if missing:
        with CACHE.open('a') as cache, ThreadPoolExecutor(4) as pool:
            for done, (place, officials) in enumerate(pool.map(fetch, missing), 1):
                held[place] = officials
                cache.write(json.dumps({'province': place[0], 'citymun': place[1],
                                        'brgy': place[2], 'officials': officials}) + '\n')
                if done % 100 == 0:
                    cache.flush()
                    print(f'  {done}/{len(missing)}', flush=True)
    return held


def named(official: dict) -> str:
    """"SURNAME, Given Middle Suffix" — the form the rest of the record uses."""
    rest = ' '.join(part.strip() for part in
                    (official['FIRSTNAME'], official['MIDDLENAME'], official['SUFFIX'])
                    if part and part.strip())
    return f'{official["LASTNAME"].strip()}, {rest}'.strip().rstrip(',')


def main() -> None:
    dataset = json.loads(DATASET.read_text())

    units: dict[str, tuple[str, dict]] = {}
    for province in dataset['provinces']:
        for unit in province['municipalities']:
            for name in {unit['name'], unit.get('alsoKnownAs') or ''} - {''}:
                units[normalise(name)] = (unit['slug'], unit)

    print('reading DILG\'s place tree')
    tree = places()
    held = rosters(tree)

    out: dict[str, dict] = {}
    people = empty = 0
    orphans: list[str] = []

    for province in tree:
        for unit in province['units']:
            key = normalise(unit['text'])
            if key not in units:
                orphans.append(f'{province["text"]} / {unit["text"]} (whole municipality)')
                continue
            slug, ours = units[key]

            # Barangays keyed by PSGC where they have one, and by name where
            # they do not — the Special Geographic Area's are too new to be
            # coded. Queued per key so that Shariff Saydona Mustapha's two
            # barangays named Pagatin take DILG's two in the same order.
            queue: dict[str, list[dict]] = {}
            for barangay in ours['barangays']:
                queue.setdefault(normalise(barangay['name']), []).append(barangay)

            for listing in unit['barangays']:
                name = normalise(listing['text'])
                name = SPELLINGS.get((key, name), name)
                waiting = queue.get(name)
                if not waiting:
                    orphans.append(f'{province["text"]} / {unit["text"]} / {listing["text"]}')
                    continue
                mine = waiting.pop(0)

                roster: dict[str, object] = {}
                for official in held[(province['id'], unit['id'], listing['id'])]:
                    office = OFFICES.get(official['POSITION'])
                    if not office:
                        orphans.append(f'unknown office: {official["POSITION"]}')
                        continue
                    if office == 'council':
                        roster.setdefault('council', []).append({'name': named(official)})
                    else:
                        roster[office] = {'name': named(official)}
                    people += 1

                if not roster:
                    empty += 1
                out.setdefault(slug, {})[mine['psgc'] or mine['name']] = roster

    captured = dt.date.today().isoformat()
    payload = {
        'name': 'Barangay officials of BARMM',
        'capturedAt': captured,
        'source': {
            'label': 'DILG — Barangay Officials Directory',
            'href': DIRECTORY,
        },
        'note': (
            'DILG publishes this as a live directory and stamps no term on it, so '
            'these are the officials it held on '
            f'{captured} rather than the roll of a '
            'particular term. Around a quarter of BARMM\'s barangays have no entry '
            'in it — a gap in the directory, not a barangay without officials. '
            'Contact details are published by DILG and are not repeated here.'
        ),
        'offices': {
            'elected': sorted(ELECTED),
            'note': (
                'Punong barangay, the seven sangguniang barangay members and the SK '
                'chairperson are elected at the Barangay and Sangguniang Kabataan '
                'Elections. The secretary and treasurer are appointed by the punong '
                'barangay with the sanggunian\'s concurrence.'
            ),
        },
        'units': out,
    }
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + '\n')

    if orphans:
        print(f'\n{len(orphans)} entries DILG carries that PSGC does not:')
        for orphan in sorted(set(orphans)):
            print(f'  {orphan}')

    listed = sum(len(barangays) for barangays in out.values())
    print(f'\n{len(out)} municipalities, {listed} barangays, {people} officials, '
          f'{empty} barangays with no roster on file -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
