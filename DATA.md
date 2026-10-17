# What this project holds

Every dataset on BetterBARMM, where it came from, and what it can and cannot
answer. Written for contributors, and for Jo — the assistant reads a corpus
built from most of what is listed here, and the last two sections say exactly
which parts.

Counts were measured on 28 September 2026 by reading the files, not by
transcribing an earlier note. Where a figure below disagrees with the data, the
data is right and this file is stale.

---

## The standing distinction

Two kinds of thing live in this repository and they are never mixed.

**A record** is something a body published and we transcribed. It lives in
`datasets/`. Every figure in it traces to a page of a document somebody else is
accountable for — an enacted Act, a COMELEC canvass, a PSA census. A file under
`datasets/` is a claim that this came from a source.

**Written content** is ours. It lives in `packages/` or in an app. The travel
guide is written; so is the primer on the landing site. Nobody publishes an
official inventory of what there is to eat in Maguindanao, so that guide cannot
make the claim a record makes, and it says so on every page that shows it.

The one rule that follows: **an appropriation is not an expenditure.** Every
peso figure on this estate is what Parliament authorised. What was actually
spent is not published by anyone, and is not here. See [Gaps](#what-is-not-here).

---

## Index

| Source | Where | Size | What it is |
| --- | --- | --- | --- |
| Legislation registry | `datasets/bills/` | 578 MB, 631 files | Acts, bills, resolutions, members, committees |
| The two Codes | `datasets/bills/blgc*.json` | 262 KB | Local Governance Code + its IRR |
| Budget | `datasets/budget/` | 86 MB, 25 files | Seven enacted GAABs, FY 2020–2026 |
| Election | `datasets/election/` | 432 KB, 5 files | September 2026 parliamentary result |
| Local government | `datasets/lgu/` | 79 MB, 16 files | Provinces, towns, barangays, officials |
| Accidents | `datasets/accidents/` | small | Accidents and shootings, from news reports; 2019 on |
| Programs & services | `datasets/services/` | small | 35 offices' programs and Citizen's Charter services |
| Directory | `datasets/directory/` | small | Heads, past heads, field offices and phones of the 35 regional offices; emergency lines by town |
| Crafts | `datasets/crafts/` | small | 17 textiles, mats, brass, instruments, carvings and blades, with makers, festivals and free-licence photos |
| Travel guide | `packages/travel-data/` | — | **Written**, not captured |
| Region primer | `packages/primer-data/` | — | **Written**, not captured |

---

## Legislation — `datasets/bills/`

The largest holding. `bangsamoro_registry/` is the structured half, one JSON
file per record, each carrying a citizen summary, key provisions, the stage
ladder with dates, authors, related legislation and a grounded FAQ. The schema
is described in `bangsamoro_registry/manifest.json`.

| | Count | Path |
| --- | --- | --- |
| Bangsamoro Autonomy Acts | 94 | `bangsamoro_registry/baa/` |
| Bills | 192 | `bangsamoro_registry/bills/` |
| Resolutions, adopted | 194 | `bangsamoro_registry/resolutions/adopted/` |
| Resolutions, proposed | — | `bangsamoro_registry/resolutions/proposed/` |
| Members | 156 | `bangsamoro_registry/members/` |
| Committees | 24 | `bangsamoro_registry/committees/` |
| Committee reports | 218 | same file |

Beside it, four flat files:

- **`blgc.json`** — the Bangsamoro Local Governance Code of 2023 (BAA 49),
  **324 sections**, section by section. This is the law that governs local
  government in BARMM; RA 7160, the national Code, applies only suppletorily.
- **`blgc-irr.json`** — its Implementing Rules, promulgated 30 September 2025,
  **155 articles**. IRR article numbers are their own and do not correspond to
  the Code's section numbers. Where the two give different figures, the Code
  prevails.
- **`baa.min.json`** — 89 acts in a compact shape, for the search index.
- **`readings.json`** — 118 readings, the long-form editorial analysis of
  individual measures.
- **`bill-subjects.json`** — 272 bills tagged by subject.

`.pdf-cache/` holds 118 cached source PDFs.

**Caveat.** The registry is not complete and never claims to be. Parliament
publishes more bills than have been read into it.

---

## Budget — `datasets/budget/`

Seven enacted General Appropriations Acts of the Bangsamoro, FY 2020 to FY 2026,
each read line by line from the PDF in `GAAB/`. FY 2020 is BAA 3 — the region's
first appropriations act, and the first Act of any kind after the flag (BAA 1)
and the emblem (BAA 2). There is no earlier budget.

Per year, two files:

- **`BAA{n}_FY{year}_budget.json`** — agencies, special purpose funds, flat
  programs, summary totals.
- **`BAA{n}_FY{year}_line_items.json`** — the line items, with a 38-entry
  taxonomy and a tag index. Between 589 and 1,563 lines a year.

And three derived:

- **`barmm_fy2020_2026.min.json`** (7.8 MB) — all seven years in one file.
- **`trends.json`** — the series a chart draws: region, 55 offices, 37 sectors,
  10 areas. Built by `packages/budget-data/src/build-trends.mts`, which refuses
  to write if any office's latest figure disagrees with the Act it was checked
  against.
- **`trend.json`** — an older, narrower version of the same idea.

**FY 2026, the year now being spent** (`packages/budget-data` exports these as
its top-level `offices`, `programs`, `projects`, `provisions`, `sectors`):

| | |
| --- | --- |
| Total appropriated | ₱114,077,644,141.90 |
| Offices | 44 — 28 agencies, 8 special purpose funds, 8 attached agencies |
| Programs | 246 |
| Itemised projects | 258 |
| Special provisions | 207 |
| Sectors | 38 |

**Across all seven Acts:** ₱613.7 billion, 55 distinct offices.

**Two traps, both real.** Sectors overlap by design and must never be summed —
a sector's total covers many offices and counts money other sectors also count.
And the per-year counts above are FY 2026's, not the span's; printing them
against ₱613.7B claims something false.

**Provenance.** All 44 offices, all 246 programs and all 207 provisions carry
the page of the Act they were printed on. **The 258 projects carry none** — so
"every figure traces to a page" is not a claim this data supports.

---

## Election — `datasets/election/`

The proclaimed result of the parliamentary election of 14 September 2026.

- **`election.min.json`** (271 KB) — the main dataset: 80 elected members, 32
  district races, 13 regional parties, 6 reserved sectoral seats, a 16-event
  timeline, and 20 sources.
- **`election-results.json`** — the canvass, with turnout and a confidence flag.
- **`election-supplement.json`** — party backgrounds, key figures, context.
- **`barmm_2026_developing_stories.json`** — 22-point chronology, 11 developing
  stories, 14 sources.

**Trap.** A member row is one of 80, never all of them. A party's seat total
lives on the party's own row and must be read from there — counting member rows
in a search result reports a party's seats as however many happened to match.

---

## Local government — `datasets/lgu/`

- **`barmm-lgu.json`** — the directory. **5 provinces** (Basilan, Lanao del Sur,
  Maguindanao del Norte, Maguindanao del Sur, Tawi-Tawi) plus **Cotabato City**
  and the **Special Geographic Area**: 7 areas, **108 cities and
  municipalities**, 3 of them cities, **2,180 barangays**.

  **Population needs its caveat every time it is quoted.** The dataset's own
  figure is **4,330,783** — the sum of the areas listed above, on PSA's 2024
  census. It excludes Sulu, which is no longer part of BARMM, and it excludes
  the Special Geographic Area, whose 8 municipalities have no census figure of
  their own yet. **PSA's published BARMM total is 5,691,583 and counts both.**
  The two numbers answer different questions; neither is wrong, and quoting
  either without saying which is.
- **`barangay-officials.json`** (910 KB) — officials across 108 units.
- **`officials-history.json`** (2.1 MB) — elected history for 100 units.
- **`area-spending.json`** — itemised construction tagged to 8 areas across 7
  years. This is the *budget's* geography, not LGU spending.
- **`nta.json`** — each province, city and town's National Tax Allotment,
  FY 2023–2025, from BLGF's SRE.
- **`finances.json`** (270 KB) — every line of BLGF's Statement of Receipts
  and Expenditures for 105 provinces, cities and towns, FY 2016–2025: local
  taxes, NTA, spending by sector, capital outlay, borrowing, interest and
  principal repaid, cash balances. What treasurers **reported spending**, not
  what councils appropriated. Pre-split Maguindanao's province rows sit under
  `former`; Sulu is left out; the 8 Special Geographic Area towns have no rows.
- **`funds.json`** (205 KB) — the rest of BLGF's per-LGU publications, one
  section each: **dependency** (Annual Regular Income and BLGF's NTA-dependency
  ratios, FY 2020–2025 — the median town draws 99.5% of its regular income from
  the NTA); **disasterFund** (the LDRRMF, **appropriated beside spent**, FY 2020
  and 2022–2025 — BLGF's FY 2021 file lists no BARMM LGU); **educationFund**
  (SEF collections and spending by purpose, FY 2020–2025); **propertyRoll**
  (taxable property and RPT collectible, FY 2022 only); **borrowing** (56 DOF
  borrowing certificates to 49 BARMM LGUs, 2022–August 2026 — permission to
  borrow, not loans).
- **`income-class.json`** — each LGU's income class under DOF DO 074-2024
  (effective 2025, RA 11964's five classes) and DO 23-08 (2008). Most BARMM
  LGUs moved up sharply; two kept a higher old class by law (`retained`).
- **`fund-releases.json`** — the few national releases DBM's SARO/NCA registers
  name a BARMM LGU in, FY 2020–2026: mostly Marawi recovery (₱50M–₱730.7M) and
  a handful of LGSF grants. **Thin by necessity:** DBM releases LGSF money to the
  Treasury "per attached Schedule A", and Schedule A is not published.
- **`procurement.json`** — PhilGEPS bids posted and contracts awarded per year,
  FY 2020–2025, for the 57 LGUs registered on PhilGEPS. Totals only; awards are
  contracts, not payments. 2025 looks partial.
- **`coa-audits.json`** — COA audit opinions and total liabilities for **8**
  town-years (FY 2020–2021), all modified opinions. coa.gov.ph sits behind a
  Cloudflare human check; these are Wayback copies. Coverage needs reports
  saved by hand.
- **`sglg.json`** — Seal of Good Local Governance passers, 2022–2024 (14, 27,
  29; checked against DILG's BARMM counts), why 2020, 2021 and 2025 have none,
  incentive amounts, and MILG's Salamat Excellence Award for Leadership under
  `bangsamoroSeal`.
- **`cmci.json`** — DTI competitiveness index scores, ranks and pillars,
  2020–2024 editions (2020 ranks only BARMM's 3 cities).
- **`awards.json`** — 97 other national and regional awards for 39 LGUs:
  Gawad KALASAG, BLGF top performers, LTIA, Galing Pook, Red Orchid, PRIME-HRM
  and MILG's regional awards (`scope: "regional"`). Winner lists only — absence
  is not failure — and `notFound` lists the awards with no BARMM list
  published.

**Not here:** the LGUs' appropriation ordinances, any outstanding-debt figure
per LGU, most COA audits, LGSF releases per LGU, and anything at all for
barangays. See [Gaps](#what-is-not-here).

---

## Accidents — `datasets/accidents/`

A record of a different kind. Nobody publishes a register of accidents in
the region, so `accidents.json` is compiled from **news reports**: one record
per incident, with the date, the kind, the town and where possible the
barangay, the dead, injured and missing as last reported, and every report
it rests on linked. It is a record of what was reported in English or
Filipino and indexed, and the page that draws it says so. A crash nobody
wrote up is not here; a town whose news lives only on Facebook is
under-counted.

| | Path |
| --- | --- |
| The incidents | `accidents.json` |
| The reports they were read from, one file per research pass | `reports/*.json` |
| Town centres, from OpenStreetMap through Nominatim | `municipality-centres.json` |
| The region's outline for the map, PSA's PSGC boundaries without Sulu | `barmm-outline.json` |
| Barangay look-ups, cached | `barangay-centres.json` |
| Outlet addresses recovered for Google News links | `links.json` |
| Later looks at single records — barangay, day, toll, photo — keyed by id | `enrichment/*.json` |
| Build | `scripts/build_accidents.py` |

Six kinds, one colour each on the map — road; sea, lake and river; flood;
fire and explosion; shooting; other — with the finer kind kept on the record.
Shootings are the one deliberate kind carried, because they are the
region's commonest violent death, and a shooting in a clan war or an armed
clash counts like any other; bombings are crimes of another order and stay
out. Weather that hurt nobody is out too: a flood that
displaced families but killed no one is a disaster record, which this is
not. Sulu is not mapped; it left the region in 2024.

A dot sits on the barangay the report named where Nominatim could find it
within 25 km of the town, otherwise on the town's centre, or — for a report
that named only the province, as many shooting headlines do — on the
province's main town (Marawi, Buluan, Datu Odin Sinsuat, Lamitan, Bongao; the
Special Geographic Area's centre, the mean of its towns'); the record says which (`placed`),
and the map draws a province-placed dot faint and leaves it out of the heat. Figures are as the last report gave them;
`null` means no report gave one. Reports from Google News's index keep
Google's link where the outlet's own address could not be recovered;
either way the link reaches the article.

To add a research pass, drop its JSON array into `reports/` in the shape
the existing files use and run the build; it normalises town names
against the LGU directory, folds the fine kinds into the six,
drops anything it cannot place, merges records that describe one incident
(same town, same kind, dates within two days or the same month when only
the month is known, similar headline or the same death toll) and lists what it dropped.

Every record was read against its own articles on 16 October 2026, through a
headless browser that follows Google News links through to the outlet, and
corrected from them (`enrichment/2026-10-16-verify-2019-2024.json`,
`…-zy-verify-2.json`); duplicates the reading turned up are merged in the
`…-dedupe` files. 18 records rest only on pages no automated reader gets past —
Manila Bulletin, MindaNews, Facebook, PNA links that now return 404 — and
stand as first written. `links.json` carries the outlet's own address for
each Google News link the browser resolved.

---

## Programs and services — `datasets/services/`

One record per office of the Bangsamoro Government — the Office of the Chief
Minister, the 15 ministries and 19 attached offices, authorities and
commissions, named and slugged as the budget names them, so each links to its
office on the budget portal. Each holds the office's mandate, its **programs**
(what it runs, who for, how to get it) and its **services** as its Citizen's
Charter lists them (requirements, fee, processing time, where), every item
with the page it was read from. Read on 17 October 2026.

Only 7 offices published a Citizen's Charter that could be read (the Office
of the Chief Minister with the Attorney-General's Office, MSSD, MAFAR, MHSD,
MOST, CSEA); the rest show programs from their own sites and the laws that
created them. Every source link opened when the file was written; three items
whose only source had gone were left out. Two offices' sites carry injected
spam links (MHSD, MENRE) and one is gone (MIPA): none is offered as the
office's website. Audiences are a fixed list of 27 tags, in
`apps/www/app/_lib/services.ts`.

---

## Directory — `datasets/directory/`

The same 35 offices as Programs and services, keyed by the same slugs: who
heads each, with the date and page of the newest official source naming them,
and the phones, emails, address, website and Facebook page the office
publishes. Read on 17 October 2026: 34 heads (the Bangsamoro Agriculture and
Fisheries Training Institute is a bill, not yet an office), 54 numbers in 22
offices, 11 emails.

An email is kept only where an official page or document shows it as text;
most office sites hide theirs from automated readers, and those are not
decoded. The elected Parliament takes office on 30 October 2026, so the Chief
Minister and the cabinet named here are the interim government's. The page's
local governments are not in this file: they are the 2025 winners already in
`datasets/lgu/barmm-lgu.json`.

Beside it, also read on 17 October 2026:

- **`history.json`**: who headed each office before, for 34 of the 35, from
  BARMM releases and news reports. Where no source dates a start or an end,
  `first_seen` and `last_seen` give the months a source first and last shows
  the person in office, and `former` marks a past head whose end is undated.
- **`field-offices.json`**: 52 provincial and field offices of the nine
  ministries, with the head, address and phones each ministry lists. Four
  offices named only "Maguindanao" keep that name; their sources do not say
  which of the two provinces.
- **`emergency.json`**: police, fire, disaster-response, health and town-hall
  lines for 6 provinces and 49 of the towns, each linked to the LGU page, BFP
  or BARMM release, DTI CMCI profile or PhilHealth facility list it came from.
  The Basilan capitol number (source unreadable) and a garbled Paglat RHU
  number are left out.

All four are admin collections under the Directory workspace, so an editor can
correct them and set an office's `checked` date. Barangay officials on the town
pages come from DILG's directory through `@betterbarmm/lgu-data`; their
contacts are not copied.

---

## Crafts — `datasets/crafts/`

17 crafts of the region, read on 17 October 2026: 4 textiles (inaul, malong a
landap, langkit, Yakan tennun), the Sama tepo mat, 2 Tugaya brass pieces, 5
instruments, 3 carvings and 2 blades, plus 6 festivals where they are shown.
Each carries where it is made, its materials, how it is made, named makers and
where a visitor can see it, every claim linked to the page it came from.

Photos are Wikimedia Commons files under free licences (CC0, CC BY, CC BY-SA,
public domain), 37 in all, credited on the page as each licence asks. Commons
serves thumbnails only at fixed widths (250, 330, 500, 960, 1280, 1920); other
widths answer 400. `model` describes the three-dimensional study the site draws
for 9 of the crafts; it is a shape, not a scan. Each image's `tone` is its dominant hue
and saturation, read from the 250px thumbnail (pixels too dark, light or grey
skipped; the rest vote by hue, weighted by saturation), or null for a grey
photo. The dialog builds its colours from it at fixed lightness.

Left out: Maranao and Maguindanaon jewellery (no readable source), Teduray and
Iranun weaving (none either), Sulu's pis syabit and barong (Sulu is no longer in
BARMM). Inaul is woven in both Maguindanao provinces but is tagged
`maguindanao-del-sur`; the Inaul Festival's reporting stops at 2019. The one
price, for inaul, is from February 2018.

---

## Travel — `packages/travel-data/` *(written, not a record)*

21 places, 19 dishes, 7 areas, 7 festivals, 4 itineraries with 18 legs, 7
lodging summaries, 6 gateway points. Every place names the LGU it sits in, and
that slug is resolved against the local government dataset rather than typed
twice.

Deliberately absent: phone numbers, room rates, opening hours, and addresses
beyond the municipality — the fields a guide gets wrong first and a traveller is
most hurt by. The security section is honest about standing advisories.

---

## Region primer — `packages/primer-data/` *(written, not a record)*

The "Discover" chapters on the landing site. It lives in a package rather than
in `apps/www` because two things read it: the site, and Jo.

| Topic | Contents |
| --- | --- |
| `history` | 3 narrative sections, **17-event timeline** from the sultanates to the transition |
| `governance` | 33 detail cards |
| `people` | 3 people groups |
| `culture-places` | 5 detail cards |
| `local-government` | 4 narrative sections |

Also a list of 30 offices, and `bangsamoroParliament` / `bangsamoroDistrictSeats`
for the seat arithmetic the landing page prints.

Still in `apps/www`: `discover-tribes.ts` — 5 tribe profiles (Meranao,
Maguindanaon, Tausug, Yakan, Sama), each with homeland, food, craft, sound and
sources. It imports a photo-key type from the site's media module, so moving it
would drag that along; it is **not** in Jo's corpus.

**This chapter data is in Jo's corpus** as 63 `Background` rows — one per
chapter, one per timeline event, one per detail card, one per people group.

---

## What Jo can actually see

`packages/ai/src/corpus.ts` flattens the above into one searchable array.
**3,610 entries** as of this writing:

| Workspace | Entries | By kind |
| --- | --- | --- |
| legislation | 2,447 | 819 proposed resolutions, 578 resolutions, 477 bills, 324 Code sections, 155 Code rules, 94 acts |
| budget | 801 | 258 projects, 246 programs, 207 rules, 44 offices, 38 sectors, 8 yearly totals |
| election | 132 | 80 members, 32 districts, 13 parties, 6 reserved seats, 1 election |
| lgu | 222 | 105 municipalities, 6 provinces, 4 cities, 1 special area; 105 finance rows (one per province, city and town that files with BLGF) and their regional sum |
| primer | 63 | Background — chapters, timeline events, detail cards, people groups |
| travel | 51 | 21 places, 19 foods, 7 areas, 4 routes |

Each entry is a kind, a title, a one-line note, an address and a search
haystack. Sixteen go to the model per question; nothing else does.

**Roll-up rows.** A corpus of parts cannot be counted by a model shown sixteen
of them, so sums exist as rows of their own: the seven-year budget total, the
region's own counts, and each primer chapter — a chapter is the sum of its
events the way the counts row is the sum of its towns. All are flagged
`rollup`, and two question shapes lift them:

- **COUNTING** — "how many", "how much", "total" — lifts a sum row.
- **SUBJECT** — "history of", "tell me about", "explain" — lifts a chapter.

They are kept apart because they collide: "how many provinces in BARMM" ties
the counts row against the Local Government chapter, and only one of them holds
the number. Add a roll-up whenever a reader will plausibly ask for the whole of
something.

**The grounding rule.** `grounded()` deletes any sentence carrying a figure no
retrieved row states. Bare four-digit years pass, so background and history
survive; peso amounts, percentages and counts do not. Jo may answer beyond the
records from general knowledge — they are the authority, not the limit — but
she may never state a peso amount, a share of the budget, a seat count, a vote
total, or the number, title or date of a measure that no record holds.

---

## What is **not** here

Stated plainly, because the gaps matter more than the holdings.

1. **No expenditure record.** Every budget figure is an appropriation. COA
   audits each office and Parliament sees the findings, but there is no public,
   office-by-office record of what was spent against what was given. This single
   gap is why every figure here is a promise and not a receipt.
2. **No per-LGU budgets, and nothing for barangays.** `finances.json` holds
   what each province, city and town reported spending (BLGF's SRE), not the
   budget its council passed; those ordinances are not published together.
   Barangays file no SRE, and DBM publishes barangay NTA only as a BARMM
   total. BLGF reports outstanding LGU debt only nationally, by lender.
3. **The tribe profiles are not in the corpus.** The 5 profiles in
   `apps/www/app/_components/discover-tribes.ts` are good material on the
   Meranao, Maguindanaon, Tausug, Yakan and Sama, and Jo cannot cite them. They
   carry a photo-key type from the site's media module, which is what has kept
   them out of `packages/primer-data`.
4. **Projects carry no source page.** 258 of them.
5. **The registry is incomplete.** Parliament publishes more than has been read.
6. **No question log.** Nothing records what people actually ask Jo, so which
   roll-up to build next is guesswork.

---

## Searching online

Jo does not search the web. She answers from the corpus, or from what the model
already knows, and nothing else reaches her.

If that changes, the OpenAI key this project uses can reach search-enabled
models — `gpt-5-search-api`, `gpt-4o-search-preview`, `gpt-4o-mini-search-preview`.
Two things would have to be decided first:

- **Where the boundary sits.** `grounded()` exists because a wrong peso figure
  costs this project its entire argument. A web result is not a record, and
  letting one supply a figure would need its own rule.
- **How it is marked.** A reader has to be able to tell a transcribed Act from a
  page found on the internet a moment ago. The estate currently makes that
  distinction by where the file lives; a web result lives nowhere.

---

## Adding a source

1. Put the transcription in `datasets/<workspace>/`, with a `sources` or `note`
   field naming where it came from.
2. Expose it through a `packages/<workspace>-data` package. Apps import the
   package, never the JSON.
3. Add a `check.ts` assertion pinning a figure the source states. If a change
   stops reproducing it, it has stopped reproducing the source.
4. Add entries to `packages/ai/src/corpus.ts` so Jo can reach it, and a
   retrieval assertion in `search.check.ts`.
5. If a reader might ask for a total of it, add a `rollup` row.
