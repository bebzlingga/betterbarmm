'use client'

import { TextAlignLeftIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

export type TocItem = { id: string; label: string; depth: 1 | 2 }

/**
 * "On this page" for a long document: every heading, the one being read
 * marked. A heading counts as being read once it has passed just under the
 * sticky header, so the mark moves as the reader does rather than when a
 * section's top happens to cross the middle of the screen.
 */
export function DocToc({ items }: { items: TocItem[] }) {
	const [active, setActive] = useState(items[0]?.id)

	useEffect(() => {
		let frame = 0
		const update = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(() => {
				let current = items[0]?.id
				for (const item of items) {
					const el = document.getElementById(item.id)
					if (el && el.getBoundingClientRect().top < 160) current = item.id
				}
				setActive(current)
			})
		}
		update()
		window.addEventListener('scroll', update, { passive: true })
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('scroll', update)
		}
	}, [items])

	return (
		<nav aria-label='On this page'>
			<p className='flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)]'>
				<TextAlignLeftIcon size={16} className='text-[var(--ink-3)]' aria-hidden='true' />
				On this page
			</p>
			<ol className='mt-4 border-l border-[var(--rule)]'>
				{items.map((item) => {
					const on = item.id === active
					return (
						<li key={item.id}>
							<a
								href={`#${item.id}`}
								aria-current={on ? 'location' : undefined}
								className={`-ml-px block border-l-2 py-1.5 text-[13.5px] leading-5 transition ${
									item.depth === 1 ? 'pl-4' : 'pl-7'
								} ${
									on
										? 'border-[var(--accent)] text-[var(--ink)]'
										: 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
								}`}
							>
								{item.label}
							</a>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
