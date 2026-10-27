import { LineReveal, Rise } from '@betterbarmm/editorial'
import type { TravelPhoto } from '../_lib/media'
import { PhotoFigure } from './photo-figure'
import {
	AirplaneTiltIcon,
	BoatIcon,
	BusIcon,
	CarIcon,
	MopedIcon,
	MotorcycleIcon,
	MountainsIcon,
	PathIcon,
	SignpostIcon,
	VanIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
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
	compact = false,
	children,
}: {
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: string
	/** Less air above and below (user decision), for a page whose photographs follow straight after — a place. */
	compact?: boolean
	children?: React.ReactNode
}) {
	return (
		<>
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<div className={`bb-container relative ${compact ? 'py-10 lg:py-12' : 'py-[clamp(3.75rem,7vw,6.5rem)]'}`}>
					<Rise distance={12}>
						<div className='flex flex-wrap items-center gap-2.5'>
							{badges}
							<span className='bb-label'>{kicker}</span>
						</div>
					</Rise>

					<div className='lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16'>
						<LineReveal lines={[name]} delay={0.06} className={`bb-display-md mt-5 text-[var(--ink)] ${compact ? '!leading-[1.08]' : ''}`} />
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
				<section>
					<div className='bb-container pt-[clamp(3.75rem,7vw,6.5rem)]'>{children}</div>
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

/**
 * One section of a guide page, written as general reading (user decision): a heading, an optional line under it, and
 * the text in one column — no side panels, maps or summary boxes beside it.
 */
export function GuideSection({
	id,
	title,
	lede,
	photo,
	children,
}: {
	id?: string
	title: string
	lede?: string
	/** A photograph under the heading, where one belongs to the section (user decision: photos where useful). */
	photo?: TravelPhoto
	children: React.ReactNode
}) {
	return (
		<section id={id} className='scroll-mt-[calc(var(--sticky-top,0px)+1.5rem)] border-t border-[var(--rule)] py-12 first:border-t-0 lg:py-16'>
			<div className='max-w-[52rem]'>
				<h2 className='font-[family-name:var(--font-display)] text-[1.625rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>{title}</h2>
				{lede ? <p className='mt-2 text-[0.9375rem] leading-7 text-[var(--ink-3)]'>{lede}</p> : null}
				{photo ? <PhotoFigure photo={photo} className='tv-guide-photo' /> : null}
				<div className='bb-prose mt-8 !max-w-none'>{children}</div>
			</div>
		</section>
	)
}

/**
 * A guide page's body (user decision): the sections down the left, and beside them a list of the page's sections that
 * stays in view, so a long page can be read in any order and the right side is not left empty.
 */
export function GuideLayout({ toc, children }: { toc: { id: string; title: string }[]; children: React.ReactNode }) {
	return (
		<div className='bb-container grid gap-x-16 pb-16 lg:grid-cols-[minmax(0,1fr)_16rem]'>
			<div className='min-w-0'>{children}</div>
			<nav aria-label='On this page' className='hidden lg:block'>
				<div className='sticky top-[calc(var(--sticky-top,0px)+2rem)] mt-12 border-l-2 border-[var(--brass)] pl-5 transition-[top] duration-300 lg:mt-16'>
					<p className='bb-label'>On this page</p>
					<ol className='mt-4 grid gap-2.5'>
						{toc.map((item) => (
							<li key={item.id}>
								<a href={`#${item.id}`} className='text-[0.84375rem] leading-snug text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
									{item.title}
								</a>
							</li>
						))}
					</ol>
				</div>
			</nav>
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

/** How an item travels, read off its own words: the first match wins, so "fly … then overland" is a flight. */
const WAYS: [RegExp, Icon][] = [
	[/airport|\bfly\b|flights?\b|by air/i, AirplaneTiltIcon],
	[/ferr|boat|banca|fast craft|roro|crossing|sea conditions/i, BoatIcon],
	[/habal-habal/i, MotorcycleIcon],
	[/tricycle|multicab/i, MopedIcon],
	[/\bbus(es)?\b/i, BusIcon],
	[/\bvans?\b|jeepney/i, VanIcon],
	[/hired vehicle|driver|ride-hailing|taxi/i, CarIcon],
	[/uphill|rough/i, MountainsIcon],
	[/road|overland|highway/i, PathIcon],
]

const wayIcon = (item: string): Icon => WAYS.find(([pattern]) => pattern.test(item))?.[1] ?? SignpostIcon

/**
 * Getting there, or getting around: one column (user decision), each line led by the way it travels — a plane, a
 * boat, a van, a tricycle — so the list can be read down the icons before the words.
 */
export function WayList({ items, label, icon: Heading }: { items: string[]; label: string; icon: Icon }) {
	if (!items.length) return null

	return (
		<div>
			<h3 className='flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
				<Heading size={20} className='text-[var(--accent)]' aria-hidden='true' />
				{label}
			</h3>
			<ul className='mt-4 grid gap-1'>
				{items.map((item) => {
					const Glyph = wayIcon(item)
					return (
						<li key={item} className='flex gap-4 py-2.5'>
							<span className='grid size-10 shrink-0 place-items-center border border-[var(--rule)] bg-[var(--paper-2)] text-[var(--brass)]'>
								<Glyph size={19} aria-hidden='true' />
							</span>
							<span className='self-center text-[0.9375rem] leading-[1.65] text-[var(--ink-2)]'>{item}</span>
						</li>
					)
				})}
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
