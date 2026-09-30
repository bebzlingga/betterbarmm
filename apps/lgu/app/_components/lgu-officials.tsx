import {
	formatNumber,
	runnersUp,
	winners,
	type Candidate,
	type Contest,
} from '@betterbarmm/lgu-data'
import type { OfficeHolder, ProvinceRoll, UnitRoll } from '@betterbarmm/lgu-data/history'

/** One person, with the tally that put them there. */
function Person({
	candidate,
	rank,
	elected,
}: {
	candidate: Candidate
	rank: number
	elected: boolean
}) {
	return (
		<li
			data-elected={elected}
			className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2.5 data-[elected=false]:text-[var(--ink-3)]'
		>
			<span className='num w-6 shrink-0 text-[10.5px] text-[var(--ink-3)]'>
				{String(rank).padStart(2, '0')}
			</span>
			<span className='min-w-0 flex-1'>
				<span
					className={`block text-[14px] leading-5 ${
						elected ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-3)]'
					}`}
				>
					{candidate.name}
				</span>
				{candidate.party ? (
					<span className='mt-0.5 block font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
						{candidate.party}
					</span>
				) : null}
			</span>
			<span className='num shrink-0 text-right text-[12.5px] text-[var(--ink-2)]'>
				{formatNumber(candidate.votes)}
				<span className='ml-1.5 text-[var(--ink-mute)]'>{candidate.percentage}%</span>
			</span>
		</li>
	)
}

/**
 * A single-seat office — mayor, governor and their deputies.
 *
 * The winner is set large with the runners-up under it, because the question
 * the page is answering is "who is the mayor", not "how did the race go". The
 * losing candidates stay because a 51-to-49 result and a walkover are
 * different facts about a town, and only the full tally tells them apart.
 */
export function SingleSeat({ title, contest }: { title: string; contest: Contest }) {
	const [winner, ...rest] = contest.ranked
	if (!winner) return null

	return (
		<div>
			<h4 className='border-b border-[var(--ink)] pb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
				{title}
			</h4>

			<div className='mt-4'>
				<p className='text-[21px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
					{winner.name}
				</p>
				<p className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--ink-3)]'>
					{winner.party ? (
						<span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
							{winner.party}
						</span>
					) : null}
					<span className='num'>{formatNumber(winner.votes)} votes</span>
					<span className='num'>{winner.percentage}%</span>
				</p>
			</div>

			{rest.length > 0 ? (
				<details className='mt-4 group'>
					<summary className='cursor-pointer list-none font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
						{rest.length} other {rest.length === 1 ? 'candidate' : 'candidates'}
						<span aria-hidden='true' className='ml-1.5 inline-block group-open:rotate-90'>
							&rsaquo;
						</span>
					</summary>
					<ul className='mt-2'>
						{rest.map((candidate, index) => (
							<Person
								key={candidate.name}
								candidate={candidate}
								rank={index + 2}
								elected={false}
							/>
						))}
					</ul>
				</details>
			) : null}
		</div>
	)
}

/**
 * A multi-seat body — a council or a provincial board.
 *
 * Where the statute fixes the number of seats the elected members are set
 * above a rule and the rest below it. Where it does not — a provincial board's
 * size varies with the province — the whole tally is shown in order and no
 * line is drawn, because guessing where the cut falls would be inventing the
 * result.
 */
export function MultiSeat({ title, contests }: { title: string; contests: Contest[] }) {
	return (
		<div>
			<h4 className='border-b border-[var(--ink)] pb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
				{title}
			</h4>

			{contests.map((contest) => {
				const elected = winners(contest)
				const rest = runnersUp(contest)
				// The contest name repeats the place; only the district part is news.
				const district = contest.contestName.split(' - ').slice(-1)[0]

				return (
					<div key={contest.contestName} className='mt-5'>
						{contests.length > 1 ? (
							<p className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
								{district}
							</p>
						) : null}

						{elected.length > 0 ? (
							<>
								<p className='mt-2 text-[11.5px] text-[var(--ink-3)]'>
									{elected.length} elected of {contest.ranked.length} candidates
								</p>
								<ul className='mt-2'>
									{elected.map((candidate, index) => (
										<Person
											key={candidate.name}
											candidate={candidate}
											rank={index + 1}
											elected
										/>
									))}
								</ul>
							</>
						) : (
							<p className='mt-2 text-[11.5px] leading-5 text-[var(--ink-3)]'>
								{contest.ranked.length} candidates, in order of votes. The number of seats on a
								provincial board varies, so this list is the canvass rather than a declaration of
								who was elected.
							</p>
						)}

						{rest.length > 0 ? (
							<details className='mt-3 group'>
								<summary className='cursor-pointer list-none font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
									{elected.length > 0 ? `${rest.length} not elected` : 'Full tally'}
									<span aria-hidden='true' className='ml-1.5 inline-block group-open:rotate-90'>
										&rsaquo;
									</span>
								</summary>
								<ul className='mt-2'>
									{rest.map((candidate, index) => (
										<Person
											key={candidate.name}
											candidate={candidate}
											rank={elected.length + index + 1}
											elected={false}
										/>
									))}
								</ul>
							</details>
						) : null}
					</div>
				)
			})}
		</div>
	)
}

/** Shown where COMELEC has no canvass on record for a unit in this term. */
export function NoCanvass({ name }: { name: string }) {
	return (
		<div className='border border-[var(--rule)] bg-[var(--paper-2)] p-5 lg:p-6'>
			<div className='flex flex-wrap items-center gap-3'>
				<span className='badge badge-plain badge-idle'>No canvass on record</span>
			</div>
			<p className='mt-3 max-w-3xl text-[13.5px] leading-6 text-[var(--ink-2)]'>
				COMELEC&rsquo;s results for this term carry no Certificate of Canvass for {name}. That
				usually means the contest was postponed, or a failure of elections was declared and a
				special election followed later. Rather than guess, this page shows nothing —{' '}
				<a href='/#where-to-look' className='rule-link'>
					these offices
				</a>{' '}
				hold the current office-holders.
			</p>
		</div>
	)
}

/* ============================================================
   The terms before 2025

   Two kinds of record, and only one of them is a canvass.

   Where OpenHalalan's vote counts reach a town — 2016, 2019 and 2022
   everywhere, 2010 and 2013 for about half the region — the term is a
   full canvass and draws through `SingleSeat` and `MultiSeat` above,
   the same components the 2025 result uses, because it is the same
   kind of fact.

   Where only the winners file reaches it, the term is a roll: a name
   and a party, nothing behind them. Those draw through the components
   below, and they are deliberately unlike the canvass — no vote
   column, no "N other candidates" to open, no percentages. A reader
   moving from the 2019 tab to the 2004 tab should see, without
   reading a caption, that the page is telling them less.
   ============================================================ */

/** One office, held by one person, for one term. */
export function HeldOffice({ title, holder }: { title: string; holder: OfficeHolder }) {
	return (
		<div>
			<h4 className='border-b border-[var(--rule)] pb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
				{title}
			</h4>
			<p className='mt-4 text-[19px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
				{holder.name}
			</p>
			{holder.party ? (
				<p className='mt-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
					{holder.party}
				</p>
			) : null}
		</div>
	)
}

/** A council or board, as a plain roll of the people who sat on it. */
function Bench({ title, members }: { title: string; members: OfficeHolder[] }) {
	return (
		<div>
			<div className='flex items-baseline justify-between gap-3 border-b border-[var(--rule)] pb-2.5'>
				<h4 className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
					{title}
				</h4>
				<span className='num text-[11px] font-semibold text-[var(--brass)]'>{members.length}</span>
			</div>
			<ul className='mt-2 grid sm:grid-cols-2 sm:gap-x-10'>
				{members.map((member, index) => (
					<li
						key={`${member.name}-${index}`}
						className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2.5'
					>
						<span className='num w-6 shrink-0 text-[10.5px] text-[var(--ink-3)]'>
							{String(index + 1).padStart(2, '0')}
						</span>
						<span className='min-w-0 flex-1 text-[13.5px] leading-5 text-[var(--ink)]'>
							{member.name}
						</span>
						{member.party ? (
							<span className='shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
								{member.party}
							</span>
						) : null}
					</li>
				))}
			</ul>
		</div>
	)
}

/**
 * Says, once per panel, where a reconstructed canvass came from.
 *
 * The result below it is a real canvass — every candidate, every vote — but
 * it was rebuilt from archives rather than read off a Certificate of Canvass,
 * and for 2019 and 2022 the sites it was rebuilt from are no longer serving
 * it. A reader comparing a town's 2019 result against some other source
 * should know which record they are holding.
 */
export function Reconstructed({ note }: { note?: string }) {
	return (
		<div className='mb-8 border-l-2 border-[var(--rule)] pl-4'>
			<p className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
				Reconstructed canvass
			</p>
			{note ? (
				<p className='mt-1.5 max-w-2xl text-[12.5px] leading-6 text-[var(--ink-3)]'>{note}</p>
			) : null}
		</div>
	)
}

/** Says, once per panel, that this term is a roll and not a canvass. */
function WinnersOnly({ note }: { note?: string }) {
	return (
		<div className='mb-8 border-l-2 border-[var(--brass)] pl-4'>
			<p className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
				Winners only — no vote counts
			</p>
			{note ? (
				<p className='mt-1.5 max-w-2xl text-[12.5px] leading-6 text-[var(--ink-3)]'>{note}</p>
			) : null}
		</div>
	)
}

/** A city or municipality's officers for a term recorded as winners only. */
export function UnitRollPanel({
	roll,
	isCity,
	note,
}: {
	roll: UnitRoll
	isCity: boolean
	note?: string
}) {
	return (
		<div>
			<WinnersOnly note={note} />
			<div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
				{roll.mayor ? <HeldOffice title='Mayor' holder={roll.mayor} /> : null}
				{roll.viceMayor ? <HeldOffice title='Vice-Mayor' holder={roll.viceMayor} /> : null}
			</div>
			{roll.council?.length ? (
				<div className='mt-12'>
					<Bench
						title={isCity ? 'Sangguniang Panlungsod' : 'Sangguniang Bayan'}
						members={roll.council}
					/>
				</div>
			) : null}
		</div>
	)
}

/** A province's officers for a term recorded as winners only. */
export function ProvinceRollPanel({ roll, note }: { roll: ProvinceRoll; note?: string }) {
	return (
		<div>
			<WinnersOnly note={note} />
			{roll.undivided ? (
				<p className='mb-8 max-w-2xl border border-[var(--rule)] bg-[var(--paper-2)] p-4 text-[13px] leading-6 text-[var(--ink-2)]'>
					{roll.undivided} was still one province in this term. These are its officials — the
					governor, vice-governor and board who governed what is now both Maguindanao del Norte and
					Maguindanao del Sur. Neither half elected its own until 2025.
				</p>
			) : null}
			<div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
				{roll.governor ? <HeldOffice title='Provincial Governor' holder={roll.governor} /> : null}
				{roll.viceGovernor ? (
					<HeldOffice title='Provincial Vice-Governor' holder={roll.viceGovernor} />
				) : null}
			</div>
			{roll.board?.length ? (
				<div className='mt-12'>
					<Bench title='Sangguniang Panlalawigan' members={roll.board} />
				</div>
			) : null}
		</div>
	)
}

/**
 * Every mayor a town has had since 2001, newest first.
 *
 * This is the thing twenty-four years of records are actually for. One term
 * in isolation answers "who is the mayor"; the column answers "who has this
 * town been run by", which is a different and more useful question in a
 * region where the answer is often one surname for two decades.
 *
 * The run is computed on surnames, not people, and the caption says so.
 * Matching whole names would break on a middle initial that appears in one
 * cycle and not the next; matching surnames joins relatives into a single
 * run. The second error is the one worth making, because a seat passing
 * between siblings is the pattern a reader is looking for, not a coincidence
 * the page should hide.
 */
export function OfficeLineage({
	terms,
	holders,
}: {
	terms: { id: string; label: string; status: string }[]
	holders: Record<string, { name: string; party: string | null } | undefined>
}) {
	const rows = terms.map((term) => ({ term, holder: holders[term.id] }))
	const named = rows.filter((row) => row.holder)
	if (named.length < 2) return null

	const family = (name: string) => name.split(',')[0]!.trim().toUpperCase()
	const surnames = new Set(named.map((row) => family(row.holder!.name)))

	return (
		<div>
			<div className='flex items-baseline justify-between gap-3 border-b border-[var(--ink)] pb-2.5'>
				<h4 className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink)]'>
					The office since 2001
				</h4>
				<span className='num text-[11px] font-semibold text-[var(--brass)]'>
					{surnames.size} {surnames.size === 1 ? 'surname' : 'surnames'}
				</span>
			</div>

			<ol className='mt-1'>
				{rows.map(({ term, holder }, index) => {
					const previous = rows[index + 1]?.holder
					const continues =
						holder && previous && family(holder.name) === family(previous.name)

					return (
						<li
							key={term.id}
							className='flex items-baseline gap-4 border-b border-[var(--rule-soft)] py-3'
						>
							<span className='num w-[4.5rem] shrink-0 text-[11px] font-semibold text-[var(--ink-3)]'>
								{term.label}
							</span>
							{holder ? (
								<>
									<span className='min-w-0 flex-1 text-[14px] leading-5 text-[var(--ink)]'>
										{holder.name}
										{continues ? (
											<span
												className='ml-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'
												title='Same surname as the term before'
											>
												held
											</span>
										) : null}
									</span>
									<span className='shrink-0 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
										{holder.party ?? '—'}
									</span>
								</>
							) : (
								<span className='min-w-0 flex-1 text-[13px] italic leading-5 text-[var(--ink-mute)]'>
									not in the record
								</span>
							)}
						</li>
					)
				})}
			</ol>

			<p className='mt-4 max-w-2xl text-[12px] leading-6 text-[var(--ink-3)]'>
				“Held” marks a term whose office-holder shares a surname with the term before it. Surnames,
				not people — a seat passing between relatives reads the same here as one person re-elected,
				and in most of these towns it is the more common of the two.
			</p>
		</div>
	)
}
