'use client'

import { MapList, MapListGroup, MapListHead, MapListNote, MapListRow, SearchField, Select } from '@betterbarmm/editorial'
import { ArrowsOutIcon, ArrowUpRightIcon, PlusIcon, XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MANAGEMENT, SCHOOL_TYPES, typeColour, type MapSchool } from '../_lib/school-types'
import { SchoolMap } from './school-map'
import type { Fly } from './school-map-canvas'
import { NEEDS_LIVE } from '../_lib/needs'

/* ============================================================
   The map, opened full screen

   A preview on the page, and a button (or a dot) that opens the map
   as a dialog: a native <dialog> under showModal, so focus is held,
   Escape closes it and the page behind is inert. Laid out as Incident
   Watch's map is: the filters across the top, the list down the left,
   the map in the rest, and the chosen school's card floating over the
   map's bottom-right corner. On a phone the map is on top, the list
   under it.
   ============================================================ */

/** Rows the list draws at most; the map shows them all. */
const LIST_MAX = 200

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function SchoolExplorer({
	schools,
	areas,
	startOpen = false,
	closeHref,
	previewClass = 'h-[30rem]',
	year,
}: {
	schools: MapSchool[]
	areas: { slug: string; name: string }[]
	/** Open on arrival, as the Map page does. */
	startOpen?: boolean
	/** Where closing goes, for a page that is only the map. */
	closeHref?: string
	previewClass?: string
	/** The school year the learner counts are for, "2025–26". */
	year: string
}) {
	const router = useRouter()
	const dialog = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(startOpen)
	// One value each, '' for all.
	const [type, setType] = useState('')
	const [management, setManagement] = useState('')
	const [area, setArea] = useState('')
	const [q, setQ] = useState('')
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [fly, setFly] = useState<Fly>(null)
	const [dark, setDark] = useState(false)
	useEffect(() => setDark(document.documentElement.dataset.theme === 'dark'), [])

	useEffect(() => {
		const d = dialog.current
		if (!d) return
		if (open && !d.open) d.showModal()
		if (!open && d.open) d.close()
	}, [open])

	// `except` leaves one filter open, so a dropdown's counts say what choosing each option would leave.
	const matches = useCallback(
		(s: MapSchool, except?: 'type' | 'management' | 'area') => {
			const words = fold(q).split(/\s+/).filter(Boolean)
			return (
				(except === 'type' || !type || s.type === type) &&
				(except === 'management' || !management || s.management === management) &&
				(except === 'area' || !area || s.area === area) &&
				words.every((w) => fold(`${s.name} ${s.townName} ${s.id}`).includes(w))
			)
		},
		[q, type, management, area],
	)
	const shown = useMemo(() => schools.filter((s) => matches(s)), [schools, matches])
	const selected = selectedId ? (schools.find((s) => s.id === selectedId) ?? null) : null
	// The list, a town to a group, in the order the record keeps them (area, then town); the count is the town's whole share of what is shown.
	const groups = useMemo(() => {
		const perTown = new Map<string, number>()
		const town = (s: MapSchool) => `${s.area}/${s.townName}`
		for (const s of shown) perTown.set(town(s), (perTown.get(town(s)) ?? 0) + 1)
		const out: { key: string; title: string; total: number; items: MapSchool[] }[] = []
		for (const s of shown.slice(0, LIST_MAX)) {
			const last = out.at(-1)
			if (last && last.key === town(s)) last.items.push(s)
			else out.push({ key: town(s), title: s.townName === s.areaName ? s.townName : `${s.townName}, ${s.areaName}`, total: perTown.get(town(s)) ?? 0, items: [s] })
		}
		return out
	}, [shown])
	const counts = useMemo(() => {
		const by = (key: (s: MapSchool) => string, except: 'type' | 'management' | 'area') => {
			const c = new Map<string, number>()
			for (const s of schools) if (matches(s, except)) c.set(key(s), (c.get(key(s)) ?? 0) + 1)
			return c
		}
		return { type: by((s) => s.type, 'type'), management: by((s) => s.management, 'management'), area: by((s) => s.area, 'area') }
	}, [schools, matches])

	const choose = (id: string) => {
		const s = schools.find((x) => x.id === id)
		if (!s) return
		setSelectedId(id)
		setFly({ lon: s.lon, lat: s.lat, zoom: s.exact ? 14 : 11, nonce: Date.now() })
	}
	const openWith = (id?: string) => {
		setOpen(true)
		if (id) setTimeout(() => choose(id), 350)
	}
	const close = () => {
		setOpen(false)
		if (closeHref) router.push(closeHref)
	}

	return (
		<>
			{startOpen ? null : (
				<div className={`relative ${previewClass}`}>
					<SchoolMap schools={schools} onSelect={(id) => openWith(id)} className='!h-full' />
					{/* The wrapper takes the corner: .bb-btn sets its own position, outside the layers, and would win over `absolute`. */}
					<div className='absolute bottom-4 right-4 z-10'>
						<button type='button' onClick={() => openWith()} className='bb-btn bb-btn-accent shadow-[0_12px_30px_-14px_rgba(0,0,0,0.6)]'>
							<ArrowsOutIcon size={14} weight='bold' aria-hidden='true' />
							Open the map
						</button>
					</div>
				</div>
			)}

			<dialog
				ref={dialog}
				onCancel={(e) => {
					e.preventDefault()
					close()
				}}
				aria-label='Schools on the map'
				style={{ position: 'fixed', inset: 0, width: '100%', height: '100dvh', maxWidth: 'none', maxHeight: 'none', margin: 0, padding: 0, border: 0 }}
				// Phones zoom the whole page to 0.9 (globals.css); the dialog undoes it so it still fills the screen.
				className='z-[60] bg-[var(--paper)] text-[var(--ink)] backdrop:bg-black/60 max-sm:[zoom:1.1112]'
			>
				{open ? (
					<div className='flex h-full flex-col'>
						{/* The header is the filters, and the way out, on the dark ground, as Incident Watch's map has it. */}
						<div className='bb-ground flex shrink-0 items-start justify-between gap-4 border-b border-[var(--rule)] px-4 py-2 [color-scheme:dark] lg:items-center lg:px-6'>
							<div className='@container min-w-0 flex-1'>
								<div className='flex flex-wrap items-center gap-3 gap-x-5'>
									<div className='w-full @xl:w-72'>
										<SearchField value={q} onChange={setQ} placeholder='Name, town or school ID' plain />
									</div>
									{/* On a phone the controls keep to one line that scrolls sideways, so the map keeps the screen. */}
									<div className='flex w-full items-center gap-x-5 overflow-x-auto pr-8 [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 @xl:w-auto @xl:flex-wrap @xl:gap-y-2 @xl:overflow-visible @xl:pr-0 @xl:[mask-image:none]'>
										<Select
											label='Kind'
											value={type}
											onChange={setType}
											plain
											options={[['', 'All kinds'], ...SCHOOL_TYPES.filter((t) => counts.type.get(t.label)).map((t): [string, string] => [t.label, `${t.label} (${counts.type.get(t.label)})`])]}
										/>
										<Select label='Run by' value={management} onChange={setManagement} plain options={[['', 'Public & private'], ...MANAGEMENT.map((m): [string, string] => [m, `${m} (${counts.management.get(m) ?? 0})`])]} />
										<Select label='Area' value={area} onChange={setArea} plain options={[['', 'All areas'], ...areas.map((a): [string, string] => [a.slug, `${a.name} (${counts.area.get(a.slug) ?? 0})`])]} />
									</div>
								</div>
							</div>
							<button type='button' onClick={close} aria-label='Close the map' className='inline-flex h-10 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'>
								<XIcon size={16} weight='bold' aria-hidden='true' />
							</button>
						</div>

						<div className='grid min-h-0 flex-1 lg:grid-cols-[26rem_minmax(0,1fr)]'>
							{/* The list on the left, a town to a group; the chosen school floats over the map's corner. */}
							<MapList
								className='order-2 border-t border-[var(--rule)] lg:order-1 lg:border-r lg:border-t-0'
								head={
									<MapListHead
										count={shown.length}
										of={schools.length}
										noun='schools'
										action={
											<button type='button' onClick={() => setFly({ lon: 0, lat: 0, zoom: -1, nonce: Date.now() })} className='cursor-pointer text-[var(--ink-2)] hover:text-[var(--accent)]'>
												All BARMM
											</button>
										}
									/>
								}
							>
								{groups.map((g) => (
									<MapListGroup key={g.key} title={g.title} count={g.total}>
										{g.items.map((s) => (
											<MapListRow
												key={s.id}
												current={s.id === selectedId}
												onClick={() => choose(s.id)}
												marker={
													<span
														className='size-2.5 rounded-full border-2'
														style={{ borderColor: typeColour(s.type, dark), background: s.exact ? typeColour(s.type, dark) : 'transparent' }}
														aria-hidden='true'
													/>
												}
												title={s.name}
												meta={s.type}
												figure={s.pupils ? s.pupils.toLocaleString('en-PH') : null}
											/>
										))}
									</MapListGroup>
								))}
								{shown.length > LIST_MAX ? <MapListNote>And {(shown.length - LIST_MAX).toLocaleString('en-PH')} more: narrow it down, or choose a dot.</MapListNote> : null}
								{shown.length === 0 ? <MapListNote>No school matches these filters.</MapListNote> : null}
							</MapList>

							<div className='relative order-1 h-[55dvh] min-h-0 lg:order-2 lg:h-auto'>
								<SchoolMap schools={shown} selectedId={selectedId} onSelect={choose} fly={fly} className='!h-full border-0' />
								<div className='pointer-events-none absolute bottom-3 left-3 hidden flex-wrap gap-x-4 gap-y-1 bg-[var(--paper)]/90 px-3 py-2 text-[0.6875rem] text-[var(--ink-2)] shadow-sm sm:flex'>
									<span className='inline-flex items-center gap-1.5'>
										<span className='size-2.5 rounded-full bg-[var(--ink-2)]' aria-hidden='true' /> Pinned where it stands
									</span>
									<span className='inline-flex items-center gap-1.5'>
										<span className='size-2.5 rounded-full border-2 border-[var(--ink-2)]' aria-hidden='true' /> At its town&rsquo;s centre
									</span>
								</div>
								{selected ? (
									<div className='absolute bottom-4 right-4 z-10 w-[22rem] max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] overflow-y-auto shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]'>
										<SchoolCard school={selected} dark={dark} year={year} onClose={() => setSelectedId(null)} />
									</div>
								) : null}
							</div>
						</div>
					</div>
				) : null}
			</dialog>
		</>
	)
}

function SchoolCard({ school, dark, year, onClose }: { school: MapSchool; dark: boolean; year: string; onClose: () => void }) {
	return (
		<article className='bg-[var(--paper)] p-4'>
			<div className='flex items-start justify-between gap-3'>
				<p className='inline-flex items-center gap-1.5 text-[0.71875rem] font-semibold uppercase tracking-[0.1em]' style={{ color: typeColour(school.type, dark) }}>
					<span className='size-2.5 rounded-full' style={{ background: typeColour(school.type, dark) }} aria-hidden='true' />
					{school.type}
				</p>
				<button type='button' onClick={onClose} aria-label='Close details' className='-mr-1.5 -mt-1.5 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center text-[var(--ink-3)] transition hover:text-[var(--ink)]'>
					<XIcon size={14} weight='bold' aria-hidden='true' />
				</button>
			</div>
			<h2 className='mt-2 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em]'>{school.name}</h2>
			{school.image ? (
				<figure className='mt-3'>
					<img src={school.image.url} alt='' className='aspect-[16/9] w-full object-cover' />
					<figcaption className='mt-1 text-[0.6875rem] text-[var(--ink-3)]'>
						<a href={school.image.page} target='_blank' rel='noreferrer' className='hover:text-[var(--accent)]'>
							{school.image.author} · {school.image.license}
						</a>
					</figcaption>
				</figure>
			) : null}
			<dl className='mt-3 space-y-1.5 text-[0.8125rem]'>
				{[
					['Where', school.townName === school.areaName ? school.townName : `${school.townName}, ${school.areaName}`],
					['Run by', school.management === 'Not stated' ? 'Not stated in the source' : school.management],
					...(school.level !== school.type ? [['Level', school.level]] : []),
					...(school.pupils ? [['Learners', `${school.pupils.toLocaleString('en-PH')} (SY ${year})`]] : []),
					['ID', /^\d+$/.test(school.id) ? school.id : 'Not on DepEd’s list'],
				].map(([k, v]) => (
					<div key={k} className='grid grid-cols-[4.5rem_1fr] gap-3'>
						<dt className='text-[var(--ink-3)]'>{k}</dt>
						<dd>{v}</dd>
					</div>
				))}
			</dl>
			{school.exact ? null : <p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>Not mapped yet: its dot is the town&rsquo;s centre, not the school.</p>}
			<div className={`mt-4 grid gap-2 ${NEEDS_LIVE ? 'grid-cols-2' : ''}`}>
				<a href={`/schools/${school.id}`} className='bb-btn bb-btn-accent justify-center !px-2'>
					School page <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
				</a>
				{NEEDS_LIVE ? (
					<a href={`/needs/new?school=${school.id}`} className='bb-btn bb-btn-ghost justify-center !px-2'>
						<PlusIcon size={13} weight='bold' aria-hidden='true' /> Post a need
					</a>
				) : null}
			</div>
		</article>
	)
}
