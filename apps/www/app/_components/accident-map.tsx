'use client'

import { ArrowUpRightIcon, BoatIcon, CarProfileIcon, CrosshairIcon, FireIcon, MapTrifoldIcon, WarningIcon, XIcon, type Icon } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACCIDENT_TYPES, accidentDate, accidentsMeta, typeOf, type Accident, type AccidentType } from '../_lib/accidents'
import type { AccidentFeatures, Focus } from './accident-map-canvas'

/* ============================================================
   Filters, figures, map, list — one state

   The filters scope everything at once: the figures, the heat and the
   dots, the list of reports. The list is the map's table view and is
   rendered on the server with every source linked.

   The map itself opens as a full-screen dialog — a native <dialog>
   under showModal, so focus is trapped, Escape closes it and the page
   behind is inert without any of that written here. Down its left side
   sit the same filters, the chosen incident's details and a short list
   of what is on the map; the canvas fills the rest. The
   canvas is mounted only while the dialog is open: MapLibre wants a
   sized container and a window, and most readers never open it.
   ============================================================ */

const Canvas = dynamic(() => import('./accident-map-canvas'), {
	ssr: false,
	loading: () => <div className='h-full w-full animate-pulse bg-[var(--paper-2)]' aria-hidden='true' />,
})

type Show = 'both' | 'heat' | 'points'

const figure = (n: number) => n.toLocaleString('en-PH')

/** One glyph per kind, kept here rather than in the lib so the server page never loads the icon set. */
const ICONS: Record<AccidentType, Icon> = { road: CarProfileIcon, water: BoatIcon, fire: FireIcon, shooting: CrosshairIcon, other: WarningIcon }

/** The kind's glyph in the kind's colour — the swatch, with a shape. */
function KindIcon({ type, size = 13 }: { type: AccidentType; size?: number }) {
	const t = typeOf(type)
	const Icon = ICONS[t.id]
	return <Icon size={size} weight='fill' className='acc-icon' style={{ color: `var(--acc-${t.id})` }} aria-hidden='true' />
}

/** One dropdown of the filter row: a native select, so it works before any script and on a phone's own picker. */
function Field({ label, value, onChange, all, options }: { label: string; value: string; onChange: (v: string) => void; all: string; options: { value: string; label: string; count: number }[] }) {
	return (
		<label className='acc-field'>
			<span className='bb-label !mb-0'>{label}</span>
			<select className='acc-select' value={value} onChange={(e) => onChange(e.target.value)}>
				<option value=''>{all}</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label} ({o.count})
					</option>
				))}
			</select>
		</label>
	)
}

/** Dead, injured, missing — only the figures the report gave. */
function Counts({ a, className = '' }: { a: Accident; className?: string }) {
	return (
		<dl className={`num flex gap-5 text-[12px] ${className}`}>
			{(['deaths', 'injured', 'missing'] as const).map((key) =>
				a[key] ? (
					<div key={key}>
						<dd className='text-[15px] font-extrabold text-[var(--ink)]'>{figure(a[key] as number)}</dd>
						<dt className='font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--ink-3)]'>{key}</dt>
					</div>
				) : null,
			)}
		</dl>
	)
}

function Sources({ a, sep = ' · ' }: { a: Accident; sep?: string }) {
	return (
		<>
			{a.sources.map((s, i) => (
				<span key={s.url}>
					{i ? sep : ''}
					<a
						href={s.url}
						target='_blank'
						rel='noreferrer'
						title={s.title || undefined}
						className='inline-flex items-center gap-0.5 underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'
					>
						{s.outlet}
						<ArrowUpRightIcon className='size-3' weight='bold' aria-hidden='true' />
					</a>
				</span>
			))}
		</>
	)
}

/** The chosen incident, in the dialog's left column. */
function Details({ a, onClose }: { a: Accident; onClose: () => void }) {
	const t = typeOf(a.type)
	return (
		<article className='border border-[var(--ink)] bg-[var(--paper)] p-4'>
			<div className='flex items-start justify-between gap-3'>
				<p className='flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					<KindIcon type={a.type} />
					{t.label}
					{a.kind && a.kind.toLowerCase() !== t.label.toLowerCase() ? <span className='text-[var(--ink-mute)]'>· {a.kind}</span> : null}
					<span className='text-[var(--ink-mute)]'>· {accidentDate(a.date)}</span>
				</p>
				<button
					type='button'
					onClick={onClose}
					aria-label='Close details'
					className='-mr-1.5 -mt-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'
				>
					<XIcon size={14} weight='bold' aria-hidden='true' />
				</button>
			</div>
			<h3 className='mt-2 text-[15px] font-extrabold leading-snug tracking-[-0.01em]'>{a.title}</h3>
			<p className='mt-1 text-[12.5px] text-[var(--ink-2)]'>
				{a.barangay ? `${a.barangay}, ` : ''}
				{a.municipality ? `${a.municipality}, ` : ''}
				{a.province}
			</p>
			{a.deaths || a.injured || a.missing ? <Counts a={a} className='mt-3 border-t border-[var(--rule)] pt-3' /> : null}
			<p className='mt-3 text-[13px] leading-[1.6] text-[var(--ink-2)]'>{a.summary}</p>
			<p className='mt-3 text-[11.5px] leading-[1.7] text-[var(--ink-3)]'>
				{a.sources.length === 1 ? 'Source: ' : 'Sources: '}
				<Sources a={a} sep=', ' />
			</p>
			{a.placed !== 'barangay' ? (
				<p className='mt-2 text-[10.5px] leading-[1.6] text-[var(--ink-mute)]'>
					Placed at the centre of {a.municipality ?? a.province}; the report names no {a.municipality ? 'closer spot' : 'town'}.
				</p>
			) : null}
		</article>
	)
}

export function AccidentMap({ incidents }: { incidents: Accident[] }) {
	const years = useMemo(() => [...new Set(incidents.map((a) => a.date.slice(0, 4)))].sort(), [incidents])
	const provinces = useMemo(() => [...new Set(incidents.map((a) => a.province))].sort(), [incidents])

	// One value each, '' for all. A new year or area in the data arrives in the
	// dropdown without anyone editing a list.
	const [year, setYear] = useState('')
	const [type, setType] = useState('')
	const [province, setProvince] = useState('')
	const [deadlyOnly, setDeadlyOnly] = useState(false)
	const [show, setShow] = useState<Show>('both')
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [focus, setFocus] = useState<Focus>(null)
	const [open, setOpen] = useState(false)
	const dialog = useRef<HTMLDialogElement>(null)
	// Counts the asks to fly, so asking for the same incident twice flies twice.
	const asks = useRef(0)

	// `except` leaves one dimension open, so a dropdown's counts say what choosing each option would leave.
	const matches = useCallback(
		(a: Accident, except?: 'year' | 'type' | 'province') =>
			(except === 'year' || !year || a.date.startsWith(year)) &&
			(except === 'type' || !type || a.type === type) &&
			(except === 'province' || !province || a.province === province) &&
			(!deadlyOnly || (a.deaths ?? 0) > 0),
		[year, type, province, deadlyOnly],
	)
	const filtered = useMemo(() => incidents.filter((a) => matches(a)), [incidents, matches])

	const features = useMemo<AccidentFeatures>(
		() => ({
			type: 'FeatureCollection',
			features: filtered.map((a) => ({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [a.lon, a.lat] },
				properties: {
					id: a.id,
					type: a.type,
					deaths: a.deaths ?? 0,
					placed: a.placed,
					// One incident counts for one; each death for half again, each injury a tenth, capped so one disaster does not wash out a province.
					// A dot parked on a province's centre adds nothing to the heat: a stack of them there would be a hotspot that is not.
					weight: a.placed === 'province' ? 0 : 1 + Math.min(a.deaths ?? 0, 20) * 0.5 + Math.min(a.injured ?? 0, 20) * 0.1,
				},
			})),
		}),
		[filtered],
	)

	const selected = useMemo(() => incidents.find((a) => a.id === selectedId) ?? null, [incidents, selectedId])
	const onSelect = useCallback((id: string | null) => setSelectedId(id), [])

	const openMap = useCallback(() => {
		setOpen(true)
		dialog.current?.showModal()
	}, [])

	// `#map` opens the dialog on arrival, so the map itself can be linked to.
	// Deferred a frame: the dialog element has to exist before showModal.
	useEffect(() => {
		if (window.location.hash !== '#map') return
		const frame = requestAnimationFrame(openMap)
		return () => cancelAnimationFrame(frame)
	}, [openMap])

	// The dialog scrolls; the page under it should not.
	useEffect(() => {
		if (!open) return
		const root = document.documentElement
		const previous = root.style.overflow
		root.style.overflow = 'hidden'
		return () => {
			root.style.overflow = previous
		}
	}, [open])

	// A row asked for this incident: choose it, fly there, and open the map if it is shut.
	const goTo = (a: Accident) => {
		setSelectedId(a.id)
		setFocus({ id: a.id, lon: a.lon, lat: a.lat, nonce: ++asks.current })
		if (!open) openMap()
	}

	const countBy = (key: (a: Accident) => string, except: 'year' | 'type' | 'province') => {
		const counts = new Map<string, number>()
		for (const a of incidents) if (matches(a, except)) counts.set(key(a), (counts.get(key(a)) ?? 0) + 1)
		return counts
	}
	const byYear = countBy((a) => a.date.slice(0, 4), 'year')
	const byType = countBy((a) => a.type, 'type')
	const byProvince = countBy((a) => a.province, 'province')

	const anyOff = year || type || province || deadlyOnly

	const reset = () => {
		setYear('')
		setType('')
		setProvince('')
		setDeadlyOnly(false)
	}

	// Drawn twice — on the page and in the dialog — off one state.
	const filters = (
		<div className='flex flex-wrap items-end gap-x-5 gap-y-4 border-y border-[var(--rule)] py-5 text-[var(--ink)]'>
			<Field label='Year' value={year} onChange={setYear} all='All years' options={years.map((y) => ({ value: y, label: y, count: byYear.get(y) ?? 0 }))} />
			<Field label='Kind' value={type} onChange={setType} all='All kinds' options={ACCIDENT_TYPES.map((k) => ({ value: k.id, label: k.label, count: byType.get(k.id) ?? 0 }))} />
			<Field label='Area' value={province} onChange={setProvince} all='All areas' options={provinces.map((p) => ({ value: p, label: p, count: byProvince.get(p) ?? 0 }))} />
			<label className='acc-field'>
				<span className='bb-label !mb-0'>Show</span>
				<select className='acc-select' value={show} onChange={(e) => setShow(e.target.value as Show)}>
					<option value='both'>Heat and dots</option>
					<option value='heat'>Heat only</option>
					<option value='points'>Dots only</option>
				</select>
			</label>
			<div className='flex items-center gap-1.5 self-center'>
				<button type='button' aria-pressed={deadlyOnly} onClick={() => setDeadlyOnly(!deadlyOnly)} className='acc-chip'>
					With deaths only
				</button>
				{anyOff ? (
					<button type='button' onClick={reset} className='acc-chip !border-transparent !text-[var(--accent)]'>
						Reset
					</button>
				) : null}
			</div>
		</div>
	)

	return (
		<div>
			{/* The way in. The map is a dialog, so the page opens on a door to it. */}
			<button
				type='button'
				onClick={openMap}
				className='group grid w-full cursor-pointer gap-5 border border-[var(--ink)] p-6 text-left transition hover:bg-[var(--paper-2)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-8'
			>
				<div>
					<p className='bb-label'>Interactive map</p>
					<p className='mt-1 text-[clamp(1.3rem,2.4vw,1.75rem)] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
						Every incident on one map, with the report behind each mark.
					</p>
					<p className='mt-2 max-w-[44rem] text-[13px] leading-[1.7] text-[var(--ink-3)]'>
						Heat for where it keeps happening; dots coloured by kind and sized by deaths. Filters, details and each report down the left.
					</p>
				</div>
				<span className='bb-btn bb-btn-accent !px-5 !py-3 !text-[10.5px]'>
					<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
					Open the map
				</span>
			</button>

			<div className='mt-10'>{filters}</div>

			{/* The table view: every incident on the map, newest first, with its sources. */}
			<section className='mt-8'>
				<h2 className='bb-label'>
					{filtered.length === incidents.length ? 'Every incident' : `${figure(filtered.length)} of ${figure(incidents.length)} incidents`}, newest first
				</h2>
				<ul className='mt-4'>
					{filtered.map((a) => {
						const t = typeOf(a.type)
						return (
							<li key={a.id} id={a.id} className='border-t border-[var(--rule)]'>
								<div className='grid gap-x-8 gap-y-2 py-5 md:grid-cols-[9rem_minmax(0,1fr)_11rem]'>
									<div className='num text-[12.5px] leading-[1.7] text-[var(--ink-3)]'>
										<span className='block font-semibold text-[var(--ink-2)]'>{accidentDate(a.date)}</span>
										<span className='flex items-center gap-1.5'>
											<KindIcon type={a.type} />
											{a.kind || t.label}
										</span>
									</div>
									<div className='min-w-0'>
										<button type='button' onClick={() => goTo(a)} className='group cursor-pointer text-left'>
											<span className='text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{a.title}</span>
										</button>
										<p className='mt-1 text-[12.5px] text-[var(--ink-3)]'>
											{a.barangay ? `${a.barangay}, ` : ''}
											{a.municipality ? `${a.municipality}, ` : ''}
											{a.province}
										</p>
										<p className='mt-2 text-[14px] leading-[1.7] text-[var(--ink-2)]'>{a.summary}</p>
										<p className='mt-2 text-[12px] leading-[1.7] text-[var(--ink-3)]'>
											<Sources a={a} />
										</p>
									</div>
									<Counts a={a} className='md:justify-end' />
								</div>
							</li>
						)
					})}
				</ul>
			</section>

			<dialog
				ref={dialog}
				onClose={() => setOpen(false)}
				aria-labelledby='accident-map-title'
				className='m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] backdrop:bg-black/40 open:flex open:flex-col lg:overflow-hidden'
			>
				<div className='flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] px-4 lg:px-6'>
					<div className='flex items-baseline gap-3'>
						<p className='bb-label !mb-0'>Interactive map</p>
						<h2 id='accident-map-title' className='text-[15px] font-extrabold tracking-[-0.02em]'>
							Accidents and shootings, {accidentsMeta.since} on
						</h2>
					</div>
					<button
						type='button'
						onClick={() => dialog.current?.close()}
						aria-label='Close map'
						className='inline-flex size-9 cursor-pointer items-center justify-center border border-current transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
					>
						<XIcon size={16} weight='bold' aria-hidden='true' />
					</button>
				</div>

				<div className='grid min-h-0 flex-1 lg:grid-cols-[26rem_minmax(0,1fr)]'>
					{/* Details on the left: filters, figures, the chosen incident, the list. */}
					<aside className='order-2 min-h-0 overflow-y-auto border-t border-[var(--rule)] p-5 lg:order-1 lg:border-r lg:border-t-0'>
						{filters}
						<div className='mt-5' />
						{selected ? <Details a={selected} onClose={() => setSelectedId(null)} /> : null}
						<ul className='mt-5 border-t border-[var(--rule)]'>
							{filtered.map((a) => (
								<li key={a.id} className='border-b border-[var(--rule-soft)]'>
									<button
										type='button'
										onClick={() => goTo(a)}
										aria-current={a.id === selectedId ? 'true' : undefined}
										className='grid w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 py-2.5 text-left transition hover:text-[var(--accent)] aria-[current=true]:text-[var(--accent)]'
									>
										<KindIcon type={a.type} size={14} />
										<span className='min-w-0'>
											<span className='block text-[13px] font-bold leading-snug'>{a.title}</span>
											<span className='num block text-[11px] text-[var(--ink-3)]'>
												{accidentDate(a.date)} · {a.municipality ?? a.province}
											</span>
										</span>
										{a.deaths ? (
											<span className='num text-[12px] font-extrabold text-[var(--ink)]'>
												{figure(a.deaths)} <span className='font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>dead</span>
											</span>
										) : null}
									</button>
								</li>
							))}
						</ul>
					</aside>
					<div className='order-1 h-[55dvh] min-h-0 lg:order-2 lg:h-auto'>
						{open ? <Canvas features={features} show={show} selectedId={selectedId} onSelect={onSelect} focus={focus} /> : null}
					</div>
				</div>
			</dialog>
		</div>
	)
}
