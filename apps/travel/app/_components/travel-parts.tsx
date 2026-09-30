import Link from 'next/link'
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

/** The trail back up, printed as a line rather than a widget. */
export function TravelBreadcrumb({
	trail,
	children,
}: {
	trail?: { label: string; href: string }[]
	children: React.ReactNode
}) {
	return (
		<nav
			aria-label='Breadcrumb'
			className='flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
		>
			<Link href='/' className='transition hover:text-[var(--brass)]'>
				Travel
			</Link>
			{(trail ?? []).map((step) => (
				<span key={step.href} className='flex items-center gap-2'>
					<span aria-hidden='true' className='text-[var(--brass)]'>
						/
					</span>
					<Link href={step.href} className='transition hover:text-[var(--brass)]'>
						{step.label}
					</Link>
				</span>
			))}
			<span aria-hidden='true' className='text-[var(--brass)]'>
				/
			</span>
			<span className='text-[var(--ink)]'>{children}</span>
		</nav>
	)
}

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
			<div className='mt-2.5 text-[14.5px] leading-7 text-[var(--ink-2)]'>{children}</div>
		</div>
	)
}

/**
 * The masthead of a guide page.
 *
 * The same warm ground and okir bloom the estate opens on, cut down one step —
 * a reader arrives at a guide page with a question rather than to be
 * persuaded of anything.
 */
export function TravelMasthead({
	breadcrumb,
	badges,
	kicker,
	name,
	note,
	children,
}: {
	breadcrumb: React.ReactNode
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: string
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice relative overflow-hidden'>

			<div className='bb-container relative pb-14 pt-12 lg:pb-16 lg:pt-16'>
				{breadcrumb}

				<Rise distance={12}>
					<div className='mt-8 flex flex-wrap items-center gap-2.5'>
						{badges}
						<span className='bb-label'>{kicker}</span>
					</div>
				</Rise>

				<LineReveal lines={[name]} delay={0.06} className='bb-display-md mt-5 text-[var(--ink)]' />

				{note ? (
					<Rise delay={0.25} distance={14}>
						<p className='mt-7 max-w-3xl text-[15.5px] leading-8 text-[var(--ink-2)]'>{note}</p>
					</Rise>
				) : null}

				{children}
			</div>

			<div className='bb-weave' aria-hidden='true' />
		</section>
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
					<li key={item} className='tv-gate text-[14px] leading-7 text-[var(--ink-2)]'>
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
					<span className='badge badge-plain !text-[9.5px]'>Signature</span>
				) : null}
			</div>

			<h3 className='item-title-lg mt-3'>{place.name}</h3>

			{place.alsoKnownAs?.length ? (
				<p className='mt-1 text-[12.5px] italic text-[var(--ink-3)]'>
					Also {place.alsoKnownAs.join(', ')}
				</p>
			) : null}

			<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{place.summary}</p>

			<p className='mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
				{place.municipality}
				{areaName ? ` · ${areaName}` : ''}
			</p>
		</article>
	)
}
