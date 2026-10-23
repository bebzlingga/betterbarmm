'use client'

import { MapPinIcon } from '@phosphor-icons/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import type { MapPoint } from '../_lib/craft-places'

/* Where the crafts are made: the map, and beside it the town picked on it, or every town
   when none is, each with its crafts. The map loads only in the browser. */

const Canvas = dynamic(() => import('./crafts-map-canvas'), { ssr: false, loading: () => <div className='h-full w-full animate-pulse bg-[#e9dfd3]' aria-hidden='true' /> })

export function CraftsMap({ points }: { points: MapPoint[] }) {
	const [selected, setSelected] = useState<string | null>(null)
	const picked = points.find((p) => p.key === selected)
	// Towns first, most crafts first; the province-only dots after.
	const list = picked ? [picked] : [...points].sort((a, b) => Number(b.town) - Number(a.town) || b.crafts.length - a.crafts.length)
	return (
		<div className='grid overflow-hidden rounded-[8px] border border-[#d9c7b5] bg-white lg:grid-cols-[minmax(0,1fr)_22rem]'>
			<div className='h-[24rem] lg:h-[34rem]'>
				<Canvas points={points} selected={selected} onSelect={setSelected} />
			</div>
			<div className='max-h-[34rem] overflow-y-auto border-t border-[#d9c7b5] p-5 lg:border-t-0 lg:border-l'>
				{picked ? (
					<button type='button' onClick={() => setSelected(null)} className='mb-3 text-[12.5px] font-semibold text-[#7b4a35] hover:text-[#3b2419]'>
						← Every town
					</button>
				) : (
					<p className='mb-3 text-[12.5px] text-[#8a6d5c]'>Pick a dot, or a town below.</p>
				)}
				<ul className='space-y-4'>
					{list.map((p) => (
						<li key={p.key}>
							<p className='flex items-baseline gap-1.5'>
								<MapPinIcon size={13} className='shrink-0 self-center text-[#b4613f]' aria-hidden='true' />
								<button type='button' onClick={() => setSelected(p.key)} className='text-left text-[15px] font-bold hover:text-[#7b4a35]'>
									{p.label}
								</button>
								<span className='text-[12px] text-[#8a6d5c]'>{p.sub}</span>
							</p>
							<p className='mt-1 pl-5 text-[13.5px] leading-[1.7]'>
								{p.crafts.map((c, i) => (
									<span key={c.slug}>
										{i ? ', ' : ''}
										<Link href={`/crafts/${c.slug}`} scroll={false} className='text-[#5a3d2e] underline decoration-[#e4d8cb] underline-offset-4 hover:decoration-[#7b4a35]'>
											{c.name}
										</Link>
									</span>
								))}
							</p>
							{p.href && picked ? (
								<Link href={p.href} className='mt-2 inline-block pl-5 text-[12.5px] font-semibold text-[#7b4a35] hover:text-[#3b2419]'>
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
