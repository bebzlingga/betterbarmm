#!/usr/bin/env python3
"""Read a filed measure off its scan.

Parliament serves every bill as an image-only PDF — `pdftotext` on one of them
returns five bytes. So the page has to be rasterised and put through OCR before
anyone can read what the bill says about itself.

The PDF is cached under .pdf-cache (gitignored: they run ~2 MB each and they
are Parliament's to serve, not ours to vendor); the OCR text is written to
whatever --out names, and is working material, not a dataset. Nothing here
writes to readings.json — a reading is written by hand from this text.

    python3 datasets/bills/scripts/ocr_measure.py --numbers 32,98 --out DIR [--jobs 4]
"""
from __future__ import annotations
import argparse, json, subprocess, sys, tempfile, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".pdf-cache" / "bills"
HEADERS = {"User-Agent": "BetterBARMM-registry/1.0 (+https://betterbarmm.com) python-urllib"}


def encode(url: str) -> str:
    """Percent-encode the path; some uploads carry an en-dash in the filename."""
    p = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(
        (p.scheme, p.netloc, urllib.parse.quote(p.path, safe="/%"),
         urllib.parse.quote(p.query, safe="=&%"), p.fragment)
    )


def download(url: str, dest: Path, tries: int = 3) -> bool:
    if dest.exists() and dest.stat().st_size > 1024:
        return True
    for attempt in range(tries):
        try:
            req = urllib.request.Request(encode(url), headers=HEADERS)
            with urllib.request.urlopen(req, timeout=120) as r:
                dest.write_bytes(r.read())
            return True
        except Exception as exc:  # noqa: BLE001 - network, retried then reported
            if attempt == tries - 1:
                print(f"  ! {url} -> {exc}", file=sys.stderr)
                return False
    return False


def ocr(pdf: Path) -> str:
    """Rasterise at 300dpi greyscale, then read each page with tesseract."""
    out: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["pdftoppm", "-r", "300", "-gray", "-png", str(pdf), f"{tmp}/p"],
            check=True, capture_output=True,
        )
        for page in sorted(Path(tmp).glob("p-*.png")):
            r = subprocess.run(
                ["tesseract", str(page), "stdout", "-l", "eng", "--psm", "1"],
                capture_output=True, text=True,
            )
            out.append(f"\n===== PAGE {page.stem.split('-')[-1]} =====\n{r.stdout.strip()}")
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--numbers", required=True, help="comma-separated bill numbers")
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()

    subjects = {
        int(b["number"]): b
        for b in json.loads((ROOT / "bill-subjects.json").read_text())["bills"]
    }
    args.out.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)

    def one(number: int) -> str:
        entry = subjects.get(number)
        if not entry:
            return f"{number}: not in bill-subjects.json"
        target = args.out / f"{number}.txt"
        if target.exists() and target.stat().st_size > 500:
            return f"{number}: already read"
        pdf = CACHE / f"{number}.pdf"
        if not download(entry["pdf"], pdf):
            return f"{number}: download failed"
        try:
            text = ocr(pdf)
        except subprocess.CalledProcessError as exc:
            return f"{number}: rasterise failed ({exc})"
        target.write_text(f"BILL {number}\nSOURCE {entry['pdf']}\n{text}\n")
        return f"{number}: {len(text):,} chars from {entry['pages']} pages"

    numbers = [int(n) for n in args.numbers.split(",") if n.strip()]
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        for line in pool.map(one, numbers):
            print(line, flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
