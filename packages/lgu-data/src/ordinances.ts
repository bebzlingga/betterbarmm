/* ============================================================
   Ordinances from elsewhere, kept as references

   Ordinances other provinces, cities and towns across the country
   have enacted, each read off the LGU's own PDF by
   datasets/ordinances/scripts/extract_ordinances.py and described
   by hand in datasets/ordinances/ordinances.json. They are here so
   a BARMM council can read how someone else drafted a code before
   writing its own; none of them has force in the region.

   The full text lives in datasets/ordinances/text/<id>.txt and is
   read from disk at build, never imported: together the texts run to
   megabytes, and only the one page that shows an ordinance needs it.
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
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
	penalties: string | null
	amends: string | null
	caveat: string | null
	/** The LGU's own copy. */
	pdf: string
	pages: number
	/** "text" off the PDF's own text layer, "ocr" off a scan. */
	read: 'text' | 'ocr'
	/** What a BARMM LGU can take from it, read against the Bangsamoro Local Governance Code. */
	barmm?: {
		verdict: 'Ready to adapt' | 'Adapt with changes' | 'Take the idea, not the text'
		why: string
		adopt: string[]
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

/** The full text, off disk. The app runs from its own folder or from the repo root. */
export function ordinanceText(id: string): string {
	const dir = [path.join(process.cwd(), '../../datasets/ordinances/text'), path.join(process.cwd(), 'datasets/ordinances/text')].find((d) => fs.existsSync(d))
	if (!dir || !/^[a-z0-9-]+$/.test(id)) return ''
	const at = path.join(dir, `${id}.txt`)
	return fs.existsSync(at) ? fs.readFileSync(at, 'utf8') : ''
}
