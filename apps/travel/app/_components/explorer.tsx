'use client'

import {
	BedIcon,
	CaretDownIcon,
	CalendarCheckIcon,
	ForkKnifeIcon,
	MagnifyingGlassIcon,
	PathIcon,
	SquaresFourIcon,
	XIcon,
} from '@phosphor-icons/react'
import type { ExploreKind } from '@betterbarmm/travel-data/explore'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ExploreCard } from './explore-card'
import type { CardPlace } from '../_lib/cards'
import { KIND_ICON } from './kind-icon'
import { GUIDE_PAGES } from '../_lib/guide'

/* ============================================================
   The explorer: every place, browsed the way stays are

   A search — a place or a town, and an area — then a row of
   categories, then the places as photo cards, in the estate's own
   square, ruled style (user decision). No map here (user decision):
   each place's own page carries one. The filters live
   in the address bar too, so a filtered view can be linked.

   All in the browser: 104 places are a few kilobytes of rows, and
   filtering them on every keystroke needs no server.
   ============================================================ */

const fold = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()

/** The ways in under the search, as the directory's header has its own. */
const WAYS_IN = [
	...(GUIDE_PAGES
		? [
	{ href: '/routes', label: 'Getting around', icon: PathIcon },
	{ href: '/stays', label: 'Where to sleep', icon: BedIcon },
	{ href: '/food', label: 'What to eat', icon: ForkKnifeIcon },
	{ href: '/plan', label: 'Plan a trip', icon: CalendarCheckIcon },
			]
		: []),
]

export function Explorer({
	head,
	places,
	areas,
	kinds,
}: {
	/** The band's words above the search: its label, title and lead. */
	head: React.ReactNode
	places: CardPlace[]
	areas: { slug: string; name: string }[]
	kinds: { key: ExploreKind; label: string }[]
}) {
	const params = useSearchParams()
	const [kind, setKind] = useState<ExploreKind | null>((params.get('kind') as ExploreKind) || null)
	const [area, setArea] = useState(params.get('area') ?? '')
	const [query, setQuery] = useState(params.get('q') ?? '')

	// Kept in the address bar without a navigation, so a filtered view can be shared.
	const sync = (next: { kind?: ExploreKind | null; area?: string; q?: string }) => {
		const state = { kind, area, q: query, ...next }
		const url = new URLSearchParams()
		if (state.kind) url.set('kind', state.kind)
		if (state.area) url.set('area', state.area)
		if (state.q.trim()) url.set('q', state.q.trim())
		const search = url.toString()
		window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`)
	}

	const shown = useMemo(() => {
		const words = fold(query).split(/\s+/).filter(Boolean)
		return places.filter((p) => {
			if (kind && p.kind !== kind && !p.also.includes(kind)) return false
			if (area && p.area !== area) return false
			if (!words.length) return true
			const hay = fold(`${p.name} ${p.municipality} ${p.areaName} ${p.kindLabel} ${p.summary}`)
			return words.every((w) => hay.includes(w))
		})
	}, [places, kind, area, query])

	const counts = useMemo(() => {
		const out: Partial<Record<ExploreKind, number>> = {}
		for (const p of places) if (!area || p.area === area) for (const k of [p.kind, ...p.also]) out[k] = (out[k] ?? 0) + 1
		return out
	}, [places, area])


	return (
		<div>
			{/* ---- The header: the directory's own (user decision) — the brand band, its glow, the words, a white
			    search field with the area beside it, and the ways in under it. ---- */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<div className='bb-container relative py-16 text-center lg:py-24'>
					{head}
					<form role='search' onSubmit={(e) => e.preventDefault()} className='mx-auto mt-8 max-w-2xl'>
						{/* Fixed colours: inside the brand band, --paper and --ink point at its crimson ground. */}
						<span className='flex h-14 items-center gap-3 bg-white pl-5 text-[#191713] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]'>
							<MagnifyingGlassIcon size={20} className='shrink-0 text-[#5c574c]' aria-hidden='true' />
							<label htmlFor='travel-search' className='sr-only'>
								Search places
							</label>
							<input
								id='travel-search'
								type='search'
								autoComplete='off'
								value={query}
								onChange={(e) => {
									setQuery(e.target.value)
									sync({ q: e.target.value })
								}}
								placeholder='A place, a town, an island, a mosque…'
								className='min-w-0 flex-1 bg-transparent text-[1rem] outline-none placeholder:text-[#8a857a] [&::-webkit-search-cancel-button]:hidden'
							/>
							{query ? (
								<button
									type='button'
									onClick={() => {
										setQuery('')
										sync({ q: '' })
									}}
									aria-label='Clear the search'
									className='grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-[#5c574c] hover:bg-[#f1ede6]'
								>
									<XIcon size={15} weight='bold' aria-hidden='true' />
								</button>
							) : null}
							<span aria-hidden='true' className='h-7 w-px shrink-0 bg-[#d9d4ca]' />
							<label htmlFor='travel-area' className='sr-only'>
								Area
							</label>
							{/* The browser's own arrow sat against the field's edge; this one is drawn, and inset like the icon opposite. */}
							<span className='relative flex h-full w-40 shrink-0 items-center sm:w-56'>
								<select
									id='travel-area'
									value={area}
									onChange={(e) => {
										setArea(e.target.value)
										sync({ area: e.target.value })
									}}
									className='h-full w-full cursor-pointer appearance-none bg-transparent pl-1 pr-12 text-[0.875rem] text-[#191713] outline-none'
								>
									<option value=''>All areas</option>
									{areas.map((a) => (
										<option key={a.slug} value={a.slug}>
											{a.name}
										</option>
									))}
								</select>
								<CaretDownIcon size={16} weight='bold' className='pointer-events-none absolute right-5 text-[#5c574c]' aria-hidden='true' />
							</span>
						</span>
					</form>
					{WAYS_IN.length ? (
					<nav aria-label='Plan the trip' className='mt-6 flex flex-wrap justify-center gap-2'>
						{WAYS_IN.map(({ href, label, icon: Glyph }) => (
							<Link
								key={href}
								href={href}
								className='inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] transition hover:border-white hover:bg-white hover:text-[#8f2328]'
							>
								<Glyph size={14} weight='bold' aria-hidden='true' /> {label}
							</Link>
						))}
					</nav>
					) : null}
				</div>
			</section>

			{/* ---- The categories ---- */}
			<div className='sticky top-[var(--sticky-top,0px)] z-20 border-b border-[var(--rule)] bg-[var(--paper)] transition-[top] duration-300'>
				<div className='bb-container flex items-center gap-6'>
					{/* Centred on the page where they fit, scrolling from the left where they do not (user decision). */}
					<div className='-mb-px flex min-w-0 flex-1 gap-9 overflow-x-auto pt-5 [scrollbar-width:none] lg:justify-center lg:gap-12 [&::-webkit-scrollbar]:hidden'>
						{[{ key: null as ExploreKind | null, label: 'All' }, ...kinds].map((k) => {
							const Glyph = k.key ? KIND_ICON[k.key] : SquaresFourIcon
							const active = kind === k.key
							const empty = k.key ? !counts[k.key] : false
							return (
								<button
									key={k.label}
									type='button'
									aria-pressed={active}
									disabled={empty}
									onClick={() => {
										setKind(k.key)
										sync({ kind: k.key })
									}}
									className={`flex shrink-0 cursor-pointer flex-col items-center gap-2 border-b-2 pb-3 font-[family-name:var(--font-display)] text-[0.59375rem] font-semibold uppercase tracking-[0.14em] transition disabled:cursor-default disabled:opacity-30 ${
										active ? 'border-[var(--accent)] text-[var(--ink)]' : 'border-transparent text-[var(--ink-3)] hover:border-[var(--rule)] hover:text-[var(--ink)]'
									}`}
								>
									<Glyph size={22} weight='duotone' className={active ? 'text-[var(--accent)]' : ''} aria-hidden='true' />
									{k.label}
								</button>
							)
						})}
					</div>
				</div>
			</div>

			{/* ---- The places ---- */}
			<section className='bb-container pb-20 pt-12 lg:pt-14'>
				{/* The count is not shown (user decision); a screen reader still hears it change. */}
				<p aria-live='polite' className='sr-only'>
					{shown.length} of {places.length} places
				</p>
				{shown.length ? (
					<div className='grid grid-cols-1 gap-x-8 gap-y-12 lg:gap-x-[48px] lg:gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{shown.map((p, i) => (
							<ExploreCard key={p.slug} place={p} priority={i < 4} />
						))}
					</div>
				) : (
					<div className='py-24 text-center'>
						<p className='!font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>No places match</p>
						<p className='mt-2 text-[0.875rem] text-[var(--ink-3)]'>Try another word, or clear the area and the category.</p>
					</div>
				)}
			</section>
		</div>
	)
}
