import { LineReveal, Rise } from '@betterbarmm/editorial'

/* The masthead and the year chart every page here opens with, in the Local
   Government workspace's style. */

export function Masthead({
	kicker,
	name,
	note,
	chart = false,
	children,
}: {
	kicker: string
	name: string
	note?: string
	/** A chart closes the masthead: less room under it. */
	chart?: boolean
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice brand-bg relative overflow-hidden'>
			<div className={`bb-container relative pt-[clamp(3.75rem,7vw,6.5rem)] ${chart ? 'pb-[clamp(2rem,4vw,3rem)]' : 'pb-[clamp(3.75rem,7vw,6.5rem)]'}`}>
				<Rise distance={12}>
					<span className='bb-label'>{kicker}</span>
				</Rise>
				<div className='lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'>
					<LineReveal lines={[name]} delay={0.06} className='bb-display-md mt-5 text-[var(--ink)]' />
					{note ? (
						<Rise delay={0.25} distance={14}>
							<p className='mt-7 text-[15px] leading-7 text-[var(--ink-2)] lg:mt-0 lg:text-right lg:leading-6'>{note}</p>
						</Rise>
					) : null}
				</div>
				{children}
			</div>
			<div className='bb-weave' aria-hidden='true' />
		</section>
	)
}

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

/** A row of headline figures. */
export function Figures({ items }: { items: { value: string; label: string }[] }) {
	return (
		<dl className='mt-12 grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4'>
			{items.map((item) => (
				<div key={item.label} className='border-t border-[var(--rule)] pt-3'>
					<dd className='num font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.2vw,2.35rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
						{item.value}
					</dd>
					<dt className='mt-2 text-[12.5px] text-[var(--ink-3)]'>{item.label}</dt>
				</div>
			))}
		</dl>
	)
}
