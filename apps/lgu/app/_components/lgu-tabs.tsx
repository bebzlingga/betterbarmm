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
export function LguTabs({ tabs }: { tabs: LguTab[] }) {
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
		// also scroll the panel under the sticky header.
		window.history.replaceState(null, '', `#${id}`)
	}

	return (
		<div>
			<div
				role='tablist'
				aria-label='Sections'
				className='sticky top-[var(--site-header-h)] z-20 -mx-6 flex gap-1 overflow-x-auto border-b border-[var(--ink)] bg-[var(--paper)]/92 px-6 backdrop-blur-md [scrollbar-width:none] lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden'
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

			{tabs.map((tab) => (
				<div
					key={tab.id}
					role='tabpanel'
					id={`panel-${tab.id}`}
					aria-labelledby={`tab-${tab.id}`}
					hidden={active !== tab.id}
					className='pt-10'
				>
					{tab.panel}
				</div>
			))}
		</div>
	)
}
