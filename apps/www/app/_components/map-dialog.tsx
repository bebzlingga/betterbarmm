'use client'

import { XIcon } from '@phosphor-icons/react'
import { RowsSkeleton, Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { useEffect, useRef, useState } from 'react'
import type { MapRegion as MapData } from '../_lib/map-data'
import { MapApp } from './map-app'

/** One request per page load, however many triggers open the dialog. */
let pending: Promise<MapData> | null = null
const loadMap = () => (pending ??= fetch('/api/map').then((res) => res.json() as Promise<MapData>))

/**
 * The interactive map, as a full-screen dialog opened from the header.
 *
 * A native `<dialog>` opened with `showModal`, so focus is trapped, Escape
 * closes it and the page behind is inert without any of that written here. The
 * data is fetched the first time it opens — the header is on every page, and
 * most readers never open the map.
 */
export function MapDialog({
	className,
	children,
}: {
	className?: string
	children: React.ReactNode
}) {
	const ref = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(false)
	const [data, setData] = useState<MapData | null>(null)
	const [failed, setFailed] = useState(false)

	useEffect(() => {
		if (!open) return
		loadMap()
			.then(setData)
			.catch(() => {
				pending = null
				setFailed(true)
			})
		// The dialog scrolls; the page under it should not.
		const root = document.documentElement
		const previous = root.style.overflow
		root.style.overflow = 'hidden'
		return () => {
			root.style.overflow = previous
		}
	}, [open])

	const show = () => {
		setFailed(false)
		setOpen(true)
		ref.current?.showModal()
	}

	return (
		<>
			<button type='button' onClick={show} className={className}>
				{children}
			</button>

			<dialog
				ref={ref}
				onClose={() => setOpen(false)}
				aria-labelledby='map-dialog-title'
				className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
			>
				<div className='sticky top-0 z-10 shrink-0 border-b border-[var(--rule)] bg-[var(--paper)]'>
					<div className='flex h-14 px-4 lg:px-6 items-center justify-between gap-4'>
						<div className='flex items-baseline gap-3'>
							<p className='bb-label'>Interactive map</p>
							<h2 id='map-dialog-title' className='text-[0.9375rem] font-extrabold tracking-[-0.02em]'>
								The Bangsamoro, town by town
							</h2>
						</div>
						<button
							type='button'
							onClick={() => ref.current?.close()}
							aria-label='Close map'
							className='inline-flex size-9 cursor-pointer items-center justify-center border border-current transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
						>
							<XIcon size={16} weight='bold' aria-hidden='true' />
						</button>
					</div>
				</div>

				<div className='min-h-0 flex-1'>
					{data ? (
						<MapApp data={data} />
					) : failed ? (
						<p className='py-24 text-center text-[0.875rem] text-[var(--ink-3)]'>The map could not be loaded. Close this and try again.</p>
					) : (
						/* The map app's own shape while its data comes (user decision: skeletons): the map, and the panel
						   beside it. */
						<div role='status' className='grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_26rem]'>
							<span className='sr-only'>Loading the map…</span>
							<Skeleton className='min-h-[50svh] rounded-none' />
							{/* The region panel's measures: its padding, kicker, two-line heading, three lines of lead, the field. */}
							<div className='border-t border-[var(--rule)] p-6 lg:border-l lg:border-t-0 lg:p-7'>
								<SkeletonLine className='text-[0.625rem]' width='8rem' />
								<div className='mt-4 text-[1.8rem] leading-[1.05]'>
									<SkeletonLine width='85%' />
									<SkeletonLine width='55%' />
								</div>
								<div className='mt-3 text-[0.875rem] leading-[1.7]'>
									<SkeletonLine />
									<SkeletonLine width='92%' />
									<SkeletonLine width='60%' />
								</div>
								<Skeleton className='mt-6 h-[2.6rem] w-full' />
								<RowsSkeleton rows={6} figure={false} className='mt-6' />
							</div>
						</div>
					)}
				</div>
			</dialog>
		</>
	)
}
