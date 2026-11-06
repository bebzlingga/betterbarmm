#!/usr/bin/env python3
"""Capture the First Bangsamoro Parliament from its own site: who sits in it, who presides, who runs its
Secretariat, and who chairs its committees.

  /first-parliament-mp/      the 80 Members: portrait, name, position, how they were elected, whom they represent
  /parliament-officers/      the Speaker, Deputy Speakers, Floor Leader and Deputy Floor Leaders, Secretary General
  /sergeant-at-arms/         the Sergeant-at-Arms
  /committees/ and each committee's page: chair, vice chairs, members, ex officio members, jurisdiction

The Transition Authority's records (members/_index.json, committees/_index.json) are left as they are: they
are the history. This writes a file of its own, so a partial capture can never damage them:

  datasets/bills/bangsamoro_registry/members/first-parliament.json

and, with --photos, each Member's portrait to apps/legislation/public/members/first-parliament/<slug>.jpg,
shrunk to 480px with macOS `sips` (the source files run to 1500px PNGs).

Contact details on the profile pages are deliberately not captured (see fetch_member_profiles.py).

    python3 datasets/bills/scripts/fetch_first_parliament.py [--photos]
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import shutil
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

BASE = "https://parliament.bangsamoro.gov.ph"
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "datasets/bills/bangsamoro_registry/members/first-parliament.json"
PHOTOS = ROOT / "apps/legislation/public/members/first-parliament"


def fetch(url: str, binary: bool = False):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=40) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 * (attempt + 1))


def main_content(page: str) -> str:
    page = re.sub(r"(?s)<(script|style|header|footer|nav)[^>]*>.*?</\1>", "", page)
    start = page.find('id="main-content"')
    return page[start:] if start >= 0 else page


def text(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def tokens(fragment: str) -> list[str]:
    """Visible text, in order, one entry per text node."""
    return [s for s in (re.sub(r"\s+", " ", html.unescape(m)).strip() for m in re.findall(r">([^<]+)<", fragment)) if s]


ROSTER = re.compile(r"^[A-ZÑ][A-ZÑ'.\- ]+, [A-ZÑ][A-ZÑ'.\-\" ]+(?:\.|, JR\.?|, III|, II)?$")


def slugify(name: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def members() -> list[dict]:
    page = main_content(fetch(f"{BASE}/first-parliament-mp/"))
    out = []
    for row in re.findall(r"(?is)<tr[^>]*>.*?</tr>", page):
        cells = re.findall(r"(?is)<td[^>]*>(.*?)</td>", row)
        if len(cells) < 5:
            continue
        img = re.search(r'src="([^"]+)"', cells[0])
        link = re.search(r'href="([^"]+/member-parliament/[^"]+)"', row)
        name = text(cells[1])
        position = text(cells[2])
        roles = [p.strip() for p in position.split("/")[1:] if p.strip()]
        out.append({
            "slug": slugify(name),
            "rosterName": name.replace("“", '"').replace("”", '"'),
            "position": position,
            "roles": roles,
            "representation": text(cells[3]),
            "group": text(cells[4]),
            # The table links a 150px thumbnail; the original sits at the same address without the size.
            "photo_source": re.sub(r"-\d+x\d+(\.\w+)$", r"\1", html.unescape(img.group(1))) if img else None,
            "url": html.unescape(link.group(1)) if link else None,
        })
    return out


def officers() -> dict:
    page = main_content(fetch(f"{BASE}/parliament-officers/"))
    page = page[page.find("Parliament Speaker"):]
    page = page[: page.find("Shares")] if "Shares" in page else page
    groups: dict[str, list[str]] = {}
    heading = None
    for tok in tokens(">" + page):
        if ROSTER.match(tok):
            if heading:
                groups.setdefault(heading, []).append(tok)
        else:
            heading = tok
    sergeant = [t for t in tokens(main_content(fetch(f"{BASE}/sergeant-at-arms/"))) if t.isupper() and len(t.split()) >= 2 and "SERGEANT" not in t][:1]
    return {
        "speaker": (groups.get("Parliament Speaker") or [None])[0],
        "deputy_speakers": groups.get("Deputy Speakers", []),
        "floor_leader": (groups.get("Floor Leader") or [None])[0],
        "deputy_floor_leaders": groups.get("Deputy Floor Leaders", []),
        "secretary_general": (groups.get("Secretary General") or [None])[0],
        "sergeant_at_arms": sergeant[0] if sergeant else None,
        "source": f"{BASE}/parliament-officers/",
    }


def committee(url: str) -> dict:
    page = main_content(fetch(url))
    toks = tokens(page)
    name = next((t for t in toks if t.startswith(("Committee", "Blue Ribbon", "Special Committee", "Bangsamoro Justice"))), "")

    def after(label: str, stop: tuple[str, ...]) -> list[str]:
        if label not in toks:
            return []
        out = []
        for t in toks[toks.index(label) + 1:]:
            if t in stop:
                break
            if ROSTER.match(t) and t not in out:
                out.append(t)
        return out

    stops = ("Chairperson", "Vice-Chairperson(s)", "Description", "Members", "Committee Members", "Ex-Officio Committee Members", "News", "Related News Stories", "Duties, Power and Jurisdiction")
    jurisdiction = ""
    if "Duties, Power and Jurisdiction" in toks:
        i = toks.index("Duties, Power and Jurisdiction")
        jurisdiction = next((t for t in toks[i + 1:] if len(t) > 60), "")
    return {
        "slug": url.rstrip("/").rsplit("/", 1)[-1],
        "name": name,
        "url": url,
        "chairperson": (after("Chairperson", stops) or [None])[0],
        "vice_chairpersons": after("Vice-Chairperson(s)", stops),
        "members": after("Committee Members", stops),
        "ex_officio": after("Ex-Officio Committee Members", stops),
        "jurisdiction": jurisdiction,
    }


def norm(name: str | None) -> str:
    """A roster name for matching: no nickname in quotes, "JR." wherever it was put, one space."""
    s = re.sub(r'["“][^"”]*["”]', "", (name or "").upper())
    s = re.sub(r",?\s*JR\.?", " JR", s)
    return re.sub(r"\s+", " ", s).strip(" ,")


def committees() -> list[dict]:
    """Chairs from the committees index, which Parliament updated for the First Parliament. Each committee's own
    page can still carry the Transition Authority's chair and members; its vice chairs and members are kept only
    where its chair is the index's, so an old roster is never shown as the new one."""
    page = fetch(f"{BASE}/committees/")
    links = list(dict.fromkeys(html.unescape(u) for u in re.findall(r'href="(https://parliament\.bangsamoro\.gov\.ph/committees/[a-z0-9-]+/?)"', page)))
    body = main_content(page)
    body = body[body.find("Parliamentary Committees"):]
    chairs, current = [], None
    for tok in tokens(body):
        if re.match(r"^(Committee|Special Committee|Blue Ribbon|Bangsamoro Justice)", tok):
            current = tok
        elif current and ROSTER.match(tok):
            chairs.append((current, tok))
            current = None
    out = []
    for i, url in enumerate(links):
        c = committee(url)
        name, chair = chairs[i] if i < len(chairs) else (c["name"], c["chairperson"])
        current_page = norm(c["chairperson"]) == norm(chair)
        out.append({**c, "name": name or c["name"], "chairperson": chair,
                    "vice_chairpersons": c["vice_chairpersons"] if current_page else [],
                    "members": c["members"] if current_page else [],
                    "ex_officio": c["ex_officio"] if current_page else []})
        time.sleep(0.4)  # a courtesy gap; this is someone's public server
    return out


def photos(people: list[dict]) -> int:
    if not shutil.which("sips"):
        print("  no `sips` here; portraits skipped")
        return 0
    PHOTOS.mkdir(parents=True, exist_ok=True)
    saved = 0
    with tempfile.TemporaryDirectory() as tmp:
        for p in people:
            if not p["photo_source"]:
                continue
            raw = Path(tmp) / ("raw" + Path(p["photo_source"]).suffix.lower())
            raw.write_bytes(fetch(p["photo_source"], binary=True))
            dest = PHOTOS / f"{p['slug']}.jpg"
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", "480", str(raw), "--out", str(dest)], check=True, capture_output=True)
            p["photo"] = f"/members/first-parliament/{dest.name}"
            saved += 1
            time.sleep(0.3)
    return saved


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--photos", action="store_true", help="also save each Member's portrait")
    args = parser.parse_args()

    people = members()
    print(f"members     {len(people)}")
    office = officers()
    print(f"officers    Speaker {office['speaker']}; {len(office['deputy_speakers'])} deputy speakers; {len(office['deputy_floor_leaders'])} deputy floor leaders")
    rooms = committees()
    print(f"committees  {len(rooms)}, {sum(1 for c in rooms if c['chairperson'])} with a chair, {sum(1 for c in rooms if c['members'])} with members listed")
    if args.photos:
        print(f"portraits   {photos(people)} saved")
    elif OUT.exists():
        # Keep portraits already saved when this run doesn't fetch them.
        old = {p["slug"]: p.get("photo") for p in json.loads(OUT.read_text()).get("members", [])}
        for p in people:
            if old.get(p["slug"]):
                p["photo"] = old[p["slug"]]

    payload = {
        "parliament": "First Bangsamoro Parliament",
        "captured": dt.date.today().isoformat(),
        "sources": [f"{BASE}/first-parliament-mp/", f"{BASE}/parliament-officers/", f"{BASE}/committees/"],
        "note": "The First Parliament as its own site lists it. Committee vice chairs and members appear as Parliament publishes them; a committee with only a chair has not posted the rest yet.",
        "officers": office,
        "members": people,
        "committees": rooms,
    }
    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
