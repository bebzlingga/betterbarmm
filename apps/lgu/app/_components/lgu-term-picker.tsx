'use client'

import { useState } from 'react'
import { formatDate, officialsTerms } from '@betterbarmm/lgu-data'

/**
 * Choose a term of office.
 *
 * Terms we cannot show are still listed, disabled, with the reason attached.
 * That is the honest shape: COMELEC's 2019 results site is gone and its 2022
 * site no longer serves canvass data to anything but its own front end, and a
 * picker offering only 2025 would quietly suggest 2025 is the whole history.
 *
 * The picker renders even with one selectable term, because the term is the
 * thing that makes a name meaningful — "the mayor" is always the mayor *of a
 * term*, and a page that omits it is the page that goes stale without saying so.
 */
export function LguTermPicker({
	panels,
	empty,
}: {
	/**
	 * One rendered panel per term the caller can show, keyed by term id.
	 *
	 * Panels rather than a render prop: this is a client component and the
	 * pages that use it are server components, and a function cannot cross that
	 * boundary — React elements can. Only terms with a panel are selectable.
	 */
	panels: { id: string; node: React.ReactNode }[]
	/** Shown when the selected term has no panel — a term with no canvass. */
	empty?: React.ReactNode
}) {
	const available = new Set(panels.map((panel) => panel.id))
	const [activeId, setActiveId] = useState(panels[0]?.id ?? officialsTerms[0]?.id)
	const active = officialsTerms.find((term) => term.id === activeId)

	if (!active) return null

	return (
		<div>
			<div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
				<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
					Term
				</span>

				<div className='flex flex-wrap gap-1.5'>
					{officialsTerms.map((term) => {
						const disabled = !available.has(term.id)
						return (
							<button
								key={term.id}
								type='button'
								disabled={disabled}
								onClick={() => setActiveId(term.id)}
								aria-pressed={term.id === activeId}
								title={disabled ? term.note : undefined}
								className='lgu-term'
							>
								{term.label}
								{disabled ? (
									<span className='lgu-term-flag' aria-hidden='true'>
										no record
									</span>
								) : null}
							</button>
						)
					})}
				</div>
			</div>

			{/* The selected term's own detail, so the figures below are dated. */}
			<div className='mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-y border-[var(--ink)] py-3'>
				<p className='text-[12.5px] text-[var(--ink-2)]'>
					{active.election} · elected {formatDate(active.electionDay)} · in office{' '}
					{formatDate(active.start)} to {formatDate(active.end)}
				</p>
				<a
					href={active.source.href}
					target='_blank'
					rel='noreferrer'
					className='ml-auto font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
				>
					{active.source.label} &#8599;
				</a>
			</div>

			<div className='mt-8'>{panels.find((panel) => panel.id === activeId)?.node ?? empty}</div>
		</div>
	)
}
