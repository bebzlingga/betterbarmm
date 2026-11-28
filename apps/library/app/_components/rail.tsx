'use client'

import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Children } from 'react'

/**
 * The two round arrows that step a rail a screen at a time, on a desktop. They move the `.dv-rail` in their own
 * section, so any section with a rail can carry them beside its heading, a server component's too.
 */
export function RailArrows({ show = true }: { show?: boolean }) {
	const step = (button: HTMLElement, dir: 1 | -1) => {
		const row = button.closest('section')?.querySelector<HTMLElement>('.dv-rail')
		row?.scrollBy({ left: dir * row.clientWidth * 0.85, behavior: 'smooth' })
	}
	return (
		<div className={`hidden shrink-0 gap-2 ${show ? 'md:flex' : ''}`}>
			{([-1, 1] as const).map((dir) => (
				<button key={dir} type='button' aria-label={dir < 0 ? 'Scroll back' : 'Scroll on'} onClick={(e) => step(e.currentTarget, dir)} className='dv-round'>
					{dir < 0 ? <ArrowLeftIcon size={16} weight='bold' /> : <ArrowRightIcon size={16} weight='bold' />}
				</button>
			))}
		</div>
	)
}

/**
 * A row of cards that scrolls sideways and snaps: a thumb swipes it, a mouse drags it, and on a desktop two round
 * arrows beside its heading step it a screen at a time. The row runs to the page's right edge, the way a travel
 * app's rails do.
 */
export function Rail({ title, lede, more, className = '', children }: { title: string; lede?: string; more?: React.ReactNode; className?: string; children: React.ReactNode }) {
	return (
		<section className={`dv-rail-section ${className}`}>
			<div className='bb-container flex items-end justify-between gap-6'>
				<div>
					<h2 className='dv-title'>{title}</h2>
					{lede ? <p className='dv-lede'>{lede}</p> : null}
				</div>
				{/* Arrows only where the row is likely to run past the page; five covers fit a desktop. */}
				<RailArrows show={Children.count(children) > 5} />
			</div>
			<ul className='dv-rail'>{children}</ul>
			{/* The way to the rest, on the right under the row. */}
			{more ? <div className='bb-container mt-6 flex justify-end text-[0.875rem]'>{more}</div> : null}
		</section>
	)
}
