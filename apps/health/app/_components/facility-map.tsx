'use client'

import { Skeleton } from '@betterbarmm/editorial'
import { ArrowUpRightIcon, XIcon } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { MapKind, MapPoint } from '../_lib/towns'

/* MapLibre wants a window: the canvas is loaded in the browser only, with a grey block in its place until then. */
const Canvas = dynamic(() => import('./facility-map-canvas'), {
	ssr: false,
	loading: () => <Skeleton className='size-full rounded-none' />,
})

const KINDS: { kind: MapKind; label: string; dot: string }[] = [
	{ kind: 'hospital', label: 'Hospitals', dot: 'size-3.5 bg-[#b8392c]' },
	{ kind: 'health', label: 'Health centres and clinics', dot: 'size-2.5 bg-[#2e9a66]' },
]

/**
 * The map with its key, which also filters it, and the facility chosen on it.
 * With `focus`, it opens on a town; without, on the region.
 */
export function FacilityMap({ points, focus, className = 'h-[36rem]', townLinks = true }: { points: MapPoint[]; focus?: [[number, number], [number, number]]; className?: string; townLinks?: boolean }) {
	const [off, setOff] = useState<MapKind[]>([])
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const shown = useMemo(() => points.filter((p) => !off.includes(p.kind)), [points, off])
	const chosen = points.find((p) => p.id === selectedId) ?? null

	return (
		<div>
			<div className='flex flex-wrap items-center gap-2'>
				{KINDS.map((k) => {
					const on = !off.includes(k.kind)
					const n = points.filter((p) => p.kind === k.kind).length
					return (
						<button
							key={k.kind}
							type='button'
							aria-pressed={on}
							onClick={() => setOff((o) => (on ? [...o, k.kind] : o.filter((x) => x !== k.kind)))}
							className={`inline-flex h-9 items-center gap-2 border px-3.5 text-[0.8125rem] font-semibold transition ${on ? 'border-[var(--ink)] text-[var(--ink)]' : 'border-[var(--rule)] text-[var(--ink-3)] line-through'}`}
						>
							<span aria-hidden='true' className={`rounded-full ${k.dot}`} />
							{k.label}
							<span className='num text-[0.71875rem] font-normal text-[var(--ink-3)]'>{n}</span>
						</button>
					)
				})}
			</div>
			<div className={`relative mt-4 overflow-hidden border border-[var(--rule)] bg-[var(--paper-2)] ${className}`}>
				<Canvas points={shown} selectedId={selectedId} onSelect={setSelectedId} focus={focus} />
				{chosen ? (
					<div className='absolute bottom-3 left-3 right-3 z-10 max-w-[26rem] border border-[var(--rule)] bg-[var(--paper)] p-4 shadow-lg sm:right-auto'>
						<div className='flex items-start justify-between gap-3'>
							<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{chosen.kind === 'hospital' ? 'Hospital' : 'Health centre or clinic'}</p>
							<button type='button' onClick={() => setSelectedId(null)} aria-label='Close' className='-m-1 p-1 text-[var(--ink-3)] hover:text-[var(--ink)]'>
								<XIcon size={16} />
							</button>
						</div>
						<p className='mt-1.5 text-[1rem] font-extrabold leading-snug text-[var(--ink)]'>{chosen.name}</p>
						<p className='mt-1 text-[0.8125rem] text-[var(--ink-2)]'>{[chosen.barangay ? `Barangay ${chosen.barangay}` : null, chosen.town].filter(Boolean).join(', ')}</p>
						<div className='mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem]'>
							{townLinks && chosen.area && chosen.townSlug ? (
								<Link href={`/towns/${chosen.area}/${chosen.townSlug}`} className='rule-link'>
									Care in {chosen.town}
								</Link>
							) : null}
							<a href={chosen.url} target='_blank' rel='noreferrer' className='rule-link inline-flex items-center gap-1'>
								On OpenStreetMap
								<ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
							</a>
						</div>
					</div>
				) : null}
			</div>
		</div>
	)
}
