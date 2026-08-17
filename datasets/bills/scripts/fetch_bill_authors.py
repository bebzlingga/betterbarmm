#!/usr/bin/env python3
"""Capture the Bangsamoro Parliament's own bills index, and who filed each one.

  https://parliament.bangsamoro.gov.ph/bills/

The listing is a table of every bill with its number, title, current status,
and the date that status was recorded. Each row links to the bill's own page,
which additionally carries the part this registry has always been missing:
the principal authors and co-authors, written in the same roster form the
member index uses, so a bill can be joined to the people who filed it.

Also read, because it is on the same page and answers "what happened to it":
the legislative history, the committees it was referred to, and the autonomy
act it became.

Writes datasets/bills/bangsamoro_registry/bills/official_index.json — a file
of its own rather than an edit to the per-bill records, so a stale or partial
capture can never damage what the registry already holds.

    python3 datasets/bills/scripts/fetch_bill_authors.py [--limit N]
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
INDEX_URL = f"{BASE}/bills/"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
}

OUT = (
    Path(__file__).resolve().parents[1]
    / "bangsamoro_registry"
    / "bills"
    / "official_index.json"
)


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
    """Number, title, link, status, and as-of date, one per bill."""
    table = re.search(r"(?is)<table.*?</table>", page)
    if not table:
        return []

    rows = []
    for row in re.findall(r'(?is)<tr id="post-row-\d+".*?</tr>', table.group(0)):
        cells = re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", row)
        if len(cells) < 4:
            continue

        number = text_of(cells[0])
        link = re.search(r'href="([^"]+)"', cells[1])
        session = re.search(r"bta_session-([a-z0-9-]+)", row)

        rows.append(
            {
                "number": int(number) if number.isdigit() else None,
                "title": text_of(cells[1]),
                "url": html.unescape(link.group(1)) if link else "",
                "status": text_of(cells[2]),
                "as_of": text_of(cells[3]),
                "session": session.group(1) if session else "",
            }
        )

    return rows


def repeater(page: str, field: str) -> list[str]:
    """Names from one `cf-links-<field>` list, in page order."""
    match = re.search(rf'(?is)<ul[^>]*cf-links-{re.escape(field)}[^>]*>(.*?)</ul>', page)
    if not match:
        return []

    return [
        name
        for name in (text_of(item) for item in re.findall(r"(?is)<li[^>]*>(.*?)</li>", match.group(1)))
        if name
    ]


def labelled(page: str, label: str) -> str:
    """The run of text after a bolded "Label:" up to the next bolded label."""
    match = re.search(
        rf"(?is)<strong>\s*{re.escape(label)}\s*:?\s*</strong>(.*?)(?=<strong>|</div>)", page
    )
    return text_of(match.group(1)) if match else ""


def history(page: str) -> list[str]:
    """The legislative history block, one stage per line as published."""
    match = re.search(
        r"(?is)<strong>\s*Legislative History\s*:?\s*</strong>(.*?)(?=<strong>\s*Committee Referral)",
        page,
    )
    if not match:
        return []

    # Stages are separated by <br>, so split before the tags are stripped.
    parts = re.split(r"(?is)<br\s*/?>|</p>", match.group(1))
    return [line for line in (text_of(part) for part in parts) if line]


def parse_bill(row: dict, page: str) -> dict:
    return {
        **row,
        # The detail page restates status and date; prefer it, since the
        # listing is a cached view of the same fields.
        "status": labelled(page, "Bill Status") or row["status"],
        "as_of": labelled(page, "As of") or row["as_of"],
        "principal_authors": repeater(page, "principal_author_bill"),
        "co_authors": repeater(page, "co_authors_bill"),
        "history": history(page),
        "committee_referrals": labelled(page, "Committee Referral(s)"),
        "became_act": labelled(page, "Bangsamoro Autonomy Act"),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="stop after N bills (for testing)")
    args = parser.parse_args()

    print(f"index {INDEX_URL}")
    rows = listing_rows(fetch(INDEX_URL))
    if args.limit:
        rows = rows[: args.limit]
    print(f"      {len(rows)} bills")

    bills = []
    for position, row in enumerate(rows, 1):
        if not row["url"]:
            bills.append({**row, "principal_authors": [], "co_authors": [], "history": []})
            continue

        if position % 25 == 0 or position == 1:
            print(f"  [{position}/{len(rows)}] bill {row['number']}")

        bills.append(parse_bill(row, fetch(row["url"])))
        time.sleep(0.35)  # a courtesy gap; this is someone's public server

    credited = sum(1 for bill in bills if bill["principal_authors"] or bill["co_authors"])
    print(f"{credited} of {len(bills)} bills name an author")

    payload = {
        "source": INDEX_URL,
        "generated": dt.date.today().isoformat(),
        "bills": bills,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
