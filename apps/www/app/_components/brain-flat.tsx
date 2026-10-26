'use client'

import { ArrowsInIcon, BrainIcon, CircleDashedIcon, MinusIcon, PlusIcon, TreeStructureIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BrainEdge, BrainNode } from '../_lib/brain'

/* ============================================================
   The brain, flat

   The 2D view beside the globe: the same rings seen from above —
   Jo at the centre, the workspaces, the datasets, the sources —
   with the links bowed toward the centre and pulses running in.
   Or, at the toggle, laid out in columns: Jo on the left, then the
   workspaces, the datasets and the sources, the pulses running in to her.
   It shares the globe's props, so hover, pick and follow work the
   same on either.
   ============================================================ */

const C = 500
const RADIUS = { jo: 0, workspace: 175, dataset: 318, source: 448 } as const
const ORDER = ['w-legislation', 'w-budget', 'w-directory', 'w-services', 'w-procurement', 'w-lgu', 'w-election', 'w-incidents', 'w-preparedness', 'w-places', 'w-crafts', 'w-discover']

type Layout = 'rings' | 'columns'
/** A node where it sits, and where its label goes. */
type Placed = BrainNode & { x: number; y: number; a: number; lx: number; ly: number; anchor: 'start' | 'middle' | 'end' }

const at = (r: number, a: number) => ({ x: C + r * Math.cos(a), y: C + r * Math.sin(a) })
const mean = (as: number[]) => Math.atan2(as.reduce((s, a) => s + Math.sin(a), 0), as.reduce((s, a) => s + Math.cos(a), 0))

/** A node's radius as drawn: a dataset grows with its count. */
const radius = (n: BrainNode) => (n.kind === 'dataset' && n.count ? Math.min(16, SIZE.dataset + Math.log10(n.count) * 2) : SIZE[n.kind])

/** Workspaces evenly round the circle; each outer ring ordered by what it feeds, then spread evenly in that order. */
function rings(nodes: BrainNode[], edges: BrainEdge[]): Map<string, Placed> {
	const placed = new Map<string, Placed>()
	// A ring node's label points away from the centre; a workspace's sits under it.
	const put = (n: BrainNode, a: number, x: number, y: number) => {
		const r = radius(n)
		const outer = n.kind === 'dataset' || n.kind === 'source'
		const c = Math.cos(a)
		placed.set(n.id, {
			...n, a, x, y,
			lx: outer ? x + c * (r + 8) : x,
			ly: outer ? y + Math.sin(a) * (r + 8) + 4 : y + r + 16,
			anchor: outer ? (c > 0.2 ? 'start' : c < -0.2 ? 'end' : 'middle') : 'middle',
		})
	}
	const start = -Math.PI / 2
	const ws = ORDER.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean)
	ws.forEach((n, i) => {
		const a = start + (i / ws.length) * Math.PI * 2
		const p = at(RADIUS.workspace, a)
		put(n, a, p.x, p.y)
	})
	const jo = nodes.find((n) => n.kind === 'jo')!
	put(jo, 0, C, C)
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
			const p = at(RADIUS[kind], a)
			put(n, a, p.x, p.y)
		})
	}
	return placed
}

/* In columns, from Jo on the left out to the sources on the right. Each column is
   ordered by where what it feeds sits, so the links cross as little as they can. */
const COL = { jo: 0, workspace: 280, dataset: 640, source: 1000 } as const
const TALL = 720
function columns(nodes: BrainNode[], edges: BrainEdge[]): Map<string, Placed> {
	const placed = new Map<string, Placed>()
	const put = (n: BrainNode, y: number) => {
		const x = COL[n.kind]
		const r = radius(n)
		// Datasets and sources are labelled to their right, a workspace under it.
		const side = n.kind === 'source' || n.kind === 'dataset' ? 'start' : 'middle'
		placed.set(n.id, { ...n, a: 0, x, y, lx: side === 'start' ? x + r + 8 : x, ly: side === 'middle' ? y + r + 16 : y + 4, anchor: side })
	}
	const spread = (list: BrainNode[]) => list.forEach((n, i) => put(n, ((i + 0.5) / list.length) * TALL))
	spread(ORDER.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean))
	put(nodes.find((n) => n.kind === 'jo')!, TALL / 2)
	for (const kind of ['dataset', 'source'] as const) {
		const col = nodes.filter((n) => n.kind === kind)
		const y = (n: BrainNode) => {
			const ys = edges.filter((e) => e.from === n.id && placed.has(e.to)).map((e) => placed.get(e.to)!.y)
			return ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : TALL / 2
		}
		spread(col.map((n) => ({ n, y: y(n) })).sort((p, q) => p.y - q.y).map((p) => p.n))
	}
	return placed
}

/** A link bowed toward the centre, so the rings read as layers rather than spokes; in columns, an S from one to the next. */
function curve(p: Placed, q: Placed, kind: BrainEdge['kind'], mode: Layout): string {
	const f = (v: number) => v.toFixed(1)
	if (mode === 'columns') {
		// A join runs between two workspaces in the same column: an arc out toward Jo.
		if (kind === 'join') return `M${f(p.x)},${f(p.y)} Q${f(p.x - 40 - Math.abs(q.y - p.y) * 0.35)},${f((p.y + q.y) / 2)} ${f(q.x)},${f(q.y)}`
		const mx = (p.x + q.x) / 2
		return `M${f(p.x)},${f(p.y)} C${f(mx)},${f(p.y)} ${f(mx)},${f(q.y)} ${f(q.x)},${f(q.y)}`
	}
	const bend = kind === 'join' ? 0.35 : 0.82
	const mx = C + ((p.x + q.x) / 2 - C) * bend
	const my = C + ((p.y + q.y) / 2 - C) * bend
	return `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${q.x.toFixed(1)},${q.y.toFixed(1)}`
}

const SIZE = { jo: 34, workspace: 15, dataset: 8, source: 6 }
const FILL = { jo: 'url(#jo)', workspace: '#c3313b', dataset: '#e3ac3e', source: '#7fa9aa' }
type Props = {
	nodes: BrainNode[]
	edges: BrainEdge[]
	lit: (id: string) => boolean
	edgeLit: (e: BrainEdge) => boolean
	picked: string | null
	onHover: (id: string | null) => void
	onPick: (id: string | null) => void
	/** Drawn above the zoom buttons: the 3D / 2D switch. */
	toolbar?: React.ReactNode
}

/** The whole map in each layout; how far in and out it may go follows from it. */
const HOMES = { rings: { x: -90, y: 0, w: 1180, h: 1000 }, columns: { x: -110, y: -50, w: 1340, h: TALL + 110 } }

export function BrainFlat({ nodes, edges, lit, edgeLit, picked, onHover, onPick, toolbar }: Props) {
	const [mode, setMode] = useState<Layout>('rings')
	const HOME = HOMES[mode]
	const CLOSEST = HOME.w / 6
	const FARTHEST = HOME.w * 1.3
	const placed = useMemo(() => (mode === 'rings' ? rings : columns)(nodes, edges), [nodes, edges, mode])
	const svg = useRef<SVGSVGElement>(null)
	const [vb, setVb] = useState(HOMES.rings)
	const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
	const dragged = useRef(false)

	/** A screen point in the map's own units. */
	const toMap = (clientX: number, clientY: number) => {
		const el = svg.current!
		const pt = el.createSVGPoint()
		pt.x = clientX
		pt.y = clientY
		return pt.matrixTransform(el.getScreenCTM()!.inverse())
	}
	/* Where the view is heading. Zooming, the buttons and a pick all move this,
	   and every frame the view eases a little closer to it, so nothing jumps;
	   a drag moves both at once, so the map stays under the pointer. */
	const vbRef = useRef(vb)
	const goal = useRef(HOMES.rings)
	const raf = useRef(0)
	const show = (v: typeof HOMES.rings) => {
		vbRef.current = v
		setVb(v)
	}
	const run = () => {
		if (raf.current) return
		let last = performance.now()
		const step = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000)
			last = now
			const k = 1 - Math.exp(-dt * 13)
			const v = vbRef.current
			const g = goal.current
			const next = { x: v.x + (g.x - v.x) * k, y: v.y + (g.y - v.y) * k, w: v.w + (g.w - v.w) * k, h: v.h + (g.h - v.h) * k }
			if (Math.abs(next.x - g.x) + Math.abs(next.y - g.y) + Math.abs(next.w - g.w) < 0.5) {
				show(g)
				raf.current = 0
				return
			}
			show(next)
			raf.current = requestAnimationFrame(step)
		}
		raf.current = requestAnimationFrame(step)
	}
	const glideTo = (to: typeof HOMES.rings) => {
		goal.current = to
		run()
	}
	/** Zoom by f around a point of the map (the centre of the view by default), from where the view is heading. */
	const zoom = (f: number, at?: { x: number; y: number }) => {
		const v = goal.current
		const w = Math.min(FARTHEST, Math.max(CLOSEST, v.w * f))
		const k = w / v.w
		const p = at ?? { x: v.x + v.w / 2, y: v.y + v.h / 2 }
		glideTo({ x: p.x - (p.x - v.x) * k, y: p.y - (p.y - v.y) * k, w, h: v.h * k })
	}
	const panBy = (dx: number, dy: number) => {
		goal.current = { ...goal.current, x: goal.current.x - dx, y: goal.current.y - dy }
		const v = vbRef.current
		show({ ...v, x: v.x - dx, y: v.y - dy })
	}
	useEffect(
		() => () => {
			cancelAnimationFrame(raf.current)
			// Cleared too, or a remount (React runs effects twice in development) finds a stale frame and never glides again.
			raf.current = 0
		},
		[],
	)

	// A pick lights its chain where the view already is; only a change of layout moves the view, back to the whole map.
	useEffect(() => {
		glideTo(HOMES[mode])
		// glideTo only moves refs, so it need not be a dependency.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode])

	// The wheel zooms toward the pointer. Not passive, so the dialog does not scroll instead.
	useEffect(() => {
		const el = svg.current!
		const wheel = (e: WheelEvent) => {
			e.preventDefault()
			const p = toMap(e.clientX, e.clientY)
			const delta = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY
			zoom(Math.exp(Math.max(-120, Math.min(120, delta)) * 0.0022), { x: p.x, y: p.y })
		}
		el.addEventListener('wheel', wheel, { passive: false })
		return () => el.removeEventListener('wheel', wheel)
		// zoom only moves refs, so it need not be a dependency.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const button = 'flex size-9 items-center justify-center border border-white/20 bg-black/30 text-white/85 backdrop-blur transition hover:border-white hover:text-white'
	return (
	<div className='relative h-full w-full'>
	<svg
		ref={svg}
		viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
		role='img'
		aria-label='A map of BetterBARMM: its sources, datasets and workspaces, joined to Jo at the centre. Scroll to zoom, drag to move.'
		className={`mx-auto block h-full w-full touch-none ${vb.w < HOME.w ? 'cursor-grab active:cursor-grabbing' : ''}`}
		// Dragging moves the map; a press that did not move is a click, which clears the pick.
		onPointerDown={(e) => {
			drag.current = { x: e.clientX, y: e.clientY, moved: false }
			dragged.current = false
		}}
		onPointerMove={(e) => {
			const d = drag.current
			if (!d || !(e.buttons & 1)) return
			if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return
			d.moved = dragged.current = true
			const scale = svg.current!.getScreenCTM()!.a
			const dx = (e.clientX - d.x) / scale
			const dy = (e.clientY - d.y) / scale
			d.x = e.clientX
			d.y = e.clientY
			panBy(dx, dy)
		}}
		onPointerUp={() => (drag.current = null)}
		onClickCapture={(e) => {
			if (dragged.current) {
				e.stopPropagation()
				dragged.current = false
			}
		}}
		onClick={() => onPick(null)}
	>
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

		{/* The rings themselves, or the columns, faint. */}
		{mode === 'rings'
			? [RADIUS.workspace, RADIUS.dataset, RADIUS.source].map((r) => <circle key={r} cx={C} cy={C} r={r} fill='none' stroke='#ffffff' strokeOpacity='.05' strokeDasharray='2 6' />)
			: [COL.source, COL.dataset, COL.workspace].map((x) => <line key={x} x1={x} x2={x} y1={0} y2={TALL} stroke='#ffffff' strokeOpacity='.05' strokeDasharray='2 6' />)}
		<circle cx={mode === 'rings' ? C : COL.jo} cy={mode === 'rings' ? C : TALL / 2} r={120} fill='url(#halo)' />

		{edges.map((e, i) => {
			const p = placed.get(e.from)
			const q = placed.get(e.to)
			if (!p || !q) return null
			const on = edgeLit(e)
			const d = curve(p, q, e.kind, mode)
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
			const r = radius(n)
						return (
				<g
					key={n.id}
					role='button'
					tabIndex={0}
					aria-label={`${n.label}${n.count ? `, ${n.count.toLocaleString('en-PH')} ${n.unit}` : ''}`}
					onMouseEnter={() => onHover(n.id)}
					onMouseLeave={() => onHover(null)}
					onFocus={() => onHover(n.id)}
					onBlur={() => onHover(null)}
					onClick={(ev) => {
						ev.stopPropagation()
						onPick(n.id)
					}}
					onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), onPick(n.id))}
					className='cursor-pointer outline-none! focus:outline-none!'
					style={{ transition: 'opacity .3s' }}
					opacity={on ? 1 : 0.18}
				>
					{n.kind === 'jo' ? <circle cx={n.x} cy={n.y} r={r + 10} fill='#f1c453' opacity='.18' filter='url(#glow)' /> : null}
					<circle cx={n.x} cy={n.y} r={r} fill={FILL[n.kind]} stroke={picked === n.id ? '#ffffff' : 'none'} strokeWidth='2' filter={n.kind === 'workspace' ? 'url(#glow)' : undefined} />
					{n.kind === 'jo' ? (
						<BrainIcon x={n.x - 18} y={n.y - 18} size={36} weight='fill' color='#3a0f16' aria-hidden='true' />
					) : (
						<text
							x={n.lx}
							y={n.ly}
							textAnchor={n.anchor}
							// In columns a label crosses the links beside it; a halo of the ground keeps it legible.
							{...(mode === 'columns' ? { stroke: '#1f070b', strokeWidth: 3.5, strokeLinejoin: 'round' as const, paintOrder: 'stroke' } : {})}
							className={n.kind === 'workspace' ? 'fill-white text-[0.875rem] font-bold' : n.kind === 'dataset' ? 'fill-[#f3dcae] text-[0.71875rem]' : 'fill-[#a9c6c6] text-[0.6875rem]'}
						>
							{n.label}
						</text>
					)}
				</g>
			)
		})}
	</svg>
	<div className='absolute right-4 bottom-4 flex flex-col gap-1.5'>
		{/* Rings or columns: the button shows the layout a click turns to. */}
		<button
			type='button'
			className={button}
			onClick={() => setMode(mode === 'rings' ? 'columns' : 'rings')}
			aria-label={mode === 'rings' ? 'Lay the map out in columns' : 'Lay the map out in rings'}
			title={mode === 'rings' ? 'Columns' : 'Rings'}
		>
			{mode === 'rings' ? <TreeStructureIcon size={16} weight='bold' className='rotate-90' /> : <CircleDashedIcon size={16} weight='bold' />}
		</button>
		{toolbar}
		<button type='button' className={button} aria-label='Zoom in' onClick={() => zoom(0.75)}>
			<PlusIcon size={16} weight='bold' />
		</button>
		<button type='button' className={button} aria-label='Zoom out' onClick={() => zoom(1.33)}>
			<MinusIcon size={16} weight='bold' />
		</button>
		<button type='button' className={button} aria-label='Reset the view' onClick={() => (glideTo(HOME), onPick(null))}>
			<ArrowsInIcon size={16} weight='bold' />
		</button>
	</div>
	</div>
	)
}
