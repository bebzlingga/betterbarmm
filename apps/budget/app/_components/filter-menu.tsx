'use client'

import { CaretDownIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

/* ============================================================
   One filter control, for every browser that needs one

   Lifted out of the projects browser when the programs browser
   needed the same thing. It was a row of chips there, which can
   hold one sector at a time — a chip writes its own name into
   the search box, so "health and education together" was not a
   question the page could be asked. Several boxes can be ticked
   at once, and the text field goes back to being only a text
   field.
   ============================================================ */

/**
 * A filter as a menu of checkboxes.
 *
 * Closes on Escape or a pointer landing outside it — a menu that only closes
 * by clicking its own trigger reads as broken. The button carries the count of
 * what is ticked, so the filter still says what it is doing while shut.
 */
export function FilterMenu({
	label,
	options,
	selected,
	onToggle,
	onClear,
}: {
	label: string
	options: { value: string; count: number; label?: string }[]
	selected: Set<string>
	onToggle: (value: string) => void
	onClear: () => void
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return
		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				aria-expanded={open}
				aria-haspopup='true'
				onClick={() => setOpen((current) => !current)}
				aria-pressed={selected.size > 0}
				className='filter-trigger'
			>
				{label}
				{selected.size > 0 ? <span className='chip-count'>{selected.size}</span> : null}
				<CaretDownIcon size={12} weight='bold' aria-hidden='true' />
			</button>

			{open ? (
				<div /* `z-20`, under the sticky nav's `z-30`. At `z-40` the panel
					   drew over the header when the page was scrolled — the nav is the
					   one thing that should stay on top of page furniture. Above the
					   content around it, below the chrome. */
					className='absolute right-0 top-full z-20 mt-2 max-h-[22rem] w-[17rem] overflow-y-auto border border-[var(--ink)] bg-[var(--paper)] p-1 text-left shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'>
					<span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]' />

					{selected.size > 0 ? (
						<button
							type='button'
							onClick={onClear}
							className='mb-1 w-full px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
						>
							Clear {selected.size}
						</button>
					) : null}

					{options.map((option) => (
						<label
							key={option.value}
							className='flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[13.5px] text-[var(--ink-2)] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
						>
							<input
								type='checkbox'
								checked={selected.has(option.value)}
								onChange={() => onToggle(option.value)}
								className='size-3.5 shrink-0 accent-[var(--accent)]'
							/>
							{/* The value is what is filtered on and the label is what is read.
							    They differ where the dataset's own word is not the one a reader
							    uses: programs are tagged "Lump-sum / Special Purpose Fund" and
							    the workspace shows "Special Purpose Fund". */}
							<span className='min-w-0 flex-1'>{option.label ?? option.value}</span>
							<span className='money font-mono text-[10px] text-[var(--ink-mute)]'>
								{option.count}
							</span>
						</label>
					))}
				</div>
			) : null}
		</div>
	)
}
