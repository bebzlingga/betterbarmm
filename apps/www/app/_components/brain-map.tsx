'use client'

import { ArrowUpRightIcon, BuildingsIcon, MapPinIcon, SidebarSimpleIcon, XIcon } from '@phosphor-icons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { BrainEdge, BrainNode, Thread } from '../_lib/brain'
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

	const thread = threads.find((t) => t.key === follow) ?? null
	const followLit = useMemo(() => (thread ? new Set(thread.lit) : null), [thread])

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
	const lit = (id: string) => (near ? near.has(id) : followLit ? followLit.has(id) : true)
	const edgeLit = (e: BrainEdge) => (near ? near.has(e.from) && near.has(e.to) && (e.from === focus || e.to === focus) : followLit ? followLit.has(e.from) && followLit.has(e.to) : true)

	const chosen = picked ? byId.get(picked) : null
	const links = chosen ? edges.filter((e) => e.from === chosen.id || e.to === chosen.id) : []
	const name = (id: string) => byId.get(id)?.label ?? id

	const pickers = [
		{ id: 'follow-town', label: 'Follow a town', icon: MapPinIcon, kind: 'town' as const, blank: `Pick one of ${threads.filter((t) => t.kind === 'town').length} towns and cities…` },
		{ id: 'follow-office', label: 'Follow an office', icon: BuildingsIcon, kind: 'office' as const, blank: `Pick one of ${threads.filter((t) => t.kind === 'office').length} ministries and offices…` },
	]

	return (
		// Details on the left and the globe on the right from a laptop up; the column folds away. On a phone the globe comes first.
		<div className={`grid gap-0 lg:h-full ${shown ? 'lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]'}`}>
			<div className='relative lg:order-2 lg:flex lg:min-h-0 lg:flex-col'>
				<button
					type='button'
					onClick={() => setShown(!shown)}
					aria-expanded={shown}
					aria-controls='brain-details'
					className='absolute top-4 left-4 z-10 flex items-center gap-1.5 border border-white/20 bg-black/30 px-3 py-2 text-[12.5px] font-semibold text-white/85 backdrop-blur transition hover:border-white hover:text-white'
				>
					<SidebarSimpleIcon size={16} weight='bold' aria-hidden='true' /> {shown ? 'Hide details' : 'Show details'}
				</button>
				<div className='h-[62vh] lg:h-auto lg:min-h-0 lg:flex-1'>
					<BrainGlobe nodes={nodes} edges={edges} lit={lit} edgeLit={edgeLit} picked={picked} onHover={setHover} onPick={setPicked} />
				</div>
				<ul className='mx-auto mt-2 flex max-w-[920px] shrink-0 flex-wrap justify-center gap-x-5 gap-y-1 px-4 pb-4 text-[12px] text-white/70'>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#7fa9aa]' /> Sources</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#e3ac3e]' /> Datasets</li>
					<li className='flex items-center gap-1.5'><span className='size-2.5 rounded-full bg-[#c3313b]' /> Workspaces</li>
					<li className='flex items-center gap-1.5'><span className='h-0 w-4 border-t border-dashed border-[#f1c453]' /> Shared keys</li>
				</ul>
			</div>

			<aside id='brain-details' hidden={!shown} className='border-t border-white/10 p-6 text-white lg:order-1 lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-r lg:bg-black/20 lg:p-8'>
				<div className='space-y-5'>
					{pickers.map((pk) => (
						<div key={pk.id}>
							<label htmlFor={pk.id} className='font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#f1c453]'>
								{pk.label}
							</label>
							<div className='mt-2 flex items-center gap-2 border border-white/20 bg-white/5 px-3'>
								<pk.icon size={15} className='shrink-0 text-white/60' aria-hidden='true' />
								<select
									id={pk.id}
									value={thread?.kind === pk.kind ? follow : ''}
									onChange={(e) => (setFollow(e.target.value), setPicked(null))}
									className='h-11 min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none [&>optgroup]:text-black [&>option]:text-black'
								>
									<option value=''>{pk.blank}</option>
									{[...new Set(threads.filter((t) => t.kind === pk.kind).map((t) => t.group))].map((g) => (
										<optgroup key={g} label={g}>
											{threads
												.filter((t) => t.kind === pk.kind && t.group === g)
												.map((t) => (
													<option key={t.key} value={t.key}>
														{t.title}
													</option>
												))}
										</optgroup>
									))}
								</select>
								{thread?.kind === pk.kind ? (
									<button type='button' onClick={() => setFollow('')} aria-label={`Clear: ${pk.label}`} className='text-white/60 hover:text-white'>
										<XIcon size={14} weight='bold' />
									</button>
								) : null}
							</div>
						</div>
					))}
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
						<p className='font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/50'>{thread.kicker}</p>
						<h3 className='mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.02em]'>{thread.title}</h3>
						<p className='mt-1 text-[13px] text-white/70'>Everything the estate holds about it, lit on the globe.</p>
						<dl className='mt-5 grid grid-cols-2 gap-px bg-white/10'>
							{spans(thread.facts).map(([k, v, wide]) => (
								<div key={k} className={`min-w-0 bg-[#1d080d] p-3 ${wide ? 'col-span-2' : ''}`}>
									<dt className='text-[11px] text-white/55'>{k}</dt>
									<dd className='mt-0.5 text-[14.5px] font-bold leading-snug break-words'>
										{v}
									</dd>
								</div>
							))}
						</dl>
						<p className='mt-6 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#f1c453]'>Where it appears</p>
						<ul className='mt-2 divide-y divide-white/10 border-y border-white/10'>
							{thread.links.map((l, i) => (
								<li key={i}>
									<Link href={l.href} className='group flex items-start gap-3 py-2.5 hover:bg-white/5'>
										<span className='w-28 shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-white/55'>{l.where}</span>
										<span className='min-w-0 flex-1 text-[13.5px] leading-snug text-white/90 group-hover:text-white'>{l.what}</span>
										<ArrowUpRightIcon size={13} weight='bold' className='mt-0.5 shrink-0 text-[#f1c453]' aria-hidden='true' />
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : (
					<div className='mt-8 space-y-4 text-[14px] leading-[1.65] text-white/80'>
						<p>
							<span className='font-bold text-white'>Drag</span> to turn the globe and <span className='font-bold text-white'>scroll</span> to zoom. <span className='font-bold text-white'>Hover</span> any node to light everything it touches, and <span className='font-bold text-white'>click</span> it for what it holds, how fresh it is, and what it links to.
						</p>
						<p>The pulses run the way the data does: from the sources on the outer shell, into the datasets, out through the workspaces, and to Jo, who answers from all of them.</p>
						<p>The gold dashed lines are the joins. One code per town and one ID per office are why a mayor, a contract and an incident in the same town can be read side by side. Follow one above to see it.</p>
					</div>
				)}
			</aside>
		</div>
	)
}
