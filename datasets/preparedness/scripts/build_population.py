#!/usr/bin/env python3
"""Build each BARMM barangay's population, from PSA's 2024 Census of Population (POPCEN).

PSA prints the 2024 count beside every barangay in its PSGC publication, but psa.gov.ph refuses
automated requests. The psgc R package (MIT, github.com/yng-me/psgc) bundles those publications
as they were released, population included, in R/sysdata.rda; this reads the latest release in it
and joins on the 10-digit PSGC code. Every barangay of the region has a figure, the Special
Geographic Area's included but for three PSA has since moved between towns, and the region's barangays sum to PSA's 2024 regional total without Sulu (4,545,486,
the same figure datasets/lgu/barmm-lgu.json carries).

Writes datasets/preparedness/population.json. Needs rdata and pandas (pip install rdata pandas).

    curl -sL -o <scratch>/sysdata.rda https://raw.githubusercontent.com/yng-me/psgc/main/R/sysdata.rda
    python3 datasets/preparedness/scripts/build_population.py --rda <scratch>/sysdata.rda
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path

import rdata

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "datasets" / "preparedness"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rda", type=Path, required=True, help="the psgc package's R/sysdata.rda")
    args = ap.parse_args()

    data = rdata.read_rda(args.rda)
    release = list(data["psgc_population"].keys())[-1]
    pop = data["psgc_population"][release]
    pop = pop[(pop["year"].astype(int) == 2024) & pop["population"].notna()]
    by_code = {str(c): int(n) for c, n in zip(pop["psgc_code"], pop["population"])}

    bgys = json.loads((OUT / "exposure.json").read_text())["barangays"]
    out = {b["psgc"]: by_code[b["psgc"]] for b in bgys if b["psgc"] in by_code}
    missing = [b["psgc"] for b in bgys if b["psgc"] not in by_code]

    (OUT / "population.json").write_text(
        json.dumps(
            {
                "name": "Population of BARMM barangays, 2024",
                "generatedAt": dt.date.today().isoformat(),
                "source": {
                    "label": "PSA, 2024 Census of Population (POPCEN), by barangay, as printed in the PSGC",
                    "href": "https://psa.gov.ph/classification/psgc",
                    "via": f"psgc R package, release {release}",
                    "viaHref": "https://github.com/yng-me/psgc",
                },
                # Panicupan (Malidegao), Macabual (Ligawasan) and Dunguan (Tugunan): the map's boundaries predate a
                # reassignment in the Special Geographic Area that later PSGC releases record, so they are left blank
                # rather than matched by name to a barangay PSA now files under another town.
                "note": f"Joined on the 10-digit PSGC code. {len(missing)} of the map's barangays have no 2024 count: Special Geographic Area barangays whose codes and towns changed in later PSGC releases ({', '.join(missing)})." if missing else f"Joined on the 10-digit PSGC code; every barangay on the map has a 2024 count in the {release} PSGC release.",
                "matched": len(out),
                "of": len(bgys),
                "population": out,
            },
            indent=1,
            ensure_ascii=False,
        )
        + "\n"
    )
    print(f"{release}: population for {len(out)} of {len(bgys)} barangays, total {sum(out.values()):,}; missing {missing[:5]}")


if __name__ == "__main__":
    main()
