import { LineReveal, Rise } from '@betterbarmm/editorial'
import { FOOTING_LABEL, PLACE_KIND_LABEL, type Place, type TravelFooting } from '@betterbarmm/travel-data'

/* ============================================================
   The parts a guide page is built from

   Two of these exist only in this workspace and are the reason it
   needed a stylesheet of its own: the footing badge and the caution
   block. Both are devices for telling the reader what kind of claim
   they are looking at, which is a problem the record-keeping
   workspaces do not have and this one has on every page.
   ============================================================ */

/**
 * How settled travel is in an area, as a chip.
 *
 * The label is the whole message — "Arrange before you go" says what to do,
 * where a color-coded dot would only say how worried to be. The color is
 * reinforcement, and the stylesheet's note explains why it is a warm ramp
 * rather than a traffic light.
 */
export function Footing({ footing }: { footing: TravelFooting }) {
	return (
		<span className='footing' data-footing={footing}>
			{FOOTING_LABEL[footing]}
		</span>
	)
}

/**
 * The block the security notes and the lodging caveat sit in.
 *
 * Deliberately not a filled warning panel: those get recognized as boilerplate
 * and skipped, and this is the text on the page most worth reading.
 */
export function Caution({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className='caution'>
			<p className='caution-label'>{label}</p>
			<div className='mt-2.5 text-[0.90625rem] leading-7 text-[var(--ink-2)]'>{children}</div>
		</div>
	)
}

/**
 * The masthead of a guide page, in the Local Government workspace's style:
 * the brand ground, the name to the left and its note to the right. What a
 * page passes as children (its facts, its chips) sits in a light band under
 * it rather than inside it.
 */
export function TravelMasthead({
	badges,
	kicker,
	name,
	note,
	children,
}: {
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: string
	children?: React.ReactNode
}) {
	return (
		<>
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)]'>
					<Rise distance={12}>
						<div className='flex flex-wrap items-center gap-2.5'>
							{badges}
							<span className='bb-label'>{kicker}</span>
						</div>
					</Rise>

					<div className='lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'>
						<LineReveal lines={[name]} delay={0.06} className='bb-display-md mt-5 text-[var(--ink)]' />
						{note ? (
							<Rise delay={0.25} distance={14}>
								<p className='mt-7 text-[0.9375rem] leading-7 text-[var(--ink-2)] lg:mt-0 lg:text-right lg:leading-6'>{note}</p>
							</Rise>
						) : null}
					</div>
				</div>

				<div className='bb-weave' aria-hidden='true' />
			</section>

			{children ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container py-10'>{children}</div>
				</section>
			) : null}
		</>
	)
}

/**
 * A section heading in the Local Government workspace's style: one plain
 * title, the note under it. Takes the estate SectionHead's props so a page
 * swaps one import; the counter and kicker are no longer drawn.
 */
export function SectionHead({
	title,
	titleMuted,
	lead,
	aside,
	className = '',
}: {
	index?: string
	eyebrow?: string
	title: string
	titleMuted?: string
	lead?: string
	aside?: React.ReactNode
	size?: 'md' | 'sm'
	className?: string
}) {
	return (
		<div className={className}>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
				<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
					{titleMuted ? `${title} ${titleMuted}` : title}
				</h2>
				{aside}
			</div>
			{lead ? <p className='mt-3 max-w-[48rem] text-[0.9375rem] leading-7 text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}

/** A bulleted list where the marker is the estate's lozenge. */
export function GateList({ items, label }: { items: string[]; label?: string }) {
	if (!items.length) return null

	return (
		<div>
			{label ? <p className='bb-label'>{label}</p> : null}
			<ul className={`grid gap-2.5 ${label ? 'mt-3.5' : ''}`}>
				{items.map((item) => (
					<li key={item} className='tv-gate text-[0.875rem] leading-7 text-[var(--ink-2)]'>
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}

/**
 * One place, as a card.
 *
 * `areaName` is passed in rather than looked up here so the card can be used
 * on an area page — where repeating the area on every card is noise — and on
 * the all-places page, where it is the thing that orients the reader.
 */
export function PlaceCard({ place, areaName }: { place: Place; areaName?: string }) {
	return (
		<article className='tv-card'>
			<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
				<span className='tv-kind'>{PLACE_KIND_LABEL[place.kind]}</span>
				{place.signature ? (
					<span className='badge badge-plain !text-[0.59375rem]'>Signature</span>
				) : null}
			</div>

			<h3 className='item-title-lg mt-3'>{place.name}</h3>

			{place.alsoKnownAs?.length ? (
				<p className='mt-1 text-[0.78125rem] italic text-[var(--ink-3)]'>
					Also {place.alsoKnownAs.join(', ')}
				</p>
			) : null}

			<p className='mt-3 text-[0.875rem] leading-7 text-[var(--ink-2)]'>{place.summary}</p>

			<p className='mt-4 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
				{place.municipality}
				{areaName ? ` · ${areaName}` : ''}
			</p>
		</article>
	)
}
