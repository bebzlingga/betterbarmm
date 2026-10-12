import { LineReveal, Rise } from '@betterbarmm/editorial'

/* The masthead and the year chart every page here opens with, in the Local
   Government workspace's style. */

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
	/** A chart closes the masthead: less room under it. */
	chart?: boolean
	/** The name across the full width with the note under it: for long names. */
	stacked?: boolean
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice brand-bg relative overflow-hidden'>
			<div className={`bb-container relative pt-[clamp(3.75rem,7vw,6.5rem)] ${chart ? 'pb-[clamp(2rem,4vw,3rem)]' : 'pb-[clamp(3.75rem,7vw,6.5rem)]'}`}>
				<Rise distance={12}>
					<span className='bb-label'>{kicker}</span>
				</Rise>
				<div className={stacked ? '' : 'lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'}>
					<LineReveal lines={[name]} delay={0.06} className={`bb-display-md mt-5 text-[var(--ink)] ${stacked ? 'max-w-[62rem] !font-black' : ''}`} />
					{note ? (
						<Rise delay={0.25} distance={14}>
							<p className={`mt-7 text-[15px] leading-7 text-[var(--ink-2)] ${stacked ? 'max-w-[44rem]' : 'lg:mt-0 lg:text-right lg:leading-6'}`}>{note}</p>
						</Rise>
					) : null}
				</div>
				{children}
			</div>
			<div className='bb-weave' aria-hidden='true' />
		</section>
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
		<figure className='m-0 mt-16 lg:mt-20'>
			<div className='grid h-44 items-end gap-1.5 sm:gap-4' style={cols}>
				{bars.map(({ year, value }) => (
					<div key={year} className='flex h-full flex-col items-center justify-end'>
						<span className='num mb-1.5 whitespace-nowrap text-[9px] text-[var(--ink-2)] sm:text-[12px]'>
							{value >= 1e9 ? `${(value / 1e9).toFixed(1)}B` : `${Math.round(value / 1e6)}M`}
						</span>
						<div
							className='w-full max-w-14'
							style={{ height: `calc(${(value / top) * 100}% - 1.5rem)`, minHeight: '2px', background: 'linear-gradient(to top, transparent, var(--accent))' }}
							title={`${year}: ₱${Math.round(value).toLocaleString('en-PH')}`}
						/>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-[var(--rule)] pt-2 sm:gap-4' style={cols}>
				{bars.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<figcaption className='mt-4 flex flex-wrap items-baseline justify-between gap-2'>
				<span className='text-[12.5px] font-semibold text-[var(--ink)]'>{caption}</span>
				{note ? <span className='text-[11px] text-[var(--ink-3)]'>{note}</span> : null}
			</figcaption>
		</figure>
	)
}

/** A row of headline figures, under a heading with its note to the right. */
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
						className={`flex-1 rounded-t-[2px] ${i === series.length - 1 ? 'opacity-45' : ''}`}
						style={{ height: `${Math.max((v / top) * 100, 3)}%`, background: 'var(--accent)' }}
					/>
				))}
			</div>
			<div className='mt-1 flex justify-between text-[10.5px] text-[var(--ink-mute)]'>
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
	/** On the page's own white rather than the light band. */
	plain?: boolean
	items: { value: string; label: string; series?: number[] }[]
	/** The years a figure's series runs over; the last is drawn lighter, as the year so far. */
	years?: number[]
}) {
	return (
		<section className={plain ? '' : 'bg-[var(--paper-2)]'}>
			<div className='bb-container pt-16 lg:pt-20'>
				<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
					<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{title}</h2>
					<p className='max-w-[38rem] text-[14px] leading-6 text-[var(--ink-3)] lg:text-right'>{note}</p>
				</div>
			</div>
			<dl className='bb-container grid grid-cols-2 gap-x-10 gap-y-10 pb-16 pt-10 lg:grid-cols-4 lg:gap-x-16 lg:pb-20 lg:pt-14'>
				{items.map((item) => (
					<div key={item.label}>
						{item.series && years ? <Spark series={item.series} years={years} /> : null}
						<dd className='num border-t border-[var(--rule)] pt-4 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.2vw,2.35rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
							{item.value}
						</dd>
						<dt className='mt-2 text-[12.5px] text-[var(--ink-3)]'>{item.label}</dt>
					</div>
				))}
			</dl>
		</section>
	)
}

/** A top-ten list as bars: label over a bar, the figure at its end. */
export function RankBars({
	title,
	note,
	items,
	format,
}: {
	title: string
	note: string
	items: { label: string; value: number; href?: string }[]
	format: 'peso' | 'count'
}) {
	const max = Math.max(...items.map((i) => i.value), 1)
	const show = (v: number) => (format === 'peso' ? peso(v) : v.toLocaleString('en-PH'))
	return (
		<figure className='m-0 min-w-0'>
			<figcaption>
				<h3 className='text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{title}</h3>
				<p className='mt-1 text-[12.5px] text-[var(--ink-3)]'>{note}</p>
			</figcaption>
			<ol className='mt-5 grid grid-cols-[minmax(0,1fr)] gap-3'>
				{items.map((item) => {
					const label = item.href ? (
						<a href={item.href} className='hover:text-[var(--accent)]'>
							{item.label}
						</a>
					) : (
						item.label
					)
					return (
						<li key={item.label}>
							<div className='flex items-baseline justify-between gap-4 text-[12.5px] leading-5'>
								<span className='min-w-0 truncate font-semibold text-[var(--ink)]' title={item.label}>
									{label}
								</span>
								<span className='num shrink-0 text-[var(--ink-2)]'>{show(item.value)}</span>
							</div>
							<div className='mt-1 h-2 bg-[var(--paper-2)]'>
								<div className='h-full bg-[var(--accent)]' style={{ width: `${(item.value / max) * 100}%` }} />
							</div>
						</li>
					)
				})}
			</ol>
		</figure>
	)
}
