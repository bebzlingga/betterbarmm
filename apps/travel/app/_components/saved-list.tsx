'use client'

import { HeartIcon } from '@phosphor-icons/react'
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

	// Nothing yet: centred, with room around it (user decision), and the heart drawn so the line reads as it looks.
	if (!list.length)
		return (
			<div className='mx-auto flex max-w-md flex-col items-center py-20 text-center lg:py-28'>
				<span className='grid size-16 place-items-center border border-[var(--rule)] bg-[var(--paper-2)] text-[var(--accent)]'>
					<HeartIcon size={30} weight='duotone' aria-hidden='true' />
				</span>
				<h2 className='mt-6 font-[family-name:var(--font-display)] text-[1.5rem] font-extrabold tracking-[-0.025em] text-[var(--ink)]'>Nothing saved yet</h2>
				<p className='mt-3 text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>
					Tap the{' '}
					<HeartIcon size={15} weight='fill' className='inline-block -translate-y-px align-middle text-[var(--accent)]' aria-label='heart' />{' '}
					on any place to keep it here, and come back to it when you plan the trip.
				</p>
				<Link href='/' className='bb-btn bb-btn-solid mt-8'>
					Start exploring
				</Link>
			</div>
		)

	return (
		<>
			<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
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
