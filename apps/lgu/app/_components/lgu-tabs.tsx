'use client'

import { useEffect, useState } from 'react'

export type LguTab = {
	id: string
	label: string
	/** Printed small beside the label — a count, usually. */
	badge?: string | number
	panel: React.ReactNode
}

/**
 * The tab strip on a unit page.
 *
 * Every panel stays in the DOM and is hidden with the `hidden` attribute rather
 * than unmounted. That costs a little markup and buys three things: the whole
 * record is in the page for anything reading it without scripts, in-page find
 * works across tabs, and switching is instant because nothing re-renders from
 * scratch. On a barangay list of 100-odd rows that last one is noticeable.
 *
 * The active tab is mirrored into the URL hash, so a link to a particular tab
 * survives being shared — and a reader arriving on `#services` lands on it.
 */
export function LguTabs({
	tabs,
	sticky = true,
}: {
	tabs: LguTab[]
	/** Off for a set of tabs inside a page that already has a sticky bar. */
	sticky?: boolean
}) {
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

	// The strip scrolls sideways on a phone; a tab opened from a link or a tap
	// near the edge is brought into view rather than left behind the fade.
	useEffect(() => {
		// Scrolls the strip only — `scrollIntoView` would move the page too.
		const tab = document.getElementById(`tab-${active}`)
		tab?.parentElement?.scrollTo({ left: Math.max(0, tab.offsetLeft - 24), behavior: 'smooth' })
	}, [active])

	const select = (id: string) => {
		setActive(id)
		// `replaceState` rather than assigning to `location.hash`, which would
		// also scroll the panel under the sticky header.
		window.history.replaceState(null, '', `#${id}`)
	}

	return (
		<div>
			{/* Two layers. The outer one sticks and carries the ground, at
			    `--sticky-top` so it follows the site header up when that ducks out of
			    the way (pinned at the header's height it left a band of page showing
			    above it). The inner one scrolls and fades, so the fade thins the
			    tabs, not the ground under them. */}
			<div
				className={`border-b border-[var(--ink)] bg-[var(--paper)] ${
					sticky ? 'sticky top-[var(--sticky-top)] z-20 transition-[top] duration-300' : ''
				}`}
			>
			<div
				role='tablist'
				aria-label='Sections'
				className='flex gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,#000_82%,transparent)] [scrollbar-width:none] md:[mask-image:none] [&::-webkit-scrollbar]:hidden'
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
						className='lgu-tab'
					>
						{tab.label}
						{tab.badge != null ? <span className='lgu-tab-badge'>{tab.badge}</span> : null}
					</button>
				))}
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
