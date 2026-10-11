import { ArrowRightIcon, ArrowUpRightIcon, BuildingsIcon, GraduationCapIcon, NewspaperIcon, UsersThreeIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = pageMeta({
	title: 'About',
	description:
		'BetterBARMM collects what the Bangsamoro government already publishes and puts it where a person can read it: organized, explained in plain words, and one click from the source.',
	path: '/about',
})

/* ============================================================
   About

   What the project is for, what it covers, how it works, who it is
   for, and what it is not — in that order, because that is the order
   the questions arrive in.
   ============================================================ */

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const LEAD = 'mt-3 max-w-[46rem] text-[15px] leading-7 text-[var(--ink-3)]'

const workspaces = [
	{
		name: 'Election',
		href: 'https://election.betterbarmm.com',
		body: 'The Bangsamoro parliamentary election: the parties, the candidates in each district, the reserved seats, and the count.',
	},
	{
		name: 'Legislation',
		href: 'https://legislation.betterbarmm.com',
		body: 'Every bill, autonomy act and resolution of the Bangsamoro Parliament, the stage each has reached, and the members who filed it.',
	},
	{
		name: 'Budget',
		href: 'https://budget.betterbarmm.com',
		body: 'Each year’s Bangsamoro budget by sector, office, program and project, traced to the page of the act it was printed on.',
	},
	{
		name: 'Local government',
		href: 'https://lgu.betterbarmm.com',
		body: 'Every province, city, town and barangay: who was elected, the money each receives, and what each has disclosed.',
	},
]

const principles = [
	{
		title: 'Every figure has a source.',
		body: 'A number, a name or a date on this site links to the document it came from, so anyone can check it rather than take our word for it.',
	},
	{
		title: 'Plain words first.',
		body: 'Records are explained for someone who has never read a bill or a budget, without changing what they say.',
	},
	{
		title: 'Gaps are shown, not hidden.',
		body: 'Where a figure is provisional, a list is incomplete or a document could not be read, the page says so instead of rounding the doubt away.',
	},
	{
		title: 'Free and independent.',
		body: 'Anyone can read it, without an account. It is not run by, and does not speak for, the Bangsamoro Government or any party.',
	},
]

const readers = [
	{ icon: UsersThreeIcon, who: 'Citizens', what: 'who want to know what their government decided, spent, and who represents them.' },
	{ icon: NewspaperIcon, who: 'Journalists', what: 'who need the record and its source fast, on deadline.' },
	{ icon: GraduationCapIcon, who: 'Students and researchers', what: 'who want the region’s records in one place, organized and citable.' },
	{ icon: BuildingsIcon, who: 'Local officials and civil society', what: 'who work with these laws, budgets and funds every day.' },
]

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />

			<Masthead
				brand
				label='About BetterBARMM'
				lines={['Public records,', 'made readable.']}
				muted={[1]}
				size='display'
				scrollTo='#purpose'
				scrollLabel='Our purpose'
				standfirst='BetterBARMM is an independent transparency project for the Bangsamoro. It takes the region’s own public record, puts it in one place, explains it in plain language, and keeps it one click from the document it came from.'
			/>

			{/* ---- Purpose ---- */}
			<section id='purpose' className='bb-container scroll-mt-24 bb-section'>
				<div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20'>
					<div>
						<p className='bb-label'>Our purpose</p>
						<h2 className={`${H2} mt-4 lg:text-[2.25rem]`}>
							So that anyone can check what their government does.
						</h2>
					</div>
					<div className='space-y-5 text-[16px] leading-8 text-[var(--ink-2)] lg:pt-9'>
						<p>
							What the Bangsamoro government decides, spends and promises is public in principle. In practice it
							arrives as scanned PDFs spread across many agency websites, each with its own idea of an index. A record
							that has been posted has been disclosed, but not yet opened.
						</p>
						<p>
							BetterBARMM closes that gap. It gathers the records, dates and labels them, makes them searchable, and
							explains them in plain words, so an ordinary question (what does this cost, who voted for it, which town
							is this about) takes minutes instead of an afternoon.
						</p>
					</div>
				</div>
			</section>

			{/* ---- What it covers ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					<h2 className={H2}>What it covers</h2>
					<p className={LEAD}>Four workspaces, each built around one part of the public record.</p>
					<div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
						{workspaces.map((w) => (
							<a
								key={w.name}
								href={w.href}
								className='group flex flex-col bg-[var(--paper)] p-7 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.3)]'
							>
								<h3 className='text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{w.name}</h3>
								<p className='mt-3 flex-1 text-[14px] leading-6 text-[var(--ink-2)]'>{w.body}</p>
								<span className='mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]'>
									Open
									<ArrowUpRightIcon className='size-3.5 transition group-hover:translate-x-0.5' weight='bold' aria-hidden='true' />
								</span>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* ---- How it works ---- */}
			<section className='bb-container bb-section'>
				<h2 className={H2}>How it works</h2>
				<p className={LEAD}>Four rules every page is held to.</p>
				<div className='mt-10 grid gap-x-16 gap-y-10 sm:grid-cols-2'>
					{principles.map((p, i) => (
						<div key={p.title} className='border-t border-[var(--rule)] pt-6'>
							<p className='num text-[13px] font-semibold text-[var(--brass)]'>{String(i + 1).padStart(2, '0')}</p>
							<h3 className='mt-3 text-[1.2rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{p.title}</h3>
							<p className='mt-3 text-[15px] leading-7 text-[var(--ink-2)]'>{p.body}</p>
						</div>
					))}
				</div>
			</section>

			{/* ---- Who it is for ---- */}
			<section className='bb-container bb-section-bottom'>
				<h2 className={H2}>Who it is for</h2>
				<ul className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
					{readers.map((r) => (
						<li key={r.who} className='bg-[var(--paper-2)] p-6'>
							<span className='grid size-11 place-items-center rounded-full bg-[var(--accent)] text-white'>
								<r.icon size={22} weight='fill' aria-hidden='true' />
							</span>
							<p className='mt-5 text-[16px] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{r.who}</p>
							<p className='mt-2 text-[14px] leading-6 text-[var(--ink-2)]'>{r.what}</p>
						</li>
					))}
				</ul>
			</section>

			{/* ---- What it is not ---- */}
			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container grid gap-6 py-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20'>
					<h2 className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] lg:text-[2.25rem]'>
						Independent, not an official source.
					</h2>
					<p className='text-[16px] leading-8 text-[var(--ink-2)]'>
						BetterBARMM is not an official authority and does not speak for the Bangsamoro Government. Where it summarises
						a document, reorganises a table or explains a record in its own words, the original is still what settles the
						question, which is why the original is always linked.
					</p>
				</div>
			</section>

			<CtaPanel
				label='Contribute'
				lines={['Better records need', 'many careful readers.']}
				standfirst='Send source links, corrections, missing context, or notes about confusing records. The project becomes more useful when the public trail becomes easier to inspect.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Contribute
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-ghost'>
						support@betterbarmm.com
					</a>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
