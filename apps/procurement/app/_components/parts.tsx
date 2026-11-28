import { Hero } from './hero'

/* The header every page here opens with, in the travel workspace's look (user decision): the crimson and its lattice,
   up under the clear bars (Hero). A page's year chart sits beside its words on a glass card. */
export function Masthead({
	kicker,
	name,
	note,
	chart = false,
	stacked = false,
	children,
}: {
	kicker: string
	name: string
	note?: string
	/** The header carries a year chart (the children): it goes on the right. */
	chart?: boolean
	/** A long name (an office's, a supplier's): a step smaller. */
	stacked?: boolean
	children?: React.ReactNode
}) {
	return (
		<Hero kicker={kicker} title={name} small={stacked && name.length > 40} lede={note} side={chart ? children : undefined}>
			{chart ? null : children}
		</Hero>
	)
}

/** "2026-07-24" as "July 24, 2026". */
export const longDate = (iso: string) =>
	new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export const peso = (n: number) =>
	n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`

/** A bar a year, the figure over it, on the masthead's ground. */
export function YearBars({ bars, caption, note }: { bars: { year: number; value: number }[]; caption: string; note?: string }) {
	const top = Math.max(...bars.map((b) => b.value), 1)
	const cols = { gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }
	return (
		<figure className='m-0 rounded-[var(--dv-r)] bg-white/[0.08] p-5 ring-1 ring-inset ring-white/15 sm:p-7'>
			<div className='grid h-44 items-end gap-1.5 sm:gap-3' style={cols}>
				{bars.map(({ year, value }) => (
					<div key={year} className='flex h-full flex-col items-center justify-end'>
						<span className='num mb-1.5 whitespace-nowrap text-[0.5625rem] text-[var(--ink-2)] sm:text-[0.75rem]'>
							{value >= 1e9 ? `${(value / 1e9).toFixed(1)}B` : `${Math.round(value / 1e6)}M`}
						</span>
						<div
							className='w-full max-w-14 rounded-t-md'
							style={{ height: `calc(${(value / top) * 100}% - 1.5rem)`, minHeight: '2px', background: 'linear-gradient(to top, rgba(241,196,83,0.35), #f1c453)' }}
							title={`${year}: ₱${Math.round(value).toLocaleString('en-PH')}`}
						/>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-white/20 pt-2 sm:gap-3' style={cols}>
				{bars.map(({ year }) => (
					<span key={year} className='num text-center text-[0.65625rem] text-[var(--ink-3)] sm:text-[0.75rem]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<figcaption className='mt-4 flex flex-wrap items-baseline justify-between gap-2'>
				<span className='text-[0.8125rem] font-semibold text-white'>{caption}</span>
				{note ? <span className='text-[0.71875rem] text-white/65'>{note}</span> : null}
			</figcaption>
		</figure>
	)
}

/** A row of small bars, one a year, for under a figure. */
function Spark({ series, years }: { series: number[]; years: number[] }) {
	const top = Math.max(...series, 1)
	return (
		<div className='mb-4'>
			<div className='flex h-12 items-end gap-[6px]' aria-hidden='true'>
				{series.map((v, i) => (
					<span
						key={i}
						title={`${years[i]}: ${v.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`}
						className={`flex-1 rounded-t-[3px] ${i === series.length - 1 ? 'opacity-45' : ''}`}
						style={{ height: `${Math.max((v / top) * 100, 3)}%`, background: 'var(--accent)' }}
					/>
				))}
			</div>
			<div className='mt-1 flex justify-between text-[0.65625rem] text-[var(--ink-mute)]'>
				<span>{years[0]}</span>
				<span>{years.at(-1)}</span>
			</div>
		</div>
	)
}

export function Figures({
	title,
	note,
	items,
	years,
	plain = false,
}: {
	title: string
	note: string
	/** On the page's own paper rather than the warm wash. */
	plain?: boolean
	items: { value: string; label: string; series?: number[] }[]
	/** The years a figure's series runs over; the last is drawn lighter, as the year so far. */
	years?: number[]
}) {
	// The figures as rounded cards (user decision: the travel look), each its bars a year above the number.
	return (
		<section className={plain ? '' : 'tv-wash'}>
			<div className='bb-container py-[clamp(4rem,8vw,6.5rem)]'>
				<SectionHead title={title} note={note} />
				<dl className='mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
					{items.map((item) => (
						<div key={item.label} className='flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-4 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] sm:p-6'>
							{item.series && years ? <Spark series={item.series} years={years} /> : null}
							<dd className='num font-[family-name:var(--font-display)] text-[clamp(1.375rem,3vw,2.35rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
								{item.value}
							</dd>
							<dt className='mt-2 text-[0.8125rem] text-[var(--ink-3)]'>{item.label}</dt>
						</div>
					))}
				</dl>
			</div>
		</section>
	)
}

/** A section's head as travel's open: the title, its line under it, and anything for the right (a link to the rest). */
export function SectionHead({ title, note, children }: { title: string; note?: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className='flex flex-wrap items-end justify-between gap-x-10 gap-y-3'>
			<div className='min-w-0'>
				<h2 className='dv-title'>{title}</h2>
				{note ? <p className='dv-lede'>{note}</p> : null}
			</div>
			{children ? <div className='ml-auto'>{children}</div> : null}
		</div>
	)
}

/** The classes of a rounded card on the page's paper; `CARD_LINK` lifts on hover. */
export const CARD = 'rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)]'
export const CARD_LINK = `${CARD} transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]`
