'use client'

import {
	ArrowSquareOutIcon,
	BedIcon,
	CalendarBlankIcon,
	CompassIcon,
	ForkKnifeIcon,
	InfoIcon,
	MapPinIcon,
	MapTrifoldIcon,
	type Icon,
} from '@phosphor-icons/react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CityGuide, CityPlace } from '@betterbarmm/travel-data/cities'
import type { CityPhoto } from '../_lib/city-photos'
import { TileMap, type MapCategory, type MapPin } from './tile-map'

/* ============================================================
   A city, as a travel app shows one

   A photograph to open on, a strip of tabs that stays in reach,
   and the city broken into what a visitor does with it: sleep, eat,
   see, get about. Every listing can be found on the map, and every
   one names the pages it came from.
   ============================================================ */

const CATEGORIES: MapCategory[] = [
	{ key: 'stay', label: 'Stay', color: '#2f6f8f' },
	{ key: 'eat', label: 'Eat', color: '#c0532b' },
	{ key: 'see', label: 'See & do', color: '#7a5aa8' },
	{ key: 'essential', label: 'Essentials', color: '#5b6b4a' },
]

const TABS: { id: string; label: string; icon: Icon }[] = [
	{ id: 'overview', label: 'Overview', icon: InfoIcon },
	{ id: 'map', label: 'Map', icon: MapTrifoldIcon },
	{ id: 'stay', label: 'Stay', icon: BedIcon },
	{ id: 'eat', label: 'Eat', icon: ForkKnifeIcon },
	{ id: 'see', label: 'See & do', icon: CompassIcon },
	{ id: 'events', label: 'Events', icon: CalendarBlankIcon },
	{ id: 'practical', label: 'Getting around', icon: MapPinIcon },
]

const KIND_LABEL: Record<string, string> = {
	hotel: 'Hotel',
	inn: 'Inn',
	pension: 'Pension house',
	guesthouse: 'Guesthouse',
	apartment: 'Apartment',
	restaurant: 'Restaurant',
	cafe: 'Café',
	bakery: 'Bakery',
	foodpark: 'Food park',
	carinderia: 'Carinderia',
	market: 'Market',
	sacred: 'Sacred site',
	heritage: 'Heritage',
	museum: 'Museum',
	nature: 'Nature',
	park: 'Park',
	shopping: 'Shopping',
	viewpoint: 'Viewpoint',
	activity: 'Activity',
	other: 'Place',
}

/** Essentials in the order a visitor needs them. */
const ESSENTIAL_ORDER = ['Hospital', 'Clinic', 'Pharmacy', 'Bank', 'ATM', 'Remittance', 'Terminal', 'Ferry terminal', 'Airport', 'Mall', 'Supermarket', 'Market', 'Police']

const label = (kind: string) => KIND_LABEL[kind] ?? kind.charAt(0).toUpperCase() + kind.slice(1)

/** A row of filter chips: "All" and each value present, with counts. */
function Chips({ values, value, onChange }: { values: [string, string, number][]; value: string; onChange: (v: string) => void }) {
	return (
		<div className='-mx-1 flex flex-wrap gap-2'>
			{values.map(([key, text, count]) => (
				<button
					key={key}
					type='button'
					onClick={() => onChange(key)}
					data-active={value === key}
					className='chip chip-field cursor-pointer data-[active=true]:border-[var(--ink)] data-[active=true]:bg-[var(--ink)] data-[active=true]:text-[var(--paper)]'
				>
					{text}
					<span className='num text-[0.6875rem] opacity-70'>{count}</span>
				</button>
			))}
		</div>
	)
}

function PlaceCard({
	place,
	accent,
	photo,
	onMap,
}: {
	place: CityPlace
	accent: string
	photo?: CityPhoto
	onMap?: () => void
}) {
	return (
		<article className='flex flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition hover:border-[var(--accent)]'>
			{photo ? (
				<div className='relative aspect-[16/10]'>
					<Image src={photo.src} alt={photo.alt} fill sizes='(min-width: 1024px) 33vw, 100vw' className='object-cover' />
				</div>
			) : (
				<div className='h-1.5' style={{ background: accent }} aria-hidden='true' />
			)}
			<div className='flex flex-1 flex-col p-5'>
				<div className='flex flex-wrap items-center gap-2'>
					<span className='px-2.5 py-0.5 text-[0.6875rem] font-semibold text-white' style={{ background: accent }}>
						{label(place.kind)}
					</span>
					{place.halal ? (
						<span className='bg-[color-mix(in_srgb,#3f8f5a_16%,transparent)] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[#2f7a48]'>
							Halal
						</span>
					) : null}
					{place.onBookingSites ? (
						<span className='bg-[var(--paper-2)] px-2.5 py-0.5 text-[0.6875rem] text-[var(--ink-3)]'>Bookable online</span>
					) : null}
				</div>
				<h3 className='mt-3 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{place.name}</h3>
				{place.area ? (
					<p className='mt-1 flex items-center gap-1 text-[0.78125rem] text-[var(--ink-3)]'>
						<MapPinIcon size={13} aria-hidden='true' />
						{place.area}
					</p>
				) : null}
				<p className='mt-3 flex-1 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{place.note}</p>
				<div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule-soft)] pt-3 text-[0.78125rem]'>
					{place.lat != null && onMap ? (
						<button type='button' onClick={onMap} className='inline-flex cursor-pointer items-center gap-1 font-semibold text-[var(--accent)]'>
							<MapTrifoldIcon size={14} aria-hidden='true' />
							Show on map
						</button>
					) : null}
					{place.website ? (
						<a href={place.website} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 font-semibold text-[var(--ink)]'>
							Website
							<ArrowSquareOutIcon size={13} aria-hidden='true' />
						</a>
					) : null}
					<span className='ml-auto truncate text-[0.71875rem] text-[var(--ink-mute)]'>
						{place.sources.map((s, i) => (
							<a key={s.url} href={s.url} target='_blank' rel='noreferrer' className='hover:text-[var(--ink)]'>
								{i ? ' · ' : ''}
								{s.label}
							</a>
						))}
					</span>
				</div>
				{photo ? (
					<p className='mt-2 text-[0.65625rem] text-[var(--ink-mute)]'>
						Photo:{' '}
						<a href={photo.source} target='_blank' rel='noreferrer' className='hover:text-[var(--ink)]'>
							{photo.credit}, {photo.license}
						</a>
					</p>
				) : null}
			</div>
		</article>
	)
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
	return (
		<section id={id} className='scroll-mt-[calc(var(--sticky-top,5rem)+4.5rem)] pt-16'>
			<h2 className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{title}</h2>
			{lead ? <p className='mt-2 max-w-[46rem] text-[0.9375rem] leading-7 text-[var(--ink-3)]'>{lead}</p> : null}
			<div className='mt-7'>{children}</div>
		</section>
	)
}

const FIRST = 9

/** The first nine cards, and a button for the rest. */
function CardGrid<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
	const [all, setAll] = useState(false)
	useEffect(() => setAll(false), [items])
	return (
		<>
			<div className='mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3'>{(all ? items : items.slice(0, FIRST)).map(render)}</div>
			{items.length > FIRST && !all ? (
				<div className='mt-6 flex justify-center'>
					<button
						type='button'
						onClick={() => setAll(true)}
						className='bb-btn bb-btn-ghost'
					>
						Show all {items.length}
					</button>
				</div>
			) : null}
		</>
	)
}

/** A list with "All" and its kinds as chips. */
function useKindFilter(items: CityPlace[], extra?: [string, string, (p: CityPlace) => boolean]) {
	const [kind, setKind] = useState('all')
	const kinds = useMemo(() => {
		const count = new Map<string, number>()
		for (const p of items) count.set(p.kind, (count.get(p.kind) ?? 0) + 1)
		const chips: [string, string, number][] = [['all', 'All', items.length]]
		if (extra) chips.push([extra[0], extra[1], items.filter(extra[2]).length])
		for (const [k, n] of [...count.entries()].sort((a, b) => b[1] - a[1])) chips.push([k, label(k), n])
		return chips
	}, [items, extra])
	const shown = items.filter((p) => kind === 'all' || (extra && kind === extra[0] ? extra[2](p) : p.kind === kind))
	return { kind, setKind, kinds, shown }
}

export function CityGuideView({
	guide,
	intro,
	safety,
	facts,
	hero,
	photos,
	dishPhotos,
}: {
	guide: CityGuide
	intro: string[]
	safety: string
	facts: { label: string; value: string }[]
	hero: CityPhoto
	/** The guide's photographs, by the key a listing names. */
	photos: Record<string, CityPhoto>
	dishPhotos: Record<string, CityPhoto>
}) {
	const [active, setActive] = useState('overview')
	const [selected, setSelected] = useState<string | null>(null)
	const [layers, setLayers] = useState<string[]>(['stay', 'eat', 'see'])
	const mapRef = useRef<HTMLDivElement>(null)

	// The tab under the strip follows the reader down the page: the last
	// section whose top has passed a third of the way down the screen.
	useEffect(() => {
		const onScroll = () => {
			let current = TABS[0]!.id
			for (const tab of TABS) {
				const el = document.getElementById(tab.id)
				if (el && el.getBoundingClientRect().top < window.innerHeight / 3) current = tab.id
			}
			setActive(current)
		}
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => window.removeEventListener('scroll', onScroll)
	}, [])

	const stay = useKindFilter(guide.stay)
	const halal: [string, string, (p: CityPlace) => boolean] = useMemo(() => ['halal', 'Halal', (p) => p.halal === true], [])
	const eat = useKindFilter(guide.eat, halal)
	const see = useKindFilter(guide.see)

	const pins: MapPin[] = useMemo(() => {
		const from = (items: CityPlace[], category: string) =>
			items.filter((p) => p.lat != null && p.lon != null).map((p) => ({ id: `${category}:${p.id}`, lat: p.lat!, lon: p.lon!, name: p.name, category, note: label(p.kind) }))
		return [
			...(layers.includes('stay') ? from(guide.stay, 'stay') : []),
			...(layers.includes('eat') ? from(guide.eat, 'eat') : []),
			...(layers.includes('see') ? from(guide.see, 'see') : []),
			...(layers.includes('essential') ? guide.essentials.map((e) => ({ id: `essential:${e.id}`, lat: e.lat, lon: e.lon, name: e.name, category: 'essential', note: e.kind })) : []),
		]
	}, [guide, layers])

	const showOnMap = (category: string, id: string) => {
		if (!layers.includes(category)) setLayers((l) => [...l, category])
		setSelected(`${category}:${id}`)
		mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	const photoFor = (place: CityPlace) => (place.photo ? photos[place.photo] : undefined)

	const essentialsByKind = useMemo(() => {
		const by = new Map<string, Map<string, number>>()
		for (const e of guide.essentials) {
			const names = by.get(e.kind) ?? new Map<string, number>()
			names.set(e.name, (names.get(e.name) ?? 0) + 1)
			by.set(e.kind, names)
		}
		return [...by.entries()]
			.map(([kind, names]) => [kind, [...names.entries()].map(([n, c]) => (c > 1 ? `${n} (${c} branches)` : n))] as const)
			.sort((a, b) => ESSENTIAL_ORDER.indexOf(a[0]) - ESSENTIAL_ORDER.indexOf(b[0]))
	}, [guide])

	const color = (key: string) => CATEGORIES.find((c) => c.key === key)!.color

	return (
		<>
			{/* ---- Hero ---- */}
			<section className='relative isolate overflow-hidden'>
				<Image src={hero.src} alt={hero.alt} fill priority sizes='100vw' className='-z-10 object-cover' />
				<div className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(10,10,10,0.82),rgba(10,10,10,0.25)_55%,rgba(10,10,10,0.1))]' />
				<div className='bb-container flex min-h-[min(78vh,40rem)] flex-col justify-end pb-12 pt-32 text-white'>
					<p className='!font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#f1c453]'>
						City guide
					</p>
					<h1 className='bb-display-md mt-3 text-white'>
						{guide.name}
					</h1>
					<p className='mt-4 max-w-[56rem] text-[1rem] leading-7 text-white/85'>{intro[0]?.split('. ')[0]}.</p>
					<div className='mt-7 flex flex-wrap gap-2'>
						{[
							[`${guide.stay.length} places to stay`, 'stay'],
							[`${guide.eat.length} places to eat`, 'eat'],
							[`${guide.see.length} things to see`, 'see'],
						].map(([text, id]) => (
							<a key={id} href={`#${id}`} className='border border-white/35 px-4 py-2 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-[#8f2328]'>
								{text}
							</a>
						))}
					</div>
					<p className='mt-6 text-[0.65625rem] text-white/60'>
						Photo:{' '}
						<a href={hero.source} target='_blank' rel='noreferrer' className='hover:text-white'>
							{hero.credit}, {hero.license}
						</a>
					</p>
				</div>
			</section>

			{/* ---- Tabs ---- */}
			<nav
				aria-label='Sections'
				className='sticky top-[var(--sticky-top,5rem)] z-20 border-b border-[var(--rule)] bg-[var(--paper)]/92 backdrop-blur-xl transition-[top] duration-300'
			>
				<div className='bb-container flex gap-7 overflow-x-auto [scrollbar-width:none]'>
					{TABS.map((tab) => {
						const TabIcon = tab.icon
						return (
							<a
								key={tab.id}
								href={`#${tab.id}`}
								data-active={active === tab.id}
								className='-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent py-4 font-[family-name:var(--font-display)] text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--ink)] data-[active=true]:border-[var(--accent)] data-[active=true]:text-[var(--ink)]'
							>
								<TabIcon size={16} weight='duotone' aria-hidden='true' />
								{tab.label}
							</a>
						)
					})}
				</div>
			</nav>

			<div className='bb-container pb-24'>
				{/* ---- Overview ---- */}
				<section id='overview' className='scroll-mt-[calc(var(--sticky-top,5rem)+4.5rem)] pt-14'>
					<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20'>
						<div className='space-y-5 text-[1rem] leading-8 text-[var(--ink-2)]'>
							{intro.map((p) => (
								<p key={p.slice(0, 30)}>{p}</p>
							))}
						</div>
						<aside className='grid content-start gap-4'>
							<dl className='grid gap-3 bg-[var(--paper-2)] p-5'>
								{facts.map((f) => (
									<div key={f.label}>
										<dt className='text-[0.71875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{f.label}</dt>
										<dd className='mt-1 text-[0.875rem] leading-6 text-[var(--ink)]'>{f.value}</dd>
									</div>
								))}
							</dl>
							<div className='border-l-4 border-[var(--accent)] bg-[var(--paper-2)] p-5'>
								<p className='text-[0.71875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>Staying safe</p>
								<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-2)]'>{safety}</p>
							</div>
						</aside>
					</div>
				</section>

				{/* ---- Map ---- */}
				<div ref={mapRef} className='scroll-mt-[calc(var(--sticky-top,5rem)+4.5rem)]' />
				<Section id='map' title='On the map' lead='Tap a pin for its name. Pick what to show.'>
					<div className='mb-4 flex flex-wrap gap-2'>
						{CATEGORIES.map((c) => {
							const on = layers.includes(c.key)
							return (
								<button
									key={c.key}
									type='button'
									onClick={() => setLayers((l) => (on ? l.filter((k) => k !== c.key) : [...l, c.key]))}
									className='inline-flex cursor-pointer items-center gap-2 border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition'
									style={on ? { background: c.color, borderColor: c.color, color: '#fff' } : { borderColor: 'var(--rule)', color: 'var(--ink-3)' }}
								>
									{c.label}
								</button>
							)
						})}
					</div>
					<TileMap pins={pins} categories={CATEGORIES} selected={selected} onSelect={setSelected} height={520} />
				</Section>

				{/* ---- Stay ---- */}
				<Section id='stay' title='Where to stay' lead='Hotels, inns and pension houses. Rates change faster than a guide can follow, so book through the place or a booking site.'>
					<Chips values={stay.kinds} value={stay.kind} onChange={stay.setKind} />
					<CardGrid items={stay.shown} render={(p) => <PlaceCard key={p.id} place={p} accent={color('stay')} onMap={() => showOnMap('stay', p.id)} />} />
				</Section>

				{/* ---- Eat ---- */}
				<Section id='eat' title='What and where to eat' lead='The food is halal-first and Maguindanaon at heart. Start with the dishes, then the places.'>
					{guide.dishes.length ? (
						<div className='-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin]'>
							{guide.dishes.map((d) => {
								const photo = Object.entries(dishPhotos).find(([w]) => d.name.toLowerCase().includes(w))?.[1]
								return (
									<article key={d.name} className='w-72 shrink-0 snap-start overflow-hidden bg-[var(--paper-2)]'>
										{photo ? (
											<div className='relative aspect-[4/3]'>
												<Image src={photo.src} alt={photo.alt} fill sizes='18rem' className='object-cover' />
											</div>
										) : null}
										<div className='p-5'>
											<h3 className='font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{d.name}</h3>
											<p className='mt-2 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{d.note}</p>
											{d.whereToTry.length ? (
												<p className='mt-3 text-[0.75rem] text-[var(--ink-3)]'>Try it at {d.whereToTry.join(', ')}</p>
											) : null}
										</div>
									</article>
								)
							})}
						</div>
					) : null}
					<div className='mt-8'>
						<Chips values={eat.kinds} value={eat.kind} onChange={eat.setKind} />
					</div>
					<CardGrid items={eat.shown} render={(p) => <PlaceCard key={p.id} place={p} accent={color('eat')} onMap={() => showOnMap('eat', p.id)} />} />
					{guide.chains.length ? (
						<p className='mt-6 text-[0.8125rem] text-[var(--ink-3)]'>Also in the city: {guide.chains.join(', ')}.</p>
					) : null}
				</Section>

				{/* ---- See & do ---- */}
				<Section id='see' title='What to see and do' lead='Mosques, a Jesuit-era church, the hill the city grew around, and the river that made it.'>
					<Chips values={see.kinds} value={see.kind} onChange={see.setKind} />
					<CardGrid items={see.shown} render={(p) => <PlaceCard key={p.id} place={p} accent={color('see')} photo={photoFor(p)} onMap={() => showOnMap('see', p.id)} />} />
				</Section>

				{/* ---- Events ---- */}
				{guide.events.length ? (
					<Section id='events' title='When things happen'>
						<ol className='grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2'>
							{guide.events.map((e) => (
								<li key={e.name} className='flex gap-4 bg-[var(--paper-2)] p-5'>
									<CalendarBlankIcon size={22} className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
									<div>
										<p className='text-[0.78125rem] font-semibold leading-5 text-[var(--accent)]'>{e.when}</p>
										<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{e.name}</h3>
										<p className='mt-2 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{e.note}</p>
									</div>
								</li>
							))}
						</ol>
					</Section>
				) : (
					<div id='events' />
				)}

				{/* ---- Practical ---- */}
				<Section id='practical' title='Getting there and around'>
					<div className='grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2'>
						{guide.practical.map((tip) => (
							<article key={tip.topic + tip.text.slice(0, 20)} className='border border-[var(--rule)] p-5'>
								<h3 className='font-[family-name:var(--font-display)] text-[0.9375rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>{tip.topic}</h3>
								<p className='mt-2 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>{tip.text}</p>
								<p className='mt-3 truncate text-[0.71875rem] text-[var(--ink-mute)]'>
									{tip.sources.map((s, i) => (
										<a key={s.url} href={s.url} target='_blank' rel='noreferrer' className='hover:text-[var(--ink)]'>
											{i ? ' · ' : ''}
											{s.label}
										</a>
									))}
								</p>
							</article>
						))}
					</div>

					{essentialsByKind.length ? (
						<div className='mt-10'>
							<h3 className='font-[family-name:var(--font-display)] text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Essentials</h3>
							<p className='mt-1 text-[0.8125rem] text-[var(--ink-3)]'>
								Banks, hospitals, pharmacies, terminals and malls on OpenStreetMap.{' '}
								<button type='button' onClick={() => { setLayers((l) => (l.includes('essential') ? l : [...l, 'essential'])); mapRef.current?.scrollIntoView({ behavior: 'smooth' }) }} className='cursor-pointer font-semibold text-[var(--accent)]'>
									Show them on the map
								</button>
							</p>
							<div className='mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4'>
								{essentialsByKind.map(([kind, names]) => (
									<div key={kind}>
										<p className='text-[0.71875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
											{kind}
										</p>
										<ul className='mt-2 grid gap-1 text-[0.8125rem] leading-5 text-[var(--ink-2)]'>
											{names.slice(0, 8).map((n) => (
												<li key={n}>{n}</li>
											))}
											{names.length > 8 ? <li className='text-[var(--ink-mute)]'>and {names.length - 8} more on the map</li> : null}
										</ul>
									</div>
								))}
							</div>
						</div>
					) : null}

					<p className='mt-12 max-w-[52rem] text-[0.75rem] leading-5 text-[var(--ink-mute)]'>{guide.note}</p>
				</Section>
			</div>
		</>
	)
}
