#!/usr/bin/env python3
"""Build the record of who has held local office in BARMM since 2001.

The directory already carries the 2025 term as COMELEC canvassed it, vote by
vote. Everything before it was a blank: COMELEC took the 2019 results site
down, its 2022 site serves canvass data only to its own front end, and nothing
survives online for the cycles before that.

OpenHalalan fills the blank. It is a reconstruction of every Philippine
national and local election since 2001, assembled from COMELEC's own archived
returns and, where those are gone, from the Rappler and Ianmaps archives,
published under ODbL with a per-cycle account of what it could recover:

  https://robertrleung.github.io/OpenHalalan/
  Leung, R., et al. (2026). OpenHalalan: The Philippine National and Local
  Election Dataset. Zenodo. https://doi.org/10.5281/zenodo.17783099

It publishes two files, and the difference between them is the difference
between two kinds of history:

  NLE_Winners_2004-2025.csv        who took each office, 2001 onward
  NLE_Vote_Counts_2007-2025.csv.gz every candidate and every vote, 2007 onward

So a term is recorded here in one of two ways, and they are not the same
claim. Where the vote counts reach a town, the term is a **canvass** — every
candidate, their votes, their share and their rank, the same shape as the 2025
record beside it. Where only the winners file reaches it, the term is a
**roll**: a name and a party, with nothing behind them. Each unit-term is
tagged `kind` so a page can never render the second as though it were the
first.

Coverage, once Sulu and Isabela are dropped:

  2022, 2019, 2016   canvass for every municipality
  2013, 2010         canvass for roughly 60, a roll for the rest
  2007, 2004, 2001   a roll only; no vote counts exist

Four things the source needs handling for:

  · Sulu is in it, under BARMM, for every cycle. The Supreme Court removed
    Sulu from the region, so it is dropped here, as everywhere else in this
    directory.

  · Isabela City is in it, under Basilan. Isabela is a Region IX city and has
    never been part of BARMM; dropped for the same reason.

  · Maguindanao is undivided before 2025. The province split in 2022 but the
    source files the provincial offices under the old undivided province
    through 2022, which is right — one governor governed both halves. That
    record is attached to both successor provinces, flagged `undivided`, so
    neither pretends to a governor of its own that it did not have.

  · Towns are filed under COMELEC's spellings, which include renamed towns
    written as "NewName OldName" and several still only under the old name.
    Mapped to the PSGC name this directory uses.

Writes datasets/lgu/officials-history.json, and rewrites the term list inside
datasets/lgu/barmm-lgu.json.

    python3 datasets/lgu/scripts/fetch_officials_history.py
"""

from __future__ import annotations

import csv
import gzip
import io
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

WINNERS = ('https://github.com/RobertRLeung/OpenHalalan/releases/download'
           '/data-latest/NLE_Winners_2004-2025.csv')
VOTES = ('https://github.com/RobertRLeung/OpenHalalan/releases/download'
         '/data-latest/NLE_Vote_Counts_2007-2025.csv.gz')

ROOT = pathlib.Path(__file__).resolve().parents[3]
DATASET = ROOT / 'datasets' / 'lgu' / 'barmm-lgu.json'
OUT = ROOT / 'datasets' / 'lgu' / 'officials-history.json'
CACHE = pathlib.Path(__file__).parent / '.openhalalan'

# The cycles this file covers. 2025 is excluded from both sources: the
# directory already holds that term from COMELEC itself, and a reconstruction
# of it would only be a second-hand copy of what is already first-hand.
CYCLES = {
    '2001': ('2001-2004', '2001-05-14'),
    '2004': ('2004-2007', '2004-05-10'),
    '2007': ('2007-2010', '2007-05-14'),
    '2010': ('2010-2013', '2010-05-10'),
    '2013': ('2013-2016', '2013-05-13'),
    '2016': ('2016-2019', '2016-05-09'),
    '2019': ('2019-2022', '2019-05-13'),
    '2022': ('2022-2025', '2022-05-09'),
}

# What a reader is told about each cycle, once per cycle rather than per page.
CYCLE_NOTES = {
    '2001': 'Winners only. No vote counts exist for this cycle in any surviving source.',
    '2004': 'Winners only. No vote counts exist for this cycle in any surviving source.',
    '2007': 'Winners only, and the thinnest cycle in the source — many towns are missing '
            'entirely.',
    '2010': 'Rebuilt from archived COMELEC returns and the Ianmaps Election Bank. Around '
            'sixty municipalities have a full canvass; the rest have the winner only.',
    '2013': 'Rebuilt from the Rappler archive — COMELEC’s own 2013 results site is gone. '
            'Around sixty municipalities have a full canvass; the rest have the winner only.',
    '2016': 'A full canvass for every municipality, from COMELEC’s 2016 returns.',
    '2019': 'A full canvass for every municipality. COMELEC’s own 2019 results site has '
            'since been taken down, so this is now the surviving record of it.',
    '2022': 'A full canvass for every municipality. COMELEC’s 2022 site is still online '
            'but serves its canvass only to its own front end.',
}

# COMELEC files several towns under "NewName OldName", or under the old name
# alone. Both forms map to the name PSGC uses, which this directory uses.
TOWN_ALIASES = {
    'AMAI MANABILANG BUMBARAN': 'AMAI MANABILANG',
    'BACOLOD KALAWI BACOLOD GRANDE': 'BACOLOD KALAWI',
    'BALINDONG WATU': 'BALINDONG',
    'BUMBARAN': 'AMAI MANABILANG',
    'COTABATO': 'COTABATO CITY',
    'DATU ODIN SINSUAT DINAIG': 'DATU ODIN SINSUAT',
    'KABUNTALAN TUMBAO': 'KABUNTALAN',
    'LUMBA BAYABAO MAGUING': 'LUMBA BAYABAO',
    'MAPUN CAGAYAN DE TAWI TAWI': 'MAPUN',
    'MASUI': 'MASIU',
    'PAGAYAWAN TATARIKAN': 'PAGAYAWAN',
    'PANGLIMA SUGALA BALIMBING': 'PANGLIMA SUGALA',
    'PICONG SULTAN GUMANDER': 'PICONG',
    'POONA BAYABAO GATA': 'POONA BAYABAO',
    'SHARIFF AGUAK CAPITAL': 'SHARIFF AGUAK',
    'SHARIFF AGUAK MAGANOY': 'SHARIFF AGUAK',
    'SULTAN GUMANDER': 'PICONG',
    'SULTAN KUDARAT NULING': 'SULTAN KUDARAT',
    'SULTAN SA BARONGIS LAMBAYONG': 'SULTAN SA BARONGIS',
    'TAGOLOAN': 'TAGOLOAN II',
}

# Not part of BARMM, however the source files them. Sulu was removed from the
# region by the Supreme Court; Palawan is a mis-tagged stray.
NOT_IN_REGION = {'SULU', 'PALAWAN'}

# Not a unit of this directory, but still part of its province's electorate.
# Isabela City is administratively in Region IX and gets no page here, yet it
# is a component city of Basilan and its voters do elect Basilan's governor —
# so its rows are dropped from the unit record and kept in the provincial sum.
# Dropping them from both would leave Basilan's canvass short of its largest
# city and reading like a smaller province than it is.
NOT_A_UNIT = {('BASILAN', 'ISABELA')}

UNIT_OFFICES = {'MAYOR': 'mayor', 'VICE MAYOR': 'viceMayor'}
PROVINCE_OFFICES = {'GOVERNOR': 'governor', 'VICE GOVERNOR': 'viceGovernor'}


def normalise(name: str) -> str:
    """A name reduced to the letters and digits in it, for matching only."""
    folded = unicodedata.normalize('NFKD', name or '').encode('ascii', 'ignore').decode()
    return re.sub(r'[^A-Z0-9]+', ' ', folded.upper()).strip()


def fetch(url: str) -> bytes:
    """Download over curl, cached — python's ssl has no CA bundle on every box."""
    CACHE.mkdir(exist_ok=True)
    held = CACHE / url.rsplit('/', 1)[-1]
    if held.exists():
        print(f'  cached {held.name} ({held.stat().st_size / 1e6:.0f} MB)')
        return held.read_bytes()
    print(f'  downloading {held.name}')
    done = subprocess.run(['curl', '-sSL', '--fail', '--max-time', '900', url],
                          capture_output=True)
    if done.returncode:
        sys.exit(f'could not download {url}: {done.stderr.decode()[:200]}')
    held.write_bytes(done.stdout)
    return done.stdout


def rows_of(url: str) -> list[dict]:
    raw = fetch(url)
    if url.endswith('.gz'):
        raw = gzip.decompress(raw)
    return list(csv.DictReader(io.StringIO(raw.decode())))


def in_region(province: str) -> bool:
    return province not in NOT_IN_REGION


def is_unit(province: str, town: str) -> bool:
    return in_region(province) and (province, town) not in NOT_A_UNIT


def candidate(row: dict, total: int) -> dict:
    """One candidate as canvassed: the tally, the share and where they placed."""
    votes = int(row['votes'])
    share = row['percentage'].strip()
    return {
        'name': row['candidate_name'].strip(),
        'party': row['party'].strip() or None,
        'votes': votes,
        # A handful of 2019 rows carry no share. It is votes over the contest
        # total by definition, so it is computed rather than left blank.
        'percentage': round(float(share), 2) if share else (
            round(votes / total * 100, 2) if total else 0
        ),
    }


# A contest in which every candidate polled zero is not a thin canvass, it is
# no canvass: twenty-nine of them sit in the 2019 cycle, across five towns
# whose returns never made it into the reconstruction. They are dropped so the
# winners file can answer for those terms instead of a page showing a ballot
# on which nobody voted.
def has_votes(rows: list[dict]) -> bool:
    return any(int(row['votes']) for row in rows)


def contest(name: str, seats: int | None, rows: list[dict]) -> dict:
    ranked = sorted(rows, key=lambda r: -int(r['votes']))
    total = sum(int(r['votes']) for r in ranked)
    return {'contestName': name, 'seats': seats,
            'ranked': [candidate(row, total) for row in ranked]}


def summed_contest(name: str, seats: int | None, rows: list[dict]) -> dict:
    """One contest whose returns arrive town by town, added back together.

    Governors, vice-governors and board members are canvassed per
    municipality, so a candidate appears once for every town in the province.
    The provincial result is the sum of those rows; the share is recomputed
    against the summed total, because the per-town percentages are shares of
    each town and averaging them would weight a village equally with a city.

    Names are safe to add on: within any one province-year contest the source
    spells every candidate identically in every municipality, checked across
    all cycles before relying on it.
    """
    tally: dict[str, dict] = {}
    for row in rows:
        held = tally.setdefault(row['candidate_name'].strip(),
                                {'party': row['party'].strip() or None, 'votes': 0})
        held['votes'] += int(row['votes'])
        held['party'] = held['party'] or (row['party'].strip() or None)

    total = sum(held['votes'] for held in tally.values())
    ranked = sorted(tally.items(), key=lambda kv: -kv[1]['votes'])
    return {
        'contestName': name,
        'seats': seats,
        'ranked': [{'name': name_, 'party': held['party'], 'votes': held['votes'],
                    'percentage': round(held['votes'] / total * 100, 2) if total else 0}
                   for name_, held in ranked],
    }


def holder(row: dict) -> dict:
    """One office-holder from the winners file — all it records of them."""
    held = {'name': row['Full Name'].strip(), 'party': row['Party'].strip() or None}
    if row['Sex'].strip() in {'M', 'F'}:
        held['sex'] = row['Sex'].strip()
    return held


def main() -> None:
    dataset = json.loads(DATASET.read_text())

    units: dict[str, tuple[str, dict]] = {}
    provinces: dict[str, str] = {}
    for province in dataset['provinces']:
        provinces[normalise(province['name'])] = province['slug']
        for unit in province['municipalities']:
            for name in {unit['name'], unit.get('alsoKnownAs') or ''} - {''}:
                units[normalise(name)] = (province['slug'], unit)

    def find_unit(city: str):
        key = normalise(city)
        return units.get(TOWN_ALIASES.get(key, key))

    # ---- the canvass, from the vote counts -------------------------------
    print('vote counts')
    by_unit: dict[str, dict] = {}
    by_province: dict[str, dict] = {}
    unmatched: dict[tuple[str, str], int] = {}

    # Grouped first, because a contest is a set of rows and a Contest object
    # needs all of them at once to rank them and total the vote.
    unit_contests: dict[tuple, list[dict]] = {}
    province_contests: dict[tuple, list[dict]] = {}

    for row in rows_of(VOTES):
        if row['region'] != 'BARMM' or row['year'] not in CYCLES:
            continue
        origin = row['province'].strip().upper()
        if not in_region(origin):
            continue
        office = row['position']
        term = CYCLES[row['year']][0]

        if office in UNIT_OFFICES or office == 'COUNCILOR':
            if not is_unit(origin, normalise(row['city'])):
                continue
            found = find_unit(row['city'])
            if not found:
                unmatched[(origin, row['city'])] = unmatched.get((origin, row['city']), 0) + 1
                continue
            _, unit = found
            unit_contests.setdefault(
                (unit['slug'], term, office, row['district'].strip()), []).append(row)

        elif office in PROVINCE_OFFICES or office == 'PROVINCIAL BOARD MEMBER':
            # A provincial race is reported municipality by municipality: one
            # row per candidate per town. The provincial result is the sum,
            # and it is summed here rather than taken from any single row.
            slugs = (['maguindanao-del-norte', 'maguindanao-del-sur']
                     if origin == 'MAGUINDANAO' else [provinces.get(normalise(origin))])
            for slug in filter(None, slugs):
                province_contests.setdefault(
                    (slug, term, office, row['district'].strip(), origin), []).append(row)

    slug_to_unit = {unit['slug']: (province, unit)
                    for province in dataset['provinces']
                    for unit in province['municipalities']}
    slug_to_province = {province['slug']: province for province in dataset['provinces']}

    for (slug, term, office, district), rows in unit_contests.items():
        if not has_votes(rows):
            continue
        province, unit = slug_to_unit[slug]
        held = by_unit.setdefault(slug, {}).setdefault(term, {'kind': 'canvass'})
        place = f'CITY OF {unit["name"].upper()}' if unit['isCity'] else unit['name'].upper()
        where = f'{province["name"].upper()} - {place}'
        if office == 'COUNCILOR':
            body = 'SANGGUNIANG PANLUNGSOD' if unit['isCity'] else 'SANGGUNIANG BAYAN'
            held.setdefault('council', []).append(contest(
                f'MEMBER, {body} of {where} - {district or "LONE"} DIST',
                10 if unit['isCity'] else 8, rows))
        else:
            held[UNIT_OFFICES[office]] = contest(f'{office} of {where}', 1, rows)

    for (slug, term, office, district, origin), rows in province_contests.items():
        if not has_votes(rows):
            continue
        province = slug_to_province[slug]
        held = by_province.setdefault(slug, {}).setdefault(term, {'kind': 'canvass'})
        if origin == 'MAGUINDANAO':
            held['undivided'] = 'Maguindanao'
        where = origin
        if office == 'PROVINCIAL BOARD MEMBER':
            held.setdefault('board', []).append(summed_contest(
                f'MEMBER, SANGGUNIANG PANLALAWIGAN of {where} - {district or "LONE"} PROVDIST',
                None, rows))
        else:
            held[PROVINCE_OFFICES[office]] = summed_contest(f'{office} of {where}', 1, rows)

    # Every office dropped for want of a vote can leave a term record that is
    # nothing but its own label. Cleared before the winners pass, so the roll
    # is free to fill a term the canvass could not.
    OFFICES = {'mayor', 'viceMayor', 'council', 'governor', 'viceGovernor', 'board'}
    for held in (by_unit, by_province):
        for slug in list(held):
            for term in list(held[slug]):
                if not OFFICES & held[slug][term].keys():
                    del held[slug][term]
            if not held[slug]:
                del held[slug]

    # ---- the roll, from the winners, wherever no canvass reached ---------
    print('winners')
    for row in rows_of(WINNERS):
        if row['Region'] != 'BARMM' or row['Year'] not in CYCLES:
            continue
        origin = row['Province'].strip().upper()
        town = normalise(row['City'])
        if not in_region(origin):
            continue
        office = row['Position']
        term = CYCLES[row['Year']][0]

        if town:
            if office not in UNIT_OFFICES and office != 'COUNCILOR':
                continue
            if not is_unit(origin, town):
                continue
            found = find_unit(row['City'])
            if not found:
                unmatched[(origin, row['City'])] = unmatched.get((origin, row['City']), 0) + 1
                continue
            _, unit = found
            # A canvass for this unit-term already says everything the roll
            # would, and more. Never overwrite the better record.
            if by_unit.get(unit['slug'], {}).get(term, {}).get('kind') == 'canvass':
                continue
            held = by_unit.setdefault(unit['slug'], {}).setdefault(term, {'kind': 'roll'})
            if office == 'COUNCILOR':
                held.setdefault('council', []).append(holder(row))
            else:
                held[UNIT_OFFICES[office]] = holder(row)
        else:
            if office not in PROVINCE_OFFICES and office != 'PROVINCIAL BOARD MEMBER':
                continue
            slugs = (['maguindanao-del-norte', 'maguindanao-del-sur']
                     if origin == 'MAGUINDANAO' else [provinces.get(normalise(origin))])
            for slug in filter(None, slugs):
                if by_province.get(slug, {}).get(term, {}).get('kind') == 'canvass':
                    continue
                held = by_province.setdefault(slug, {}).setdefault(term, {'kind': 'roll'})
                if origin == 'MAGUINDANAO':
                    held['undivided'] = 'Maguindanao'
                if office == 'PROVINCIAL BOARD MEMBER':
                    held.setdefault('board', []).append(holder(row))
                else:
                    held[PROVINCE_OFFICES[office]] = holder(row)

    if unmatched:
        print('\nrows whose town this directory does not carry:')
        for (origin, town), count in sorted(unmatched.items(), key=lambda kv: -kv[1]):
            print(f'  {count:>4}  {origin} / {town}')

    source = {
        'label': 'OpenHalalan — The Philippine National and Local Election Dataset',
        'href': 'https://robertrleung.github.io/OpenHalalan/',
        'doi': 'https://doi.org/10.5281/zenodo.17783099',
        'license': 'ODbL v1.0',
    }
    payload = {
        'name': 'Who has held local office in BARMM, 2001 to 2022',
        'source': source,
        'note': (
            'Two kinds of record, tagged per term. A `canvass` term carries every '
            'candidate, their votes and their share, reconstructed from COMELEC’s '
            'own returns; a `roll` term carries the winner’s name and party and '
            'nothing else, because nothing else survives. A term missing from a town '
            'means the source has no record of it, not that the town elected no one.'
        ),
        'provinces': by_province,
        'units': by_unit,
    }
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + '\n')

    # ---- the term list, which lives beside the canvass it sits next to ---
    current = dataset['officials']['currentTermId']
    existing = {term['id']: term for term in dataset['officials']['terms']}
    kinds = {term: {held.get('kind') for held in
                    (units.get(term) for units in by_unit.values()) if held}
             for _, (term, _) in CYCLES.items()}
    dataset['officials']['terms'] = [
        existing[term_id] if term_id == current else {
            'id': term_id,
            'label': term_id.replace('-', '–'),
            'election': f'{year} National and Local Elections',
            'electionDay': day,
            'start': f'{year}-06-30',
            'end': f'{int(year) + 3}-06-30',
            'source': source,
            'status': 'canvass' if 'canvass' in kinds.get(term_id, set()) else 'winners',
            'note': CYCLE_NOTES[year],
        }
        for year, (term_id, day) in sorted(CYCLES.items(), reverse=True)
    ]
    dataset['officials']['terms'].insert(0, existing[current])
    addendum = ('Terms before 2025 are reconstructed: a full canvass where the vote '
                'counts survive, the winner’s name alone where they do not.')
    note = dataset['officials']['note']
    for stale in (' Terms before 2025 are winners only — who took each office and '
                  'under which party, without the tally behind it.',):
        note = note.replace(stale, '')
    dataset['officials']['note'] = note if addendum in note else f'{note} {addendum}'
    # Written the way it was read: one line, no spaces. The file is imported,
    # not hand-edited, and a reformat would be 31,000 lines of diff saying nothing.
    DATASET.write_text(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')))

    canvassed = sum(1 for terms in by_unit.values()
                    for held in terms.values() if held['kind'] == 'canvass')
    rolled = sum(1 for terms in by_unit.values()
                 for held in terms.values() if held['kind'] == 'roll')
    print(f'\n{len(by_unit)} units: {canvassed} term-canvasses, {rolled} term-rolls')
    print(f'{len(by_province)} provinces -> {OUT.relative_to(ROOT)} '
          f'({OUT.stat().st_size / 1e6:.1f} MB)')
    for term in dataset['officials']['terms']:
        print(f"  {term['id']}  {term['status']}")


if __name__ == '__main__':
    main()
