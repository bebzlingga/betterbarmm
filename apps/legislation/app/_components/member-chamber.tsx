import type { ChamberRecord } from '../_lib/member-chamber'
import { journalDates } from '../_lib/journal-data'

/* A member's sittings and words, from the published journals. Plain counts
   with the sittings behind each, and what the record cannot tell. */

export function MemberChamber({ record, name }: { record: ChamberRecord; name: string }) {
	const present = record.sittings - record.absent.length - record.onLeave.length
	const figures = [
		{ value: record.sittings, label: 'Sittings with a roll call on record' },
		{ value: present, label: 'Present' },
		{ value: record.absent.length, label: 'Listed absent' },
		{ value: record.onLeave.length, label: 'On leave or official business' },
		{ value: record.points.length, label: 'Points of debate recorded' },
	]
	const missed = [...record.absent.map((j) => ({ j, leave: false })), ...record.onLeave.map((j) => ({ j, leave: true }))].sort((a, b) =>
		(b.j.dates[0] ?? '').localeCompare(a.j.dates[0] ?? ''),
	)
	// Two columns (user decision: the five figures spread across the page and the missed sittings ran down
	// beneath them, leaving most of the section empty): the counts beside the sittings behind them.
	return (
		<section className='mt-16 border-t border-[var(--rule)] pt-12'>
			<h2 className='text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>In the chamber</h2>
			<p className='mt-2 max-w-[46rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
				From the plenary journals Parliament has published, which stop in March 2023. A sitting counts as present when the journal&rsquo;s roll call does not
				list {name} as absent or on leave. Members who also run a ministry are often away on its business; the journals list that as absent unless the
				member asked to be excused.
			</p>
			<div className='mt-6 grid gap-x-16 gap-y-8 lg:grid-cols-2'>
				<div>
					<p className='bb-label'>Roll calls</p>
					<dl className='mt-3'>
						{figures.map((f) => (
							<div key={f.label} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-2.5'>
								<dt className='text-[0.84375rem] text-[var(--ink-2)]'>{f.label}</dt>
								<dd className='num text-[1rem] font-extrabold text-[var(--ink)]'>{f.value}</dd>
							</div>
						))}
					</dl>
				</div>

				{missed.length ? (
					<div>
						<p className='bb-label'>Sittings missed</p>
						<ul className='mt-3'>
							{missed.map(({ j, leave }) => (
								<li key={`${j.key}-${leave}`} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-2.5 text-[0.84375rem]'>
									<a href={`/journal/${j.key}`} className='text-[var(--ink)] hover:text-[var(--accent)]'>
										{journalDates(j)}
									</a>
									<span className='text-[0.78125rem] text-[var(--ink-3)]'>{leave ? 'On leave or official business' : 'Absent'}</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</div>

			{record.points.length ? (
				<div className='mt-8'>
					<p className='bb-label'>What the journals record them saying</p>
					<ul className='mt-3'>
						{[...record.points].sort((a, b) => (b.journal.dates[0] ?? '').localeCompare(a.journal.dates[0] ?? '')).slice(0, 8).map((p, i) => (
							<li key={i} className='border-t border-[var(--rule)] py-3'>
								<p className='text-[0.875rem] leading-6 text-[var(--ink-2)]'>{p.text}</p>
								<a href={`/journal/${p.journal.key}`} className='mt-1 inline-block text-[0.75rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									{p.journal.title} · {journalDates(p.journal)}
								</a>
							</li>
						))}
					</ul>
					{record.points.length > 8 ? <p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>The latest 8 of {record.points.length}.</p> : null}
				</div>
			) : null}

			<p className='mt-6 max-w-[46rem] text-[0.75rem] leading-5 text-[var(--ink-3)]'>
				Most votes are taken by voice, so a member&rsquo;s position on a measure is recorded only on the few roll calls.
			</p>
		</section>
	)
}
