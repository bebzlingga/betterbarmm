import type { Icon } from '@phosphor-icons/react'
import { LineReveal, Rise } from '@betterbarmm/editorial'

/* The masthead every page here opens with, in the estate's style. */
export function Masthead({
	kicker,
	name,
	note,
	stacked = false,
	aside,
	children,
}: {
	kicker: string
	name: string
	note?: string
	/** The name across the full width with the note under it: for long names. */
	stacked?: boolean
	/** Set on the right of the kicker's line: a page's outside links. */
	aside?: React.ReactNode
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice brand-bg relative overflow-hidden'>
			<div className='bb-container relative pb-[clamp(3.75rem,7vw,6.5rem)] pt-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='flex flex-wrap items-start justify-between gap-x-8 gap-y-4'>
					<Rise distance={12}>
						<span className='bb-label'>{kicker}</span>
					</Rise>
					{aside}
				</div>
				<div className={stacked ? '' : 'lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'}>
					<LineReveal lines={[name]} delay={0.06} className={`bb-display-md mt-5 text-[var(--ink)] ${stacked ? '!font-black' : ''}`} />
					{note ? (
						<Rise delay={0.25} distance={14}>
							<p className={`mt-7 text-[1.0625rem] leading-7 text-[var(--ink-2)] ${stacked ? 'max-w-[44rem]' : 'lg:mt-0 lg:text-right lg:leading-6'}`}>{note}</p>
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
export function Figures({ items }: { items: { value: string; label: string; icon: Icon }[] }) {
	return (
		<dl className='bb-container grid grid-cols-2 gap-x-10 gap-y-10 py-14 lg:grid-cols-4 lg:gap-x-16 lg:py-16'>
			{items.map(({ icon: Glyph, ...item }) => (
				<div key={item.label} className='border-t border-[var(--rule)] pt-5'>
					<dd className='num font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.2vw,2.35rem)] font-black leading-none tracking-[-0.03em] text-[var(--ink)]'>
						<span aria-hidden className='mb-4 grid size-11 place-items-center rounded-full bg-[var(--paper)] text-[var(--accent)] ring-1 ring-[var(--rule)]'>
							<Glyph size={22} weight='duotone' />
						</span>
						{item.value}
					</dd>
					<dt className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>{item.label}</dt>
				</div>
			))}
		</dl>
	)
}

/** A press's logo on a white tile, or its initials where it has none. */
export function PublisherMark({ name, logo, className = 'size-14' }: { name: string; logo?: string | null; className?: string }) {
	if (logo)
		return (
			<span className={`grid shrink-0 place-items-center bg-white p-1.5 ${className}`}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={logo} alt='' loading='lazy' className='max-h-full max-w-full object-contain' />
			</span>
		)
	return (
		<span aria-hidden className={`grid shrink-0 place-items-center bg-[var(--paper-2)] font-[family-name:var(--font-display)] text-[0.9375rem] font-black tracking-[-0.02em] text-[var(--ink-3)] ring-1 ring-[var(--rule)] ${className}`}>
			{initials(name)}
		</span>
	)
}

/** Up to 3 capitals from a name, for a mark where there is no picture. */
const initials = (name: string) =>
	name
		.replace(/\(.*?\)/g, '')
		.split(/[\s-]+/)
		.filter((w) => /^[A-Z]/.test(w) && !['The', 'Of', 'And'].includes(w))
		.map((w) => w[0])
		.join('')
		.slice(0, 3) || name[0]

/** An author's portrait in a circle, or their initials where there is none. */
export function AuthorMark({ name, photo, className = 'size-14' }: { name: string; photo?: string | null; className?: string }) {
	return photo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={photo} alt='' loading='lazy' className={`shrink-0 rounded-full object-cover ${className}`} />
	) : (
		<span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-[var(--paper-2)] font-[family-name:var(--font-display)] text-[0.9375rem] font-black tracking-[-0.02em] text-[var(--ink-3)] ${className}`}>
			{initials(name)}
		</span>
	)
}
