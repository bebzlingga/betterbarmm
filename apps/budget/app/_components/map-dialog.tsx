'use client'

import { ArrowUpRightIcon, HardHatIcon, MapPinIcon, MapTrifoldIcon, XIcon } from '@phosphor-icons/react'
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
		<article className='rounded-[1.25rem] bg-[var(--paper)] p-5 shadow-[0_28px_60px_-26px_rgba(0,0,0,0.45),0_0_0_1px_color-mix(in_srgb,var(--ink)_6%,transparent)]'>
			<div className='flex items-start justify-between gap-3'>
				<p className='inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>
					<MapPinIcon size={13} weight='fill' aria-hidden='true' />
					{place.at === 'barangay' ? `Barangay · ${place.town}` : 'Town centre'}
				</p>
				<button
					type='button'
					onClick={onClose}
					aria-label='Close details'
					className='-mr-1 -mt-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--ink-3)] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
				>
					<XIcon size={14} weight='bold' aria-hidden='true' />
				</button>
			</div>
			<h3 className='mt-2 font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold leading-snug tracking-[-0.02em]'>{place.place}</h3>
			<p className='money mt-1 text-[0.8125rem] text-[var(--ink-2)]'>
				{place.totalLabel} · {place.projects.length} {place.projects.length === 1 ? 'project' : 'projects'}
			</p>
			<ul className='mt-4 grid gap-1.5'>
				{place.projects.map((p) => (
					<li key={p.id} className='grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 rounded-xl bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] px-3.5 py-3'>
						<span className='text-[0.8125rem] leading-snug text-[var(--ink)]'>{p.name}</span>
						<span title={p.exact} className='money whitespace-nowrap text-[0.8125rem] font-bold text-[var(--ink)]'>
							{p.amount}
						</span>
					</li>
				))}
			</ul>
			<a href={href} className='mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-[0.8125rem] font-semibold text-white transition hover:brightness-110'>
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
			<button type='button' onClick={show} className='dv-btn dv-btn-accent shrink-0'>
				<MapTrifoldIcon size={18} weight='duotone' aria-hidden='true' />
				Open the map
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
				className='prj-map m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
			>
				<div className='sticky top-0 z-20 shrink-0 bg-[var(--paper)] shadow-[0_10px_30px_-24px_rgba(0,0,0,0.35)]'>
					<div className='flex min-h-20 items-center justify-between gap-4 px-4 py-3 lg:px-6'>
						<div className='flex min-w-0 items-center gap-4'>
							<span className='grid size-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
								<HardHatIcon size={24} weight='duotone' aria-hidden='true' />
							</span>
							<div className='min-w-0'>
								<p className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>On the map</p>
								<h2 id='project-map-title' className='mt-0.5 truncate font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.02em]'>
									{title}
								</h2>
							</div>
						</div>
						<div className='flex shrink-0 items-center gap-2'>
							<span className='hidden rounded-full bg-[var(--paper-2)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] md:inline-flex'>
								{places.length} places
							</span>
							<span className='hidden rounded-full bg-[var(--paper-2)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] md:inline-flex'>
								{count.placed} of {count.all} projects
							</span>
							<button
								type='button'
								onClick={() => ref.current?.close()}
								aria-label='Close map'
								className='ml-1 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--paper-2)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
							>
								<XIcon size={18} weight='bold' aria-hidden='true' />
							</button>
						</div>
					</div>
				</div>

				<div className='grid min-h-0 flex-1 lg:grid-cols-[24rem_minmax(0,1fr)]'>
					<MapList className='order-2 bg-[#f6f1ea] lg:order-1 [:root[data-theme=dark]_&]:bg-[var(--paper-2)]' head={<MapListHead count={places.length} noun='places' />}>
						<div className='mx-4 mb-3 mt-1 rounded-[1.1rem] bg-[var(--paper)] px-5 py-4 shadow-[0_12px_30px_-24px_rgba(0,0,0,0.4)]'>
							<p className='text-[0.8125rem] leading-[1.7] text-[var(--ink-2)]'>
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
										<span className='rounded-full bg-[var(--paper-2)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--ink-3)]'>{step.label}</span>
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
