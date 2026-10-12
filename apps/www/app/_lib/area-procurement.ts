import fs from 'node:fs'
import path from 'node:path'

/* ============================================================
   What a town's own government buys

   From the procurement workspace's PhilGEPS file, read on the server
   when a My Area page is built — the file is large and the page is
   static, so nothing of it reaches the browser. Keyed by the LGU
   directory's "area/town" key, which PhilGEPS offices carry as `unit`.
   ============================================================ */

type Raw = {
	columns: string[]
	entities: { name: string; type: string; unit: string | null }[]
	notices: unknown[][]
}

export type AreaProcurement = {
	office: string
	href: string
	notices: number
	budget: number
	awards: number
	awarded: number
	since: string | null
	open: { title: string; budget: number | null; closing: string | null }[]
}

const PROCUREMENT = 'https://procurement.betterbarmm.com'

const slugify = (name: string) =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 80)

const byUnit: Map<string, AreaProcurement> = (() => {
	const roots = [process.cwd(), path.join(process.cwd(), '..'), path.join(process.cwd(), '../..')]
	const file = roots.map((r) => path.join(r, 'datasets/procurement/philgeps.json')).find((f) => fs.existsSync(f))
	const out = new Map<string, AreaProcurement>()
	if (!file) return out
	const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Raw
	const col = (name: string) => raw.columns.indexOf(name)
	const [cDate, cEntity, cAbc, cTitle, cAwards, cClosing, cOpen] = ['date', 'entity', 'abc', 'title', 'awards', 'closing', 'open'].map(col)
	// The procurement workspace's own slugs, made the same way, so links land.
	const used = new Set<string>()
	const slugs = raw.entities.map((e) => {
		let s = slugify(e.name.replace(/\s+/g, ' ').trim())
		while (used.has(s)) s += '-2'
		used.add(s)
		return s
	})
	const today = new Date().toISOString().slice(0, 10)
	for (const n of raw.notices) {
		const e = raw.entities[n[cEntity!] as number]!
		if (!e.unit) continue
		const a = out.get(e.unit) ?? {
			office: e.name,
			href: `${PROCUREMENT}/${slugs[n[cEntity!] as number]}`,
			notices: 0,
			budget: 0,
			awards: 0,
			awarded: 0,
			since: null,
			open: [],
		}
		const awards = (n[cAwards!] as [number, number | null][]) ?? []
		const date = n[cDate!] as string | null
		a.notices += 1
		a.budget += (n[cAbc!] as number | null) ?? 0
		a.awards += awards.length
		a.awarded += awards.reduce((s, w) => s + (w[1] ?? 0), 0)
		if (date && (!a.since || date < a.since)) a.since = date
		const closing = cClosing! >= 0 ? (n[cClosing!] as string | null) : null
		if (cOpen! >= 0 && n[cOpen!] && (!closing || closing >= today))
			a.open.push({ title: (n[cTitle!] as string | null) ?? 'Untitled notice', budget: n[cAbc!] as number | null, closing })
		out.set(e.unit, a)
	}
	return out
})()

export function procurementFor(areaSlug: string, unitSlug: string): AreaProcurement | null {
	return byUnit.get(`${areaSlug}/${unitSlug}`) ?? null
}
