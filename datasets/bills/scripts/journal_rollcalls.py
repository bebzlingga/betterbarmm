"""Read the roll call of every cached plenary journal and write who was named into sessions.json.

Each journal lists every Member by name under headings: present in the hall, present virtually, appeared
after the roll call, absent, and on official business or leave (or who notified the Secretary-General).
This writes `attended` (answered the roll) and `late` (appeared after it) on each journal's attendance and
adds anyone on official business or leave missing from `onLeave`. `absent` and the stated count are left
as they were read; the script checks them and prints any sitting where the names disagree.

Only the first roll call is read, the sitting the journal's first date names.

    python3 datasets/bills/scripts/journal_rollcalls.py            # check and write
    python3 datasets/bills/scripts/journal_rollcalls.py --check    # check only
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDFS = ROOT / '.pdf-cache' / 'journals'
SESSIONS = ROOT / 'bangsamoro_registry' / 'journal' / 'sessions.json'

ITEM = re.compile(r'(?:^|\s{2,})(\d{1,3})\s*[.)]\s*((?:Hon\.|HON\.|MP|Atty\.|Dr\.)?[^\d]+?)(?=\s{2,}\d{1,3}\s*[.)]\s*\S|$)')
FOOTER = re.compile(r'^[\d\s|]+(JN\s*\d+)?$', re.I)
SUFFIX = re.compile(r'^(Jr|Sr|II|III|IV)\.?$', re.I)


def kind(heading: str):
	h = heading.lower()
	if 'after the roll' in h or 'appeared after' in h or 'arrived' in h:
		return 'late'
	if 'absent' in h and 'notified' not in h:
		return 'absent'
	if any(w in h for w in ('official business', 'notified', 'leave', 'sick', 'excused')):
		return 'excused'
	if 'present' in h or 'responded' in h:
		return 'present'
	return None


def given_first(name: str) -> str:
	"""The 2019 journals print "Ali, Lanang, Jr. T."; the rest print "Lanang T. Ali, Jr.". Return the second form."""
	parts = [p.strip() for p in name.split(',') if p.strip()]
	if len(parts) < 2 or (len(parts) == 2 and SUFFIX.match(parts[1])):
		return name
	surname, rest = parts[0], ' '.join(parts[1:]).split()
	suffix = [w for w in rest if SUFFIX.match(w)]
	given = ' '.join(w for w in rest if not SUFFIX.match(w))
	return f'{given} {surname}' + (f', {suffix[0].rstrip(".").capitalize()}.' if suffix else '')


def roll_call(pdf: Path):
	text = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], capture_output=True, text=True, check=True).stdout
	start = re.search(r'ROLL\s*CALL', text)
	if not start:
		return None
	sec = text[start.end():]
	quorum = re.search(r'quorum', sec, re.I)
	sec = sec[: quorum.end() + 200] if quorum else sec[:8000]
	stated = re.search(r'With\s+[a-z\- ]+\((\d+)\)', sec, re.I)
	out = {'present': [], 'late': [], 'absent': [], 'excused': []}
	heading, cur = '', None
	for line in sec.splitlines():
		s = line.strip()
		if not s or 'MERGEFORMAT' in s or FOOTER.match(s):
			continue
		items = ITEM.findall(line)
		if items and re.match(r'^\s*\d{1,3}\s*[.)]\s*(Hon|MP|[A-Z])', line):
			if heading.strip():
				# A heading the reader does not know (e.g. "appeared on the second day") ends the list it was filling.
				cur = kind(heading) if len(heading.strip()) > 25 else (kind(heading) or cur)
				heading = ''
			for _, n in items:
				n = re.sub(r'^(Hon\.|MP|Atty\.|Dr\.)\s*', '', n.strip(), flags=re.I).strip(' ,;')
				if n.isupper():
					n = n.title()
				if cur and n:
					out[cur].append(given_first(n))
		elif s.lower().startswith('with ') and 'quorum' in sec[sec.find(s) : sec.find(s) + 300].lower():
			break
		else:
			heading += ' ' + s
	out['stated'] = int(stated.group(1)) if stated else None
	return out


def key(name: str) -> str:
	return re.sub(r'[^a-z]', '', re.sub(r'\(.*?\)|^(MP|Hon\.)\s*', '', name).lower())


def main():
	check_only = '--check' in sys.argv
	data = json.loads(SESSIONS.read_text())
	problems = 0
	for j in data['journals']:
		pdf = PDFS / f"{j['key']}.pdf"
		a = j.get('attendance')
		if not a or not pdf.exists():
			continue
		r = roll_call(pdf)
		if not r:
			print(j['key'], 'no roll call found')
			problems += 1
			continue
		named = r['present'] + r['late'] + r['absent'] + r['excused']
		if len(named) != len({key(n) for n in named}):
			print(j['key'], 'the journal names a Member twice (counted once, by the first list)')
			problems += 1
		if a.get('present') not in (len(r['present']), len(r['present']) + len(r['late'])):
			print(j['key'], f"stated {a.get('present')}, roll call names {len(r['present'])} (+{len(r['late'])} late)")
			problems += 1
		if len(r['absent']) != len(a.get('absent') or []):
			print(j['key'], f"absent: journal names {len(r['absent'])}, dataset {len(a.get('absent') or [])}")
			problems += 1
		a['attended'] = [f'MP {n}' for n in r['present']]
		a['late'] = [f'MP {n}' for n in r['late']]
		have = {key(n.replace(' (official business)', '')) for n in a.get('onLeave') or []}
		for n in r['excused']:
			if key(n) not in have and not any(key(n)[-6:] in h for h in have):
				a.setdefault('onLeave', []).append(f'MP {n}')
	print(f'{problems} problem(s)')
	if not check_only:
		SESSIONS.write_text(json.dumps(data, indent=1, ensure_ascii=False) + '\n')


if __name__ == '__main__':
	main()
