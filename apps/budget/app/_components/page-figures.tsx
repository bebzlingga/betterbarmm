/* The landing site's pieces for an index page (user decision): the page's figures as cards under the band, and a
   section heading with a line on what it holds on the right. One place, so every page under The budget sets them
   alike. */

/** `share` (0 to 1) draws a bar under the figure: how much of the Act it is. */
export type Figure = { label: string; value: string; note?: string; share?: number }

/** A ramp of the crimson, deep to light, for the few parts that reach half (on the paper under the header). */
const GOLD = ['#8a2418', '#a8402e', '#c25e45', '#d77f62', '#e6a084']

/**
 * The whole Act as one bar, a part a segment in order of size (user decision): the few that together reach half are
 * drawn in gold and named under it, everything else a sliver of the rest, and a mark where half falls. `rest` is
 * whatever of the Act the parts do not cover, drawn last and said plainly.
 */
export function WholeActBar({
	title,
	total,
	parts,
	rest,
	fmt,
	pct,
}: {
	title: string
	total: number
	parts: { name: string; amount: number }[]
	rest?: string
	fmt: (amount: number) => string
	pct: (share: number) => string
}) {
	const sorted = [...parts].sort((a, b) => b.amount - a.amount)
	let running = 0
	let half = 0
	for (const part of sorted) {
		running += part.amount
		half += 1
		if (running >= total / 2) break
	}
	const covered = sorted.reduce((sum, part) => sum + part.amount, 0)
	const left = Math.max(0, total - covered)
	return (
		<figure className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] sm:p-8'>
			<figcaption className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<span className='font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--ink)]'>{title}</span>
				<span className='num rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.8125rem] font-semibold text-[var(--ink-2)]'>{fmt(total)}</span>
			</figcaption>
			<div className='relative mt-8'>
				<div className='flex h-12 gap-[2px] overflow-hidden rounded-xl' role='img' aria-label={`${sorted.length} parts share ${fmt(total)}; the largest ${half} hold ${pct(running / total)}.`}>
					{sorted.map((part, index) => (
						<span
							key={part.name + index}
							title={`${part.name}: ${fmt(part.amount)}, ${pct(part.amount / total)}`}
							className='h-full min-w-px'
							style={{ flexGrow: part.amount, flexBasis: 0, background: index < half ? GOLD[index % GOLD.length] : 'color-mix(in srgb, var(--ink) 14%, var(--paper))' }}
						/>
					))}
					{left > 0 && rest ? (
						<span title={`${rest}: ${fmt(left)}, ${pct(left / total)}`} className='h-full' style={{ flexGrow: left, flexBasis: 0, background: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--ink) 16%, transparent) 0 4px, transparent 4px 8px)' }} />
					) : null}
				</div>
				{/* Where half the Act falls. */}
				<span aria-hidden='true' className='absolute -bottom-2 -top-2 left-1/2 w-0 border-l-2 border-dashed border-[var(--ink)]' />
				<span aria-hidden='true' className='absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6875rem] font-bold text-[var(--ink)]'>Half</span>
			</div>
			<ol className={`mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 ${half >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
				{sorted.slice(0, half).map((part, index) => (
					<li key={part.name + index} className='flex min-w-0 items-start gap-2.5 text-[0.8125rem] leading-snug'>
						<span aria-hidden='true' className='mt-1 size-2.5 shrink-0 rounded-[3px]' style={{ background: GOLD[index % GOLD.length] }} />
						<span className='min-w-0'>
							<span className='block truncate font-semibold text-[var(--ink)]' title={part.name}>{part.name}</span>
							<span className='num text-[var(--ink-3)]'>
								{fmt(part.amount)} · {pct(part.amount / total)}
							</span>
						</span>
					</li>
				))}
			</ol>
			{left > 0 && rest ? (
				<p className='mt-4 text-[0.75rem] text-[var(--ink-3)]'>
					Hatched: {rest.toLowerCase()}, {fmt(left)} ({pct(left / total)}).
				</p>
			) : null}
		</figure>
	)
}

/** Two to four figures as cards: the number large in the brand crimson, its label, and a line on what it counts. */
export function FigureCards({ items, band = false }: { items: Figure[]; band?: boolean }) {
	const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
	// Under the header on the paper (user decision: figures below the header), whether a page hands them to the
	// header (`band`) or sets them after it.
	const cards = (
		<dl className={`grid grid-cols-2 gap-3 ${cols}`}>
			{items.map((item) => (
				<div key={item.label} className='flex min-w-0 flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] sm:p-6'>
					<dd className='num order-1 truncate font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>{item.value}</dd>
					<dt className='order-2 mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{item.label}</dt>
					{item.share != null ? (
						<dd aria-hidden='true' className='order-3 mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--paper-2)]'>
							<span className='block h-full rounded-full bg-[var(--accent)]' style={{ width: `${Math.max(1.5, Math.min(1, item.share) * 100)}%` }} />
						</dd>
					) : null}
					{item.note ? <dd className='order-4 mt-2 text-[0.78125rem] leading-snug text-[var(--ink-3)]'>{item.note}</dd> : null}
				</div>
			))}
		</dl>
	)
	if (band) return <div className='mt-5'>{cards}</div>
	return <section className='bb-container pt-12 lg:pt-16'>{cards}</section>
}
/** A section's heading: the title on the left, what it holds on the right. */
export function SectionTitle({ title, lead, className = '' }: { title: string; lead?: string; className?: string }) {
	return (
		<div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 ${className}`}>
			<h2 className='dv-title'>{title}</h2>
			{lead ? <p className='max-w-xl text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}
