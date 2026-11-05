'use client'

import { ArrowLeftIcon, ArrowsOutIcon, ArrowUpRightIcon, MagnifyingGlassIcon, PlusIcon, XIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MANAGEMENT, SCHOOL_TYPES, typeColour, type MapSchool } from '../_lib/school-types'
import { SchoolMap } from './school-map'
import type { Fly } from './school-map-canvas'

/* ============================================================
   The map, opened full screen

   A preview on the page, and a button (or a dot) that opens the map
   as a dialog: a native <dialog> under showModal, so focus is held,
   Escape closes it and the page behind is inert. Down the left side
   sit the filters, then either the chosen school's card or the list
   of what is on the map; the map fills the rest. On a phone the map
   is on top and the panel under it.
   ============================================================ */

const fold = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

const CHIP =
	'inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-[0.75rem] font-semibold transition data-[on=false]:border-[var(--rule)] data-[on=false]:text-[var(--ink-3)] data-[on=false]:opacity-70 data-[on=true]:border-[var(--ink)] data-[on=true]:text-[var(--ink)]'

export function SchoolExplorer({
	schools,
	areas,
	startOpen = false,
	closeHref,
	previewClass = 'h-[30rem]',
}: {
	schools: MapSchool[]
	areas: { slug: string; name: string }[]
	/** Open on arrival, as the Map page does. */
	startOpen?: boolean
	/** Where closing goes, for a page that is only the map. */
	closeHref?: string
	previewClass?: string
}) {
	const router = useRouter()
	const dialog = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(startOpen)
	const [types, setTypes] = useState<Set<string>>(() => new Set(SCHOOL_TYPES.map((t) => t.label)))
	const [kinds, setKinds] = useState<Set<string>>(() => new Set(MANAGEMENT))
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

	const words = fold(q).split(/\s+/).filter(Boolean)
	const shown = useMemo(
		() =>
			schools.filter(
				(s) =>
					types.has(s.type) &&
					kinds.has(s.management) &&
					(!area || s.area === area) &&
					words.every((w) => fold(`${s.name} ${s.townName} ${s.id}`).includes(w)),
			),
		// words is derived from q
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[schools, types, kinds, area, q],
	)
	const selected = selectedId ? (schools.find((s) => s.id === selectedId) ?? null) : null
	const counts = useMemo(() => Object.fromEntries(SCHOOL_TYPES.map((t) => [t.label, schools.filter((s) => s.type === t.label).length])), [schools])

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
	const toggle = (set: Set<string>, value: string, update: (s: Set<string>) => void) => {
		const next = new Set(set)
		if (next.has(value) && next.size > 1) next.delete(value)
		else next.add(value)
		update(next)
	}

	return (
		<>
			{startOpen ? null : (
				<div className={`relative ${previewClass}`}>
					<SchoolMap schools={schools} onSelect={(id) => openWith(id)} className='!h-full' />
					<button type='button' onClick={() => openWith()} className='bb-btn bb-btn-accent absolute bottom-4 left-4 z-10 shadow-[0_12px_30px_-14px_rgba(0,0,0,0.6)]'>
						<ArrowsOutIcon size={14} weight='bold' aria-hidden='true' />
						Open the map
					</button>
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
					<div className='flex h-full flex-col-reverse lg:flex-row'>
						{/* ---- The panel ---- */}
						<aside className='flex min-h-0 flex-1 flex-col border-[var(--rule)] lg:w-[24rem] lg:flex-none lg:border-r'>
							<div className='flex items-start justify-between gap-3 border-b border-[var(--rule)] px-5 py-4'>
								<div>
									<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>Education · Bangsamoro</p>
									<p className='mt-1 text-[1.125rem] font-extrabold tracking-[-0.02em]'>Schools on the map</p>
								</div>
								<button type='button' onClick={close} aria-label='Close the map' className='grid size-9 shrink-0 cursor-pointer place-items-center border border-[var(--rule)] transition hover:border-[var(--ink)]'>
									<XIcon size={16} weight='bold' aria-hidden='true' />
								</button>
							</div>

							<div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
								<div className='space-y-4 border-b border-[var(--rule)] px-5 py-4'>
									<label className='flex h-10 items-center gap-2 border border-[var(--rule)] px-3 focus-within:border-[var(--accent)]'>
										<MagnifyingGlassIcon size={15} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
										<span className='sr-only'>Find a school</span>
										<input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Name, town or school ID' className='min-w-0 flex-1 bg-transparent text-[0.875rem] outline-none' />
									</label>
									<div>
										<p className='mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Kind of school</p>
										<div className='flex flex-wrap gap-1.5'>
											{SCHOOL_TYPES.filter((t) => counts[t.label]).map((t) => (
												<button key={t.label} type='button' data-on={types.has(t.label)} aria-pressed={types.has(t.label)} onClick={() => toggle(types, t.label, setTypes)} className={CHIP}>
													<span className='size-2.5 rounded-full' style={{ background: dark ? t.dark : t.light }} aria-hidden='true' />
													{t.label}
													<span className='font-normal text-[var(--ink-3)]'>{counts[t.label]}</span>
												</button>
											))}
										</div>
									</div>
									<div className='flex flex-wrap items-end gap-4'>
										<div>
											<p className='mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Run by</p>
											<div className='flex flex-wrap gap-1.5'>
												{MANAGEMENT.map((m) => (
													<button key={m} type='button' data-on={kinds.has(m)} aria-pressed={kinds.has(m)} onClick={() => toggle(kinds, m, setKinds)} className={CHIP}>
														{m === 'Not stated' ? 'Not stated' : m}
													</button>
												))}
											</div>
										</div>
										<label className='flex flex-col gap-2'>
											<span className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>Area</span>
											<select value={area} onChange={(e) => setArea(e.target.value)} className='h-8 border border-[var(--rule)] bg-[var(--paper)] px-2 text-[0.8125rem]'>
												<option value=''>All areas</option>
												{areas.map((a) => (
													<option key={a.slug} value={a.slug}>
														{a.name}
													</option>
												))}
											</select>
										</label>
									</div>
									<div className='flex items-center justify-between text-[0.78125rem] text-[var(--ink-3)]'>
										<span>
											{shown.length.toLocaleString('en-PH')} of {schools.length.toLocaleString('en-PH')} schools
										</span>
										<button type='button' onClick={() => setFly({ lon: 0, lat: 0, zoom: -1, nonce: Date.now() })} className='cursor-pointer font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>
											All BARMM
										</button>
									</div>
								</div>

								{selected ? (
									<SchoolCard school={selected} dark={dark} onBack={() => setSelectedId(null)} />
								) : (
									<ul className='divide-y divide-[var(--rule-soft)]'>
										{shown.slice(0, 200).map((s) => (
											<li key={s.id}>
												<button type='button' onClick={() => choose(s.id)} className='flex w-full cursor-pointer items-start gap-3 px-5 py-2.5 text-left transition hover:bg-[var(--paper-2)]'>
													<span
														className='mt-1.5 size-2.5 shrink-0 rounded-full border-2'
														style={{ borderColor: typeColour(s.type, dark), background: s.exact ? typeColour(s.type, dark) : 'transparent' }}
														aria-hidden='true'
													/>
													<span className='min-w-0'>
														<span className='block text-[0.84375rem] font-semibold leading-snug'>{s.name}</span>
														<span className='block text-[0.71875rem] text-[var(--ink-3)]'>
															{s.type} · {s.townName}
														</span>
													</span>
												</button>
											</li>
										))}
										{shown.length > 200 ? <li className='px-5 py-3 text-[0.75rem] text-[var(--ink-3)]'>And {(shown.length - 200).toLocaleString('en-PH')} more: narrow it down, or choose a dot.</li> : null}
									</ul>
								)}
							</div>
						</aside>

						{/* ---- The map ---- */}
						<div className='relative h-[48dvh] shrink-0 lg:h-full lg:flex-1'>
							<SchoolMap schools={shown} selectedId={selectedId} onSelect={choose} fly={fly} className='!h-full border-0' />
							<div className='pointer-events-none absolute bottom-3 left-3 hidden flex-wrap gap-x-4 gap-y-1 bg-[var(--paper)]/90 px-3 py-2 text-[0.6875rem] text-[var(--ink-2)] shadow-sm sm:flex'>
								<span className='inline-flex items-center gap-1.5'>
									<span className='size-2.5 rounded-full bg-[var(--ink-2)]' aria-hidden='true' /> Pinned where it stands
								</span>
								<span className='inline-flex items-center gap-1.5'>
									<span className='size-2.5 rounded-full border-2 border-[var(--ink-2)]' aria-hidden='true' /> At its town&rsquo;s centre
								</span>
							</div>
						</div>
					</div>
				) : null}
			</dialog>
		</>
	)
}

function SchoolCard({ school, dark, onBack }: { school: MapSchool; dark: boolean; onBack: () => void }) {
	return (
		<div className='px-5 py-4'>
			<button type='button' onClick={onBack} className='inline-flex cursor-pointer items-center gap-1.5 text-[0.78125rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
				<ArrowLeftIcon size={13} weight='bold' aria-hidden='true' /> Back to the list
			</button>
			{school.image ? (
				<figure className='mt-4'>
					<img src={school.image.url} alt='' className='aspect-[4/3] w-full object-cover' />
					<figcaption className='mt-1 text-[0.6875rem] text-[var(--ink-3)]'>
						<a href={school.image.page} target='_blank' rel='noreferrer' className='hover:text-[var(--accent)]'>
							{school.image.author} · {school.image.license}
						</a>
					</figcaption>
				</figure>
			) : null}
			<p className='mt-4 inline-flex items-center gap-1.5 text-[0.71875rem] font-semibold uppercase tracking-[0.1em]' style={{ color: typeColour(school.type, dark) }}>
				<span className='size-2.5 rounded-full' style={{ background: typeColour(school.type, dark) }} aria-hidden='true' />
				{school.type}
			</p>
			<h2 className='mt-1 text-[1.25rem] font-extrabold leading-snug tracking-[-0.02em]'>{school.name}</h2>
			<dl className='mt-4 space-y-2 text-[0.84375rem]'>
				{[
					['Where', school.townName === school.areaName ? school.townName : `${school.townName}, ${school.areaName}`],
					['Run by', school.management === 'Not stated' ? 'Not stated in the source' : school.management],
					...(school.level !== school.type ? [['Level', school.level]] : []),
					...(school.pupils ? [['Pupils', `${school.pupils.toLocaleString('en-PH')} (2015–16)`]] : []),
					['ID', /^\d+$/.test(school.id) ? school.id : 'Not on DepEd’s list'],
				].map(([k, v]) => (
					<div key={k} className='grid grid-cols-[4.5rem_1fr] gap-3'>
						<dt className='text-[var(--ink-3)]'>{k}</dt>
						<dd>{v}</dd>
					</div>
				))}
			</dl>
			{school.exact ? null : <p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>Not mapped yet: its dot is the town&rsquo;s centre, not the school.</p>}
			<div className='mt-5 flex flex-wrap gap-2'>
				<a href={`/schools/${school.id}`} className='bb-btn bb-btn-accent'>
					The school&rsquo;s page <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
				</a>
				<a href={`/needs/new?school=${school.id}`} className='bb-btn bb-btn-ghost'>
					<PlusIcon size={13} weight='bold' aria-hidden='true' /> Post a need
				</a>
			</div>
		</div>
	)
}
