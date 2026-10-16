"""Keep the sweep's items that read like accidents in or near BARMM; drop violence, politics and far-away places.
With --shootings, keep the ones that read like shootings instead: a title that names a gun and a BARMM place, no bomb.

    python3 -I filter_candidates.py SWEEP.jsonl CANDIDATES.json [--shootings]
"""
import json, re, sys, collections
SHOOTINGS = '--shootings' in sys.argv
src, dst = [a for a in sys.argv[1:] if not a.startswith('--')]
rows = [json.loads(l) for l in open(src)]
SHOOT = re.compile(r"\b(shot|shoots?|shooting|gunm[ae]n|gunfire|gunned|strafing|strafed|ambush(?:ed)?|sniper|binaril|pinagbabaril|pamamaril|rido)\b", re.I)
BOMB = re.compile(r"\b(bomb|bombing|IED|grenade|blast|explosion|explode[sd]?|landmine)\b", re.I)
ACC = re.compile(r"\b(accident|crash|crashed|collision|collide[sd]?|mishap|hit-and-run|run over|ran over|rams?|rammed|overturn|flipped|fell into|plunge[sd]?|capsiz|sank|sinks|sinking|drown|rescued|missing fisher|adrift|stranded|fire|blaze|razed|gutted|burn|explosion|explode[sd]?|LPG|firecracker|electrocut|lightning|landslide|flash ?flood|floods?|flooding|food poisoning|collapse[sd]?|aksidente|nabangga|banggaan|bumaligtad|nasunog|sunog|nalunod|lumubog|pumutok|nasawi|patay|sugatan)\b", re.I)
VIOLENCE = re.compile(r"\b(shot|shoot|shooting|gunm[ae]n|gunfire|strafing|strafed|ambush|slain|slay|killed in attack|attack|bomb|bombing|IED|grenade|blast|terror|Abu Sayyaf|BIFF|Dawlah|rido|clan war|kidnap|abduct|encounter|clash|firefight|hostage|murder|stab|rape|drug|shabu|buy-bust|arrested|nabbed|election|poll|vote|campaign|martial law|rebel|MILF|MNLF|military operation|airstrike)\b", re.I)
FAR = re.compile(r"\b(Kidapawan|South Cotabato|Koronadal|General Santos|GenSan|Davao|Zamboanga City|Iligan|Cagayan de Oro|Bukidnon|Sultan Kudarat province|Tacurong|Isulan|Lebak|Kalamansig|Palimbang|Surallah|Polomolok|Tupi|Jolo|Patikul|Indanan|Sulu|Manila|Cebu|Iloilo|Luzon|Visayas|Isabela City|Pagadian|Dipolog|Butuan|Surigao|Nigeria|Australia)\b", re.I)
BARMM = re.compile(r"\b(BARMM|Bangsamoro|Cotabato City|Cotabato|Maguindanao|Lanao del Sur|Lanao|Marawi|Basilan|Lamitan|Tawi-?Tawi|Bongao|Sitangkai|Parang|Datu Odin Sinsuat|Sultan Kudarat|Upi|Kabuntalan|Buluan|Shariff Aguak|Datu Piang|Pagalungan|Datu Paglas|Ampatuan|Mamasapano|Malabang|Wao|Balabagan|Marantao|Saguiaran|Lake Lanao|Maluso|Sumisip|Tipo-Tipo|Panglima Sugala|Mapun|Simunul|Languyan|Polloc|Awang|Kusiong|Pikit|Rio Grande|Liguasan|Ligawasan|Moro Gulf|Illana|Sulu Sea|Celebes|Mindanao)\b", re.I)
keep, drop = [], collections.Counter()
seen = set()
for r in rows:
    t = r['title']
    key = re.sub(r'\W+', ' ', t.lower()).strip()
    if key in seen: drop['dup'] += 1; continue
    seen.add(key)
    if SHOOTINGS:
        if not SHOOT.search(t): drop['no-gun-word'] += 1; continue
        if BOMB.search(t) and not re.search(r'\b(shot|shooting|gunm|gunfire|strafing)\b', t, re.I): drop['bomb'] += 1; continue
        if not BARMM.search(t + ' ' + r.get('description', '')): drop['no-place'] += 1; continue
    elif not ACC.search(t): drop['no-accident-word'] += 1; continue
    if not SHOOTINGS and VIOLENCE.search(t) and not re.search(r'\b(accident|crash|capsiz|drown|LPG|firecracker|electrocut|lightning|landslide|flood|collision|mishap|aksidente|nabangga|nasunog|nalunod|lumubog)\b', t, re.I): drop['violence'] += 1; continue
    if FAR.search(t) and not BARMM.search(re.sub(FAR, '', t)): drop['far'] += 1; continue
    yr = r['pubDate'][-17:-13]
    if yr.isdigit() and int(yr) < (2025 if SHOOTINGS else 2019): drop['too-early'] += 1; continue
    keep.append(r)
print('kept', len(keep), 'dropped', dict(drop), file=sys.stderr)
json.dump(keep, open(dst, 'w'), ensure_ascii=False, indent=0)
