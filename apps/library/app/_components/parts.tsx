import { LineReveal, Rise } from '@betterbarmm/editorial'

/* The masthead every page here opens with, in the estate's style. */
export function Masthead({
	kicker,
	name,
	note,
	stacked = false,
	children,
}: {
	kicker: string
	name: string
	note?: string
	/** The name across the full width with the note under it: for long names. */
	stacked?: boolean
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice brand-bg relative overflow-hidden'>
			<div className='bb-container relative pb-[clamp(3.75rem,7vw,6.5rem)] pt-[clamp(3.75rem,7vw,6.5rem)]'>
				<Rise distance={12}>
					<span className='bb-label'>{kicker}</span>
				</Rise>
				<div className={stacked ? '' : 'lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'}>
					<LineReveal lines={[name]} delay={0.06} className={`bb-display-md mt-5 text-[var(--ink)] ${stacked ? '!font-black' : ''}`} />
					{note ? (
						<Rise delay={0.25} distance={14}>
							<p className={`mt-7 text-[0.9375rem] leading-7 text-[var(--ink-2)] ${stacked ? 'max-w-[44rem]' : 'lg:mt-0 lg:text-right lg:leading-6'}`}>{note}</p>
						</Rise>
					) : null}
				</div>
				{children}
			</div>
			<div className='bb-weave' aria-hidden='true' />
		</section>
	)
}

export const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
export const NOTE = 'max-w-[38rem] text-[0.875rem] leading-6 text-[var(--ink-3)] lg:text-right'
export const CHIP = 'inline-flex items-center gap-1.5 border border-[var(--rule)] px-3 py-1.5 text-[0.75rem] font-semibold text-[var(--ink-2)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]'

/** A heading with its note to the right, as every section here opens. */
export function SectionHead({ title, note, children }: { title: string; note?: string; children?: React.ReactNode }) {
	return (
		<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-16'>
			<h2 className={H2}>{title}</h2>
			{note ? <p className={NOTE}>{note}</p> : null}
			{children}
		</div>
	)
}

/** A row of headline figures. */
export function Figures({ items }: { items: { value: string; label: string }[] }) {
	return (
		<dl className='bb-container grid grid-cols-2 gap-x-10 gap-y-10 py-14 lg:grid-cols-4 lg:gap-x-16 lg:py-16'>
			{items.map((item) => (
				<div key={item.label}>
					<dd className='num border-t border-[var(--rule)] pt-4 font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.2vw,2.35rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
						{item.value}
					</dd>
					<dt className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>{item.label}</dt>
				</div>
			))}
		</dl>
	)
}
