import type { Metadata } from 'next'
import Link from 'next/link'
import { auditMeta, auditReports } from '@betterbarmm/lgu-data/coa'
import { AuditReportCard, OPINION } from '../_components/audit-findings'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'COA audits — Local government directory',
	description: 'What the Commission on Audit found in BARMM towns and cities: each audit opinion, the main findings, and how much of the previous year’s advice was acted on.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

export default async function AuditsPage({ searchParams }: { searchParams: Promise<{ area?: string; opinion?: string }> }) {
	const { area, opinion } = await searchParams
	const areas = [...new Set(auditReports.map((r) => r.area).filter(Boolean))] as string[]
	const shown = auditReports
		.filter((r) => (!area || r.area === area) && (!opinion || r.opinion === opinion))
		.sort((a, b) => b.year - a.year || (a.unitName ?? a.entity).localeCompare(b.unitName ?? b.entity))
	const count = (o: string) => auditReports.filter((r) => r.opinion === o).length
	const withPrior = auditReports.filter((r) => r.priorRecommendations?.implemented != null)
	const acted = withPrior.reduce((s, r) => s + (r.priorRecommendations!.implemented ?? 0), 0)
	const total = withPrior.reduce((s, r) => s + (r.priorRecommendations!.total ?? (r.priorRecommendations!.implemented ?? 0) + (r.priorRecommendations!.partial ?? 0) + (r.priorRecommendations!.notImplemented ?? 0)), 0)
	const label = (slug: string) => (slug === 'tawi-tawi' ? 'Tawi-Tawi' : slug.split('-').map((w) => (w === 'del' ? w : w[0]!.toUpperCase() + w.slice(1))).join(' '))
	const href = (next: { area?: string; opinion?: string }) => {
		const p = new URLSearchParams(Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])))
		return p.size ? `/audits?${p}` : '/audits'
	}
	const chip = (on: boolean, to: string, text: string) => (
		<Link key={text} href={to} className={`border px-3 py-1.5 text-[13px] font-semibold ${on ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink)]'}`}>
			{text}
		</Link>
	)

	return (
		<>
			<LguMasthead
				kicker='The money · Bangsamoro'
				name='COA audits'
				noteBeside
				note='Every year the Commission on Audit examines each local government’s books and says whether they can be trusted. Here is what it said about BARMM towns and cities, in the reports that could be read.'
			/>
			<section className='bb-container bb-section'>
				<dl className='grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4'>
					{[
						{ v: auditReports.length, l: 'Reports read' },
						{ v: count('qualified'), l: 'Qualified opinions' },
						{ v: count('disclaimer'), l: 'Disclaimers: no opinion possible' },
						{ v: total ? `${Math.round((acted / total) * 100)}%` : '—', l: 'Of last year’s advice fully acted on' },
					].map((f) => (
						<div key={f.l} className='border-t border-[var(--rule)] pt-3'>
							<dd className='num text-[2rem] font-extrabold leading-none tracking-[-0.03em]'>{f.v}</dd>
							<dt className='mt-2 text-[12.5px] text-[var(--ink-3)]'>{f.l}</dt>
						</div>
					))}
				</dl>

				<div className='mt-12 bg-[var(--paper-2)] p-6 text-[14px] leading-7 text-[var(--ink-2)]'>
					<p>
						<strong>What is here, and what is not.</strong> coa.gov.ph turns away automated readers, so these are the reports the Internet Archive
						kept a copy of: {`${auditReports.length} executive summaries, almost all for FY 2020. `}The regional government&rsquo;s and ministries&rsquo;
						reports, the provinces&rsquo;, Cotabato City&rsquo;s and later years could not be read yet. Findings are put in plain words; each links to
						the report it came from.
					</p>
				</div>

				<div className='mt-10 flex flex-wrap gap-2'>
					{chip(!area, href({ opinion }), 'Everywhere')}
					{areas.map((a) => chip(area === a, href({ area: a, opinion }), label(a)))}
				</div>
				<div className='mt-3 flex flex-wrap gap-2'>
					{chip(!opinion, href({ area }), 'Any opinion')}
					{Object.entries(OPINION)
						.filter(([k]) => count(k))
						.map(([k, o]) => chip(opinion === k, href({ area, opinion: k }), `${o.label} (${count(k)})`))}
				</div>

				<h2 className={`${H2} mt-12`}>
					{shown.length} report{shown.length === 1 ? '' : 's'}
				</h2>
				<div className='mt-6 grid gap-x-16 gap-y-10 lg:grid-cols-2'>
					{shown.map((r) => (
						<div key={`${r.entity}-${r.year}`}>
							{r.unitKey ? (
								<Link href={`/${r.unitKey}#audits`} className='rule-link mb-1 inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--brass)]'>
									{label(r.area ?? '')}
								</Link>
							) : (
								<p className='mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--brass)]'>{label(r.area ?? '')}</p>
							)}
							<AuditReportCard report={r} showEntity />
						</div>
					))}
				</div>
				<p className='mt-12 text-[12.5px] text-[var(--ink-3)]'>
					Read {auditMeta.generatedAt}. Source: {auditMeta.source.map((s) => s.label).join('; ')}.
				</p>
			</section>
		</>
	)
}
