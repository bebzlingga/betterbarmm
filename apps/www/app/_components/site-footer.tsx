import Image from 'next/image'
import Link from 'next/link'
import { SubscribeForm } from './subscribe-form'

const sitemap = [
	{
		title: 'Discover',
		links: [
			{ href: '/discover/history', label: 'History' },
			{ href: '/discover/governance', label: 'Government' },
			{ href: '/discover/people', label: 'People' },
			{ href: '/discover/culture-places', label: 'Culture & Places' },
		],
	},
	{
		title: 'Workspaces',
		links: [
			{ href: 'https://election.betterbarmm.com', label: 'Election' },
			{ href: 'https://bills.betterbarmm.com', label: 'Legislation' },
			{ href: 'https://budget.betterbarmm.com', label: 'Budget' },
		],
	},
	{
		title: 'Project',
		links: [
			{ href: '/about', label: 'About' },
			{ href: '/contribute', label: 'Contribute' },
			{ href: 'mailto:support@betterbarmm.com', label: 'support@betterbarmm.com' },
			{ href: 'https://www.facebook.com/betterbarmm', label: 'Facebook' },
		],
	},
]

function FooterLink({ href, label }: { href: string; label: string }) {
	const isExternal = href.startsWith('http') || href.startsWith('mailto:')

	const className = 'w-fit text-sm text-[var(--ink-3)] transition hover:text-[var(--ink)]'

	return isExternal ? (
		<a
			href={href}
			target={href.startsWith('http') ? '_blank' : undefined}
			rel={href.startsWith('http') ? 'noreferrer' : undefined}
			className={className}
		>
			{label}
		</a>
	) : (
		<Link href={href} className={className}>
			{label}
		</Link>
	)
}

export function SiteFooter() {
	return (
		<footer className='mt-12'>
			{/* The one thing the footer asks for, on its own rule above the
			    sitemap so it reads as an invitation rather than a link column. */}
			<div className='border-t border-[var(--rule)]'>
				<div className='mx-auto flex max-w-[88rem] flex-col gap-6 px-6 py-12 lg:flex-row lg:items-end lg:justify-between lg:px-8'>
					<div className='max-w-md'>
						<p className='eyebrow'>Stay with it</p>
						<h2 className='mt-3 text-2xl font-semibold leading-tight text-[var(--ink)]'>
							New workspaces and data releases, in your inbox.
						</h2>
						<p className='mt-3 text-sm leading-6 text-[var(--ink-3)]'>
							The occasional brief on Bangsamoro public records. No spam, unsubscribe anytime.
						</p>
					</div>
					<SubscribeForm className='w-full lg:w-[26rem]' />
				</div>
			</div>

			<div className='mx-auto max-w-[88rem] px-6 py-16 lg:px-8'>
				{/* Two areas, not five columns: the mark and notice take the free
				    space, and the link lists share one content-sized column so they
				    sit at their natural width instead of being stretched across
				    equal tracks with dead space trailing off the right. */}
				<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16'>
					<div className='lg:pr-24 xl:pr-40'>
						<Link href='/' className='inline-block'>
							<Image
								src='/logo.png'
								alt='BetterBARMM'
								width={168}
								height={31}
								className='logo-light h-[30px] w-auto'
							/>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={168}
								height={31}
								className='logo-dark h-[30px] w-auto'
							/>
						</Link>
						<p className='mt-5 max-w-sm text-sm leading-6 text-[var(--ink-2)]'>
							A public transparency project for the Bangsamoro. We organise public records into
							workspaces you can read, question, and trace back to the source.
						</p>
						<p className='mt-4 max-w-sm text-sm leading-6 text-[var(--ink-3)]'>
							Cotabato City &middot; Bangsamoro Autonomous Region in Muslim Mindanao
						</p>
					</div>

					<div className='flex flex-wrap gap-x-16 gap-y-10 sm:gap-x-20'>
						{sitemap.map((column) => (
							<div key={column.title}>
								<p className='label label-strong'>{column.title}</p>
								<div className='mt-4 grid gap-2.5'>
									{column.links.map((link) => (
										<FooterLink key={link.href + link.label} {...link} />
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className='mt-20 flex flex-col justify-between gap-2 border-t border-[var(--rule-soft)] pt-6 text-xs text-[var(--ink-mute)] sm:flex-row sm:items-center lg:mt-24'>
					<p>2026 betterbarmm.com — public domain unless otherwise specified.</p>
					<p>
						Inspired by{' '}
						<a
							href='https://bettergov.ph'
							target='_blank'
							rel='noreferrer'
							className='text-[var(--ink-3)] transition hover:text-[var(--ink)]'
						>
							bettergov.ph
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
