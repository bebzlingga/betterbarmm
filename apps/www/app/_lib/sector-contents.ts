import fs from 'node:fs'
import path from 'node:path'
import jobsFile from '../../../../datasets/opportunities/jobs.json'
import programsFile from '../../../../datasets/opportunities/scholarships.json'
import newsIndex from '../../../../datasets/news/index.json'
import { indicators } from './development-plan'
import type { Sector } from './sectors'
import { offices, type Office, type Program, type Service } from './services'
import { procurement } from './weekly'

/* What a sector workspace shows, read from the records (server only: the news is read from disk). */

export type SectorItem = { office: Office; kind: 'program' | 'service'; item: Program | Service }

/** The sector's offices, then every item another office shelves under one of its categories. */
export function sectorContents(s: Sector) {
	const own = s.offices.map((slug) => offices.find((o) => o.slug === slug)).filter((o): o is Office => !!o)
	const items: SectorItem[] = []
	// The sector's own offices first, in the order it names them; then the rest.
	const rank = (o: Office) => (s.offices.includes(o.slug) ? s.offices.indexOf(o.slug) : s.offices.length)
	for (const office of [...offices].sort((a, b) => rank(a) - rank(b))) {
		const mine = s.offices.includes(office.slug)
		const take = (i: Program | Service) => mine || (i.category != null && s.categories.includes(i.category))
		for (const item of office.programs) if (take(item)) items.push({ office, kind: 'program', item })
		for (const item of office.services) if (take(item)) items.push({ office, kind: 'service', item })
	}
	const officeNames = new Set(own.map((o) => o.name.toLowerCase()))
	const jobs = jobsFile.jobs.filter((j) => j.open && (s.allJobs || officeNames.has(j.office.toLowerCase())))
	const grants = programsFile.programs.filter((p) => s.offices.includes(p.officeSlug))
	const plan = indicators.filter((i) => s.planAreas.includes(i.area))
	const bids = procurement.open.filter((n) => s.procurement.test(n.office) && !SULU.test(n.title)).sort((a, b) => (a.closing ?? '').localeCompare(b.closing ?? ''))
	return { own, items, jobs, grants, plan, bids, news: sectorNews(s) }
}

/** Sulu left the region in 2024 and is outside this site's scope (user decision). */
const SULU = /\bSulu\b/i

type NewsItem = { url: string; title: string; source: string; published_at: string | null }

/* Every week kept, newest first; the regex picks the sector's headlines out of them. */
const WEEKS = path.join(process.cwd(), '../../datasets/news/weeks')
let allNews: NewsItem[] | null = null
function sectorNews(s: Sector, limit = 8) {
	allNews ??= (newsIndex.weeks as string[])
		.flatMap((w) => (JSON.parse(fs.readFileSync(path.join(WEEKS, `${w}.json`), 'utf8')) as { items: NewsItem[] }).items)
		.filter((i) => i.published_at)
		.sort((a, b) => b.published_at!.localeCompare(a.published_at!))
	const seen = new Set<string>()
	return allNews
		.filter((i) => s.news.test(i.title) && !s.newsNot?.test(i.title) && !SULU.test(i.title))
		.filter((i) => (seen.has(i.title) ? false : (seen.add(i.title), true)))
		.slice(0, limit)
}
