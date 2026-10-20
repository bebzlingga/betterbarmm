'use client'

import { ArrowUpRightIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { BrainEdge, BrainNode, TownThread } from '../_lib/brain'
import { BrainGlobe } from './brain-globe'

/* ============================================================
   The brain: what is lit, picked and followed

   The globe (brain-globe.tsx) draws it; this holds the state and the
   column beside it. Hover a node to light what it touches, click it
   for what it is, or follow one town to see every part of the
   estate that holds it.
   ============================================================ */

const KIND_LABEL = { jo: 'The assistant', workspace: 'Workspace', dataset: 'Dataset', source: 'Source' }

const ago = (iso?: string | null) =>
	iso ? `read ${new Date(`${iso}T00:00:00+08:00`).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })}` : null

export function BrainMap({ nodes, edges, threads }: { nodes: BrainNode[]; edges: BrainEdge[]; threads: TownThread[] }) {
	const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
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

	const chosen = picked ? byId.get(picked) : null
	const links = chosen ? edges.filter((e) => e.from === chosen.id || e.to === chosen.id) : []
	const name = (id: string) => byId.get(id)?.label ?? id

	return (
		// Details on the left and the map on the right from a laptop up; on a phone the map comes first.
		<div className='grid gap-0 lg:h-full lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]'>
			<div className='relative lg:order-2 lg:flex lg:min-h-0 lg:flex-col'>
				<div className='h-[62vh] lg:h-auto lg:min-h-0 lg:flex-1'>
					<BrainGlobe nodes={nodes} edges={edges} lit={lit} edgeLit={edgeLit} picked={picked} onHover={setHover} onPick={setPicked} />
				</div>
				<ul className='mx-auto mt-2 flex max-w-[920px] shrink-0 flex-wrap pb-4 justify-center gap-x-5 gap-y-1 px-4 text-[12px] text-white/70'>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#7fa9aa]' /> Sources</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#e3ac3e]' /> Datasets</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#c3313b]' /> Workspaces</li>
					<li className='flex items-center gap-1.5'><span className='h-0 w-4 border-t border-dashed border-[#f1c453]' /> Shared keys</li>
				</ul>
			</div>

			<aside className='border-t border-white/10 p-6 text-white lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-r lg:bg-black/20 lg:p-8'>
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
