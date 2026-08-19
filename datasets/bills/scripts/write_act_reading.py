#!/usr/bin/env python3
"""Merge a hand-written act reading into the registry.

One act per JSON blob on stdin. It updates two files and leaves everything it
is not given alone, so a partial blob is safe:

  bangsamoro_registry/baa/BAA-NN.json   the record the browser renders
  readings.json                          the narrative the dialog reads from

Written because the readings are hand-made but their shape is not: every act
needs the same fields in the same places, and doing that by hand 90 times is
how a registry drifts.

    python3 datasets/bills/scripts/write_act_reading.py < act.json
"""
from __future__ import annotations
import json, sys
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BAA = ROOT / "bangsamoro_registry" / "baa"
READINGS = ROOT / "readings.json"

def load(p): return json.loads(p.read_text(), object_pairs_hook=OrderedDict)
def save(p, d): p.write_text(json.dumps(d, indent=1, ensure_ascii=False))

def main() -> int:
    src = json.loads(sys.stdin.read(), object_pairs_hook=OrderedDict)
    n = src["number"]
    path = BAA / f"BAA-{n:02d}.json"
    if not path.exists():
        print(f"! no record at {path}", file=sys.stderr); return 1

    d = load(path)

    for k, v in (src.get("basic") or {}).items():
        d["basic_information"][k] = v

    cs = d.setdefault("citizen_summary", OrderedDict())
    for k, v in (src.get("summary") or {}).items():
        cs[k] = v
    if src.get("means"):
        cs["what_this_means_for_you"] = src["means"]

    for key in ("key_provisions", "impact", "related_legislation",
                "related_documents", "implementation_status",
                "citizen_questions", "display_header", "views", "provenance"):
        if key in src:
            d[key] = src[key]

    save(path, d)

    if src.get("reading"):
        r = load(READINGS)
        entry = OrderedDict([("category", "acts"), ("number", n)])
        entry.update(src["reading"])
        r["readings"] = [x for x in r["readings"]
                         if not (x.get("category") == "acts" and x.get("number") == n)]
        r["readings"].append(entry)
        r["readings"].sort(key=lambda x: (x["category"], x["number"]))
        r["meta"]["count"] = len(r["readings"])
        save(READINGS, r)

    print(f"BAA {n} written")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
