#!/usr/bin/env python3
"""Resolve and cache the scanned PDF behind every measure.

Parliament publishes each bill and act as a scan — image only, no text layer —
linked from the measure's own page. This walks the pages the index already
gave us, records the PDF URL in a manifest, and optionally downloads the file
into a local cache so it can be read page by page.

The manifest is committed; the PDFs are not. They run ~2 MB each and well over
a gigabyte in total, and they are Parliament's to serve, not ours to vendor.

    python3 datasets/bills/scripts/fetch_measure_pdfs.py --kind bills [--download] [--limit N]
"""
from __future__ import annotations
import argparse, json, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "bangsamoro_registry"
CACHE = ROOT / ".pdf-cache"
HEADERS = {"User-Agent": "BetterBARMM-registry/1.0 (+https://betterbarmm.com) python-urllib"}
PDF_RE = re.compile(r'href="(https://parliament\.bangsamoro\.gov\.ph/wp-content/uploads/[^"]+\.pdf)"', re.I)

def encode(url: str) -> str:
    """Percent-encode the path and query.

    Some uploads carry a non-ASCII character in the filename — an en-dash in
    "Bill-No.-123–MP-Name.pdf" — and urllib builds the request line with
    `str.encode("ascii")`, which raises rather than escaping it. The host and
    scheme are left alone; only the parts that may carry one are quoted.
    """
    parts = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit((
        parts.scheme,
        parts.netloc,
        urllib.parse.quote(parts.path, safe="/%"),
        urllib.parse.quote(parts.query, safe="=&%"),
        parts.fragment,
    ))


def get(url: str, tries: int = 3) -> bytes | None:
    url = encode(url)
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            if attempt == tries - 1:
                print(f"  ! {url} -> {exc}", file=sys.stderr)
                return None
            time.sleep(2 * (attempt + 1))
    return None

def sources(kind: str):
    """(number, page_url) for each measure of this kind."""
    if kind == "bills":
        idx = json.loads((REGISTRY / "bills" / "official_index.json").read_text())
        for row in idx["bills"]:
            if row.get("url"):
                yield row["number"], row["url"]
    else:
        idx = json.loads((REGISTRY / "baa" / "official_index.json").read_text())
        for row in idx["acts"]:
            if row.get("url"):
                yield row["number"], row["url"]

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", choices=["bills", "acts"], default="bills")
    ap.add_argument("--download", action="store_true")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--delay", type=float, default=0.6)
    args = ap.parse_args()

    out = REGISTRY / args.kind.replace("acts", "baa") / "pdf_manifest.json"
    manifest = json.loads(out.read_text())["measures"] if out.exists() else {}

    rows = list(sources(args.kind))
    if args.limit:
        rows = rows[: args.limit]

    for i, (number, page_url) in enumerate(rows, 1):
        key = str(number)
        if key not in manifest:
            html = get(page_url)
            if html is None:
                continue
            found = PDF_RE.findall(html.decode("utf-8", "replace"))
            # The measure's own scan, not a seal or an unrelated attachment.
            pdf = next((u for u in found if re.search(r"/(Bill|BAA|Act)[-_. ]", u, re.I)), None) or (found[0] if found else None)
            manifest[key] = {"page": page_url, "pdf": pdf}
            print(f"[{i}/{len(rows)}] {args.kind} {number}: {'ok' if pdf else 'NO PDF'}")
            time.sleep(args.delay)

        pdf = manifest[key].get("pdf")
        if args.download and pdf:
            dest = CACHE / args.kind / f"{number}.pdf"
            if not dest.exists():
                dest.parent.mkdir(parents=True, exist_ok=True)
                blob = get(pdf)
                if blob:
                    dest.write_bytes(blob)
                    print(f"    downloaded {dest.name} ({len(blob)//1024} KB)")
                time.sleep(args.delay)

        out.write_text(json.dumps({
            "source": "parliament.bangsamoro.gov.ph measure pages",
            "note": "PDF links only. The files are scans with no text layer and are not vendored into this repo.",
            "measures": manifest,
        }, indent=1, ensure_ascii=False))
    print(f"manifest: {out} ({len(manifest)} measures)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
