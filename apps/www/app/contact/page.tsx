import { ArrowRightIcon, ArrowUpRightIcon, BuildingsIcon, EnvelopeSimpleIcon, FacebookLogoIcon, FlagIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BADGE, CARD, CARD_FOOT, ICON_TILE, PageBand, SectionTitle } from '../_components/page-band'
import { SiteHeader } from '../_components/site-header'
import { hotlines, telHref } from '../_lib/directory'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Contact',
	description: 'How to reach the people behind BetterBARMM, and where to go instead for a government office, a town hall or an emergency.',
	path: '/contact',
})

/** The ways to reach the project itself. */
const channels = [
	{
		icon: EnvelopeSimpleIcon,
		label: 'Email',
		title: 'support@betterbarmm.com',
		body: 'Questions, corrections, sources, press and partnerships. One address reaches the people who maintain every workspace.',
		href: 'mailto:support@betterbarmm.com',
		action: 'Write to us',
		external: false,
	},
	{
		icon: FacebookLogoIcon,
		label: 'Facebook',
		title: 'facebook.com/betterbarmm',
		body: 'New explainers, datasets and updates as they go up. Messages there reach us too.',
		href: 'https://www.facebook.com/betterbarmm',
		action: 'Follow the page',
		external: true,
	},
	{
		icon: FlagIcon,
		label: 'Report',
		title: 'Something wrong on a page',
		body: 'A number that no longer works, a head who has changed, a figure that does not match its source.',
		href: '/report',
		action: 'Report it',
		external: false,
	},
]

export default function ContactPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<PageBand
				label='Contact BetterBARMM'
				title='Get in touch'
				standfirst='BetterBARMM is an independent project, not a government office. Write to us about the site and its records; for a ministry, a town hall or an emergency, the right numbers are below.'
				jumps={[
					{ href: '#reach', label: 'Reach the project', icon: EnvelopeSimpleIcon },
					{ href: '#government', label: 'Reach the government', icon: BuildingsIcon },
					{ href: '#emergency', label: 'Emergency', icon: SirenIcon },
				]}
			/>

			{/* ---- The project ---- */}
			<section id='reach' aria-labelledby='reach-title' className='bb-container scroll-mt-4 bb-section'>
				<SectionTitle id='reach' title='Three ways to reach us' lead='One team maintains every workspace on the site; any of these reaches it.' />
				<ul className='mt-8 grid gap-4 md:grid-cols-3'>
					{channels.map((c) => (
						<li key={c.label} className={CARD}>
							<div className='flex flex-1 flex-col items-center px-6 pb-6 pt-8 text-center'>
								<span className={ICON_TILE}>
									<c.icon size={24} weight='duotone' aria-hidden='true' />
								</span>
								<span className={`${BADGE} mt-4`}>{c.label}</span>
								<p className='mt-3 break-words text-[1.125rem] font-extrabold leading-snug tracking-[-0.02em]'>
									{/* The card's one link, stretched over it. */}
									<a href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
										{c.title}
									</a>
								</p>
								<p className='mt-2 text-[0.875rem] leading-[1.65] text-[var(--ink-2)]'>{c.body}</p>
							</div>
							<p className={CARD_FOOT}>
								{c.action}
								{c.external ? <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' /> : <ArrowRightIcon size={13} weight='bold' aria-hidden='true' />}
							</p>
						</li>
					))}
				</ul>
				<p className='mt-6 text-[0.875rem] text-[var(--ink-3)]'>
					Sending a source or a correction?{' '}
					<Link href='/contribute' className='font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
						Here is what to include
					</Link>
					, so it can be checked quickly.
				</p>
			</section>

			{/* ---- The government ---- */}
			<section id='government' aria-labelledby='government-title' className='tv-wash scroll-mt-4'>
				<div className='bb-container dv-section'>
					<SectionTitle
						id='government'
						title='Need the government? Go straight to it'
						lead='We cannot act on a request to a ministry, a permit or a complaint about a service. These reach the people who can.'
					/>
					<div className='mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
						<div className={CARD}>
							<div className='flex flex-1 gap-5 p-6 lg:p-8'>
								<span className={`${ICON_TILE} shrink-0`}>
									<BuildingsIcon size={24} weight='duotone' aria-hidden='true' />
								</span>
								<span className='min-w-0'>
									<Link href='/directory' className='text-[1.375rem] font-extrabold leading-tight tracking-[-0.025em] after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
										The Directory
									</Link>
									<span className='mt-2 block text-[0.9375rem] leading-[1.7] text-[var(--ink-2)]'>
										Every regional office and its head, the national offices in the region, every governor and mayor, each town&rsquo;s police,
										fire and health lines, and the 80 Members of Parliament.
									</span>
								</span>
							</div>
							<p className={CARD_FOOT}>
								Find an office <ArrowRightIcon size={13} weight='bold' aria-hidden='true' />
							</p>
						</div>

						<div id='emergency' className='flex scroll-mt-4 flex-col rounded-[1.25rem] bg-[#8f2328] p-6 text-white lg:p-8'>
							<span className='flex items-center gap-3'>
								<span className='grid size-12 shrink-0 place-items-center bg-white/15'>
									<SirenIcon size={26} weight='fill' aria-hidden='true' />
								</span>
								<span>
									<span className='block text-[1.375rem] font-extrabold leading-tight'>In an emergency, call 911</span>
									<span className='mt-1 block text-[0.84375rem] text-white/80'>Each town&rsquo;s own police, fire and health lines are on its page in the Directory.</span>
								</span>
							</span>
							{hotlines.length ? (
								<ul className='mt-6 grid gap-3 border-t border-white/20 pt-5'>
									{hotlines.map((h) => (
										<li key={h.name + h.number}>
											<a href={telHref(h.number)} className='group flex flex-col hover:text-white'>
												<span className='text-[0.8125rem] leading-5 text-white/75'>{h.name}</span>
												<span className='mt-0.5 inline-flex items-center gap-2 text-[1.125rem] font-bold tabular-nums group-hover:underline'>
													<PhoneIcon size={16} weight='bold' aria-hidden='true' /> {h.number}
												</span>
											</a>
										</li>
									))}
								</ul>
							) : null}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
