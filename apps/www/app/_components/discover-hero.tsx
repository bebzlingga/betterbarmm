import { ArrowDownIcon, ArrowLeftIcon } from '@phosphor-icons/react/ssr'
import { LineReveal, Rise } from '@betterbarmm/editorial'
import Link from 'next/link'

/**
 * The opening of Discover and of every chapter in it: words only, on the brand band the site's other pages open on
 * (user decision — no photograph in the header). The photographs are in the chapters, beside what they show.
 */
export function DiscoverHero({
	kicker,
	/** The title, broken by hand; a second line is set in the muted tone. */
	lines,
	standfirst,
	backHref,
	backLabel,
	scrollTo,
	scrollLabel = 'Start reading',
	/** What the page holds, as chips under the standfirst. */
	chips,
	/** Anything extra beside the scroll cue — a count. */
	footnote,
	size = 'chapter',
}: {
	kicker: string
	lines: string[]
	standfirst: string
	backHref?: string
	backLabel?: string
	/** Fragment the scroll cue jumps to. */
	scrollTo?: string
	scrollLabel?: string
	chips?: string[]
	footnote?: React.ReactNode
	/** `index` is the larger cut used once, at the front of Discover. */
	size?: 'index' | 'chapter'
}) {
	return (
		<header className='brand-bg bb-lattice relative overflow-hidden'>
			<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='max-w-4xl'>
					{backHref ? (
						<Rise distance={10}>
							<Link
								href={backHref}
								className='inline-flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)] transition hover:text-[var(--ink)]'
							>
								<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
								{backLabel}
							</Link>
						</Rise>
					) : null}

					<Rise delay={0.06} distance={12}>
						<p className={`bb-label ${backHref ? 'mt-8' : ''}`}>{kicker}</p>
					</Rise>

					<LineReveal
						as='h1'
						lines={lines}
						delay={0.12}
						className={`${size === 'index' ? 'bb-display' : 'bb-display-md max-w-[22ch]'} mt-5 text-[var(--ink)]`}
						lineClassName={lines.map((_, i) => (i > 0 ? 'bb-mute' : undefined))}
					/>

					<Rise delay={0.3} distance={14}>
						<p className='mt-6 max-w-[38rem] text-[1.0625rem] leading-[1.65] text-[var(--ink-2)]'>{standfirst}</p>
					</Rise>

					{chips?.length ? (
						<Rise delay={0.38} distance={12}>
							<ul className='mt-6 flex flex-wrap gap-2'>
								{chips.map((c) => (
									<li
										key={c}
										className='rounded-full border border-[var(--rule)] px-3 py-1.5 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-2)]'
									>
										{c}
									</li>
								))}
							</ul>
						</Rise>
					) : null}

					{scrollTo ? (
						<Rise delay={0.46} distance={12}>
							<div className='mt-9 flex flex-wrap items-center gap-x-8 gap-y-4'>
								<a
									href={scrollTo}
									className='group inline-flex items-center gap-3 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'
								>
									<span className='bb-cue flex size-10 items-center justify-center rounded-full border border-[var(--rule)] transition group-hover:border-[var(--ink)]'>
										<ArrowDownIcon className='size-3.5' aria-hidden='true' />
									</span>
									{scrollLabel}
								</a>
								{footnote}
							</div>
						</Rise>
					) : null}
				</div>

			</div>
			<div className='bb-weave' aria-hidden='true' />
		</header>
	)
}

/** The chapter cut: the numbered kicker, the way back to the index, and what the chapter holds. */
export function DiscoverChapterHero({
	chapter,
	title,
	standfirst,
	chips,
	backHref = '/discover',
	backLabel = 'All chapters',
	scrollTo,
}: {
	chapter: string
	title: string
	standfirst: string
	chips?: string[]
	backHref?: string
	backLabel?: string
	scrollTo?: string
}) {
	return (
		<DiscoverHero
			kicker={chapter}
			lines={[title]}
			standfirst={standfirst}
			chips={chips}
			backHref={backHref}
			backLabel={backLabel}
			scrollTo={scrollTo}
		/>
	)
}
