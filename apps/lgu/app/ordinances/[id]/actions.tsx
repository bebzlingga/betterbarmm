'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRightIcon, DownloadSimpleIcon, FilePdfIcon, SparkleIcon, XIcon } from '@phosphor-icons/react'
import { JO } from '@betterbarmm/ai/dock'

/**
 * What a council staffer does with an ordinance: read the PDF, or have Jo explain it.
 *
 * The PDF is the site's own copy (datasets/ordinances/scripts/publish_pdfs.py): several LGUs forbid their files being
 * framed elsewhere, and some have taken them down.
 */
export function OrdinanceActions({
	id,
	title,
	question,
	source,
	elsewhere = null,
	stacked = false,
}: {
	id: string
	title: string
	question: string
	source: string
	/** Where to read it when the site has no copy of its own: opened in a new tab instead of the dialog. */
	elsewhere?: string | null
	/** One button under another, full width: for the side panel rather than the masthead. */
	stacked?: boolean
}) {
	const [open, setOpen] = useState(false)
	const dialog = useRef<HTMLDialogElement>(null)
	const pdf = `/ordinances/${id}.pdf`

	// Rendered only while open, so this only ever has to open it; closing unmounts it.
	useEffect(() => {
		if (open && dialog.current && !dialog.current.open) dialog.current.showModal()
	}, [open])

	return (
		<>
			<div className={stacked ? 'grid gap-2.5 [&>button]:w-full [&>button]:justify-center' : 'flex flex-wrap gap-3'}>
				{elsewhere ? (
					<a href={elsewhere} target='_blank' rel='noreferrer' className='bb-btn bb-btn-solid'>
						<FilePdfIcon size={15} aria-hidden='true' />
						Read the ordinance
					</a>
				) : (
					<button type='button' onClick={() => setOpen(true)} className='bb-btn bb-btn-solid'>
						<FilePdfIcon size={15} aria-hidden='true' />
						Read the ordinance
					</button>
				)}
				{/* Only while Jo is on the estate: with the dock switched off, the button would open nothing. */}
				{JO ? (
					<button type='button' onClick={() => window.dispatchEvent(new CustomEvent('betterbarmm:ask', { detail: question }))} className='bb-btn bb-btn-ghost'>
						<SparkleIcon size={15} aria-hidden='true' />
						Ask Jo to explain it
					</button>
				) : null}
			</div>

			{/* On <body>: inside the masthead the dialog would take the band's crimson tokens. */}
			{open
				? createPortal(
			<dialog
						ref={dialog}
						onClose={() => setOpen(false)}
						onClick={(event) => event.target === event.currentTarget && setOpen(false)}
						aria-label={title}
						className='m-auto h-[calc(100dvh-2rem)] max-h-none w-[calc(100vw-2rem)] max-w-[72rem] border border-[var(--rule)] bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/60 sm:h-[calc(100dvh-4rem)]'
					>
						<div className='flex h-full flex-col'>
							<div className='flex items-center gap-3 border-b border-[var(--rule)] px-4 py-3 sm:px-5'>
								<FilePdfIcon size={18} aria-hidden='true' className='shrink-0 text-[var(--accent)]' />
								<p className='min-w-0 flex-1 truncate text-[0.875rem] font-bold'>{title}</p>
								<a href={pdf} download className='hidden items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] hover:text-[var(--accent)] sm:inline-flex'>
									<DownloadSimpleIcon size={15} aria-hidden='true' />
									Download
								</a>
								<a href={pdf} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>
									New tab
									<ArrowUpRightIcon size={13} aria-hidden='true' />
								</a>
								<button type='button' onClick={() => setOpen(false)} aria-label='Close' className='grid size-9 place-items-center text-[var(--ink-2)] hover:bg-[var(--paper-2)] hover:text-[var(--accent)]'>
									<XIcon size={18} />
								</button>
							</div>
							{/* Loaded on opening, not with the page: some run to over 10 MB. */}
							<iframe src={pdf} title={title} className='min-h-0 w-full flex-1 bg-[var(--paper-2)]' />
							<p className='border-t border-[var(--rule)] px-4 py-2.5 text-[0.75rem] text-[var(--ink-3)] sm:px-5'>
								BetterBARMM&rsquo;s copy, kept in case the LGU takes it down; large scans are reduced to save data.{' '}
								<a href={source} target='_blank' rel='noreferrer' className='rule-link'>
									The LGU&rsquo;s own file
								</a>
							</p>
						</div>
					</dialog>,
					document.body,
				)
				: null}
		</>
	)
}
