#!/usr/bin/env python3
"""Capture each member's profile page from the Bangsamoro Parliament site.

The roster in `members/_index.json` says when someone served and what they
filed. It says nothing about who they are. Parliament publishes that on each
member's own page — a biosketch, the office they hold, where their office is,
and a portrait — across three listings:

  /current-members-of-parliament/   the sitting parliament (links to profiles)
  /bta-22-feb25/                    September 2022 – February 2025
  /bta-19-22/                       February 2019 – August 2022

The two historical listings are tables without profile links, so those members
are resolved through `?post_type=member-parliament&p=<id>`, which redirects to
the page.

Deliberately not captured: the contact person, mobile number, and email
address each page also carries. Those are personal contact details — the
email is obfuscated at source precisely so it can't be harvested, and
mirroring them into a static page and a public repo would undo that. Anyone
who needs them can follow `url` to the official page.

Writes datasets/bills/bangsamoro_registry/members/profiles.json.

    python3 datasets/bills/scripts/fetch_member_profiles.py
"""

from __future__ import annotations

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

LISTINGS = [
    f"{BASE}/current-members-of-parliament/",
    f"{BASE}/bta-22-feb25/",
    f"{BASE}/bta-19-22/",
]

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
    / "members"
    / "profiles.json"
)


def fetch(url: str, attempts: int = 3) -> tuple[str, str]:
    """Page text and the URL it ended up at, after any redirects."""
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read().decode("utf-8", "replace"), response.url
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


# "SURNAME, GIVEN M." — the roster form, and the shape every name is in.
ROSTER_NAME = re.compile(r"^[A-ZÑ][A-ZÑ'’.\- ]*,")


def row_name(row: str) -> str:
    """The member's name, from whichever cell of the row actually holds it.

    The two table layouts put it in different places — a link in the current
    listing, a plain cell in the historical ones — and at least one portrait
    carries an XMP artifact in its alt, title, and caption instead of a name.
    So every candidate is gathered and the first one shaped like a roster
    name wins.
    """
    candidates = []

    link = re.search(
        r'(?is)href="https://parliament\.bangsamoro\.gov\.ph/member-parliament/[^"]+"[^>]*>(.*?)</a>',
        row,
    )
    if link:
        candidates.append(text_of(link.group(1)))

    candidates += [
        html.unescape(value).strip()
        for value in re.findall(r'<td[^>]*data-filter="([^"]+)"', row)
    ]
    candidates += [html.unescape(value).strip() for value in re.findall(r'alt="([^"]+)"', row)]

    for candidate in candidates:
        if ROSTER_NAME.match(candidate):
            return candidate

    return ""


def listing_rows(page: str) -> list[dict[str, str]]:
    """One row per member: id, name, portrait, and a profile link if given."""
    rows = []
    for row in re.findall(r'(?is)<tr id="post-row-\d+".*?</tr>', page):
        entity = re.search(r"post-row-(\d+)", row)
        name = row_name(row)
        photo = re.search(r'data-large_image="([^"]+)"', row) or re.search(
            r'data-thumb="([^"]+)"', row
        )
        link = re.search(
            r'href="(https://parliament\.bangsamoro\.gov\.ph/member-parliament/[^"]+)"', row
        )

        if not entity or not name:
            print(f"  skipped a row with no readable name: {entity and entity.group(1)}", file=sys.stderr)
            continue

        rows.append(
            {
                "id": entity.group(1),
                "name": name,
                "photo": html.unescape(photo.group(1)) if photo else "",
                "url": html.unescape(link.group(1)) if link else "",
            }
        )

    return rows


# The six lists Parliament keeps on a member's own page, plus their seats.
# These are the member-side view of authorship, and they do not always agree
# with the author lists on the measures themselves — a bill page may name
# dozens of co-authors that the member pages never acknowledge. Both are
# captured; which one a profile shows is decided in the app, not here.
MEASURE_LISTS = {
    "principal_authored_bills": "principal_authored_bills",
    "co_authored_bills": "co_authored_bills",
    "principal_authored_resolutions": "principal_authored_resolutions",
    "co_authored_resolutions": "co_authored_resolutions",
    "principal_authored_adopted_resolutions": "principal_authored_adopted_resolutions",
    "co_authored_adopted_resolutions": "co_authored_adopted_resolutions",
    "committee_memberships": "committee_memberships",
}


def repeater(page: str, field: str) -> list[dict[str, str]]:
    """Entries of one `cf-links-<field>` list: title and link, in page order."""
    match = re.search(rf'(?is)<ul[^>]*cf-links-{re.escape(field)}[^>]*>(.*?)</ul>', page)
    if not match:
        return []

    entries = []
    for item in re.findall(r"(?is)<li[^>]*>(.*?)</li>", match.group(1)):
        title = text_of(item)
        if not title:
            continue
        href = re.search(r'href="([^"]+)"', item)
        entries.append({"title": title, "url": html.unescape(href.group(1)) if href else ""})

    return entries


def detail_field(page: str, label: str) -> str:
    """One "Label: <strong>value</strong>" line from the details block."""
    block = re.search(r'(?is)<div class="member-details-wrap">(.*?)</div>', page)
    if not block:
        return ""

    match = re.search(
        rf"(?is)<p>\s*{re.escape(label)}\s*:(.*?)</p>", block.group(1)
    )
    return text_of(match.group(1)) if match else ""


def biosketch(page: str) -> list[str]:
    """The Profile tab, as paragraphs. The heading itself is dropped."""
    tab = re.search(
        r'(?is)<div class="et_pb_tab et_pb_tab_0_tb_body[^"]*"[^>]*>(.*?)'
        r'(?=<div class="et_pb_tab et_pb_tab_)',
        page,
    )
    if not tab:
        return []

    body = tab.group(1)
    # "Biosketch of MP <name>" restates the page heading.
    body = re.sub(r"(?is)<strong>\s*Biosketch.*?</strong>", " ", body, count=1)

    paragraphs = [text_of(part) for part in re.split(r"(?i)</p>", body)]
    return [
        paragraph
        for paragraph in paragraphs
        if len(paragraph) > 1 and not paragraph.lower().startswith("biosketch")
    ]


def main() -> None:
    members: dict[str, dict[str, str]] = {}

    for listing in LISTINGS:
        print(f"listing {listing}")
        page, _ = fetch(listing)
        rows = listing_rows(page)
        print(f"        {len(rows)} rows")

        for row in rows:
            existing = members.get(row["id"])
            if existing:
                # Later listings fill in whatever the first one lacked.
                existing["url"] = existing["url"] or row["url"]
                existing["photo"] = existing["photo"] or row["photo"]
            else:
                members[row["id"]] = row

    print(f"{len(members)} members")

    profiles = []
    for position, member in enumerate(sorted(members.values(), key=lambda row: row["name"]), 1):
        url = member["url"] or f"{BASE}/?post_type=member-parliament&p={member['id']}"
        print(f"  [{position}/{len(members)}] {member['name']}")

        page, resolved = fetch(url)
        slug = resolved.rstrip("/").rsplit("/", 1)[-1]

        profiles.append(
            {
                "name": member["name"],
                "slug": slug,
                "url": resolved,
                "photo": member["photo"],
                "positions": detail_field(page, "Position(s)"),
                "office_address": detail_field(page, "Office Address"),
                "social_media": detail_field(page, "Social Media"),
                "biosketch": biosketch(page),
                **{key: repeater(page, field) for key, field in MEASURE_LISTS.items()},
            }
        )
        time.sleep(0.4)  # a courtesy gap; this is someone's public server

    payload = {
        "source": LISTINGS[0],
        "generated": dt.date.today().isoformat(),
        "profiles": profiles,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote  {OUT}")


if __name__ == "__main__":
    main()
