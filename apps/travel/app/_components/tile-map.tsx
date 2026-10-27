'use client'

import { MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'

/* ============================================================
   A street map with pins

   OpenStreetMap's own tiles, laid out with plain web-Mercator
   arithmetic, so the guide gets a real map without a mapping
   library. Drag to pan, buttons to zoom; a pin opens its label.
   The view opens fitted to the pins it is given.
   ============================================================ */

export type MapPin = { id: string; lat: number; lon: number; name: string; category: string; note?: string }
export type MapCategory = { key: string; label: string; color: string }

const TILE = 256
const MAX_ZOOM = 18

/** World pixel position at zoom z. */
function project(lat: number, lon: number, z: number) {
	const scale = TILE * 2 ** z
	const sin = Math.sin((lat * Math.PI) / 180)
	return {
		x: ((lon + 180) / 360) * scale,
		y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
	}
}

export function TileMap({
	pins,
	categories,
	selected,
	onSelect,
	height = 460,
	minZoom = 11,
	focusZoom = 15,
	card,
	legend = true,
}: {
	pins: MapPin[]
	categories: MapCategory[]
	/** The pin to open, from outside the map (a card the reader tapped). */
	selected?: string | null
	onSelect?: (id: string | null) => void
	/** Pixels, or 'fill' to take the height of the box it is put in. */
	height?: number | 'fill'
	/** How far out the reader may zoom: 11 for a town, 6 for the region. */
	minZoom?: number
	/** The zoom a pin chosen from outside the map is brought to. */
	focusZoom?: number
	/** The open pin's card, in place of the name, note and map link. */
	card?: (pin: MapPin) => React.ReactNode
	/** The colour key under the map. */
	legend?: boolean
}) {
	const MIN_ZOOM = minZoom
	const box = useRef<HTMLDivElement>(null)
	const [width, setWidth] = useState(0)
	const [boxHeight, setBoxHeight] = useState(typeof height === 'number' ? height : 0)
	const [view, setView] = useState<{ z: number; cx: number; cy: number } | null>(null)
	const [open, setOpen] = useState<string | null>(null)
	const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)
	const color = useMemo(() => Object.fromEntries(categories.map((c) => [c.key, c.color])), [categories])

	useEffect(() => {
		const el = box.current
		if (!el) return
		const observer = new ResizeObserver(([entry]) => {
			setWidth(entry!.contentRect.width)
			setBoxHeight(entry!.contentRect.height)
		})
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	// Fit the pins once the size is known, and again when the set changes.
	const fitKey = pins.map((p) => p.id).join(',')
	useEffect(() => {
		const height = boxHeight
		if (!width || !height || !pins.length) return
		const lats = pins.map((p) => p.lat)
		const lons = pins.map((p) => p.lon)
		const [s, n, w, e] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)]
		let z = MAX_ZOOM - 2
		for (; z > MIN_ZOOM; z--) {
			const a = project(n, w, z)
			const b = project(s, e, z)
			if (b.x - a.x < width - 80 && b.y - a.y < height - 80) break
		}
		const c = project((s + n) / 2, (w + e) / 2, z)
		setView({ z, cx: c.x, cy: c.y })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [width, boxHeight, fitKey])

	// A pin chosen outside the map: open it and bring it into view.
	useEffect(() => {
		if (!selected || !view) return
		const pin = pins.find((p) => p.id === selected)
		if (!pin) return
		const z = Math.max(view.z, focusZoom)
		const c = project(pin.lat, pin.lon, z)
		setView({ z, cx: c.x, cy: c.y })
		setOpen(selected)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected])

	const zoom = (step: number) =>
		setView((v) => {
			if (!v) return v
			const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.z + step))
			const k = 2 ** (z - v.z)
			return { z, cx: v.cx * k, cy: v.cy * k }
		})

	const tiles: { key: string; x: number; y: number; url: string }[] = []
	if (view && width && boxHeight) {
		const left = view.cx - width / 2
		const top = view.cy - boxHeight / 2
		const count = 2 ** view.z
		for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx++)
			for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + boxHeight) / TILE); ty++) {
				if (ty < 0 || ty >= count) continue
				const wrapped = ((tx % count) + count) % count
				tiles.push({
					key: `${view.z}/${tx}/${ty}`,
					x: tx * TILE - left,
					y: ty * TILE - top,
					url: `https://tile.openstreetmap.org/${view.z}/${wrapped}/${ty}.png`,
				})
			}
	}

	const place = (p: MapPin) => {
		if (!view) return { x: -999, y: -999 }
		const q = project(p.lat, p.lon, view.z)
		return { x: q.x - view.cx + width / 2, y: q.y - view.cy + boxHeight / 2 }
	}

	const choose = (id: string | null) => {
		setOpen(id)
		onSelect?.(id)
	}

	return (
		<figure className={`m-0 ${height === 'fill' ? 'h-full' : ''}`}>
			<div
				ref={box}
				className='relative h-full touch-none select-none overflow-hidden border border-[var(--rule)] bg-[var(--paper-3)]'
				style={height === 'fill' ? undefined : { height }}
				onPointerDown={(e) => {
					if (!view) return
					;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
					drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }
				}}
				onPointerMove={(e) => {
					const d = drag.current
					if (!d || !view) return
					setView({ ...view, cx: d.cx - (e.clientX - d.x), cy: d.cy - (e.clientY - d.y) })
				}}
				onPointerUp={() => (drag.current = null)}
				onPointerCancel={() => (drag.current = null)}
			>
				{tiles.map((t) => (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						key={t.key}
						src={t.url}
						alt=''
						draggable={false}
						/* Sized in pixels, not \`size-64\`: that is 16rem, and this estate's root type is smaller than 16px on a
						   desktop, so tiles drawn at 16rem left seams between them. */
						className='pointer-events-none absolute max-w-none dark:brightness-[0.8] dark:contrast-[1.1] dark:invert dark:hue-rotate-180'
						style={{ left: t.x, top: t.y, width: TILE, height: TILE }}
					/>
				))}

				{pins.map((p) => {
					const { x, y } = place(p)
					if (x < -20 || y < -20 || x > width + 20 || y > boxHeight + 20) return null
					const active = open === p.id
					return (
						<button
							key={p.id}
							type='button'
							aria-label={p.name}
							onPointerDown={(e) => e.stopPropagation()}
							onClick={() => choose(active ? null : p.id)}
							className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer ${active ? 'z-20' : 'z-10'}`}
							style={{ left: x, top: y }}
						>
							<svg viewBox='0 0 24 32' className={`drop-shadow ${active ? 'h-9 w-7' : 'h-7 w-5'}`} aria-hidden='true'>
								<path d='M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0Z' fill={color[p.category] ?? '#888'} />
								<circle cx='12' cy='11.5' r='4.5' fill='#fff' />
							</svg>
						</button>
					)
				})}

				{open
					? (() => {
							const p = pins.find((pin) => pin.id === open)
							if (!p) return null
							const { x, y } = place(p)
							return (
								card ? (
									/* A card above the pin, kept inside the map. */
									<div
										className='absolute z-30 w-72 overflow-hidden border border-[var(--ink)] bg-[var(--paper)] text-left shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)]'
										style={{ left: Math.min(Math.max(x, 150), width - 150), top: Math.max(y - 40, 8), transform: `translate(-50%, ${y - 40 > 300 ? '-100%' : '0'})` }}
										onPointerDown={(e) => e.stopPropagation()}
									>
										{card(p)}
									</div>
								) : (
								<div
									className='absolute z-30 w-60 -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-3 text-left'
									style={{ left: Math.min(Math.max(x, 130), width - 130), top: Math.max(y - 48, 8), transform: 'translate(-50%, -100%)' }}
									onPointerDown={(e) => e.stopPropagation()}
								>
									<p className='text-[0.84375rem] font-semibold leading-5 text-[var(--ink)]'>{p.name}</p>
									{p.note ? <p className='mt-1 text-[0.75rem] leading-5 text-[var(--ink-3)]'>{p.note}</p> : null}
									<a
										href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`}
										target='_blank'
										rel='noreferrer'
										className='mt-2 inline-block text-[0.75rem] font-semibold text-[var(--accent)]'
									>
										Open in a map app
									</a>
								</div>
								)
							)
						})()
					: null}

				<div className='absolute right-3 top-3 z-30 grid overflow-hidden border border-[var(--rule)] bg-[var(--paper)]' onPointerDown={(e) => e.stopPropagation()}>
					<button type='button' aria-label='Zoom in' onClick={() => zoom(1)} className='grid size-9 cursor-pointer place-items-center border-b border-[var(--rule)] text-[var(--ink)]'>
						<PlusIcon size={16} weight='bold' />
					</button>
					<button type='button' aria-label='Zoom out' onClick={() => zoom(-1)} className='grid size-9 cursor-pointer place-items-center text-[var(--ink)]'>
						<MinusIcon size={16} weight='bold' />
					</button>
				</div>

				<a
					href='https://www.openstreetmap.org/copyright'
					target='_blank'
					rel='noreferrer'
					className='absolute bottom-0 right-0 z-30 bg-[var(--paper)]/85 px-1.5 py-0.5 text-[0.625rem] text-[var(--ink-3)]'
					onPointerDown={(e) => e.stopPropagation()}
				>
					© OpenStreetMap contributors
				</a>
			</div>

			{legend ? (
			<figcaption className='mt-3 flex flex-wrap gap-x-4 gap-y-1.5'>
				{categories.map((c) => (
					<span key={c.key} className='inline-flex items-center gap-1.5 text-[0.75rem] text-[var(--ink-3)]'>
						<span className='size-2.5 rotate-45' style={{ background: c.color }} aria-hidden='true' />
						{c.label}
					</span>
				))}
			</figcaption>
			) : null}
		</figure>
	)
}
