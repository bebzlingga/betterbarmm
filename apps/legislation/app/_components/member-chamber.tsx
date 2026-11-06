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
	// Grids, one under the other (user decision): the five counts in a row of five, the missed sittings in
	// cells of the same width rather than a row each.
	return (
		<section className='mt-16 border-t border-[var(--rule)] pt-12'>
			<h2 className='text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>In the chamber</h2>
			<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-3)]'>
				From the plenary journals Parliament has published, which stop in March 2023. A sitting counts as present when the journal&rsquo;s roll call does not
				list {name} as absent or on leave. Members who also run a ministry are often away on its business; the journals list that as absent unless the
				member asked to be excused.
			</p>
			{/* Each cell draws its right and bottom rule; the grid runs a pixel past a clipping frame so the
			    last column's and last row's rules fall outside it, at any count. */}
			<p className='mt-6 bb-label'>Roll calls</p>
			<div className='mt-3 overflow-hidden border-y border-[var(--rule)]'>
				<dl className='-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'>
					{figures.map((f) => (
						<div key={f.label} className='border-b border-r border-[var(--rule)] px-4 py-4'>
							<dd className='num text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{f.value}</dd>
							<dt className='mt-1.5 text-[0.78125rem] leading-4 text-[var(--ink-3)]'>{f.label}</dt>
						</div>
					))}
				</dl>
			</div>

			{missed.length ? (
				<>
					<p className='mt-8 bb-label'>Sittings missed</p>
					<div className='mt-3 overflow-hidden border-y border-[var(--rule)]'>
						<ul className='-mb-px -mr-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'>
							{missed.map(({ j, leave }) => (
								<li key={`${j.key}-${leave}`} className='border-b border-r border-[var(--rule)] px-4 py-3'>
									<a href={`/journal/${j.key}`} className='text-[0.84375rem] text-[var(--ink)] hover:text-[var(--accent)]'>
										{journalDates(j)}
									</a>
									<p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{leave ? 'On leave or official business' : 'Absent'}</p>
								</li>
							))}
						</ul>
					</div>
				</>
			) : null}

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
