import dataset from '../../../../datasets/services/lgus.json'
import type { Service } from './services'

/* ============================================================
   What the provinces, cities and towns offer

   The local half of Programs & services: one record per LGU, with the
   services its Citizen's Charter lists, read as the regional offices'
   are (requirements, fee, time, where), and what a search of the web
   found where it has no charter: a page promising one, a charter
   posted only as pictures on Facebook, or nothing.
   ============================================================ */

export type LguCharterStatus = 'published' | 'facebook-only' | 'coming' | 'none' | 'unchecked'

export type Lgu = {
	/** `province` for a province, `province/town` for a city or town, as everywhere on the site. */
	key: string
	name: string
	kind: 'Province' | 'City' | 'Municipality'
	province: string
	provinceSlug: string
	website: string | null
	facebook: string | null
	charter: { label: string; url: string } | null
	charterStatus: LguCharterStatus
	charterNote: string | null
	services: Service[]
}

export const lgus = dataset.lgus as Lgu[]
export const lguMeta = { note: dataset.note as string, charterCheckedAt: dataset.charterCheckedAt as string }

export const lguByKey = (key: string) => lgus.find((l) => l.key === key)
export const lguHref = (l: Pick<Lgu, 'key'>) => `/services/lgu/${l.key}`
export const lguHasCharter = (l: Lgu) => l.charterStatus === 'published' && l.services.length > 0

/** The LGUs without services listed, in the order the page explains them. */
export const LGU_GAPS: { status: LguCharterStatus[]; title: string; lead: string }[] = [
	{ status: ['published'], title: 'Charter found, services not yet listed', lead: 'Its charter is online, but its services have not been read into this page yet.' },
	{ status: ['facebook-only'], title: 'Posted only on Facebook', lead: 'Its charter is shared as pictures on its Facebook page, which cannot be read here.' },
	{ status: ['coming', 'none'], title: 'No charter found', lead: 'Nothing on its website or in a search, a page that promises one, or no website of its own.' },
	{ status: ['unchecked'], title: 'Not yet checked', lead: 'Its website or charter has not been looked for yet.' },
]

/** The provinces, in the order the site lists them, Cotabato City last as its own area. */
export const PROVINCES = [...new Map(lgus.map((l) => [l.provinceSlug, l.province])).entries()].map(([slug, name]) => ({ slug, name }))
