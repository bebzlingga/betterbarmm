import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = pageMeta({
	title: 'Not open yet',
	description:
		'This workspace is still being compiled. What is already open, and where to look in the meantime.',
	path: '/soon',
	index: false,
})

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
	{ label: 'Budget', title: 'Each year’s regional budget, traced to the page of the act.', href: 'https://budget.betterbarmm.com' },
	{ label: 'Local government', title: 'Every province, city, town and barangay, and who was elected.', href: 'https://lgu.betterbarmm.com' },
	{ label: 'Legislation', title: 'Bills, autonomy acts, and the members who filed them.', href: 'https://legislation.betterbarmm.com' },
	{ label: 'Election', title: 'The parliamentary election: parties, candidates, seats and the count.', href: 'https://election.betterbarmm.com' },
	{ label: 'Procurement', title: 'Bid notices posted on PhilGEPS since 2019, and who won them.', href: 'https://procurement.betterbarmm.com' },
	{ label: 'Discover BARMM', title: 'The region itself, in five plain-language chapters.', href: '/discover' },
]

const COMING = [
	{ label: 'Travel', note: 'A written guide to the seven areas: what to see, eat, and where to stay.' },
	{ label: 'Public works', note: 'Infrastructure projects, their cost, their contractor, and whether they were finished.' },
	{ label: 'Public services', note: 'Which office handles what, what it costs, and what to bring.' },
	{ label: 'Source layer', note: 'The documents and datasets underneath every workspace.' },
]

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

export default function SoonPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead
				brand
				label='Not open yet'
				lines={['This workspace is', 'on its way.']}
				muted={[1]}
				standfirst='Its records are still being read, checked and organized. It opens when they are ready, not on a set date. In the meantime, everything below is open now.'
			>
				<a href='#open' className='bb-btn bb-btn-solid'>
					See what is open
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</a>
				<Link href='/contribute' className='bb-btn bb-btn-ghost'>
					Contribute a source
				</Link>
			</Masthead>

			{/* ---- Open today ---- */}
			<section id='open' className='bb-container scroll-mt-24 bb-section'>
				<h2 className={H2}>Open today</h2>
				<p className='mt-2 text-[15px] leading-7 text-[var(--ink-3)]'>Start with any of these.</p>
				<div className='mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
					{OPEN_NOW.map((item) => (
						<a
							key={item.label}
							href={item.href}
							className='group flex flex-col border border-[var(--rule)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--paper-2)]'
						>
							<span className='flex items-center justify-between gap-3'>
								<span className='text-[1.2rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{item.label}
								</span>
								<ArrowUpRightIcon className='size-4 shrink-0 text-[var(--ink-3)] transition group-hover:text-[var(--accent)]' aria-hidden='true' />
							</span>
							<span className='mt-3 text-[14px] leading-6 text-[var(--ink-2)]'>{item.title}</span>
						</a>
					))}
				</div>
			</section>

			{/* ---- Coming later ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container grid gap-10 py-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-20'>
					<div>
						<h2 className={H2}>Coming later</h2>
						<p className='mt-3 text-[15px] leading-7 text-[var(--ink-3)]'>
							Workspaces still being built. Each opens once its records can be traced to their source.
						</p>
					</div>
					<ul>
						{COMING.map((item) => (
							<li key={item.label} className='border-b border-[var(--rule)] py-5 first:pt-0'>
								<p className='text-[16px] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{item.label}</p>
								<p className='mt-1 text-[14px] leading-6 text-[var(--ink-2)]'>{item.note}</p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</main>
	)
}
