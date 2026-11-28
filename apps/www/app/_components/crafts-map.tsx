'use client'

import { Skeleton } from '@betterbarmm/editorial'
import { MapPinIcon } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import type { MapPoint } from '../_lib/craft-places'

/* Where the crafts are made: the map, and beside it the town picked on it, or every town
   when none is, each with its crafts. The map loads only in the browser. */

const Canvas = dynamic(() => import('./crafts-map-canvas'), { ssr: false, loading: () => <Skeleton className='h-full w-full rounded-none' /> })

export function CraftsMap({ points }: { points: MapPoint[] }) {
	const [selected, setSelected] = useState<string | null>(null)
	const picked = points.find((p) => p.key === selected)
	// Towns first, most crafts first; the province-only dots after.
	const list = picked ? [picked] : [...points].sort((a, b) => Number(b.town) - Number(a.town) || b.crafts.length - a.crafts.length)
	return (
		<div className='grid overflow-hidden rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_24px_50px_-34px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,1fr)_22rem]'>
			<div className='h-[24rem] lg:h-[34rem]'>
				<Canvas points={points} selected={selected} onSelect={setSelected} />
			</div>
			<div className='max-h-[34rem] overflow-y-auto border-t border-[var(--rule)] p-5 [scrollbar-width:thin] lg:border-t-0 lg:border-l'>
				{picked ? (
					<button type='button' onClick={() => setSelected(null)} className='mb-3 text-[0.78125rem] font-semibold text-[var(--accent)] hover:text-[var(--ink)]'>
						← Every town
					</button>
				) : (
					<p className='mb-3 text-[0.78125rem] text-[var(--ink-3)]'>Pick a dot, or a town below.</p>
				)}
				<ul className='space-y-4'>
					{list.map((p) => (
						<li key={p.key}>
							<p className='flex items-baseline gap-1.5'>
								<MapPinIcon size={13} className='shrink-0 self-center text-[#b4613f]' aria-hidden='true' />
								<button type='button' onClick={() => setSelected(p.key)} className='text-left text-[0.9375rem] font-bold hover:text-[var(--accent)]'>
									{p.label}
								</button>
								<span className='text-[0.75rem] text-[var(--ink-3)]'>{p.sub}</span>
							</p>
							<p className='mt-1 pl-5 text-[0.84375rem] leading-[1.7]'>
								{p.crafts.map((c, i) => (
									<span key={c.slug}>
										{i ? ', ' : ''}
										<Link href={`/crafts/${c.slug}`} scroll={false} className='text-[var(--ink-2)] underline decoration-[var(--rule-soft)] underline-offset-4 hover:decoration-[var(--accent)]'>
											{c.name}
										</Link>
									</span>
								))}
							</p>
							{p.href && picked ? (
								<Link href={p.href} className='mt-2 inline-block pl-5 text-[0.78125rem] font-semibold text-[var(--accent)] hover:text-[var(--ink)]'>
									{p.label} in the Directory →
								</Link>
							) : null}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
