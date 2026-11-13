import dataset from '../../../../datasets/services/offices.json'

/* ============================================================
   What the government offers students, teachers and schools

   Read from the Programs & services record on betterbarmm.com
   (datasets/services/offices.json): every program and over-the-counter
   service an office lists for students, teachers or out-of-school
   youth, or files under education. Nothing is added here; each links
   to the office's own page, where the requirements and the source are.
   ============================================================ */

type Service = { name: string; summary: string | null; for: string[]; category?: string; requirements: string[]; fee: string | null; time: string | null; where: string | null; source: string }
type Program = { name: string; summary: string; for: string[]; category?: string; how: string | null; source: string }
type Office = { slug: string; name: string; acronym: string | null; website: string | null; charterStatus: string; programs: Program[]; services: Service[] }

export type Offer = {
	kind: 'program' | 'service'
	name: string
	summary: string | null
	for: string[]
	/** How to get it: the program's own line, or the service's window. */
	how: string | null
	requirements: string[]
	fee: string | null
	time: string | null
	source: string
}

const LEARNERS = new Set(['students', 'teachers', 'out-of-school-youth', 'children'])
const forLearners = (x: { for: string[]; category?: string }) => x.category === 'education' || x.for.some((a) => LEARNERS.has(a))

export const AUDIENCE: Record<string, string> = {
	everyone: 'Everyone',
	students: 'Students',
	teachers: 'Teachers',
	children: 'Children',
	youth: 'Youth',
	'out-of-school-youth': 'Out-of-school youth',
	'families-in-need': 'Families in need',
	'former-combatants': 'Former combatants',
	'indigenous-peoples': 'Indigenous peoples',
	'persons-with-disability': 'Persons with disability',
	'job-seekers': 'Job seekers',
	workers: 'Workers',
	researchers: 'Researchers',
	travellers: 'Travellers',
	patients: 'Patients',
	women: 'Women',
	'senior-citizens': 'Senior citizens',
}

/** Each office with something for learners, the education ministry first, with what it offers. */
export const offices = (dataset.offices as Office[])
	.map((o) => ({
		slug: o.slug,
		name: o.name,
		acronym: o.acronym,
		website: o.website,
		charterStatus: o.charterStatus,
		offers: [
			...o.programs.filter(forLearners).map<Offer>((p) => ({ kind: 'program', name: p.name, summary: p.summary, for: p.for, how: p.how, requirements: [], fee: null, time: null, source: p.source })),
			...o.services.filter(forLearners).map<Offer>((s) => ({ kind: 'service', name: s.name, summary: s.summary, for: s.for, how: s.where, requirements: s.requirements, fee: s.fee, time: s.time, source: s.source })),
		],
	}))
	.filter((o) => o.offers.length)
	.sort((a, b) => Number(b.slug === 'ministry-of-basic-higher-and-technical-education') - Number(a.slug === 'ministry-of-basic-higher-and-technical-education') || b.offers.length - a.offers.length)

/** The item on its office's page on betterbarmm.com, by the anchor that page gives it (www's slugify). */
export const offerHref = (office: string, x: Pick<Offer, 'kind' | 'name'>) =>
	`https://betterbarmm.com/services/${office}#${x.kind}-${x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}`

/** Scholarships, study grants and cash help to stay in school: what a student comes for first. Read from the name, as the offices give none of them a kind of their own. */
export const isScholarship = (x: Pick<Offer, 'name'>) =>
	/scholar|assistance for science|college assistance|graduate study|\bgrants?\b|ABaKa|Tawid Pangarap|employment of students/i.test(x.name) && !/examination|clearance|application$|^awarding/i.test(x.name)

export const offersTotal = offices.reduce((n, o) => n + o.offers.length, 0)
export const servicesNote = dataset.note as string
