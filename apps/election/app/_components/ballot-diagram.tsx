/* ============================================================
   The ballot, drawn

   The workspace kept explaining the ballot in prose — "a voter fills three
   tracks", "the vote is for the party, and the party earns seats" — and a
   reader who has never held one still had to imagine the paper. This is the
   paper: two lists, one oval each, and a footnote for the eight seats that
   are not on it.

   Nothing is marked. A filled oval beside a named party is a picture of a
   vote being cast for that party, which is not something a public registry
   should print.
   ============================================================ */

function Oval() {
	return (
		<span
			aria-hidden='true'
			className='mt-[3px] h-3.5 w-6 shrink-0 rounded-full border border-[var(--ink-3)]'
		/>
	)
}

function Column({
	step,
	title,
	instruction,
	rows,
	more,
	footnote,
}: {
	step: string
	title: string
	instruction: string
	rows: string[]
	more?: string
	footnote: string
}) {
	return (
		<div className='bg-[var(--paper)] p-6 sm:p-7'>
			<div className='flex items-baseline gap-3'>
				<p className='num text-[13px] font-bold leading-none text-[var(--accent)]'>{step}</p>
				<h3 className='text-[16px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
					{title}
				</h3>
			</div>

			<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
				{instruction}
			</p>

			<ul className='mt-5 border-t border-[var(--rule-soft)]'>
				{rows.map((row) => (
					<li
						key={row}
						className='flex items-start gap-3 border-b border-[var(--rule-soft)] py-2.5 text-[13.5px] leading-snug text-[var(--ink-2)]'
					>
						<Oval />
						<span className='min-w-0'>{row}</span>
					</li>
				))}
			</ul>

			{more ? (
				<p className='mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					{more}
				</p>
			) : null}

			<p className='bb-measure mt-5 text-[13px] leading-7 text-[var(--ink-2)]'>{footnote}</p>
		</div>
	)
}

/**
 * A facsimile of the two votes on one ballot, and a note on the third track.
 *
 * The party names are the real ballot entries because that half of the paper
 * is a fixed, region-wide list — every voter in the Bangsamoro sees the same
 * thirteen. The district half is left unnamed: which names are printed there
 * depends on where the voter is registered, and the workspace has a picker
 * for that rather than a guess.
 */
export function BallotDiagram({
	partyNames,
	partyCount,
	districtSeats,
	reservedSeats,
	electionDay,
}: {
	partyNames: string[]
	partyCount: number
	districtSeats: number
	reservedSeats: number
	electionDay: string
}) {
	const shown = partyNames.slice(0, 6)
	const remaining = partyCount - shown.length

	return (
		<figure className='border border-[var(--ink)]'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--ink)] bg-[var(--paper-2)] px-6 py-4'>
				<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
					One ballot, two marks
				</p>
				<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
					{electionDay}
				</p>
			</div>

			<div className='grid gap-px bg-[var(--rule)] sm:grid-cols-2'>
				<Column
					step='01'
					title='The party vote'
					instruction='Mark one — region-wide'
					rows={shown}
					more={remaining > 0 ? `+ ${remaining} more on the regional ballot` : undefined}
					footnote={`The vote is for the party, not a person. The ${partyCount} entries share the party-representative seats in proportion to the vote, and each party fills the seats it wins from its own nominee list.`}
				/>

				<Column
					step='02'
					title='The district vote'
					instruction='Mark one — your district only'
					rows={['Candidate', 'Candidate', 'Candidate']}
					footnote={`One name wins the seat for the place you are registered in. ${districtSeats} districts return a member this way, and the names printed on this half of the paper change from district to district.`}
				/>
			</div>

			<figcaption className='border-t border-[var(--ink)] bg-[var(--paper-2)] px-6 py-5'>
				{/* The full width of the ballot rather than a reading measure. This
				    note is the third track — the eight seats that never appear on the
				    paper above it — and held to 34em under a figure that runs the page
				    it read as an aside about the diagram rather than as the rest of
				    the diagram's own account. */}
				<p className='text-[13px] leading-7 text-[var(--ink-2)]'>
					<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]'>
						Not on the ballot ·{' '}
					</span>
					The remaining {reservedSeats} seats are reserved for named sectors — Non-Moro Indigenous
					Peoples, settler communities, women, youth, traditional leaders, and the ulama. Their
					nominees are on the regional certified list rather than in an oval you mark.
				</p>
			</figcaption>
		</figure>
	)
}
