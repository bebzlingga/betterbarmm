import type { Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { lguData } from '@betterbarmm/lgu-data'
import { BarSegment, Counter, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Hero } from './hero'

/** The trail back up the hierarchy, printed as a line rather than a widget. */
export function LguBreadcrumb({
	trail,
	children,
}: {
	trail: { label: string; href: string }[]
	children: React.ReactNode
}) {
	return (
		<nav
			aria-label='Breadcrumb'
			className='flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'
		>
			<Link href='/' className='transition hover:text-[var(--brass)]'>
				Local government
			</Link>
			{trail.map((step) => (
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
 * A figure with its label, on a brass hairline.
 *
 * `value` is the printed string, because most of these are already formatted —
 * a land area with its unit, a dash where the record has no figure, a signed
 * percentage. `count` is the same figure as a number, and when it is given the
 * figure counts up to it instead of appearing. Both are needed: the count
 * cannot format "1,204 km²" and the string cannot be animated.
 */
export function LguStat({
	value,
	count,
	label,
	note,
	/** Group thousands while counting — right for a population, wrong for a year. */
	group = true,
	suffix = '',
}: {
	value: string
	count?: number | null
	label: string
	note?: string
	group?: boolean
	suffix?: string
}) {
	return (
		<div className='lgu-stat'>
			<p className='lgu-stat-value'>
				{count == null ? (
					value
				) : (
					<Counter value={count} group={group} suffix={suffix} />
				)}
			</p>
			<p className='lgu-stat-label'>{label}</p>
			{note ? <p className='mt-2 text-[0.75rem] leading-5 text-[var(--ink-3)]'>{note}</p> : null}
		</div>
	)
}

export type LguFigure = {
	label: string
	value: string
	/** Counted up to on arrival; leave off for a value that is not a plain count. */
	count?: number | null
	/** Group thousands while counting — right for a population, wrong for a year. */
	group?: boolean
	/** Set before a counted value, e.g. ₱. */
	prefix?: string
	detail?: React.ReactNode
	/** A picture of what is counted, on a tile beside the label. */
	icon?: Icon
}

/**
 * A page's headline figures, each on a rounded card of its own under the crimson header (user decision: the travel look,
 * the figures below the header as the registry's front page sets them): the label, the number, a line on what it means.
 */
export function LguFigures({ figures, className = '' }: { figures: LguFigure[]; className?: string }) {
	// Columns on a wide screen: one row up to six, two even rows past that.
	const per = figures.length <= 6 ? figures.length : Math.ceil(figures.length / 2)
	const cols = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5', 'lg:grid-cols-6'][per]
	return (
		<Stagger gap={0.06} className={`grid grid-cols-2 gap-3 sm:grid-cols-3 max-sm:[&>:last-child:nth-child(odd)]:col-span-2 ${cols} ${className}`}>
			{figures.map((figure) => (
				<StaggerItem
					key={figure.label}
					className='flex min-w-0 flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] lg:p-6'
				>
					<div className='flex items-start justify-between gap-3'>
						<p className='text-[0.65625rem] font-semibold uppercase leading-4 tracking-[0.12em] text-[var(--accent)]'>{figure.label}</p>
						{figure.icon ? (
							<span className='-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
								<figure.icon size={18} weight='duotone' aria-hidden='true' />
							</span>
						) : null}
					</div>
					<p className='num mt-3 truncate font-[family-name:var(--font-display)] text-[clamp(1.75rem,2.4vw,2.25rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
						{figure.count == null ? (
							figure.value
						) : (
							<>
								{figure.prefix}
								<Counter value={figure.count} group={figure.group ?? true} />
							</>
						)}
					</p>
					{figure.detail ? <p className='mt-3 text-[0.8125rem] leading-snug text-[var(--ink-3)]'>{figure.detail}</p> : null}
				</StaggerItem>
			))}
		</Stagger>
	)
}

/** A section's heading as the landing site sets it: the title on the left, a line on what it holds on the right. */
export function SectionTitle({ title, count, lead, className = '' }: { title: React.ReactNode; count?: number; lead?: React.ReactNode; className?: string }) {
	return (
		<div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-2 ${className}`}>
			<h2 className='dv-title'>
				{title}{' '}
				{count != null ? <span className='ml-1 align-middle text-[0.55em] font-semibold tracking-normal text-[var(--ink-mute)]'>{count.toLocaleString('en-PH')}</span> : null}
			</h2>
			{lead ? <p className='max-w-xl text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]'>{lead}</p> : null}
		</div>
	)
}

export { CARD, CARD_FOOT } from './card'

/**
 * The top of a directory page on the crimson header every page opens on, under the clear bars (user decision: the
 * travel look): the trail, the badges and label, the name and what the page holds; a chart closes it where a page has
 * one (`children`). The headline figures sit on cards under the header (`figures`).
 */
export function LguMasthead({
	breadcrumb,
	badges,
	kicker,
	name,
	note,
	figures,
	side,
	children,
}: {
	breadcrumb?: React.ReactNode
	/** Status pills — "Component city", "Capital". */
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: React.ReactNode
	/** Kept for the callers; a chart in the header needs nothing different now. */
	chart?: boolean
	/** The headline figures, on cards under the header. */
	figures?: LguFigure[]
	/** A column on the right of the words from a wide screen. */
	side?: React.ReactNode
	/** A chart or a note that belongs in the header. */
	children?: React.ReactNode
}) {
	return (
		<>
			<Hero
				above={breadcrumb}
				top={
					<div className='flex flex-wrap items-center gap-2.5'>
						{badges}
						<span className='pg-hero-kicker'>{kicker}</span>
					</div>
				}
				title={name}
				small={name.length > 48}
				lede={note}
				auto={Boolean(children)}
				side={side}
			>
				{children}
			</Hero>
			{figures?.length ? (
				<section className='lgu-under bb-container'>
					<LguFigures figures={figures} />
				</section>
			) : null}
		</>
	)
}

/**
 * One unit's share of the whole it belongs to, drawn.
 *
 * A municipality that is 31% of its province and one that is 3% are different
 * kinds of place, and "31%" in a table does not say so nearly as fast as a bar
 * that is a third full. The remainder is drawn too rather than left as empty
 * track — the point is the comparison, and a bar with nothing beside it is just
 * a colored rectangle.
 */
export function ShareBar({
	share,
	label,
	ofLabel,
	caption = true,
}: {
	/** 0–100. */
	share: number
	label: string
	ofLabel: string
	/** Print `ofLabel` under the bar; off, it is only the remainder's tooltip. */
	caption?: boolean
}) {
	const rest = Math.max(0, 100 - share)

	return (
		<div>
			<div className='flex items-baseline justify-between gap-4'>
				<p className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
					{label}
				</p>
				<p className='num text-[0.8125rem] font-semibold text-[var(--accent)]'>{share}%</p>
			</div>

			<div className='bb-bar mt-3'>
				<BarSegment
					index={0}
					className='h-full origin-left'
					style={{ width: `${share}%`, background: 'var(--accent)' }}
					title={`${label}: ${share}%`}
				/>
				<BarSegment
					index={1}
					className='h-full origin-left'
					style={{
						width: `${rest}%`,
						background: 'color-mix(in oklab, var(--brass) 34%, transparent)',
					}}
					title={`${ofLabel}: ${Math.round(rest * 10) / 10}%`}
				/>
			</div>

			{caption ? (
				<p className='mt-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
					{ofLabel}
				</p>
			) : null}
		</div>
	)
}

/**
 * Where the numbers on this page came from, and what is missing from them.
 *
 * Printed on every page of the directory rather than once on the index. A
 * reader who lands on a single municipality from a search result never sees the
 * index, and the vintage of the underlying record is exactly the thing they
 * would otherwise have no way to know.
 */
export function LguSourceNote({ className = '' }: { className?: string }) {
	return (
		<Rise className={className} distance={12}>
			<div className='rounded-[var(--dv-r)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] p-6 sm:p-8'>
				<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>About these figures</p>
				<div className='mt-4 space-y-3 text-[0.78125rem] leading-6 text-[var(--ink-3)]'>
					<p>
						Structure from the{' '}
						<a
							href={lguData.sources.structure.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							Philippine Standard Geographic Code
						</a>
						; population and land area from{' '}
						<a
							href={lguData.sources.demographics.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							Wikidata
						</a>
						, which carries PSA&rsquo;s census figures with their census dates. Population is the{' '}
						<a
							href={lguData.sources.census.href}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							2024 Census of Population
						</a>
						. Elected officials are the winners in COMELEC&rsquo;s{' '}
						<a
							href={
								lguData.officials?.terms.find((t) => t.status === 'current')?.source.href ??
								'https://2025electionresults.comelec.gov.ph/'
							}
							target='_blank'
							rel='noreferrer'
							className='rule-link'
						>
							2025 Certificates of Canvass
						</a>
						, holding office to June 30, 2028.
					</p>

					<p>{lguData.note}</p>

					<p>
						A dash means the record has no figure — not a zero. Boundaries and office-holders
						change; where this differs from an official page, the official page is right.
					</p>
				</div>
			</div>
		</Rise>
	)
}
