/* One runnable check: `bun packages/budget-data/src/check.ts`.
   The figures here are the Act's own — if a change to this package stops
   reproducing them, it has stopped reproducing the Act. */
import assert from 'node:assert/strict'
import { budget, findOffice, findSector, offices, percent, pesoShort, printedPages, programs, projectKinds, projects, projectsByProvince, provisions, provisionsFor, searchBudget, sectorContents, sectors, slugify, splitAmounts, budgetFor, FISCAL_YEARS, LATEST_YEAR, isFiscalYear } from './index'

assert.equal(budget.fiscalYear, 2026)
assert.equal(budget.total, 114_077_644_141.9)
assert.ok(budget.reconciles)

// 28 agencies + 8 funds + 8 attached agencies.
assert.equal(offices.length, 44)
assert.equal(budget.officeCount, 28)
assert.equal(budget.fundCount, 8)
assert.equal(new Set(offices.map((o) => o.slug)).size, 44, 'slugs must be unique — they are the URLs')

// Largest first, and the largest is education.
assert.equal(offices[0]!.name, 'Ministry of Basic, Higher and Technical Education')
assert.equal(offices[0]!.totals.total, 26_491_916_338)
assert.ok(offices.every((o, i) => i === 0 || offices[i - 1]!.totals.total >= o.totals.total))

// An attached agency is reachable on its own, and knows its parent.
const info = findOffice('bangsamoro-information-office')
assert.ok(info, 'attached agencies get pages of their own')
assert.equal(info.parent?.name, 'Office of the Chief Minister')
assert.equal(info.totals.total, 75_099_266)

// The Act names 253 program rows; 7 of them are headings printed with no
// figures against them, and their children carry the money.
assert.equal(programs.length, 246)
assert.ok(programs.every((program) => program.total > 0 || program.level === 'sub_program'))
assert.ok(programs.every((program) => program.sector && program.tags.includes(program.sector) || program.tags.length > 0))

assert.equal(projects.length, 258)
assert.ok(projects.every((project) => project.id.startsWith('INF-')))
assert.equal(projectKinds[0]?.kind, 'Road', 'roads are the commonest thing being built')
assert.equal(projectKinds.reduce((sum, one) => sum + one.count, 0) >= projects.length, true)

// The special provisions — the half of an appropriation nobody publishes.
assert.equal(provisions.length, 207)
assert.equal(provisions.reduce((sum, one) => sum + one.items.length, 0), 242, 'every sub-item parented')
assert.ok(provisions.every((one) => one.text.length > 0))
assert.ok(provisions.some((one) => one.amount != null), 'some provisions state their own figure')
assert.ok(provisionsFor('ministry-of-health').length > 0)
assert.deepEqual(provisionsFor('not-an-office'), [])
// Nesting deeper than one level is kept as a depth, not a tree.
assert.ok(provisions.some((one) => one.items.some((item) => item.depth > 1)))

// The sectors. Overlapping by design, so they are never summed.
assert.equal(sectors.length, 38)
assert.ok(sectors.every((sector) => sector.slug && sector.description))
assert.equal(findSector('health')?.name, 'Health')
assert.equal(findSector('nope'), undefined)
const health = sectorContents('Health')
assert.ok(health.programs.length > 0 && health.provisions.length > 0)
assert.ok(health.programs.every((program) => program.tags.includes('Health')))

// The one sector the taxonomy names with a slash is shown by the half a reader
// uses, while its tag and its URL stay the dataset's own.
const lump = findSector('lump-sum-special-purpose-fund')
assert.equal(lump?.name, 'Special Purpose Fund')
assert.equal(lump?.tag, 'Lump-sum / Special Purpose Fund')
assert.ok(sectorContents(lump!.tag).programs.length > 0, 'rows are found by tag, not by name')
// Both halves of the tag still find it, whichever one a reader types.
assert.ok(searchBudget('lump').some((hit) => hit.href === '/sectors/lump-sum-special-purpose-fund'))
assert.ok(searchBudget('special purpose').some((hit) => hit.href === '/sectors/lump-sum-special-purpose-fund'))
assert.equal(sectorContents(lump!.name).programs.length, 0, 'the display name tags nothing')

/* The sector chart's note says in English that the three largest sectors come
   to more than the whole Act, which is how it shows that these totals overlap
   and must never be summed. If a later year's tagging stops overlapping that
   far, the sentence is wrong and this is where it says so. */
const funded = sectors.filter((sector) => sector.total > 0)
assert.equal(funded.length, 37, 'one of the 38 holds rules rather than money')
assert.ok(
	funded.slice(0, 3).reduce((sum, one) => sum + one.total, 0) > budget.total,
	'the three largest sectors must still exceed the Act, or the chart note is wrong',
)
assert.equal(projectsByProvince.length, 7, "the Act groups the projects under seven provinces")
assert.ok(projects.every((p) => p.province))

// Every program points at an office that exists.
for (const program of programs) assert.ok(findOffice(program.officeSlug), `no office for ${program.office}`)

assert.equal(slugify('Ministry of Basic, Higher and Technical Education'), 'ministry-of-basic-higher-and-technical-education')
assert.equal(pesoShort(26_491_916_338), '₱26.5 billion')
assert.equal(pesoShort(75_099_266), '₱75.1 million')
// Precision follows the unit, not the size of the number: a tenth of a billion
// is ₱100M and always shown; a tenth of a hundred million is not.
assert.equal(pesoShort(budget.total), '₱114.1 billion')
assert.equal(pesoShort(958_400_000), '₱958 million')
assert.equal(pesoShort(1_000_000_000), '₱1 billion')
assert.equal(percent(23.223), '23.2%')

// A rule's amounts are found, and its words are left alone.
assert.deepEqual(splitAmounts('The amount of Four Hundred Eighty Million Pesos (₱480,000,000.00) herein'), [
	{ text: 'The amount of Four Hundred Eighty Million Pesos (', amount: false },
	{ text: '₱480,000,000.00', amount: true },
	{ text: ') herein', amount: false },
])
/* The peso mark is not always ₱. Across the seven Acts the provisions write it
   ₱ 709 times, as a bare P 521 and as PhP 21, and the Act groups some figures
   with a space after each comma. All of it is money and all of it is marked. */
assert.deepEqual(splitAmounts('Pesos (P1,300,000.00) herein'), [
	{ text: 'Pesos (', amount: false },
	{ text: 'P1,300,000.00', amount: true },
	{ text: ') herein', amount: false },
])
assert.deepEqual(splitAmounts('in the amount of P 4, 238, 704, 833.54 shall'), [
	{ text: 'in the amount of ', amount: false },
	{ text: 'P 4, 238, 704, 833.54', amount: true },
	{ text: ' shall', amount: false },
])
assert.deepEqual(splitAmounts('a PhP65.91 billion budget').filter((one) => one.amount), [
	{ text: 'PhP65.91', amount: true },
])
assert.deepEqual(splitAmounts('(₱1, 777, 977,996.03) herein').filter((one) => one.amount), [
	{ text: '₱1, 777, 977,996.03', amount: true },
])

// Numbers that are not money are left alone with the words (user decision).
assert.deepEqual(splitAmounts('not less than 3.5% within 30 days'), [
	{ text: 'not less than 3.5% within 30 days', amount: false },
])
// A word ending in P is not money, so a bare P must start on a word boundary.
assert.deepEqual(splitAmounts('the GAAP 2024 rules'), [{ text: 'the GAAP 2024 rules', amount: false }])

/* Every provision in every Act, not a sample: the split must give the text back
   exactly, or a rule is being re-written on the way to the page. */
for (const fy of FISCAL_YEARS)
	for (const one of budgetFor(fy).provisions)
		assert.equal(
			splitAmounts(one.text)
				.map((part) => part.text)
				.join(''),
			one.text,
			`FY ${fy}: ${one.id} does not survive the split`,
		)
assert.deepEqual(splitAmounts('no amounts here'), [{ text: 'no amounts here', amount: false }])
// Every part is kept, so the rule still reads as the Act wrote it.
for (const one of provisions.slice(0, 40))
	assert.equal(splitAmounts(one.text).map((part) => part.text).join(''), one.text)

/* ---- Both fiscal years ------------------------------------------------ */

// The bare exports are the latest year, so nothing that imported them before
// the second Act arrived is looking at a different budget now.
assert.equal(LATEST_YEAR, 2026)
assert.deepEqual([...FISCAL_YEARS], [2026, 2025, 2024, 2023, 2022, 2021, 2020])
assert.equal(budgetFor(2026).budget.total, budget.total)
assert.equal(budgetFor(undefined).budget.total, budget.total, 'no year asked for is the latest year')
assert.equal(budgetFor('nonsense').budget.total, budget.total, 'a junk ?fy= falls back, never throws')
assert.equal(budgetFor('2025').budget.fiscalYear, 2025, 'the query string arrives as a string')
assert.ok(isFiscalYear(2025) && isFiscalYear('2026') && isFiscalYear(2024) && isFiscalYear(2023) && isFiscalYear(2022) && isFiscalYear(2021) && isFiscalYear(2020))
assert.ok(!isFiscalYear(2019) && !isFiscalYear('') && !isFiscalYear(undefined))

const fy25 = budgetFor(2025)
assert.equal(fy25.budget.total, 94_411_666_856.24)
assert.ok(fy25.budget.reconciles)
// The extraction names the FY 2026 Act in FY 2025's short title; the number is
// rebuilt from `source_document`, which has it right.
assert.equal(fy25.budget.act, 'BAA No. 65 (FY 2025 GAAB)')
assert.ok(fy25.budget.actLong.includes('Act No. 65'))
assert.equal(fy25.budget.pdfPageOffset, 2, "FY 2025's PDF runs two ahead, not three")
assert.equal(fy25.offices.length, 40)
assert.equal(fy25.programs.length, 249)
assert.equal(fy25.projects.length, 645)
assert.equal(fy25.provisions.length, 202)
assert.equal(new Set(fy25.offices.map((o) => o.slug)).size, 40, 'slugs are the URLs')

const fy24 = budgetFor(2024)
assert.equal(fy24.budget.total, 98_467_200_000)
assert.ok(fy24.budget.reconciles)
// The same copy-paste as FY 2025: the extraction calls it the FY 2026 Act.
assert.equal(fy24.budget.act, 'BAA No. 56 (FY 2024 GAAB)')
assert.ok(fy24.budget.actLong.includes('Act No. 56'))
assert.equal(fy24.offices.length, 39)
assert.equal(fy24.programs.length, 234)
assert.equal(fy24.projects.length, 905)
assert.equal(fy24.provisions.length, 199)
assert.equal(new Set(fy24.offices.map((o) => o.slug)).size, 39, 'slugs are the URLs')
for (const program of fy24.programs)
	assert.ok(fy24.findOffice(program.officeSlug), `no FY2024 office for ${program.office}`)

const fy23 = budgetFor(2023)
assert.equal(fy23.budget.total, 85_359_315_687)
assert.ok(fy23.budget.reconciles)
// Every extraction so far carries the FY 2026 Act's number in `short_title`.
assert.equal(fy23.budget.act, 'BAA No. 32 (FY 2023 GAAB)')
assert.ok(fy23.budget.actLong.includes('Act No. 32'))
assert.equal(fy23.offices.length, 38)
assert.equal(fy23.programs.length, 218)
assert.equal(fy23.projects.length, 715)
assert.equal(fy23.provisions.length, 178)

/* The same three faults in every extraction, so they are asserted for all of
   them at once rather than year by year: the slugs are the URLs and must be
   unique, every program must point at an office that year actually has, and no
   Act may claim another Act's number. */
for (const fy of FISCAL_YEARS) {
	const year = budgetFor(fy)
	const slugs = new Set(year.offices.map((one) => one.slug))
	assert.equal(slugs.size, year.offices.length, `FY ${fy} has a duplicate office slug`)
	for (const program of year.programs)
		assert.ok(year.findOffice(program.officeSlug), `FY ${fy}: no office for ${program.office}`)
	const number = year.budget.actLong.match(/Act No\. (\d+)/)?.[1]
	assert.ok(number && year.budget.act.includes(`No. ${number}`), `FY ${fy} cites the wrong Act`)
	assert.equal(year.sectors.length, 38, `FY ${fy} taxonomy is not the same 38 tags`)
}

/* Each Act states its own PDF-to-printed-page offset and they are not the
   same. Read off `structure_notes` rather than listed beside the imports, so
   these are the Acts' own numbers and not a hand-kept table that can drift. */
assert.equal(budgetFor(2026).budget.pdfPageOffset, 3)
assert.equal(budgetFor(2025).budget.pdfPageOffset, 2)
assert.equal(fy24.budget.pdfPageOffset, 2)
assert.equal(fy23.budget.pdfPageOffset, 2)
assert.equal(budgetFor(2022).budget.pdfPageOffset, 2)
assert.ok(
	FISCAL_YEARS.every((fy) => budgetFor(fy).budget.pdfPageOffset > 0),
	'an offset of zero means the note was not found, not that the PDF matches',
)

/* Four of the five Acts reconcile with their own Section 1. FY 2022 does not,
   and that is the Act's fault rather than the extraction's — its printed
   section totals come to ₱47,870.72 less than the figure Section 1 states.
   Asserted rather than waved through, because the site's whole claim is that
   its figures are the Act's: a year that stops reconciling silently would be
   indistinguishable from a broken extraction. */
for (const fy of [2026, 2025, 2024, 2023, 2021])
	assert.ok(budgetFor(fy).budget.reconciles, `FY ${fy} stopped reconciling`)

const fy22 = budgetFor(2022)
assert.equal(fy22.budget.reconciles, false, 'FY 2022 does not add up, and the page says so')
assert.equal(fy22.budget.total, 79_862_015_000, "the headline is Section 1's own figure")
assert.equal(fy22.budget.totals.total, 79_861_967_129.28, 'the tables are the sections\' own')
assert.equal(
	Math.round((fy22.budget.total - fy22.budget.totals.total) * 100) / 100,
	47_870.72,
	'the gap the Act prints, to the centavo',
)
assert.equal(fy22.budget.act, 'BAA No. 23 (FY 2022 GAAB)')
assert.equal(fy22.offices.length, 33)
assert.equal(fy22.programs.length, 255)
assert.equal(fy22.projects.length, 889)
assert.equal(fy22.provisions.length, 150)

const fy21 = budgetFor(2021)
assert.equal(Math.round(fy21.budget.total), 75_628_681_748)
assert.equal(fy21.budget.act, 'BAA No. 15 (FY 2021 GAAB)')
assert.equal(fy21.offices.length, 26)
assert.equal(fy21.programs.length, 253)
assert.equal(fy21.projects.length, 773)
assert.equal(fy21.provisions.length, 113)

/* FY 2020 is the first Bangsamoro budget and the roughest Act of the seven:
   its Section 1 states no aggregate at all, so there is no stated figure to
   reconcile against and `reconciles_with_section_1` is null rather than false.
   The total shown is the sum of its own 21 sections, which is the figure the
   Act's own introduction cites. */
const fy20 = budgetFor(2020)
assert.equal(fy20.budget.statesTotal, false, 'BAA No. 3 states no aggregate')
assert.equal(fy20.budget.reconciles, false, 'null is not "it reconciles"')
assert.equal(fy20.budget.total, 65_916_467_688.46, "the sections' own sum stands in")
assert.equal(fy20.budget.total, fy20.budget.totals.total)
assert.ok(fy20.budget.reconciliationNote?.includes('no aggregate figure'))
assert.equal(fy20.budget.act, 'BAA No. 3 (FY 2020 GAAB)')
assert.equal(fy20.offices.length, 21)
assert.equal(fy20.programs.length, 197)
assert.equal(fy20.projects.length, 241)
assert.equal(fy20.provisions.length, 52)
// Shares are still numbers, which is the point of falling back rather than
// carrying the null through every division on the page.
assert.ok(fy20.offices.every((one) => Number.isFinite(one.share) && one.share > 0))

/* Every other Act states its own total, and five of them add up to it. */
for (const fy of [2026, 2025, 2024, 2023, 2022, 2021])
	assert.ok(budgetFor(fy).budget.statesTotal, `FY ${fy} should state a Section 1 figure`)

/* A year that does not reconcile must carry the note explaining it, or the
   page has a discrepancy it cannot describe. */
for (const fy of FISCAL_YEARS) {
	const { budget: one } = budgetFor(fy)
	assert.equal(
		one.reconciles,
		one.reconciliationNote === null,
		`FY ${fy}: a year either adds up or says why not`,
	)
	assert.ok(one.total > 0 && Number.isFinite(one.total), `FY ${fy} has no usable total`)
}

// The three totals are the ones the home page's trend chart draws.
assert.deepEqual(
	FISCAL_YEARS.map((fy) => Math.round(budgetFor(fy).budget.total)),
	[114_077_644_142, 94_411_666_856, 98_467_200_000, 85_359_315_687, 79_862_015_000, 75_628_681_748, 65_916_467_688],
	'FY 2025 is a dip between FY 2024 and FY 2026, not a typo',
)

// The two years are separate objects, not one leaking into the other.
assert.notEqual(fy25.budget.total, budgetFor(2026).budget.total)
assert.ok(fy25.offices[0]!.totals.total !== offices[0]!.totals.total)
assert.ok(fy25.findOffice('ministry-of-basic-higher-and-technical-education'))
assert.ok(fy25.sectorContents('Health').programs.length > 0)
assert.ok(fy25.searchBudget('health').length > 0)

// Every FY 2025 program points at an office that exists in FY 2025.
for (const program of fy25.programs)
	assert.ok(fy25.findOffice(program.officeSlug), `no FY2025 office for ${program.office}`)

/* ---- Where a project is, when the Act does not say ---------------------- */

/* FY 2025's "Installation of Solar Street Lights" names no place. The
   extraction filed it under the Cotabato City heading it fell beneath, which
   put ₱520 million — the largest project in that Act — into a city the Act
   never mentions for it. It is corrected to Region-wide, and asserted here
   because a correction nothing checks is a correction that gets re-broken. */
const fy25projects = budgetFor(2025)
const solar = fy25projects.projects.find((one) => one.id === 'INF-0645')
assert.ok(solar, 'the solar street lights row is still in the Act')
assert.equal(solar.amount, 520_000_000)
assert.equal(solar.province, 'Region-wide')
assert.ok(!/,/.test(solar.project), 'it still names no place; if it gained one, drop the override')

// Re-placing is not re-totalling: the year's projects come to what they did.
assert.equal(fy25projects.projectsTotal, 10_196_700_000)
const cotabato = fy25projects.projectsByProvince.find((one) => one.province === 'Cotabato City')
assert.equal(cotabato?.total, 740_250_000)
assert.equal(cotabato?.projects.length, 74)

/* No other year needs the override: every other place-less name carries its
   municipality inside it, so the list stays one row long until an Act says
   otherwise. */
for (const fy of FISCAL_YEARS)
	for (const one of budgetFor(fy).projects)
		assert.ok(one.province, `FY ${fy}: ${one.id} has no area at all`)

/* ---- Areas are provinces, not engineering districts -------------------- */

/* The Act files construction under the ministry's districts. "Lanao Del Sur I"
   and "Lanao Del Sur II" are one province and are merged; "Maguindanao del
   Norte" and "Maguindanao del Sur" are two provinces and are not. Asserted as
   a whole set so a new Act's spelling fails here rather than appearing as a
   quietly separate column. */
const KNOWN_AREAS = new Set([
	'Basilan',
	'Sulu',
	'Tawi-Tawi',
	'Maguindanao',
	'Maguindanao del Norte',
	'Maguindanao del Sur',
	'Lanao del Sur',
	'Special Geographic Area',
	'Cotabato City',
	'Region-wide',
])

for (const fy of FISCAL_YEARS)
	for (const group of budgetFor(fy).projectsByProvince) {
		assert.ok(KNOWN_AREAS.has(group.province), `FY ${fy}: unmapped area "${group.province}"`)
		assert.ok(
			!/ I{1,3}$/i.test(group.province),
			`FY ${fy}: "${group.province}" is still a district, not a province`,
		)
	}

// The districts of one province landed in one place.
assert.ok(budgetFor(2022).projectsByProvince.some((one) => one.province === 'Lanao del Sur'))
assert.ok(!budgetFor(2022).projectsByProvince.some((one) => /Lanao Del Sur I/i.test(one.province)))

/* The two Maguindanaos stay apart: the province split in 2022, so the one
   before it and the two after are three places rather than one renamed. */
const mag2026 = budgetFor(2026).projectsByProvince.map((one) => one.province)
assert.ok(mag2026.includes('Maguindanao del Norte') && mag2026.includes('Maguindanao del Sur'))
assert.ok(!mag2026.includes('Maguindanao'))
assert.ok(budgetFor(2021).projectsByProvince.some((one) => one.province === 'Maguindanao'))

// Merging areas moves no money.
for (const fy of FISCAL_YEARS) {
	const year = budgetFor(fy)
	assert.equal(
		Math.round(year.projectsByProvince.reduce((sum, one) => sum + one.total, 0)),
		Math.round(year.projectsTotal),
		`FY ${fy}: the areas no longer sum to the projects`,
	)
}

/* ---- The year-on-year series ------------------------------------------ */

/* `trends.json` is a build step, so it can be stale in a way the Acts cannot.
   These assert it still agrees with them: a chart that disagrees with the
   figure printed beside it is worse than no chart, because the chart is the
   part a reader believes without checking. */
const trends = (await import('../../../datasets/budget/trends.json', { with: { type: 'json' } }))
	.default as unknown as {
	meta: { years: number[]; notes: string[] }
	region: [number, number][]
	offices: { slug: string; name: string; series: [number, number][] }[]
	sectors: { slug: string; name: string; series: [number, number][] }[]
	areas: { slug: string; name: string; series: [number, number][] }[]
}

assert.deepEqual(trends.meta.years, [...FISCAL_YEARS].sort((a, b) => a - b))
assert.equal(trends.region.length, FISCAL_YEARS.length)
for (const [fy, total] of trends.region)
	assert.equal(total, Math.round(budgetFor(fy).budget.total * 100) / 100, `region FY ${fy}`)

// Every office line ends where that Act says it does.
for (const line of trends.offices) {
	const [fy, total] = line.series.at(-1)!
	const office = budgetFor(fy).findOffice(line.slug)
	assert.ok(office, `trends names an office FY ${fy} does not have: ${line.slug}`)
	assert.equal(Math.round(office.totals.total * 100) / 100, total, `${line.slug} FY ${fy}`)
}

/* Years run forward and are never repeated. A single point is allowed: five
   funds are printed in FY 2026 only, and dropping them would take a quarter of
   that year out of the file. Drawing one column is the chart's problem. */
for (const group of [trends.offices, trends.sectors, trends.areas])
	for (const line of group) {
		assert.ok(line.series.length > 0, `${line.slug} has no points`)
		assert.equal(new Set(line.series.map(([fy]) => fy)).size, line.series.length, line.slug)
		assert.deepEqual(
			line.series.map(([fy]) => fy),
			[...line.series.map(([fy]) => fy)].sort((a, b) => a - b),
			`${line.slug} is out of order`,
		)
	}

/* The offices of one year are a partition of that year; the sectors are not.
   Asserted because it is what a reader of this file is most likely to get
   wrong, and the notes beside it are only prose.

   Every year, not a sample: this is the property that broke when attached
   agencies were left out, and it broke silently. */
const sumAt = (group: { series: [number, number][] }[], fy: number) =>
	group.flatMap((line) => line.series.filter(([year]) => year === fy)).reduce((sum, [, total]) => sum + total, 0)

for (const fy of FISCAL_YEARS) {
	const { budget: one } = budgetFor(fy)
	// FY 2022's own sections fall ₱47,870.72 short of its Section 1, so the
	// offices sum to the sections rather than to the headline.
	const expected = one.reconciles ? one.total : one.totals.total
	assert.ok(
		Math.abs(sumAt(trends.offices, fy) - expected) < 1,
		`FY ${fy}: office lines do not sum to the Act`,
	)
	assert.ok(sumAt(trends.sectors, fy) > expected, `FY ${fy}: sectors overlap and must exceed it`)
	assert.ok(sumAt(trends.areas, fy) < expected, `FY ${fy}: areas are projects, a slice of the whole`)
}

// Page numbers are the Act's own, three behind the PDF's, and runs collapse.
assert.equal(printedPages([139, 140, 141, 145]), '136–138, 142')
assert.equal(printedPages([10, 10, 9]), '6–7', 'duplicates and disorder should still collapse')
assert.equal(printedPages([1, 2]), null, 'pages before the Act starts are not page -2 and -1')
assert.equal(printedPages(undefined), null)
assert.ok(printedPages(offices[0]!.sourcePages), 'the largest office should name its pages')

// The finder puts the sector above the office above its programs.
const found = searchBudget('education')
assert.equal(found[0]?.type, 'sector', `expected the Education sector first, got ${found[0]?.type}`)
assert.ok(found.some((hit) => hit.type === 'office'))
assert.ok(searchBudget('constituency').some((hit) => hit.type === 'provision'))
assert.ok(searchBudget('bridge').some((hit) => hit.type === 'project'))
assert.ok(searchBudget('basilan').some((hit) => hit.type === 'project'))
assert.deepEqual(searchBudget('a'), [], 'one letter is not a search')

// The named construction projects are a subset of the Act's capital outlay, in
// every year. The home page draws a band of "capital with no project named" by
// subtracting one from the other, so a year where the projects outran the class
// they belong to would not be a rounding quirk — it would mean the projects are
// being read off the wrong figure and the band is fiction.
for (const fy of FISCAL_YEARS) {
	const year = budgetFor(fy)
	const capital = year.budget.totals.capital_outlays
	assert.ok(
		year.projectsTotal <= capital,
		`FY ${fy}: named projects (${pesoShort(year.projectsTotal)}) exceed capital outlay (${pesoShort(capital)})`,
	)
	assert.ok(year.projects.length > 0, `FY ${fy} names no construction project at all`)
}

console.log(
	'budget-data ok —',
	offices.length, 'offices,',
	programs.length, 'programs,',
	projects.length, 'projects,',
	provisions.length, 'provisions,',
	sectors.length, 'sectors',
)
