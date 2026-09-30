import Image from 'next/image'
import Link from 'next/link'
import { LineReveal, Rise, Stagger, StaggerItem } from './motion'

export type FooterLink = { href: string; label: string }
export type FooterColumn = { title: string; links: FooterLink[] }

/**
 * The estate's own sitemap, for the columns an app does not override.
 *
 * Links are relative, and `base` is prefixed to the internal ones — so the
 * landing site gets `/discover/history` and a workspace on its own subdomain
 * gets `https://betterbarmm.com/discover/history` from the same list. Absolute
 * URLs are left alone, because a workspace link is already absolute wherever it
 * is read from.
 */
const ESTATE_COLUMNS: FooterColumn[] = [
	{
		title: 'Discover',
		links: [
			{ href: '/discover/history', label: 'History' },
			{ href: '/discover/governance', label: 'Government' },
			{ href: '/discover/local-government', label: 'Local Government' },
			{ href: '/discover/people', label: 'People' },
			{ href: '/discover/culture-places', label: 'Culture & Places' },
		],
	},
	{
		title: 'Workspaces',
		links: [
			{ href: 'https://betterbarmm.com/soon', label: 'Election' },
			{ href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
			{ href: 'https://betterbarmm.com/soon', label: 'Budget' },
			{ href: 'https://betterbarmm.com/soon', label: 'Local government' },
		],
	},
	{
		title: 'Project',
		links: [
			{ href: '/about', label: 'About' },
			{ href: '/contribute', label: 'Contribute' },
			{ href: 'mailto:support@betterbarmm.com', label: 'Email us' },
			{ href: 'https://www.facebook.com/betterbarmm', label: 'Facebook' },
		],
	},
]

const isAbsolute = (href: string) => href.startsWith('http') || href.startsWith('mailto:')

/**
 * Where the project can be followed.
 *
 * These two because these two exist. Adding a row is adding a line here, and
 * nothing else on the estate has to change — but a row pointing at an account
 * that has not been made costs more credibility than it buys in reach.
 */
const FOLLOW: { href: string; label: string }[] = [
	{ href: 'https://www.facebook.com/betterbarmm', label: 'Facebook' },
	{ href: 'mailto:support@betterbarmm.com', label: 'Email us' },
]

/**
 * A footer link as a numbered row on a hairline, rather than an entry in a
 * stack of grey text. The rule is what makes a short list of four read as a
 * deliberate index instead of leftovers at the bottom of the page.
 */
function FooterRow({ href, label, index }: FooterLink & { index: number }) {
	const external = isAbsolute(href)

	const body = (
		<>
			<span className='num text-[10.5px] text-[var(--ink-mute)] transition group-hover:text-[var(--brass)]'>
				{String(index + 1).padStart(2, '0')}
			</span>
			<span className='min-w-0 flex-1 break-words'>{label}</span>
			<span
				aria-hidden='true'
				className='translate-x-0 text-[var(--ink-mute)] opacity-0 transition group-hover:translate-x-0.5 group-hover:text-[var(--brass)] group-hover:opacity-100'
			>
				{external ? '↗' : '→'}
			</span>
		</>
	)

	// Baseline, not center: a label that wraps to two lines set the index and
	// the arrow against the middle of the block, so "02" floated between its
	// own two lines instead of sitting on the first one.
	const className =
		'group flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2.5 text-[14px] text-[var(--ink-2)] transition hover:text-[var(--ink)]'

	return external ? (
		<a
			href={href}
			target={href.startsWith('http') ? '_blank' : undefined}
			rel={href.startsWith('http') ? 'noreferrer' : undefined}
			className={className}
		>
			{body}
		</a>
	) : (
		<Link href={href} className={className}>
			{body}
		</Link>
	)
}

/**
 * The foot of every page on the estate — the landing site and all four
 * workspaces.
 *
 * Set on the dark ground rather than on paper. The pages above it run warm, and
 * without a floor the content simply stopped and a column of grey links began —
 * a footer that reads as the page running out rather than as the page ending.
 * Inverting it closes the document, and on a page that opened on a full-bleed
 * photograph it bookends it.
 *
 * The palette comes entirely from `.bb-ground` re-pointing the tokens, so every
 * control inside — the field, the button, the rules — restyles itself without a
 * single dark variant written here.
 *
 * It lives in this package rather than in each app because five copies of a
 * footer is five things to forget when a link changes. Everything an app
 * legitimately differs on is a prop; everything else is the same everywhere,
 * which is the whole point of a standard footer.
 */
export function SiteFooter({
	/** Prefixed to internal hrefs, for an app that is not on betterbarmm.com. */
	base = '',
	columns = ESTATE_COLUMNS,
	/** The paragraph under the wordmark — what this site is, in two sentences. */
	blurb = 'A public transparency project for the Bangsamoro. We organize public records into workspaces you can read, question, and trace back to the source.',
	/** The small capitals under the blurb — a place, or a dataset. */
	note = 'Cotabato City · Bangsamoro Autonomous Region in Muslim Mindanao',
	/** The line ranged right on the bottom rule. */
	bottomRight,
	/** Drop the mailing-list band — for a surface where the ask would be wrong. */
	follow = true,
}: {
	base?: string
	columns?: FooterColumn[]
	blurb?: React.ReactNode
	note?: React.ReactNode
	bottomRight?: React.ReactNode
	/** The band above the sitemap. On everywhere; the flag is for a surface
	    that already asks somewhere else on the page. */
	follow?: boolean
}) {
	const resolve = (href: string) => (isAbsolute(href) ? href : `${base}${href}`)
	const home = base || '/'

	return (
		<footer className='bb-ground bb-lattice bb-lattice-soft relative isolate overflow-hidden'>
			{/* ---- The one ask ----
			    Follow rather than subscribe (user decision). An inbox is a promise to
			    send something on a schedule nobody here has committed to; a page you
			    can follow is where the work already goes when it lands.

			    No kicker over it. The heading says what the band is on its own, and
			    without a label the row is heading against links, which is what
			    `items-center` was always aligning. */}
			{follow ? (
				<div className='bb-container relative z-2'>
					<div className='border-b border-[var(--rule)] py-14 lg:py-16'>
						<div className='flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between'>
							<div className='max-w-lg'>
								<LineReveal
									as='h2'
									lines={['Join the movement.']}
									className='text-[1.7rem] font-extrabold leading-[1.12] tracking-[-0.035em] text-[var(--ink)] sm:text-[2.2rem]'
								/>
								<p className='mt-4 text-[15px] leading-[1.7] text-[var(--ink-2)]'>
									Government works better when citizens can check it for themselves. That is what
									we are here to make possible, and it is not a job for a few people.
								</p>
							</div>

							{/* Only the accounts this project actually has. A row of five
							    icons where three of them point at pages nobody has made is
							    worse than two that work. */}
							<ul className='flex shrink-0 flex-wrap gap-3'>
								{FOLLOW.map((one) => (
									<li key={one.href}>
										<a
											href={one.href}
											target={isAbsolute(one.href) ? '_blank' : undefined}
											rel={one.href.startsWith('http') ? 'noreferrer noopener' : undefined}
											className='group inline-flex items-center gap-3 border border-[var(--ink)] px-5 py-3 text-[13.5px] font-semibold tracking-[-0.01em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]'
										>
											{one.label}
											<span
												aria-hidden='true'
												className='text-[var(--ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-[var(--paper)]'
											>
												&rarr;
											</span>
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			) : null}

			{/* ---- Statement and sitemap ---- */}
			<div className='bb-container relative z-2 pb-8 pt-14 sm:pb-10 sm:pt-20'>
				{/* Two areas, not five columns: the mark and notice take the free space,
				    and the link lists share one content-sized column so they sit at
				    their natural width instead of being stretched across equal tracks
				    with dead space trailing off the right.

				    The gap between the two is wide on purpose. They are a statement
				    and a sitemap — different kinds of thing — and at the old 5rem the
				    blurb ran close enough to the first column of links to read as one
				    block of text in four ragged columns. Stacked, the same distance
				    separates the mark from the lists under it. */}
				<div className='grid gap-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-32'>
					<div className='lg:max-w-xl'>
						{/* Always the light-ink cut: the ground under it is dark in both
						    themes, so the theme-switching pair would put the dark mark on a
						    dark panel half the time. */}
						<a href={home} className='inline-block'>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={168}
								height={31}
								style={{ height: 30, width: 'auto' }}
							/>
						</a>

						<Rise delay={0.08} distance={14}>
							{/* No cap of its own: the wrapper's measure is the measure. A
							    second, narrower one here meant the statement broke at 28rem
							    inside a 36rem column, leaving a hand's width of dead ground
							    to its right on every page of the estate. */}
							{/* Below the reading size. This is the note at the foot of the page
						    explaining what the site is, not something anybody came to read,
						    and at `bb-body` it had the same weight as the prose above it. */}
						<p className='mt-7 text-[14px] leading-[1.7] text-[var(--ink-2)]'>{blurb}</p>

							{note ? (
								<p className='mt-7 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									{note}
								</p>
							) : null}
						</Rise>
					</div>

					{/* The track these sit in is `auto`, which is max-content: whatever the
					    longest label asks for, the column takes. Unbounded, one
					    seventy-character link ("Infrastructure Modernization and Public
					    Asset Construction and Transformation") claimed the whole row and
					    squeezed the blurb beside it to one word per line. The cap makes a
					    long label wrap inside its own column instead, which is the only
					    thing it can do that does not deform the page. */}
					<Stagger gap={0.08} className='grid gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-10'>
						{columns.map((column) => (
							<StaggerItem
								key={column.title}
								className='min-w-[10rem] max-w-[15rem]'
								distance={12}
							>
								<p className='border-b border-[var(--brass-line)] pb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
									{column.title}
								</p>
								<div className='mt-1'>
									{column.links.map((link, index) => (
										<FooterRow
											key={link.href + link.label}
											href={resolve(link.href)}
											label={link.label}
											index={index}
										/>
									))}
								</div>
							</StaggerItem>
						))}
					</Stagger>
				</div>

				<div className='mt-16 flex flex-col justify-between gap-2 border-t border-[var(--rule)] pt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--ink-mute)] sm:flex-row sm:items-center lg:mt-20'>
					<p>2026 betterbarmm.com — public domain unless otherwise specified</p>
					<p>
						{bottomRight ?? (
							<>
								Inspired by{' '}
								<a
									href='https://bettergov.ph'
									target='_blank'
									rel='noreferrer'
									className='text-[var(--ink-3)] transition hover:text-[var(--brass)]'
								>
									bettergov.ph
								</a>
							</>
						)}
					</p>
				</div>
			</div>
		</footer>
	)
}
