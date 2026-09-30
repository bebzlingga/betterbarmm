/* ============================================================
   The enacted appropriations, as each Act prints them

   Two source files per fiscal year: the budget extraction, which
   carries the shape the Act has — every office with its program
   table and its object-of-expenditure tree, the special purpose
   funds, and the infrastructure projects the Ministry of Public
   Works is funded to build, by province — and the line-item
   extraction, which carries every row the Act names with a sector
   tag on it and the special provisions in full.

   This file does four small things to them and nothing else:

     · gives every office a slug, so it can have a page
     · flattens the sub-offices up beside their parents, because a
       reader looking for the Bangsamoro Information Office does not
       know it is filed under the Office of the Chief Minister
     · flattens the projects out from under their provinces
     · builds one haystack per record, for the finder and the
       assistant

   It does NOT re-derive, re-total or reconcile anything. The Act's
   own figures are reproduced as printed, including the places where
   they do not sum — several ministries print Personnel Services at
   the Operations level only, so the program rows under it add up
   to less than the row above them. That is what the Act says, and a
   transparency site that quietly fixes its source is no longer one.

   Two fiscal years, built by the same function from the same shape
   rather than by two copies of it. `budgetFor` picks one; the bare
   exports at the foot are the latest year, so a page that has no
   opinion about which year it is showing gets the current one.
   ============================================================ */

import { FISCAL_YEARS, LATEST_YEAR, isFiscalYear, yearFrom } from './years'
import raw2026 from '../../../datasets/budget/BAA85_FY2026_budget.json'
import rawLines2026 from '../../../datasets/budget/BAA85_FY2026_line_items.json'
import raw2025 from '../../../datasets/budget/BAA65_FY2025_budget.json'
import rawLines2025 from '../../../datasets/budget/BAA65_FY2025_line_items.json'
import raw2024 from '../../../datasets/budget/BAA56_FY2024_budget.json'
import rawLines2024 from '../../../datasets/budget/BAA56_FY2024_line_items.json'
import raw2023 from '../../../datasets/budget/BAA32_FY2023_budget.json'
import rawLines2023 from '../../../datasets/budget/BAA32_FY2023_line_items.json'
import raw2022 from '../../../datasets/budget/BAA23_FY2022_budget.json'
import rawLines2022 from '../../../datasets/budget/BAA23_FY2022_line_items.json'
import raw2021 from '../../../datasets/budget/BAA15_FY2021_budget.json'
import rawLines2021 from '../../../datasets/budget/BAA15_FY2021_line_items.json'
import raw2020 from '../../../datasets/budget/BAA03_FY2020_budget.json'
import rawLines2020 from '../../../datasets/budget/BAA03_FY2020_line_items.json'

/* ---- What the Act holds ------------------------------------------------ */

/** The three columns every table in the Act carries. */
export type Totals = {
	personnel_services: number
	mooe: number
	capital_outlays: number
	total: number
}

/**
 * One row of an office's program table.
 *
 * `category` is the Act's own distinction: a `cost_structure` row is one of
 * the three headings every office is budgeted under — General Administration
 * and Support, Support to Operations, Operations — and a `program` row is
 * something the office actually does, nested under Operations.
 */
export type ProgramLine = Totals & {
	name: string
	category: 'cost_structure' | 'program'
	cost_structure: string | null
	group_header_only?: boolean
	children?: ProgramLine[]
}

/** One node of the object-of-expenditure tree: what the money is spent on. */
export type ObjectLine = {
	name: string
	expense_class: string | null
	amount: number | null
	amount_derived_from_children?: boolean
	children?: ObjectLine[]
}

/** One of the 258 line-item projects in the Ministry of Public Works. */
export type Project = {
	id: string
	project: string
	amount: number
	source_page?: number
	/** The province heading the Act lists the project under. */
	province: string
	/** What is being built — "Road", "Bridge". A project can be two things. */
	kinds: string[]
}

type RawEntity = {
	code: string
	name: string
	name_official: string
	entity_type: 'agency' | 'special_purpose_fund' | 'sub_office'
	office_type: string
	budget_group: string
	source_pages: number[]
	appropriation_stated: number
	totals: Totals
	appropriations_by_program: ProgramLine[]
	appropriations_by_object?: ObjectLine[]
	sub_offices?: RawEntity[]
	total_including_sub_offices?: number
	total_current_operating_expenditures?: number
	infrastructure_projects?: {
		total: number
		count: number
		by_province: { province: string; count: number; total: number; projects: Omit<Project, 'province'>[] }[]
	}
}

type RawAct = {
	metadata: {
		source_document: string
		short_title: string
		enacting_body: string
		fiscal_year: number
		period: string
		currency: string
		/** Null where the Act states no aggregate: BAA No. 3 (FY 2020) states none. */
		total_appropriation_per_section_1: number | null
		total_appropriation_computed: number
		/** Null where there is no stated figure to reconcile against. */
		reconciles_with_section_1: boolean | null
		/** Only where the Act does not add up: what is missing, and whose fault. */
		reconciliation_note?: string
		extracted_on: string
		structure_notes: string[]
	}
	summary: {
		grand_total: Totals
		by_budget_group: Record<string, Totals>
		by_agency: (Totals & {
			code: string
			agency: string
			budget_group: string
			office_type: string
			total_including_sub_offices: number
			share_of_total_pct: number
		})[]
	}
	agencies: RawEntity[]
	special_purpose_funds: RawEntity[]
	flat_programs: (Totals & {
		agency_code: string
		agency: string
		office_code: string | null
		office: string | null
		cost_structure: string | null
		level: 'program' | 'sub_program'
		program_path: string
		program: string
	})[]
}

/**
 * The URL-safe name. Codes in the Act are roman numerals — Part VIII is
 * education — and `/offices/VIII` tells a reader nothing and survives no
 * reordering. The name does both.
 */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
}

type RawLineItem = {
	id: string
	item_type: 'program' | 'sub_program' | 'infrastructure_project' | 'special_provision' | 'special_provision_sub_item'
	budget_group: string
	sector: string
	agency_code: string
	agency: string
	office_code: string | null
	office: string | null
	cost_structure: string | null
	parent_program: string | null
	program_path: string
	name: string
	province?: string
	infrastructure_type?: string[]
	provision_text?: string
	has_stated_amount?: boolean
	group_header_only?: boolean
	personnel_services: number | null
	mooe: number | null
	capital_outlays: number | null
	amount: number | null
	tags: string[]
	search_text: string
	source_page: number
}

type RawLineItems = {
	metadata: { fiscal_year: number; extracted_on: string; counts: Record<string, number> }
	taxonomy: { tag: string; description: string; keywords: string[] }[]
	tag_index: Record<
		string,
		{
			count: number
			total_amount_program_rows: number
			total_amount_special_provisions: number
			total_amount_infrastructure_projects: number
			item_ids: string[]
		}
	>
	line_items: RawLineItem[]
}

/* ---- The programs ---------------------------------------------------- */

export type ProgramRow = Totals & {
	id: string
	name: string
	path: string
	level: 'program' | 'sub_program'
	costStructure: string | null
	office: string
	officeSlug: string
	/** The one sector this row is filed under. */
	sector: string
	sectorSlug: string
	/** Every sector it touches, the primary one included. */
	tags: string[]
	sourcePage: number
	share: number
	haystack: string
}

/* ---- The special provisions -------------------------------------------- */

/**
 * One numbered rule attached to an office's money, with the lettered sub-items
 * printed under it.
 *
 * `amount` is the figure the provision itself states, where it states one —
 * "the amount of Four Hundred Eighty Million Pesos herein appropriated shall
 * be used exclusively for…". It is a slice of the office's appropriation
 * rather than money on top of it, so provisions are never added to a total.
 */
export type Provision = {
	id: string
	title: string
	text: string
	amount: number | null
	office: string
	officeSlug: string
	sector: string
	sectorSlug: string
	tags: string[]
	sourcePage: number
	items: { id: string; text: string; depth: number; amount: number | null }[]
	haystack: string
}

/**
 * Sub-items nest more than one level in a few sections — `SP-XVI-1.1.1` sits
 * under `SP-XVI-1.1`, which is itself a sub-item. They are kept as a flat list
 * with a depth rather than built into a tree: the depth is what the indent
 * needs and it is already in the id, and a two-level tree for the fifteen rows
 * that use it would be a structure the other four hundred do not.

/* ---- The sectors ------------------------------------------------------ */

/**
 * What the money is for, across every office that spends on it.
 *
 * The Act is organized by who spends, which answers the wrong question: a
 * reader asking what the region spends on water has to know in advance that
 * the answer is split across public works, health, local government and two
 * special funds. These are the same rows filed by sector instead, from the
 * tagging in the extraction.
 *
 * A row can carry several sectors and most carry one. The totals below are
 * therefore overlapping and must never be added together — a program tagged
 * both Health and Infrastructure is counted in both, which is right for "what
 * touches health" and wrong for any sum of the whole.
 */
export type Sector = {
	/** What a reader calls it. The taxonomy names one sector with a slash —
	    "Lump-sum / Special Purpose Fund" — where the half before it is the
	    filing word and the half after it is the name anybody uses. */
	name: string
	/** The taxonomy's own string, which is what program and provision rows are
	    tagged with. Look rows up by this, never by `name`. */
	tag: string
	slug: string
	description: string
	count: number
	/** Program rows only. Provisions and projects are slices of these. */
	total: number
	provisionTotal: number
	projectTotal: number
}

/* ---- The offices ------------------------------------------------------- */

/**
 * An office, fund or attached agency with a page of its own.
 *
 * Sub-offices are entities here rather than rows inside their parent. The
 * Bangsamoro Information Office has its own appropriation, its own program
 * table and its own object tree — everything a ministry has — and a reader
 * looking for it has no reason to know the Act files it under the Office of
 * the Chief Minister. It keeps `parent` so its page can say where it sits and
 * the parent's page can list it.
 */
export type Office = {
	slug: string
	code: string
	name: string
	nameOfficial: string
	kind: 'agency' | 'special_purpose_fund' | 'sub_office'
	officeType: string
	budgetGroup: string
	sourcePages: number[]
	totals: Totals
	/** The figure Section 1 of the Act states for this entity. */
	stated: number
	/** With attached agencies folded in, where the Act prints such a figure. */
	totalWithSubOffices: number
	programs: ProgramLine[]
	objects: ObjectLine[]
	projects: Project[]
	parent: { slug: string; name: string } | null
	subOffices: { slug: string; name: string; total: number }[]
	/** Its share of the whole appropriation, as a percentage. */
	share: number
	/** Lower-case words this office can be found by. */
	haystack: string
}



function programWords(lines: ProgramLine[]): string {
	return lines
		.map((line) => `${line.name} ${line.children ? programWords(line.children) : ''}`)
		.join(' ')
}

/**
 * One fiscal year, derived from its own two extractions.
 *
 * Everything below was module-level state against a single Act. It is a
 * function now because there are two of them, and two copies of six hundred
 * lines would drift the first time one was fixed.
 *
 * The page offset is not passed in. Each Act's PDF runs some number of pages
 * ahead of its own printed numbering, because of cover matter, and it is not
 * the same every year — three for FY 2026, two for FY 2025 and FY 2024. Every
 * extraction states its own in `structure_notes`, so it is read from there
 * rather than kept as a list beside the imports, where a year added to the map
 * could quietly cite the wrong pages of the right Act.
 */
function buildYear(act: RawAct, lines: RawLineItems) {
	/* "source_pages refer to PDF page indices (PDF page = printed page + 3)." */
	const budgetPageOffset = Number(
		act.metadata.structure_notes
			.find((one) => /printed page \+ \d/.test(one))
			?.match(/printed page \+ (\d+)/)?.[1] ?? 0,
	)

	/* The figure every share on the site is taken against. Section 1 states it
	   in five of the seven Acts; BAA No. 3 (FY 2020) states no aggregate at all,
	   so the sum of its own sections stands in — which is the figure that Act's
	   introduction cites anyway. Falling back rather than carrying a null keeps
	   every `x / GRAND_TOTAL` on this page a number instead of a NaN. */
	const statedTotal = act.metadata.total_appropriation_per_section_1
	const GRAND_TOTAL = statedTotal ?? act.metadata.total_appropriation_computed

	/* ---- Every line the Act names ------------------------------------------

	   A second extraction beside the first: the same 253 program rows and 258
	   projects, plus the 449 special provisions that were nowhere in the workspace
	   before, and a sector tag on all of them.

	   The provisions are the addition that changes what this site can answer. A
	   program row says an office was given money; a provision says what the Act
	   requires it to do with that money — who it must go to, what it may not be
	   spent on, what has to be reported and to whom. It is the half of an
	   appropriation that a reader actually wants and the half nobody publishes.

	   Where the two files overlap they agree, and this one is the better copy:
	   the same amounts to the peso, with three hospital names punctuated properly
	   and a source page on every row. So programs and projects are read from
	   here, and `BAA85_FY2026_budget.json` keeps what only it holds — the office
	   totals, the nested program table, and the object-of-expenditure tree. */

	/**
 * The province a project's heading names, as a province.
 *
 * The Act files construction under the Ministry of Public Works' engineering
 * districts, not under provinces: "Lanao Del Sur I" and "Lanao Del Sur II" are
 * two districts of one province, and a page that lists them apart is showing a
 * reader the ministry's own filing rather than their province. They are merged
 * (user decision), and the same for Sulu's and Maguindanao's districts.
 *
 * What is NOT merged is a province that actually changed. Maguindanao split
 * into Del Norte and Del Sur in 2022, so the pre-split "Maguindanao" and the
 * two that replaced it are three different places and stay three lines — the
 * numerals are districts of one province, the compass points are provinces.
 *
 * An explicit table rather than stripping a trailing numeral, because the two
 * look alike and mean opposite things. Anything unlisted falls through as
 * printed, and `check.ts` asserts the whole set so a new Act's spelling
 * surfaces as a failure instead of a quietly separate column.
 */
const PROVINCES: Record<string, string> = {
	'lanao i': 'Lanao del Sur',
	'lanao ii': 'Lanao del Sur',
	'lanao del sur i': 'Lanao del Sur',
	'lanao del sur ii': 'Lanao del Sur',
	'maguindanao i': 'Maguindanao',
	'maguindanao ii': 'Maguindanao',
	'maguindanao del norte': 'Maguindanao del Norte',
	'maguindanao del sur': 'Maguindanao del Sur',
	'sulu i': 'Sulu',
	'sulu ii': 'Sulu',
	'tawi-tawi': 'Tawi-Tawi',
	'special geographic area (63 barangays)': 'Special Geographic Area',
}

const provinceOf = (raw: string): string => PROVINCES[raw.toLowerCase()] ?? raw

/** Where a project sits when the Act names no place for it. */
const REGION_WIDE = 'Region-wide'

/**
 * Projects the extraction filed under the province heading above them, where
 * the Act itself names no place at all.
 *
 * FY 2025's "Installation of Solar Street Lights" is ₱520 million — the largest
 * single project in that Act and a fifth of everything its Cotabato City column
 * held. The Act does not put it in Cotabato City; the heading it happened to
 * fall under did, and a reader asking what is being built in their city was
 * being shown half a billion pesos of somebody else's.
 *
 * Corrected by id rather than by a rule. It is the only row in seven Acts that
 * names nowhere: every other name without a place clause carries its
 * municipality inside it — "Maluso", "Bongao", "Expansion of Bongao Port Phase
 * V" — and a heuristic sharp enough to tell those apart would be wrong more
 * often than this list is long.
 */
const UNPLACED = new Set(['2025:INF-0645'])

/** The office a row belongs to: the attached agency where there is one. */
	const ownerOf = (row: RawLineItem) => row.office ?? row.agency

	const programs: ProgramRow[] = lines.line_items
		.filter((row) => row.item_type === 'program' || row.item_type === 'sub_program')
		// The Act prints seven program rows as headings with no figures against
		// them; their children carry the amounts. A heading with a blank where the
		// money should be is not a row a reader can do anything with.
		.filter((row) => !row.group_header_only && row.amount != null)
		.map((row) => {
			const owner = ownerOf(row)
			const total = row.amount ?? 0
			return {
				id: row.id,
				name: row.name,
				path: row.program_path,
				level: row.item_type as 'program' | 'sub_program',
				costStructure: row.cost_structure,
				office: owner,
				officeSlug: slugify(owner),
				sector: row.sector,
				sectorSlug: slugify(row.sector),
				tags: row.tags,
				sourcePage: row.source_page,
				personnel_services: row.personnel_services ?? 0,
				mooe: row.mooe ?? 0,
				capital_outlays: row.capital_outlays ?? 0,
				total,
				share: GRAND_TOTAL > 0 ? (total / GRAND_TOTAL) * 100 : 0,
				haystack: `${row.search_text} ${owner} ${row.cost_structure ?? ''} ${row.tags.join(' ')}`.toLowerCase(),
			}
		})
		.sort((a, b) => b.total - a.total)

	/* ---- The projects ------------------------------------------------------ */

	/**
	 * The 258 line-item infrastructure projects, largest first.
	 *
	 * These are the most answerable lines in the whole Act — a road with a
	 * barangay's name on it and a peso figure beside it — and until now they were
	 * buried fifteen pages into a ministry's table. Each now carries what kind of
	 * thing it is, so "every bridge in the region" is a question with an answer.
	 */
	const projects: Project[] = lines.line_items
		.filter((row) => row.item_type === 'infrastructure_project')
		.map((row) => ({
			id: row.id,
			project: row.name,
			amount: row.amount ?? 0,
			province: UNPLACED.has(`${act.metadata.fiscal_year}:${row.id}`)
				? REGION_WIDE
				: provinceOf(row.province ?? 'Unstated'),
			kinds: row.infrastructure_type ?? [],
			source_page: row.source_page,
		}))
		.sort((a, b) => b.amount - a.amount)

	const projectsByOwner = new Map<string, Project[]>()
	for (const row of lines.line_items) {
		if (row.item_type !== 'infrastructure_project') continue
		const owner = ownerOf(row)
		const found = projects.find((one) => one.id === row.id)
		if (found) projectsByOwner.set(owner, [...(projectsByOwner.get(owner) ?? []), found])
	}

	const projectsByProvince = [
		...projects.reduce((groups, project) => {
			const group = groups.get(project.province) ?? { province: project.province, projects: [], total: 0 }
			group.projects.push(project)
			group.total += project.amount
			return groups.set(project.province, group)
		}, new Map<string, { province: string; projects: Project[]; total: number }>()),
	]
		.map(([, group]) => group)
		.sort((a, b) => b.total - a.total)

	const projectsTotal = projects.reduce((sum, project) => sum + project.amount, 0)

	/** The kinds of thing being built, commonest first — "Road", "Bridge". */
	const projectKinds = [
		...projects.reduce((counts, project) => {
			for (const kind of project.kinds) {
				const one = counts.get(kind) ?? { kind, count: 0, total: 0 }
				one.count += 1
				one.total += project.amount
				counts.set(kind, one)
			}
			return counts
		}, new Map<string, { kind: string; count: number; total: number }>()),
	]
		.map(([, one]) => one)
		.sort((a, b) => b.count - a.count)

	const provisionItems = new Map<string, Provision['items']>()
	for (const row of lines.line_items) {
		if (row.item_type !== 'special_provision_sub_item') continue
		const base = row.id.split('.')[0]!
		const list = provisionItems.get(base) ?? []
		list.push({
			id: row.id,
			text: row.provision_text ?? row.name,
			depth: (row.id.match(/\./g) ?? []).length,
			amount: row.amount,
		})
		provisionItems.set(base, list)
	}

	const provisions: Provision[] = lines.line_items
		.filter((row) => row.item_type === 'special_provision')
		.map((row) => {
			const owner = ownerOf(row)
			const items = provisionItems.get(row.id) ?? []
			return {
				id: row.id,
				title: row.name,
				text: row.provision_text ?? '',
				amount: row.has_stated_amount ? row.amount : null,
				office: owner,
				officeSlug: slugify(owner),
				sector: row.sector,
				sectorSlug: slugify(row.sector),
				tags: row.tags,
				sourcePage: row.source_page,
				items,
				haystack: `${row.search_text} ${owner} ${row.tags.join(' ')} ${items
					.map((item) => item.text)
					.join(' ')}`.toLowerCase(),
			}
		})

	const provisionsBySlug = new Map<string, Provision[]>()
	for (const provision of provisions) {
		provisionsBySlug.set(provision.officeSlug, [
			...(provisionsBySlug.get(provision.officeSlug) ?? []),
			provision,
		])
	}

	/** The rules attached to one office's money, in the order the Act prints them. */
	const provisionsFor = (officeSlug: string): Provision[] =>
		provisionsBySlug.get(officeSlug) ?? []

	const sectors: Sector[] = lines.taxonomy
		.map((entry) => {
			const index = lines.tag_index[entry.tag]
			return {
				name: entry.tag.replace(/.* \/ /, ''),
				tag: entry.tag,
				/* Off the tag, not the shortened name: the slug is the URL, and
				   renaming a sector for the eye is not a reason to break its page. */
				slug: slugify(entry.tag),
				description: entry.description,
				count: index?.count ?? 0,
				total: index?.total_amount_program_rows ?? 0,
				provisionTotal: index?.total_amount_special_provisions ?? 0,
				projectTotal: index?.total_amount_infrastructure_projects ?? 0,
			}
		})
		.sort((a, b) => b.total - a.total || b.count - a.count)

	const sectorBySlug = new Map(sectors.map((sector) => [sector.slug, sector]))

	const findSector = (slug: string): Sector | undefined => sectorBySlug.get(slug)

	/** Everything filed under one sector, each kind largest first. Takes the
	    sector's `tag`, which is the string the rows carry, not its display name. */
	function sectorContents(tag: string) {
		const tagged = <T extends { tags: string[] }>(rows: T[]) => rows.filter((row) => row.tags.includes(tag))
		return {
			programs: tagged(programs),
			provisions: tagged(provisions),
			projects: projects.filter(() => tag === 'Infrastructure'),
		}
	}

	function toOffice(entity: RawEntity, parent: RawEntity | null): Office {
		const programs = entity.appropriations_by_program ?? []
		const built = projectsByOwner.get(entity.name) ?? []

		return {
			slug: slugify(entity.name),
			code: entity.code,
			name: entity.name,
			nameOfficial: entity.name_official,
			kind: entity.entity_type,
			officeType: entity.office_type,
			budgetGroup: entity.budget_group,
			sourcePages: entity.source_pages ?? [],
			totals: entity.totals,
			stated: entity.appropriation_stated,
			totalWithSubOffices: entity.total_including_sub_offices ?? entity.totals.total,
			programs,
			objects: entity.appropriations_by_object ?? [],
			projects: built,
			parent: parent ? { slug: slugify(parent.name), name: parent.name } : null,
			subOffices: (entity.sub_offices ?? []).map((sub) => ({
				slug: slugify(sub.name),
				name: sub.name,
				total: sub.totals.total,
			})),
			share: GRAND_TOTAL > 0 ? (entity.totals.total / GRAND_TOTAL) * 100 : 0,
			haystack: [
				entity.name,
				entity.name_official,
				entity.office_type,
				entity.budget_group,
				parent?.name,
				programWords(programs),
				built.map((one) => `${one.province} ${one.kinds.join(' ')}`).join(' '),
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase(),
		}
	}

	/**
	 * Every office with a page, parents and their attached agencies alike, ordered
	 * largest first.
	 *
	 * Largest first rather than in the Act's part order: the Act is ordered by
	 * constitutional precedence, which puts a ₱7B Parliament above a ₱26B
	 * education ministry, and nobody arrives at a budget looking for precedence.
	 */
	const offices: Office[] = [
		...act.agencies.flatMap((agency) => [
			toOffice(agency, null),
			...(agency.sub_offices ?? []).map((sub) => toOffice(sub, agency)),
		]),
		...act.special_purpose_funds.map((fund) => toOffice(fund, null)),
	].sort((a, b) => b.totals.total - a.totals.total)

	const bySlug = new Map(offices.map((office) => [office.slug, office]))

	const findOffice = (slug: string): Office | undefined => bySlug.get(slug)

	/** The three groups Section 1 divides the appropriation into. */
	const budgetGroups = Object.entries(act.summary.by_budget_group).map(([name, totals]) => ({
		name,
		totals,
		share: GRAND_TOTAL > 0 ? (totals.total / GRAND_TOTAL) * 100 : 0,
		offices: offices.filter((office) => office.budgetGroup === name && office.kind !== 'sub_office').length,
	}))

	/* ---- The Act itself ---------------------------------------------------- */



	/* The FY 2025 extraction's `short_title` reads "BAA No. 85 (FY 2025 GAAB)",
	   which is the FY 2026 Act's number on the FY 2025 Act. `source_document`
	   has it right — "Bangsamoro Autonomy Act No. 65" — so the number is taken
	   from there and the short title rebuilt around it. Not a figure being
	   corrected: it is the name of the document every figure on the page is
	   claimed to come from, and a page that cites the wrong Act is worse than a
	   page that cites none. */
	const actNumber = act.metadata.source_document.match(/Act No\.\s*(\d+)/i)?.[1]

	const budget = {
		fiscalYear: act.metadata.fiscal_year,
		act: actNumber
			? `BAA No. ${actNumber} (FY ${act.metadata.fiscal_year} GAAB)`
			: act.metadata.short_title,
		actLong: act.metadata.source_document,
		enactedBy: act.metadata.enacting_body,
		period: act.metadata.period,
		extractedOn: act.metadata.extracted_on,
		/* Whether the parts add up to the figure Section 1 states. Five of the
		   seven Acts they do. FY 2022's printed section totals come to ₱47,870.72
		   less than its own Section 1, and FY 2020's Section 1 states no figure to
		   check against — both faults in the Acts as printed rather than in the
		   extraction, so they are carried rather than corrected and the note
		   beside them is what the pages say instead of quietly picking a figure.
		   `=== true` because the field is tri-state: false is "does not add up",
		   null is "there is nothing to add up to". */
		reconciles: act.metadata.reconciles_with_section_1 === true,
		/** Whether Section 1 states an aggregate for this Act at all. */
		statesTotal: statedTotal !== null,
		reconciliationNote: act.metadata.reconciliation_note ?? null,
		notes: act.metadata.structure_notes,
		total: GRAND_TOTAL,
		totals: act.summary.grand_total,
		/** Offices with a page, not counting the attached agencies. */
		officeCount: offices.filter((office) => office.kind === 'agency').length,
		fundCount: offices.filter((office) => office.kind === 'special_purpose_fund').length,
		programCount: programs.length,
		projectCount: projects.length,
		provisionCount: provisions.length,
		/** Including the lettered sub-items printed under them. */
		provisionItemCount: provisions.reduce((sum, one) => sum + one.items.length, 0),
		sectorCount: sectors.length,
		sourcePdf: 'FY-2026-GAAB.pdf',
		/** PDF page = printed page + 3, per the extraction notes. */
		pdfPageOffset: budgetPageOffset,
	}

	/**
	 * The Act's own page numbers for a record, collapsed into spans: "136–150, 158".
	 *
	 * Two things at once, and both belong here rather than in a component. The
	 * extraction indexes PDF pages and the Act numbers itself three pages behind
	 * that, so the number a reader holding the document is looking at has to be
	 * converted; and a record can carry two hundred page numbers, which is a
	 * paragraph of digits where the span is the fact.
	 */
	function printedPages(pdfPages: number[] | undefined): string | null {
		const printed = [...new Set((pdfPages ?? []).map((page) => page - budgetPageOffset))]
			.filter((page) => page > 0)
			.sort((a, b) => a - b)
		if (printed.length === 0) return null

		const spans: string[] = []
		for (let at = 0; at < printed.length; at += 1) {
			const start = printed[at]!
			let end = start
			while (printed[at + 1] === end + 1) {
				end += 1
				at += 1
			}
			spans.push(start === end ? `${start}` : `${start}–${end}`)
		}

		return spans.join(', ')
	}

	function searchBudget(query: string, limit = 8): Hit[] {
		const term = query.trim().toLowerCase()
		if (term.length < 2) return []

		const hits: Hit[] = []
		const room = () => hits.length < limit

		// Sectors first, and there are only 38 of them: somebody who typed
		// "health" wants everything on health before they want any one row of it,
		// and the sector page is the only thing that can give them that.
		for (const sector of sectors) {
			if (!room()) return hits
			// The tag as well as the shown name: the taxonomy files one sector under
			// "Lump-sum / Special Purpose Fund" and shows it as the second half, and
			// somebody who typed "lump" is looking for exactly that row.
			if (!`${sector.name} ${sector.tag}`.toLowerCase().includes(term)) continue
			hits.push({
				type: 'sector',
				title: sector.name,
				where: `${sector.count} lines across the Act`,
				amount: sector.total,
				href: `/sectors/${sector.slug}`,
			})
		}

		for (const office of offices) {
			if (!room()) return hits
			if (!office.haystack.includes(term)) continue
			hits.push({
				type: 'office',
				title: office.name,
				where: office.parent ? `${office.officeType} · under ${office.parent.name}` : office.officeType,
				amount: office.totals.total,
				href: `/offices/${office.slug}`,
			})
		}

		for (const program of programs) {
			if (!room()) return hits
			if (!program.haystack.includes(term)) continue
			hits.push({
				type: 'program',
				title: program.name,
				where: program.office,
				amount: program.total,
				href: `/programs?q=${encodeURIComponent(program.name)}`,
			})
		}

		// Provisions below programs: a rule about the money is what a reader
		// wants second, once they know the money exists.
		for (const provision of provisions) {
			if (!room()) return hits
			if (!provision.haystack.includes(term)) continue
			hits.push({
				type: 'provision',
				title: provision.title,
				where: `Special provision · ${provision.office}`,
				amount: provision.amount,
				href: `/offices/${provision.officeSlug}#${provision.id}`,
			})
		}

		for (const project of projects) {
			if (!room()) return hits
			if (
				!project.project.toLowerCase().includes(term) &&
				!project.province.toLowerCase().includes(term) &&
				!project.kinds.some((kind) => kind.toLowerCase().includes(term))
			)
				continue
			hits.push({
				type: 'project',
				title: project.project,
				where: `${project.kinds[0] ?? 'Project'} · ${project.province}`,
				amount: project.amount,
				href: `/projects?q=${encodeURIComponent(project.province)}`,
			})
		}

		return hits
	}

	return {
		budget,
		offices,
		findOffice,
		budgetGroups,
		programs,
		projects,
		projectsByProvince,
		projectsTotal,
		projectKinds,
		provisions,
		provisionsFor,
		sectors,
		findSector,
		sectorContents,
		printedPages,
		searchBudget,
	}
}

/* ---- Reading the figures ----------------------------------------------- */

/** The full peso amount, for a table cell or a source line. */
/**
 * A peso figure, to the centavo.
 *
 * Two decimals always, including `.00`. It used to round, which was wrong in
 * the one place it mattered most: the Act appropriates ₱114,077,644,141.90 in
 * total and the rounded figure read ₱114,077,644,142 — ten centavos the Act
 * does not say, printed as the headline of a workspace whose whole claim is
 * that a figure can be checked against the page it came from.
 *
 * Only two amounts in FY 2026 carry centavos, so the cost of this is `.00` on
 * every other figure. That is the right trade: a trailing `.00` tells a reader
 * the figure is exact, where a rounded one silently is not.
 */
export const peso = (amount: number): string =>
	`₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * The amount as somebody would say it out loud — "₱26.5 billion".
 *
 * Spelled rather than suffixed: "26.5B" is a spreadsheet's way of putting it,
 * and the reader this workspace is for has never had to read one.
 */
export function pesoShort(amount: number): string {
	const [figure, unit] = scaled(amount)
	return unit ? `₱${figure} ${unit}` : peso(amount)
}

/** The same, short enough for an axis or a chip: "₱ 26.5B".
 *
 * The space after the sign is a non-breaking one (user decision): it is there
 * to separate the mark from the figure, and a chart label or a stat tile that
 * wrapped a lone ₱ onto its own line would be worse than no space at all. */
export function pesoTight(amount: number): string {
	const [figure, unit] = scaled(amount)
	return unit ? `₱ ${figure}${unit[0]!.toUpperCase()}` : `₱ ${Math.round(amount)}`
}

/**
 * The figure and the unit to say it in.
 *
 * A tenth of a billion is ₱100 million, so billions always keep their decimal
 * — "₱114.1 billion" and never "₱114 billion". A tenth of a million is ₱100,000
 * and stops mattering once the figure is in the hundreds, so millions drop it
 * there: "₱958 million", not "₱958.4 million". Precision follows the unit
 * rather than the size of the number, which is what stops the same amount
 * reading two different ways in two places on one page.
 */
function scaled(amount: number): [string, '' | 'billion' | 'million' | 'thousand'] {
	const abs = Math.abs(amount)
	if (abs >= 1_000_000_000) return [fixed(amount / 1_000_000_000, 1), 'billion']
	if (abs >= 1_000_000) return [fixed(amount / 1_000_000, abs >= 100_000_000 ? 0 : 1), 'million']
	if (abs >= 1_000) return [fixed(amount / 1_000, 0), 'thousand']
	return ['', '']
}

const fixed = (value: number, digits: number) => value.toFixed(digits).replace(/\.0$/, '')

/**
 * A rule's text, split so its amounts can be set apart from its words.
 *
 * The Act writes every amount twice — "Four Hundred Eighty Million Pesos
 * (₱480,000,000.00)" — and a reader scanning a page of provisions is looking
 * for the second one. Only the numeral is marked: bolding the spelled-out half
 * as well would leave most of the sentence bold and mark nothing.
 *
 * Amounts only (user decision), which is a peso mark and the digits behind it.
 * A percentage, a deadline in days and a section number are all numbers too,
 * and marking those put weight on half the sentence and lost the money in it.
 *
 * The mark is not always ₱. Across the seven Acts the provisions write it ₱ 709
 * times, as a bare P 521 times and as PhP 21 — the earlier Acts mostly use the
 * letter — so matching the sign alone left two fifths of the money unmarked.
 *
 * The digits are not always grouped cleanly either: the Act prints figures like
 * "P 4, 238, 704, 833.54" with a space after each comma, and a pattern that
 * stopped at the first space bolded "P 4," and left the rest as prose. Groups
 * may carry that space; a bare P must start at a word boundary, so a code or a
 * word ending in P is not mistaken for money.
 */
const AMOUNT = /((?:₱|\bP(?:[Hh][Pp])?)\s?\d+(?:,\s?\d{3})*(?:\.\d+)?)/
const AMOUNT_ONLY = new RegExp(`^${AMOUNT.source}$`)

export const splitAmounts = (text: string): { text: string; amount: boolean }[] =>
	text
		.split(new RegExp(AMOUNT.source, 'g'))
		.filter((part) => part !== '')
		.map((part) => ({ text: part, amount: AMOUNT_ONLY.test(part) }))

export const formatNumber = (value: number): string => value.toLocaleString('en-PH')

/** A share of the whole. One decimal, because a tenth of this budget is ₱114M. */
export const percent = (value: number, digits = 1): string =>
	`${value.toFixed(digits).replace(/\.0$/, '')}%`

/** The three expense classes, in the order the Act prints them. */
export const EXPENSE_CLASSES = [
	{
		key: 'personnel_services' as const,
		short: 'PS',
		label: 'Personnel Services',
		plain: 'Salaries and benefits of the people who work for the region.',
		tone: 'var(--exp-ps)',
	},
	{
		key: 'mooe' as const,
		short: 'MOOE',
		label: 'Maintenance and Other Operating Expenses',
		plain: 'Running everything day to day — supplies, fuel, utilities, training, grants.',
		tone: 'var(--exp-mooe)',
	},
	{
		key: 'capital_outlays' as const,
		short: 'CO',
		label: 'Capital Outlays',
		plain: 'Things that outlast the year — roads, buildings, equipment, vehicles.',
		tone: 'var(--exp-co)',
	},
]

/* ---- Finding something ------------------------------------------------- */

export type Hit = {
	type: 'office' | 'sector' | 'program' | 'provision' | 'project'
	title: string
	where: string
	/** Null where the record carries no figure of its own — most provisions. */
	amount: number | null
	href: string
}

/**
 * Everything a reader might type, searched at once.
 *
 * Offices first, then programs, then projects — an office row carries the
 * total the others are slices of, so somebody who typed "education" wants the
 * ministry before they want one of its programs. Within each kind it is
 * largest first, which is already the order the arrays are in.
 *
 * A plain substring scan over 44 offices, 253 programs and 258 projects.
 * That is 555 rows; anything cleverer would take longer to load than it saves.

/** Everything one fiscal year holds. */
export type BudgetYear = ReturnType<typeof buildYear>

/* Re-exported so a server component needs one import, not two. A client
   component takes them from `@betterbarmm/budget-data/years` instead, which
   carries no data with it. */
export { FISCAL_YEARS, LATEST_YEAR, isFiscalYear, yearFrom }

const YEARS: Record<number, BudgetYear> = {
	2026: buildYear(raw2026 as unknown as RawAct, rawLines2026 as unknown as RawLineItems),
	2025: buildYear(raw2025 as unknown as RawAct, rawLines2025 as unknown as RawLineItems),
	2024: buildYear(raw2024 as unknown as RawAct, rawLines2024 as unknown as RawLineItems),
	2023: buildYear(raw2023 as unknown as RawAct, rawLines2023 as unknown as RawLineItems),
	2022: buildYear(raw2022 as unknown as RawAct, rawLines2022 as unknown as RawLineItems),
	2021: buildYear(raw2021 as unknown as RawAct, rawLines2021 as unknown as RawLineItems),
	2020: buildYear(raw2020 as unknown as RawAct, rawLines2020 as unknown as RawLineItems),
}

/** Everything one fiscal year holds, for the year a `?fy=` asks for. */
export function budgetFor(fy?: string | number | null): BudgetYear {
	return YEARS[yearFrom(fy)]!
}

/* The latest year under its own names, so every page that has no year to think
   about goes on importing exactly what it imported before. */
export const {
	budget,
	offices,
	findOffice,
	budgetGroups,
	programs,
	projects,
	projectsByProvince,
	projectsTotal,
	projectKinds,
	provisions,
	provisionsFor,
	sectors,
	findSector,
	sectorContents,
	printedPages,
	searchBudget,
} = YEARS[LATEST_YEAR]!
