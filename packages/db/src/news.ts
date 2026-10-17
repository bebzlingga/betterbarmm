import type { SupabaseClient } from '@supabase/supabase-js'

/* ============================================================
   Latest news about the Bangsamoro

   Read from outlets' own RSS feeds: the headline, the outlet, the date,
   the link back and the outlet's own teaser. Nothing past what a feed
   publishes to be shared. The government's feeds are about the region
   by definition; a national outlet's item is kept only when its
   headline or teaser names the region.

   Run by hand: scripts/news.ts from GitHub Actions, or the admin's Run now.
   ============================================================ */

export type NewsItem = {
	id: string
	url: string
	title: string
	source: string
	published_at: string | null
	summary: string
	feed: string
	hidden: boolean
	fetched_at: string
}

export type NewsRun = {
	id: string
	trigger: 'schedule' | 'manual'
	started_at: string
	finished_at: string | null
	seen: number
	added: number
	errors: string[]
	by_email: string
}

type Feed = { name: string; url: string; source?: string; regional?: boolean }

const google = (query: string, edition: 'PH' | 'US' = 'PH') =>
	`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-${edition}&gl=${edition}&ceid=${edition}:en`

const ABOUT = '(BARMM OR Bangsamoro OR Cotabato OR Maguindanao OR Marawi OR Basilan OR Tawi-Tawi)'

export const NEWS_FEEDS: Feed[] = [
	// The region's own offices: everything they post is about the region.
	{ name: 'Bangsamoro Government', url: 'https://bangsamoro.gov.ph/feed/', source: 'Bangsamoro Government', regional: true },
	{ name: 'Bangsamoro Parliament', url: 'https://parliament.bangsamoro.gov.ph/feed/', source: 'Bangsamoro Parliament', regional: true },
	// Philippine outlets with feeds of their own.
	{ name: 'Rappler', url: 'https://www.rappler.com/feed/', source: 'Rappler' },
	{ name: 'Inquirer', url: 'https://newsinfo.inquirer.net/feed', source: 'Inquirer' },
	{ name: 'Inquirer Regions', url: 'https://newsinfo.inquirer.net/category/inquirer-headlines/regions/feed', source: 'Inquirer' },
	{ name: 'Philstar', url: 'https://www.philstar.com/rss/nation', source: 'Philstar' },
	{ name: 'Philstar Headlines', url: 'https://www.philstar.com/rss/headlines', source: 'Philstar' },
	{ name: 'GMA Regions', url: 'https://data.gmanetwork.com/gno/rss/news/regions/feed.xml', source: 'GMA News' },
	{ name: 'Manila Times', url: 'https://www.manilatimes.net/news/regions/feed', source: 'The Manila Times' },
	{ name: 'BusinessWorld', url: 'https://www.bworldonline.com/feed/', source: 'BusinessWorld' },
	// Outlets that turn away feed readers (ABS-CBN, Manila Bulletin, PNA, MindaNews,
	// SunStar, BusinessMirror, Daily Tribune), read through Google News's index of them.
	{
		name: 'Google News (PH outlets)',
		url: google(
			`${ABOUT} (site:news.abs-cbn.com OR site:mb.com.ph OR site:pna.gov.ph OR site:mindanews.com OR site:sunstar.com.ph OR site:businessmirror.com.ph OR site:tribune.net.ph OR site:pia.gov.ph OR site:ptvnews.ph)`,
		),
	},
	{ name: 'Google News', url: google('BARMM OR Bangsamoro') },
	// International coverage.
	{ name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
	{ name: 'BBC Asia', url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC News' },
	{ name: 'The Diplomat', url: 'https://thediplomat.com/feed/', source: 'The Diplomat' },
	{ name: 'UCA News', url: 'https://www.ucanews.com/rss/news', source: 'UCA News' },
	{ name: 'Google News (international)', url: google('Bangsamoro OR BARMM OR "Mindanao autonomy"', 'US') },
]

/** Not news outlets: posts and reposts that Google News sometimes lists. */
const NOT_OUTLETS = /^(facebook|youtube|x|twitter|instagram|tiktok|linkedin|pressreader|msn|yahoo|scribd)\b/i

/** Outlet names as readers know them. */
const OUTLET_NAMES: Record<string, string> = {
	'SunStar Publishing Inc.': 'SunStar',
	'Inquirer.net': 'Inquirer',
	'Philstar.com': 'Philstar',
	'GMA Network': 'GMA News',
	'ABS-CBN News': 'ABS-CBN',
	'BARMM Official Website': 'Bangsamoro Government',
	'ptvnews.ph': 'PTV News',
	'Philippine News Agency': 'PNA',
	'BusinessWorld Online': 'BusinessWorld',
	'The Diplomat – Asia-Pacific Current Affairs Magazine': 'The Diplomat',
}

/** The region named in a headline or teaser. Sulu left the region in 2024 and is not on the list. */
const ABOUT_THE_REGION =
	/\b(BARMM|Bangsamoro|Cotabato City|Maguindanao|Lanao del Sur|Marawi|Basilan|Lamitan|Tawi-?Tawi|Special Geographic Area|MILF|MNLF)\b/i

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }

function text(raw: string) {
	return raw
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
		.replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
		.replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
		.replace(/\s+/g, ' ')
		.trim()
}

const tag = (item: string, name: string) => item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? ''

/** A teaser cut at a word, never the article. */
function teaser(s: string, max = 240) {
	if (s.length <= max) return s
	return `${s.slice(0, s.lastIndexOf(' ', max))}…`
}

export type FetchedItem = Omit<NewsItem, 'id' | 'hidden' | 'fetched_at'>

/** One feed's items about the region. */
export async function readFeed(feed: Feed): Promise<FetchedItem[]> {
	const res = await fetch(feed.url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; BetterBARMM news reader)' }, signal: AbortSignal.timeout(30_000) })
	if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`)
	const xml = await res.text()
	const out: FetchedItem[] = []
	for (const item of xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []) {
		let title = text(tag(item, 'title'))
		const url = text(tag(item, 'link')) || text(tag(item, 'guid'))
		if (!title || !/^https?:\/\//.test(url)) continue
		// Google News names the outlet in <source> and appends it to the headline.
		const named = text(tag(item, 'source'))
		if (named && NOT_OUTLETS.test(named)) continue
		const source = feed.source ?? (OUTLET_NAMES[named] ?? (named || feed.name))
		if (named && title.endsWith(` - ${named}`)) title = title.slice(0, -(named.length + 3))
		const summary = feed.name.startsWith('Google News') ? '' : teaser(text(tag(item, 'description')))
		if (!feed.regional && !ABOUT_THE_REGION.test(`${title} ${summary}`)) continue
		const date = new Date(text(tag(item, 'pubDate')) || text(tag(item, 'dc:date')))
		out.push({ url, title, source, summary, feed: feed.name, published_at: Number.isNaN(date.getTime()) ? null : date.toISOString() })
	}
	return out
}

const key = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * Read every feed, add what is new, and log the run. The client must be
 * allowed to write news: the service role from a script, or an editor's
 * session from the admin.
 */
export async function runNewsFetch(db: SupabaseClient, trigger: NewsRun['trigger'], byEmail = ''): Promise<NewsRun> {
	const { data: run, error: startError } = await db.from('news_runs').insert({ trigger, by_email: byEmail }).select().single()
	if (startError) throw new Error(`news_runs: ${startError.message}`)

	const errors: string[] = []
	const items: FetchedItem[] = []
	const results = await Promise.allSettled(NEWS_FEEDS.map(readFeed))
	results.forEach((r, i) => (r.status === 'fulfilled' ? items.push(...r.value) : errors.push(String(r.reason?.message ?? r.reason ?? NEWS_FEEDS[i]!.name))))

	// One story once: the first feed to carry a headline keeps it, so an
	// outlet's own feed wins over the same story through Google News.
	const seenTitles = new Set<string>()
	const unique = items.filter((item) => {
		const k = key(item.title)
		if (seenTitles.has(k)) return false
		seenTitles.add(k)
		return true
	})

	// Skip what is already stored, by link or by headline.
	const { data: recent } = await db.from('news_items').select('url,title').order('fetched_at', { ascending: false }).limit(2000)
	const haveUrls = new Set((recent ?? []).map((r) => r.url as string))
	const haveTitles = new Set((recent ?? []).map((r) => key(r.title as string)))
	const fresh = unique.filter((item) => !haveUrls.has(item.url) && !haveTitles.has(key(item.title)))

	if (fresh.length) {
		const { error } = await db.from('news_items').upsert(fresh, { onConflict: 'url', ignoreDuplicates: true })
		if (error) errors.push(`news_items: ${error.message}`)
	}

	const { data: done, error: endError } = await db
		.from('news_runs')
		.update({ finished_at: new Date().toISOString(), seen: unique.length, added: errors.some((e) => e.startsWith('news_items')) ? 0 : fresh.length, errors })
		.eq('id', run.id)
		.select()
		.single()
	if (endError) throw new Error(`news_runs: ${endError.message}`)
	return done as NewsRun
}
