import { NEWS_FEEDS, readFeed, type FetchedItem } from '../../../packages/db/src/news'

/* `bun datasets/news/scripts/fetch_news.ts [YYYY-MM-DD]` — read the news feeds and add
   what is new to datasets/news/news.json, from the given day (default: this week's
   Monday, Manila time). Then resolve the Google News links to the outlets' own
   addresses: `python3 -I datasets/news/scripts/resolve_links.py`, check each story's own
   date: `python3 -I datasets/news/scripts/check_dates.py`, and give each its picture:
   `python3 -I datasets/news/scripts/fetch_images.py`.

   The feeds and the reader are the ones the database fetcher used
   (packages/db/src/news.ts); the database is gone, so the headlines live in a file
   like every other dataset, and the page reads it at build. */

const FILE = new URL('../news.json', import.meta.url)
type Item = FetchedItem & { via?: string }
type Struck = { url: string; via?: string | null; title: string; reason: string }
type Dataset = { name: string; generatedAt: string; since: string; note: string; items: Item[]; dropped?: Struck[] }

const manila = (d: Date) => new Date(d.getTime() + 8 * 3600_000)
const monday = () => {
	const d = manila(new Date())
	d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
	return d.toISOString().slice(0, 10)
}
const since = process.argv[2] ?? monday()

let data: Dataset
try {
	data = await Bun.file(FILE).json()
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
const FEEDS = [...NEWS_FEEDS, ...SWEEP]

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
await Bun.write(FILE, JSON.stringify(data, null, 1) + '\n')
console.log(`news: ${added} new of ${read.length} read, since ${since}; ${data.items.length} in all${errors.length ? `\n  feed errors: ${errors.join(' | ')}` : ''}`)
