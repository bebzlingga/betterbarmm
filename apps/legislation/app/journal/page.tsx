import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '../_components/page-header'
import { PARLIAMENT_LABEL, getJournals, journalDates, type Journal } from '../_lib/journal-data'

export const metadata: Metadata = {
	title: 'Journal',
	description:
		'Every session journal the Bangsamoro Parliament has published, read in full — what each sitting did, the measures it acted on, the debate, and the votes.',
}

/**
 * The sittings, newest first, in the two Parliaments that published them.
 * Each row says what the sitting did in a sentence or two and how much of
 * it there is to read, so a reader can pick the day that matters.
 */
export default function JournalPage() {
	const journals = getJournals()
	const groups = (['BTA2', 'BTA1'] as const).map((parliament) => ({
		parliament,
		journals: journals.filter((journal) => journal.parliament === parliament),
	}))
	const votes = journals.reduce((sum, journal) => sum + journal.rollCalls.length, 0)

	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={`${journals.length} session journals`}
				title='What happened on the floor.'
				titleMuted='Every published sitting, read in full.'
				description={`Parliament has published ${journals.length} plenary journals, from March 2019 to March 2023 — none since. Each is read here from the PDF itself: the measures taken up, the questions asked, the amendments won and lost, and the ${votes} votes recorded by name or count.`}
			/>

			<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
				{groups.map((group) => (
					<div key={group.parliament} className='mt-14 first:mt-0'>
						<h2 className='border-b border-[var(--brass-line)] pb-3 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]'>
							{PARLIAMENT_LABEL[group.parliament]} · {group.journals.length} journals
						</h2>
						<ul>
							{group.journals.map((journal) => (
								<JournalRow key={journal.key} journal={journal} />
							))}
						</ul>
					</div>
				))}

				<p className='mt-12 max-w-3xl text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					Parliament numbers its journals within each Parliament, and the published series has gaps — sittings
					with no journal posted. Nothing after Journal No. 22 of March 2023 has been published. Source:{' '}
					<a href='https://parliament.bangsamoro.gov.ph/journal-19/' className='rule-link' target='_blank' rel='noreferrer'>
						BTA1 journals
					</a>{' '}
					and{' '}
					<a href='https://parliament.bangsamoro.gov.ph/journals-22/' className='rule-link' target='_blank' rel='noreferrer'>
						BTA2 journals
					</a>
					.
				</p>
			</section>
		</>
	)
}

function JournalRow({ journal }: { journal: Journal }) {
	const measures = new Set(
		journal.items.filter((item) => item.measure?.number || item.measure?.proposed).map((item) => JSON.stringify(item.measure)),
	).size

	return (
		<li className='border-b border-[var(--rule-soft)]'>
			<Link
				href={`/journal/${journal.key}`}
				className='group grid gap-x-8 gap-y-2 py-5 transition hover:bg-[var(--paper-2)] sm:grid-cols-[11rem_minmax(0,1fr)_9rem]'
			>
				<div>
					<p className='text-[0.875rem] font-semibold text-[var(--ink)]'>{journalDates(journal)}</p>
					<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>
						Journal No. {journal.number} · {journal.kind}
					</p>
				</div>
				<p className='text-[0.84375rem] leading-6 text-[var(--ink-2)] group-hover:text-[var(--ink)]'>{journal.summary}</p>
				<p className='num text-[0.75rem] leading-6 text-[var(--ink-3)] sm:text-right'>
					{measures} measure{measures === 1 ? '' : 's'}
					<br />
					{journal.points.length} debate point{journal.points.length === 1 ? '' : 's'}
					{journal.rollCalls.length ? (
						<>
							<br />
							<span className='font-semibold text-[var(--accent)]'>
								{journal.rollCalls.length} vote{journal.rollCalls.length > 1 ? 's' : ''}
							</span>
						</>
					) : null}
				</p>
			</Link>
		</li>
	)
}
