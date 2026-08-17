#!/usr/bin/env python3
"""Capture Parliament's own indexes of measures, and who filed each one.

  /bills/                 477 bills, with status and stage history
  /proposed-resolutions/  every resolution filed, with status
  /adopted-resolutions/   every resolution the plenary adopted

Each listing is a table of number, title, and status; each row links to the
measure's own page, which carries the part this registry has always been
missing — the principal authors and co-authors, written in the same roster
form the member index uses, so a measure can be joined to the people who
filed it. The stage history and committee referrals come along for free,
since they sit on the same page.

Each collection writes its own file beside the registry's records rather
than editing them, so a stale or partial capture can never damage what the
registry already holds:

  bills/official_index.json
  resolutions/proposed_official_index.json
  resolutions/adopted_official_index.json

    python3 datasets/bills/scripts/fetch_measure_authors.py bills
    python3 datasets/bills/scripts/fetch_measure_authors.py adopted-resolutions
    python3 datasets/bills/scripts/fetch_measure_authors.py --all
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://parliament.bangsamoro.gov.ph"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
}

REGISTRY = Path(__file__).resolve().parents[1] / "bangsamoro_registry"

# Every collection is the same Divi layout with different field names. The
# repeater classes are the stable part of the markup, so they are what this
# reads; the surrounding wrappers are generated and liable to shift.
COLLECTIONS = {
    "acts": {
        "index": f"{BASE}/baa-new/",
        "out": REGISTRY / "baa" / "official_index.json",
        # An act in force has no status to read, and column three of the
        # listing is the ratification date.
        "status_label": "",
        "history_label": "",
        "third_column": "date",
        "fixed_status": "Enacted - In force",
        "principal_field": "principal_author_baa",
        "co_field": "co_authors_baa",
        "extra_labels": {
            "session_number": "Session Approved",
            "session_kind": "Kind of session",
        },
    },
    "bills": {
        "index": f"{BASE}/bills/",
        "out": REGISTRY / "bills" / "official_index.json",
        "status_label": "Bill Status",
        "history_label": "Legislative History",
        "principal_field": "principal_author_bill",
        "co_field": "co_authors_bill",
        "extra_labels": {
            "committee_referrals": "Committee Referral(s)",
            "became_act": "Bangsamoro Autonomy Act",
        },
    },
    "proposed-resolutions": {
        "index": f"{BASE}/proposed-resolutions/",
        "out": REGISTRY / "resolutions" / "proposed_official_index.json",
        "status_label": "Status",
        "history_label": "Legislative history",
        "principal_field": "principal_author_proposed_resolution",
        "co_field": "co_authors_proposed_resolution",
        "extra_labels": {"committee_referrals": "Committee Referral(s)"},
    },
    "adopted-resolutions": {
        "index": f"{BASE}/adopted-resolutions/",
        "out": REGISTRY / "resolutions" / "adopted_official_index.json",
        # An adopted resolution has no status — adoption is the end of the
        # road — and no co-authors field; the plenary adopts it as a body.
        "status_label": "",
        "history_label": "",
        # Column three of this listing is the adoption date, not a status.
        "third_column": "date",
        "principal_field": "principal_author_adopted_resolution",
        "co_field": "",
        "extra_labels": {
            "session_number": "Session Number",
            "session_kind": "Kind of Session",
        },
    },
}


def fetch(url: str, attempts: int = 3) -> str:
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read().decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError) as error:
            if attempt == attempts:
                raise
            print(f"  retry {attempt} for {url} ({error})", file=sys.stderr)
            time.sleep(2 * attempt)
    raise RuntimeError("unreachable")


def text_of(fragment: str) -> str:
    fragment = re.sub(r"(?is)<br\s*/?>", " ", fragment)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def listing_rows(page: str) -> list[dict]:
    """Number, title, link, and whatever status/date columns the table has."""
    table = re.search(r"(?is)<table.*?</table>", page)
    if not table:
        return []

    rows = []
    for row in re.findall(r'(?is)<tr id="post-row-\d+".*?</tr>', table.group(0)):
        cells = re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", row)
        if len(cells) < 3:
            continue

        number = text_of(cells[0])
        link = re.search(r'href="([^"]+)"', cells[1])
        session = re.search(r"bta_session-([a-z0-9-]+)", row)

        rows.append(
            {
                "number": int(number) if number.isdigit() else None,
                "title": text_of(cells[1]),
                "url": html.unescape(link.group(1)) if link else "",
                # Column three is status for bills and proposed resolutions,
                # and the adoption date for adopted ones.
                "status": text_of(cells[2]),
                "as_of": text_of(cells[3]) if len(cells) > 3 else "",
                "session": session.group(1) if session else "",
            }
        )

    return rows


def repeater(page: str, field: str) -> list[str]:
    """Entries of one `cf-links-<field>` list, in page order."""
    if not field:
        return []

    match = re.search(rf'(?is)<ul[^>]*cf-links-{re.escape(field)}[^>]*>(.*?)</ul>', page)
    if not match:
        return []

    return [
        name
        for name in (
            text_of(item) for item in re.findall(r"(?is)<li[^>]*>(.*?)</li>", match.group(1))
        )
        if name
    ]


def labelled(page: str, label: str) -> str:
    """The text after a bolded "Label:" up to the next bolded label."""
    if not label:
        return ""

    match = re.search(
        rf"(?is)<strong>\s*{re.escape(label)}\s*:?\s*</strong>\s*:?(.*?)(?=<strong>|</div>)", page
    )
    return text_of(match.group(1)) if match else ""


def history(page: str, label: str) -> list[str]:
    """The legislative history block, one stage per line as published."""
    if not label:
        return []

    match = re.search(
        rf"(?is)<strong>\s*{re.escape(label)}\s*:?\s*</strong>(.*?)(?=<strong>|</div>)", page
    )
    if not match:
        return []

    parts = re.split(r"(?is)<br\s*/?>|</p>", match.group(1))
    return [line for line in (text_of(part) for part in parts) if line]


def parse_measure(row: dict, page: str, config: dict) -> dict:
    if config.get("third_column") == "date":
        # Adoption and ratification are the end of the road, so there is no
        # status to read — the listing's third column is the date instead.
        row = {**row, "as_of": row["status"], "status": config.get("fixed_status", "Adopted")}

    record = {
        **row,
        "status": labelled(page, config["status_label"]) or row["status"],
        "principal_authors": repeater(page, config["principal_field"]),
        "co_authors": repeater(page, config["co_field"]),
        "history": history(page, config["history_label"]),
    }

    for key, label in config["extra_labels"].items():
        record[key] = labelled(page, label)

    return record


def capture(name: str, limit: int = 0) -> None:
    config = COLLECTIONS[name]

    print(f"index {config['index']}")
    rows = listing_rows(fetch(config["index"]))
    if limit:
        rows = rows[:limit]
    print(f"      {len(rows)} {name}")

    measures = []
    for position, row in enumerate(rows, 1):
        if not row["url"]:
            measures.append({**row, "principal_authors": [], "co_authors": [], "history": []})
            continue

        if position == 1 or position % 50 == 0:
            print(f"  [{position}/{len(rows)}] {name[:-1]} {row['number']}")

        measures.append(parse_measure(row, fetch(row["url"]), config))
        time.sleep(0.35)  # a courtesy gap; this is someone's public server

    credited = sum(1 for m in measures if m["principal_authors"] or m["co_authors"])
    print(f"{credited} of {len(measures)} name an author")

    payload = {
        "source": config["index"],
        "generated": dt.date.today().isoformat(),
        "measures": measures,
    }

    out: Path = config["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {out}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("collection", nargs="?", choices=sorted(COLLECTIONS))
    parser.add_argument("--all", action="store_true", help="capture every collection")
    parser.add_argument("--limit", type=int, default=0, help="stop after N measures (for testing)")
    args = parser.parse_args()

    if args.all:
        for name in COLLECTIONS:
            capture(name, args.limit)
    elif args.collection:
        capture(args.collection, args.limit)
    else:
        parser.error("name a collection or pass --all")


if __name__ == "__main__":
    main()
