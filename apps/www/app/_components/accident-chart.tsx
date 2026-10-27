'use client'

import { useMemo, useState } from 'react'
import { ACCIDENT_TYPES, type Accident, type AccidentType } from '../_lib/accidents'

/* ============================================================
   Incidents over time, above the list

   The same incidents the list shows, under the same filters: by month
   for a chosen year, by year when every year is chosen, each bar
   stacked by kind in the map's own colours. A year's bar opens that
   year. The list under it is the table view.

   Stacked shooting, road, fire, water, flood, other from the baseline
   up: the map's palette, ordered so fire and shooting never touch —
   side by side the two read alike (validated: normal-vision ΔE 13.4
   adjacent, 21+ in this order). Every segment is parted from the next
   by a 2px gap, and the tooltip and legend name each kind.
   ============================================================ */

const STACK: AccidentType[] = ['shooting', 'road', 'fire', 'water', 'flood', 'other']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const label = (id: AccidentType) => ACCIDENT_TYPES.find((t) => t.id === id)?.label ?? id

type Bar = { key: string; name: string; total: number; byKind: Map<AccidentType, number> }

/** A round top for the axis: 1, 2 or 5 times a power of ten, in three or four steps. */
function axis(max: number) {
	const raw = Math.max(1, max) / 3
	const pow = 10 ** Math.floor(Math.log10(raw))
	const step = ([1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow)
	return { step, top: Math.ceil(Math.max(1, max) / step) * step }
}

export function AccidentChart({
	incidents,
	year,
	years,
	onYear,
}: {
	incidents: Accident[]
	year: string
	years: string[]
	onYear: (year: string) => void
}) {
	const [hover, setHover] = useState<number | null>(null)

	const { bars, undated } = useMemo(() => {
		const keys = year ? MONTHS.map((_, i) => `${year}-${String(i + 1).padStart(2, '0')}`) : years
		const bars: Bar[] = keys.map((key, i) => ({ key, name: year ? `${MONTHS[i]} ${year}` : key, total: 0, byKind: new Map() }))
		const at = new Map(bars.map((b) => [b.key, b]))
		let undated = 0
		for (const a of incidents) {
			const bar = at.get(year ? a.date.slice(0, 7) : a.date.slice(0, 4))
			if (!bar) {
				undated++
				continue
			}
			bar.total++
			bar.byKind.set(a.type, (bar.byKind.get(a.type) ?? 0) + 1)
		}
		return { bars, undated }
	}, [incidents, year, years])

	const { step, top } = axis(Math.max(...bars.map((b) => b.total)))
	const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)
	const kinds = STACK.filter((k) => bars.some((b) => b.byKind.get(k)))
	const total = bars.reduce((n, b) => n + b.total, 0)

	return (
		<figure className='mt-10 mb-14'>
			<figcaption className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
				<span className='text-[0.9375rem] font-bold text-[var(--ink)]'>
					{year ? `Incidents by month, ${year}` : 'Incidents by year'}{' '}
					<span className='font-normal text-[var(--ink-3)]'>· {total.toLocaleString('en-PH')}</span>
				</span>
				{/* One kind needs no key: the title and the filter already name it. */}
				{kinds.length > 1 ? (
					<span className='flex flex-wrap gap-x-4 gap-y-1'>
						{kinds.map((k) => (
							<span key={k} className='flex items-center gap-1.5 text-[0.75rem] text-[var(--ink-2)]'>
								<span className='size-2.5 rounded-[2px]' style={{ background: `var(--acc-${k})` }} aria-hidden='true' />
								{label(k)}
							</span>
						))}
					</span>
				) : null}
			</figcaption>

			<div className='mt-5 pl-8'>
				<div className='relative h-40'>
				{/* The grid: recessive, behind the bars, labelled on the left. */}
				<div className='pointer-events-none absolute inset-y-0 -left-8 right-0' aria-hidden='true'>
					{ticks.map((t) => (
						<span key={t} className='absolute left-8 right-0 border-t border-[var(--rule-soft)]' style={{ bottom: `${(t / top) * 100}%` }}>
							<span className='num absolute -left-8 -top-2 w-6 text-right text-[0.65625rem] text-[var(--ink-mute)]'>{t}</span>
						</span>
					))}
				</div>

				<div className='relative flex h-full items-end gap-1 sm:gap-2' onMouseLeave={() => setHover(null)}>
					{bars.map((b, i) => {
						const topKind = [...STACK].reverse().find((k) => b.byKind.get(k))
						const clickable = !year
						const Wrapper = clickable ? 'button' : 'div'
						return (
							<Wrapper
								key={b.key}
								{...(clickable ? { type: 'button' as const, onClick: () => onYear(b.key) } : { tabIndex: 0 })}
								onMouseEnter={() => setHover(i)}
								onFocus={() => setHover(i)}
								onBlur={() => setHover(null)}
								aria-label={`${b.name}: ${b.total} ${b.total === 1 ? 'incident' : 'incidents'}${clickable ? '. Show this year' : ''}`}
								className={`group relative flex h-full min-w-0 flex-1 flex-col justify-end outline-none ${clickable ? 'cursor-pointer' : ''}`}
							>
								{/* The hit area is the whole column; the bar inside it is thin. */}
								<span className='mx-auto flex w-full max-w-[2.75rem] flex-col-reverse gap-[2px]' style={{ height: `${(b.total / top) * 100}%` }}>
									{STACK.filter((k) => b.byKind.get(k)).map((k) => (
										<span
											key={k}
											className={`block w-full ${k === topKind ? 'rounded-t-[4px]' : ''}`}
											style={{ flexGrow: b.byKind.get(k), flexBasis: 0, background: `var(--acc-${k})` }}
										/>
									))}
								</span>

								{/* Beside the bar, at the top of the plot, so it never covers the key or leaves the figure. */}
								{hover === i ? (
									<span
										role='tooltip'
										className={`pointer-events-none absolute top-0 z-10 w-max min-w-[9rem] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-left shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)] ${i >= bars.length / 2 ? 'right-[calc(100%+0.25rem)]' : 'left-[calc(100%+0.25rem)]'}`}
									>
										<span className='block text-[0.75rem] font-bold text-[var(--ink)]'>
											{b.name} · {b.total}
										</span>
										{STACK.filter((k) => b.byKind.get(k)).map((k) => (
											<span key={k} className='mt-1 flex items-center gap-1.5 text-[0.6875rem] text-[var(--ink-2)]'>
												<span className='size-2 rounded-[2px]' style={{ background: `var(--acc-${k})` }} aria-hidden='true' />
												{label(k)}
												<span className='num ml-auto pl-3 text-[var(--ink)]'>{b.byKind.get(k)}</span>
											</span>
										))}
										{clickable ? <span className='mt-1.5 block text-[0.65625rem] text-[var(--ink-3)]'>Click to show this year</span> : null}
									</span>
								) : null}
							</Wrapper>
						)
					})}
				</div>
				</div>

				<div className='mt-2 flex gap-1 sm:gap-2' aria-hidden='true'>
					{bars.map((b, i) => (
						<span key={b.key} className='num min-w-0 flex-1 truncate text-center text-[0.65625rem] text-[var(--ink-3)]'>
							{year ? MONTHS[i] : b.key}
						</span>
					))}
				</div>
			</div>

			{undated ? (
				<p className='mt-3 text-[0.75rem] text-[var(--ink-3)]'>
					{undated} {undated === 1 ? 'incident has' : 'incidents have'} no month in its reports and {undated === 1 ? 'is' : 'are'} not in the bars.
				</p>
			) : null}
		</figure>
	)
}
