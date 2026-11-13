'use client'

import { ArrowUpRightIcon, MapTrifoldIcon, XIcon } from '@phosphor-icons/react'
import { MapList, MapListGroup, MapListHead, MapListRow, Skeleton } from '@betterbarmm/editorial'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Focus } from './project-map-canvas'
import type { MapPlace } from './project-places'

/* ============================================================
   The projects map, as a full-screen dialog

   The incident map's door and room, here: the page shows a button,
   and the map opens over it. A native <dialog> under showModal, so
   focus is trapped, Escape closes it and the page behind is inert.
   `#map` opens it too, on arrival and whenever the hash changes, so
   the map can be linked.

   Down the left, what the map shows and every place on it, the
   costliest first; a row flies the map there. The chosen place's
   projects float over the map's corner, with a way into the list
   below filtered to that place. The canvas is mounted only while the
   dialog is open: MapLibre wants a sized container and a window, and
   most readers never open it.
   ============================================================ */

const Canvas = dynamic(() => import('./project-map-canvas'), {
	ssr: false,
	loading: () => <Skeleton className='h-full w-full rounded-none' />,
})

type Count = { all: number; placed: number; atBarangay: number; sulu: number; unread: number }

const where = (p: MapPlace) => (p.at === 'barangay' ? `${p.place}, ${p.town}` : `${p.town} · town centre`)

/** The chosen place and what the Act builds there. */
function Details({ place, fy, onClose }: { place: MapPlace; fy?: string; onClose: () => void }) {
	const q = place.at === 'barangay' ? place.place : place.town
	const href = `/projects?${new URLSearchParams({ ...(fy ? { fy } : {}), q }).toString()}#browse`
	return (
		<article className='bg-[var(--paper)] p-4'>
			<div className='flex items-start justify-between gap-3'>
				<p className='bb-label'>{place.at === 'barangay' ? `Barangay · ${place.town}` : 'Town centre'}</p>
				<button
					type='button'
					onClick={onClose}
					aria-label='Close details'
					className='-mr-1.5 -mt-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'
				>
					<XIcon size={14} weight='bold' aria-hidden='true' />
				</button>
			</div>
			<h3 className='mt-2 text-[0.9375rem] font-extrabold leading-snug tracking-[-0.01em]'>{place.place}</h3>
			<p className='money mt-1 text-[0.78125rem] text-[var(--ink-2)]'>
				{place.totalLabel} · {place.projects.length} {place.projects.length === 1 ? 'project' : 'projects'}
			</p>
			<ul className='mt-3 border-t border-[var(--rule)]'>
				{place.projects.map((p) => (
					<li key={p.id} className='grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-[var(--rule-soft)] py-2.5 last:border-b-0'>
						<span className='text-[0.78125rem] leading-snug text-[var(--ink)]'>{p.name}</span>
						<span title={p.exact} className='money whitespace-nowrap text-[0.75rem] font-semibold text-[var(--ink)]'>
							{p.amount}
						</span>
					</li>
				))}
			</ul>
			<a href={href} className='rule-link mt-3 inline-flex items-center gap-1 text-[0.78125rem] font-semibold text-[var(--ink)]'>
				List {place.projects.length === 1 ? 'it' : 'them'} with the rest
				<ArrowUpRightIcon size={12} aria-hidden='true' />
			</a>
		</article>
	)
}

export function MapDialog({
	title,
	fy,
	places,
	count,
	legend,
}: {
	title: string
	fy?: string
	places: MapPlace[]
	count: Count
	legend: { r: number; label: string }[]
}) {
	const ref = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(false)
	const [selected, setSelected] = useState<string | null>(null)
	const [focus, setFocus] = useState<Focus>(null)
	const chosen = places.find((p) => p.key === selected) ?? null

	const show = () => {
		if (ref.current?.open) return
		ref.current?.showModal()
		setOpen(true)
		// The dialog scrolls; the page under it should not.
		document.documentElement.style.overflow = 'hidden'
	}

	useEffect(() => {
		const onHash = () => {
			if (window.location.hash === '#map') show()
		}
		// A frame on arrival: the dialog has to be in the document before showModal.
		const frame = requestAnimationFrame(onHash)
		window.addEventListener('hashchange', onHash)
		return () => {
			cancelAnimationFrame(frame)
			window.removeEventListener('hashchange', onHash)
		}
	}, [])

	const onSelect = useCallback((key: string) => setSelected(key), [])
	const goTo = (p: MapPlace) => {
		setSelected(p.key)
		// A new nonce each time, so asking for the same place twice flies there again.
		setFocus((last) => ({ key: p.key, lon: p.lon, lat: p.lat, nonce: (last?.nonce ?? 0) + 1 }))
	}

	return (
		<>
			<button type='button' onClick={show} className='bb-btn bb-btn-solid !px-5 !py-3 !text-[0.65625rem]'>
				<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
				Open Map
			</button>

			<dialog
				ref={ref}
				onClose={() => {
					setOpen(false)
					document.documentElement.style.overflow = ''
					// Clear the hash on close, so a link to `#map` opens it again.
					if (window.location.hash === '#map') history.replaceState(null, '', window.location.pathname + window.location.search)
				}}
				aria-labelledby='project-map-title'
				className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
			>
				<div className='sticky top-0 z-20 shrink-0 border-b border-[var(--rule)] bg-[var(--paper)]'>
					<div className='flex h-14 items-center justify-between gap-4 px-4 lg:px-6'>
						<div className='flex min-w-0 items-baseline gap-3'>
							<p className='bb-label hidden sm:block'>On the map</p>
							<h2 id='project-map-title' className='truncate text-[0.9375rem] font-extrabold tracking-[-0.02em]'>
								{title}
							</h2>
						</div>
						<button
							type='button'
							onClick={() => ref.current?.close()}
							aria-label='Close map'
							className='inline-flex size-9 shrink-0 cursor-pointer items-center justify-center border border-current transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
						>
							<XIcon size={16} weight='bold' aria-hidden='true' />
						</button>
					</div>
				</div>

				<div className='grid min-h-0 flex-1 lg:grid-cols-[24rem_minmax(0,1fr)]'>
					<MapList className='order-2 border-t border-[var(--rule)] lg:order-1 lg:border-r lg:border-t-0' head={<MapListHead count={places.length} noun='places' />}>
						<div className='border-b border-[var(--rule-soft)] px-5 py-4'>
							<p className='text-[0.75rem] leading-[1.7] text-[var(--ink-2)]'>
								<strong className='text-[var(--ink)]'>{count.placed}</strong> of the {count.all} projects are on the map: {count.atBarangay} on the
								barangay the Act names, {count.placed - count.atBarangay} on their town’s centre, paler, where only the town is named.
								{count.sulu ? ` ${count.sulu} in Sulu, which has left the region, are not drawn.` : ''}
								{count.unread ? ` ${count.unread} name no place the map can read.` : ''}
							</p>
							<div className='mt-3 flex items-end gap-4' aria-hidden='true'>
								{legend.map((step) => (
									<span key={step.label} className='flex flex-col items-center gap-1.5'>
										<svg width={36} height={36} viewBox='0 0 36 36'>
											<circle cx={18} cy={18} r={3 + step.r * 13} fill='var(--accent)' fillOpacity={0.68} />
										</svg>
										<span className='font-mono text-[0.625rem] text-[var(--ink-3)]'>{step.label}</span>
									</span>
								))}
							</div>
						</div>
						<MapListGroup title='The most money first'>
							{places.map((p) => (
								<MapListRow
									key={p.key}
									current={p.key === selected}
									onClick={() => goTo(p)}
									marker={<span className='size-2.5 rounded-full bg-[var(--accent)]' style={{ opacity: p.at === 'barangay' ? 0.9 : 0.4 }} aria-hidden='true' />}
									title={where(p)}
									meta={`${p.projects.length} ${p.projects.length === 1 ? 'project' : 'projects'}`}
									figure={<span className='money'>{p.totalLabel}</span>}
								/>
							))}
						</MapListGroup>
					</MapList>

					<div className='relative order-1 h-[55dvh] min-h-0 lg:order-2 lg:h-auto'>
						{open ? <Canvas places={places} selected={selected} focus={focus} onSelect={onSelect} /> : null}
						{chosen ? (
							<div className='absolute bottom-4 right-4 z-10 max-h-[calc(100%-2rem)] w-[22rem] max-w-[calc(100%-2rem)] overflow-y-auto shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'>
								<Details place={chosen} fy={fy} onClose={() => setSelected(null)} />
							</div>
						) : null}
					</div>
				</div>
			</dialog>
		</>
	)
}
