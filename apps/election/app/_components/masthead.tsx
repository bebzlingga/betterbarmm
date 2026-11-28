import { Counter, Stagger, StaggerItem } from '@betterbarmm/editorial'
import {
	ArmchairIcon,
	ChartBarIcon,
	CheckSquareOffsetIcon,
	FlagBannerIcon,
	FlagIcon,
	IdentificationCardIcon,
	MapPinIcon,
	ScalesIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import { Hero } from './hero'

/** A small picture for each figure, by what it counts (user decision: icons on the figures). */
const FACT_ICON: Record<string, Icon> = {
	'Seats in Parliament': ArmchairIcon,
	'Seats for a majority': ScalesIcon,
	'Parties on the ballot': FlagIcon,
	Parties: FlagIcon,
	'Names on record': IdentificationCardIcon,
	'Sectoral nominees': UsersThreeIcon,
	'District filers': MapPinIcon,
	Turnout: CheckSquareOffsetIcon,
	'Largest bloc': ChartBarIcon,
	'Parties with a seat': FlagBannerIcon,
}

export type MastheadFact = {
	value: number | string
	label: string
	/**
	 * What the figure counts, in a line.
	 *
	 * A bare number under a two-word label leaves the reader to guess the
	 * denominator — "13 parties" of what, "205 candidates on record" out of how
	 * many. Where a figure needs saying, it says it, and the row lays itself out
	 * as a grid rather than a run so every caption has a column to sit in.
	 */
	detail?: string
	/** Count up to the figure. Off for anything that is not a plain number. */
	count?: boolean
	group?: boolean
}

type MastheadProps = {
	/** The small brass line above the headline — which workspace, or which page of it. */
	label: string
	/** The headline in parts, run on as one line; a part can be muted. */
	lines: string[]
	/** Indices of `lines` set in the muted grey — the qualifier, not the claim. */
	muted?: number[]
	/** Optional: a head can be a claim on its own, and the results page is
	    one — the figures under it say what the sentence was saying. */
	standfirst?: string
	/**
	 * `lg` is the largest display cut, for a page that opens on its headline
	 * and nothing else. The default is the middle one, which is right where a
	 * masthead also carries figures and actions.
	 */
	size?: 'page' | 'home'
	/** The figures on the brass rule under the standfirst. Three at most; six is a table. */
	facts?: MastheadFact[]
	/** In the header's right-hand column: the page's actions, or a note on the record. */
	children?: React.ReactNode
}

/**
 * The head of every page in this workspace, in the travel workspace's look (user decision: as the legislation
 * workspace's): the crimson and its lattice under the clear bars, the headline with its qualifier muted, the
 * standfirst and the page's actions; the figures on cards of their own under the header, on the page's paper.
 */
export function Masthead({ label, lines, muted = [], standfirst, facts, children }: MastheadProps) {
	return (
		<>
			<Hero
				kicker={label}
				// One line (user decision): the parts run on as a sentence and wrap where the width ends, the qualifier
				// still muted.
				title={lines.map((line, index) => (
					<span key={line} className={muted.includes(index) ? 'text-white/55' : undefined}>
						{index ? ' ' : ''}
						{line}
					</span>
				))}
				lede={standfirst}
				// The page's actions in the header's right-hand column (user decision: not under the text), as equal rows
				// beside the headline on a wide screen; under it on a phone.
				side={children ? <div className='grid w-full max-w-[26rem] gap-3 lg:ml-auto'>{children}</div> : undefined}
			/>

			{facts?.length ? (
				<section className='el-under bb-container'>
					<Stagger gap={0.06} className={`grid gap-4 sm:grid-cols-2 ${facts.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
						{facts.map((fact) => (
							<StaggerItem
								key={fact.label}
								className='flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.45)] lg:p-7'
							>
								<div className='flex items-start justify-between gap-3'>
									<p className='text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{fact.label}</p>
									{FACT_ICON[fact.label] ? (
										(() => {
											const Glyph = FACT_ICON[fact.label]!
											return (
												<span className='-mr-1 -mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
													<Glyph size={20} weight='duotone' aria-hidden='true' />
												</span>
											)
										})()
									) : null}
								</div>
								<p className='num mt-3 font-[family-name:var(--font-display)] text-[2.375rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
									{fact.count && typeof fact.value === 'number' ? <Counter value={fact.value} group={fact.group} /> : fact.value}
								</p>
								{fact.detail ? <p className='mt-3 text-[0.84375rem] leading-[1.55] text-[var(--ink-3)]'>{fact.detail}</p> : null}
							</StaggerItem>
						))}
					</Stagger>
				</section>
			) : null}
		</>
	)
}
