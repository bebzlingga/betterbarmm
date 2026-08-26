import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = {
	title: 'Not open yet — BetterBARMM',
	description:
		'This workspace is still being compiled. What is already open, and where to look in the meantime.',
}

/* ============================================================
   Not open yet

   The holding page for a workspace whose records are not ready to
   be read in public. It exists because the alternative is worse: a
   card that links to a subdomain mid-build hands a reader a broken
   or half-loaded room and says nothing about why.

   It says three things, in this order: this one is not ready, here
   is what is, and here is how to hear when it changes. What it does
   not do is apologise or promise a date — the registry's whole
   argument is that it says only what it can show.
   ============================================================ */

const OPEN_NOW = [
	{
		label: 'Legislation',
		title: 'Bills, autonomy acts, and the members who filed them.',
		href: 'https://legislation.betterbarmm.com',
		external: true,
	},
	{
		label: 'Discover BARMM',
		title: 'The region itself, in five plain-language chapters.',
		href: '/discover',
		external: false,
	},
]

export default function SoonPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead
				label='Not open yet'
				lines={['This workspace is', 'still being compiled.']}
				muted={[1]}
				standfirst='The records behind it are being read, checked and organised, and it opens when they are ready rather than when a date arrives. Nothing here is hidden — it is unfinished, which is a different thing, and this page exists to say which.'
			>
				<Link href='/discover' className='bb-btn bb-btn-solid'>
					Discover BARMM
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</Link>
				<Link href='/contribute' className='bb-btn bb-btn-ghost'>
					Contribute a source
				</Link>
			</Masthead>

			<section className='bb-container bb-section-bottom'>
				<Rise distance={14}>
					<div className='bb-kicker'>
						<span>01</span>
						<span>Open today</span>
					</div>
				</Rise>

				<Stagger gap={0.06} className='bb-head-gap-top grid border-t border-[var(--rule)] sm:grid-cols-2'>
					{OPEN_NOW.map((item, index) => {
						const body = (
							<>
								<span className='flex items-center justify-between gap-3'>
									<span className='num text-[12px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<ArrowUpRightIcon
										className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								</span>

								<span className='mt-8 block text-[1.6rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
									{item.label}
								</span>

								<span className='mt-3 block bb-body text-[var(--ink-2)]'>{item.title}</span>
							</>
						)

						const className =
							'group flex h-full flex-col border-b border-[var(--rule)] p-7 transition hover:bg-[var(--paper-2)] sm:[&:nth-child(odd)]:border-r lg:p-8'

						return (
							<StaggerItem key={item.label} distance={14} className='min-w-0'>
								{item.external ? (
									<a href={item.href} className={className}>
										{body}
									</a>
								) : (
									<Link href={item.href} className={className}>
										{body}
									</Link>
								)}
							</StaggerItem>
						)
					})}
				</Stagger>
			</section>
		</main>
	)
}
