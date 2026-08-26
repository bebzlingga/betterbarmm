'use client'

import { useEffect, useRef, useState } from 'react'

export type TocItem = {
	/** The `id` of the section this entry points at. */
	id: string
	label: string
}

/**
 * A standing index for a long page, held in the margin beside the reading
 * column. The entry for whatever is currently under the reader is marked, so
 * the list doubles as a position indicator rather than only a set of jumps.
 *
 * Sections carry a `scroll-mt` matching the offset this pins at. The site
 * header is sticky, so without it a jump lands with the heading tucked under
 * the bar — and matching the two keeps the index level with the section it
 * just jumped to instead of the pair drifting apart on every click.
 */
export function TableOfContents({
	items,
	label = 'On this page',
}: {
	items: TocItem[]
	label?: string
}) {
	const [active, setActive] = useState(items[0]?.id ?? '')
	// Which sections are currently crossing the band, kept across callbacks so
	// the topmost one can be picked rather than whichever fired last.
	const crossing = useRef(new Set<string>())

	useEffect(() => {
		if (typeof IntersectionObserver === 'undefined') return

		const sections = items
			.map((item) => document.getElementById(item.id))
			.filter((el): el is HTMLElement => el !== null)
		if (sections.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) crossing.current.add(entry.target.id)
					else crossing.current.delete(entry.target.id)
				}

				// In document order, so a tall section that spans the whole band
				// still yields to the one above it while that one is on screen.
				const current = items.find((item) => crossing.current.has(item.id))
				// No match means the reader is above the first section or below the
				// last; either way the previous mark is the truer one to keep.
				if (current) setActive(current.id)
			},
			// A band across the upper third of the viewport — roughly where the
			// eye sits while reading, and narrow enough that only one section is
			// ever in it.
			{ rootMargin: '-20% 0px -70% 0px' },
		)

		for (const section of sections) observer.observe(section)
		return () => observer.disconnect()
	}, [items])

	return (
		<nav aria-label={label} className='sticky top-32'>
			<p className='label label-strong'>{label}</p>

			{/* The rule is the list's spine: the marker for the active entry sits on
			    it rather than beside it, so nothing shifts as the mark moves. */}
			<ul className='mt-4 border-l border-[var(--rule)]'>
				{items.map((item) => (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							data-active={active === item.id}
							className='-ml-px block border-l-2 border-transparent py-2 pl-4 bb-body text-[var(--ink-3)] transition hover:text-[var(--ink)] data-[active=true]:border-[var(--accent)] data-[active=true]:font-semibold data-[active=true]:text-[var(--ink)]'
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	)
}
