import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { listNews } from '@betterbarmm/db'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Latest news',
	description: 'Headlines about the Bangsamoro from the region’s own offices and the national press, gathered five times a day, each linking to the outlet that reported it.',
	path: '/news',
})

// The feeds are read five times a day; the page catches up within five minutes.
export const revalidate = 300

const day = (iso: string) =>
	new Date(iso).toLocaleDateString('en-PH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' })

export default async function NewsPage() {
	const items = await listNews(200).catch(() => [])
	const days = new Map<string, typeof items>()
	for (const item of items) {
		const label = item.published_at ? day(item.published_at) : 'Undated'
		days.set(label, [...(days.get(label) ?? []), item])
	}
	const sources = [...new Set(items.map((item) => item.source))]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='news' />

			<Masthead
				brand
				label='Latest news'
				lines={['What is being reported', 'about the Bangsamoro.']}
				muted={[1]}
				standfirst='Headlines from the region’s own offices and the national press, gathered five times a day. Each links to the outlet that reported it; read the story there.'
			/>

			<section className='bb-container bb-section'>
				{days.size ? (
					<div className='grid gap-14'>
						{[...days].map(([label, list]) => (
							<div key={label}>
								<h2 className='bb-label'>{label}</h2>
								<ul className='mt-4'>
									{list.map((item) => (
										<li key={item.id} className='border-t border-[var(--rule)]'>
											<a href={item.url} target='_blank' rel='noreferrer' className='group grid gap-x-8 gap-y-1 py-5 md:grid-cols-[minmax(0,1fr)_12rem]'>
												<span>
													<span className='text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
														{item.title}
														<ArrowUpRightIcon className='ml-1.5 inline size-3.5 align-baseline text-[var(--ink-mute)] group-hover:text-[var(--accent)]' weight='bold' aria-hidden='true' />
													</span>
													{item.summary ? <span className='mt-2 block text-[14px] leading-[1.7] text-[var(--ink-2)]'>{item.summary}</span> : null}
												</span>
												<span className='text-[12.5px] leading-[1.7] text-[var(--ink-3)] md:text-right'>
													<span className='block font-semibold text-[var(--ink-2)]'>{item.source}</span>
													{item.published_at ? time(item.published_at) : null}
												</span>
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				) : (
					<p className='text-[15px] leading-[1.7] text-[var(--ink-3)]'>No news gathered yet. The first read runs at the next scheduled time.</p>
				)}

				{sources.length ? (
					<p className='mt-16 max-w-[52rem] border-t border-[var(--rule)] pt-6 text-[13px] leading-[1.7] text-[var(--ink-3)]'>
						From {sources.slice(0, 12).join(', ')}{sources.length > 12 ? ' and others' : ''}. Headlines and teasers belong to their outlets; BetterBARMM
						links to them and does not reproduce the stories.
					</p>
				) : null}
			</section>
		</main>
	)
}
