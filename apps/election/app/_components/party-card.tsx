import { dominantStatusLabel, type PartyView } from '../_lib/election-data'
import { ConfidenceBadge } from './confidence-badge'
import { PartyMark, PersonAvatar } from './marks'

/**
 * One entry on the party ballot.
 *
 * A plate rather than a bordered box: the cards sit on a one-pixel grid, so
 * the rules between them are the grid's and every card is the same plane as
 * its neighbours. What is set large is the ballot name, because that is the
 * string a voter will actually be looking for on the paper.
 */
export function PartyCard({
	party,
	showDescription = false,
}: {
	party: PartyView
	showDescription?: boolean
}) {
	return (
		<a
			href={`/parties/${party.party_id}`}
			className='group flex min-h-full flex-col bg-[var(--paper)] p-6 transition-colors duration-300 hover:bg-[var(--paper-2)]'
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex min-w-0 items-center gap-3'>
					<PartyMark partyId={party.party_id} ballotName={party.ballot_name} size={44} />
					<p className='min-w-0 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
						{party.party_id}
					</p>
				</div>
				{party.dominantStatus ? (
					<span className='border border-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--accent)]'>
						{dominantStatusLabel[party.dominantStatus]}
					</span>
				) : (
					<ConfidenceBadge confidence={party.confidence} />
				)}
			</div>

			<h3 className='mt-5 text-2xl font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
				{party.ballot_name}
			</h3>
			<p className='mt-2 text-[13.5px] font-semibold leading-snug text-[var(--ink-2)]'>
				{party.full_name}
			</p>

			{party.affiliation ? (
				<p className='mt-3 line-clamp-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					{party.affiliation}
				</p>
			) : null}

			{showDescription && party.description ? (
				<p className='mt-4 line-clamp-4 text-[13px] leading-6 text-[var(--ink-2)]'>
					{party.description}
				</p>
			) : null}

			{party.cmNominee ? (
				<div className='mt-5 flex items-center gap-3'>
					<PersonAvatar name={party.cmNominee} size={36} />
					<div className='min-w-0'>
						<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
							Chief-minister nominee
						</p>
						<p className='mt-1 truncate text-[13.5px] font-semibold text-[var(--ink)]'>
							{party.cmNominee}
						</p>
					</div>
				</div>
			) : null}

			<dl className='mt-auto flex gap-8 border-t border-[var(--brass-line)] pt-5'>
				{[
					{ value: party.computedStats.sectoralCandidates, label: 'Sectoral links' },
					{ value: party.computedStats.districtCocFilers, label: 'District filers' },
				].map((stat) => (
					<div key={stat.label}>
						<dd className='num text-xl font-extrabold leading-none text-[var(--ink)]'>
							{stat.value}
						</dd>
						<dt className='mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
							{stat.label}
						</dt>
					</div>
				))}
			</dl>
		</a>
	)
}
