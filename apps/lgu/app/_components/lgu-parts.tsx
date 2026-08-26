import Link from 'next/link'
import { lguData } from '@betterbarmm/lgu-data'
import { BarSegment, Counter, LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'

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
			className='flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'
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
			{note ? <p className='mt-2 text-[12px] leading-5 text-[var(--ink-3)]'>{note}</p> : null}
		</div>
	)
}

/**
 * The masthead of a directory page.
 *
 * The same warm ground and turning medallion the rest of the site opens on, cut
 * down: a directory page is somewhere a reader arrives with a question, not
 * somewhere they are being persuaded of anything, so the type is one step
 * smaller and there is no photograph.
 */
export function LguMasthead({
	breadcrumb,
	badges,
	kicker,
	name,
	note,
	children,
}: {
	breadcrumb: React.ReactNode
	/** Status pills — "Component city", "Capital". */
	badges?: React.ReactNode
	kicker: string
	name: string
	note?: string
	/** The figures row, and anything else that belongs above the fold. */
	children?: React.ReactNode
}) {
	return (
		<section className='bb-lattice relative overflow-hidden'>
			<OkirBloom className='absolute -right-[12%] -top-[46%] size-[min(34rem,80vw)] opacity-[0.13]' />

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

/**
 * One unit's share of the whole it belongs to, drawn.
 *
 * A municipality that is 31% of its province and one that is 3% are different
 * kinds of place, and "31%" in a table does not say so nearly as fast as a bar
 * that is a third full. The remainder is drawn too rather than left as empty
 * track — the point is the comparison, and a bar with nothing beside it is just
 * a coloured rectangle.
 */
export function ShareBar({
	share,
	label,
	ofLabel,
}: {
	/** 0–100. */
	share: number
	label: string
	ofLabel: string
}) {
	const rest = Math.max(0, 100 - share)

	return (
		<div>
			<div className='flex items-baseline justify-between gap-4'>
				<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
					{label}
				</p>
				<p className='num text-[13px] font-semibold text-[var(--accent)]'>{share}%</p>
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

			<p className='mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
				{ofLabel}
			</p>
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
				<p className='mt-4 max-w-3xl text-[12.5px] leading-6 text-[var(--ink-3)]'>
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
					, holding office to June 30, 2028. {lguData.note} A dash means the record has no figure —
					not a zero. Boundaries and office-holders change; where this differs from an official
					page, the official page is right.
				</p>
			</div>
		</Rise>
	)
}
