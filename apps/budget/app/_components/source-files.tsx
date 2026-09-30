'use client'

import { CaretDownIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

/* ============================================================
   The files behind the workspace, one card per fiscal year

   A card per file put FY 2026 in three tiles and every other
   year in one, which said the 2026 data matters three times as
   much as the 2020 Act rather than that 2026 is the year that
   has been extracted. A card per year says the true thing: here
   are seven budgets, and here is what we hold of each.

   The download is a menu only where there is a choice to make.
   Six of the seven years are a single PDF, and a menu holding
   one item is a click asking to be told what it is for.
   ============================================================ */

export type SourceFile = { file: string; year: string; kind: string; role: string }

const href = (file: string) => `/sources/download?file=${encodeURIComponent(file)}`

/** The file's own extension, which is what a reader is choosing between. */
const format = (file: string) => (file.split('.').pop() ?? '').toUpperCase()

function DownloadMenu({ files }: { files: SourceFile[] }) {
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
				className='group/btn flex w-full items-center justify-between gap-3 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-2)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]'
			>
				<span className='flex items-center gap-2'>
					<DownloadSimpleIcon className='size-4 shrink-0' aria-hidden='true' />
					{files.length} files
				</span>
				<CaretDownIcon size={12} weight='bold' aria-hidden='true' />
			</button>

			{open ? (
				/* Opens upward on the last row and downward elsewhere would need
				   measuring; `top-full` with the card's own width is enough here
				   because the section has the page's whole foot beneath it. */
				<div className='absolute inset-x-0 top-full z-20 mt-1 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'>
					<span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]' />
					{files.map((one) => (
						<a
							key={one.file}
							href={href(one.file)}
							className='group/row block px-3 py-2.5 transition hover:bg-[var(--paper-2)]'
						>
							<p className='flex items-baseline justify-between gap-3'>
								<span className='text-[13px] font-semibold text-[var(--ink)]'>{one.kind}</span>
								<span className='money font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
									{format(one.file)}
								</span>
							</p>
							<p className='mt-1 break-all font-mono text-[10px] text-[var(--ink-3)]'>{one.file}</p>
						</a>
					))}
				</div>
			) : null}
		</div>
	)
}

export function SourceFiles({ files }: { files: SourceFile[] }) {
	// Newest first: the year that has been extracted is the one a reader wants,
	// and it is also the largest number.
	const years = [...new Set(files.map((one) => one.year))].sort((a, b) => Number(b) - Number(a))

	return (
		<div className='mt-12 grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3'>
			{years.map((year) => {
				const mine = files.filter((one) => one.year === year)
				// The Act itself carries the line worth printing on the card; the
				// extracted files describe their own internals, which is a level of
				// detail the menu can hold instead.
				const act = mine.find((one) => one.kind === 'The Act') ?? mine[0]!
				const kinds = [...new Set(mine.map((one) => one.kind))]

				return (
					<div key={year} className='flex h-full flex-col bg-[var(--paper-2)] p-6'>
						<div className='flex items-baseline justify-between gap-4'>
							<p className='money text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--ink)]'>
								FY {year}
							</p>
							<p className='bb-label'>{kinds.length > 1 ? `${mine.length} files` : format(act.file)}</p>
						</div>

						<p className='mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
							{kinds.join(' · ')}
						</p>

						<p className='mt-3.5 text-[12.5px] leading-6 text-[var(--ink-2)]'>{act.role}</p>

						{/* `mt-auto` rather than a fixed gap: the control sits on the card's
						    own floor however many lines the sentence above it ran to, so the
						    buttons line up across a row. */}
						<div className='mt-auto pt-5'>
							{mine.length > 1 ? (
								<DownloadMenu files={mine} />
							) : (
								<a
									href={href(act.file)}
									className='group/btn flex items-center gap-2 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-2)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]'
								>
									<DownloadSimpleIcon
										className='size-4 shrink-0 transition duration-500 group-hover/btn:translate-y-0.5'
										aria-hidden='true'
									/>
									Download {format(act.file)}
								</a>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}
