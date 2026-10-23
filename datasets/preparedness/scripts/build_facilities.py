#!/usr/bin/env python3
"""Build the preparedness map's facilities.

Facilities — OpenStreetMap, through the Overpass API (ODbL), every point placed
in the BARMM barangay that holds it; anything outside the region is dropped.
Each links to its own OpenStreetMap record. OpenStreetMap is not an official
register; it is used because the official ones are not open:

  Evacuation centres. No official list is published for the region. DILG keeps
  a master list with coordinates (2023) and releases it through FOI; DSWD's
  DROMIC reports count centres opened in a disaster but do not list them. So
  the map carries the few OpenStreetMap names as evacuation centres or assembly
  points, and the region's schools, which are what LGUs most often designate.
  Health. The DOH National Health Facility Registry refuses automated access.

Each barangay's population is built separately, from PSA's 2024 census, by
build_population.py.

Writes datasets/preparedness/facilities.json.
Needs shapely (pip install shapely).

    python3 datasets/preparedness/scripts/build_facilities.py --raw <scratch dir>
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from pathlib import Path

from shapely import STRtree, make_valid
from shapely.geometry import Point, shape

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "datasets" / "preparedness"
LGU = ROOT / "datasets" / "lgu" / "barmm-lgu.json"

PROVINCES = {"19007": "basilan", "19036": "lanao-del-sur", "19087": "maguindanao-del-norte", "19088": "maguindanao-del-sur", "19070": "tawi-tawi", "19999": "special-geographic-area"}
# The Special Geographic Area's eight towns. The edition has their barangays but no
# province file to name the towns from; each is named by which of the Directory's
# SGA towns its barangays match.
SGA_TOWNS = {
    "1999901000": "Kapalawan",
    "1999902000": "Old Kaabakan",
    "1999903000": "Kadayangan",
    "1999904000": "Nabalawag",
    "1999905000": "Pahamuddin",
    "1999906000": "Malidegao",
    "1999907000": "Ligawasan",
    "1999908000": "Tugunan",
}

EVAC_NAME = re.compile(r"evacuat|assembly (area|point)", re.I)


def fold(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower().replace("poblacion", "pob").replace("ñ", "n"))


def kind_of(t: dict) -> str | None:
    name = t.get("name") or ""
    if EVAC_NAME.search(name) and "church" not in name.lower() and "god" not in name.lower():
        return "evacuation"
    if t.get("emergency") in ("assembly_point", "evacuation_centre", "evacuation_center") or t.get("shelter_type") == "evacuation":
        return "evacuation"
    if t.get("emergency") == "disaster_response":
        return "drrm"
    if t.get("amenity") == "fire_station":
        return "fire"
    if t.get("amenity") == "police":
        return "police"
    if t.get("amenity") == "hospital" or t.get("healthcare") == "hospital":
        return "hospital"
    if t.get("amenity") in ("clinic", "doctors") or t.get("healthcare") in ("clinic", "centre", "health_post", "doctor", "birthing_center", "birthing_centre", "midwife") or t.get("amenity") == "health_post":
        return "health"
    if t.get("amenity") in ("school", "college", "university"):
        return "school"
    return None


def load_barangays(raw: Path):
    towns = {}
    for f in (raw / "bounds").glob("prov-*.json"):
        for ft in json.loads(f.read_text())["features"]:
            towns[str(ft["properties"]["adm3_psgc"])] = ft["properties"]["adm3_en"]
    out = []
    for f in sorted((raw / "bounds" / "bgy").glob("*.json")):
        for ft in json.loads(f.read_text())["features"]:
            p = ft["properties"]
            if not ft["geometry"]:
                continue
            town = towns.get(str(p["adm3_psgc"])) or SGA_TOWNS.get(str(p["adm3_psgc"]))
            prov = "cotabato-city" if town == "City of Cotabato" else PROVINCES.get(str(p["adm2_psgc"])[:5])
            out.append({"psgc": str(p["adm4_psgc"]), "name": p["adm4_en"], "town": town, "town_psgc": str(p["adm3_psgc"]), "prov": prov, "geom": make_valid(shape(ft["geometry"]))})
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True, type=Path)
    args = ap.parse_args()
    raw = args.raw
    bgys = load_barangays(raw)
    tree = STRtree([b["geom"] for b in bgys])

    seen, facilities = set(), []
    for f in ("evac", "safety", "health", "schools", *[f"name{i}" for i in range(1, 6)]):
        path = raw / "osm" / f"{f}.json"
        if not path.exists():
            continue
        for e in json.loads(path.read_text())["elements"]:
            key = f"{e['type']}/{e['id']}"
            if key in seen:
                continue
            t = e.get("tags", {})
            kind = kind_of(t)
            # Schools and health posts with no name are buildings, not places a reader can look for.
            if not kind or (kind in ("school", "health") and not t.get("name")):
                continue
            lon, lat = (e["lon"], e["lat"]) if "lon" in e else (e["center"]["lon"], e["center"]["lat"])
            pt = Point(lon, lat)
            hits = [i for i in tree.query(pt, predicate="intersects")]
            if not hits:
                continue
            b = bgys[hits[0]]
            seen.add(key)
            facilities.append(
                {
                    "id": key.replace("/", "-"),
                    "kind": kind,
                    "name": t.get("name") or {"evacuation": "Evacuation area", "drrm": "Disaster response", "police": "Police station", "fire": "Fire station", "hospital": "Hospital"}.get(kind, "Unnamed"),
                    "lon": round(lon, 6),
                    "lat": round(lat, 6),
                    "barangay": b["name"],
                    "psgc": b["psgc"],
                    "town": b["town"],
                    "prov": b["prov"],
                    "detail": t.get("operator") or t.get("healthcare:speciality") or None,
                    "source": {"label": "OpenStreetMap", "url": f"https://www.openstreetmap.org/{key}"},
                }
            )
    facilities.sort(key=lambda f: (f["kind"], f["prov"] or "", f["town"] or "", f["name"]))
    counts: dict[str, int] = {}
    for f in facilities:
        counts[f["kind"]] = counts.get(f["kind"], 0) + 1
    today = dt.date.today().isoformat()
    (OUT / "facilities.json").write_text(
        json.dumps(
            {
                "name": "Facilities for disaster preparedness in BARMM",
                "generatedAt": today,
                "source": {"label": "OpenStreetMap contributors, via the Overpass API", "href": "https://www.openstreetmap.org/copyright", "licence": "ODbL 1.0"},
                "note": "Every point is an OpenStreetMap record placed in the BARMM barangay that holds it. No official list of evacuation centres is published for the region: DILG holds a master list with coordinates and releases it through FOI. Schools are shown because they are what LGUs most often designate as evacuation centres; a school on the map is not thereby a designated one. The DOH health facility registry refuses automated access, so health facilities are OpenStreetMap's too.",
                "counts": counts,
                "facilities": facilities,
            },
            indent=1,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(counts)


if __name__ == "__main__":
    main()
