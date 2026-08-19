import Image from 'next/image'
import Link from 'next/link'
import { categories } from '../_lib/categories'

const projectLinks = [
	{ href: '/members', label: 'Members' },
	{ href: '/committees', label: 'Committees' },
	{ href: '/about', label: 'Data & Methodology' },
]

const sources = [
	{ href: 'https://parliament.bangsamoro.gov.ph/', label: 'Bangsamoro Parliament' },
	{ href: 'https://officialgazette.bangsamoro.gov.ph/', label: 'BARMM Official Gazette' },
]

function FooterLink({ href, label }: { href: string; label: string }) {
	const isExternal = href.startsWith('http')

	const className = 'w-fit text-sm text-[var(--ink-3)] transition hover:text-[var(--ink)]'

	return isExternal ? (
		<a href={href} target='_blank' rel='noreferrer' className={className}>
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
			{/* Less air under the footer than over it. The top padding separates it
			    from the page; the bottom only trails the copyright line off the end
			    of the document, and there is nothing after it to be held apart from. */}
			<div className='mx-auto max-w-[88rem] px-6 pb-6 pt-12 sm:pb-8 sm:pt-16 lg:px-8'>
				{/* Two areas, not five columns: the mark and notice take the free
				    space, and the three link lists share one content-sized column so
				    they sit at their natural width instead of being stretched across
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
						<p className='mt-5 text-sm leading-6 text-[var(--ink-2)]'>
							<span className='font-semibold text-[var(--ink)]'>AI-assisted analysis.</span>{' '}
							Summaries, classifications, and interface copy may be assisted by AI with human
							review. Verify legal details against the official Parliament or Gazette source before
							citation.
						</p>
					</div>

					{/* A narrower column gap on a phone, so two of the three lists still
					    fit on a line instead of each claiming one of its own. */}
					<div className='flex flex-wrap gap-x-10 gap-y-9 sm:gap-x-20 sm:gap-y-10'>
						<div>
							<p className='label label-strong'>Registry</p>
							<div className='mt-4 grid gap-2.5'>
								{categories.map((category) => (
									<FooterLink key={category.slug} href={category.href} label={category.label} />
								))}
							</div>
						</div>

						<div>
							<p className='label label-strong'>Project</p>
							<div className='mt-4 grid gap-2.5'>
								{projectLinks.map((item) => (
									<FooterLink key={item.href} {...item} />
								))}
							</div>
						</div>

						<div>
							<p className='label label-strong'>Sources</p>
							<div className='mt-4 grid gap-2.5'>
								{sources.map((item) => (
									<FooterLink key={item.href} {...item} />
								))}
							</div>
						</div>
					</div>
				</div>

				<div className='mt-14 flex flex-col justify-between gap-2 border-t border-[var(--rule-soft)] pt-6 text-xs text-[var(--ink-mute)] sm:mt-20 sm:flex-row sm:items-center lg:mt-24'>
					<p>
						2026{' '}
						<a
							href='https://betterbarmm.com'
							target='_blank'
							rel='noreferrer'
							className='text-[var(--ink-3)] transition hover:text-[var(--ink)]'
						>
							betterbarmm.com
						</a>{' '}
						— public domain unless otherwise specified.
					</p>
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
