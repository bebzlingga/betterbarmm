'use client'

import { useLayoutEffect, useRef } from 'react'

/* A craft's specs, three columns at the foot of the card, each as wide as its
   own longest line. A wrapped paragraph keeps the full width of its box however
   short its lines run, which leaves uneven gaps; so each column is laid out at
   its widest (20em), its lines are measured, and the box is shrunk to them.
   The gap between columns is then the gap and nothing more. */

export function CraftSpecs({ specs, labelClass }: { specs: (readonly [string, string])[]; labelClass: string }) {
	const ref = useRef<HTMLDListElement>(null)

	useLayoutEffect(() => {
		const dl = ref.current
		if (!dl) return
		const fit = () => {
			for (const col of dl.children as HTMLCollectionOf<HTMLElement>) col.style.width = ''
			for (const col of dl.children as HTMLCollectionOf<HTMLElement>) {
				const range = document.createRange()
				range.selectNodeContents(col)
				const rects = [...range.getClientRects()]
				const left = col.getBoundingClientRect().left
				const widest = Math.max(0, ...rects.map((r) => r.right - left))
				col.style.width = `${Math.ceil(widest) + 1}px`
			}
		}
		fit()
		const watch = new ResizeObserver(fit)
		watch.observe(dl.parentElement ?? dl)
		return () => watch.disconnect()
	}, [specs])

	return (
		<dl ref={ref} className='flex flex-wrap gap-x-12 gap-y-6 text-[13.5px] leading-[1.6] sm:flex-nowrap lg:max-w-[90%]'>
			{/* Only what a source says: a spec it does not give is left out rather than guessed. */}
			{specs.map(([k, v]) => (
				<div key={k} className='min-w-0 max-w-[20em] shrink'>
					<dt className={`${labelClass} text-[17px] font-bold text-[#f4e8dc]`}>{k}</dt>
					<dd className='mt-2 text-balance text-[#e2cbb8]'>{v}</dd>
				</div>
			))}
		</dl>
	)
}
