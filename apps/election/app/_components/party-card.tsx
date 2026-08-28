import { dominantStatusLabel, type PartyView } from '../_lib/election-data'
import { ConfidenceBadge } from './confidence-badge'
import { PartyMark } from './marks'

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
			// Stacked on a phone, the card has the page's margin either side of it
			// already, so its own horizontal padding only shortened the line. It
			// comes back at `sm`, where two cards share a row.
			className='group flex min-h-full flex-col bg-[var(--paper)] py-6 transition-colors duration-300 hover:bg-[var(--paper-2)] sm:p-6'
		>
			{/* The plate and the mark on the record, and nothing between them. The
			    party's id sat beside the plate in brass capitals — the same string
			    the plate's letter is cut from and the ballot name below spells out,
			    so the card opened by naming the party three times before it said
			    anything about it. */}
			<div className='flex items-start justify-between gap-3'>
				<PartyMark partyId={party.party_id} ballotName={party.ballot_name} size={96} />
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

			{/* The rule needs room above it whether the card is full or half empty.
			    `mt-auto` alone pushes the figures to the foot of the card, and on a
			    card whose description runs the full four lines that leaves the last
			    line sitting on the rule. The padding is on the wrapper, so it holds
			    at any length; `mt-auto` still does the pushing. */}
			<div className='mt-auto pt-7'>
				<dl className='flex gap-8 border-t border-[var(--brass-line)] pt-5'>
					{[
						{ value: party.computedStats.sectoralCandidates, label: 'Sectoral links' },
						{ value: party.computedStats.districtCocFilers, label: 'District filers' },
					].map((stat) => (
						// Term first in the source, figure first on the page — a list names
						// what it is describing before it describes it, and `dd` before
						// `dt` is not a description list at all.
						<div key={stat.label} className='flex flex-col-reverse'>
							<dt className='mt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								{stat.label}
							</dt>
							<dd className='num text-xl font-extrabold leading-none text-[var(--ink)]'>
								{stat.value}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</a>
	)
}
