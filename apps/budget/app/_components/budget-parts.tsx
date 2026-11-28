import { ArrowLeftIcon } from '@phosphor-icons/react/ssr'
import { Counter, Rise } from '@betterbarmm/editorial'
import { EXPENSE_CLASSES, budgetFor, percent, peso, type Totals } from '@betterbarmm/budget-data'
import { YearLink } from './year-link'
import { Money } from './money'

/* ============================================================
   The pieces every budget page is built from

   Four of them, and they are here rather than repeated per page
   because the whole argument of the workspace is that the same
   figure means the same thing wherever it appears. A peso amount
   is set the same on the home page and on the forty-fourth office
   page, and the three expense classes keep their colors and their
   order everywhere.
   ============================================================ */

/**
 * The head of a page that is not the home page.
 *
 * Breadcrumb, kicker, claim, then the sentence that qualifies it — the same
 * four-part opening every section head on the estate uses, at page scale.
 */
export function Masthead({
	back,
	kicker,
	title,
	titleMuted,
	lead,
	mark,
	center = false,
	aside,
	children,
}: {
	back?: { href: string; label: string }
	kicker: string
	title: string
	titleMuted?: string
	lead?: React.ReactNode
	/** A mark set above the claim — the sector pages put their icon here. */
	mark?: React.ReactNode
	/**
	 * Center the whole head.
	 *
	 * Off everywhere the page is a record: a left edge is what lets a reader run
	 * down a column of figures. On for a page that is a single thing addressed
	 * to them — the questions — where centerd reads as an opening rather than as
	 * the first row of something.
	 */
	center?: boolean
	/**
	 * Something set beside the claim rather than under it.
	 *
	 * For a chart, which answers the heading at a glance and is wasted stacked
	 * below it at full width. Two columns only from `lg`: at narrower widths a
	 * chart squeezed into half a phone is a smear, so it drops under the text
	 * where it has the whole measure.
	 */
	aside?: React.ReactNode
	children?: React.ReactNode
}) {
	/* Every page opens on the crimson header under the clear bars (user decision: the travel look, as the registry's).
	   What a page hands in as `children` (its figures, its chart) sits on the paper under the header (user decision:
	   figures below the header), except on a centred head, where it is the head's own search. */
	const top = (
		<div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${center ? 'justify-center' : ''}`}>
			{back ? (
				<>
					<YearLink
						href={back.href}
						className='group inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[0.75rem] font-semibold text-white/85 transition hover:bg-white/10 hover:text-white'
					>
						<ArrowLeftIcon className='size-3.5 transition duration-500 group-hover:-translate-x-0.5' aria-hidden='true' />
						{back.label}
					</YearLink>
				</>
			) : null}
			<p className='pg-hero-kicker'>{kicker}</p>
		</div>
	)
	return (
		<>
			<header className='dv-hero brand-bg bb-lattice'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -top-[22rem] left-1/2 -z-10 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>
				<span aria-hidden='true' className='bb-weave absolute inset-x-0 bottom-0' />
				<div
					className={`bb-container relative flex flex-col justify-end ${center ? 'items-center text-center' : ''} ${aside ? 'lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-20' : ''}`}
				>
					<div className='min-w-0'>
						{top}
						{mark ? <div className='mt-6'>{mark}</div> : null}
						<h1 className={`pg-hero-title mt-4 ${center ? 'mx-auto' : ''} ${aside ? '!max-w-none' : ''}`}>
							{title}
							{titleMuted ? <span className='block text-white/55'>{titleMuted}</span> : null}
						</h1>
						{lead ? <div className={`mt-5 max-w-3xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.125rem] ${center ? 'mx-auto' : ''}`}>{lead}</div> : null}
						{center ? children : null}
					</div>
					{aside ? <div className='mt-10 min-w-0 lg:mt-0'>{aside}</div> : null}
				</div>
			</header>
			{!center && children ? <div className='bt-under bb-container'>{children}</div> : null}
		</>
	)
}

/**
 * A row of figures under a masthead.
 *
 * Counted up rather than printed, because a budget's numbers are the whole
 * point of the page and a figure that arrives is read; one that was already
 * there is scrolled past.
 */
export function StatRow({
	stats,
	delay = 0.4,
}: {
	stats: { value: number; label: string; money?: boolean; decimals?: number; suffix?: string }[]
	delay?: number
}) {
	return (
		<Rise delay={delay} distance={14}>
			{/* Each figure on a rounded card under the header (user decision: the travel look, figures below the header);
			    the lead figure, a peso amount of seventeen glyphs, takes two tracks on a wide screen. */}
			<dl className='grid grid-cols-2 gap-3 lg:flex'>
				{stats.map((stat, i) => (
					<div
						key={stat.label}
						className={`flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] lg:min-w-[12rem] lg:flex-1 lg:p-6 ${i === 0 ? 'col-span-2 lg:flex-[2]' : ''}`}
					>
						<dt className='order-2 mt-2 text-[0.78125rem] leading-[1.5] text-[var(--ink-3)]'>{stat.label}</dt>
						<dd className='money order-1 font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.4vw,2.125rem)] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
							{stat.money ? (
								<ExactMoney amount={stat.value} />
							) : (
								<Counter value={stat.value} group decimals={stat.decimals ?? 0} suffix={stat.suffix ?? ''} />
							)}
						</dd>
					</div>
				))}
			</dl>
		</Rise>
	)
}

/**
 * A peso figure, in full.
 *
 * Every amount on this workspace is the exact one the Act prints (user
 * decision). "₱26.5 billion" is easier to say and it is not what was
 * appropriated; ₱26,491,916,338 is. On a site whose whole claim is that a
 * figure can be checked against a page of the Act, a rounded figure is one the
 * reader cannot check.
 *
 * Counted up in one piece rather than split into a number and a unit, because
 * there is no longer a unit to hold still while the number runs.
 */
function ExactMoney({ amount }: { amount: number }) {
	return (
		<span>
			{/* Two decimals, to agree with `peso()`. Rounded here and exact in the
			    prose beside it, the same amount was printed two different ways on
			    one page. */}
			₱<Counter value={amount} group decimals={2} />
		</span>
	)
}

/* ---- The three expense classes ---------------------------------------- */

/**
 * The stacked bar every total on this site is split into, with its legend.
 *
 * Legend always, direct labels on every segment wide enough to hold one: the
 * three classes are told apart by their position and their printed share as
 * well as by color, so the bar still works for a reader who cannot separate
 * the blue from the orange, or who prints it.
 *
 * `layout='inline'` drops the legend to one line for a table cell or a row in
 * a list, where the full legend would be four lines of chrome around three
 * numbers.
 */
export function ExpenseSplit({
	totals,
	layout = 'block',
	label,
}: {
	totals: Totals
	layout?: 'block' | 'inline'
	label?: string
}) {
	const whole = totals.total || 1
	const parts = EXPENSE_CLASSES.map((one) => ({
		...one,
		amount: totals[one.key],
		share: (totals[one.key] / whole) * 100,
	})).filter((one) => one.amount > 0)

	if (parts.length === 0) return null


	/* The bar in both layouts (user decision, reverting the pie). A length is
	   easier to compare than an angle, and the bar carries its own labeling —
	   each class is a width as well as a color, so it still works for a reader
	   who cannot separate the blue from the olive, or who prints it. The two
	   layouts differ only in how much legend they hang under it. */
	return (
		<div>
			{label ? <p className='bb-label mb-3'>{label}</p> : null}

			<div
				/* Capped and centerd in the inline layout (user decision): in a list
				   row the bar had the whole middle column to run in, which made a
				   three-part split of one office read as a chart of the whole page.
				   22rem is the width the province tracks on the home page use. */
				className={`split-bar ${layout === 'inline' ? 'split-bar-sm mx-auto max-w-[22rem]' : ''}`}
				role='img'
				aria-label={`Split by expense class: ${parts
					.map((one) => `${one.label}, ${peso(one.amount)}, ${percent(one.share)}`)
					.join('; ')}`}
			>
				{parts.map((one) => (
					<div
						key={one.key}
						className='split-bar-seg'
						style={{ width: `${one.share}%`, background: one.tone }}
						title={`${one.label} — ${peso(one.amount)} (${percent(one.share)})`}
					/>
				))}
			</div>

			{layout === 'inline' ? (
				<p className='mt-2.5 flex flex-wrap justify-center gap-x-5 gap-y-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]'>
					{parts.map((one) => (
						<span key={one.key} className='flex items-center gap-1.5'>
							<span
								aria-hidden='true'
								className='size-2 shrink-0 rotate-45'
								style={{ background: one.tone }}
							/>
							{/* The share, then the class (user decision): the row already
							    prints this office's total one column to the right, so what the
							    legend is for is the proportions. The peso figure behind each
							    share is still in the segment's `title` and in the bar's own
							    `aria-label`, and in full on the office's page. */}
							<span className='money text-[var(--ink)]'>{percent(one.share)}</span>
							{one.short}
						</span>
					))}
				</p>
			) : (
				<dl
					/* A wide gutter between the three. Each column ends on a percentage
					   ranged hard right, so at 2rem that figure sat against the next
					   column's mark and the row read as six columns rather than three. */
					className='mt-5 grid gap-x-16 gap-y-5 sm:grid-cols-3'
				>
					{parts.map((one) => (
						<div key={one.key}>
							<dt className='flex items-center gap-2'>
								<span
									aria-hidden='true'
									className='size-2.5 shrink-0 rotate-45'
									style={{ background: one.tone }}
								/>
								<span className='text-[0.8125rem] font-semibold leading-tight text-[var(--ink)]'>
									{one.short}
								</span>
								<span className='money ml-auto text-[0.8125rem] font-semibold text-[var(--ink)]'>
									{percent(one.share)}
								</span>
							</dt>
							<dd className='mt-2'>
								<p className='money text-[0.9375rem] font-semibold tracking-[-0.02em] text-[var(--ink)]'>
									<Money amount={one.amount} />
								</p>
								<p className='mt-1.5 text-[0.78125rem] leading-6 text-[var(--ink-2)]'>{one.plain}</p>
							</dd>
						</div>
					))}
				</dl>
			)}
		</div>
	)
}

/* ---- Where a figure came from ------------------------------------------ */

/**
 * The line at the foot of a page saying which pages of the Act it was read
 * from.
 *
 * Every page carries one. The claim this whole estate makes is that a figure
 * can be checked, and a figure whose source is a page number somebody has to
 * ask for has not really been published.
 *
 * Full width rather than a measure column: it is one line of credit, not a
 * paragraph to read, and capped at a measure it broke across three lines under
 * a caveat that runs the whole width of the page.
 */
export function SourceNote({
	pages,
	what,
	fy,
	inline = false,
}: {
	pages?: number[]
	what: string
	fy?: string
	/**
	 * Run on from the sentence before it rather than set as a note of its own.
	 *
	 * The office page reads "…the region's head of state. Figures from BAA No.
	 * 15, pages 158–160 as printed." — one sentence about the office and one
	 * about where its figures came from, which belong together. Kept as a
	 * variant of this rather than written out there, so provenance is worded
	 * the same way wherever it appears.
	 */
	inline?: boolean
}) {
	/* The year, not the latest year. This names the Act every figure above it
	   came from, and `printedPages` converts PDF pages to the Act's own — an
	   offset that is three in FY 2026 and two in FY 2025. Cited from the wrong
	   year it would send a reader to the wrong page of the wrong document. */
	const { budget, printedPages } = budgetFor(fy)
	const printed = printedPages(pages)

	const said = (
		<>
			{what} from <span className={inline ? undefined : 'text-[var(--ink-2)]'}>{budget.actLong}</span>
			{printed ? (
				<>
					{/* "136" is a page; "136–150" and "136, 142" are both pages. */}
					, {/[–,]/.test(printed) ? 'pages' : 'page'} <span className='money'>{printed}</span> as
					printed
				</>
			) : null}
			.{' '}
			<YearLink href='/sources' className='rule-link'>
				How this was compiled
			</YearLink>
			{/* Every line of every Act, as a table: the open data project's budget page. */}
			{' · '}
			<a href='https://betterbarmm.com/data/budget' className='rule-link'>
				Download every line as CSV or JSON
			</a>
		</>
	)

	if (inline) return said

	return (
		<p className='mt-10 border-t border-[var(--rule)] pt-5 text-[0.75rem] leading-6 text-[var(--ink-3)]'>
			{said}
		</p>
	)
}

/* ---- The caveat -------------------------------------------------------- */

/**
 * What an appropriation is, and is not.
 *
 * This started as a modal that opened over every page on arrival, then became
 * a disclosure folded shut under the figures. Both were wrong in the same
 * direction: it is the single most important thing to say about these numbers,
 * and a reader who has to open it to read it mostly does not. So it is set
 * out in full, across the width of the page, on every page where somebody
 * might take an appropriation for money already spent.
 *
 * One column, heading above the prose, across the full width of the page
 * (user decision). The label sat in a column of its own to the left first,
 * which kept the lines short but read as a sidebar rather than as the note it
 * is.
 */
export function AppropriationNote({ className = '', fy }: { className?: string; fy?: string }) {
	const { budget } = budgetFor(fy)
	return (
		<section
			aria-label='What these figures are, and what they are not'
			className={`border-t border-[var(--brass-line)] pt-6 ${className}`}
		>
			<h2 className='font-mono text-[0.625rem] font-semibold uppercase leading-5 tracking-[0.16em] text-[var(--brass)]'>
				What these figures are, and what they are not
			</h2>

			<div className='mt-5 space-y-3.5 text-[0.84375rem] leading-7 text-[var(--ink-2)]'>
				<p>
					Every figure here is an{' '}
					<strong className='font-semibold text-[var(--ink)]'>appropriation</strong>: what Parliament
					authorised an office to spend in {budget.fiscalYear}. It is not what was spent, and it is
					not what was released. An office can be appropriated ₱1 billion and obligate half of it;
					the difference is reported in documents this workspace does not yet hold.
				</p>
				<p>
					The figures are reproduced exactly as the Act prints them, including where they do not add
					up. Several ministries print Personnel Services at the Operations line only and not against
					each program under it, so a column of program rows can total less than the heading above
					it. That is the Act, not an error here — a transparency site that quietly corrects its own
					source is no longer one.
				</p>
			</div>
		</section>
	)
}
