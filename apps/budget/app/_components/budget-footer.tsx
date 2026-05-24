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
		<footer className='bb-footer'>
			<div className='bb-container'>
				<div className='bb-footer-main'>
					<div>
						<p className='eyebrow'>Budget transparency</p>
						<h2 className='bb-footer-title mt-3'>Public budgets should be easy to trace.</h2>
					</div>
					<p className='bb-footer-copy'>
						The BetterBARMM budget workspace organizes appropriations by fiscal year, office, program, expense class, and source-backed line item so readers can follow how public money is planned.
					</p>
				</div>

				<p className='bb-footer-source break-words'>
					Source: Bangsamoro Appropriations Acts · {selection.budget.act_number} · {fiscalYearCount} fiscal years · {agencyRows.length} reporting units · {programRows.length} programs ·{' '}
					{approxCount(sourceLineItems)} source line items
				</p>

				<div className='pb-2 pt-2'>
					<p className='bb-footer-note'>
						<span className='font-bold text-[var(--ink)]'>AI-assisted analysis.</span> The figures, breakdowns, and editorial commentary on this site were parsed, aggregated, and drafted
						with Codex for human review. The dataset and its interpretations may contain errors, missed classifications, or stale figures. Always verify against the official GAAB source before citing.
					</p>
					<div className='bb-footer-link-grid'>
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

				<div className='bb-footer-bottom'>
					<p>
						2026{' '}
						<a
							href='https://betterbarmm.com'
							target='_blank'
							rel='noreferrer'
							className='bb-footer-link'
						>
							betterbarmm.com
						</a>
						{' - All content is public domain unless otherwise specified. Inspired by '}
						<a
							href='https://bettergov.ph'
							target='_blank'
							rel='noreferrer'
							className='bb-footer-link'
						>
							bettergov.ph
						</a>
					</p>
					<p>
						Last updated at <span className='bb-footer-strong'>{formatUpdatedAt(budgetGeneratedAt)}</span>
					</p>
				</div>
			</div>
		</footer>
	)
}

function FooterLinkBlock({ label, href, title }: { label: string; href: string; title: string }) {
	return (
		<div className='min-w-0'>
			<p className='bb-footer-link-label'>{label}</p>
			<a
				href={href}
				target='_blank'
				rel='noreferrer'
				className='bb-footer-source-link'
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
