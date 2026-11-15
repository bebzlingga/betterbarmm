import { ArrowRightIcon, BuildingsIcon, CompassIcon, EyeIcon, GraduationCapIcon, HandHeartIcon, NewspaperIcon, SealCheckIcon, SquaresFourIcon, TextAaIcon, UsersThreeIcon, WarningCircleIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import { Directory } from '../_components/directory'
import { CARD, ICON_TILE, PageBand, SectionTitle } from '../_components/page-band'
import { datasets } from '../_lib/open-data'
import { SiteHeader } from '../_components/site-header'
import { projects, workspaces } from '../_lib/workspaces'

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

// Counted from the front page's lists and the open-data catalogue, so a page added there is counted here.
const figures = [
	{ value: workspaces.filter((w) => w.state === 'live' && w.href).length, label: 'Workspaces', note: 'each built around one part of the public record' },
	{ value: projects.filter((p) => p.state === 'live' && p.href).length, label: 'Projects', note: 'each gathering one kind of record into a page' },
	{ value: datasets.length, label: 'Open datasets', note: 'to download as tables, every column described' },
	{ value: 0, label: 'Accounts needed', note: 'free to read, for anyone' },
]

const principles = [
	{
		icon: SealCheckIcon,
		title: 'Every figure has a source.',
		body: 'A number, a name or a date on this site links to the document it came from, so anyone can check it rather than take our word for it.',
	},
	{
		icon: TextAaIcon,
		title: 'Plain words first.',
		body: 'Records are explained for someone who has never read a bill or a budget, without changing what they say.',
	},
	{
		icon: EyeIcon,
		title: 'Gaps are shown, not hidden.',
		body: 'Where a figure is provisional, a list is incomplete or a document could not be read, the page says so instead of rounding the doubt away.',
	},
	{
		icon: HandHeartIcon,
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

			<PageBand
				label='About BetterBARMM'
				title='Public records, made readable'
				standfirst='BetterBARMM is an independent transparency project for the Bangsamoro. It takes the region’s own public record, puts it in one place, explains it in plain language, and keeps it one click from the document it came from.'
				jumps={[
					{ href: '#purpose', label: 'Our purpose', icon: CompassIcon },
					{ href: '#covers', label: 'What it covers', icon: SquaresFourIcon },
					{ href: '#rules', label: 'How it works', icon: SealCheckIcon },
					{ href: '#readers', label: 'Who it is for', icon: UsersThreeIcon },
				]}
			/>

			{/* ---- Purpose: the argument on the left, the size of the thing beside it as figures. ---- */}
			<section id='purpose' aria-labelledby='purpose-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] bb-section'>
				<div className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16'>
					<div>
						<h2 id='purpose-title' className='text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] lg:text-[2.125rem]'>
							So that anyone can check what their government does.
						</h2>
						<div className='mt-6 space-y-5 text-[1rem] leading-8 text-[var(--ink-2)]'>
							<p>
								What the Bangsamoro government decides, spends and promises is public in principle. In practice it arrives as scanned
								PDFs spread across many agency websites, each with its own idea of an index. A record that has been posted has been
								disclosed, but not yet opened.
							</p>
							<p>
								BetterBARMM closes that gap. It gathers the records, dates and labels them, makes them searchable, and explains them in
								plain words, so an ordinary question (what does this cost, who voted for it, which town is this about) takes minutes
								instead of an afternoon.
							</p>
						</div>
					</div>
					<dl className='grid grid-cols-2 content-start gap-4'>
						{figures.map((f) => (
							<div key={f.label} className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5 text-center'>
								<dd className='num text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]'>{f.value}</dd>
								<dt className='mt-3 font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[var(--ink)]'>{f.label}</dt>
								<p className='mt-1.5 text-[0.78125rem] leading-[1.5] text-[var(--ink-3)]'>{f.note}</p>
							</div>
						))}
					</dl>
				</div>
			</section>

			{/* ---- What it covers: the front page's own grid, filters and all ---- */}
			<section id='covers' aria-labelledby='covers-title' className='scroll-mt-[calc(var(--site-header-h)+1rem)] border-t border-[var(--rule)] bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<SectionTitle id='covers' title='Every workspace, and what it holds' lead='Each built around one part of the public record, and every record traced back to its source.' />
					<div className='mt-8'>
						<Directory workspaces={workspaces} projects={projects} />
					</div>
				</div>
			</section>

			{/* ---- How it works ---- */}
			<section id='rules' aria-labelledby='rules-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] bb-section'>
				<SectionTitle id='rules' title='Four rules, on every page' lead='What a reader can hold every page on this site to.' />
				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{principles.map((p, i) => (
						<li key={p.title} className={CARD}>
							<div className='flex flex-1 flex-col p-6'>
								<span className='flex items-start justify-between'>
									<span className={ICON_TILE}>
										<p.icon size={24} weight='duotone' aria-hidden='true' />
									</span>
									<span className='num text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--rule)] transition-colors group-hover:text-[var(--accent)]'>
										{String(i + 1).padStart(2, '0')}
									</span>
								</span>
								<h3 className='mt-6 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{p.title}</h3>
								<p className='mt-2 text-[0.875rem] leading-[1.65] text-[var(--ink-2)]'>{p.body}</p>
							</div>
						</li>
					))}
				</ul>
			</section>

			{/* ---- Who it is for ---- */}
			<section id='readers' aria-labelledby='readers-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] bb-section-bottom'>
				<SectionTitle id='readers' title='Anyone with a question about the region' />
				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{readers.map((r) => (
						<li key={r.who} className='flex gap-4 border border-[var(--rule)] bg-[var(--paper-2)] p-5'>
							<span className='grid size-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white'>
								<r.icon size={22} weight='fill' aria-hidden='true' />
							</span>
							<span className='min-w-0'>
								<span className='block text-[1rem] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{r.who}</span>
								<span className='mt-1 block text-[0.84375rem] leading-[1.6] text-[var(--ink-2)]'>{r.what}</span>
							</span>
						</li>
					))}
				</ul>

				{/* ---- What it is not ---- */}
				<div className='mt-10 flex flex-col gap-5 border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] p-6 sm:flex-row lg:p-8'>
					<WarningCircleIcon size={32} weight='duotone' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
					<div>
						<h2 className='text-[1.375rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>Independent, not an official source.</h2>
						<p className='mt-2 max-w-4xl text-[0.9375rem] leading-[1.75] text-[var(--ink-2)]'>
							BetterBARMM is not an official authority and does not speak for the Bangsamoro Government. Where it summarises a document,
							reorganises a table or explains a record in its own words, the original is still what settles the question, which is why
							the original is always linked.
						</p>
					</div>
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
