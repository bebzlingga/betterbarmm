import { ArrowRight } from 'lucide-react'
import { budgetGeneratedAt } from '@betterbarmm/budget-data'
import { getObjectYearStats } from '../_lib/budget-object-lines'
import { buildAgencyRows, buildProgramRows, getFullBudgetSelection } from '../_lib/budget-view-model'

function approxCount(value: number) {
	if (value >= 1_000) return `~${Math.round(value / 10) * 10}`

	return String(value)
}

function formatUpdatedAt(value: string | undefined) {
	if (!value) return 'Source timestamp pending'

	const date = new Date(value)

	if (Number.isNaN(date.getTime())) return value

	return date.toLocaleString('en-PH', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'Asia/Manila',
		timeZoneName: 'short',
	})
}

export function BudgetFooter() {
	const selection = getFullBudgetSelection()
	const agencyRows = buildAgencyRows(selection.budget)
	const programRows = buildProgramRows(selection.budget)
	const objectStats = getObjectYearStats()
	const sourceLineItems = objectStats.reduce((sum, year) => sum + year.rows, 0)
	const fiscalYearCount = selection.toYear - selection.fromYear + 1

	return (
		<footer className='border-t border-[var(--ink)] bg-[var(--paper)] px-5 py-8 pb-4 text-[var(--ink)] sm:py-10 sm:pb-6'>
			<div className='mx-auto max-w-[1440px] px-5'>
				<p className='break-words font-mono text-[10px] uppercase leading-6 tracking-[0.16em] text-[var(--ink-3)] sm:tracking-[0.32em]'>
					Source: Bangsamoro Appropriations Acts · {selection.budget.act_number} · {fiscalYearCount} fiscal years · {agencyRows.length} reporting units · {programRows.length} programs ·{' '}
					{approxCount(sourceLineItems)} source line items
				</p>

				<div className='my-8 h-px border-t border-dashed border-[var(--rule)]' />

				<div className='pt-2 pb-2'>
					<p className='max-w-4xl text-[11px] uppercase leading-7 tracking-[0.08em] text-[var(--ink-3)] sm:tracking-[0.1em]'>
						<span className='font-mono font-bold text-[var(--ink)]'>AI-assisted analysis.</span> The figures, breakdowns, and editorial commentary on this site were parsed, aggregated, and drafted
						with Codex for human review. The dataset and its interpretations may contain errors, missed classifications, or stale figures. Always verify against the official GAAB source before citing.
					</p>
					<div className='mt-6 flex gap-10'>
						<FooterLinkBlock
							label='Data Source'
							href='https://mfbm.bangsamoro.gov.ph/'
							title='Ministry of Finance, and Budget and Management'
						/>
						<FooterLinkBlock
							label='Full Dataset'
							href='https://data.betterbarmm.ph'
							title='BetterBARMM Open Data Portal · data.betterbarmm.ph'
						/>
					</div>
				</div>

				<div className='mt-8 flex flex-col items-start justify-between gap-4 border-t border-[var(--rule)] pt-4 md:flex-row md:items-center md:gap-8 md:pt-6'>
					<p className='font-mono text-[10px] uppercase leading-6 tracking-[0.16em] text-[var(--ink-3)] sm:tracking-[0.24em]'>
						Site by{' '}
						<a
							href='https://bebz.dev'
							target='_blank'
							className='border-b border-[var(--accent)] font-bold tracking-[0.18em] text-[var(--ink)] hover:text-[var(--accent)]'
						>
							Bebz
						</a>
						{' & '}
						Inspired by{' '}
						<a
							href='https://bettergov.ph'
							target='_blank'
							className='border-b border-[var(--accent)] font-bold tracking-[0.18em] text-[var(--ink)] hover:text-[var(--accent)]'
						>
							bettergov.ph
						</a>
					</p>
					<p className='font-mono text-[10px] uppercase leading-6 tracking-[0.16em] text-[var(--ink-3)] sm:tracking-[0.24em] md:text-right'>
						Last updated at <span className='font-bold tracking-[0.18em] text-[var(--ink)]'>{formatUpdatedAt(budgetGeneratedAt)}</span>
					</p>
				</div>
			</div>
		</footer>
	)
}

function FooterLinkBlock({ label, href, title }: { label: string; href: string; title: string }) {
	return (
		<div className='min-w-0'>
			<p className='font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--ink-mute)]'>{label}</p>
			<a
				href={href}
				target='_blank'
				className='mt-1 inline-flex max-w-full items-start gap-2 border-b border-[var(--accent)] font-mono text-[10px] font-bold uppercase leading-6 tracking-[0.1em] text-[var(--ink)] hover:text-[var(--accent)] sm:tracking-[0.12em]'
			>
				<span className='min-w-0 break-words'>{title}</span>
				<ArrowRight
					className='mt-1.5 size-2.5 shrink-0'
					aria-hidden='true'
				/>
			</a>
		</div>
	)
}
