import fs from 'node:fs'
import path from 'node:path'
import type { Metadata } from 'next'
import dataset from '../../../../datasets/news/index.json'
import { NewsList } from '../_components/news-list'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'Latest news',
	description: 'Headlines about the Bangsamoro from the region’s own offices and the national press, gathered from their feeds, each linking to the outlet that reported it.',
	path: '/news',
})

/* The feeds are read by datasets/news/scripts/fetch_news.ts into a file, as every other dataset is, and the
   page is built from it. The database the fetch once wrote to is gone. */
type Item = { url: string; title: string; source: string; published_at: string | null; summary: string; image?: string | null }

const day = (iso: string) =>
	new Date(iso).toLocaleDateString('en-PH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' })

/* The news is kept a week to a file (datasets/news/weeks/<Monday>.json) and none of it is deleted (user decision);
   the page shows the 7 days up to the newest story and keeps the older weeks out of sight. Read from the two newest
   files, since 7 days back from a Monday reaches into the week before. */
const WEEKS = path.join(process.cwd(), '../../datasets/news/weeks')
function latest(): Item[] {
	const files = (dataset.weeks as string[]).slice(0, 2).map((w) => path.join(WEEKS, `${w}.json`))
	const items = files.flatMap((f) => (JSON.parse(fs.readFileSync(f, 'utf8')) as { items: Item[] }).items)
	const newest = Math.max(...items.map((i) => (i.published_at ? Date.parse(i.published_at) : 0)))
	return items.filter((i) => i.published_at && Date.parse(i.published_at) > newest - 7 * 86_400_000)
}

/* One story, many outlets. Two headlines are the same story when, within two days of each other, they share at
   least three words and a quarter of their words, leaving out places and filler: every story here is about
   Maguindanao or Marawi, so a shared place says nothing, and since October nearly every one names the Chief Minister,
   so his title says nothing either: left in, it chained his election, the search for a cabinet and the cabinet itself into
   one story. Tried on a week of headlines, this joined 13 stories
   and no two different ones; lower, it began joining a killing with the alert that followed it. */
const FILLER = new Set(
	('the of in on at to for and with from by as is are was were be after over into its his her their new says said amid will not than ' +
		'this that about out barmm bangsamoro philippines region regional gov govt government del norte sur city maguindanao cotabato ' +
		'lanao marawi basilan tawi sulu mindanao province town chief minister ministers cm').split(' '),
)
const NUMBER: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10' }
function words(title: string) {
	const out = new Set<string>()
	for (let w of title.toLowerCase().replace(/-/g, '').match(/[a-z0-9]+/g) ?? []) {
		w = NUMBER[w] ?? w
		if (FILLER.has(w) || (w.length < 3 && !/^\d+$/.test(w))) continue
		out.add(w.length > 5 ? w.replace(/(ings?|ed|ers?|es|s)$/, '') : w)
	}
	return out
}
function stories(items: Item[]) {
	const ws = items.map((i) => words(i.title))
	const at = items.map((i) => (i.published_at ? Date.parse(i.published_at) : null))
	const parent = items.map((_, i) => i)
	const root = (i: number): number => (parent[i] === i ? i : (parent[i] = root(parent[i]!)))
	for (let a = 0; a < items.length; a++)
		for (let b = a + 1; b < items.length; b++) {
			if (at[a] && at[b] && Math.abs(at[a]! - at[b]!) > 2 * 86_400_000) continue
			const shared = [...ws[a]!].filter((w) => ws[b]!.has(w)).length
			if (shared >= 3 && shared / new Set([...ws[a]!, ...ws[b]!]).size >= 0.25) parent[root(a)] = root(b)
		}
	const groups = new Map<number, Item[]>()
	items.forEach((item, i) => groups.set(root(i), [...(groups.get(root(i)) ?? []), item]))
	return [...groups.values()]
		.map((group) => {
			// The headline is the one an outlet's own feed carries with its teaser; else the earliest report.
			const byTime = [...group].sort((x, y) => (x.published_at ?? '').localeCompare(y.published_at ?? ''))
			const lead = byTime.find((i) => i.summary) ?? byTime[0]!
			// The day and the time are the lead report's, so the row says when the story it shows broke; the later
			// reports of it are the outlets under "Also reported by", not a later date beside an earlier time.
			const at = lead.published_at
			const seen = new Set([lead.source])
			return {
				key: lead.url,
				title: lead.title,
				// The lead's picture, else the first other report's: the outlets' own, shown small beside the link.
				image: lead.image ?? byTime.find((i) => i.image)?.image ?? null,
				summary: lead.summary,
				url: lead.url,
				source: lead.source,
				day: at ? day(at) : 'Undated',
				time: at ? time(at) : null,
				at: at ?? '',
				// One link per other outlet: an outlet with two takes on the story is still one more source.
				also: byTime.filter((i) => i !== lead && !seen.has(i.source) && seen.add(i.source)).map((i) => ({ source: i.source, url: i.url })),
			}
		})
		.sort((x, y) => y.at.localeCompare(x.at))
}

export default function NewsPage() {
	const items = latest()
	const sources = [...new Set(items.map((item) => item.source))]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='news' />

			<NewsList
				stories={stories(items)}
				head={
					<>
						<p className='bb-label'>What is being reported about the Bangsamoro</p>
						<h1 className='bb-display-md mt-4 text-[var(--ink)]'>Latest News</h1>
						<p className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							Headlines from the region’s own offices and the national press, one story to a row with every outlet that reported it. Read the story there.
						</p>
					</>
				}
			/>

			<section className='bb-container pb-16'>
				{sources.length ? (
					<p className='mx-auto max-w-5xl border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						From {sources.slice(0, 12).join(', ')}{sources.length > 12 ? ' and others' : ''}, read on{' '}
						{new Date(dataset.generatedAt).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })}. Headlines and teasers belong to their
						outlets; BetterBARMM links to them and does not reproduce the stories.
					</p>
				) : null}
			</section>
			<GetInvolved />
		</main>
	)
}
