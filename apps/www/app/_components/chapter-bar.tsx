'use client'

import { BankIcon, MapPinAreaIcon, MosqueIcon, ScrollIcon, SquaresFourIcon, UsersThreeIcon, type Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { ChapterCard } from './chapter-grid'
import { DragScroll } from './drag-scroll'

/** Each chapter's glyph, the ones the site's Discover menu uses. */
const GLYPH: Record<string, Icon> = {
	history: ScrollIcon,
	governance: BankIcon,
	'local-government': MapPinAreaIcon,
	people: UsersThreeIcon,
	'culture-places': MosqueIcon,
}

/**
 * The chapters as travel's category bar (user decision: the travel look): a glyph over each name, the current one
 * underlined in the accent, the index first. Centred where they fit, dragging and swiping sideways where they do not.
 */
export function ChapterBar({ cards, current }: { cards: (ChapterCard & { slug: string })[]; current: string }) {
	const items = [{ href: '/discover', title: 'All chapters', slug: '' }, ...cards]
	// On a phone the row runs past the screen: start it scrolled to the chapter being read, not to the first.
	const row = useRef<HTMLOListElement>(null)
	useEffect(() => {
		const here = row.current?.querySelector<HTMLElement>('[aria-current="page"]')
		const box = row.current?.getBoundingClientRect()
		if (!row.current || !here || !box) return
		const at = here.getBoundingClientRect()
		row.current.scrollLeft += at.left - box.left - (box.width - at.width) / 2
	}, [current])
	return (
		<nav aria-label='Chapters' className='border-b border-[var(--rule)] bg-[var(--paper)]'>
			<div className='bb-container'>
				<ol ref={row} data-drag-scroll className='-mb-px flex gap-9 overflow-x-auto pt-5 [scrollbar-width:none] lg:gap-14 [&::-webkit-scrollbar]:hidden [&>:first-child]:ms-auto [&>:last-child]:me-auto'>
					{items.map((card) => {
						const here = card.slug === current
						const Glyph = card.slug ? (GLYPH[card.slug] ?? ScrollIcon) : SquaresFourIcon
						return (
							<li key={card.href} className='shrink-0'>
								<Link
									href={card.href}
									draggable={false}
									aria-current={here ? 'page' : undefined}
									className={`flex flex-col items-center gap-2 border-b-2 pb-3 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] transition ${
										here ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-3)] hover:border-[var(--rule)] hover:text-[var(--ink)]'
									}`}
								>
									<Glyph size={22} weight='duotone' className={here ? 'text-[var(--accent)]' : ''} aria-hidden='true' />
									{card.title}
								</Link>
							</li>
						)
					})}
				</ol>
			</div>
			<DragScroll />
		</nav>
	)
}
