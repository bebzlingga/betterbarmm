import dataset from '../../../../datasets/services/offices.json'

/* ============================================================
   What the government offers for health

   Read from the Programs & services record on betterbarmm.com
   (datasets/services/offices.json): everything the Ministry of Health
   lists, and every program or service another office files under
   health or offers to patients. Nothing is added here; each links to
   the office's own page, where the requirements and the source are.
   ============================================================ */

type Service = { name: string; summary: string | null; for: string[]; category?: string; requirements: string[]; fee: string | null; time: string | null; where: string | null; source: string }
type Program = { name: string; summary: string; for: string[]; category?: string; how: string | null; source: string }
type Office = { slug: string; name: string; acronym: string | null; website: string | null; programs: Program[]; services: Service[] }

export type Offer = { kind: 'program' | 'service'; name: string; summary: string | null; for: string[]; how: string | null; requirements: string[]; fee: string | null; time: string | null; source: string }

const MOH = 'ministry-of-health'
const forHealth = (slug: string, x: { for: string[]; category?: string }) => slug === MOH || x.category === 'health' || x.for.includes('patients')

export const AUDIENCE: Record<string, string> = {
	everyone: 'Everyone',
	patients: 'Patients',
	'families-in-need': 'Families in need',
	'persons-with-disability': 'Persons with disability',
	'senior-citizens': 'Senior citizens',
	women: 'Women',
	children: 'Children',
	youth: 'Youth',
	workers: 'Workers',
	'former-combatants': 'Former combatants',
	'indigenous-peoples': 'Indigenous peoples',
	'job-seekers': 'Job seekers',
	students: 'Students',
	researchers: 'Researchers',
	businesses: 'Businesses',
}

/** Each office with something for health, the ministry first, with what it offers. */
export const offices = (dataset.offices as Office[])
	.map((o) => ({
		slug: o.slug,
		name: o.name,
		acronym: o.acronym,
		website: o.website,
		offers: [
			...o.programs.filter((p) => forHealth(o.slug, p)).map<Offer>((p) => ({ kind: 'program', name: p.name, summary: p.summary, for: p.for, how: p.how, requirements: [], fee: null, time: null, source: p.source })),
			...o.services.filter((s) => forHealth(o.slug, s)).map<Offer>((s) => ({ kind: 'service', name: s.name, summary: s.summary, for: s.for, how: s.where, requirements: s.requirements, fee: s.fee, time: s.time, source: s.source })),
		],
	}))
	.filter((o) => o.offers.length)
	.sort((a, b) => Number(b.slug === MOH) - Number(a.slug === MOH) || b.offers.length - a.offers.length)

/** The item on its office's page on betterbarmm.com, by the anchor that page gives it (www's slugify). */
export const offerHref = (office: string, x: Pick<Offer, 'kind' | 'name'>) =>
	`https://betterbarmm.com/services/${office}#${x.kind}-${x.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)}`

export const offersTotal = offices.reduce((n, o) => n + o.offers.length, 0)
