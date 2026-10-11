import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	BookOpenTextIcon,
	BuildingsIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	DatabaseIcon,
	EnvelopeSimpleIcon,
	FacebookLogoIcon,
	GavelIcon,
	HardHatIcon,
	LifebuoyIcon,
	ReceiptIcon,
} from '@phosphor-icons/react/ssr'
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
	{ icon: CoinsIcon, label: 'Budget', title: 'Each year’s regional budget, traced to the page of the act.', href: 'https://budget.betterbarmm.com' },
	{ icon: BuildingsIcon, label: 'Local government', title: 'Every province, city, town and barangay, and who was elected.', href: 'https://lgu.betterbarmm.com' },
	{ icon: GavelIcon, label: 'Legislation', title: 'Bills, autonomy acts, and the members who filed them.', href: 'https://legislation.betterbarmm.com' },
	{ icon: CheckSquareOffsetIcon, label: 'Election', title: 'The parliamentary election: parties, candidates, seats and the count.', href: 'https://election.betterbarmm.com' },
	{ icon: ReceiptIcon, label: 'Procurement', title: 'Bid notices posted on PhilGEPS since 2019, and who won them.', href: 'https://procurement.betterbarmm.com' },
	{ icon: BookOpenTextIcon, label: 'Discover BARMM', title: 'The region itself, in five plain-language chapters.', href: '/discover' },
]

const COMING = [
	{ icon: CompassIcon, label: 'Travel', note: 'A written guide to the seven areas: what to see, eat, and where to stay.' },
	{ icon: HardHatIcon, label: 'Public works', note: 'Infrastructure projects, their cost, their contractor, and whether they were finished.' },
	{ icon: LifebuoyIcon, label: 'Public services', note: 'Which office handles what, what it costs, and what to bring.' },
	{ icon: DatabaseIcon, label: 'Source layer', note: 'The documents and datasets underneath every workspace.' },
]

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

export default function SoonPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead
				brand
				label='Not open yet'
				lines={['This workspace is', 'still being compiled.']}
				muted={[1]}
				standfirst='The records behind it are being read, checked and organized, and it opens when they are ready rather than when a date arrives. Nothing here is hidden — it is unfinished, which is a different thing, and this page exists to say which.'
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
							className='group flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--paper-2)]'
						>
							<span className='flex items-start justify-between gap-3'>
								<span className='grid size-11 place-items-center bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
									<item.icon size={22} weight='duotone' aria-hidden='true' />
								</span>
								<ArrowUpRightIcon className='size-4 shrink-0 text-[var(--ink-3)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' aria-hidden='true' />
							</span>
							<span className='mt-5 text-[1.2rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
								{item.label}
							</span>
							<span className='mt-2 flex-1 text-[14px] leading-6 text-[var(--ink-2)]'>{item.title}</span>
							<span className='mt-5 flex items-center gap-2 border-t border-[var(--rule)] pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								<span className='size-1.5 rounded-full bg-[#3f8f5a]' aria-hidden='true' />
								Open now
							</span>
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
							<li key={item.label} className='flex gap-4 border-b border-[var(--rule)] py-5 first:pt-0'>
								<item.icon size={22} weight='duotone' className='mt-0.5 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
								<div>
									<p className='text-[16px] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{item.label}</p>
									<p className='mt-1 text-[14px] leading-6 text-[var(--ink-2)]'>{item.note}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* ---- Hear when it opens ---- */}
			<section className='bb-container bb-section'>
				<div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12'>
					<div className='max-w-[40rem]'>
						<h2 className={H2}>Want to know when it opens?</h2>
						<p className='mt-3 text-[15px] leading-7 text-[var(--ink-3)]'>
							New workspaces are announced on our Facebook page first. Or write to us, and tell us what you would most like to
							see in it.
						</p>
					</div>
					<div className='flex shrink-0 flex-wrap gap-3'>
						<a href='https://www.facebook.com/betterbarmm' target='_blank' rel='noreferrer' className='bb-btn bb-btn-solid'>
							<FacebookLogoIcon size={16} weight='fill' aria-hidden='true' />
							Follow on Facebook
						</a>
						<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-ghost'>
							<EnvelopeSimpleIcon size={16} aria-hidden='true' />
							Email us
						</a>
					</div>
				</div>
			</section>
		</main>
	)
}
