import { lguProvinces, personName, type Contest } from '@betterbarmm/lgu-data'
import dataset from '../../../../datasets/directory/offices.json'
import { offices as serviceOffices } from './services'

/* ============================================================
   Who heads each office, and how to reach it

   The regional government, office by office: its head as the newest
   official source names them, with that source's date, and every
   phone number and email the office publishes in plain text. Emails a
   site hides from robots are left out rather than decoded.

   Local governments come from the LGU directory: whoever won each
   governorship and mayoralty in COMELEC's 2025 canvass. A death, a
   suspension or a succession since then is not reflected there.
   ============================================================ */

export type DirectoryOffice = {
	slug: string
	name: string
	acronym: string | null
	head: { name: string; title: string; as_of: string | null; source: string } | null
	address: string | null
	phones: string[]
	emails: string[]
	website: string | null
	facebook: string | null
	sources: { label: string; url: string }[]
}

export type Hotline = { name: string; number: string; source: string }

export const directoryMeta = { generatedAt: dataset.generatedAt as string, note: dataset.note as string }
export const hotlines = (dataset.hotlines ?? []) as Hotline[]

const KIND = new Map(serviceOffices.map((o) => [o.slug, o]))
/** The office's kind and parent, kept with its programs and services so the two lists never disagree. */
export const directoryOffices = (dataset.offices as DirectoryOffice[]).map((o) => ({
	...o,
	kind: KIND.get(o.slug)?.kind ?? 'attached',
	parent: KIND.get(o.slug)?.parent ?? null,
}))

/** A phone number as a tel: link: digits only, Philippine area and mobile numbers given the country code. */
export function telHref(phone: string) {
	const digits = phone.replace(/[^\d+]/g, '')
	return `tel:${digits.startsWith('0') ? `+63${digits.slice(1)}` : digits}`
}

const LGU = 'https://lgu.betterbarmm.com'
const TERM = '2025-2028'
const winner = (c?: Contest) => (c?.ranked?.[0]?.name ? personName(c.ranked[0].name) : null)

export type LocalHead = { name: string; href: string; head: string | null; deputy: string | null; isCity: boolean }
export type LocalGroup = { name: string; kind: string; href: string; governor: string | null; viceGovernor: string | null; units: LocalHead[] }

/** Each province (with Cotabato City and the Special Geographic Area), its governor, and every town's mayor. */
export const localGovernments: LocalGroup[] = lguProvinces.map((p) => {
	const po = p.officials?.[TERM]
	return {
		name: p.name,
		kind: p.kind,
		href: `${LGU}/${p.slug}`,
		governor: winner(po?.governor),
		viceGovernor: winner(po?.viceGovernor),
		units: p.municipalities.map((m) => {
			const mo = m.officials?.[TERM]
			return { name: m.name, href: `${LGU}/${p.slug}/${m.slug}`, head: winner(mo?.mayor), deputy: winner(mo?.viceMayor), isCity: m.isCity }
		}),
	}
})
