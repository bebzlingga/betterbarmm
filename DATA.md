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
| Local government | `datasets/lgu/` | 78 MB, 10 files | Provinces, towns, barangays, officials |
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

**Not here:** the budgets of the LGUs themselves. See [Gaps](#what-is-not-here).

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
| lgu | 116 | 105 municipalities, 6 provinces, 4 cities, 1 special area |
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
2. **No per-LGU budgets.** The budgets of individual municipalities are not in
   this repository. The real source is BLGF's Statement of Receipts and
   Expenditures (1992–2024); the ingestion pipeline has not been built.
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
