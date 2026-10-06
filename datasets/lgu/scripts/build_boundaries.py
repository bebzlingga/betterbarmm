#!/usr/bin/env python3
"""Write datasets/lgu/barmm-boundaries.json — the shape of each BARMM area,
as SVG path data ready to draw.

The estate held no boundary geometry before this. The travel workspace's
locator map says why it draws no coastline: it had no shoreline it could
vouch for, and a freehand one would be a drawing presented as a survey. This
file is the answer to that rather than an exception to it — the outlines are
PSA's own, through the Philippine Standard Geographic Code, and every unit is
keyed by the PSGC code the directory already stores.

What the source is, and what it is not. faeldon/philippines-json-maps
republishes PSA's boundaries as GeoJSON by PSGC edition. The 2023 edition is
used here at its lowest resolution, which is a simplification of a survey and
not a cadastral boundary: it is good enough to recognize a province and not
good enough to settle where one ends.

Three things the PSGC edition does not know, which this script fixes so the
map agrees with the directory beside it:

  Cotabato City is inside Maguindanao del Norte. PSA files it there, so the
  province file carries thirteen municipalities where the directory lists
  twelve. The city is lifted out into its own area, exactly as the directory
  lifts its 383,383 people out of the province's population.

  Sulu is still in. The 2023 edition predates the Supreme Court ruling that
  removed it from the region. It is kept, because leaving it out puts a hole
  in the middle of the archipelago between Basilan and Tawi-Tawi, but it is
  written to `outside` rather than `areas` — drawn as land, never as a
  Bangsamoro province, and never counted.

  The Special Geographic Area has no shape at all. Its file is an empty
  geometry collection: the 63 barangays were ratified in 2024, after this
  edition. It is reported in `missing` so a page can say it is absent rather
  than quietly draw six areas and call it the region.

Everything that is not BARMM is written to `land`. Six of the region's seven
areas are scattered across six hundred kilometres of sea, and drawn on their
own they read as unrelated islands rather than as one government — the grey
behind them is what makes Lanao del Sur part of Mindanao and Tawi-Tawi part of
an archipelago. The frame is the island group, not the region: cropping to
BARMM alone would cut the context off at exactly the provinces that need it.

The whole country is fetched, because the source publishes by province and
there is no cheaper way to learn which provinces fall in the frame than to
look. Everything outside the frame is then dropped, so Luzon is read and never
written.

Winding is normalized before the rings are concatenated — exterior
counterclockwise, holes clockwise — so one path per area fills correctly
under `nonzero` without needing a dissolve, which would want a geometry
library this repo does not carry.

    python3 datasets/lgu/scripts/build_boundaries.py
"""
import json
import math
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "lgu" / "barmm-boundaries.json"
# Barangay outlines, in the same frame, in a file of their own: a page that
# draws the region never needs them, and one that zooms into a town needs only
# that town's.
BARANGAY_OUT = ROOT / "lgu" / "barmm-barangay-shapes.json"
BARANGAY_BASE = (
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master"
    "/2023/geojson/municities/lowres/bgysubmuns-municity-{code}.0.001.json"
)

BASE = (
    "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master"
    "/2023/geojson/provdists/lowres/municities-provdist-{code}.0.001.json"
)

# Every province the source publishes, discovered rather than listed: the
# edition decides how many there are, and a list written here would be a second
# opinion about that.
TREE = (
    "https://api.github.com/repos/faeldon/philippines-json-maps"
    "/git/trees/master?recursive=1"
)
TREE_PATTERN = re.compile(
    r"2023/geojson/provdists/lowres/municities-provdist-(\d+)\.0\.001\.json"
)

# The island group the map is framed on, by the region code each province
# carries in `adm1_psgc`. BARMM is 19; the other five are what it borders and
# what the frame has to hold for the region to sit in anything.
MINDANAO = {
    900000000,  # IX — Zamboanga Peninsula
    1000000000,  # X — Northern Mindanao
    1100000000,  # XI — Davao
    1200000000,  # XII — SOCCSKSARGEN
    1600000000,  # XIII — Caraga
    1900000000,  # BARMM
}
BARMM_REGION = 1900000000

# PSGC provdist code → the directory's own slug and name. The codes are
# region 19's, which is what the 2023 edition files BARMM under.
UNITS = [
    ("1900700000", "basilan", "Basilan"),
    ("1903600000", "lanao-del-sur", "Lanao del Sur"),
    ("1908700000", "maguindanao-del-norte", "Maguindanao del Norte"),
    ("1908800000", "maguindanao-del-sur", "Maguindanao del Sur"),
    ("1907000000", "tawi-tawi", "Tawi-Tawi"),
]

# Lifted out of Maguindanao del Norte into an area of its own, as the
# directory does. Matched on the PSGC edition's own spelling.
COTABATO_CITY = "City of Cotabato"

# Drawn as land, never as a province. See the note above.
OUTSIDE = [("1906600000", "sulu", "Sulu")]

# Named in the file so a page can account for it without drawing it.
MISSING = [
    {
        "slug": "special-geographic-area",
        "name": "Special Geographic Area",
        "why": "Ratified in 2024, after the PSGC edition these outlines come from. Its file is an empty geometry collection.",
    }
]

# The drawing is 1000 units wide; the height falls out of the region's own
# proportions. Coordinates are rounded to one decimal, which at this width is
# finer than a pixel on any screen the map is drawn at and roughly halves the
# file.
WIDTH = 1000.0
PRECISION = 1

# Breathing room inside the frame, as a share of the region's own width.
# Without it Maguindanao del Sur's easternmost point lands exactly on the
# frame edge and the mainland reads as cropped rather than as coastline. It is
# wide rather than hairline because the margin is where the grey land shows:
# too tight and the region is ringed by its own edge instead of by Mindanao.
PAD = 0.05

# Rings smaller than this, as a share of the whole drawing, are dropped. The
# archipelago has hundreds of islets that render as a single speck or less,
# and each one costs more bytes than the province it belongs to.
MIN_RING_AREA = 0.00002

# The grey is context, not the subject, and it is most of the drawing. A
# coarser floor on it drops a few hundred islets nobody is looking at and keeps
# the file from tripling.
MIN_LAND_RING_AREA = 0.00008


def fetch(code):
    with urllib.request.urlopen(BASE.format(code=code), timeout=60) as response:
        return json.loads(response.read())


def rings_of(geometry):
    """Every linear ring, as (ring, is_hole).

    The hole flag has to be carried out of the GeoJSON rather than inferred
    later: a polygon's first ring is its outline and the rest are holes in it,
    and once the rings of a whole province are in one list there is nothing
    left in them that says which was which. `nonzero` needs only that a hole
    winds against the ring it sits in, so the flag is enough and the nesting
    itself can be thrown away.
    """
    # A handful of the country's municipalities are published with no geometry
    # at all. They are nothing to draw, not an error to stop on.
    if not geometry:
        return []
    kind = geometry["type"]
    polygons = []
    if kind == "Polygon":
        polygons = [geometry["coordinates"]]
    elif kind == "MultiPolygon":
        polygons = geometry["coordinates"]
    return [
        (ring, index > 0)
        for polygon in polygons
        for index, ring in enumerate(polygon)
    ]


def signed_area(ring):
    """Twice the signed area. Positive is counterclockwise in lon/lat."""
    total = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        total += x1 * y2 - x2 * y1
    return total


def main():
    with urllib.request.urlopen(TREE, timeout=120) as response:
        tree = json.loads(response.read())
    codes = sorted({
        match.group(1)
        for item in tree.get("tree", [])
        if (match := TREE_PATTERN.fullmatch(item["path"]))
    })
    print(f"{len(codes)} provinces in the 2023 edition")

    by_code = {code: (slug, name) for code, slug, name in UNITS}
    outside_by_code = {code: (slug, name) for code, slug, name in OUTSIDE}

    areas, outside, names = {}, {}, {}
    land_rings, framed_land = [], []
    # Each municipality's own feature, kept beside the merged area so a map can
    # draw the region one town at a time.
    unit_features = []

    def rings(features):
        return [ring for f in features for ring in rings_of(f["geometry"])]

    for code in codes:
        features = fetch(code).get("features") or []
        if not features:
            # The Special Geographic Area, and only it. Reported in `missing`.
            continue
        region = features[0]["properties"]["adm1_psgc"]

        if code in by_code:
            slug, name = by_code[code]
            if slug == "maguindanao-del-norte":
                # PSA files the city inside the province. The directory does
                # not, and its population figure already has the city taken
                # out, so the shape is lifted the same way.
                city = [
                    f for f in features
                    if f["properties"]["adm3_en"] == COTABATO_CITY
                ]
                assert len(city) == 1, f"expected one {COTABATO_CITY}"
                features = [f for f in features if f not in city]
                areas["cotabato-city"] = rings(city)
                names["cotabato-city"] = "Cotabato City"
                unit_features.extend(("cotabato-city", f) for f in city)
            areas[slug] = rings(features)
            names[slug] = name
            unit_features.extend((slug, f) for f in features)
        elif code in outside_by_code:
            slug, name = outside_by_code[code]
            outside[slug] = rings(features)
            names[slug] = name
        else:
            found = rings(features)
            land_rings.extend(found)
            # Only the island group sets the frame. The rest of the country is
            # carried this far so it can be clipped against a frame it had no
            # say in, which is the point: Luzon must not drag the map north.
            if region in MINDANAO:
                framed_land.extend(found)

    print(f"  {len(areas)} areas · {len(outside)} outside · {len(land_rings)} land rings")

    # The frame is the region and nothing else, with room left around it. It
    # was briefly the whole island group, which is a truer map of Mindanao and
    # a worse one of BARMM: framed on the group, the region sits in the bottom
    # left under four hundred units of Visayas. The land is context and context
    # does not get to decide the crop — it fills the margin and runs off the
    # edges, which is what land does.
    framed = [
        point
        for group in [*areas.values(), *outside.values()]
        for ring, _ in group
        for point in ring
    ]
    del framed_land
    min_lon = min(point[0] for point in framed)
    max_lon = max(point[0] for point in framed)
    min_lat = min(point[1] for point in framed)
    max_lat = max(point[1] for point in framed)

    # Longitude degrees are shorter than latitude degrees everywhere but the
    # equator, so they are corrected at the frame's middle latitude. Without
    # it the region comes out stretched about 1% per degree off the equator —
    # the same correction the travel workspace's projection makes.
    lat_k = math.cos(math.radians((min_lat + max_lat) / 2))
    span = (max_lon - min_lon) * lat_k
    units_per_degree = (WIDTH * (1 - 2 * PAD)) / span
    inset = WIDTH * PAD
    height = (max_lat - min_lat) * units_per_degree + 2 * inset

    def project(lon, lat):
        return (
            inset + (lon - min_lon) * lat_k * units_per_degree,
            inset + (max_lat - lat) * units_per_degree,  # SVG counts y downward
        )

    def path_for(group, floor=MIN_RING_AREA, precision=PRECISION):
        """One path, every ring a subpath, wound so `nonzero` cuts the holes.

        This is what stands in for a dissolve. Concatenating the rings of
        every municipality into one path and filling it leaves no seam between
        them, because two subpaths that merely share an edge fill as one shape
        — which is the whole of what a dissolved province would have been for
        here. A real dissolve wants a geometry library; this wants a loop.
        """
        # Largest ring first, so the mainland of an area is the subpath a
        # reader's eye lands on and the islets follow it.
        ordered = sorted(group, key=lambda r: abs(signed_area(r[0])), reverse=True)
        parts = []
        for ring, is_hole in ordered:
            projected = [project(lon, lat) for lon, lat, *_ in ring]

            # Nothing with a corner in the frame is kept. This is what leaves
            # Luzon out of the file: read, projected, found to be nowhere near,
            # dropped before it costs a byte.
            if not any(
                -inset <= x <= WIDTH + inset and -inset <= y <= height + inset
                for x, y in projected
            ):
                continue

            area = signed_area(projected)
            if abs(area) / (WIDTH * height) < floor:
                continue
            # Every outline wound one way and every hole the other, which is
            # the only thing `nonzero` asks: a hole cancels the ring it sits
            # in, two touching outlines do not cancel each other. The source
            # is not trusted to be wound to the GeoJSON spec, so both are set
            # here from the sign of the area rather than taken on faith.
            if (area > 0) != is_hole:
                projected.reverse()
            points = [
                f"{round(x, precision)} {round(y, precision)}" for x, y in projected
            ]
            parts.append("M" + "L".join(points) + "Z")
        return "".join(parts)

    def entries(source, order):
        return [
            {"slug": slug, "name": names[slug], "d": path_for(source[slug])}
            for slug in order
            if slug in source
        ]

    order = [
        "basilan",
        "lanao-del-sur",
        "maguindanao-del-norte",
        "maguindanao-del-sur",
        "tawi-tawi",
        "cotabato-city",
    ]

    # One path per municipality. A lower floor than the areas get, because a
    # town that is a scatter of islets would otherwise lose every ring it has;
    # where even that leaves nothing, every ring is kept.
    units = []
    for slug, feature in unit_features:
        group = rings_of(feature["geometry"])
        d = path_for(group, floor=MIN_RING_AREA / 4) or path_for(group, floor=0)
        if not d:
            continue
        props = feature["properties"]
        units.append({
            "psgc": str(props["adm3_psgc"]),
            "name": props["adm3_en"],
            "area": slug,
            "d": d,
        })

    # Barangays, one file per town in the source, all projected into the same
    # frame as the towns. Two decimals rather than one: a barangay is drawn
    # zoomed in, where a tenth of a unit is visible.
    barangays = {}
    for unit in units:
        try:
            with urllib.request.urlopen(BARANGAY_BASE.format(code=unit["psgc"]), timeout=60) as response:
                features = json.loads(response.read()).get("features") or []
        except Exception as exc:  # noqa: BLE001 - a missing town is reported, not fatal
            print(f"  ! no barangays for {unit['name']}: {exc}")
            continue
        drawn = []
        for feature in features:
            group = rings_of(feature["geometry"])
            d = path_for(group, floor=0, precision=2)
            if d:
                props = feature["properties"]
                drawn.append({"psgc": str(props["adm4_psgc"]), "name": props["adm4_en"], "d": d})
        barangays[unit["psgc"]] = drawn

    # All the grey as one path. It is one thing on the page — land that is not
    # the region — and seventy provinces of it would be seventy nodes carrying
    # a distinction the map never draws.
    land_d = path_for(land_rings, floor=MIN_LAND_RING_AREA)

    payload = {
        "name": "BARMM area outlines",
        "note": (
            "SVG path data in a 1000-unit-wide frame, equirectangular with the "
            "longitude corrected at the frame's middle latitude. Framed on the "
            "Mindanao island group. Simplified outlines: good enough to "
            "recognize a province, not good enough to settle where one ends."
        ),
        "source": {
            "label": "PSA — Philippine Standard Geographic Code, 2023 edition",
            "href": "https://psa.gov.ph/classification/psgc",
            "via": "faeldon/philippines-json-maps",
            "viaHref": "https://github.com/faeldon/philippines-json-maps",
        },
        "viewBox": f"0 0 {round(WIDTH)} {round(height)}",
        "width": round(WIDTH),
        "height": round(height, PRECISION),
        "areas": entries(areas, order),
        "outside": entries(outside, list(outside)),
        "land": land_d,
        "units": units,
        "missing": MISSING,
    }

    OUT.write_text(json.dumps(payload, indent=1, ensure_ascii=False) + "\n")
    BARANGAY_OUT.write_text(json.dumps({
        "name": "BARMM barangay outlines",
        "note": "Same frame and source as barmm-boundaries.json, keyed by the town's PSGC code in the 2023 edition.",
        "source": payload["source"],
        "units": barangays,
    }, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"{BARANGAY_OUT.relative_to(ROOT.parent)}  {BARANGAY_OUT.stat().st_size / 1024:.1f} KB, "
          f"{sum(len(v) for v in barangays.values())} barangays")
    print(f"\n{OUT.relative_to(ROOT.parent)}  {OUT.stat().st_size / 1024:.1f} KB")
    print(f"viewBox {payload['viewBox']}")
    print(f"  {len(units)} municipalities drawn")
    for area in payload["areas"] + payload["outside"]:
        print(f"  {area['name']:<24} {area['d'].count('M'):>4} rings")
    print(f"  {'(land)':<24} {land_d.count('M'):>4} rings")


if __name__ == "__main__":
    main()
