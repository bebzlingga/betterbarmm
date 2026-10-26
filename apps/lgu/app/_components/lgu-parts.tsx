import Link from 'next/link'
import { lguData } from '@betterbarmm/lgu-data'
import { BarSegment, Counter, LineReveal, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'

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
			className='flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
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
}

/**
 * A masthead's headline figures, the way the legislation registry sets
 * them: on a brass rule, each a label, the number, and a line under it
 * that says what the number means.
 */
export function LguFigures({
	figures,
	className = 'mt-12 border-t border-[var(--brass-line)] pt-9',
}: {
	figures: LguFigure[]
	/** The rule and space above; the masthead's by default. */
	className?: string
}) {
	return (
		<div className={className}>
			<Stagger gap={0.08} className='grid gap-x-8 gap-y-9 min-[380px]:grid-cols-2 sm:gap-x-12 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-20'>
				{figures.map((figure) => (
					<StaggerItem key={figure.label}>
						<p className='bb-label'>{figure.label}</p>
						<p className='bb-figure-sm mt-4 text-[var(--ink)]'>
							{figure.count == null ? (
								figure.value
							) : (
								<>
									{figure.prefix}
									<Counter value={figure.count} group={figure.group ?? true} />
								</>
							)}
						</p>
						{figure.detail ? (
							<p className='mt-3 max-w-[16rem] text-[0.8125rem] leading-[1.55] text-[var(--ink-3)]'>{figure.detail}</p>
						) : null}
					</StaggerItem>
				))}
			</Stagger>
		</div>
	)
}

/**
 * The masthead of a directory page.
 *
 * Every page opens on the brand crimson (user decision). `.brand-bg`
 * re-points the tokens rather than restyling the parts, so the breadcrumb, the
 * badges, the figures, the share bar and the weave at the foot all invert
 * together.
 *
 * Cut down from the front page's masthead: a directory
 * page is somewhere a reader arrives with a question, not
 * somewhere they are being persuaded of anything, so the type is one step
 * smaller and there is no photograph.
 */
export function LguMasthead({
	breadcrumb,
	badges,
	kicker,
	name,
	note,
	noteBeside = false,
	noteEnd = false,
	center = false,
	chart = false,
	children,
}: {
	breadcrumb?: React.ReactNode
	/** Status pills — "Component city", "Capital". */
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: string
	/** Set the note to the right of the name on a wide screen, not under it. */
	noteBeside?: boolean
	/** Right-align the note beside the name (Stats). */
	noteEnd?: boolean
	/** Centre the kicker and the name (Governance Code). */
	center?: boolean
	/** A chart closes the masthead: less room under it. */
	chart?: boolean
	/** The figures row, and anything else that belongs above the fold. */
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice brand-bg relative overflow-hidden'>

			<div className={`bb-container relative pt-[clamp(3.75rem,7vw,6.5rem)] ${chart ? 'pb-[clamp(2rem,4vw,3rem)]' : 'pb-[clamp(3.75rem,7vw,6.5rem)]'} ${center ? 'text-center' : ''}`}>
				{breadcrumb}

				<Rise distance={12}>
					<div className={`${breadcrumb ? 'mt-8' : ''} flex flex-wrap items-center gap-2.5 ${center ? 'justify-center' : ''}`}>
						{badges}
						<span className='bb-label'>{kicker}</span>
					</div>
				</Rise>

				<div className={noteBeside ? 'lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16' : ''}>
					<LineReveal lines={[name]} delay={0.06} className='bb-display-md mt-5 text-[var(--ink)]' />

					{note ? (
						<Rise delay={0.25} distance={14}>
							<p className={`mt-7 text-[0.9375rem] leading-7 text-[var(--ink-2)] ${noteBeside ? 'lg:mt-0' : 'lg:max-w-[75%]'} ${noteEnd ? 'lg:text-right lg:leading-6' : ''}`}>
								{note}
							</p>
						</Rise>
					) : null}
				</div>

				{children}
			</div>

			<div className='bb-weave' aria-hidden='true' />
		</section>
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
			<div className='border-t border-[var(--brass-line)] pt-5'>
				<p className='bb-label'>About these figures</p>
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
