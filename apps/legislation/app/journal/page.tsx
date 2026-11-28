import type { Metadata } from 'next'
import { NotebookIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { BandSectionTitle, RegistryBand } from '../_components/registry-band'
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
			<RegistryBand
				label='Every published sitting, read in full'
				title='Journal'
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>{journals.length} session journals. </span>
						{`Parliament has published ${journals.length} plenary journals, from March 2019 to March 2023 — none since. Each is read here from the PDF itself: the measures taken up, the questions asked, the amendments won and lost, and the ${votes} votes recorded by name or count.`}
					</>
				}
			/>

			<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
				{groups.map((group) => (
					<div key={group.parliament} className='mt-20 first:mt-0'>
						<BandSectionTitle title={PARLIAMENT_LABEL[group.parliament]} count={group.journals.length} />
						<ul className='mt-8 grid gap-5 md:grid-cols-2'>
							{group.journals.map((journal) => (
								<JournalCard key={journal.key} journal={journal} />
							))}
						</ul>
					</div>
				))}

				<p className='mt-16 rounded-[var(--dv-r)] bg-[var(--paper-2)] px-6 py-5 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
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

/** One sitting as a card, as the landing site draws its cards: when it sat and which journal, what it did, how much
 *  there is in it, and the way in at the foot. */
function JournalCard({ journal }: { journal: Journal }) {
	const measures = new Set(
		journal.items.filter((item) => item.measure?.number || item.measure?.proposed).map((item) => JSON.stringify(item.measure)),
	).size
	const pill = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.71875rem] font-semibold tabular-nums'

	return (
		<li>
			<Link
				href={`/journal/${journal.key}`}
				className='group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'
			>
				<div className='flex flex-1 flex-col p-6'>
					<p className='flex flex-wrap items-center gap-x-2.5 gap-y-1.5'>
							<NotebookIcon size={22} weight='duotone' aria-hidden='true' className='text-[var(--accent)]' />
						<span className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{journalDates(journal)}</span>
						<span className='inline-block rounded-full bg-[var(--paper-2)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'>
							No. {journal.number} · {journal.kind}
						</span>
					</p>
					<p className='mt-3.5 line-clamp-4 text-[0.875rem] leading-[1.65] text-[var(--ink-2)]'>{journal.summary}</p>
					<p className='mt-auto flex flex-wrap gap-1.5 pt-5'>
						<span className={`${pill} bg-[var(--paper-2)] text-[var(--ink-2)]`}>
							{measures} measure{measures === 1 ? '' : 's'}
						</span>
						<span className={`${pill} bg-[var(--paper-2)] text-[var(--ink-2)]`}>
							{journal.points.length} debate point{journal.points.length === 1 ? '' : 's'}
						</span>
						{journal.rollCalls.length ? (
							<span className={`${pill} bg-[var(--accent-soft)] text-[var(--accent)]`}>
								{journal.rollCalls.length} vote{journal.rollCalls.length > 1 ? 's' : ''} counted
							</span>
						) : null}
					</p>
				</div>
				<span className='flex items-center justify-between gap-3 border-t border-[var(--rule-soft)] px-6 py-3.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'>
					Read the journal
					<svg className='size-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<path d='M5 12h14M13 6l6 6-6 6' />
					</svg>
				</span>
			</Link>
		</li>
	)
}
