'use client'

import { CalendarStarIcon, CompassIcon, HeartIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import type { CardPlace } from '../_lib/cards'
import { useSaved } from '../_lib/saved'
import { ExploreCard } from './explore-card'

const subscribeNothing = () => () => {}

/** The places this browser has saved, newest first; an empty state that says how to save one. */
export function SavedList({ places }: { places: CardPlace[] }) {
	const { saved } = useSaved()
	// Saved places live in this browser, so the server cannot know them: say nothing until the browser has answered.
	const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false)
	const bySlug = new Map(places.map((p) => [p.slug, p]))
	const list = saved.map((slug) => bySlug.get(slug)).filter((p): p is CardPlace => Boolean(p))

	if (!mounted) return null

	// Nothing yet (user decision: redesigned): a warm panel that says how to save, and four places to start with, each with
	// its heart, so the page is somewhere to begin rather than an empty room.
	if (!list.length) {
		const start = places.filter((p) => p.photos.length).slice(0, 4)
		return (
			<>
				<div className='tv-wash relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12 lg:py-20'>
					<span className='mx-auto grid size-20 place-items-center rounded-full bg-[var(--accent)] text-white shadow-[0_18px_40px_-16px_var(--accent)]'>
						<HeartIcon size={36} weight='fill' aria-hidden='true' />
					</span>
					<h2 className='mt-7 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>Nothing saved yet</h2>
					<p className='mx-auto mt-3 max-w-md text-[1rem] leading-relaxed text-[var(--ink-2)]'>
						Tap the <HeartIcon size={16} weight='fill' className='inline-block -translate-y-px align-middle text-[var(--accent)]' aria-label='heart' /> on any place to keep it here,
						and come back to it when you plan the trip. Saved places stay in this browser.
					</p>
					<div className='mt-8 flex flex-wrap justify-center gap-3'>
						<Link href='/' className='dv-btn bg-[var(--ink)] text-[var(--paper)]'>
							<CompassIcon size={18} weight='bold' aria-hidden='true' />
							Start exploring
						</Link>
						<Link href='/calendar' className='dv-btn border border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)]'>
							<CalendarStarIcon size={18} weight='bold' aria-hidden='true' />
							What’s on this year
						</Link>
					</div>
				</div>
				{start.length ? (
					<section className='mt-16'>
						<h2 className='dv-title !text-[clamp(1.5rem,2.4vw,2rem)]'>Places to start with</h2>
						<p className='dv-lede'>Tap a heart to keep one.</p>
						<div className='mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4'>
							{start.map((p) => (
								<ExploreCard key={p.slug} place={p} />
							))}
						</div>
					</section>
				) : null}
			</>
		)
	}

	return (
		<>
			<p className='text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
				<span className='text-[var(--ink)]'>{list.length}</span> {list.length === 1 ? 'place' : 'places'} saved
			</p>
			<div className='mt-8 grid grid-cols-1 gap-x-8 gap-y-12 lg:gap-x-[48px] lg:gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{list.map((p) => (
					<ExploreCard key={p.slug} place={p} />
				))}
			</div>
		</>
	)
}
