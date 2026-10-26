import type { AuditReport } from '@betterbarmm/lgu-data/coa'

/* What the Commission on Audit's auditor said about a local government in
   a year: the opinion, the main findings, and how much of last year's advice
   was acted on. Each linked to the report it came from. */

export const OPINION: Record<string, { label: string; tone: string; means: string }> = {
	unmodified: { label: 'Unmodified', tone: 'text-[#2f6b3a]', means: 'the books fairly present its finances' },
	qualified: { label: 'Qualified', tone: 'text-[#8a5a10]', means: 'fair except for the matters the auditor names' },
	adverse: { label: 'Adverse', tone: 'text-[var(--accent)]', means: 'the books do not fairly present its finances' },
	disclaimer: { label: 'Disclaimer', tone: 'text-[var(--accent)]', means: 'the auditor could not form an opinion' },
	modified: { label: 'Modified', tone: 'text-[#8a5a10]', means: 'the report says modified without saying how' },
}

const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)}M` : `₱${Math.round(n).toLocaleString('en-PH')}`)

export function AuditReportCard({ report: r, showEntity = false }: { report: AuditReport; showEntity?: boolean }) {
	const o = r.opinion ? OPINION[r.opinion] : null
	const prior = r.priorRecommendations
	const priorTotal = prior ? (prior.total ?? (prior.implemented ?? 0) + (prior.partial ?? 0) + (prior.notImplemented ?? 0)) : 0
	return (
		<article className='border-t border-[var(--rule)] pt-5'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<p className='text-[0.9375rem] font-extrabold tracking-[-0.01em]'>
					{showEntity ? `${r.unitName ?? r.entity} · ` : ''}FY {r.year}
				</p>
				{o ? (
					<p className='text-[0.8125rem]'>
						<span className={`font-semibold ${o.tone}`}>{o.label} opinion</span>
						<span className='text-[var(--ink-3)]'> · {o.means}</span>
					</p>
				) : null}
			</div>
			<dl className='mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[0.8125rem]'>
				{r.observations != null ? (
					<div>
						<dt className='inline text-[var(--ink-3)]'>Observations </dt>
						<dd className='num inline font-semibold'>{r.observations}</dd>
					</div>
				) : null}
				{r.disallowances != null ? (
					<div>
						<dt className='inline text-[var(--ink-3)]'>Disallowed, unsettled </dt>
						<dd className='num inline font-semibold'>{peso(r.disallowances)}</dd>
					</div>
				) : null}
				{r.suspensions != null ? (
					<div>
						<dt className='inline text-[var(--ink-3)]'>Suspended, unsettled </dt>
						<dd className='num inline font-semibold'>{peso(r.suspensions)}</dd>
					</div>
				) : null}
				{prior && priorTotal ? (
					<div>
						<dt className='inline text-[var(--ink-3)]'>Last year&rsquo;s advice acted on </dt>
						<dd className='num inline font-semibold'>
							{prior.implemented ?? 0} of {priorTotal}
							{prior.partial ? <span className='font-normal text-[var(--ink-3)]'> (+{prior.partial} partly)</span> : null}
						</dd>
					</div>
				) : null}
			</dl>
			{r.findings.length ? (
				<ul className='mt-4 space-y-2'>
					{r.findings.map((f, i) => (
						<li key={i} className='flex gap-3 text-[0.875rem] leading-6 text-[var(--ink-2)]'>
							<span className='mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--brass)]' aria-hidden='true' />
							<span>
								{f.text}
								{f.page ? <span className='text-[0.75rem] text-[var(--ink-3)]'> (p. {f.page})</span> : null}
							</span>
						</li>
					))}
				</ul>
			) : null}
			<p className='mt-4 text-[0.78125rem] text-[var(--ink-3)]'>
				Executive Summary of the Annual Audit Report ·{' '}
				<a href={r.archived ?? r.pdf} target='_blank' rel='noreferrer' className='rule-link'>
					the copy read
				</a>
				{r.archived ? (
					<>
						{' '}
						·{' '}
						<a href={r.pdf} target='_blank' rel='noreferrer' className='rule-link'>
							on coa.gov.ph
						</a>
					</>
				) : null}
				{r.note ? <span className='block'>{r.note}</span> : null}
			</p>
		</article>
	)
}

export function AuditFindings({ reports, name }: { reports: AuditReport[]; name: string }) {
	if (!reports.length)
		return (
			<p className='text-[0.875rem] leading-7 text-[var(--ink-3)]'>
				No audit report for {name} could be read yet. See{' '}
				<a href='/audits' className='rule-link'>
					COA audits
				</a>{' '}
				for which ones were.
			</p>
		)
	return (
		<div className='space-y-8'>
			{reports.map((r) => (
				<AuditReportCard key={`${r.year}-${r.entity}`} report={r} />
			))}
		</div>
	)
}
