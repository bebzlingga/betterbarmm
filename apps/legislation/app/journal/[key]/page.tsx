import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '../../_components/page-header'
import {
	PARLIAMENT_LABEL,
	getJournal,
	getJournals,
	journalDates,
	measureHref,
	measureLabel,
	type Journal,
	type JournalMeasure,
} from '../../_lib/journal-data'

export const dynamicParams = false

export function generateStaticParams() {
	return getJournals().map((journal) => ({ key: journal.key }))
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
	const { key } = await params
	const journal = getJournal(key)
	if (!journal) return {}
	return {
		title: `Journal No. ${journal.number}, ${journalDates(journal)}`,
		description: journal.summary,
	}
}

const KIND_LABEL: Record<string, string> = {
	'first reading': 'Read on first reading',
	referral: 'Referred',
	sponsorship: 'Sponsored',
	interpellation: 'Interpellated',
	amendment: 'Amended',
	'approved on second reading': 'Approved, second reading',
	'approved on third reading': 'Approved, third reading',
	adopted: 'Adopted',
	'committee report': 'Committee report',
	'privilege speech': 'Privilege speech',
	other: 'Other',
}

/** One sitting: what it did, in order, with the debate grouped under each measure. */
export default async function Page({ params }: { params: Promise<{ key: string }> }) {
	const { key } = await params
	const journal = getJournal(key)
	if (!journal) notFound()

	const pointsFor = (measure: JournalMeasure | null) =>
		journal.points.filter((point) => JSON.stringify(point.measure ?? null) === JSON.stringify(measure ?? null))

	// Items in the order the journal records them; a measure's debate is shown
	// under the first item that names it, so each point appears once.
	const shown = new Set<string>()
	const decided = journal.items.filter((item) => /approved|adopted/.test(item.kind)).length

	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={`${PARLIAMENT_LABEL[journal.parliament]} · ${journal.session}`}
				title={`Journal No. ${journal.number}.`}
				titleMuted={`${journalDates(journal)} · ${journal.kind}`}
			/>

			{/* The summary is reading matter, not a headline: it sits under the
			    header, ruled off from the order of business below it. */}
			<div className='bb-container pt-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='border-b border-[var(--rule)] pb-[clamp(3.75rem,7vw,6.5rem)]'>
					<p className='text-[15px] leading-[1.7] text-[var(--ink-2)]'>{journal.summary}</p>
				</div>
			</div>

			<section className='bb-container grid gap-12 pt-[clamp(3.75rem,7vw,6.5rem)] pb-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1fr)_18rem]'>
				<div className='min-w-0'>
					<h2 className='border-b border-[var(--brass-line)] pb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]'>
						The order of business · {journal.items.length} items
					</h2>
					<ol>
						{journal.items.map((item, index) => {
							const id = JSON.stringify(item.measure ?? null)
							const points = item.measure && !shown.has(id) ? pointsFor(item.measure) : []
							if (points.length) shown.add(id)
							const href = measureHref(item.measure, journal.parliament)
							return (
								<li key={index} className='border-b border-[var(--rule-soft)] py-4'>
									<p className='flex flex-wrap items-baseline gap-x-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]'>
										<span>{KIND_LABEL[item.kind] ?? item.kind}</span>
										{item.measure ? (
											href ? (
												<Link href={href} className='rule-link normal-case tracking-normal'>
													{measureLabel(item.measure)}
												</Link>
											) : (
												<span className='normal-case tracking-normal'>{measureLabel(item.measure)}</span>
											)
										) : null}
									</p>
									{item.measure?.titleAsRead ? (
										<p className='mt-1 text-[13px] leading-6 text-[var(--ink-3)]'>{item.measure.titleAsRead}</p>
									) : null}
									<p className='mt-1 text-[14px] leading-6 text-[var(--ink)]'>{item.text}</p>
									{points.length ? (
										<ul className='mt-3 border-l-2 border-[var(--brass-line)] pl-4'>
											{points.map((point, i) => (
												<li key={i} className='py-1 text-[13.5px] leading-6 text-[var(--ink-2)]'>
													{point.point}
												</li>
											))}
										</ul>
									) : null}
								</li>
							)
						})}
					</ol>

					<Unplaced journal={journal} shown={shown} />
				</div>

				<aside className='space-y-8 lg:sticky lg:top-24 lg:self-start'>
					<Facts
						rows={[
							['Present', journal.attendance?.present != null ? String(journal.attendance.present) : '—'],
							['Decided', String(decided)],
							['Debate points', String(journal.points.length)],
						]}
					/>
					{journal.presiding ? (
						<p className='-mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
							<span className='font-semibold text-[var(--ink-2)]'>Presiding: </span>
							{journal.presiding}
						</p>
					) : null}

					{journal.rollCalls.length ? (
						<div>
							<h2 className='border-b border-[var(--brass-line)] pb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]'>
								Votes counted
							</h2>
							<ul>
								{journal.rollCalls.map((roll, index) => (
									<li key={index} className='border-b border-[var(--rule-soft)] py-3 text-[13px] leading-6'>
										<p className='font-semibold'>{measureLabel(roll.measure)}</p>
										<p className='num text-[var(--ink-2)]'>
											{roll.yes} for · {roll.no} against · {roll.abstain} abstained
										</p>
										{roll.note ? <p className='text-[12px] text-[var(--ink-3)]'>{roll.note}</p> : null}
									</li>
								))}
							</ul>
						</div>
					) : null}

					{journal.attendance?.absent?.length || journal.attendance?.onLeave?.length ? (
						<div className='text-[12.5px] leading-6 text-[var(--ink-3)]'>
							{journal.attendance.absent?.length ? <p>Absent: {journal.attendance.absent.join(', ')}.</p> : null}
							{journal.attendance.onLeave?.length ? (
								<p className='mt-2'>On official business or leave: {journal.attendance.onLeave.join(', ')}.</p>
							) : null}
							{journal.attendance.note ? <p className='mt-2'>{journal.attendance.note}</p> : null}
						</div>
					) : null}

					{journal.dateNote ? <p className='text-[12.5px] leading-6 text-[var(--ink-3)]'>{journal.dateNote}</p> : null}

					<div className='flex flex-col gap-2 text-[13px]'>
						<a href={journal.pdf_url} target='_blank' rel='noreferrer' className='rule-link'>
							The journal as published (PDF)
						</a>
						<a href={journal.url} target='_blank' rel='noreferrer' className='rule-link'>
							Its page on Parliament’s site
						</a>
						<Link href='/journal' className='rule-link'>
							All journals
						</Link>
					</div>
				</aside>
			</section>
		</>
	)
}

/** Debate points whose measure the order of business never names — kept, not dropped. */
function Unplaced({ journal, shown }: { journal: Journal; shown: Set<string> }) {
	const rest = journal.points.filter((point) => !shown.has(JSON.stringify(point.measure ?? null)))
	if (!rest.length) return null
	return (
		<div className='mt-10'>
			<h2 className='border-b border-[var(--brass-line)] pb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em]'>
				Also on the floor
			</h2>
			<ul>
				{rest.map((point, index) => (
					<li key={index} className='border-b border-[var(--rule-soft)] py-3 text-[13.5px] leading-6 text-[var(--ink-2)]'>
						{point.measure ? <span className='font-semibold text-[var(--ink)]'>{measureLabel(point.measure)}: </span> : null}
						{point.point}
					</li>
				))}
			</ul>
		</div>
	)
}

function Facts({ rows }: { rows: [string, string][] }) {
	return (
		<dl className='grid grid-cols-2 border-t border-[var(--rule)]'>
			{rows.map(([label, value]) => (
				<div key={label} className='border-b border-[var(--rule)] py-3 pr-3'>
					<dd className='num text-[1.15rem] font-extrabold leading-tight tracking-[-0.02em]'>{value}</dd>
					<dt className='mt-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
						{label}
					</dt>
				</div>
			))}
		</dl>
	)
}
