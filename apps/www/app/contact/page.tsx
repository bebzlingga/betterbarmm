import { ArrowRightIcon, ArrowUpRightIcon, BuildingsIcon, EnvelopeSimpleIcon, FacebookLogoIcon, FlagIcon, PhoneIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Masthead, SectionHead } from '../_components/masthead'
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

			<Masthead
				brand
				label='Contact BetterBARMM'
				lines={['Get in touch.', 'We read everything.']}
				muted={[1]}
				standfirst='BetterBARMM is an independent project, not a government office. Write to us about the site and its records; for a ministry, a town hall or an emergency, the right numbers are below.'
			/>

			{/* ---- The project ---- */}
			<section className='bb-container bb-section'>
				<SectionHead index='01' eyebrow='Reach the project' title='Three ways' titleMuted='to reach us.' />
				<Stagger gap={0.08} className='mt-10 grid gap-4 md:grid-cols-3'>
					{channels.map((c) => (
						<StaggerItem key={c.label} className='h-full'>
							<a
								href={c.href}
								{...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
								className='group flex h-full flex-col rounded-[3px] border border-[var(--rule)] p-6 transition hover:border-[var(--ink-3)] lg:p-7'
							>
								<span className='flex items-center justify-between'>
									<span className='grid size-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white'>
										<c.icon size={22} weight='duotone' aria-hidden='true' />
									</span>
									<span className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>{c.label}</span>
								</span>
								<p className='mt-6 break-words text-[1.15rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{c.title}</p>
								<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>{c.body}</p>
								<span className='mt-6 inline-flex items-center gap-1.5 border-t border-[var(--rule)] pt-4 text-[0.8125rem] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>
									{c.action}
									{c.external ? (
										<ArrowUpRightIcon className='ml-auto size-3.5' weight='bold' aria-hidden='true' />
									) : (
										<ArrowRightIcon className='ml-auto size-3.5' weight='bold' aria-hidden='true' />
									)}
								</span>
							</a>
						</StaggerItem>
					))}
				</Stagger>
				<Rise delay={0.1} distance={12}>
					<p className='mt-6 text-[0.875rem] text-[var(--ink-3)]'>
						Sending a source or a correction?{' '}
						<Link href='/contribute' className='font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
							Here is what to include
						</Link>
						, so it can be checked quickly.
					</p>
				</Rise>
			</section>

			{/* ---- The government ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<SectionHead
						index='02'
						eyebrow='Not us'
						title='Need the government?'
						titleMuted='Go straight to it.'
						lead='We cannot act on a request to a ministry, a permit or a complaint about a service. These reach the people who can.'
					/>
					<div className='mt-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]'>
						<Link
							href='/directory'
							className='group flex flex-col justify-between gap-8 rounded-[3px] bg-[var(--paper)] p-6 transition hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.3)] lg:p-8'
						>
							<span className='grid size-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]'>
								<BuildingsIcon size={22} weight='duotone' aria-hidden='true' />
							</span>
							<span>
								<span className='block text-[1.5rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>The Directory</span>
								<span className='mt-3 block bb-body text-[var(--ink-2)]'>
									Every regional office and its head, the national offices in the region, every governor and mayor, each town&rsquo;s
									police, fire and health lines, and the 80 Members of Parliament.
								</span>
								<span className='mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>
									Find an office <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
								</span>
							</span>
						</Link>

						<div className='flex flex-col rounded-[3px] bg-[#8f2328] p-6 text-white lg:p-8'>
							<span className='flex items-center gap-3'>
								<SirenIcon size={26} weight='fill' aria-hidden='true' />
								<span className='text-[1.25rem] font-extrabold'>In an emergency, call 911</span>
							</span>
							<p className='mt-2 text-[0.875rem] text-white/80'>Each town&rsquo;s own police, fire and health lines are on its page in the Directory.</p>
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
