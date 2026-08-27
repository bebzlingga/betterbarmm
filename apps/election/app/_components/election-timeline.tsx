'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

export type TimelineEventItem = {
	id: string
	/** The date as printed — "Jul 26, 2018", "Jan 2019", "2023". */
	dateLabel: string
	/** What kind of event it was, in the workspace's own vocabulary. */
	kicker: string
	title: string
	body: string
	/** The vote itself. Marked, because everything else on the axis leads to it. */
	isElectionDay?: boolean
}

export type TimelinePhase = {
	phase: string
	events: TimelineEventItem[]
}

/** One column per event. The bands above the axis are measured in these. */
const COLUMN = 18 * 16

/**
 * A colour per phase, in the order the phases run.
 *
 * The cards used to open on a two-pixel black rule, which is the heaviest
 * mark on the page and says nothing — every card wore the same one, so twenty
 * of them read as twenty identical objects strung along a line. A short bar in
 * the phase's own colour says which stretch of the road a moment belongs to
 * without a word, and it is the same bar the band above the axis carries, so a
 * card and its band are visibly one thing.
 *
 * The tokens are the estate's, and they run brass to crimson: the foundations,
 * then the years the date moved, then the calendar being kept, then the vote.
 * A phase past the fourth wraps rather than inventing a colour.
 */
const PHASE_COLORS = ['var(--brass)', 'var(--slate)', 'var(--ochre)', 'var(--accent)'] as const

/**
 * The road to the vote, along an axis the reader drags.
 *
 * Horizontal because the story is one of a date being moved: an election first
 * expected in 2022, held in neither 2022 nor 2025, and now set for September
 * 2026. Down a page that is a list of dates; along an axis it is distance, and
 * the three postponements are visible as the stretch of track between the law
 * that created the Parliament and the day it is finally elected.
 *
 * The phase bands are the part that is new. A flat run of twenty events says
 * the election kept moving; the bands say the foundations were laid once, the
 * date moved through the courts and Congress, and everything since has been a
 * calendar being kept.
 */
export function ElectionTimeline({ phases }: { phases: TimelinePhase[] }) {
	const scrollerRef = useRef<HTMLDivElement>(null)
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0 })
	const [isScrolling, setIsScrolling] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [thumb, setThumb] = useState({ left: 0, width: 100 })

	const updateThumb = () => {
		const scroller = scrollerRef.current
		if (!scroller) return

		const overflow = scroller.scrollWidth - scroller.clientWidth
		const width = overflow <= 0 ? 100 : (scroller.clientWidth / scroller.scrollWidth) * 100
		const left = overflow <= 0 ? 0 : (scroller.scrollLeft / overflow) * (100 - width)
		setThumb({ left, width })
	}

	const revealIndicator = () => {
		setIsScrolling(true)
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
		hideTimerRef.current = setTimeout(() => setIsScrolling(false), 900)
	}

	const startDragging = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return
		const scroller = scrollerRef.current
		if (!scroller) return

		dragRef.current = { active: true, startX: event.clientX, scrollLeft: scroller.scrollLeft }
		scroller.setPointerCapture(event.pointerId)
		setIsDragging(true)
		revealIndicator()
	}

	const drag = (event: PointerEvent<HTMLDivElement>) => {
		const scroller = scrollerRef.current
		if (!scroller || !dragRef.current.active) return

		scroller.scrollLeft = dragRef.current.scrollLeft - (event.clientX - dragRef.current.startX)
		updateThumb()
		revealIndicator()
		event.preventDefault()
	}

	const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
		const scroller = scrollerRef.current
		dragRef.current.active = false
		setIsDragging(false)
		if (scroller?.hasPointerCapture(event.pointerId)) {
			scroller.releasePointerCapture(event.pointerId)
		}
	}

	useEffect(() => {
		updateThumb()
		const scroller = scrollerRef.current
		if (!scroller) return undefined

		const handleScroll = () => {
			updateThumb()
			revealIndicator()
		}
		const handleResize = () => updateThumb()

		scroller.addEventListener('scroll', handleScroll, { passive: true })
		window.addEventListener('resize', handleResize)

		return () => {
			scroller.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', handleResize)
			if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
		}
	}, [])

	const items = phases.flatMap((group, index) =>
		group.events.map((event) => ({
			...event,
			color: PHASE_COLORS[index % PHASE_COLORS.length],
		})),
	)

	return (
		<div className='w-full'>
			<div
				ref={scrollerRef}
				className={`timeline-scroll select-none overflow-x-auto overflow-y-hidden pb-2 pl-6 pr-6 lg:pl-[max(2rem,calc((100vw-88rem)/2+2rem))] lg:pr-8 ${
					isDragging ? 'cursor-grabbing' : 'cursor-grab'
				}`}
				aria-label='Election timeline'
				tabIndex={0}
				onWheel={revealIndicator}
				onPointerDown={startDragging}
				onPointerMove={drag}
				onPointerUp={stopDragging}
				onPointerCancel={stopDragging}
				onLostPointerCapture={() => {
					dragRef.current.active = false
					setIsDragging(false)
				}}
				onTouchStart={revealIndicator}
			>
				<div className='min-w-max'>
					{/* The bands. Each spans its own events, so a phase is a length of
					    track rather than a heading floating over one. */}
					<div className='flex' aria-hidden='true'>
						{phases.map((group, index) => (
							<div
								key={group.phase}
								style={{ width: group.events.length * COLUMN }}
								className='shrink-0 px-4'
							>
								<div
									className='border-t-2 pt-2.5'
									style={{ borderColor: PHASE_COLORS[index % PHASE_COLORS.length] }}
								>
									<p
										className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em]'
										style={{ color: PHASE_COLORS[index % PHASE_COLORS.length] }}
									>
										{group.phase}
									</p>
									<p className='mt-1 font-mono text-[10px] text-[var(--ink-3)]'>
										{group.events.length} {group.events.length === 1 ? 'moment' : 'moments'}
									</p>
								</div>
							</div>
						))}
					</div>

					<div className='relative flex snap-x py-6'>
						{/* One axis for the whole run rather than a segment per card: a
						    line drawn in pieces shows every join at a fractional width. */}
						<span
							aria-hidden='true'
							className='absolute inset-x-0 top-1/2 h-px bg-[var(--ink)]'
						/>

						{items.map((item, index) => {
							const above = index % 2 === 0

							return (
								<article
									key={item.id}
									style={{ width: COLUMN }}
									// Tall enough for the longest card in the set, so nothing is
									// clipped and the rail never scrolls vertically. The row is a
									// fixed height because the axis sits at its exact middle, and
									// that height is measured from the content rather than guessed:
									// the longest description runs five lines at this column width,
									// which with a two-line title, the phase bar and the clearance
									// above the connector needs about 250 points either side.
									className='relative h-[32rem] shrink-0 snap-start px-4'
								>
									<span
										aria-hidden='true'
										className={`absolute left-1/2 top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border ${
											item.isElectionDay
												? 'border-[var(--accent)] bg-[var(--accent)]'
												: 'border-[var(--ink)] bg-[var(--paper)]'
										}`}
									/>
									<span
										aria-hidden='true'
										className={`absolute left-1/2 h-12 w-px -translate-x-1/2 bg-[var(--rule)] ${
											above ? 'bottom-1/2 mb-2' : 'top-1/2 mt-2'
										}`}
									/>

									{/* The date sits on the axis side of the card, so the eye
									    reads date → event rather than crossing the line twice. */}
									<div
										className={`absolute left-1/2 w-[15rem] -translate-x-1/2 text-center ${
											above ? 'top-[calc(50%+1.5rem)]' : 'bottom-[calc(50%+1.5rem)]'
										}`}
									>
										<p
											className={`num text-[15px] font-bold leading-none tracking-[-0.02em] ${
												item.isElectionDay ? 'text-[var(--accent)]' : 'text-[var(--ink)]'
											}`}
										>
											{item.dateLabel}
										</p>
										<p className='mt-1.5 font-mono text-[9px] font-semibold uppercase leading-snug tracking-[0.14em] text-[var(--ink-3)]'>
											{item.kicker}
										</p>
									</div>

									{/* The card is bounded on the axis side rather than left to grow
									    toward it. It was anchored only at the far edge, so a long body
									    ran down the column and straight through the stub of line that
									    joins the card to the axis. Stopping it short of the stub — and
									    growing it away from the axis with `justify-end` on the ones
									    above — means the connector always has clear track to cross.

									    The rule over it is a short bar in the phase's own colour now.
									    A full-width two-pixel black line is the heaviest mark on the
									    page and the same on every card; twenty of them read as twenty
									    identical objects. Election day keeps the crimson, because that
									    is the one moment the whole axis is travelling toward. */}
									<div
										className={`absolute left-4 right-4 flex flex-col ${
											above
												? 'top-0 bottom-[calc(50%+4.25rem)] justify-end'
												: 'bottom-0 top-[calc(50%+4.25rem)]'
										}`}
									>
										<div>
											<span
												aria-hidden='true'
												className='block h-1.5 w-10'
												style={{ background: item.isElectionDay ? 'var(--accent)' : item.color }}
											/>
											<div className='pt-4'>
												<h3 className='text-[16px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
													{item.title}
												</h3>
												{item.body ? (
													<p className='mt-2.5 text-[13px] leading-6 text-[var(--ink-2)]'>
														{item.body}
													</p>
												) : null}
											</div>
										</div>
									</div>
								</article>
							)
						})}
					</div>
				</div>
			</div>

			<div
				className={`relative mt-4 h-px bg-[var(--rule)] transition-opacity duration-200 ${
					isScrolling ? 'opacity-100' : 'opacity-40'
				}`}
				aria-hidden='true'
			>
				<div
					className='absolute inset-y-0 bg-[var(--brass)]'
					style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
				/>
			</div>

			<p className='mt-3 pl-6 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] lg:pl-[max(2rem,calc((100vw-88rem)/2+2rem))]'>
				Drag or scroll sideways
			</p>
		</div>
	)
}
