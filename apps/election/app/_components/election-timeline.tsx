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

	const items = phases.flatMap((group) => group.events)

	return (
		<div className='w-full'>
			<div
				ref={scrollerRef}
				className={`timeline-scroll select-none overflow-x-auto pb-2 pl-6 pr-6 lg:pl-[max(2rem,calc((100vw-88rem)/2+2rem))] lg:pr-8 ${
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
						{phases.map((group) => (
							<div
								key={group.phase}
								style={{ width: group.events.length * COLUMN }}
								className='shrink-0 px-4'
							>
								<div className='border-t-2 border-[var(--brass-line)] pt-2.5'>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
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
									className='relative h-[27rem] shrink-0 snap-start px-4'
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

									<div className={`absolute left-4 right-4 ${above ? 'top-0' : 'bottom-0'}`}>
										<div
											className={`border-t-2 pt-4 ${
												item.isElectionDay ? 'border-[var(--accent)]' : 'border-[var(--ink)]'
											}`}
										>
											<h3 className='text-[17px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
												{item.title}
											</h3>
											{item.body ? (
												<p className='mt-2.5 line-clamp-6 text-[13px] leading-6 text-[var(--ink-2)]'>
													{item.body}
												</p>
											) : null}
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
