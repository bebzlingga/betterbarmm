import dataset from '../../../../datasets/services/offices.json'

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
	| 'researchers'
	| 'travellers'

export type Program = { name: string; summary: string; for: Audience[]; how: string | null; source: string }

export type Service = {
	name: string
	summary: string | null
	for: Audience[]
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
	programs: Program[]
	services: Service[]
	sources: { label: string; url: string }[]
}

export const offices = dataset.offices as Office[]
export const servicesMeta = { generatedAt: dataset.generatedAt as string, note: dataset.note as string }

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
	{ id: 'researchers', label: 'Researchers' },
	{ id: 'travellers', label: 'Travellers' },
]
export const audienceLabel = (id: string) => AUDIENCES.find((a) => a.id === id)?.label ?? id

/** The office's short name: its acronym where it has one. */
export const shortName = (o: Office) => o.acronym ?? o.name

/** The office's page on the budget portal, where its money is traced. */
export const budgetHref = (o: Office) => `https://budget.betterbarmm.com/offices/${o.slug}`

/** Every program and service with the office it belongs to, for the cross-office search. */
export type Offering = { office: Office; kind: 'program' | 'service'; item: Program | Service }
export const offerings: Offering[] = offices.flatMap((office) => [
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
