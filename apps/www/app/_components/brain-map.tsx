'use client'

import { ArrowUpRightIcon, BrainIcon, BuildingsIcon, CursorClickIcon, HandGrabbingIcon, MagnifyingGlassIcon, MagnifyingGlassPlusIcon, MapPinIcon, SidebarSimpleIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { BrainEdge, BrainNode, Thread } from '../_lib/brain'
import { BrainFlat } from './brain-flat'
import { BrainGlobe } from './brain-globe'

/* ============================================================
   The brain: what is lit, picked and followed

   The globe (brain-globe.tsx) draws it; this holds the state and the
   column beside it. Hover a node to light what it touches, click it
   for what it is, or follow one town or office to see every part
   of the estate that holds it. The column folds away for the globe.
   ============================================================ */

const KIND_LABEL = { jo: 'The assistant', workspace: 'Workspace', dataset: 'Dataset', source: 'Source' }

const ago = (iso?: string | null) =>
	iso ? `read ${new Date(`${iso}T00:00:00+08:00`).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })}` : null

/** Which facts take a whole row: a long value (a minister's full name, an email), and the last one when it would sit alone. */
function spans(facts: [string, string][]): [string, string, boolean][] {
	let col = 0
	return facts.map(([k, v], i) => {
		const long = v.length > 18
		const wide = long || (i === facts.length - 1 && col === 0)
		col = wide ? 0 : (col + 1) % 2
		return [k, v, wide]
	})
}

export function BrainMap({ nodes, edges, threads }: { nodes: BrainNode[]; edges: BrainEdge[]; threads: Thread[] }) {
	const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
	const [hover, setHover] = useState<string | null>(null)
	const [picked, setPicked] = useState<string | null>(null)
	const [follow, setFollow] = useState<string>('')
	const [shown, setShown] = useState(true)
	const [view, setView] = useState<'3d' | '2d'>('3d')

	const thread = threads.find((t) => t.key === follow) ?? null
	const followLit = useMemo(() => (thread ? new Set(thread.lit) : null), [thread])

	/* Hover lights a node's neighbours. A pick lights its whole chain: everything
	   upstream of it to the sources and everything downstream to Jo, so a
	   workspace shows every dataset and source behind it. */
	const near = useMemo(() => {
		// Resting on the node just picked is still the pick, not a hover over it.
		if (hover && hover !== picked) {
			const s = new Set([hover])
			for (const e of edges) {
				if (e.from === hover) s.add(e.to)
				if (e.to === hover) s.add(e.from)
			}
			return { ids: s, from: hover, chain: false }
		}
		if (!picked) return null
		const s = new Set([picked])
		const walk = (dir: 'up' | 'down') => {
			const queue = [picked]
			while (queue.length) {
				const at = queue.shift()!
				for (const e of edges) {
					if (e.kind === 'join') continue
					const next = dir === 'up' ? (e.to === at ? e.from : null) : e.from === at ? e.to : null
					if (next && !s.has(next)) {
						s.add(next)
						queue.push(next)
					}
				}
			}
		}
		// Jo reads everything, so walking up from Jo is the whole brain; walking down from her is nothing.
		walk('up')
		if (picked !== 'jo') walk('down')
		return { ids: s, from: picked, chain: true }
	}, [hover, picked, edges])
	const lit = (id: string) => (near ? near.ids.has(id) : followLit ? followLit.has(id) : true)
	const edgeLit = (e: BrainEdge) =>
		near
			? near.chain
				? e.kind !== 'join' && near.ids.has(e.from) && near.ids.has(e.to)
				: near.ids.has(e.from) && near.ids.has(e.to) && (e.from === near.from || e.to === near.from)
			: followLit
				? followLit.has(e.from) && followLit.has(e.to)
				: true

	const chosen = picked ? byId.get(picked) : null
	const links = chosen ? edges.filter((e) => e.from === chosen.id || e.to === chosen.id) : []
	const name = (id: string) => byId.get(id)?.label ?? id


	// 3D or 2D, above the zoom buttons on the globe and in the same corner on the flat map.
	// One button: it shows the view in use, and a click turns to the other.
	const switcher = (
		<button
			type='button'
			onClick={() => setView(view === '3d' ? '2d' : '3d')}
			aria-label={`Showing ${view.toUpperCase()}; switch to ${view === '3d' ? '2D' : '3D'}`}
			title={`Switch to ${view === '3d' ? '2D' : '3D'}`}
			className='mb-1.5 flex size-10 items-center justify-center rounded-full bg-[#f1c453] font-[family-name:var(--font-display)] text-[0.6875rem] font-bold text-[#10161b] transition hover:bg-white'
		>
			{view.toUpperCase()}
		</button>
	)

	return (
		// Details on the left and the globe on the right from a laptop up; the column folds away. On a phone the globe comes first.
		<div className={`grid gap-0 lg:h-full ${shown ? 'lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]'}`}>
			<div className='relative lg:order-2 lg:flex lg:min-h-0 lg:flex-col'>
				<button
					type='button'
					onClick={() => setShown(!shown)}
					aria-expanded={shown}
					aria-controls='brain-details'
					className='absolute top-5 left-5 z-10 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[0.78125rem] font-semibold text-white/85 transition hover:bg-white hover:text-[#10161b]'
				>
					<SidebarSimpleIcon size={16} weight='bold' aria-hidden='true' /> {shown ? 'Hide details' : 'Show details'}
				</button>
				<div className='relative h-[62vh] lg:h-auto lg:min-h-0 lg:flex-1'>
					{view === '3d' ? (
						<BrainGlobe nodes={nodes} edges={edges} lit={lit} edgeLit={edgeLit} picked={picked} onHover={setHover} onPick={setPicked} toolbar={switcher} />
					) : (
						<BrainFlat nodes={nodes} edges={edges} lit={lit} edgeLit={edgeLit} picked={picked} onHover={setHover} onPick={setPicked} toolbar={switcher} />
					)}
				</div>
				<ul className='pointer-events-none flex flex-wrap justify-center gap-2 px-4 pt-2 pb-4 text-[0.75rem] text-white/75 lg:absolute lg:inset-x-0 lg:bottom-0 lg:pt-0 lg:pb-5 [&>li]:rounded-full [&>li]:bg-white/[0.07] [&>li]:px-3 [&>li]:py-1'>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#7fa9aa]' /> Sources</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#e3ac3e]' /> Datasets</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#c3313b]' /> Workspaces</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#a77be6]' /> Projects</li>
					<li className='flex items-center gap-1.5'><span className='h-0 w-4 border-t border-dashed border-[#f1c453]' /> Shared keys</li>
				</ul>
			</div>

			<aside id='brain-details' hidden={!shown} className='border-t border-white/10 p-6 text-white [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.2)_transparent] lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-r lg:bg-white/[0.03] lg:p-8'>
				{/* The Brain's name and what it holds, in the travel look (user decision: the Brain redesigned). */}
				<div className='flex items-center gap-3'>
					<span className='grid size-11 place-items-center rounded-2xl bg-[#f1c453]/15 text-[#f1c453]'>
						<BrainIcon size={22} weight='duotone' aria-hidden='true' />
					</span>
					<span>
						<span className='block font-[family-name:var(--font-display)] text-[1.25rem] font-bold leading-tight tracking-[-0.02em]'>The Brain</span>
						<span className='block text-[0.78125rem] text-white/55'>Every source, dataset and workspace, and how they join</span>
					</span>
				</div>
				<ul className='mt-5 flex flex-wrap gap-1.5'>
					{(
						[
							['source', 'sources', '#7fa9aa'],
							['dataset', 'datasets', '#e3ac3e'],
							['workspace', 'workspaces', '#c3313b'],
							['project', 'projects', '#a77be6'],
						] as const
					).map(([kind, noun, color]) => (
						<li key={kind} className='inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[0.75rem] text-white/80'>
							<span className='size-2 rounded-full' style={{ background: color }} aria-hidden='true' />
							<span className='num font-semibold text-white'>{nodes.filter((n) => (kind === 'project' ? n.project : n.kind === kind && !n.project)).length}</span> {noun}
						</li>
					))}
				</ul>
				<div className='mt-7'>
				<FollowSearch threads={threads} value={thread} onChoose={(key) => (setFollow(key), setPicked(null))} />
				</div>

				{chosen ? (
					<div className='mt-8'>
						<p className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/50'>{chosen.project ? 'Project' : KIND_LABEL[chosen.kind]}</p>
						<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-tight tracking-[-0.025em]'>{chosen.label}</h3>
						{chosen.count ? (
							<p className='mt-2 text-[1.75rem] font-extrabold tabular-nums text-[#f1c453]'>
								{chosen.count.toLocaleString('en-PH')} <span className='text-[0.875rem] font-semibold text-white/70'>{chosen.unit}</span>
							</p>
						) : null}
						<p className='mt-3 text-[0.875rem] leading-[1.65] text-white/80'>{chosen.note}</p>
						{ago(chosen.date) ? <p className='mt-2 text-[0.78125rem] text-[#9be3b0]'>Last {ago(chosen.date)}</p> : null}
						{links.length ? (
							<div className='mt-5'>
								<p className='text-[0.75rem] font-semibold text-white/60'>Linked to</p>
								<ul className='mt-1.5 flex flex-wrap gap-1.5'>
									{links.map((e, i) => {
										const other = e.from === chosen.id ? e.to : e.from
										return (
											<li key={i}>
												<button type='button' onClick={() => setPicked(other)} className='rounded-full bg-white/[0.07] px-3 py-1 text-[0.75rem] text-white/85 transition hover:bg-white hover:text-[#10161b]'>
													{name(other)}
													{e.label ? <span className='text-[#f1c453]'> · {e.label}</span> : null}
												</button>
											</li>
										)
									})}
								</ul>
							</div>
						) : null}
						{chosen.href ? (
							<Link href={chosen.href} className='mt-5 inline-flex items-center gap-1 text-[0.84375rem] font-semibold text-[#f1c453] hover:underline'>
								Open {chosen.label} <ArrowUpRightIcon size={13} weight='bold' />
							</Link>
						) : null}
					</div>
				) : thread ? (
					<div className='mt-8'>
						<p className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/50'>{thread.kicker}</p>
						<h3 className='mt-1 font-[family-name:var(--font-display)] text-[1.625rem] font-bold leading-tight tracking-[-0.025em]'>{thread.title}</h3>
						<p className='mt-1 text-[0.8125rem] text-white/70'>Everything the estate holds about it, lit on the globe.</p>
						<dl className='mt-5 grid grid-cols-2 gap-2'>
							{spans(thread.facts).map(([k, v, wide]) => (
								<div key={k} className={`min-w-0 rounded-xl bg-white/[0.06] p-3 ${wide ? 'col-span-2' : ''}`}>
									<dt className='text-[0.6875rem] text-white/55'>{k}</dt>
									<dd className='mt-0.5 text-[0.90625rem] font-bold leading-snug break-words'>
										{v}
									</dd>
								</div>
							))}
						</dl>
						<p className='mt-7 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#f1c453]'>Where it appears</p>
						<ul className='mt-2 divide-y divide-white/10 rounded-2xl bg-white/[0.04] px-3'>
							{thread.links.map((l, i) => (
								<li key={i}>
									<Link href={l.href} className='group flex items-start gap-3 py-2.5'>
										<span className='w-24 shrink-0 pt-px text-[0.625rem] font-semibold uppercase leading-snug tracking-[0.08em] text-white/55'>{l.where}</span>
										<span className='min-w-0 flex-1 text-[0.84375rem] leading-snug text-white/90 group-hover:text-white'>{l.what}</span>
										<ArrowUpRightIcon size={13} weight='bold' className='mt-0.5 shrink-0 text-[#f1c453]' aria-hidden='true' />
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : (
					<div className='mt-8 space-y-4 text-[0.875rem] leading-[1.65] text-white/80'>
						<ul className='grid gap-2'>
							{(
								[
									[HandGrabbingIcon, 'Drag', 'to turn the globe'],
									[MagnifyingGlassPlusIcon, 'Scroll', 'to zoom'],
									[CursorClickIcon, 'Hover or click', 'a node for what it holds and links to'],
								] as const
							).map(([Glyph, verb, rest]) => (
								<li key={verb} className='flex items-center gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5'>
									<Glyph size={18} weight='duotone' className='shrink-0 text-[#f1c453]' aria-hidden='true' />
									<span>
										<span className='font-semibold text-white'>{verb}</span> {rest}
									</span>
								</li>
							))}
						</ul>
						<p>The pulses run the way the data does: from the sources on the outer shell, into the datasets, out through the workspaces, and to Jo, who answers from all of them.</p>
						<p>The gold dashed lines are the joins. One code per town and one ID per office are why a mayor, a contract and an incident in the same town can be read side by side. Follow one above to see it.</p>
					</div>
				)}
			</aside>
		</div>
	)
}

const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** One search for a town or an office: type, then pick with the arrows and Enter, or a click. */
function FollowSearch({ threads, value, onChoose }: { threads: Thread[]; value: Thread | null; onChoose: (key: string) => void }) {
	const [q, setQ] = useState('')
	const [open, setOpen] = useState(false)
	const [at, setAt] = useState(0)
	const words = fold(q).split(/\s+/).filter(Boolean)
	const hits = words.length
		? threads.filter((t) => words.every((w) => fold(`${t.title} ${t.group} ${t.kind === 'town' ? 'town city municipality' : 'office ministry'}`).includes(w))).slice(0, 8)
		: []
	const choose = (t: Thread) => {
		onChoose(t.key)
		setQ('')
		setOpen(false)
	}
	return (
		<div className='relative'>
			<label htmlFor='follow' className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#f1c453]'>
				Follow a town or an office
			</label>
			<div className='mt-2 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 focus-within:border-white/50'>
				<MagnifyingGlassIcon size={15} className='shrink-0 text-white/60' aria-hidden='true' />
				<input
					id='follow'
					type='search'
					autoComplete='off'
					role='combobox'
					aria-expanded={open && hits.length > 0}
					aria-controls='follow-list'
					value={q}
					placeholder={value ? value.title : `${threads.filter((t) => t.kind === 'town').length} towns, ${threads.filter((t) => t.kind === 'office').length} offices…`}
					onChange={(e) => (setQ(e.target.value), setOpen(true), setAt(0))}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 120)}
					onKeyDown={(e) => {
						if (e.key === 'ArrowDown' && hits.length) {
							e.preventDefault()
							setAt((at + 1) % hits.length)
						} else if (e.key === 'ArrowUp' && hits.length) {
							e.preventDefault()
							setAt((at - 1 + hits.length) % hits.length)
						} else if (e.key === 'Enter' && hits[at]) {
							e.preventDefault()
							choose(hits[at])
						} else if (e.key === 'Escape' && open && q) {
							// Escape closes the list first, and only then the dialog.
							e.preventDefault()
							setOpen(false)
						}
					}}
					className='h-11 min-w-0 flex-1 bg-transparent text-[0.875rem] text-white outline-none placeholder:text-white/55 [&::-webkit-search-cancel-button]:hidden'
				/>
				{value || q ? (
					<button type='button' onClick={() => (setQ(''), onChoose(''))} aria-label='Clear' className='text-white/60 hover:text-white'>
						<XIcon size={14} weight='bold' />
					</button>
				) : null}
			</div>
			{open && hits.length ? (
				<ul id='follow-list' role='listbox' className='absolute inset-x-0 top-full z-20 mt-1.5 rounded-2xl border border-white/15 bg-[#161d24] p-1 shadow-[0_20px_40px_-20px_rgba(0,0,0,.9)]'>
					{hits.map((t, i) => (
						<li key={t.key} role='option' aria-selected={i === at}>
							<button
								type='button'
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => choose(t)}
								onMouseEnter={() => setAt(i)}
								className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${i === at ? 'bg-white/10' : ''}`}
							>
								{t.kind === 'town' ? <MapPinIcon size={14} className='shrink-0 text-[#f1c453]' aria-hidden='true' /> : <BuildingsIcon size={14} className='shrink-0 text-[#e8848a]' aria-hidden='true' />}
								<span className='min-w-0 flex-1'>
									<span className='block truncate text-[0.84375rem] font-semibold text-white'>{t.title}</span>
									<span className='block text-[0.71875rem] text-white/55'>{t.kicker}</span>
								</span>
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}
