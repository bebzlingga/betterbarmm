import { ArrowRightIcon, ArrowUpRightIcon, BookOpenTextIcon } from '@phosphor-icons/react/dist/ssr'
import { Reveal } from './reveal'

/* ============================================================
   The explainer kit

   The four shapes every explanatory page in the registry is built
   from: a section with a kicker over a claim, a point with the rule
   it comes from printed under it, a lettered duty, and a figure with
   a note.

   They were defined three times over — once each in "How Parliament
   works", "The legislative process" and "What a member does" —
   because those were three pages. They are one page now, and one
   definition.
   ============================================================ */

export function Source({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
			{children}
		</a>
	)
}

/** A source as a pill (user decision: pill buttons): an outside document opens in a new tab, a page here in place. */
export function SourcePill({ href, children }: { href: string; children: React.ReactNode }) {
	const out = href.startsWith('http')
	return (
		<a href={href} {...(out ? { target: '_blank', rel: 'noreferrer' } : {})} className='dv-pill'>
			{out ? <ArrowUpRightIcon size={14} weight='bold' aria-hidden='true' className='text-[var(--accent)]' /> : <ArrowRightIcon size={14} weight='bold' aria-hidden='true' className='text-[var(--accent)]' />}
			{children}
		</a>
	)
}

/** One plain-language point, with the rule it comes from underneath. */
export function Point({
	title,
	children,
	cite,
}: {
	title: string
	children: React.ReactNode
	cite: string
}) {
	// A rounded card (user decision: the travel look), the rule it comes from as a chip at its foot.
	return (
		<div className='ex-point flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 sm:p-7'>
			<h3 className='font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-snug tracking-[-0.015em] text-[var(--ink)]'>{title}</h3>
			<div className='copy mt-2.5 text-[var(--ink-2)]'>{children}</div>
			{/* Held off the paragraph above it: the citation belongs to the point but is not part of reading it. */}
			<p className='mt-auto pt-5'>
				<span className='inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--brass)_14%,transparent)] px-3 py-1 text-[0.75rem] font-medium leading-snug text-[var(--brass-deep)]'>
					<BookOpenTextIcon size={13} weight='duotone' aria-hidden='true' className='shrink-0' />
					{cite}
				</span>
			</p>
		</div>
	)
}

/** A section's head in the travel look: the kicker in the accent, the title, the line under it; anything for its right. */
export function Head({ label, title, lead, children }: { label?: string; title: string; lead?: React.ReactNode; children?: React.ReactNode }) {
	return (
		<div className='flex flex-wrap items-end justify-between gap-x-8 gap-y-4'>
			<div className='max-w-3xl'>
				{label ? <p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>{label}</p> : null}
				<h2 className='dv-title mt-3'>{title}</h2>
				{lead ? <p className='dv-lede mt-4 text-[1rem]'>{lead}</p> : null}
			</div>
			{children}
		</div>
	)
}

/**
 * A section, headed the way the page itself is: the kicker in the accent and
 * the claim under it, both ranged left, so the heading shares an edge with the
 * points beneath it and with the index in the margin.
 */
export function Block({
	id,
	label,
	title,
	lead,
	children,
}: {
	id: string
	label: string
	title: string
	/** A node, not a string: one section's lead carries a link inside it. */
	lead?: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Reveal>
			{/* `scroll-mt` clears the bars, so a jump from the index lands on the kicker. The reading face throughout; the
			    heads keep the display face. Points are cards, two to a row from a wide screen; anything else a section
			    carries (a table, a diagram, a list) runs the full width. */}
			<section id={id} className='ex-block scroll-mt-24 font-sans'>
				<Head label={label} title={title} lead={lead} />
				<div className='mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0 [&>:not(.ex-point)]:md:col-span-2'>{children}</div>
			</section>
		</Reveal>
	)
}

/**
 * One duty, lettered as the rulebook letters it.
 *
 * The letter is kept because it is how the duty is cited: a reader taking one
 * of these to a member wants to name the sub-paragraph, not paraphrase it.
 */
export function Duty({ letter, children }: { letter: string; children: React.ReactNode }) {
	return (
		<li className='flex items-start gap-4 [li+&]:mt-3 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-4 sm:p-5'>
			<span className='grid size-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] font-[family-name:var(--font-display)] text-[0.8125rem] font-bold text-[var(--accent)]'>
				{letter}
			</span>
			<span className='copy pt-0.5 text-[var(--ink-2)]'>{children}</span>
		</li>
	)
}

/** A figure with what it covers under it — the pay and allowance rows. */
export function Figure({
	value,
	label,
	children,
}: {
	value: string
	label: string
	children?: React.ReactNode
}) {
	return (
		<div className='ex-point rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6'>
			<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
				<p className='num text-xl font-black leading-none text-[var(--ink)]'>{value}</p>
				<p className='item-title text-[var(--ink)]'>{label}</p>
			</div>
			{children ? (
				<p className='mt-2 bb-body text-[var(--ink-3)]'>{children}</p>
			) : null}
		</div>
	)
}

