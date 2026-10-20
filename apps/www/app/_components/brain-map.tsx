'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { BrainEdge, BrainNode, TownThread } from '../_lib/brain'

/* ============================================================
   The brain, drawn

   Jo at the centre; the workspaces she reads around her; the
   datasets that feed them further out; the sources those are read
   from on the outer ring. Pulses run inward along every link, the
   way the data does. Hover a node to light what it touches, click
   it for what it is, or follow one town to see every part of the
   estate that holds it.
   ============================================================ */

const C = 500
const RADIUS = { jo: 0, workspace: 175, dataset: 318, source: 448 } as const
const ORDER = ['w-legislation', 'w-budget', 'w-directory', 'w-procurement', 'w-lgu', 'w-election', 'w-incidents', 'w-places', 'w-crafts', 'w-discover']

type Placed = BrainNode & { x: number; y: number; a: number }

const at = (r: number, a: number) => ({ x: C + r * Math.cos(a), y: C + r * Math.sin(a) })
const mean = (as: number[]) => Math.atan2(as.reduce((s, a) => s + Math.sin(a), 0), as.reduce((s, a) => s + Math.cos(a), 0))

/** Workspaces evenly round the circle; each outer ring ordered by what it feeds, then spread evenly in that order. */
function layout(nodes: BrainNode[], edges: BrainEdge[]): Map<string, Placed> {
	const placed = new Map<string, Placed>()
	const start = -Math.PI / 2
	const ws = ORDER.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean)
	ws.forEach((n, i) => {
		const a = start + (i / ws.length) * Math.PI * 2
		placed.set(n.id, { ...n, a, ...at(RADIUS.workspace, a) })
	})
	const jo = nodes.find((n) => n.kind === 'jo')!
	placed.set(jo.id, { ...jo, a: 0, x: C, y: C })
	for (const kind of ['dataset', 'source'] as const) {
		const ring = nodes.filter((n) => n.kind === kind)
		const wanted = ring.map((n) => {
			const targets = edges.filter((e) => e.from === n.id && placed.has(e.to)).map((e) => placed.get(e.to)!.a)
			const a = targets.length ? mean(targets) : 0
			return { n, a: ((a - start) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) }
		})
		wanted.sort((p, q) => p.a - q.a)
		wanted.forEach(({ n }, i) => {
			const a = start + ((i + 0.5) / wanted.length) * Math.PI * 2
			placed.set(n.id, { ...n, a, ...at(RADIUS[kind], a) })
		})
	}
	return placed
}

/** A link bowed toward the centre, so the rings read as layers rather than spokes. */
function curve(p: Placed, q: Placed, kind: BrainEdge['kind']): string {
	const bend = kind === 'join' ? 0.35 : 0.82
	const mx = C + ((p.x + q.x) / 2 - C) * bend
	const my = C + ((p.y + q.y) / 2 - C) * bend
	return `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}`
}

const SIZE = { jo: 34, workspace: 15, dataset: 8, source: 6 }
const FILL = { jo: 'url(#jo)', workspace: '#c3313b', dataset: '#e3ac3e', source: '#7fa9aa' }
const KIND_LABEL = { jo: 'The assistant', workspace: 'Workspace', dataset: 'Dataset', source: 'Source' }

const ago = (iso?: string | null) =>
	iso ? `read ${new Date(`${iso}T00:00:00+08:00`).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })}` : null

export function BrainMap({ nodes, edges, threads }: { nodes: BrainNode[]; edges: BrainEdge[]; threads: TownThread[] }) {
	const placed = useMemo(() => layout(nodes, edges), [nodes, edges])
	const [hover, setHover] = useState<string | null>(null)
	const [picked, setPicked] = useState<string | null>(null)
	const [town, setTown] = useState<string>('')

	const thread = threads.find((t) => t.key === town) ?? null
	/** The workspaces one town appears in, and what feeds them. */
	const townLit = useMemo(() => {
		if (!thread) return null
		const ws = ['w-directory', 'w-lgu', thread.district && 'w-election', thread.notices && 'w-procurement', thread.incidents && 'w-incidents', thread.places.length && 'w-places'].filter(Boolean) as string[]
		const lit = new Set(['jo', ...ws])
		for (const e of edges) if (e.kind === 'feeds' && ws.includes(e.to) && e.from.startsWith('d-')) lit.add(e.from)
		return lit
	}, [thread, edges])

	const focus = hover ?? picked
	const near = useMemo(() => {
		if (!focus) return null
		const s = new Set([focus])
		for (const e of edges) {
			if (e.from === focus) s.add(e.to)
			if (e.to === focus) s.add(e.from)
		}
		return s
	}, [focus, edges])
	const lit = (id: string) => (near ? near.has(id) : townLit ? townLit.has(id) : true)
	const edgeLit = (e: BrainEdge) => (near ? near.has(e.from) && near.has(e.to) && (e.from === focus || e.to === focus) : townLit ? townLit.has(e.from) && townLit.has(e.to) : true)

	const chosen = picked ? placed.get(picked) : null
	const links = chosen ? edges.filter((e) => e.from === chosen.id || e.to === chosen.id) : []
	const name = (id: string) => placed.get(id)?.label ?? id

	return (
		// Details on the left and the map on the right from a laptop up; on a phone the map comes first.
		<div className='grid gap-0 lg:h-full lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]'>
			<div className='relative lg:order-2 lg:flex lg:min-h-0 lg:flex-col'>
				<svg viewBox='-90 0 1180 1000' role='img' aria-label='A map of BetterBARMM: its sources, datasets and workspaces, joined to Jo at the centre' className='mx-auto block w-full max-w-[920px] lg:min-h-0 lg:max-w-none lg:flex-1' onClick={() => setPicked(null)}>
					<defs>
						<radialGradient id='jo'>
							<stop offset='0' stopColor='#fff8e8' />
							<stop offset='.6' stopColor='#f1c453' />
							<stop offset='1' stopColor='#c8862a' />
						</radialGradient>
						<radialGradient id='halo'>
							<stop offset='0' stopColor='#f1c453' stopOpacity='.35' />
							<stop offset='1' stopColor='#f1c453' stopOpacity='0' />
						</radialGradient>
						<filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
							<feGaussianBlur stdDeviation='4' result='b' />
							<feMerge>
								<feMergeNode in='b' />
								<feMergeNode in='SourceGraphic' />
							</feMerge>
						</filter>
					</defs>

					{/* The rings themselves, faint. */}
					{[RADIUS.workspace, RADIUS.dataset, RADIUS.source].map((r) => (
						<circle key={r} cx={C} cy={C} r={r} fill='none' stroke='#ffffff' strokeOpacity='.05' strokeDasharray='2 6' />
					))}
					<circle cx={C} cy={C} r={120} fill='url(#halo)' />

					{edges.map((e, i) => {
						const p = placed.get(e.from)
						const q = placed.get(e.to)
						if (!p || !q) return null
						const on = edgeLit(e)
						const d = curve(p, q, e.kind)
						return (
							<g key={i} style={{ transition: 'opacity .3s' }} opacity={on ? 1 : 0.08}>
								<path
									d={d}
									fill='none'
									stroke={e.kind === 'join' ? '#f1c453' : e.kind === 'reads' ? '#e8848a' : '#d9b77a'}
									strokeOpacity={e.kind === 'join' ? 0.75 : 0.32}
									strokeWidth={e.kind === 'join' ? 1.6 : 1}
									strokeDasharray={e.kind === 'join' ? '4 4' : undefined}
								/>
								{e.kind !== 'join' ? (
									<circle r={e.kind === 'reads' ? 2.6 : 1.8} fill={e.kind === 'reads' ? '#ffd7a0' : '#f1c453'} opacity='.9' className='motion-reduce:hidden'>
										<animateMotion dur={`${3 + ((i * 7) % 5)}s`} begin={`${(i * 0.37) % 4}s`} repeatCount='indefinite' path={d} />
									</circle>
								) : null}
							</g>
						)
					})}

					{[...placed.values()].map((n) => {
						const on = lit(n.id)
						const r = n.kind === 'dataset' && n.count ? Math.min(16, SIZE.dataset + Math.log10(n.count) * 2) : SIZE[n.kind]
						const outer = n.kind === 'dataset' || n.kind === 'source'
						const lx = outer ? n.x + Math.cos(n.a) * (r + 8) : n.x
						const ly = outer ? n.y + Math.sin(n.a) * (r + 8) : n.y + r + 16
						const anchor = outer ? (Math.cos(n.a) > 0.2 ? 'start' : Math.cos(n.a) < -0.2 ? 'end' : 'middle') : 'middle'
						const fresh = n.fresh
						return (
							<g
								key={n.id}
								role='button'
								tabIndex={0}
								aria-label={`${n.label}${n.count ? `, ${n.count.toLocaleString('en-PH')} ${n.unit}` : ''}`}
								onMouseEnter={() => setHover(n.id)}
								onMouseLeave={() => setHover(null)}
								onFocus={() => setHover(n.id)}
								onBlur={() => setHover(null)}
								onClick={(ev) => {
									ev.stopPropagation()
									setPicked(n.id)
								}}
								onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), setPicked(n.id))}
								className='cursor-pointer outline-none'
								style={{ transition: 'opacity .3s' }}
								opacity={on ? 1 : 0.18}
							>
								{n.kind === 'jo' ? <circle cx={n.x} cy={n.y} r={r + 10} fill='#f1c453' opacity='.18' filter='url(#glow)' /> : null}
								{fresh ? <circle cx={n.x} cy={n.y} r={r + 4} fill='none' stroke='#9be3b0' strokeOpacity='.8' strokeWidth='1.2' /> : null}
								<circle cx={n.x} cy={n.y} r={r} fill={FILL[n.kind]} stroke={picked === n.id ? '#ffffff' : 'none'} strokeWidth='2' filter={n.kind === 'workspace' ? 'url(#glow)' : undefined} />
								{n.kind === 'jo' ? (
									<text x={n.x} y={n.y + 6} textAnchor='middle' className='fill-[#3a0f16] text-[18px] font-extrabold'>
										Jo
									</text>
								) : (
									<text
										x={lx}
										y={ly + (outer ? 4 : 0)}
										textAnchor={anchor}
										className={n.kind === 'workspace' ? 'fill-white text-[14px] font-bold' : n.kind === 'dataset' ? 'fill-[#f3dcae] text-[11.5px]' : 'fill-[#a9c6c6] text-[11px]'}
									>
										{n.label}
									</text>
								)}
							</g>
						)
					})}
				</svg>
				<ul className='mx-auto mt-2 flex max-w-[920px] shrink-0 flex-wrap justify-center gap-x-5 gap-y-1 px-4 text-[12px] text-white/70'>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#7fa9aa]' /> Sources</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#e3ac3e]' /> Datasets</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#c3313b]' /> Workspaces</li>
					<li className='flex items-center gap-1.5'><span className='h-0 w-4 border-t border-dashed border-[#f1c453]' /> Shared keys</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full border border-[#9be3b0]' /> Read this week</li>
				</ul>
			</div>

			<aside className='border-t border-white/10 p-6 text-white lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-r lg:p-8 lg:pl-0'>
				<label htmlFor='town' className='font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#f1c453]'>
					Follow a town
				</label>
				<div className='mt-2 flex items-center gap-2 border border-white/20 bg-white/5 px-3'>
					<MagnifyingGlassIcon size={15} className='shrink-0 text-white/60' aria-hidden='true' />
					<select id='town' value={town} onChange={(e) => (setTown(e.target.value), setPicked(null))} className='h-11 min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none [&>optgroup]:text-black [&>option]:text-black'>
						<option value=''>Pick one of {threads.length} towns and cities…</option>
						{[...new Set(threads.map((t) => t.province))].map((p) => (
							<optgroup key={p} label={p}>
								{threads
									.filter((t) => t.province === p)
									.map((t) => (
										<option key={t.key} value={t.key}>
											{t.name}
										</option>
									))}
							</optgroup>
						))}
					</select>
					{town ? (
						<button type='button' onClick={() => setTown('')} aria-label='Clear the town' className='text-white/60 hover:text-white'>
							<XIcon size={14} weight='bold' />
						</button>
					) : null}
				</div>

				{chosen ? (
					<div className='mt-8'>
						<p className='font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50'>{KIND_LABEL[chosen.kind]}</p>
						<h3 className='mt-1 text-[22px] font-extrabold leading-tight tracking-[-0.02em]'>{chosen.label}</h3>
						{chosen.count ? (
							<p className='mt-2 text-[28px] font-extrabold tabular-nums text-[#f1c453]'>
								{chosen.count.toLocaleString('en-PH')} <span className='text-[14px] font-semibold text-white/70'>{chosen.unit}</span>
							</p>
						) : null}
						<p className='mt-3 text-[14px] leading-[1.65] text-white/80'>{chosen.note}</p>
						{ago(chosen.date) ? <p className='mt-2 text-[12.5px] text-[#9be3b0]'>Last {ago(chosen.date)}</p> : null}
						{links.length ? (
							<div className='mt-5'>
								<p className='text-[12px] font-semibold text-white/60'>Linked to</p>
								<ul className='mt-1.5 flex flex-wrap gap-1.5'>
									{links.map((e, i) => {
										const other = e.from === chosen.id ? e.to : e.from
										return (
											<li key={i}>
												<button type='button' onClick={() => setPicked(other)} className='border border-white/20 px-2 py-1 text-[12px] text-white/85 hover:border-white hover:text-white'>
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
							<Link href={chosen.href} className='mt-5 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[#f1c453] hover:underline'>
								Open {chosen.label} <ArrowUpRightIcon size={13} weight='bold' />
							</Link>
						) : null}
					</div>
				) : thread ? (
					<div className='mt-8'>
						<p className='font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50'>{thread.isCity ? 'City' : 'Municipality'} · {thread.province}</p>
						<h3 className='mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.02em]'>{thread.name}</h3>
						<p className='mt-1 text-[13px] text-white/70'>Everything the estate holds about it, lit on the map.</p>
						<dl className='mt-5 grid grid-cols-2 gap-px bg-white/10'>
							{[
								['Mayor', thread.mayor ?? '—'],
								['Barangays', thread.barangays.toLocaleString('en-PH')],
								['Emergency lines', thread.lines ? `${thread.lines}${thread.email ? ' + email' : ''}` : thread.email ? 'Email only' : '—'],
								['District', thread.district ? `${thread.district}` : '—'],
								['Bid notices', thread.notices ? thread.notices.toLocaleString('en-PH') : '—'],
								['Incidents', thread.incidents ? `${thread.incidents} · ${thread.deaths} dead` : '—'],
							].map(([k, v]) => (
								<div key={k} className='bg-[#1d080d] p-3'>
									<dt className='text-[11px] text-white/55'>{k}</dt>
									<dd className='mt-0.5 text-[14.5px] font-bold leading-snug'>{v}</dd>
								</div>
							))}
						</dl>
						{thread.places.length ? (
							<p className='mt-4 text-[13px] leading-[1.6] text-white/80'>
								<span className='text-white/55'>Places: </span>
								{thread.places.join(', ')}
							</p>
						) : null}
						<div className='mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold text-[#f1c453]'>
							<Link href={thread.directory} className='inline-flex items-center gap-1 hover:underline'>
								In the Directory <ArrowUpRightIcon size={13} weight='bold' />
							</Link>
							<a href={thread.lgu} className='inline-flex items-center gap-1 hover:underline'>
								In Local Government <ArrowUpRightIcon size={13} weight='bold' />
							</a>
						</div>
					</div>
				) : (
					<div className='mt-8 space-y-4 text-[14px] leading-[1.65] text-white/80'>
						<p>
							<span className='font-bold text-white'>Hover</span> any node to light everything it touches. <span className='font-bold text-white'>Click</span> it for what it holds, how fresh it is, and what it links to.
						</p>
						<p>The pulses run the way the data does: from the sources on the outer ring, into the datasets, out through the workspaces, and to Jo, who answers from all of them.</p>
						<p>The gold dashed lines are the joins. One code per town and one ID per office are why a mayor, a contract and an incident in the same town can be read side by side.</p>
					</div>
				)}
			</aside>
		</div>
	)
}
