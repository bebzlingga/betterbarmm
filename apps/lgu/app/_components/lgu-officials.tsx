import {
	formatNumber,
	runnersUp,
	winners,
	type Candidate,
	type Contest,
} from '@betterbarmm/lgu-data'

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
				special election followed later. Rather than guess, this page shows nothing — the sources
				below hold the current office-holders.
			</p>
		</div>
	)
}
