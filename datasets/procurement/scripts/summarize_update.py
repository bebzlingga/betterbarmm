"""One line on what changed between two versions of philgeps.json, for the
editor deciding whether to approve a nightly update.

    python3 summarize_update.py old.json new.json
    → 562 new notices (₱1.2B) · 87 open for bids · 14 newly awarded · 3 offices new
"""
import json
import sys


def load(path):
    d = json.load(open(path))
    names = [e['name'] for e in d['entities']]
    open_col = d['columns'].index('open') if 'open' in d['columns'] else None
    notices = {(n[0], n[1]): n for n in d['notices']}
    return d, names, open_col, notices


def summarize(old_path, new_path):
    _, old_names, _, old = load(old_path)
    _, new_names, open_col, new = load(new_path)
    added = [n for k, n in new.items() if k not in old]
    gone = [k for k in old if k not in new]
    awarded = sum(1 for k, n in new.items() if k in old and len(n[10]) > len(old[k][10]))
    is_open = sum(1 for n in new.values() if open_col is not None and n[open_col])
    budget = sum(n[5] or 0 for n in added)
    parts = [f'{len(added):,} new notices (₱{budget / 1e9:.2f}B)' if budget >= 1e9 else f'{len(added):,} new notices (₱{budget / 1e6:.1f}M)']
    if is_open:
        parts.append(f'{is_open} open for bids')
    if awarded:
        parts.append(f'{awarded} newly awarded')
    if gone:
        parts.append(f'{len(gone)} no longer listed')
    new_offices = len(set(new_names) - set(old_names))
    if new_offices:
        parts.append(f'{new_offices} offices new')
    return ' · '.join(parts)


if __name__ == '__main__':
    print(summarize(sys.argv[1], sys.argv[2]))
