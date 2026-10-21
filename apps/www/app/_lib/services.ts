import dataset from '../../../../datasets/services/offices.json'
import budget2026 from '../../../../datasets/budget/BAA85_FY2026_line_items.json'

/* ============================================================
   What the Bangsamoro Government offers, office by office

   One record per office: its mandate, the programs it runs and the
   services it gives over the counter, each with who it is for and
   where it was read. A service is as its Citizen's Charter states it —
   requirements, fee, processing time — because that is the document
   the office is bound to; a program is as the office describes it.
   Nothing here is written by us except the plain-words summaries.
   ============================================================ */

export type Audience =
	| 'everyone'
	| 'students'
	| 'teachers'
	| 'out-of-school-youth'
	| 'youth'
	| 'children'
	| 'women'
	| 'senior-citizens'
	| 'persons-with-disability'
	| 'indigenous-peoples'
	| 'settlers'
	| 'farmers'
	| 'fisherfolk'
	| 'workers'
	| 'job-seekers'
	| 'overseas-workers'
	| 'businesses'
	| 'cooperatives'
	| 'investors'
	| 'families-in-need'
	| 'patients'
	| 'pilgrims'
	| 'ulama'
	| 'former-combatants'
	| 'local-governments'
	| 'government-offices'
	| 'researchers'
	| 'travellers'

/** The shelf an item is listed on: what the reader needs, not which office gives it. Set on every item an office with a charter lists. */
export type Category =
	| 'health'
	| 'assistance'
	| 'education'
	| 'livelihood'
	| 'farming'
	| 'housing'
	| 'legal'
	| 'business'
	| 'permits'
	| 'requests'
	| 'community'
	| 'suppliers'
	| 'government'

/** In the order the page offers them: what a citizen looks for first, what only suppliers and offices need last. */
export const CATEGORIES: { id: Category; label: string }[] = [
	{ id: 'health', label: 'Health & medical care' },
	{ id: 'assistance', label: 'Cash & social assistance' },
	{ id: 'education', label: 'Education, scholarships & research' },
	{ id: 'livelihood', label: 'Jobs, training & livelihood' },
	{ id: 'farming', label: 'Farming & fishing' },
	{ id: 'housing', label: 'Housing & land' },
	{ id: 'legal', label: 'Legal help & protection' },
	{ id: 'business', label: 'Business & cooperatives' },
	{ id: 'permits', label: 'Permits, licences & accreditation' },
	{ id: 'requests', label: 'Documents & records' },
	{ id: 'community', label: 'Venues, libraries & public information' },
	{ id: 'suppliers', label: 'For suppliers & contractors' },
	{ id: 'government', label: 'For government offices & LGUs' },
]
export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id

export type Program = { name: string; summary: string; for: Audience[]; category?: Category; how: string | null; source: string }

export type Service = {
	name: string
	summary: string | null
	for: Audience[]
	category?: Category
	requirements: string[]
	fee: string | null
	time: string | null
	where: string | null
	source: string
}

export type Office = {
	slug: string
	name: string
	acronym: string | null
	kind: 'office' | 'ministry' | 'attached'
	/** The ministry or office it is attached to, when the source says. */
	parent: string | null
	website: string | null
	mandate: string | null
	contact: { address: string | null; phone: string | null; email: string | null } | null
	/** The Citizen's Charter the office published, or null when none could be found online. */
	charter: { label: string; url: string } | null
	/** What a check of its website found: a charter, a draft only, a page promising one, nothing, or a site that could not be checked. */
	charterStatus: CharterStatus
	/** What was found, in a sentence, where there is more to say than the status. */
	charterNote: string | null
	/** The page that promises a charter, for an office whose charter is still coming. */
	charterPage: string | null
	programs: Program[]
	services: Service[]
	sources: { label: string; url: string }[]
}

export type CharterStatus = 'published' | 'draft' | 'coming' | 'none' | 'unchecked'

export const offices = dataset.offices as Office[]
export const servicesMeta = { generatedAt: dataset.generatedAt as string, note: dataset.note as string, charterCheckedAt: dataset.charterCheckedAt as string }

/** Is what the office offers listed? Only from a charter it published, or — said plainly — from its draft. */
export const hasCharter = (o: Office) => o.charterStatus === 'published' || o.charterStatus === 'draft'

/** The offices without one, in the order the page explains them. */
export const CHARTER_GAPS: { status: Exclude<CharterStatus, 'published' | 'draft'>; title: string; lead: string }[] = [
	{ status: 'coming', title: 'A charter promised, not yet published', lead: 'A page or a notice says a charter is on its way.' },
	{ status: 'none', title: 'No charter found', lead: 'Nothing on its website, or no website of its own.' },
	{ status: 'unchecked', title: 'Could not be checked', lead: 'Its website turns away automated visits.' },
]

export const officeBySlug = (slug: string) => offices.find((o) => o.slug === slug)

/** Who each audience is, as a reader would say it. Listed in the order the filter offers them. */
export const AUDIENCES: { id: Audience; label: string }[] = [
	{ id: 'everyone', label: 'Everyone' },
	{ id: 'students', label: 'Students' },
	{ id: 'teachers', label: 'Teachers' },
	{ id: 'youth', label: 'Youth' },
	{ id: 'out-of-school-youth', label: 'Out-of-school youth' },
	{ id: 'children', label: 'Children' },
	{ id: 'women', label: 'Women' },
	{ id: 'senior-citizens', label: 'Senior citizens' },
	{ id: 'persons-with-disability', label: 'Persons with disability' },
	{ id: 'families-in-need', label: 'Families in need' },
	{ id: 'patients', label: 'Patients' },
	{ id: 'indigenous-peoples', label: 'Indigenous peoples' },
	{ id: 'settlers', label: 'Settler communities' },
	{ id: 'former-combatants', label: 'Former combatants' },
	{ id: 'farmers', label: 'Farmers' },
	{ id: 'fisherfolk', label: 'Fisherfolk' },
	{ id: 'workers', label: 'Workers' },
	{ id: 'job-seekers', label: 'Job seekers' },
	{ id: 'overseas-workers', label: 'Overseas workers' },
	{ id: 'businesses', label: 'Businesses' },
	{ id: 'cooperatives', label: 'Cooperatives' },
	{ id: 'investors', label: 'Investors' },
	{ id: 'pilgrims', label: 'Pilgrims' },
	{ id: 'ulama', label: 'Ulama' },
	{ id: 'local-governments', label: 'Local governments' },
	{ id: 'government-offices', label: 'Government offices' },
	{ id: 'researchers', label: 'Researchers' },
	{ id: 'travellers', label: 'Travellers' },
]
export const audienceLabel = (id: string) => AUDIENCES.find((a) => a.id === id)?.label ?? id

/** The office's short name: its acronym where it has one. */
export const shortName = (o: Office) => o.acronym ?? o.name

/** The office's page on the budget portal, where its money is traced. */
export const budgetHref = (o: { slug: string }) => `https://budget.betterbarmm.com/offices/${o.slug}`

/** Every program and service with the office it belongs to, for the cross-office search — only from offices that
    published a Citizen's Charter; the others' are not shown until they do. */
export type Offering = { office: Office; kind: 'program' | 'service'; item: Program | Service }
export const offerings: Offering[] = offices.filter(hasCharter).flatMap((office) => [
	...office.programs.map((item) => ({ office, kind: 'program' as const, item })),
	...office.services.map((item) => ({ office, kind: 'service' as const, item })),
])

/** Does this offering match a search and an audience? An audience means what is offered to them by name: an item
    open to everyone would otherwise bury, say, the scholarships under the library card. */
export function matches(o: Offering, q: string, audience: string) {
	const text = `${o.item.name} ${o.item.summary ?? ''} ${o.office.name} ${o.office.acronym ?? ''}`.toLowerCase()
	return (!q || text.includes(q)) && (!audience || o.item.for.includes(audience as Audience))
}

/** The anchor an item gets on its office's page, so a search result can link straight to it. */
export function slugify(s: string) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 60)
}

/* ---- What the 2026 budget funds each office to do ----

   For an office with no charter, the General Appropriations Act is the
   only public account of what it does: its operations programs, each
   with its appropriation and the page of the Act it is printed on. An
   office budgeted as a unit of another (the BIO under the Chief
   Minister, the Science High School under MOST) is found by the line's
   `office`; the rest by its agency. */

type BudgetLine = { item_type: string; cost_structure: string | null; agency: string; office: string | null; name: string; amount: number; source_page: number }
export type FundedProgram = { name: string; amount: number; page: number }

const fold = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]/g, '')
// A line with no amount is a heading the Act prints over its sub-programs, not money of its own.
const lines = (budget2026 as { line_items: BudgetLine[] }).line_items.filter((l) => l.item_type === 'program' && l.cost_structure === 'Operations' && l.amount > 0)

export function fundedPrograms(o: Office): FundedProgram[] {
	const name = fold(o.name)
	const own = lines.filter((l) => l.office && fold(l.office) === name)
	const list = own.length ? own : lines.filter((l) => !l.office && fold(l.agency) === name)
	return list.map((l) => ({ name: l.name, amount: l.amount, page: l.source_page })).sort((a, b) => b.amount - a.amount)
}

/** Pesos the way the budget portal writes them: ₱1.2B, ₱36.3M. */
export const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(1)}B` : `₱${(n / 1e6).toFixed(n >= 1e8 ? 0 : 1)}M`)
