import { ArrowUpRightIcon, BriefcaseIcon, CalendarBlankIcon, GraduationCapIcon, WrenchIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import jobsFile from '../../../../datasets/opportunities/jobs.json'
import programsFile from '../../../../datasets/opportunities/scholarships.json'
import { GetInvolved } from '../_components/get-involved'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'
import { DaysLeft } from './days-left'

/* ============================================================
   Jobs and scholarships

   Open government jobs as the Bangsamoro Job Portal lists them, and the
   region's scholarships, grants and paid training as the offices' own pages
   describe them, in one place. BetterBARMM takes no applications: every
   item links to where you apply. A scholarship's window is given only where
   an official page states it.
   ============================================================ */

export const metadata: Metadata = pageMeta({
	title: 'Jobs and scholarships',
	description: 'Open jobs in the Bangsamoro Government from the Bangsamoro Job Portal, and the region’s scholarships, grants and paid training, each with how to apply and where.',
	path: '/opportunities',
})

type Job = (typeof jobsFile.jobs)[number]
type Program = (typeof programsFile.programs)[number]

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`
const day = (iso: string) => new Date(`${iso}T00:00:00+08:00`).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })

const FOR: Record<string, string> = {
	students: 'Students',
	'former-combatants': 'Former combatants and their families',
	'families-in-need': 'Low-income families',
	'out-of-school-youth': 'Out-of-school youth',
	'job-seekers': 'Job-seekers',
	youth: 'Youth',
	workers: 'Workers',
	'persons-with-disability': 'Persons with disability',
	ulama: 'Ulama',
	teachers: 'Teachers',
}
const KIND = {
	scholarship: { label: 'Scholarships and grants', icon: GraduationCapIcon },
	training: { label: 'Free skills training', icon: WrenchIcon },
	work: { label: 'Paid work for students and graduates', icon: BriefcaseIcon },
} as const

function JobCard({ j }: { j: Job }) {
	const quals = [
		['Education', j.education],
		['Eligibility', j.eligibility],
		['Experience', j.experience],
		['Training', j.training],
	].filter(([, v]) => v) as [string, string][]
	return (
		<li className='border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-6'>
			<div className='flex flex-wrap items-start justify-between gap-x-6 gap-y-2'>
				<div className='min-w-0'>
					<h3 className='text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em]'>{j.title}</h3>
					<p className='mt-1 text-[0.84375rem] leading-[1.5] text-[var(--ink-2)]'>
						{j.office}
						{j.assignment ? <span className='text-[var(--ink-3)]'> · {j.assignment}</span> : null}
					</p>
				</div>
				{j.closes ? (
					<p className='shrink-0 text-right text-[0.78125rem] font-semibold text-[var(--ink-3)]'>
						<span className='inline-flex items-center gap-1'>
							<CalendarBlankIcon size={13} weight='bold' aria-hidden='true' /> Closes {day(j.closes)}
						</span>
						<DaysLeft closes={j.closes} />
					</p>
				) : null}
			</div>
			<p className='mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.84375rem]'>
				{j.monthlySalary ? (
					<span>
						<b className='font-extrabold'>{peso(j.monthlySalary)}</b> <span className='text-[var(--ink-3)]'>a month{j.salaryGrade ? `, ${j.salaryGrade.replace('Grade', 'Salary Grade')}` : ''}</span>
					</span>
				) : null}
				{j.term ? <span className='text-[var(--ink-2)]'>{j.term}</span> : null}
			</p>
			{quals.length ? (
				<dl className='mt-3 grid gap-x-6 gap-y-1.5 border-t border-[var(--rule)] pt-3 text-[0.8125rem] sm:grid-cols-2'>
					{quals.map(([k, v]) => (
						<div key={k}>
							<dt className='inline font-semibold text-[var(--ink-3)]'>{k}: </dt>
							<dd className='inline text-[var(--ink-2)]'>{v}</dd>
						</div>
					))}
				</dl>
			) : null}
			<div className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-2'>
				<a href={j.url} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1.5 bg-[var(--accent)] px-3.5 py-2 text-[0.8125rem] font-semibold text-white hover:opacity-90'>
					Apply on the Bangsamoro Job Portal <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
				</a>
				{j.description || j.howToApply ? (
					<details className='group text-[0.8125rem]'>
						<summary className='cursor-pointer font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>The duties and what to send</summary>
						<div className='mt-3 space-y-3 whitespace-pre-line leading-[1.6] text-[var(--ink-2)]'>
							{j.description ? <p>{j.description}</p> : null}
							{j.howToApply ? <p>{j.howToApply}</p> : null}
						</div>
					</details>
				) : null}
			</div>
		</li>
	)
}

function ProgramCard({ p }: { p: Program }) {
	const closed = p.status.state === 'closed'
	return (
		<li className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5'>
			<p className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{p.office}</p>
			<h3 className='mt-1.5 text-[1rem] font-extrabold leading-snug tracking-[-0.01em]'>{p.name}</h3>
			{p.summary ? <p className='mt-2 text-[0.84375rem] leading-[1.6] text-[var(--ink-2)]'>{p.summary}</p> : null}
			{p.for.length ? <p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>For: {p.for.map((f) => FOR[f] ?? f).join(', ')}</p> : null}
			{p.how ? <p className='mt-2 text-[0.8125rem] leading-[1.55] text-[var(--ink-2)]'><b className='font-semibold'>How to apply:</b> {p.how}</p> : null}
			<p className={`mt-3 border-t border-[var(--rule)] pt-3 text-[0.78125rem] leading-[1.5] ${closed ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>
				{closed ? <b className='font-bold'>Closed. </b> : <b className='font-semibold'>Window not posted. </b>}
				{p.status.note}
			</p>
			<p className='mt-auto flex flex-wrap gap-x-4 pt-3 text-[0.78125rem]'>
				{p.source ? (
					<a href={p.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>
						The program <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
					</a>
				) : null}
				{'source' in p.status && p.status.source ? (
					<a href={p.status.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 font-semibold text-[var(--ink-2)] hover:text-[var(--accent)]'>
						Where the status is posted <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
					</a>
				) : null}
				<a href={`/services/${p.officeSlug}`} className='inline-flex items-center gap-0.5 text-[var(--ink-3)] hover:text-[var(--accent)]'>
					The office’s services
				</a>
			</p>
		</li>
	)
}

export default function OpportunitiesPage() {
	const jobs = [...jobsFile.jobs].sort((a, b) => (a.closes ?? '9').localeCompare(b.closes ?? '9') || a.title.localeCompare(b.title))
	const hiring = jobsFile.offices.filter((o) => o.open > 0)
	const groups = (Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => ({ k, list: programsFile.programs.filter((p) => p.kind === k) })).filter((g) => g.list.length)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-14 md:py-20'>
					<p className='bb-label'>Jobs, scholarships and training</p>
					<h1 className='mt-2 max-w-[48rem] text-[clamp(2.1rem,4.4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.025em] text-[var(--ink)]'>Open calls from the Bangsamoro Government, in one place.</h1>
					<p className='mt-3 max-w-[44rem] text-[0.96875rem] leading-[1.65] text-[var(--ink-2)]'>
						Government jobs as the Bangsamoro Job Portal lists them, and the region’s scholarships and paid training as each office describes them. We take no applications: every item links to where you apply.
					</p>
					<nav aria-label='On this page' className='mt-7 flex flex-wrap gap-2'>
						<a href='#jobs' className='rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] hover:border-[var(--ink)]'>
							Jobs <span className='text-[var(--ink-3)]'>{jobs.length}</span>
						</a>
						{groups.map(({ k, list }) => (
							<a key={k} href={`#${k}`} className='rounded-full border border-[var(--rule)] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-[var(--ink)] hover:border-[var(--ink)]'>
								{KIND[k].label} <span className='text-[var(--ink-3)]'>{list.length}</span>
							</a>
						))}
					</nav>
				</div>
			</section>

			<div className='bb-container py-14 lg:py-20'>
				<section id='jobs' aria-labelledby='jobs-title' className='scroll-mt-24'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
						<h2 id='jobs-title' className='text-[1.625rem] font-extrabold tracking-[-0.02em]'>
							Open jobs <span className='text-[var(--ink-mute)]'>{jobs.length}</span>
						</h2>
						<p className='text-[0.84375rem] text-[var(--ink-3)]'>
							{hiring.length ? `Hiring now: ${hiring.map((o) => `${o.name} (${o.open})`).join(', ')}.` : 'No office is hiring on the portal right now.'} Read {day(jobsFile.generatedAt)}.
						</p>
					</div>
					{jobs.length ? (
						<ul className='mt-6 grid gap-4 lg:grid-cols-2'>
							{jobs.map((j) => (
								<JobCard key={j.id} j={j} />
							))}
						</ul>
					) : (
						<p className='mt-6 text-[0.875rem] text-[var(--ink-3)]'>No open positions on the Bangsamoro Job Portal right now.</p>
					)}
					<p className='mt-5 text-[0.78125rem] leading-[1.7] text-[var(--ink-3)]'>
						From the{' '}
						<a href={jobsFile.source.url} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
							{jobsFile.source.label}
						</a>
						, where {jobsFile.offices.length} regional offices post their vacancies and take applications. Its listing is the one that counts: check a post there before you apply.
					</p>
				</section>

				{groups.map(({ k, list }) => {
					const Icon = KIND[k].icon
					return (
						<section key={k} id={k} aria-labelledby={`${k}-title`} className='mt-16 scroll-mt-24'>
							<h2 id={`${k}-title`} className='flex items-center gap-2.5 text-[1.625rem] font-extrabold tracking-[-0.02em]'>
								<Icon size={24} weight='duotone' className='text-[var(--accent)]' aria-hidden='true' />
								{KIND[k].label} <span className='text-[var(--ink-mute)]'>{list.length}</span>
							</h2>
							<ul className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{list.map((p) => (
									<ProgramCard key={p.name} p={p} />
								))}
							</ul>
						</section>
					)
				})}

				<p className='mt-14 border-t border-[var(--rule)] pt-6 text-[0.78125rem] leading-[1.7] text-[var(--ink-3)]'>
					Each program is traced to the official page it was read from. Most offices announce their scholarship and training calls on Facebook, which we cannot read automatically, so a window is shown only where an official website states one. Saw a call that is not here? Send it to us with the link.
				</p>
			</div>
			<GetInvolved />
		</main>
	)
}
