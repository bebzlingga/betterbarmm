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

/** One plain-language point, with the rule it comes from underneath. */
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
	return (
		<div className='border-t border-[var(--rule-soft)] py-6 first:border-t-0 first:pt-0'>
			<h3 className='item-title text-[var(--ink)]'>{title}</h3>
			<div className='copy mt-2.5 text-[var(--ink-2)]'>{children}</div>
			{/* Held off the paragraph above it — the citation belongs to the point
			    but is not part of reading it. */}
			<p className='meta-sm mt-4'>{cite}</p>
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
			{/* The reading face throughout. Outfit is the interface — labels, nav,
			    the masthead — and everything below that on this page is something
			    to be read rather than looked at, so it takes DM Sans. The kicker
			    keeps Outfit: `.eyebrow` sets its own family. */}
			{/* `scroll-mt` clears the sticky header, so a jump from the index lands
			    on the kicker rather than behind the bar. */}
			<section id={id} className='scroll-mt-32 py-14 font-sans lg:py-20'>
				<p className='eyebrow'>{label}</p>
				{/* The claim keeps the display face: it is a heading to look at, not
				    reading matter, so DM Sans stops at the text beneath it. */}
				<h2 className='section-title mt-4 max-w-3xl'>{title}</h2>
				{lead ? <p className='section-lead mt-4 max-w-2xl text-[var(--ink-3)]'>{lead}</p> : null}

				{/* The same distance from a head to its content the rest of the estate
				    uses — `.bb-head-gap`, one value for every section on every site. */}
				<div className='bb-head-gap-top max-w-4xl'>{children}</div>
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
		<li className='flex gap-4 border-t border-[var(--rule-soft)] py-4 first:border-t-0 first:pt-0'>
			<span className='num mt-px w-4 shrink-0 text-[13px] font-semibold text-[var(--ink-mute)]'>
				{letter}
			</span>
			<span className='copy text-[var(--ink-2)]'>{children}</span>
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
		<div className='border-t border-[var(--rule-soft)] py-5 first:border-t-0 first:pt-0'>
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

