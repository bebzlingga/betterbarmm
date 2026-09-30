/* ============================================================
   Everything the assistant is allowed to know

   One flat list of records drawn from the five workspaces that
   hold something a reader can be pointed at: Parliament's
   measures, the appropriations, the election that filled the
   chamber, the travel guide, and the local government directory.
   Each row carries what it is, one line
   about it, and the address it lives at — across subdomains,
   because the estate is four deployments and an answer given on
   the travel site routinely points at the registry.

   The model never sees this file. It asks `search` for rows and
   writes from what comes back, which is why the note on each row
   is written here, from the dataset, rather than left to a model
   to recall. A figure in an answer is a figure that was in a row.

   Built on first use and kept, not built at import: only the ask
   endpoint reaches this module, so a page render never pays for
   it.
   ============================================================ */

import {
	FISCAL_YEARS,
	budget as act,
	budgetFor,
	offices,
	programs,
	projects,
	provisions,
	sectors,
} from '@betterbarmm/budget-data'
import { areaHref, lguIndex, lguProvinces } from '@betterbarmm/lgu-data'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { dishes, itineraries, places, travelAreas } from '@betterbarmm/travel-data'
import actIndex from '../../../datasets/bills/bangsamoro_registry/baa/official_index.json'
import billIndex from '../../../datasets/bills/bangsamoro_registry/bills/official_index.json'
import adoptedIndex from '../../../datasets/bills/bangsamoro_registry/resolutions/adopted_official_index.json'
import proposedIndex from '../../../datasets/bills/bangsamoro_registry/resolutions/proposed_official_index.json'
import trends from '../../../datasets/budget/trends.json'
import { joinRenames, type Line } from '@betterbarmm/budget-data/trends'
import blgcFile from '../../../datasets/bills/blgc.json'
import blgcIrrFile from '../../../datasets/bills/blgc-irr.json'
import readingsFile from '../../../datasets/bills/readings.json'
import ballotFile from '../../../datasets/election/election.min.json'
import resultsFile from '../../../datasets/election/election-results.json'

export type Space = 'legislation' | 'budget' | 'election' | 'travel' | 'lgu' | 'primer'

/** One thing a reader can be sent to. `text` is the haystack; everything else is shown. */
export type Entry = {
	space: Space
	/** "Act", "Bill", "Office", "Place" — what kind of record this is. */
	kind: string
	title: string
	/** One line under the title, written from the data. */
	note: string
	href: string
	text: string
	/** The record this one is part of — a program's office. Its own row
	    carries the total this row is a slice of. */
	parent?: string
	/** A photograph of the thing, where the estate holds a licensed one. */
	photo?: { src: string; alt: string }
	/** The words a question uses for this kind of record. Set at build. */
	asked?: string
	/**
	 * This row is the sum of a set of others — the seven-year budget span, the
	 * region's own counts.
	 *
	 * It exists because a corpus of parts cannot be counted by a model that is
	 * shown sixteen of them, and it needs help winning: "how many provinces in
	 * BARMM" reduces to the single term "provinc" once the stop words go, and
	 * on one term this row ties with every provincial office in the budget and
	 * loses the tie alphabetically. The question words that would have settled
	 * it — "how many" — are exactly the ones thrown away. So they are read off
	 * the raw query instead, and this flag is what they lift.
	 */
	rollup?: boolean
	/** The era of a primer timeline event — "1968", "1565–1898". Its presence
	    is what marks a row as one event of a dated sequence. */
	era?: string
	/** The primer chapter a row belongs to, so the whole of that chapter's
	    timeline can be fetched when one event of it is reached. */
	topic?: string
	/** How an elected member got their seat — "on the party vote", "for Lanao
	    del Sur's 1st district". Kept apart from the note so a roster can print
	    it in a column rather than a sentence. */
	seat?: string
}

/*
 * Which photograph illustrates which place, area or dish.
 *
 * The files are the travel guide's own, published at a fixed address so an
 * answer given on any of the six sites can show them. Alt text is carried
 * with the file because a picture without it is a picture nobody blind can
 * use, and the credits stay where the pictures are actually printed, on the
 * travel pages.
 *
 * ponytail: this map is a second copy of the one in
 * `apps/travel/app/_lib/media.ts`, which also holds the captions, credits and
 * licenses the travel pages print. Two readers, one small map, so it is
 * transcribed rather than shared; move it into `@betterbarmm/travel-data` the
 * day a third reader wants it or the two drift.
 */
const PHOTOS: Record<string, { src: string; alt: string }> = {
	// Places
	'bud-bongao': { src: 'bud-bongao.jpg', alt: 'Bud Bongao rising behind a harbour at dusk, boats moored under a pink and violet sky.' },
	'panampangan-island': { src: 'panampangan.jpg', alt: 'A low green island ringed by a pale sandbar in turquoise water under a wide sky.' },
	'sheik-makhdum-mosque': { src: 'makhdum-mosque.jpg', alt: 'The green and gold façade of the Sheik Karimul Makhdum Mosque, its domes topped with crescents.' },
	'lake-lanao': { src: 'lake-lanao.jpg', alt: 'Lake Lanao stretching to distant hills under a bright, clouded sky.' },
	'kawayan-torogan': { src: 'torogan.jpg', alt: 'A torogan — a steep-roofed Maranao royal house raised on heavy posts above water.' },
	tugaya: { src: 'agung.jpg', alt: 'Two hands striking a pair of large bossed bronze gongs with padded beaters.' },
	lamitan: { src: 'yakan-weaving.jpg', alt: 'A handwoven Yakan seputangan head cloth in fine geometric bands of pink, green and cream.' },
	sitangkai: { src: 'kulintang.jpg', alt: 'Three women in green and yellow seated behind a carved kulintang, one holding a hanging gong.' },
	// Areas, each taking the photograph its own page leads with
	'cotabato-city': { src: 'government-center.jpg', alt: 'The arcade of the Bangsamoro Government Center at night, lit in bands of colored light.' },
	'tawi-tawi': { src: 'bud-bongao.jpg', alt: 'Bud Bongao rising behind a harbour at dusk, boats moored under a pink and violet sky.' },
	'lanao-del-sur': { src: 'lake-lanao.jpg', alt: 'Lake Lanao stretching to distant hills under a bright, clouded sky.' },
	'maguindanao-del-norte': { src: 'pastil.jpg', alt: 'Banana-leaf parcels of pastil, one opened to show shredded meat over steamed rice.' },
	basilan: { src: 'yakan-weaving.jpg', alt: 'A handwoven Yakan seputangan head cloth in fine geometric bands of pink, green and cream.' },
	// Dishes
	pastil: { src: 'pastil.jpg', alt: 'Banana-leaf parcels of pastil, one opened to show shredded meat over steamed rice.' },
	palapa: { src: 'pater-palapa.jpg', alt: 'Turmeric-yellow kuning rice and grilled chicken pater served on a banana leaf.' },
	'tiyula-itum': { src: 'tiyula-itum.jpg', alt: 'A bowl of near-black beef soup beside a red onion and dried chillies.' },
}

const shown = (slug: string) => {
	const one = PHOTOS[slug]
	// Served by whichever app the panel was opened in, not by the travel site:
	// a cross-origin address would be a broken image everywhere the travel
	// site is not, which is every development machine and every preview.
	// These are 320px copies, a few kilobytes each, kept in each app's own
	// public folder — the full-size originals stay where they are printed.
	return one ? { src: `/ask-photos/${one.src}`, alt: one.alt } : undefined
}

const SITE: Record<Space, string> = {
	legislation: 'https://legislation.betterbarmm.com',
	budget: 'https://budget.betterbarmm.com',
	election: 'https://election.betterbarmm.com',
	travel: 'https://travel.betterbarmm.com',
	lgu: 'https://lgu.betterbarmm.com',
	primer: 'https://betterbarmm.com',
}

type Measure = {
	number: number
	title: string
	status?: string
	date_ratified?: string
	as_of?: string
	principal_authors?: string[]
}

/** One operative section of the Bangsamoro Local Governance Code. */
type CodeSection = {
	/** As it is cited — "45", "595". */
	n: string
	heading: string
	book: string
	/** The rule itself, written out with its figures. */
	rule: string
	/** The words a person would use for it, which the Code does not. */
	terms: string
}

/** One operative article of the IRR of the Local Governance Code. */
type CodeArticle = {
	/** As it is cited — "45", "690". Not the Code's section numbering. */
	n: string
	heading: string
	/** The Rule it sits under, in roman, kept for the record. */
	ruleNo: string
	/** The rule itself, written out with its figures. */
	rule: string
	terms: string
}

type Reading = {
	category: string
	number: number
	whatItDoes?: string
	whyProposed?: string
	/** Written as a list on some measures and a sentence on others. */
	whoIsAffected?: string | string[]
}

const peso = (amount: number) => `₱${Math.round(amount).toLocaleString('en-PH')}`

const trim = (text: string, most: number) =>
	text.length > most ? `${text.slice(0, most - 1).trimEnd()}…` : text

/** Sentence case for a title Parliament publishes in capitals. */
const sentence = (title: string) =>
	title === title.toUpperCase() ? title.charAt(0) + title.slice(1).toLowerCase() : title

function measures(): Entry[] {
	// What a reading says about a measure is the best text there is for
	// finding it by subject — "health" appears in the summary of an act whose
	// official title only says "AN ACT ESTABLISHING…".
	const read = new Map<string, Reading>()
	for (const one of (readingsFile as { readings: Reading[] }).readings) {
		read.set(`${one.category}-${one.number}`, one)
	}

	const source: { rows: Measure[]; category: string; kind: string; path: string; label: string }[] = [
		{ rows: (actIndex as { acts: Measure[] }).acts, category: 'acts', kind: 'Act', path: '/acts', label: 'Bangsamoro Autonomy Act' },
		{ rows: (billIndex as { bills: Measure[] }).bills, category: 'bills', kind: 'Bill', path: '/bills', label: 'Parliament Bill' },
		{ rows: (adoptedIndex as { measures: Measure[] }).measures, category: 'adopted-resolutions', kind: 'Resolution', path: '/resolutions/adopted', label: 'Resolution' },
		{ rows: (proposedIndex as { measures: Measure[] }).measures, category: 'proposed-resolutions', kind: 'Proposed resolution', path: '/resolutions/proposed', label: 'Proposed Resolution' },
	]

	return source.flatMap(({ rows, category, kind, path, label }) =>
		(rows ?? []).map((row) => {
			const reading = read.get(`${category}-${row.number}`)
			const when = row.date_ratified ?? row.as_of ?? ''
			return {
				space: 'legislation' as const,
				kind,
				title: `${label} ${row.number}`,
				note: trim(sentence(row.title ?? 'Title not recorded'), 200),
				href: `${SITE.legislation}${path}/${row.number}`,
				text: [
					`${label} ${row.number}`,
					row.title,
					row.status,
					when,
					row.principal_authors?.join(' '),
					reading?.whatItDoes,
					reading?.whyProposed,
					[reading?.whoIsAffected ?? ''].flat().join(' '),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase(),
			}
		}),
	)
}

/**
 * The Bangsamoro Local Governance Code, section by section.
 *
 * The act row for Bangsamoro Autonomy Act 49 can say what the Code is. It
 * cannot say what the Code *requires*, and every question anybody actually
 * asks about it is a question about one rule: how many kagawad a barangay
 * elects, what a punong barangay is paid, when the anti-dynasty clause starts
 * to bite. So each operative section is its own row with the rule written out.
 *
 * The notes here run longer than anywhere else in this file, on purpose. The
 * model quotes the note and may not state a figure that was not in one, so a
 * rule trimmed to fit a link card is a rule the assistant cannot give:
 * "salary grade 27" and "₱1,200,000" either survive into the row or they are
 * gone.
 *
 * `terms` carries the words people use against a Code that does not use them —
 * kagawad, barangay captain, amilyar, cedula — and is why "how many kagawad"
 * reaches Section 407 rather than nothing.
 *
 * The Code publishes no per-section anchors, so every row links to the act.
 */
function code(): Entry[] {
	const file = blgcFile as { act: number; sections: CodeSection[] }
	return file.sections.map((section) => ({
		space: 'legislation' as const,
		kind: 'Code section',
		// The number in the title, because that is how a section is cited and
		// a title match is worth six.
		title: `BLGC Section ${section.n} — ${section.heading}`,
		note: section.rule,
		href: `${SITE.legislation}/acts/${file.act}`,
		text: [`section ${section.n}`, `sec ${section.n}`, section.heading, section.rule, section.terms]
			.join(' ')
			.toLowerCase(),
	}))
}

/**
 * The articles of the IRR of the Local Governance Code, one row each.
 *
 * Kept a kind of its own rather than folded into `code()`, because the two
 * number differently and a reader has to be able to tell which document an
 * answer came from: Code Section 424 and IRR Article 45 are the same subject
 * and the numbers are unrelated. The IRR has no page of its own on the estate,
 * so a row links to the act it implements.
 */
function irr(): Entry[] {
	const file = blgcIrrFile as { act: number; articles: CodeArticle[] }
	return file.articles.map((article) => ({
		space: 'legislation' as const,
		kind: 'Code rule',
		title: `BLGC IRR Article ${article.n} — ${article.heading}`,
		note: article.rule,
		href: `${SITE.legislation}/acts/${file.act}`,
		text: [
			`article ${article.n}`,
			`art ${article.n}`,
			`irr article ${article.n}`,
			article.heading,
			article.rule,
			article.terms,
		]
			.join(' ')
			.toLowerCase(),
	}))
}


/**
 * The enacted budget: every office, every program, and every named project.
 *
 * Five kinds. Two of them are what the assistant was missing:
 *
 * The projects name 258 roads, bridges and buildings with the barangay each is
 * in, and they are the only rows on the whole estate that can answer "is
 * anything being built where I live". Without them that question came back
 * with a ministry's ₱5.7 billion total, which is true and useless.
 *
 * The special provisions are the conditions Parliament attached to the money —
 * who it must reach, what it may not be spent on, what must be reported. They
 * answer "is the office allowed to do that", which is the question behind most
 * questions anybody asks about a budget, and nothing else on the estate
 * answers it at all.
 *
 * One fiscal year, which is now all there is: the workspace holds the enacted
 * FY 2026 Act and nothing before it, so a row no longer has to say which year
 * it is one of.
 */
/**
 * The region's own total, one row a year and one for the span.
 *
 * Everything else in `budget()` is the latest Act — its offices, its sectors,
 * its projects — which left the assistant unable to answer the shortest budget
 * question there is. Asked for the total across seven years it said the records
 * did not have it, while the seven files sat in the same package: no row
 * carried a figure for any year but the one in force, so there was nothing for
 * `grounded()` to let through even when the search found the right thing.
 *
 * The per-year rows carry the step as well as the total, because "is it bigger
 * than last year" is the second half of nearly every question that starts with
 * "how big". The span row carries the sum and both ends, since a model may not
 * add up figures itself and would otherwise have to refuse a total it was
 * looking straight at.
 */
/**
 * The short name for an office, which the data does not carry and everybody uses.
 *
 * "How much is the MILG budget" reached a special purpose fund called
 * Sustainable Assistance Mechanism for Local Moral Governance and never the
 * Ministry of the Interior and Local Government, because "MILG" appears
 * nowhere in that ministry's record — not in its name, its official name, its
 * type or its group.
 *
 * Both spellings, because both are used and neither is derivable from the
 * other: MILG drops the small words, MOH keeps the "of". Generating both costs
 * two strings a row and saves guessing which convention an office follows.
 */
function acronyms(name: string): string {
	const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
	const small = new Set(['of', 'the', 'and', 'for', 'in', 'on', 'to', 'a'])
	const big = words.filter((word) => !small.has(word.toLowerCase()))
	const letters = (from: string[]) => from.map((word) => word[0]!).join('').toUpperCase()
	return [letters(big), letters(words)].filter((one) => one.length > 1).join(' ')
}

/**
 * One office across every Act, which is the shape most budget questions have.
 *
 * "How much is the MILG budget for 6 years" had no row that could answer it.
 * Every office row is one fiscal year — the latest — and the seven-year series
 * has been in `trends.json` the whole time, drawn as a line on the office's own
 * page and never written down anywhere a search could reach.
 *
 * Built from the trend file rather than by summing `budgetFor` year by year,
 * because the Acts are not consistent about their own offices: the interior
 * ministry is printed three ways across seven of them, and `build-trends.mts`
 * is what already reconciles that.
 */
function officeYears(): Entry[] {
	/* Joined first. The Acts spell the interior ministry two ways and the
	   Wali's office two, so straight off the file it is two rows for one
	   office, each with a fragment of the total — which is how "MILG budget
	   for 6 years" came back as two rows covering two years and four. */
	const lines = joinRenames(
		((trends as unknown as { offices?: Line[] }).offices ?? []).filter((line) => line.series.length > 0),
	)

	return lines
		.filter((line) => line.series.length > 1)
		.map((line) => {
			const points = line.series.map(([fy, total]) => ({ fy: fy!, total: total! }))
			const first = points[0]!
			const last = points[points.length - 1]!
			const sum = points.reduce((running, one) => running + one.total, 0)

			return {
				space: 'budget' as const,
				kind: 'Office years',
				rollup: true,
				title: `${line.name} across ${points.length} years, FY ${first.fy} to FY ${last.fy}`,
				note: `${line.name} was appropriated ${peso(sum)} in total across the ${points.length} Acts it appears in. Year by year: ${points
					.map((one) => `FY ${one.fy} ${peso(one.total)}`)
					.join(', ')}.`,
				href: `${SITE.budget}/offices/${line.slug}`,
				text: `${line.name} ${acronyms(line.name)} total across all years every year combined altogether over the years how much budget appropriation`.toLowerCase(),
			}
		})
}

function budgetYears(): Entry[] {
	const years = [...FISCAL_YEARS]
		.reverse()
		.map((fy) => ({ fy, total: budgetFor(fy).budget.total }))
	const first = years[0]!
	const last = years[years.length - 1]!
	const sum = years.reduce((running, one) => running + one.total, 0)

	const rows: Entry[] = years.map((one, index) => {
		const before = years[index - 1]
		const step = before ? ((one.total / before.total - 1) * 100).toFixed(1) : null
		return {
			space: 'budget' as const,
			kind: 'Yearly total',
			title: `The Bangsamoro budget for FY ${one.fy}`,
			note: `The whole enacted budget of the Bangsamoro Government for FY ${one.fy} is ${peso(one.total)}.${
				before
					? ` That is ${Number(step) >= 0 ? 'up' : 'down'} ${Math.abs(Number(step))}% on the ${peso(before.total)} of FY ${before.fy}.`
					: ' It is the first budget the region enacted for itself.'
			}`,
			href: SITE.budget,
			text: [
				`fy ${one.fy}`,
				`${one.fy} budget total`,
				'total budget of barmm bangsamoro whole region how big how much annual appropriation',
			]
				.join(' ')
				.toLowerCase(),
		}
	})

	rows.push({
		space: 'budget' as const,
		kind: 'Yearly total',
		/* The words that separate this row from the seven beside it go in the
		   title, where a hit is worth six and a hit in the text is worth two:
		   without "total" and "years" on it, "total budget for 7 years" reached
		   FY 2020 first and the span row — the only one carrying the sum — came
		   eighth. */
		rollup: true,
		title: `Total Bangsamoro budget for all ${years.length} years, FY ${first.fy} to FY ${last.fy}`,
		note: `Across all ${years.length} years the Bangsamoro Government has enacted budgets totalling ${peso(sum)}. Year by year: ${years
			.map((one) => `FY ${one.fy} ${peso(one.total)}`)
			.join(', ')}. It has grown from ${peso(first.total)} in FY ${first.fy} to ${peso(last.total)} in FY ${last.fy}.`,
		href: SITE.budget,
		text: [
			'total budget of barmm for 7 seven years all years every year combined altogether sum',
			'bangsamoro budget over time trend history year on year growth how much in total',
			years.map((one) => `fy ${one.fy}`).join(' '),
		]
			.join(' ')
			.toLowerCase(),
	})

	return rows
}

function budget(): Entry[] {
	const year = act.fiscalYear

	// Sectors first: 38 rows that each stand for a hundred, and the only way
	// to answer "what does the region spend on water" without adding up
	// figures the model is not allowed to add up.
	const rows: Entry[] = sectors.map((sector) => ({
		space: 'budget' as const,
		kind: 'Sector',
		title: sector.name,
		note: `${sector.count} lines of the FY ${year} budget are about this${
			sector.total > 0 ? `, ${peso(sector.total)} of it in program rows` : ''
		}. ${sector.description}.`,
		href: `${SITE.budget}/sectors/${sector.slug}`,
		text: `${sector.name} ${sector.description}`.toLowerCase(),
	}))

	rows.push(...offices.map((office) => ({
		space: 'budget' as const,
		kind: 'Office',
		title: office.name,
		note: `${peso(office.totals.total)} appropriated for FY ${year} — ${office.share.toFixed(1)}% of the region's budget.`,
		href: `${SITE.budget}/offices/${office.slug}`,
		text: [
			office.name,
			office.nameOfficial,
			office.officeType,
			office.budgetGroup,
			office.parent?.name,
			// What the office is funded to do is how somebody finds it by
			// subject: "scholarship" is in a program's name and nowhere in
			// "Ministry of Basic, Higher and Technical Education".
			office.programs.map((line) => line.name).join(' '),
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase(),
	})))

	for (const program of programs) {
		rows.push({
			space: 'budget',
			kind: 'Program',
			title: program.name,
			parent: program.office,
			note: `${peso(program.total)} under ${program.office}, FY ${year}.`,
			// The programs page filters on `q`, so a link can land on the one
			// row being talked about rather than on a list of 253.
			href: `${SITE.budget}/programs?q=${encodeURIComponent(program.name)}`,
			text: `${program.path} ${program.office} ${program.costStructure ?? ''}`.toLowerCase(),
		})
	}

	for (const provision of provisions) {
		rows.push({
			space: 'budget',
			kind: 'Rule',
			title: provision.title,
			parent: provision.office,
			note: provision.amount
				? `${peso(provision.amount)} of ${provision.office}'s FY ${year} budget, under a condition set by the Act. ${trim(provision.text, 200)}`
				: `A condition the Act attaches to ${provision.office}'s FY ${year} budget. ${trim(provision.text, 220)}`,
			href: `${SITE.budget}/offices/${provision.officeSlug}#${provision.id}`,
			text: `${provision.haystack} special provision rule condition requirement`,
		})
	}

	for (const project of projects) {
		rows.push({
			space: 'budget',
			kind: 'Project',
			// The Act writes a project as a sentence naming the barangay and the
			// town but never the province, and as a sentence far too long for a
			// link. So: the province on the front, the sentence trimmed behind
			// it, and the whole of it still in the haystack because the barangay
			// is often at the end of it.
			//
			// The province belongs in the title and not only in the note.
			// "What is being built in Basilan" scored the travel guide's Basilan
			// page above every project in Basilan, because a title match is
			// worth three text matches and no project's title said the word.
			title: `${project.province}: ${trim(project.project, 100)}`,
			parent: 'Ministry of Public Works',
			note: `${peso(project.amount)} in ${project.province}, FY ${year}. Appropriated to build, not yet a finished project.`,
			href: `${SITE.budget}/projects?q=${encodeURIComponent(project.province)}`,
			text: `${project.project} ${project.province} ${project.kinds.join(' ')} ministry of public works infrastructure`.toLowerCase(),
		})
	}

	return rows
}

/**
 * The election that filled the chamber, and the chamber it filled.
 *
 * Two datasets, one space. `election.min.json` is the ballot — who stood, under
 * what label — and `election-results.json` is the count, which is a separate
 * file on purpose: a pre-election record should not be edited after the fact.
 * Both are read here because a reader asking about a party wants the party and
 * what happened to it in one answer.
 *
 * Five kinds, and the one that earns its place is `Member`. "Who are the UBJP
 * nominees" is the commonest question anybody has about a parliament, and
 * without a row per elected member it came back with the party's own line —
 * thirty seats, and not one name. A row per member is eighty rows for the
 * eighty answers.
 *
 * ponytail: no portraits on these rows. The estate holds a licensed headshot
 * for about forty of the eighty, but `photo` is served out of each app's own
 * `public/ask-photos`, so using them means copying forty files into six apps.
 * Add them the day somebody asks to see a face in an answer.
 */
function election(): Entry[] {
	const ballot = ballotFile as unknown as {
		regional_parties: {
			party_id: string
			ballot_name: string
			full_name: string
			aliases?: string[]
			description?: string
		}[]
	}
	const count = resultsFile as unknown as {
		election_day: string
		turnout: { registered_voters: number; votes_cast: number; turnout_percent: number }
		outcome: {
			majority_threshold: number
			largest_party_seats: number
			first_session: string
			summary: string
		}
		party_totals: {
			party_id: string | null
			label: string
			party_representative_votes: number
			party_representative_seats: number
			district_seats: number
			sectoral_seats: number
			total_seats: number
		}[]
		proportional_representation: {
			seats: number
			parties: { party_id: string | null; label: string; votes: number; seats: number }[]
			elected_nominees: { name: string; party_id: string; bta_incumbent: boolean }[]
		}
		district_representation: {
			seats: number
			districts: {
				area: string
				district: string
				label: string
				total_votes: number
				candidates: {
					name: string
					party_id: string | null
					party_label: string
					votes: number | null
					won: boolean
				}[]
			}[]
		}
		sectoral_representation: {
			seats: number
			races: {
				sector: string
				seats: number
				candidates: {
					name: string
					party_id: string | null
					party_label: string
					votes: number | null
					won: boolean
				}[]
			}[]
			non_moro_indigenous_peoples: {
				seats: number
				method: string
				elected: { name: string; group: string }[]
			}
		}
	}

	const rows: Entry[] = []
	const tally = new Map(count.party_totals.map((party) => [party.party_id, party]))
	const votes = new Map(count.proportional_representation.parties.map((party) => [party.party_id, party]))
	/* What a party is called on the ballot.
	 *
	 * The three tracks name the same party two different ways — the nominee
	 * lists carry an id, the district and sectoral returns carry the full
	 * registered name — so half the members read "UBJP" and half "United
	 * Bangsamoro Justice Party". Asked for the UBJP nominees, a reader got
	 * eight rows under one name and seven under another, which reads as two
	 * parties. The ballot name wins wherever there is an id to resolve. */
	const called = new Map(ballot.regional_parties.map((party) => [party.party_id, party.ballot_name]))
	const name = (id: string | null | undefined, fallback: string) =>
		(id && called.get(id)) || fallback
	const number = (value: number) => value.toLocaleString('en-PH')

	const chamber = count.party_totals.reduce((sum, party) => sum + party.total_seats, 0)
	const held = count.party_totals
		.filter((party) => party.total_seats > 0)
		.sort((a, b) => b.total_seats - a.total_seats)
		.map((party) => `${party.label} ${party.total_seats}`)
		.join(', ')

	// The whole result in one row, so "who won the election" has something to
	// land on that is not thirty separate members.
	rows.push({
		space: 'election',
		kind: 'Election',
		title: '2026 Bangsamoro parliamentary election',
		note: `Held ${count.election_day}. ${number(count.turnout.votes_cast)} of ${number(
			count.turnout.registered_voters,
		)} registered voters turned out, ${count.turnout.turnout_percent}%. ${chamber} seats: ${held}. ${count.outcome.summary}`,
		href: `${SITE.election}/results`,
		text: `2026 bangsamoro parliamentary election result results count turnout seats hung parliament chief minister majority proclaimed comelec ${held} first regular election`.toLowerCase(),
	})

	for (const party of ballot.regional_parties) {
		const won = tally.get(party.party_id)
		const vote = votes.get(party.party_id)
		const seats = won?.total_seats ?? 0
		const share = seats
			? `Won ${seats} of the ${chamber} seats — ${[
					won?.party_representative_seats ? `${won.party_representative_seats} on the party vote` : '',
					won?.district_seats ? `${won.district_seats} in the districts` : '',
					won?.sectoral_seats ? `${won.sectoral_seats} reserved` : '',
				]
					.filter(Boolean)
					.join(', ')}.`
			: 'Won no seat.'
		const polled = vote ? ` Took ${number(vote.votes)} party votes.` : ''

		rows.push({
			space: 'election',
			kind: 'Party',
			title: party.ballot_name,
			note: `${party.full_name}. ${share}${polled}`,
			href: `${SITE.election}/parties/${party.party_id}`,
			text: [party.ballot_name, party.full_name, party.party_id, party.aliases?.join(' '), party.description]
				.filter(Boolean)
				.join(' ')
				.toLowerCase(),
		})
	}

	/** One elected member, however they got in. */
	const member = (name: string, label: string, how: string, extra: string) =>
		rows.push({
			space: 'election',
			kind: 'Member',
			title: name,
			parent: label,
			seat: how,
			note: `Elected to the Bangsamoro Parliament for ${label}, ${how}.`,
			href: `${SITE.election}/results`,
			text: `${name} ${label} ${how} ${extra} member of parliament mp elected won seat`.toLowerCase(),
		})

	for (const nominee of count.proportional_representation.elected_nominees) {
		const label = called.get(nominee.party_id) ?? nominee.party_id
		member(
			nominee.name,
			label,
			'on the party vote',
			`party representative proportional nominee nominees list ${nominee.party_id}${
				nominee.bta_incumbent ? ' interim transition authority incumbent' : ''
			}`,
		)
	}

	for (const district of count.district_representation.districts) {
		const winner = district.candidates.find((one) => one.won)
		const rest = [...district.candidates].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
		const runnerUp = rest.find((one) => !one.won)

		if (winner) {
			member(
				winner.name,
				name(winner.party_id, winner.party_label),
				`for ${district.label}`,
				`district ${district.area} ${district.district} constituency`,
			)
		}

		rows.push({
			space: 'election',
			kind: 'District',
			title: district.label,
			note: winner
				? `${winner.name} (${winner.party_label}) won with ${number(winner.votes ?? 0)} of ${number(
						district.total_votes,
					)} votes${
						runnerUp ? `, ${number((winner.votes ?? 0) - (runnerUp.votes ?? 0))} ahead of ${runnerUp.name}` : ''
					}. ${district.candidates.length} stood.`
				: `${district.candidates.length} candidates stood in ${district.area}.`,
			href: `${SITE.election}/results`,
			// Everyone who stood, not only the winner: "did X run in Marawi" is a
			// question about the field, and the losing names live nowhere else.
			text: `${district.label} ${district.area} parliamentary district ${district.candidates
				.map((one) => `${one.name} ${one.party_label}`)
				.join(' ')}`.toLowerCase(),
		})
	}

	for (const race of count.sectoral_representation.races) {
		const winners = race.candidates.filter((one) => one.won)
		for (const winner of winners) {
			member(
				winner.name,
				name(winner.party_id, winner.party_label),
				`for the ${race.sector.toLowerCase()} seat`,
				`sectoral reserved ${race.sector}`,
			)
		}

		rows.push({
			space: 'election',
			kind: 'Reserved seat',
			title: `${race.sector} (reserved seat)`,
			note: `${race.seats} reserved ${race.seats === 1 ? 'seat' : 'seats'}, won by ${winners
				.map((one) => `${one.name} (${one.party_label})`)
				.join(' and ')}. ${race.candidates.length} stood in a region-wide race.`,
			href: `${SITE.election}/results`,
			text: `${race.sector} sectoral reserved seat ${race.candidates
				.map((one) => `${one.name} ${one.party_label}`)
				.join(' ')}`.toLowerCase(),
		})
	}

	const native = count.sectoral_representation.non_moro_indigenous_peoples
	for (const one of native.elected) {
		member(one.name, `the ${one.group}`, 'to a reserved Non-Moro Indigenous Peoples seat', 'sectoral reserved indigenous')
	}
	rows.push({
		space: 'election',
		kind: 'Reserved seat',
		title: 'Non-Moro Indigenous Peoples (reserved seats)',
		note: `${native.seats} seats, held by ${native.elected
			.map((one) => `${one.name} (${one.group})`)
			.join(' and ')}. ${native.method}`,
		href: `${SITE.election}/results`,
		text: `non-moro indigenous peoples reserved seats teduray lambiangan inter-tribal convention ${native.elected
			.map((one) => `${one.name} ${one.group}`)
			.join(' ')}`.toLowerCase(),
	})

	return rows
}

function travel(): Entry[] {
	const visit: Entry[] = places.map((place) => ({
		space: 'travel',
		kind: 'Place',
		title: place.name,
		note: `${place.summary} In ${place.municipality}.`,
		href: `${SITE.travel}/places#${place.slug}`,
		photo: shown(place.slug),
		text: [place.name, place.alsoKnownAs?.join(' '), place.kind, place.municipality, place.area, place.summary, place.detail.join(' '), place.beforeYouGo.join(' ')]
			.filter(Boolean)
			.join(' ')
			.toLowerCase(),
	}))

	const eat: Entry[] = dishes.map((dish) => ({
		space: 'travel',
		kind: 'Food',
		title: dish.name,
		note: dish.summary,
		href: `${SITE.travel}/food#${dish.slug}`,
		photo: shown(dish.slug),
		text: [dish.name, dish.tradition, dish.summary, dish.detail, dish.whereToFind].join(' ').toLowerCase(),
	}))

	const areas: Entry[] = travelAreas.map((area) => ({
		space: 'travel',
		kind: 'Area',
		title: area.name,
		note: `${area.tagline} Base yourself in ${area.base}.`,
		href: `${SITE.travel}/${area.slug}`,
		photo: shown(area.slug),
		text: [area.name, area.tagline, area.base, area.intro.join(' '), area.knownFor.join(' '), area.whenToGo, area.safety, area.languages.join(' ')]
			.join(' ')
			.toLowerCase(),
	}))

	const routes: Entry[] = itineraries.map((route) => ({
		space: 'travel',
		kind: 'Route',
		title: route.name,
		note: `${route.nights} out of ${route.base}. ${route.forWhom}`,
		href: `${SITE.travel}/routes#${route.slug}`,
		text: [route.name, route.base, route.forWhom, route.nights, route.days.map((day) => `${day.where} ${day.what}`).join(' '), route.watchFor]
			.join(' ')
			.toLowerCase(),
	}))

	return [...visit, ...eat, ...areas, ...routes]
}

function local(): Entry[] {
	const units: Entry[] = lguIndex.map((entry) => ({
		space: 'lgu',
		kind: entry.unit.isCity ? 'City' : 'Municipality',
		title: entry.name,
		note: [
			`${entry.unit.isCity ? 'City' : 'Municipality'} in ${entry.province.name}`,
			entry.unit.population ? `population ${entry.unit.population.toLocaleString('en-PH')}` : null,
			`${entry.unit.barangays.length} barangays`,
		]
			.filter(Boolean)
			.join(', ')
			.concat('.'),
		href: `${SITE.lgu}${entry.href}`,
		text: entry.haystack,
	}))

	const provinces: Entry[] = lguProvinces.map((province) => ({
		space: 'lgu',
		kind: province.kind,
		title: province.name,
		note: [
			`${province.municipalities.length} cities and municipalities`,
			`${province.barangayCount} barangays`,
			province.population ? `population ${province.population.toLocaleString('en-PH')}` : null,
		]
			.filter(Boolean)
			.join(', ')
			.concat('.'),
		href: `${SITE.lgu}${areaHref(province)}`,
		text: [province.name, province.kind, province.municipalities.map((unit) => unit.name).join(' ')]
			.join(' ')
			.toLowerCase(),
	}))

	/* The region itself, as one row.
	   
	   "How many provinces are in BARMM" had no answer here, and not because the
	   data is missing — there are seven area rows and a hundred and eight town
	   rows, and between them they hold every part of the sum. What there was no
	   record of is the sum. A corpus of parts cannot be counted by a model that
	   is only shown ten of them, so the count has to exist as a row of its own,
	   the way the budget's seven-year span does.

	   Every figure is derived, so the row cannot drift from the areas under it.
	   The title carries the counts because the title is what ranks. */
	const areas = lguProvinces.filter((one) => one.kind === 'Province')
	const towns = lguProvinces.reduce((sum, one) => sum + one.municipalities.length, 0)
	const barangays = lguProvinces.reduce((sum, one) => sum + one.barangayCount, 0)
	const people = lguProvinces.reduce((sum, one) => sum + (one.population ?? 0), 0)

	const region: Entry = {
		space: 'lgu',
		kind: 'Province',
		rollup: true,
		title: `The Bangsamoro region: ${areas.length} provinces, ${towns} cities and municipalities, ${barangays.toLocaleString('en-PH')} barangays`,
		note: `BARMM has ${areas.length} provinces — ${areas.map((one) => one.name).join(', ')} — together with Cotabato City and the Special Geographic Area, ${lguProvinces.length} areas in all. Across them: ${towns} cities and municipalities, ${barangays.toLocaleString('en-PH')} barangays, population ${people.toLocaleString('en-PH')}.`,
		href: `${SITE.lgu}/`,
		text: 'how many provinces cities municipalities barangays are there in barmm bangsamoro region total number count areas local government units',
	}

	return [region, ...units, ...provinces]
}

/*
 * The words a question uses for a *kind* of record, which the record itself
 * never says.
 *
 * "How many barangays are in Marawi" used to come back with the Local
 * Governance Code at the top: the act says "barangay" forty times and the
 * directory row for Marawi does not say it once, because what it holds is a
 * list of them. The same for "what does the budget give to health", which
 * ranked appropriations acts over the appropriations themselves. So each row
 * carries the handful of words somebody would use to ask for its kind.
 */
const ASKED_FOR: Record<string, string> = {
	Act: 'act measure law legislation passed',
	Bill: 'bill measure proposed law legislation filed',
	Resolution: 'resolution measure adopted',
	'Code section': 'blgc code section provision rule requires must shall allowed prohibited penalty',
	'Yearly total':
		'budget total whole region annual appropriation how big how much year years combined',
	'Office years':
		'budget appropriation office agency ministry total across years every year combined over time how much six seven years history trend',
	'Code rule':
		'irr implementing rules article procedure how to requirements deadline file apply process steps',
	'Proposed resolution': 'resolution measure proposed',
	Sector: 'budget spend spending total how much sector subject area allocation funds',
	Office: 'budget appropriation appropriations office agency ministry spending funds fund allocation',
	Rule: 'rule condition requirement provision allowed permitted must shall restriction report released conditions',
	Program: 'budget appropriation appropriations program program spending funds fund allocation',
	Project: 'project projects built building build construction road roads bridge infrastructure budget appropriation funds',
	Election: 'election result results vote votes voted turnout seat seats parliament won winner chief minister majority hung chamber proclaimed',
	Party: 'party parties seat seats won votes ballot bloc coalition stood contested',
	Member: 'member members mp mps parliament elected win won seat nominee nominees representative name names sitting',
	District: 'district districts seat race won winner votes margin candidates ran stood constituency',
	'Reserved seat': 'sector sectoral reserved seat seats women youth ulama traditional leaders settler indigenous nominee nominees',
	Place: 'place visit see go attraction destination travel',
	Food: 'food dish eat cuisine',
	Background: 'history historical background explain explanation why how came to be origin story past struggle peace process autonomy region government institutions people culture',
	Area: 'area place visit go travel destination province',
	Route: 'route trip itinerary travel days',
	City: 'city municipality town barangay barangays population local government unit lgu',
	Municipality: 'municipality town barangay barangays population local government unit lgu',
	Province: 'province barangay barangays municipalities population local government',
	'Special area': 'special area barangay barangays population local government',
}

let built: Entry[] | null = null

/*
 * The region explained — history, institutions, peoples, places.
 *
 * The one part of the estate that was written to be read start to finish, and
 * the only one that answers "how did BARMM come to be". Everything else here
 * is a record of a decision already taken; this is the account of why there
 * was a decision to take.
 *
 * It was unreachable until now. Asked for the history of BARMM, Jo said the
 * records did not hold one — while a seventeen-event timeline from the
 * sultanates to the transition sat on the landing site. The data lived in an
 * app, and `packages/ai` cannot import from an app, so it moved to
 * `packages/primer-data` and both read it from there.
 *
 * Three rows per topic rather than one. A chapter row for the topic itself, a
 * row per timeline event, and a row per detail card: a single row carrying an
 * entire chapter would rank on everything and answer nothing precisely, and
 * "what was the Jabidah massacre" wants the paragraph about Jabidah, not the
 * chapter it sits in.
 *
 * `kind` is 'Background', which says what these are and what they are not.
 * They are written, not transcribed — the distinction `DATA.md` opens on — and
 * a reader who is told the Organic Law was ratified in 2019 should be able to
 * see that this came from an explainer rather than from the Act.
 */
function primer(): Entry[] {
	const rows: Entry[] = []

	for (const topic of discoverBarmmTopics) {
		const href = `${SITE.primer}/discover/${topic.slug}`

		rows.push({
			space: 'primer',
			kind: 'Background',
			/* The label in front of the title, because the title is a sentence and
			   the label is the word somebody searches. "How BARMM came to be" does
			   not contain "history", so on the word "history" it scored below a
			   budget program called Bangsamoro History and Development — which is
			   a real match for the word and the wrong answer to the question. */
			title: `${topic.label} — ${topic.title}`,
			note: topic.description,
			topic: topic.slug,
			/* A chapter stands for its whole subject the way the region's counts
			   stand for the towns under them: it is the row to reach when the
			   question is the subject itself rather than a detail inside it. */
			rollup: true,
			href,
			/* The whole chapter is the haystack even though only the description
			   is shown: a question about a detail should be able to reach the
			   chapter, and then the detail's own row below outranks it. */
			text: [
				topic.label,
				topic.title,
				topic.description,
				...topic.sections,
				...(topic.timeline ?? []).map((one) => `${one.era} ${one.title} ${one.description}`),
				...(topic.detailCards ?? []).map((one) => `${one.title} ${one.description}`),
				...(topic.peopleGroups ?? []).map(
					(one) => `${one.category} ${one.description} ${one.people.map((who) => who.name).join(' ')}`,
				),
			]
				.join(' ')
				.toLowerCase(),
		})

		for (const event of topic.timeline ?? [])
			rows.push({
				space: 'primer',
				kind: 'Background',
				/* The era on the front of the title. Half of these are named for
				   what happened rather than when — "The Jabidah massacre", "The
				   MNLF takes up the cause" — and a timeline read as a list of
				   titles alone loses the only axis it has. */
				title: `${event.era}: ${event.title}`,
				note: event.description,
				era: event.era,
				topic: topic.slug,
				href,
				text: `${event.era} ${event.title} ${event.description} ${topic.label}`.toLowerCase(),
			})

		for (const card of topic.detailCards ?? [])
			rows.push({
				space: 'primer',
				kind: 'Background',
				title: card.title,
				note: [card.value, card.description].filter(Boolean).join(' — '),
				topic: topic.slug,
				href: card.href ?? href,
				text: `${card.label} ${card.title} ${card.value ?? ''} ${card.description} ${topic.label}`.toLowerCase(),
			})

		for (const group of topic.peopleGroups ?? [])
			rows.push({
				space: 'primer',
				kind: 'Background',
				title: group.category,
				note: `${group.description} ${group.people.map((who) => who.name).join(', ')}.`,
				topic: topic.slug,
				href,
				text: `${group.category} ${group.description} ${group.people
					.map((who) => `${who.name} ${who.description}`)
					.join(' ')} ${topic.label}`.toLowerCase(),
			})
	}

	return rows
}

export function corpus(): Entry[] {
	if (!built) {
		built = [
			...measures(),
			...code(),
			...irr(),
			...budgetYears(),
			...officeYears(),
			...budget(),
			...election(),
			...travel(),
			...local(),
			...primer(),
		]
		// Hung on the row rather than written into each builder: it is one rule
		// about how questions are worded, not a fact about any of the four
		// datasets. Kept apart from `text` so it can be scored apart from it.
		for (const row of built) row.asked = ASKED_FOR[row.kind]
	}
	return built
}

/** Words that match everything here and so tell us nothing about what was asked. */
const IGNORE = new Set([
	'the', 'and', 'for', 'with', 'what', 'which', 'who', 'where', 'when', 'how', 'are', 'was', 'were',
	'about', 'that', 'this', 'there', 'from', 'into', 'any', 'all', 'some', 'many', 'much', 'has',
	'have', 'does', 'did', 'can', 'you', 'barmm', 'bangsamoro', 'region', 'regional',
	// Verbs a question is built from. They carry no subject, and left in they
	// match half the corpus — "give" finds every act that says "given".
	'give', 'gives', 'given', 'get', 'gets', 'got', 'tell', 'show', 'find', 'know',
	'want', 'need', 'make', 'made', 'use', 'used', 'say', 'says', 'said', 'see',
	'look', 'list', 'please', 'their', 'its', 'his', 'her', 'our', 'your',
])

const WORD = /[\p{L}\p{N}]+/gu

/**
 * The word to actually look for: the singular, since a record says "beach"
 * and "barangay" where a question says "beaches" and "barangays".
 *
 * Substring matching from there, not a stemmer: "health" has to find
 * "healthcare" and "health-related", and no stemmer earns its size here.
 */
function stem(word: string): string {
	if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2)
	if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1)
	// And the past tense, because a question is asked in it and a statute is
	// never written in it: "can a mayor be recalled" has to reach a section
	// titled "Initiation of the recall process".
	if (word.length > 5 && word.endsWith('ed')) return word.slice(0, -2)
	return word
}

const LETTER = /[\p{L}\p{N}]/u

/**
 * How often a record says `needle`, counted no further than `most`.
 *
 * Only where a word starts. A free substring search let "eat" match
 * "creating", and the answer to "what is there to eat" was four acts of
 * Parliament. The end of the word is left open on purpose, so "health" still
 * finds "healthcare".
 */
function times(hay: string, needle: string, most: number): number {
	let count = 0
	let at = hay.indexOf(needle)
	while (at >= 0 && count < most) {
		if (at === 0 || !LETTER.test(hay[at - 1]!)) count += 1
		at = hay.indexOf(needle, at + needle.length)
	}
	return count
}

/**
 * The rows a question is about, best first.
 *
 * A row named for the thing asked about is nearly always the row wanted, so
 * the title counts heavily. Below it, how *often* a record says the word
 * separates a measure about health from an appropriations act that mentions
 * the health ministry once in a list of offices — and without that, every
 * single-mention record ties and the first eight come back in alphabetical
 * order, which is no answer at all.
 */
/* Two shapes of question that want the whole of something rather than an
   example of it, and they want different wholes.

   COUNTING wants a sum — the region's own counts, the seven-year budget total.
   SUBJECT wants an account — the primer chapter on the thing. They are kept
   apart because they collide: on "how many provinces in BARMM" both the counts
   row and the Local Government chapter carry the word "province" in the title
   and tie exactly, and the tie fell to the chapter, which does not hold the
   number.

   Read off the raw query, because by the time the terms are built every word
   of these is a stop word. Both are gated on the row matching every term of
   the question, so "how many kagawad in a barangay" still reaches the Code
   rule that answers it rather than the region's counts. */
const COUNTING =
	/\bhow many\b|\bhow much\b|\bnumber of\b|\bhow long\b|\btotal\b|\bcount\b|\ball together\b|\baltogether\b/
const SUBJECT = /\bhistory of\b|\boverview\b|\btell me about\b|\bexplain\b|\bbackground\b/

/* A question about who holds something, which is always about the result and
   never about the procedure for arriving at one.
   
   "Who was elected in BARMM" reduces to the single term "elect", and on that
   term three IRR articles about the recall election carry it in their titles —
   worth six — while every member row carries it only in the vocabulary for its
   kind, worth three. So the answer to who was elected was a set of rules for
   unelecting somebody, and the model, handed those, wrote nothing at all.

   The kinds below are the ones that record a result. Nothing is suppressed;
   the result rows are simply lifted over the procedure rows when the question
   is asking who rather than how. */
const WHOLE_SEATS = new Set(['Election', 'Party', 'Member', 'District', 'Reserved seat'])
const WHO = /\bwho\b|\bnominee|\bwinner|\bwho won\b|\bmembers of parliament\b|\belected\b/

export function search(query: string, space?: Space, limit = 8): Entry[] {
	const asked = query.toLowerCase()
	const counting = COUNTING.test(asked)
	const subject = SUBJECT.test(asked)
	const who = WHO.test(asked)
	const terms = [
		...new Set(
			(query.toLowerCase().match(WORD) ?? [])
				// Two characters are noise in a word and the whole question in a
				// number: "section 45" and "act 49" are nothing without them.
				.filter((word) => (word.length > 2 || /^\d\d$/.test(word)) && !IGNORE.has(word))
				.map(stem),
		),
	]
	if (terms.length === 0) return []

	const scored: { entry: Entry; score: number }[] = []
	for (const entry of corpus()) {
		if (space && entry.space !== space) continue
		const title = entry.title.toLowerCase()
		let score = 0
		let matched = 0
		for (const term of terms) {
			// Title, then kind, then the record's own words. Asking for "places"
			// should reach a place before it reaches an act that happens to use
			// the word twice, so the kind outranks anything frequency can earn:
			// two, not four, because a measure with a reading behind it says
			// "health" twenty times and the budget line that *is* the health
			// money says it once.
			const hits = times(title, term, 1)
				? 6
				: entry.asked && times(entry.asked, term, 1)
					? 3
					: times(entry.text, term, 2)
			if (hits > 0) matched += 1
			score += hits
		}
		// Every term, not just one: "health" alone should not outrank a row
		// that answered "health" and "Marawi" both.
		const whole = matched === terms.length
		/* A chapter is the roll-up a subject question wants; a counts row is the
		   one a counting question wants. Neither answers the other's question. */
		const chapter = entry.kind === 'Background'
		const lifted = whole && entry.rollup && (counting ? !chapter : subject && chapter)
		const seated = who && whole && WHOLE_SEATS.has(entry.kind)
		if (score > 0)
			scored.push({ entry, score: score + (whole ? 3 : 0) + (lifted ? 4 : 0) + (seated ? 4 : 0) })
	}

	return scored
		.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
		.slice(0, limit)
		.map((row) => row.entry)
}
