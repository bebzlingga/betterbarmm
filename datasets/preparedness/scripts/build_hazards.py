#!/usr/bin/env python3
"""Build the preparedness map's hazard layers and each barangay's exposure.

Sources, both public:

  Hazards — Project NOAH's flood (100-year rain return), landslide and storm
  surge (Storm Surge Advisory 4) maps, by province, from NOAH's open data
  downloads (Google Drive folder "NOAH Downloads", linked from
  noah.up.edu.ph). Open Data Commons Open Database License (ODbL): anything
  built from them, this included, is shared under the same licence. Each map
  has three classes: 1 low, 2 medium, 3 high.

  Barangays — PSA's boundaries, 2023 PSGC edition, through
  faeldon/philippines-json-maps (the source the LGU boundaries already use).
  Low resolution where it is complete; high resolution for the towns whose
  low-resolution file drops barangays, including the Special Geographic Area.

NOAH publishes by pre-2022 province, so Maguindanao covers both Maguindanao
provinces and Cotabato City, and Cotabato covers the 63 barangays of the
Special Geographic Area (and much else, which is cut away). NOAH has no flood
model for Tawi-Tawi; its 100-year flood file is empty.

What it writes:

  datasets/preparedness/exposure.json        every barangay: area, and the km² of
                                             it in each hazard class
  apps/www/public/preparedness/hazards.pmtiles    vector tiles: flood, landslide, surge
  apps/www/public/preparedness/barangays.pmtiles  vector tiles: every barangay, with its exposure

Needs shapely and pyshp (pip install shapely pyshp) and tippecanoe.

    python3 datasets/preparedness/scripts/build_hazards.py --raw <dir with the NOAH zips unpacked and the barangay files>
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
from pathlib import Path

import shapefile
from shapely import STRtree, make_valid
from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[3]
OUT_JSON = ROOT / "datasets" / "preparedness" / "exposure.json"
OUT_TILES = ROOT / "apps" / "www" / "public" / "preparedness" / "hazards.pmtiles"
OUT_BARANGAYS = ROOT / "apps" / "www" / "public" / "preparedness" / "barangays.pmtiles"
LGU = ROOT / "datasets" / "lgu" / "barmm-lgu.json"

# 2023 PSGC province codes → the directory's slugs. Cotabato City sits inside
# Maguindanao del Norte in the edition and is lifted out by name, as the LGU
# boundaries do.
PROVINCES = {
    "19007": "basilan",
    "19036": "lanao-del-sur",
    "19087": "maguindanao-del-norte",
    "19088": "maguindanao-del-sur",
    "19070": "tawi-tawi",
    "19999": "special-geographic-area",
}
COTABATO_CITY = "City of Cotabato"
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

# Which NOAH province file covers which of ours.
NOAH = {
    "Basilan": ["basilan"],
    "LanaoDelSur": ["lanao-del-sur"],
    "Maguindanao": ["maguindanao-del-norte", "maguindanao-del-sur", "cotabato-city"],
    "TawiTawi": ["tawi-tawi"],
    "Cotabato": ["special-geographic-area"],
}
HAZARDS = {
    "flood": ("flood100", "Flood_100year", "Var"),
    "landslide": ("landslide", "LandslideHazards", "LH"),
    "surge": ("surge4", "StormSurge_SSA4", "HAZ"),
}
KM_PER_DEG = 111.32


def km2(geom, lat: float) -> float:
    """Area in km², from degrees: good to well under a percent at a barangay's size."""
    return geom.area * KM_PER_DEG * KM_PER_DEG * math.cos(math.radians(lat))


def load_barangays(raw: Path):
    out = []
    for f in sorted((raw / "bounds" / "bgy").glob("*.json")):
        for ft in json.loads(f.read_text())["features"]:
            p = ft["properties"]
            if not ft["geometry"]:
                continue
            prov_code = str(p["adm2_psgc"])[:5]
            town = None
            prov = PROVINCES.get(prov_code)
            g = make_valid(shape(ft["geometry"]))
            out.append({"psgc": str(p["adm4_psgc"]), "name": p["adm4_en"], "town_psgc": str(p["adm3_psgc"]), "prov": prov, "geom": g})
    # Town names come from the province files.
    towns = {}
    for f in (raw / "bounds").glob("prov-*.json"):
        for ft in json.loads(f.read_text())["features"]:
            towns[str(ft["properties"]["adm3_psgc"])] = ft["properties"]["adm3_en"]
    for b in out:
        b["town"] = towns.get(b["town_psgc"]) or SGA_TOWNS.get(b["town_psgc"])
        if b["town"] == COTABATO_CITY:
            b["prov"] = "cotabato-city"
    return out


def hazard_parts(raw: Path, hazard: str, noah_prov: str):
    folder, suffix, field = HAZARDS[hazard]
    path = raw / "shp" / f"{folder}_{noah_prov}" / f"{noah_prov}_{suffix}.shp"
    if not path.exists():
        return []
    r = shapefile.Reader(str(path))
    idx = [i for i, f in enumerate(r.fields[1:]) if f[0] == field][0]
    parts = []
    for i in range(len(r)):
        cls = int(r.record(i)[idx])
        g = shape(r.shape(i).__geo_interface__)
        for poly in getattr(g, "geoms", [g]):
            parts.append((cls, poly))
    return parts


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True, type=Path)
    ap.add_argument("--work", type=Path, default=None)
    args = ap.parse_args()
    raw: Path = args.raw
    work = args.work or raw / "work"
    work.mkdir(parents=True, exist_ok=True)

    bgys = load_barangays(raw)
    print(f"{len(bgys)} barangays")
    exposure = {b["psgc"]: {"flood": [0.0, 0.0, 0.0], "landslide": [0.0, 0.0, 0.0], "surge": [0.0, 0.0, 0.0]} for b in bgys}

    for hazard in HAZARDS:
        out = (work / f"{hazard}.geojsonl").open("w")
        for noah_prov, ours in NOAH.items():
            mine = [b for b in bgys if b["prov"] in ours]
            if not mine:
                continue
            parts = hazard_parts(raw, hazard, noah_prov)
            if not parts:
                print(f"  {hazard} {noah_prov}: no file")
                continue
            mask = unary_union([b["geom"] for b in mine])
            tree = STRtree([p for _, p in parts])
            classes = [c for c, _ in parts]
            # Display: every part that touches the mask, cut to it where it crosses.
            kept = 0
            for i in tree.query(mask, predicate="intersects"):
                poly = parts[i][1]
                g = poly if mask.contains(poly) else poly.intersection(mask)
                if g.is_empty:
                    continue
                out.write(json.dumps({"type": "Feature", "properties": {"h": classes[i]}, "geometry": mapping(g)}) + "\n")
                kept += 1
            # Exposure: each barangay's km² in each class.
            for b in mine:
                lat = b["geom"].centroid.y
                for i in tree.query(b["geom"], predicate="intersects"):
                    inter = parts[i][1].intersection(b["geom"])
                    if not inter.is_empty:
                        exposure[b["psgc"]][hazard][classes[i] - 1] += km2(inter, lat)
            print(f"  {hazard} {noah_prov}: {len(parts)} parts, {kept} kept")
        out.close()

    # Barangays, as a layer of their own carrying their exposure for the choropleth.
    with (work / "barangays.geojsonl").open("w") as out:
        for b in bgys:
            e = exposure[b["psgc"]]
            area = km2(b["geom"], b["geom"].centroid.y)
            props = {"psgc": b["psgc"], "name": b["name"], "town": b["town"], "prov": b["prov"], "area": round(area, 3)}
            for hz, v in e.items():
                for c in range(3):
                    props[f"{hz[0]}{c + 1}"] = round(min(1.0, v[c] / area), 4) if area else 0
            out.write(json.dumps({"type": "Feature", "properties": props, "geometry": mapping(b["geom"])}) + "\n")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(
        json.dumps(
            {
                "name": "Hazard exposure of BARMM barangays",
                "generatedAt": __import__("datetime").date.today().isoformat(),
                "note": "km² of each barangay inside each Project NOAH hazard class (1 low, 2 medium, 3 high): flood for a 100-year rain, landslide, and storm surge at Storm Surge Advisory 4. NOAH has no flood model for Tawi-Tawi.",
                "licence": "ODbL 1.0 (Project NOAH open data); boundaries PSA 2023 PSGC via faeldon/philippines-json-maps",
                "barangays": [
                    {"psgc": b["psgc"], "name": b["name"], "town": b["town"], "town_psgc": b["town_psgc"], "prov": b["prov"], "area": round(km2(b["geom"], b["geom"].centroid.y), 3), "at": [round(b["geom"].representative_point().x, 5), round(b["geom"].representative_point().y, 5)], "bbox": [round(x, 4) for x in b["geom"].bounds], **{hz: [round(x, 4) for x in v] for hz, v in exposure[b["psgc"]].items()}}
                    for b in bgys
                ],
            },
            indent=1,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(f"wrote {OUT_JSON}")

    OUT_TILES.parent.mkdir(parents=True, exist_ok=True)
    # Barangays in a tileset of their own: every one is needed at every zoom, for the
    # by-barangay view and for clicks, and a crowded hazard tile would thin them out.
    subprocess.run([
        "tippecanoe", "-q", "-o", str(OUT_BARANGAYS), "--force", "-Z5", "-z13", "--detect-shared-borders", "--no-tile-size-limit",
        "--attribution=Boundaries: PSA 2023 PSGC. Exposure: Project NOAH (ODbL).", "-L", f"barangays:{work / 'barangays.geojsonl'}",
    ], check=True)
    # The hazards are hundreds of thousands of small polygons: at low zooms the smallest
    # give way, which they would not show at that scale anyway (the page's heat covers it).
    subprocess.run([
        # Zoom 12 at most: zoom 13 doubles the file (73 MB against 48) for detail the map
        # draws well enough by enlarging zoom 12, NOAH's polygons being 20-30 m at their finest.
        "tippecanoe", "-q", "-o", str(OUT_TILES), "--force", "-Z6", "-z12",
        "--drop-smallest-as-needed", "--coalesce-densest-as-needed", "--extend-zooms-if-still-dropping",
        "--maximum-tile-bytes=1500000", "--simplification=8",
        "--attribution=Hazards: Project NOAH, UP Resilience Institute (ODbL).",
        "-L", f"flood:{work / 'flood.geojsonl'}", "-L", f"landslide:{work / 'landslide.geojsonl'}", "-L", f"surge:{work / 'surge.geojsonl'}",
    ], check=True)
    for f in (OUT_BARANGAYS, OUT_TILES):
        print(f"wrote {f} ({f.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
