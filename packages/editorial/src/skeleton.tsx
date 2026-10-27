/* ============================================================
   Skeletons: the shape of what is coming, while it comes

   Every wait on every workspace (user decision) — a page streaming
   in, a list fetched in the browser, a search on its way back —
   shows grey blocks where the content will land, rather than a
   line of text saying "Loading…".

   And the blocks sit exactly where it lands (user decision: match
   the spacing and padding). A `SkeletonLine` is given the classes of
   the text it stands for — its size, its leading, its margin — and
   is one line of that text tall (`1lh`), with the bar drawn where the
   letters would be. A `RowsSkeleton` is given the real row's own
   classes for its padding, rules and grid. So a list in grey is the
   list's height, row for row, and nothing jumps when it arrives.

   The shimmer is one CSS class, `.bb-skeleton`, in this package's
   stylesheet, drawn in a wash of the ink so it reads on paper, on
   the tinted bands and in dark mode alike, and still under a
   reduced-motion preference.

   No 'use client': nothing here holds state, so a server page and
   a client component can both use it.
   ============================================================ */

/** Varied, but fixed, so a row is the same width on every render and the server and browser agree. */
const WIDTHS = [78, 62, 86, 70, 56, 82, 66, 74]

/** One grey block. Size it with classes; a block is a field, a picture, a button. */
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
	return <span aria-hidden='true' className={`bb-skeleton ${className}`} style={style} />
}

/**
 * One line of text, in grey. Give it the classes of the text it stands for — size, leading, margin, tracking — and
 * it is exactly one line of that text tall, with the bar at the height of its letters.
 */
export function SkeletonLine({ className = '', width = '100%' }: { className?: string; width?: string }) {
	// A block line box with an inline bar in it, so the bar follows the text's own alignment — left, centred, right —
	// as the words it stands for would (user decision: match text centre).
	return (
		<span aria-hidden='true' className={`block h-[1lh] ${className}`}>
			<span className='bb-skeleton bb-skeleton-line' style={{ width }} />
		</span>
	)
}

/** A line of a row: the text's classes, and how long it runs as a share of the usual length. */
export type SkeletonText = string | { className: string; scale?: number; width?: string }

const parse = (line: SkeletonText) => (typeof line === 'string' ? { className: line } : line)

/**
 * Rows of a list or table, each built like the real one: `row` is the real row's classes (padding, rules, grid),
 * `lines` its lines of text down the left, `figure` the lines ranged right, `lead` a picture before them.
 */
export function RowsSkeleton({
	rows = 8,
	row = 'flex items-start justify-between gap-10 border-b border-[var(--rule-soft)] py-4',
	lines = ['text-[0.90625rem] leading-snug', { className: 'mt-1 text-[0.75rem] leading-snug', scale: 0.5 }],
	figure = ['text-[0.875rem]'],
	lead,
	className = '',
}: {
	rows?: number
	row?: string
	lines?: SkeletonText[]
	/** The lines on the right, where a row carries an amount or a count; false for none. */
	figure?: SkeletonText[] | false
	/** A picture before the text, by its classes — `size-10 rounded-full` for a portrait. */
	lead?: string
	className?: string
}) {
	return (
		<div aria-hidden='true' className={className}>
			{Array.from({ length: rows }, (_, i) => (
				<div key={i} className={row}>
					{lead ? <Skeleton className={`shrink-0 ${lead}`} /> : null}
					<div className='min-w-0 flex-1'>
						{lines.map((line, j) => {
							const { className: text, scale = 1, width } = parse(line)
							return <SkeletonLine key={j} className={text} width={width ?? `${WIDTHS[(i + j * 3) % WIDTHS.length]! * scale}%`} />
						})}
					</div>
					{figure ? (
						<div className='shrink-0'>
							{figure.map((line, j) => {
								const { className: text, width } = parse(line)
								return <SkeletonLine key={j} className={`text-right ${text}`} width={width ?? (j ? '4rem' : '5.5rem')} />
							})}
						</div>
					) : null}
				</div>
			))}
		</div>
	)
}

/**
 * A whole page while it loads, on the estate's own measures and grounds (user decision: match the spacing, the
 * alignment and the background). The masthead is drawn on the band the app's mastheads use — `brand-bg` or
 * `bb-crimson`, with the lattice and the woven foot — and the grey turns to a white wash on it by itself, since the
 * band re-points the ink. `center` is the centred hero some front pages open with: one column, a search field in it.
 */
export function PageSkeleton({
	band = 'brand-bg',
	center = false,
	pad,
	rows = 8,
}: {
	/** The class of the app's masthead ground; '' for plain paper. */
	band?: string
	/** The centred hero: label, one headline line, standfirst and a search field, all on one axis. */
	center?: boolean
	/** The band's vertical padding, where a page's own differs from the default for its kind. */
	pad?: string
	rows?: number
}) {
	return (
		<div role='status' className='min-h-[70vh]'>
			<span className='sr-only'>Loading…</span>
			<section aria-hidden='true' className={`${band} ${band ? 'bb-lattice' : ''} relative overflow-hidden`}>
				{center ? (
					<div className={`bb-container relative ${pad ?? 'py-20 lg:py-32'}`}>
						<div className='mx-auto max-w-5xl text-center'>
							<SkeletonLine className='text-[0.625rem]' width='16rem' />
							<SkeletonLine className='bb-display-md mt-6' width='min(40rem, 90%)' />
							<div className='mx-auto mt-7 max-w-2xl text-[0.9375rem] leading-8'>
								<SkeletonLine width='95%' />
								<SkeletonLine width='70%' />
							</div>
							<Skeleton className='mx-auto mt-8 h-14 w-full max-w-2xl' />
						</div>
					</div>
				) : (
					<div className={`bb-container relative ${pad ?? 'py-[clamp(3.75rem,7vw,6.5rem)]'}`}>
						{/* The kicker's size, not its class: `.bb-label` would draw its diamond in front of the bar. */}
						<SkeletonLine className='text-[0.625rem]' width='10rem' />
						<div className='bb-display-md mt-6'>
							<SkeletonLine width='min(36rem, 85%)' />
							<SkeletonLine width='min(26rem, 65%)' />
						</div>
						<div className='mt-7 text-[0.9375rem] leading-8'>
							<SkeletonLine width='min(40rem, 90%)' />
							<SkeletonLine width='min(28rem, 64%)' />
						</div>
					</div>
				)}
				{band ? <div className='bb-weave' /> : null}
			</section>
			<div aria-hidden='true' className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
				{/* The estate's search field: 0.95rem of padding around a 1.45rem line. */}
				{center ? null : <Skeleton className='h-[3.35rem] w-full max-w-xl' />}
				<RowsSkeleton rows={rows} className={center ? '' : 'mt-8'} />
			</div>
		</div>
	)
}
