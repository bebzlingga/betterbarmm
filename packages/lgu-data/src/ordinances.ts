/* ============================================================
   Ordinances from elsewhere, kept as references

   Ordinances other provinces, cities and towns across the country
   have enacted, each read off the LGU's own PDF by
   datasets/ordinances/scripts/extract_ordinances.py and described
   by hand in datasets/ordinances/ordinances.json. They are here so
   a BARMM council can read how someone else drafted a code before
   writing its own; none of them has force in the region.

   The full texts live in datasets/ordinances/text/<id>.txt, for
   writing the readings and for Jo; the pages show the PDF instead.
   ============================================================ */

import file from '../../../datasets/ordinances/ordinances.json'

export type Ordinance = {
	id: string
	category: string
	lgu: string
	level: 'province' | 'city' | 'municipality' | 'barangay'
	province: string
	region: string
	number: string
	year: number
	/** YYYY-MM-DD, where the text gives the date. */
	enacted: string | null
	title: string
	shortTitle: string
	summary: string
	points: string[]
	/** The same in fuller form: a heading, what it says with its figures, and where it says it ("Sec. 5"). */
	provisions?: { title: string; text: string; section: string | null }[]
	penalties: string | null
	amends: string | null
	caveat: string | null
	/** The LGU's own copy. */
	pdf: string
	/** The Internet Archive's copy, where the LGU has taken its own down. */
	archived?: string
	pages: number
	/** "text" off the PDF's own text layer, "ocr" off a scan. */
	read: 'text' | 'ocr'
	/** Facts about the ordinance itself, read off its text; null or empty where the text does not say. */
	details?: {
		sponsors: string[]
		approvedBy: string | null
		/** YYYY-MM-DD, the chief executive's approval. */
		approved: string | null
		effect: string | null
		covers: string | null
		enforcers: string | null
		creates: string[]
		funding: string | null
		structure: string | null
	}
	/** Its standout facts as a figure and what it counts: "₱3,000", "a month for each volunteer". */
	highlights?: { value: string; label: string }[]
	/** What a BARMM LGU could do with it, read against the Bangsamoro Local Governance Code. Written as conditions
	    the reader checks against their own LGU, never as an assumption about it. */
	barmm?: {
		verdict: 'Ready to adapt' | 'Adapt with changes' | 'Take the idea, not the text'
		why: string
		/** "If your LGU has …", then "you can replicate this by …". */
		apply: { if: string; then: string }[]
		change: string[]
		fits: string
		laws: string[]
	}
}

type File = { name: string; generatedAt: string; note: string; categories: { name: string; about: string }[]; ordinances: Ordinance[] }

const raw = file as unknown as File

export const ordinanceMeta = { name: raw.name, generatedAt: raw.generatedAt, note: raw.note }

/** Only the ones described: an entry still waiting on its reading is not shown. */
export const ordinances: Ordinance[] = raw.ordinances
	.filter((o) => o.summary)
	.sort((a, b) => a.shortTitle.localeCompare(b.shortTitle))

/** The categories in the file's order, each with what is filed under it. */
export const ordinanceCategories = raw.categories
	.map((c) => ({ ...c, slug: slug(c.name), ordinances: ordinances.filter((o) => o.category === c.name) }))
	.filter((c) => c.ordinances.length > 0)

export function slug(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
