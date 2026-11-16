#!/usr/bin/env python3
"""Read every ordinance in ordinances.json off its PDF.

The collection is ordinances other LGUs across the country have enacted, kept
as references a BARMM council can read before drafting its own. Each entry in
ordinances.json is written by hand (category, LGU, number, title, summary);
this script only downloads the PDF and reads its text.

A PDF with a text layer is read from it. A scan is rasterised at 300 dpi and
put through tesseract. The PDF is cached under .pdf-cache (gitignored: they are
the LGU's to serve); the text goes to text/<id>.txt, and each entry's `pages`
and `read` ("text" or "ocr") are written back.

    python3 -I datasets/ordinances/scripts/extract_ordinances.py [--only id,id] [--jobs 4]
"""
from __future__ import annotations
import argparse, json, subprocess, sys, tempfile, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".pdf-cache"
TEXT = ROOT / "text"
FILE = ROOT / "ordinances.json"
UA = "Mozilla/5.0 (compatible; BetterBARMM-ordinances/1.0)"


def encode(url: str) -> str:
    p = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((p.scheme, p.netloc, urllib.parse.quote(urllib.parse.unquote(p.path), safe="/"), p.query, ""))


def download(url: str, dest: Path) -> bool:
    if dest.exists() and dest.read_bytes()[:5] == b"%PDF-":
        return True
    # curl, not urllib: several LGU servers stall mid-transfer and need the retries.
    r = subprocess.run(["curl", "-sSL", "--retry", "3", "-m", "600", "-A", UA, "-o", str(dest), encode(url)], capture_output=True, text=True)
    ok = r.returncode == 0 and dest.exists() and dest.read_bytes()[:5] == b"%PDF-"
    if not ok:
        print(f"  ! {url} -> {r.stderr.strip() or 'not a PDF'}", file=sys.stderr)
        dest.unlink(missing_ok=True)
    return ok


def pages(pdf: Path) -> int:
    out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
    return next((int(l.split()[1]) for l in out.splitlines() if l.startswith("Pages:")), 0)


def read(pdf: Path) -> tuple[str, str]:
    layer = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
    n = max(pages(pdf), 1)
    # A real text layer runs to hundreds of characters a page; a scan has a stray header at most.
    if len("".join(layer.split())) > 400 * n:
        return layer.replace("\f", "\n\f\n").strip(), "text"
    out: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", "300", "-gray", "-png", str(pdf), f"{tmp}/p"], check=True, capture_output=True)
        for page in sorted(Path(tmp).glob("p-*.png")):
            r = subprocess.run(["tesseract", str(page), "stdout", "-l", "eng", "--psm", "1"], capture_output=True, text=True)
            out.append(r.stdout.strip())
    return "\n\f\n".join(out), "ocr"


def one(entry: dict) -> dict:
    pdf = CACHE / f"{entry['id']}.pdf"
    # An LGU that has since taken its copy down is read from the Internet Archive's.
    if not download(entry.get("archived") or entry["pdf"], pdf):
        return entry
    text, how = read(pdf)
    (TEXT / f"{entry['id']}.txt").write_text(text + "\n")
    print(f"  {entry['id']}: {pages(pdf)} pages, {how}, {len(text):,} chars")
    return {**entry, "pages": pages(pdf), "read": how}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=4)
    args = ap.parse_args()
    CACHE.mkdir(exist_ok=True)
    TEXT.mkdir(exist_ok=True)
    data = json.loads(FILE.read_text())
    only = {s for s in args.only.split(",") if s}
    todo = [e for e in data["ordinances"] if not only or e["id"] in only]
    with ThreadPoolExecutor(args.jobs) as pool:
        done = {e["id"]: e for e in pool.map(one, todo)}
    data["ordinances"] = [done.get(e["id"], e) for e in data["ordinances"]]
    FILE.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    missing = [e["id"] for e in data["ordinances"] if not (TEXT / f"{e['id']}.txt").exists()]
    if missing:
        print("no text yet:", ", ".join(missing), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
