#!/usr/bin/env python3
"""Capture the Bangsamoro Parliament committee record.

Two sources, both public:

  https://parliament.bangsamoro.gov.ph/committees/         index of committees
  https://parliament.bangsamoro.gov.ph/committee-reports/  reports table

Each committee page is a Divi layout with a fixed shape — an officers row
(chair and vice-chairs), then tabs holding the jurisdiction text, the member
roster, the ex-officio roster, and the measures referred to the committee.
The repeater lists carry stable `cf-links-<field>` classes, so those are what
this reads rather than the surrounding markup, which is generated and liable
to shift.

Writes datasets/bills/bangsamoro_registry/committees/_index.json.

    python3 datasets/bills/scripts/fetch_committees.py
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
INDEX_URL = f"{BASE}/committees/"
REPORTS_URL = f"{BASE}/committee-reports/"

# The host answers 403 to a default urllib agent.
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
    / "committees"
    / "_index.json"
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
    """Markup to readable text, with the entities and runs of space resolved."""
    fragment = re.sub(r"(?is)<br\s*/?>", " ", fragment)
    fragment = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(fragment)).strip()


def repeater(page: str, field: str) -> list[dict[str, str]]:
    """The `<li>` entries of one `cf-links-<field>` list, in page order."""
    match = re.search(
        rf'(?is)<ul[^>]*cf-links-{re.escape(field)}[^>]*>(.*?)</ul>', page
    )
    if not match:
        return []

    entries = []
    for item in re.findall(r"(?is)<li[^>]*>(.*?)</li>", match.group(1)):
        href = re.search(r'href="([^"]+)"', item)
        name = text_of(item)
        if name:
            entries.append(
                {"name": name, "url": html.unescape(href.group(1)) if href else ""}
            )
    return entries


def tab_content(page: str, index: int) -> str:
    """The body of one tab panel — 0 description, 1 members, 3 referred, 4 sub."""
    match = re.search(
        rf'(?is)<div class="et_pb_tab et_pb_tab_{index}_tb_body[^"]*"[^>]*>(.*?)'
        rf'(?=<div class="et_pb_tab et_pb_tab_|</div>\s*</div>\s*</div>)',
        page,
    )
    return match.group(1) if match else ""


def officers(page: str) -> tuple[str, list[str]]:
    """Chair and vice-chairs, read off the officers row above the tabs."""
    row = re.search(r'(?is)<div class="et_pb_row[^"]*all__committees".*?(?=et_pb_tabs)', page)
    if not row:
        return "", []

    chair = ""
    vice: list[str] = []

    columns = re.split(r'(?i)<div class="et_pb_column ', row.group(0))
    for column in columns:
        label = text_of(column[: column.find("</div>") + 6]) if "</div>" in column else ""
        people = [
            text_of(link)
            for link in re.findall(
                r'(?is)<a[^>]+post_type=member-parliament[^>]*>(.*?)</a>', column
            )
        ]
        people = [person for person in people if person]
        if not people:
            continue

        if "Vice" in label:
            vice.extend(people)
        elif "Chairperson" in label and not chair:
            chair = people[0]

    return chair, vice


def committee_links(index_page: str) -> list[str]:
    """Every /committees/<slug>/ link on the index, de-duplicated, in order."""
    seen: list[str] = []
    for href in re.findall(r'href="(https://parliament\.bangsamoro\.gov\.ph/committees/[^"#]+)"', index_page):
        href = html.unescape(href).rstrip("/") + "/"
        if href not in seen and href != INDEX_URL:
            seen.append(href)
    return seen


def parse_committee(url: str, page: str) -> dict:
    slug = url.rstrip("/").rsplit("/", 1)[-1]

    title = re.search(r"(?is)<title>(.*?)</title>", page)
    name = text_of(title.group(1)).split("|")[0].strip() if title else slug

    chair, vice = officers(page)

    # Tab 0 holds "Duties, Power and Jurisdiction" — the committee's own
    # statement of what it covers. Drop the heading, keep the prose.
    description = tab_content(page, 0)
    description = re.sub(r"(?is)<strong>.*?</strong>", " ", description, count=1)
    jurisdiction = text_of(description)

    return {
        "slug": slug,
        "name": name,
        "url": url,
        "chairperson": chair,
        "vice_chairpersons": vice,
        "jurisdiction": jurisdiction,
        "members": [person["name"] for person in repeater(page, "committee_members")],
        "ex_officio_members": [
            person["name"] for person in repeater(page, "committee_exofficio_members_copy")
        ],
        "referred_bills": repeater(page, "referredbills_committee"),
        "referred_resolutions": repeater(page, "referredreso_committee"),
        "subcommittees": text_of(
            re.sub(r"(?is)<strong>.*?</strong>", " ", tab_content(page, 4), count=1)
        ),
    }


def parse_reports(page: str) -> list[dict]:
    """The reports table: number, title, link, date submitted, committees."""
    table = re.search(r"(?is)<table.*?</table>", page)
    if not table:
        return []

    reports = []
    for row in re.findall(r"(?is)<tr[^>]*>(.*?)</tr>", table.group(0)):
        cells = re.findall(r"(?is)<t[dh][^>]*>(.*?)</t[dh]>", row)
        if len(cells) < 4:
            continue

        number, title_cell, date_cell, committee_cell = cells[:4]
        number_text = text_of(number)
        if not number_text.isdigit():
            continue  # header row

        href = re.search(r'href="([^"]+)"', title_cell)

        reports.append(
            {
                "number": int(number_text),
                "title": text_of(title_cell),
                "url": html.unescape(href.group(1)) if href else "",
                "date_submitted": text_of(date_cell),
                "committee_slugs": text_of(committee_cell).split(),
            }
        )

    reports.sort(key=lambda report: report["number"], reverse=True)
    return reports


def main() -> None:
    print(f"index  {INDEX_URL}")
    links = committee_links(fetch(INDEX_URL))
    print(f"       {len(links)} committees")

    committees = []
    for position, link in enumerate(links, 1):
        print(f"  [{position}/{len(links)}] {link}")
        committees.append(parse_committee(link, fetch(link)))
        time.sleep(0.5)  # a courtesy gap; this is someone's public server

    print(f"reports {REPORTS_URL}")
    reports = parse_reports(fetch(REPORTS_URL))
    print(f"        {len(reports)} reports")

    payload = {
        "source": INDEX_URL,
        "reports_source": REPORTS_URL,
        "generated": dt.date.today().isoformat(),
        "committees": committees,
        "reports": reports,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote  {OUT}")


if __name__ == "__main__":
    main()
