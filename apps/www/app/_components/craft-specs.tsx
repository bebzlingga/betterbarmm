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
		const cols = [...(dl.children as HTMLCollectionOf<HTMLElement>)]
		const fit = () => {
			// Lay every column out at its widest, unshrunk, so the lines measured are the lines it would wrap to.
			for (const col of cols) Object.assign(col.style, { width: '20em', flex: 'none' })
			for (const col of cols) {
				// The text's own line boxes, not the label and value blocks around them (those span the column).
				const rects: DOMRect[] = []
				const walk = document.createTreeWalker(col, NodeFilter.SHOW_TEXT)
				for (let t = walk.nextNode(); t; t = walk.nextNode()) {
					const range = document.createRange()
					range.selectNodeContents(t)
					rects.push(...range.getClientRects())
				}
				const left = col.getBoundingClientRect().left
				const widest = Math.max(0, ...rects.map((r) => r.right - left))
				col.dataset.fit = `${Math.ceil(widest) + 1}px`
			}
			for (const col of cols) Object.assign(col.style, { width: col.dataset.fit, flex: '' })
		}
		fit()
		// The web fonts arrive after first paint and set wider or narrower than the fallback: measure again.
		document.fonts.ready.then(fit)
		const watch = new ResizeObserver(fit)
		watch.observe(dl.parentElement ?? dl)
		return () => watch.disconnect()
	}, [specs])

	return (
		<dl ref={ref} className='flex flex-wrap gap-x-12 gap-y-6 text-[0.84375rem] leading-[1.6] sm:flex-nowrap lg:max-w-[90%]'>
			{/* Only what a source says: a spec it does not give is left out rather than guessed. */}
			{specs.map(([k, v]) => (
				<div key={k} className='min-w-[7.5rem] max-w-[20em] shrink'>
					<dt className={`${labelClass} text-[1.0625rem] font-bold text-[#f4e8dc]`}>{k}</dt>
					<dd className='mt-2 text-balance text-[#e2cbb8]'>{v}</dd>
				</div>
			))}
		</dl>
	)
}
