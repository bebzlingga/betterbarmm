/* The landing site's pieces for an index page (user decision): the page's figures as cards under the band, and a
   section heading with a line on what it holds on the right. One place, so every page under The budget sets them
   alike. */

/** `share` (0 to 1) draws a bar under the figure: how much of the Act it is. */
export type Figure = { label: string; value: string; note?: string; share?: number }

/** Four golds that read on the crimson band, for the few parts that reach half. */
const GOLD = ['#f6cf7a', '#efb752', '#e0a03c', '#c9862a', '#b5741f']

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
		<figure className='mt-10'>
			<figcaption className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<span className='font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[#f6cf7a]'>{title}</span>
				<span className='num text-[0.8125rem] text-white/80'>{fmt(total)}</span>
			</figcaption>
			<div className='relative mt-3'>
				<div className='flex h-12 gap-[2px] overflow-hidden' role='img' aria-label={`${sorted.length} parts share ${fmt(total)}; the largest ${half} hold ${pct(running / total)}.`}>
					{sorted.map((part, index) => (
						<span
							key={part.name + index}
							title={`${part.name}: ${fmt(part.amount)}, ${pct(part.amount / total)}`}
							className='h-full min-w-px'
							style={{ flexGrow: part.amount, flexBasis: 0, background: index < half ? GOLD[index % GOLD.length] : 'rgba(255,255,255,0.22)' }}
						/>
					))}
					{left > 0 && rest ? (
						<span title={`${rest}: ${fmt(left)}, ${pct(left / total)}`} className='h-full' style={{ flexGrow: left, flexBasis: 0, background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 4px, transparent 4px 8px)' }} />
					) : null}
				</div>
				{/* Where half the Act falls. */}
				<span aria-hidden='true' className='absolute -bottom-2 -top-2 left-1/2 w-0 border-l-2 border-dashed border-white' />
				<span aria-hidden='true' className='absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white'>Half</span>
			</div>
			<ol className={`mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 ${half >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
				{sorted.slice(0, half).map((part, index) => (
					<li key={part.name + index} className='flex min-w-0 items-start gap-2.5 text-[0.8125rem] leading-snug'>
						<span aria-hidden='true' className='mt-1 size-2.5 shrink-0' style={{ background: GOLD[index % GOLD.length] }} />
						<span className='min-w-0'>
							<span className='block truncate text-white' title={part.name}>{part.name}</span>
							<span className='num text-white/70'>
								{fmt(part.amount)} · {pct(part.amount / total)}
							</span>
						</span>
					</li>
				))}
			</ol>
			{left > 0 && rest ? (
				<p className='mt-3 text-[0.75rem] text-white/65'>
					Hatched: {rest.toLowerCase()}, {fmt(left)} ({pct(left / total)}).
				</p>
			) : null}
		</figure>
	)
}

/** Two to four figures as cards: the number large in the brand crimson, its label, and a line on what it counts. */
export function FigureCards({ items, band = false }: { items: Figure[]; band?: boolean }) {
	const cols = items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
	if (band) {
		/* Inside the crimson band, under the description (user decision): one ruled strip, the figures divided by hairlines,
		   each label over its number, and a bar where a figure is a share of the Act. Fixed colours: the band re-points
		   --paper and --ink to its own ground. */
		return (
			<dl className={`mt-10 grid grid-cols-1 border-y border-white/25 sm:grid-cols-2 sm:divide-x sm:divide-white/20 ${cols}`}>
				{items.map((item) => (
					<div key={item.label} className='flex min-w-0 flex-col border-b border-white/15 py-6 last:border-b-0 sm:border-b-0 sm:px-6 sm:first:pl-0 lg:px-8'>
						<dt className='font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[#f6cf7a]'>{item.label}</dt>
						<dd className='num mt-3 truncate text-[2.5rem] font-extrabold leading-none tracking-[-0.045em] text-white'>{item.value}</dd>
						{item.share != null ? (
							<dd aria-hidden='true' className='mt-4 h-1.5 bg-white/15'>
								<span className='block h-full bg-[#f6cf7a]' style={{ width: `${Math.max(1.5, Math.min(1, item.share) * 100)}%` }} />
							</dd>
						) : null}
						{item.note ? <dd className='mt-3 truncate text-[0.8125rem] leading-snug text-white/80'>{item.note}</dd> : null}
					</div>
				))}
			</dl>
		)
	}
	return (
		<section className='bb-container pt-[clamp(3.75rem,7vw,6.5rem)]'>
			<dl className={`grid grid-cols-2 gap-4 ${cols}`}>
				{items.map((item) => (
					<div key={item.label} className='flex min-w-0 flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
						<dd className='num order-1 truncate text-[1.875rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]'>{item.value}</dd>
						<dt className='order-2 mt-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--brass)]'>{item.label}</dt>
						{item.note ? <dd className='order-3 mt-1.5 text-[0.78125rem] leading-snug text-[var(--ink-3)]'>{item.note}</dd> : null}
					</div>
				))}
			</dl>
		</section>
	)
}

/** A section's heading: the title on the left, what it holds on the right. */
export function SectionTitle({ title, lead, className = '' }: { title: string; lead?: string; className?: string }) {
	return (
		<div className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 ${className}`}>
			<h2 className='text-[1.625rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{title}</h2>
			{lead ? <p className='max-w-xl text-[0.84375rem] leading-[1.6] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}
