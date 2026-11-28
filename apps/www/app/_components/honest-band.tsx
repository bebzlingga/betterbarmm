import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'

type Action = { href: string; label: string }

/**
 * A page's closing ask in the travel look (user decision: replaces the crimson CtaPanel), the sibling of the site's
 * GetInvolved band: a warm light band, the headline on the left, the line and two rounded buttons on the right.
 * Reused across the site (Discover's "Keep it honest", About, Contribute, Jo, the explainers).
 */
export function HonestBand({
	label,
	title,
	standfirst,
	primary,
	secondary,
}: {
	label: string
	title: string
	standfirst: string
	/** The solid accent pill. */
	primary: Action
	/** The outlined pill beside it. */
	secondary?: Action
}) {
	return (
		<section className='tv-ask'>
			<div className='bb-container grid gap-10 py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:py-32'>
				<div>
					<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>{label}</p>
					<h2 className='mt-4 max-w-[36rem] font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.2vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-[var(--ink)]'>
						{title}
					</h2>
				</div>
				<div>
					<p className='max-w-xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>{standfirst}</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						<Link
							href={primary.href}
							className='inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold text-white transition hover:-translate-y-px hover:brightness-110'
						>
							{primary.label}
							<ArrowRightIcon size={15} weight='bold' aria-hidden='true' />
						</Link>
						{secondary ? (
							<Link
								href={secondary.href}
								className='inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--paper)] px-6 py-3.5 font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]'
							>
								{secondary.label}
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</section>
	)
}
