import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RegistryBand } from '../../_components/registry-band'
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
			{/* The summary is the lead of the band: what the sitting did, under when it sat. */}
			<RegistryBand
				label={`${PARLIAMENT_LABEL[journal.parliament]} · ${journal.session}`}
				title={`Journal No. ${journal.number}`}
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>
							{journalDates(journal)} · {journal.kind}.{' '}
						</span>
						{journal.summary}
					</>
				}
			/>

			<section className='bb-container grid gap-12 pt-[clamp(3.75rem,7vw,6.5rem)] pb-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1fr)_18rem]'>
				<div className='min-w-0'>
					<h2 className='text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
						The order of business <span className='text-[var(--ink-mute)]'>· {journal.items.length}</span>
					</h2>
					<ol className='mt-4'>
						{journal.items.map((item, index) => {
							const id = JSON.stringify(item.measure ?? null)
							const points = item.measure && !shown.has(id) ? pointsFor(item.measure) : []
							if (points.length) shown.add(id)
							const href = measureHref(item.measure, journal.parliament)
							return (
								<li key={index} className='border-b border-[var(--rule-soft)] py-5 last:border-b-0'>
									{/* What was done, and to which measure, as badges, as a bill's card heads itself. */}
									<p className='flex flex-wrap items-center gap-1.5'>
										<span className='inline-block rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>
											{KIND_LABEL[item.kind] ?? item.kind}
										</span>
										{item.measure ? (
											href ? (
												<Link href={href} className='inline-block rounded-full border border-[var(--rule)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'>
													{measureLabel(item.measure)}
												</Link>
											) : (
												<span className='inline-block rounded-full border border-[var(--rule)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--ink-2)]'>{measureLabel(item.measure)}</span>
											)
										) : null}
									</p>
									{item.measure?.titleAsRead ? (
										<p className='mt-2 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{item.measure.titleAsRead}</p>
									) : null}
									<p className='mt-1 text-[0.875rem] leading-6 text-[var(--ink)]'>{item.text}</p>
									{points.length ? (
										<ul className='mt-3 grid gap-1 bg-[var(--paper-2)] px-4 py-3'>
											{points.map((point, i) => (
												<li key={i} className='py-1 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>
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
							['Debated', String(journal.points.length)],
						]}
					/>
					{journal.presiding ? (
						<p className='-mt-4 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
							<span className='font-semibold text-[var(--ink-2)]'>Presiding: </span>
							{journal.presiding}
						</p>
					) : null}

					{journal.rollCalls.length ? (
						<div>
							<h2 className='text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
								Votes counted
							</h2>
							<ul className='mt-3 grid gap-2'>
								{journal.rollCalls.map((roll, index) => (
									<li key={index} className='border border-[var(--rule)] p-4 text-[0.8125rem] leading-6'>
										<p className='font-semibold'>{measureLabel(roll.measure)}</p>
										<p className='num text-[var(--ink-2)]'>
											{roll.yes} for · {roll.no} against · {roll.abstain} abstained
										</p>
										{roll.note ? <p className='text-[0.75rem] text-[var(--ink-3)]'>{roll.note}</p> : null}
									</li>
								))}
							</ul>
						</div>
					) : null}

					{journal.attendance?.absent?.length || journal.attendance?.onLeave?.length ? (
						<div className='text-[0.78125rem] leading-6 text-[var(--ink-3)]'>
							{journal.attendance.absent?.length ? <p>Absent: {journal.attendance.absent.join(', ')}.</p> : null}
							{journal.attendance.onLeave?.length ? (
								<p className='mt-2'>On official business or leave: {journal.attendance.onLeave.join(', ')}.</p>
							) : null}
							{journal.attendance.note ? <p className='mt-2'>{journal.attendance.note}</p> : null}
						</div>
					) : null}

					{journal.dateNote ? <p className='text-[0.78125rem] leading-6 text-[var(--ink-3)]'>{journal.dateNote}</p> : null}

					<div className='grid gap-2'>
						<a href={journal.pdf_url} target='_blank' rel='noreferrer' className='bb-btn bb-btn-solid w-full'>
							The journal as published (PDF)
						</a>
						<a href={journal.url} target='_blank' rel='noreferrer' className='bb-btn bb-btn-ghost w-full'>
							Its page on Parliament’s site
						</a>
						<Link href='/journal' className='mt-1 text-center text-[0.8125rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
							← All journals
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
		<div className='mt-12'>
			<h2 className='text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]'>
				Also on the floor
			</h2>
			<ul className='mt-3'>
				{rest.map((point, index) => (
					<li key={index} className='border-b border-[var(--rule-soft)] py-3 text-[0.84375rem] leading-6 text-[var(--ink-2)]'>
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
		<dl className='grid grid-cols-3 divide-x divide-[var(--rule)] border border-[var(--rule)] bg-[var(--paper-2)]'>
			{rows.map(([label, value]) => (
				<div key={label} className='flex flex-col-reverse px-3 py-4 text-center'>
					<dt className='mt-1.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--brass)]'>{label}</dt>
					<dd className='num text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{value}</dd>
				</div>
			))}
		</dl>
	)
}
