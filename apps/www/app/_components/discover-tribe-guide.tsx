'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { discoverPhotos } from './discover-media'
import { bangsamoroTribes, TRIBE_COLUMNS, type BangsamoroTribe } from './discover-tribes'
import { Reveal } from './reveal'

/**
 * A rail of the peoples, pinned under the header.
 *
 * Every entry stays on the page — this navigates, it does not filter. A tab
 * strip that swapped one people in for another would hide four fifths of the
 * section from anyone who does not click, and from anything that reads the page
 * without running scripts. So the chips scroll, and the active one is worked
 * out from where the reader already is.
 */
function TribeRail({ tribes, active }: { tribes: BangsamoroTribe[]; active: string | null }) {
	return (
		<div className='sticky top-[var(--sticky-top)] z-20 transition-[top] duration-300 -mx-6 border-y border-[var(--rule)] bg-[var(--paper)]/92 px-6 backdrop-blur-md lg:-mx-8 lg:px-8'>
			<div className='flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
				<span className='shrink-0 pr-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
					Jump to
				</span>
				{tribes.map((tribe, index) => (
					<a
						key={tribe.slug}
						href={`#tribe-${tribe.slug}`}
						data-active={active === tribe.slug}
						className='flex shrink-0 items-baseline gap-2 border border-[var(--rule)] px-3 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] data-[active=true]:border-[var(--accent)] data-[active=true]:bg-[var(--accent)] data-[active=true]:text-white'
					>
						<span className='opacity-60'>{String(index + 1).padStart(2, '0')}</span>
						{tribe.name}
					</a>
				))}
			</div>
		</div>
	)
}

function ColumnList({ items }: { items: { name: string; note: string }[] }) {
	return (
		<ol className='mt-5'>
			{items.map((item, index) => (
				<li
					key={item.name}
					className='border-t border-[var(--rule-soft)] py-4 first:border-t-0 first:pt-0'
				>
					{/* Name first, number closing the row — the way the people cards and the
					    group counters read elsewhere in Discover. With the number out of the
					    way the note underneath no longer needs indenting past it either. */}
					<div className='flex items-baseline justify-between gap-2.5'>
						<h4 className='text-[16px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
							{item.name}
						</h4>
						<span className='num shrink-0 text-[10.5px] font-medium text-[var(--ink-3)]'>
							{String(index + 1).padStart(2, '0')}
						</span>
					</div>
					<p className='mt-2 bb-body text-[var(--ink-2)]'>{item.note}</p>
				</li>
			))}
		</ol>
	)
}

function TribeSection({ tribe, index }: { tribe: BangsamoroTribe; index: number }) {
	const foodPhoto = tribe.photos.food ? discoverPhotos[tribe.photos.food] : undefined
	const craftPhoto = tribe.photos.craft ? discoverPhotos[tribe.photos.craft] : undefined

	return (
		<section
			id={`tribe-${tribe.slug}`}
			data-tribe={tribe.slug}
			/* One people to the next: space, then a hairline, then space again. The
			   margin sits above the line and the padding below it, so the rule reads as
			   the division rather than as a lid on the section under it. It is the soft
			   rule, not the ink one this carried before — at full strength it competed
			   with the borders inside each people's own columns.

			   The first section keeps both: the rail above it is sticky and sits on the
			   page rather than in the flow, so without them Meranao opened tight under
			   it while every people after it had room. */
			className='scroll-mt-32 mt-[clamp(3.25rem,5vw,5.5rem)] border-t border-[var(--rule-soft)] pt-[clamp(2.75rem,4.5vw,4.5rem)]'
		>
			<Reveal>
				{/* ---- Masthead ---- */}
				<div className='grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14'>
					<div>
						<p className='flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]'>
							<span className='text-[var(--accent)]'>{String(index + 1).padStart(2, '0')}</span>
							<span className='h-px w-8 bg-[var(--rule)]' aria-hidden='true' />
							{tribe.homeland}
						</p>

						<h3 className='dsc-display-sm mt-5 text-[var(--ink)]'>
							{tribe.name}
							{tribe.alsoKnownAs ? (
								<span className='dsc-display-mute'> / {tribe.alsoKnownAs}</span>
							) : null}
						</h3>

						{tribe.meaning ? (
							<p className='mt-4 italic bb-body text-[var(--ink-3)]'>
								{tribe.meaning}
							</p>
						) : null}

						<p className='mt-6 max-w-2xl bb-body text-[var(--ink-2)]'>
							{tribe.intro}
						</p>
					</div>

					{/* Two frames: the plate and the made thing. Side by side they say the
					    point of the whole section — that a people is a kitchen and a
					    workshop, not a label on a map. */}
					<div className='grid grid-cols-2 gap-3'>
						{[foodPhoto, craftPhoto].map((entry, i) =>
							entry ? (
								<figure key={entry.source} className='flex flex-col'>
									<div className='dsc-frame dsc-frame-anim dsc-zoom aspect-[3/4]'>
										<Image
											src={entry.src}
											alt={entry.alt}
											sizes='(min-width: 1024px) 22vw, 46vw'
											placeholder='blur'
											className='size-full object-cover'
										/>
										<span className='absolute left-0 top-0 z-2 bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white'>
											{i === 0 ? 'Table' : 'Hand'}
										</span>
									</div>
									<figcaption className='mt-2.5 border-t border-[var(--rule)] pt-2.5 text-[11.5px] leading-5 text-[var(--ink-3)]'>
										{entry.caption}{' '}
										<a
											href={entry.source}
											target='_blank'
											rel='noreferrer'
											className='whitespace-nowrap underline decoration-[var(--rule)] underline-offset-2 transition hover:text-[var(--accent)]'
										>
											{entry.credit}
										</a>
									</figcaption>
								</figure>
							) : null,
						)}
					</div>
				</div>

				{/* ---- The three columns ---- */}
				<div className='mt-12 grid gap-x-14 gap-y-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-20'>
					{TRIBE_COLUMNS.map((column) => {
						const items = tribe[column.key]
						if (items.length === 0) return null

						return (
							<div key={column.key}>
								<div className='flex items-baseline justify-between gap-3 border-t border-[var(--ink)] pt-3'>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
										{column.eyebrow}
									</p>
									<p className='num text-[11px] text-[var(--ink-3)]'>{items.length}</p>
								</div>
								<p className='mt-2 text-[12px] leading-5 text-[var(--ink-3)]'>{column.blurb}</p>
								<ColumnList items={items} />
							</div>
						)
					})}
				</div>

				{/* ---- National Living Treasure ----

				    The strongest single fact this section carries. Four of these five
				    peoples have produced a Manlilikha ng Bayan, and naming the person
				    turns "the Yakan are known for weaving" into a woman in Lamitan who
				    can execute every design her people have. */}
				{tribe.livingTreasure ? (
					<div className='mt-12 border border-[var(--rule)] bg-[var(--paper-2)] p-6 lg:p-8'>
						<div className='flex flex-wrap items-baseline gap-x-4 gap-y-2'>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]'>
								National Living Treasure
							</p>
							<p className='font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								Gawad sa Manlilikha ng Bayan
							</p>
						</div>

						<div className='mt-4 grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10'>
							<div>
								<h4 className='text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
									{tribe.livingTreasure.name}
								</h4>
								<p className='mt-2 text-[13px] text-[var(--ink-3)]'>
									{tribe.livingTreasure.title} · {tribe.livingTreasure.place}
								</p>
							</div>

							<div>
								<p className='bb-body text-[var(--ink-2)]'>
									{tribe.livingTreasure.note}
								</p>
								<a
									href={tribe.livingTreasure.href}
									target='_blank'
									rel='noreferrer'
									className='mt-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
								>
									BCPCH profile
									<span aria-hidden='true'>&#8599;</span>
								</a>
							</div>
						</div>
					</div>
				) : null}

				{/* ---- Sources ---- */}
				<div className='mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 pb-16 lg:pb-20'>
					<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
						Sources
					</span>
					{tribe.sources.map((source) => (
						<a
							key={source.href}
							href={source.href}
							target='_blank'
							rel='noreferrer'
							className='border border-[var(--rule)] px-2.5 py-1 text-[11.5px] text-[var(--ink-2)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]'
						>
							{source.label}
						</a>
					))}
				</div>
			</Reveal>
		</section>
	)
}

/**
 * Food and culture, one people at a time.
 *
 * The section this replaced listed nine dishes in a single sentence, which read
 * as one regional cuisine. It is not one cuisine: tiyula itum is Tausug, pastil
 * is Maguindanaon, piaparan is Meranao, and okoh-okoh is what Tawi-Tawi pulls
 * out of the water. Splitting by people is the whole point — everything else
 * here follows from it.
 */
export function DiscoverTribeGuide() {
	const [active, setActive] = useState<string | null>(bangsamoroTribes[0]?.slug ?? null)
	const rootRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const root = rootRef.current
		if (!root || typeof IntersectionObserver === 'undefined') return

		const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-tribe]'))
		if (sections.length === 0) return

		// Whichever section currently covers the band just under the sticky rail is
		// the one the reader is in. Recomputed from all the sections on every
		// callback rather than trusting the last event to arrive: entries report
		// changes, so a fast scroll — or a jump straight back to the top — can
		// leave the last chip lit while the reader is looking at the first.
		const pick = () => {
			const top = 140
			let best: string | null = null
			let bestDistance = Number.POSITIVE_INFINITY

			for (const section of sections) {
				const box = section.getBoundingClientRect()
				if (box.bottom < top) continue
				const distance = Math.abs(box.top - top)
				if (distance < bestDistance) {
					bestDistance = distance
					best = section.getAttribute('data-tribe')
				}
			}

			if (best) setActive(best)
		}

		const observer = new IntersectionObserver(pick, {
			rootMargin: '-120px 0px -60% 0px',
			threshold: 0,
		})

		for (const section of sections) observer.observe(section)
		return () => observer.disconnect()
	}, [])

	return (
		<div ref={rootRef}>
			<TribeRail tribes={bangsamoroTribes} active={active} />

			<div className='mt-12'>
				{bangsamoroTribes.map((tribe, index) => (
					<TribeSection key={tribe.slug} tribe={tribe} index={index} />
				))}
			</div>
		</div>
	)
}
