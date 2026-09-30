'use client'

import { useEffect, useState } from 'react'

export type BudgetTab = {
	id: string
	label: string
	/** Printed small beside the label — a count, usually. */
	badge?: string | number
	panel: React.ReactNode
}

/**
 * Two readings of the same seven years, one at a time.
 *
 * The sectors and the offices are the same money cut two ways, and set one
 * under the other they were two long tables a reader scrolled past rather than
 * chose between. As tabs they are a question — which cut do you want — and the
 * page stops being a document to scroll and starts being one to use.
 *
 * Every panel stays in the DOM, hidden with the `hidden` attribute rather than
 * unmounted. That costs a little markup and buys three things: the whole table
 * is in the page for anything reading it without scripts, in-page find works
 * across both cuts, and switching is instant because a fifty-five row table is
 * not rebuilt from scratch each time.
 *
 * The strip pins to `--sticky-top` rather than to the header's height. The bar
 * above it hides on the way down and returns on the way up, so a fixed offset
 * would leave the strip floating a bar's height below the top of a screen the
 * bar had already left. That variable is where the underside of the bar
 * actually is.
 *
 * The active tab is filled rather than underlined, and the strip's own rule is
 * a hairline rather than the ink one: an underline competes with the table head
 * directly beneath it, which is itself a dark rule, and two heavy horizontals a
 * few pixels apart read as a boxed widget rather than as a choice. The count
 * beside each label takes `currentColor` so it stays legible on the filled tab
 * and recedes on the others.
 *
 * The active tab is mirrored into the URL hash, so a link to one cut survives
 * being shared and a reader arriving on `#offices` lands on it.
 */
export function BudgetTabs({ tabs, label }: { tabs: BudgetTab[]; label?: string }) {
	const [active, setActive] = useState(tabs[0]?.id)

	useEffect(() => {
		const fromHash = () => {
			const id = window.location.hash.replace(/^#/, '')
			if (id && tabs.some((tab) => tab.id === id)) setActive(id)
		}
		fromHash()
		window.addEventListener('hashchange', fromHash)
		return () => window.removeEventListener('hashchange', fromHash)
	}, [tabs])

	const select = (id: string) => {
		setActive(id)
		// `replaceState` rather than assigning to `location.hash`, which would
		// also scroll the panel under the sticky bar it just pinned itself to.
		window.history.replaceState(null, '', `#${id}`)
	}

	return (
		<div>
			{/* Two elements, because the ground and the rule want different widths.
			    The ground is full-bleed so a table scrolling underneath is covered
			    to the edge of the screen; the rule has to start where the table's
			    own head rule starts, or the two run parallel at different lengths a
			    few pixels apart. The negative margin is on the outer one only.

			    Both rules sit on the row rather than on the section around it, so
			    each one starts exactly where the leftmost thing in the band starts.
			    On the section the top rule was drawn across the container's padding
			    too, and began a gutter's width left of everything it was meant to
			    bound.

			    Equal air above and below the tabs, so the filled active tab sits in
			    the band rather than wedged against the rule under it (user decision,
			    twice).

			    The tabs are ranged right with the label on the left (user decision).
			    Ranged left they were three short blocks against a screen's width of
			    empty rule, and the label both fills it and says what the three are a
			    choice between — which the strip had no way of saying before.

			    The air below goes on the panel, not on the sticky element. Padding
			    there would stretch the translucent bar itself, so a strip pinned
			    under the nav would cover an extra band of whatever is scrolling
			    beneath it. */}
			<div className='sticky top-[var(--sticky-top)] z-20 -mx-6 bg-[var(--paper)]/92 px-6 backdrop-blur-md lg:-mx-8 lg:px-8'>
				<div className='flex items-center gap-6 border-b border-t border-[var(--rule)] py-3'>
					{label ? (
						<p id='budget-tabs-label' className='bb-label shrink-0'>
							{label}
						</p>
					) : null}
					<div
						role='tablist'
						aria-label={label ? undefined : 'How to cut the budget'}
						aria-labelledby={label ? 'budget-tabs-label' : undefined}
						className='ml-auto flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
					>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type='button'
								role='tab'
								id={`tab-${tab.id}`}
								aria-selected={active === tab.id}
								aria-controls={`panel-${tab.id}`}
								onClick={() => select(tab.id)}
								className='flex shrink-0 cursor-pointer items-center gap-2 px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition duration-200 aria-selected:bg-[var(--accent)] aria-selected:text-white hover:text-[var(--ink)] aria-selected:hover:text-white'
							>
								{tab.label}
								{tab.badge != null ? (
									<span className='num text-[10.5px] font-semibold text-current opacity-60'>
										{tab.badge}
									</span>
								) : null}
							</button>
						))}
					</div>
				</div>
			</div>

			{tabs.map((tab) => (
				<div
					key={tab.id}
					role='tabpanel'
					id={`panel-${tab.id}`}
					aria-labelledby={`tab-${tab.id}`}
					hidden={active !== tab.id}
					className='pt-8'
				>
					{tab.panel}
				</div>
			))}
		</div>
	)
}
