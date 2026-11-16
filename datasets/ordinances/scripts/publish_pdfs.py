#!/usr/bin/env python3
"""Put a copy of each ordinance's PDF where the LGU app serves it.

The page shows the PDF in a dialog, and it has to be our copy: Davao City,
Naga, Bacoor, Loon and Bataan forbid their files being framed by another site,
and Loon has already taken most of its codes down. The originals run to 300 MB,
mostly scans at full resolution, so a large one is rebuilt from page images at
110 dpi greyscale (readable, a fifth of the size) with poppler and macOS's
`sips` — no Ghostscript needed — and whichever is smaller is kept. A rebuilt copy
loses its text layer; the text the page copies comes from text/<id>.txt.

Reads the PDFs extract_ordinances.py cached in .pdf-cache.

    python3 -I datasets/ordinances/scripts/publish_pdfs.py [--only id,id] [--jobs 4]
"""
from __future__ import annotations
import argparse, json, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".pdf-cache"
OUT = ROOT.parents[1] / "apps" / "lgu" / "public" / "ordinances"
SMALL = 1_500_000  # below this the original goes up as it is


def rebuild(pdf: Path, dest: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", "110", "-gray", "-jpeg", "-jpegopt", "quality=55", str(pdf), f"{tmp}/p"], check=True, capture_output=True)
        pages = sorted(Path(tmp).glob("p-*.jpg"), key=lambda p: int(p.stem.split("-")[-1]))
        for page in pages:
            subprocess.run(["sips", "-s", "format", "pdf", str(page), "--out", str(page.with_suffix(".pdf"))], check=True, capture_output=True)
        subprocess.run(["pdfunite", *[str(p.with_suffix(".pdf")) for p in pages], str(dest)], check=True, capture_output=True)


def one(oid: str) -> str:
    src, dest = CACHE / f"{oid}.pdf", OUT / f"{oid}.pdf"
    if not src.exists():
        return f"  ! {oid}: not in .pdf-cache; run extract_ordinances.py first"
    if src.stat().st_size <= SMALL:
        shutil.copyfile(src, dest)
        return f"  {oid}: {src.stat().st_size:,} as is"
    tmp = dest.with_suffix(".rebuilt.pdf")
    rebuild(src, tmp)
    if tmp.stat().st_size < src.stat().st_size:
        tmp.replace(dest)
    else:
        tmp.unlink()
        shutil.copyfile(src, dest)
    return f"  {oid}: {src.stat().st_size:,} -> {dest.stat().st_size:,}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    ids = [o["id"] for o in json.loads((ROOT / "ordinances.json").read_text())["ordinances"]]
    only = {s for s in args.only.split(",") if s}
    with ThreadPoolExecutor(args.jobs) as pool:
        for line in pool.map(one, [i for i in ids if not only or i in only]):
            print(line, flush=True)
    # A PDF whose ordinance has left the collection goes with it.
    for stale in OUT.glob("*.pdf"):
        if stale.stem not in ids:
            stale.unlink()
    total = sum(p.stat().st_size for p in OUT.glob("*.pdf"))
    print(f"{len(list(OUT.glob('*.pdf')))} PDFs, {total / 1e6:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
