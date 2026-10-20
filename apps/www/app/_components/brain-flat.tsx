'use client'

import { ArrowsInIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BrainEdge, BrainNode } from '../_lib/brain'

/* ============================================================
   The brain, flat

   The 2D view beside the globe: the same rings seen from above —
   Jo at the centre, the workspaces, the datasets, the sources —
   with the links bowed toward the centre and pulses running in.
   It shares the globe's props, so hover, pick and follow work the
   same on either.
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
	/** Everything a pick reaches; the view glides to frame it. */
	chain?: Set<string> | null
}

/** The whole map, and how far in and out it may go. */
const HOME = { x: -90, y: 0, w: 1180, h: 1000 }
const CLOSEST = HOME.w / 6
const FARTHEST = HOME.w * 1.3

export function BrainFlat({ nodes, edges, lit, edgeLit, picked, chain, onHover, onPick, toolbar }: Props) {
	const placed = useMemo(() => layout(nodes, edges), [nodes, edges])
	const svg = useRef<SVGSVGElement>(null)
	const [vb, setVb] = useState(HOME)
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
	/** Zoom by f around a point of the map (the centre of the view by default). */
	const zoom = (f: number, at?: { x: number; y: number }) =>
		setVb((v) => {
			const w = Math.min(FARTHEST, Math.max(CLOSEST, v.w * f))
			const k = w / v.w
			const p = at ?? { x: v.x + v.w / 2, y: v.y + v.h / 2 }
			return { x: p.x - (p.x - v.x) * k, y: p.y - (p.y - v.y) * k, w, h: v.h * k }
		})

	/** Glide the view to a box, eased, rather than jump. */
	const glide = useRef(0)
	const glideTo = (to: typeof HOME) => {
		cancelAnimationFrame(glide.current)
		const from = { ...vbRef.current }
		const t0 = performance.now()
		const step = (now: number) => {
			const u = Math.min(1, (now - t0) / 550)
			const e = 1 - (1 - u) ** 3
			setVb({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e })
			if (u < 1) glide.current = requestAnimationFrame(step)
		}
		glide.current = requestAnimationFrame(step)
	}
	const vbRef = useRef(vb)
	useEffect(() => {
		vbRef.current = vb
	}, [vb])

	// A pick frames its chain; clearing it goes back to the whole map.
	useEffect(() => {
		if (!chain) {
			if (!picked) glideTo(HOME)
			return
		}
		const pts = [...chain].map((id) => placed.get(id)).filter(Boolean) as Placed[]
		if (pts.length < 2) return
		const pad = 110
		const x0 = Math.min(...pts.map((p) => p.x)) - pad
		const x1 = Math.max(...pts.map((p) => p.x)) + pad
		const y0 = Math.min(...pts.map((p) => p.y)) - pad
		const y1 = Math.max(...pts.map((p) => p.y)) + pad
		// Kept to the map's own proportions, centred on the chain.
		const w = Math.max(x1 - x0, ((y1 - y0) * HOME.w) / HOME.h, CLOSEST * 1.6)
		const h = (w * HOME.h) / HOME.w
		glideTo({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h })
	}, [chain, picked, placed])

	// The wheel zooms toward the pointer. Not passive, so the dialog does not scroll instead.
	useEffect(() => {
		const el = svg.current!
		const wheel = (e: WheelEvent) => {
			e.preventDefault()
			const p = toMap(e.clientX, e.clientY)
			zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, { x: p.x, y: p.y })
		}
		el.addEventListener('wheel', wheel, { passive: false })
		return () => el.removeEventListener('wheel', wheel)
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
			setVb((v) => ({ ...v, x: v.x - dx, y: v.y - dy }))
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
					className='cursor-pointer outline-none'
					style={{ transition: 'opacity .3s' }}
					opacity={on ? 1 : 0.18}
				>
					{n.kind === 'jo' ? <circle cx={n.x} cy={n.y} r={r + 10} fill='#f1c453' opacity='.18' filter='url(#glow)' /> : null}
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
	<div className='absolute right-4 bottom-4 flex flex-col gap-1.5'>
		{toolbar}
		<button type='button' className={button} aria-label='Zoom in' onClick={() => zoom(0.75)}>
			<PlusIcon size={16} weight='bold' />
		</button>
		<button type='button' className={button} aria-label='Zoom out' onClick={() => zoom(1.33)}>
			<MinusIcon size={16} weight='bold' />
		</button>
		<button type='button' className={button} aria-label='Reset the view' onClick={() => (setVb(HOME), onPick(null))}>
			<ArrowsInIcon size={16} weight='bold' />
		</button>
	</div>
	</div>
	)
}
