import { NEWS_FEEDS, readFeed, type FetchedItem } from '../../../packages/db/src/news'

/* `bun datasets/news/scripts/fetch_news.ts [YYYY-MM-DD]` — read the news feeds and add
   what is new to the news (a week to a file in datasets/news/weeks, see store.py), from the given day (default: this week's
   Monday, Manila time). Then resolve the Google News links to the outlets' own
   addresses: `python3 -I datasets/news/scripts/resolve_links.py`, check each story's own
   date: `python3 -I datasets/news/scripts/check_dates.py`, and give each its picture:
   `python3 -I datasets/news/scripts/fetch_images.py`.

   The feeds and the reader are the ones the database fetcher used
   (packages/db/src/news.ts); the database is gone, so the headlines live in a file
   like every other dataset, and the page reads it at build. */

type Item = FetchedItem & { via?: string }
type Struck = { url: string; via?: string | null; title: string; reason: string }
type Dataset = { name: string; generatedAt: string; since: string; note: string; items: Item[]; dropped?: Struck[] }

// The news is kept a week to a file (user decision), Monday to Sunday in Manila: weeks/<Monday>.json, and index.json
// for what is about all of them. Nothing is deleted; the page shows the newest week. The same split as store.py.
const WEEKS = new URL('../weeks/', import.meta.url)
const INDEX = new URL('../index.json', import.meta.url)
const weekOf = (iso: string) => {
	const d = new Date(new Date(iso).getTime() + 8 * 3600_000)
	d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
	return d.toISOString().slice(0, 10)
}
async function load(): Promise<Dataset> {
	const data = (await Bun.file(INDEX).json()) as Dataset
	const files = [...new Bun.Glob('*.json').scanSync(WEEKS.pathname)].sort()
	data.items = (await Promise.all(files.map(async (f) => ((await Bun.file(new URL(f, WEEKS)).json()) as { items: Item[] }).items))).flat()
	return data
}
async function save(data: Dataset) {
	const weeks = new Map<string, Item[]>()
	for (const item of data.items) {
		const w = weekOf(item.published_at!)
		weeks.set(w, [...(weeks.get(w) ?? []), item])
	}
	for (const [week, items] of weeks) {
		const file = Bun.file(new URL(`${week}.json`, WEEKS))
		const text = JSON.stringify({ week, items }, null, 1) + '\n'
		if (!(await file.exists()) || (await file.text()) !== text) await Bun.write(file, text)
	}
	const { items: _, ...index } = data
	await Bun.write(INDEX, JSON.stringify({ ...index, weeks: [...weeks.keys()].sort().reverse() }, null, 1) + '\n')
}

const manila = (d: Date) => new Date(d.getTime() + 8 * 3600_000)
const monday = () => {
	const d = manila(new Date())
	d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
	return d.toISOString().slice(0, 10)
}
const since = process.argv[2] ?? monday()

let data: Dataset
try {
	data = await load()
} catch {
	data = { name: 'Latest news', generatedAt: '', since, note: '', items: [] }
}
data.since = data.since && data.since < since ? data.since : since
data.note = 'Headlines about the Bangsamoro from the region’s own offices and the national and international press, read from their RSS feeds and Google News’s index of them. Each links to the outlet that reported it; the headline and teaser are the outlet’s.'

// The shared feeds lean on front pages; this week's sweep also asks Google News place by place, past 7 days.
// At most six OR terms a query: past ten, Google News drops the date filter.
const week = (q: string) => ({ name: 'Google News', url: `https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:7d`)}&hl=en-PH&gl=PH&ceid=PH:en` })
const SWEEP = [
	'BARMM OR Bangsamoro',
	'"Cotabato City"',
	'Maguindanao',
	'Marawi OR "Lanao del Sur"',
	'Basilan OR Lamitan',
	'Tawi-Tawi OR Bongao',
	'MILF OR MNLF OR "Bangsamoro Parliament"',
	'"Special Geographic Area" OR "Chief Minister" Bangsamoro',
].map(week)
// The Bangsamoro Government's latest news, read page by page (user decision: a source of its own): its feeds give 5 posts a
// page, so a week between runs loses most of them off the end of the first.
const BIO_PAGES = [1, 2, 3, 4, 5, 6].map((n) => ({
	name: 'Bangsamoro Government',
	url: `https://bangsamoro.gov.ph/category/latest-news/feed/${n > 1 ? `?paged=${n}` : ''}`,
	source: 'Bangsamoro Government',
	regional: true,
}))
const FEEDS = [...NEWS_FEEDS, ...BIO_PAGES, ...SWEEP]

const key = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const errors: string[] = []
const read: FetchedItem[] = []
const results = await Promise.allSettled(FEEDS.map(readFeed))
results.forEach((r, i) => (r.status === 'fulfilled' ? read.push(...r.value) : errors.push(`${FEEDS[i]!.name}: ${r.reason?.message ?? r.reason}`)))
// Inquirer's own feeds stamp Manila's clock as UTC ("15:24 +0000" for 3:24 pm in Manila), which put its stories
// eight hours late, some after the fetch itself. Its stories through Google News carry Google's dates, which are right.
for (const item of read)
	if (item.feed.startsWith('Inquirer') && item.published_at) item.published_at = new Date(new Date(item.published_at).getTime() - 8 * 3600_000).toISOString()

// Manila's day, so a story posted at 1 am on Monday is Monday's.
const day = (iso: string | null) => (iso ? manila(new Date(iso)).toISOString().slice(0, 10) : null)
// What check_dates.py struck counts as had, or Google's fresh date on an old story would bring it back.
const struck = data.dropped ?? []
const haveUrls = new Set([...data.items, ...struck].flatMap((i) => [i.url, i.via ?? '']))
const haveTitles = new Set([...data.items, ...struck].map((i) => key(i.title)))
let added = 0
for (const item of read) {
	const d = day(item.published_at)
	if (!d || d < since) continue
	if (haveUrls.has(item.url) || haveTitles.has(key(item.title))) continue
	haveUrls.add(item.url)
	haveTitles.add(key(item.title))
	data.items.push(item)
	added++
}
data.items.sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
data.generatedAt = new Date().toISOString()
await save(data)
console.log(`news: ${added} new of ${read.length} read, since ${since}; ${data.items.length} in all${errors.length ? `\n  feed errors: ${errors.join(' | ')}` : ''}`)
