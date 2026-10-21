/* ============================================================
   Programs & services, for Jo

   One row per service and program a Citizen's Charter lists: the
   regional offices' and the provinces', cities' and towns'. A row
   carries what a reader asks of a service — what you get, what to
   bring, the fee, how long, where to go and who gives it — so an
   answer can be written from the row alone, and links to the card
   on the office's or the LGU's services page.
   ============================================================ */

import officesFile from '../../../datasets/services/offices.json'
import lgusFile from '../../../datasets/services/lgus.json'
import type { Entry } from './corpus'

const WWW = 'https://betterbarmm.com'

type Item = { name: string; summary: string | null; for: string[]; category?: string; requirements?: string[]; fee?: string | null; time?: string | null; where?: string | null; how?: string | null }
type Office = { slug: string; name: string; acronym: string | null; charterStatus: string; programs: Item[]; services: Item[] }
type Lgu = { key: string; name: string; kind: string; province: string; charterStatus: string; services: Item[] }

/** The page's anchor for an item: the same rule the services pages use. */
const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
const joined = (parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(' ')
const trim = (text: string, most: number) => (text.length > most ? `${text.slice(0, most - 1).trimEnd()}…` : text)

function row(kind: string, item: Item, who: string, href: string, about: string, place?: string): Entry {
	return {
		space: 'services',
		kind,
		// An LGU's row carries its name: a question names the town, and the answer must say whose service it is.
		title: place ? `${item.name} (${place})` : item.name,
		note: joined([
			item.summary ? `${item.summary}` : '',
			`Offered by ${who}.`,
			item.requirements?.length ? `Bring: ${trim(item.requirements.join('; '), 320)}.` : '',
			item.fee ? `Fee: ${item.fee}.` : '',
			item.time ? `Takes ${item.time}.` : '',
			item.where ? `Where: ${item.where}.` : '',
			item.how ? `How: ${item.how}` : '',
		]),
		href,
		// Not the requirements: half the services ask for a cedula, and a question about the cedula is not about them.
		text: joined([item.name, item.summary, who, about, item.category, ...item.for.map((a) => a.replace(/-/g, ' '))]).toLowerCase(),
	}
}

export function services(): Entry[] {
	const offices = (officesFile as { offices: Office[] }).offices.filter((o) => o.charterStatus === 'published' || o.charterStatus === 'draft')
	const lgus = (lgusFile as { lgus: Lgu[] }).lgus.filter((l) => l.charterStatus === 'published' && l.services.length)
	return [
		...offices.flatMap((o) => {
			const who = o.acronym ? `the ${o.name} (${o.acronym})` : `the ${o.name}`
			return [
				...o.services.map((s) => row('Service', s, who, `${WWW}/services/${o.slug}#service-${anchor(s.name)}`, o.acronym ?? '')),
				...o.programs.map((p) => row('Program', p, who, `${WWW}/services/${o.slug}#program-${anchor(p.name)}`, o.acronym ?? '')),
			]
		}),
		...lgus.flatMap((l) => {
			const who = l.kind === 'Province' ? `the Provincial Government of ${l.name}` : `${l.kind === 'City' ? 'the City Government of' : 'the Municipality of'} ${l.name}, ${l.province}`
			return l.services.map((s) => row('LGU service', s, who, `${WWW}/services/lgu/${l.key}#service-${anchor(s.name)}`, `${l.province} town city municipality province local government`, l.name))
		}),
	]
}

/* The words a question uses for each kind of row here: only the kind's own, since every row of
   the kind takes them. A subject ("cedula", "business permit") belongs in the row's text, or it
   lifts all three hundred rows at once. */
const SERVICE_WORDS = 'service services get apply application avail requirements requirement bring documents fee fees cost processing permit license licence certificate clearance registration assistance request'
export const SERVICES_ASKED: Record<string, string> = {
	Service: `${SERVICE_WORDS} office`,
	Program: 'program programs grant subsidy benefit qualifies eligible apply assistance',
	'LGU service': `${SERVICE_WORDS} hall local government`,
}

/** Rows that answer only a question asking how to get something: "how much is the cedula" is the Code's, not a town counter's. */
export const SERVICES_ASKED_ONLY = ['Service', 'LGU service']
