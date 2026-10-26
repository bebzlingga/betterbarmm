'use client'

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

/* The catalogue's search and filters: one bar above the places, a search box on the left and a dropdown for each filter on the right,
   the places under it in their kinds as before, narrowed as the reader types or ticks. The cards are drawn on
   the server and handed in by slug, so only this small index comes to the browser. */

export type PlaceIndex = { slug: string; kind: string; area: string; text: string }

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

type Option = { id: string; label: string; n: number }

/** A filter as a dropdown of checkboxes; its button names what is picked. One open at a time, shut by a click outside or Escape. */
function Dropdown({ name, options, on, toggle, clear, open, setOpen }: { name: string; options: Option[]; on: Set<string>; toggle: (id: string) => void; clear: () => void; open: boolean; setOpen: (open: boolean) => void }) {
	const box = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!open) return
		const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
		const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
		document.addEventListener('pointerdown', away)
		document.addEventListener('keydown', esc)
		return () => {
			document.removeEventListener('pointerdown', away)
			document.removeEventListener('keydown', esc)
		}
	}, [open, setOpen])
	const picked = options.filter((o) => on.has(o.id))
	const value = !picked.length ? 'All' : picked.length === 1 ? picked[0]!.label : `${picked.length} picked`
	return (
		<div ref={box} className='relative'>
			<button
				type='button'
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				className={`group flex h-11 w-full cursor-pointer items-center gap-2 border px-3.5 text-left text-[0.875rem] transition sm:w-auto ${picked.length ? 'border-[#1f6f78] bg-[#1f6f78] text-white' : open ? 'border-[#1f6f78] bg-[#eef4f3]' : 'border-[#c9d8d6] bg-white hover:border-[#8aa3a9]'}`}
			>
				<span className={picked.length ? 'text-white/75' : 'text-[#4d6670]'}>{name}</span>
				<span className={`min-w-0 flex-1 truncate font-semibold sm:max-w-[11rem] ${picked.length ? 'text-white' : 'text-[#13303a]'}`}>{value}</span>
				<CaretDownIcon size={13} weight='bold' className={`shrink-0 transition ${picked.length ? 'text-white' : 'text-[#4d6670]'} ${open ? 'rotate-180' : ''}`} aria-hidden='true' />
			</button>
			{open ? (
				<div className='absolute left-0 top-full z-30 sm:left-auto sm:right-0 mt-1 w-full min-w-[16rem] border border-[#c9d8d6] bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(19,48,58,0.35)] sm:w-[17rem]'>
					<ul className='max-h-[min(60vh,24rem)] overflow-y-auto'>
						{options.map((o) => {
							const checked = on.has(o.id)
							return (
								<li key={o.id}>
									<button type='button' role='menuitemcheckbox' aria-checked={checked} onClick={() => toggle(o.id)} className={`flex w-full cursor-pointer items-center gap-2.5 px-2.5 py-2 text-left text-[0.875rem] hover:bg-[#eef4f3] ${o.n || checked ? 'text-[#13303a]' : 'text-[#8aa3a9]'}`}>
										<span className={`grid size-4 shrink-0 place-items-center border ${checked ? 'border-[#1f6f78] bg-[#1f6f78] text-white' : 'border-[#8aa3a9] bg-white'}`}>{checked ? <CheckIcon size={11} weight='bold' aria-hidden='true' /> : null}</span>
										<span className='flex-1'>{o.label}</span>
										<span className='tabular-nums text-[0.78125rem] text-[#8aa3a9]'>{o.n}</span>
									</button>
								</li>
							)
						})}
					</ul>
					{picked.length ? (
						<button type='button' onClick={clear} className='mt-1 w-full cursor-pointer border-t border-[#e3ecea] px-2.5 pb-1 pt-2 text-left text-[0.8125rem] font-semibold text-[#1f6f78] hover:text-[#13303a]'>
							Clear {name.toLowerCase()}
						</button>
					) : null}
				</div>
			) : null}
		</div>
	)
}

export function PlacesBrowser({
	index,
	cards,
	kinds,
	areas,
}: {
	index: PlaceIndex[]
	cards: Record<string, ReactNode>
	kinds: { id: string; label: string }[]
	areas: { id: string; label: string }[]
}) {
	const [q, setQ] = useState('')
	const query = useDeferredValue(q)
	const [types, setTypes] = useState<Set<string>>(new Set())
	const [where, setWhere] = useState<Set<string>>(new Set())
	const [menu, setMenu] = useState<'type' | 'area' | null>(null)
	const flip = (set: Set<string>, id: string) => {
		const next = new Set(set)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		return next
	}

	const words = fold(query).split(/\s+/).filter(Boolean)
	const matches = (p: PlaceIndex, skip?: 'kind' | 'area') =>
		(skip === 'kind' || !types.size || types.has(p.kind)) &&
		(skip === 'area' || !where.size || where.has(p.area)) &&
		words.every((w) => p.text.includes(w))
	const shown = useMemo(() => index.filter((p) => matches(p)), [index, types, where, query]) // eslint-disable-line react-hooks/exhaustive-deps
	// Each count says what ticking it would show, given the other filters.
	const kindCount = (id: string) => index.filter((p) => p.kind === id && matches(p, 'kind')).length
	const areaCount = (id: string) => index.filter((p) => p.area === id && matches(p, 'area')).length
	const filtered = !!(words.length || types.size || where.size)
	const clear = () => (setQ(''), setTypes(new Set()), setWhere(new Set()))

	return (
		<div>
			<div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
				<label className='relative block sm:w-[19rem]'>
					<span className='sr-only'>Search the places</span>
					<MagnifyingGlassIcon size={16} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6670]' aria-hidden='true' />
					<input
						type='search'
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder='Search a place or town'
						className='h-11 w-full border border-[#c9d8d6] bg-white pl-9 pr-3 text-[0.90625rem] text-[#13303a] placeholder:text-[#8aa3a9] focus:border-[#1f6f78] focus:outline-none'
					/>
				</label>
				<div className='grid grid-cols-2 gap-2 sm:ml-auto sm:flex'>
					<Dropdown name='Type' options={kinds.map((k) => ({ ...k, n: kindCount(k.id) }))} on={types} toggle={(id) => setTypes(flip(types, id))} clear={() => setTypes(new Set())} open={menu === 'type'} setOpen={(o) => setMenu(o ? 'type' : null)} />
					<Dropdown name='Location' options={areas.map((a) => ({ ...a, n: areaCount(a.id) }))} on={where} toggle={(id) => setWhere(flip(where, id))} clear={() => setWhere(new Set())} open={menu === 'area'} setOpen={(o) => setMenu(o ? 'area' : null)} />
				</div>
				{filtered ? (
					<button type='button' onClick={clear} className='inline-flex cursor-pointer items-center gap-1 px-1 text-[0.8125rem] font-semibold text-[#1f6f78] hover:text-[#13303a] sm:order-none'>
						<XIcon size={12} weight='bold' aria-hidden='true' /> Clear all
					</button>
				) : null}
			</div>

			{filtered ? <p className='mt-4 text-[0.84375rem] text-[#4d6670]'>{shown.length ? `${shown.length} of ${index.length} places` : 'No place matches. Try fewer filters.'}</p> : null}

			<div className='mt-10'>
				{kinds.map((k) => {
					const list = shown.filter((p) => p.kind === k.id)
					if (!list.length) return null
					return (
						<section key={k.id} id={k.id} aria-labelledby={`h-${k.id}`} className='mb-16 scroll-mt-24 last:mb-0'>
							<h2 id={`h-${k.id}`} className='text-[1.75rem] font-extrabold tracking-[-0.02em]'>
								{k.label} <span className='text-[#8aa3a9]'>{list.length}</span>
							</h2>
							<ul className='mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
								{list.map((p) => (
									<li key={p.slug}>{cards[p.slug]}</li>
								))}
							</ul>
						</section>
					)
				})}
			</div>
		</div>
	)
}
