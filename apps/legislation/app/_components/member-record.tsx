'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import { statusToneClass, toDisplayTitle } from '../_lib/labels'
import type { Member, MemberMeasure } from '../_lib/members-data'

/* ============================================================
   What carries a member's name

   Filed under the same four headings Parliament's own member pages use —
   what they led on, then what they signed on to, measures before
   resolutions — plus the committee memberships this registry cannot yet
   show. A member credited on 40 measures is unreadable as one list; as
   four tabs it answers "what did they lead on" in a glance.
   ============================================================ */

function MeasureRow({ measure, index }: { measure: MemberMeasure; index: number }) {
	return (
		<Link
			href={measure.href}
			style={{ '--row-index': index } as React.CSSProperties}
			// Stacked on a phone: the date is a fixed column against a title that
			// has to wrap, and it was taking a third of the row. See the same note
			// on the registry's rows in `record-browser`.
			className='row row-in grid grid-cols-1 items-start gap-1.5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16 sm:py-8 lg:gap-24'
		>
			<div className='min-w-0'>
				{/* Number, then what they were to it, then where it stands — the
				    three things that differ row to row, on one line. The tab
				    already says what kind of measure it is. */}
				<div className='flex flex-wrap items-center gap-x-2 gap-y-1.5'>
					<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
						{measure.numberLabel}
					</span>
					<span
						className={`badge badge-plain ${isPrincipal(measure) ? 'badge-done' : 'badge-early'}`}
					>
						{measure.role}
					</span>
					{/* Every act in this list is enacted and in force, so saying so on
					    each row is noise; a bill's stage is the whole story. */}
					{measure.category !== 'acts' ? (
						<span className={statusToneClass[measure.statusTone]}>{measure.status}</span>
					) : null}
				</div>

				<h3 className='item-title item-title-lg mt-2 text-[var(--ink)]'>
					{toDisplayTitle(measure.title)}
				</h3>
			</div>

			{/* The date runs down the right edge, so a list of measures can be
			    read as a chronology without the eye hunting for it mid-line. */}
			<div className='flex items-center gap-3 sm:justify-end'>
				<span className='meta-sm shrink-0'>{measure.dateDisplay}</span>
				<svg
					className='row-arrow hidden size-4 sm:block'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<path d='M5 12h14M13 6l6 6-6 6' />
				</svg>
			</div>
		</Link>
	)
}

/**
 * Shown when nothing links to this member. The distinction matters: Parliament
 * publishes authorship on each measure's own page, and almost none of those
 * pages have been captured — so silence here is our gap, not their record.
 */
function NoMeasures({
	member,
	credited,
	total,
}: {
	member: Member
	credited: number
	total: number
}) {
	return (
		<div className='card p-6 sm:p-10'>
			<span className='badge badge-plain badge-idle'>No measures linked yet</span>
			<h3 className='mt-4 max-w-2xl text-xl font-semibold leading-snug sm:text-2xl'>
				This is missing data, not a record of inactivity.
			</h3>
			<p className='mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
				Parliament lists the authors of a measure on that measure&rsquo;s own page, not on the
				member roster. Only {credited} of the {total} measures in this registry name their authors,
				so most members cannot yet be linked to anything they filed.
			</p>
			<p className='mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-3)]'>
				So this profile can say what {member.displayName} held and when, but not yet what they
				filed. As measure pages are captured, anything carrying their name will appear here
				automatically.
			</p>

			<div className='mt-7 flex flex-wrap gap-2.5'>
				<a
					href='https://parliament.bangsamoro.gov.ph/bills/'
					target='_blank'
					rel='noreferrer'
					className='btn btn-solid'
				>
					Check the official source
				</a>
				<Link href='/about' className='btn btn-quiet'>
					How this registry is built
				</Link>
			</div>
		</div>
	)
}

const isResolution = (measure: MemberMeasure) => measure.category.endsWith('resolutions')
const isPrincipal = (measure: MemberMeasure) => measure.role !== 'Co-Author'

/** One committee seat, as the profile needs it — no data module on the client. */
export type MemberCommittee = {
	slug: string
	name: string
	role: string
	jurisdiction: string
}

function CommitteeRow({ committee, index }: { committee: MemberCommittee; index: number }) {
	return (
		<Link
			href={`/committees/${committee.slug}`}
			style={{ '--row-index': index } as React.CSSProperties}
			className='row row-in grid grid-cols-1 items-start gap-1.5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16 sm:py-8 lg:gap-24'
		>
			<div className='min-w-0'>
				{/* The seat they hold sits beside the committee's name — it qualifies
				    the title rather than standing as a fact of its own. */}
				<div className='flex flex-wrap items-center gap-2'>
					<h3 className='item-title text-[var(--ink)]'>{committee.name}</h3>
					<span className='badge badge-plain badge-role'>{committee.role}</span>
				</div>

				<p className='mt-1.5 line-clamp-2 text-[13px] leading-6 text-[var(--ink-3)]'>
					{committee.jurisdiction}
				</p>
			</div>

			{/* Nothing but the arrow, which is itself desktop-only — so the cell
			    goes entirely rather than leaving a stray row in the stack. */}
			<div className='hidden items-center sm:flex sm:justify-end'>
				<svg
					className='row-arrow hidden size-4 sm:block'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<path d='M5 12h14M13 6l6 6-6 6' />
				</svg>
			</div>
		</Link>
	)
}

/**
 * How many rows a tab shows before asking.
 *
 * The same page as the registry lists, so a reader who has already met the
 * control there meets the same one here. A member on a long-running committee
 * can carry a couple of hundred measures, and the tab row underneath is what
 * a reader is usually reaching for.
 */
const PAGE_SIZE = 30

type Tab = {
	key: string
	label: string
	measures: MemberMeasure[]
	/** Stands in for the list when the tab has nothing to show. */
	empty: string
	count: number
}

function tabsFor(member: Member, committees: MemberCommittee[]): Tab[] {
	// One tab per kind of measure — a law in force, a bill still moving, and a
	// resolution are three different things to have your name on. Within a
	// tab the order is chronological, newest first: the measures arrive
	// already sorted by date, so filtering preserves it.
	const pick = (matches: (measure: MemberMeasure) => boolean) => member.measures.filter(matches)

	const measureTab = (key: string, label: string, measures: MemberMeasure[], empty: string) => ({
		key,
		label,
		measures,
		empty,
		count: measures.length,
	})

	return [
		measureTab(
			'acts',
			'Autonomy Acts',
			pick((measure) => measure.category === 'acts'),
			'No autonomy act in the registry carries their name.',
		),
		measureTab(
			'bills',
			'Bills',
			pick((measure) => measure.category === 'bills'),
			'No bill in the registry carries their name.',
		),
		measureTab(
			'resolutions',
			'Resolutions',
			pick(isResolution),
			'No resolution in the registry carries their name.',
		),
		{
			// Committee seats aren't measures, so this tab renders its own list.
			key: 'committees',
			label: 'Committee memberships',
			measures: [],
			count: committees.length,
			empty:
				'The committee pages list current membership only, and none of them name this member. If they served on a committee in an earlier parliament, that is not published anywhere this registry has read.',
		},
	]
}

/** Column two of a profile: everything the registry can link to their name. */
export function MemberRecord({
	member,
	committees,
	credited,
	total,
}: {
	member: Member
	committees: MemberCommittee[]
	credited: number
	total: number
}) {
	const tablistRef = useRef<HTMLDivElement>(null)
	const [chosen, setChosen] = useState<string | null>(null)

	const tabs = useMemo(() => tabsFor(member, committees), [committees, member])

	// Open on the first tab that has something in it, so a member credited only
	// on resolutions doesn't land on an empty panel.
	// Held per tab rather than as one number: expanding the acts list and then
	// looking at bills should not carry the expansion across, and coming back
	// should not collapse what you opened.
	const [shownByTab, setShownByTab] = useState<Record<string, number>>({})

	const activeKey = chosen ?? tabs.find((tab) => tab.count > 0)?.key ?? tabs[0].key
	const activeIndex = tabs.findIndex((tab) => tab.key === activeKey)
	const active = tabs[activeIndex] ?? tabs[0]
	const shown = shownByTab[activeKey] ?? PAGE_SIZE
	const remaining = active.count - shown

	// Arrow keys move between tabs, as a tablist is expected to.
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const next =
			event.key === 'ArrowLeft'
				? (activeIndex - 1 + tabs.length) % tabs.length
				: event.key === 'ArrowRight'
					? (activeIndex + 1) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tabs.length - 1
							: -1

		if (next < 0) return

		event.preventDefault()
		setChosen(tabs[next].key)
		tablistRef.current?.querySelectorAll('button')[next]?.focus()
	}

	const principal = member.measures.filter(isPrincipal)
	const coAuthored = member.measures.filter((measure) => !isPrincipal(measure))

	// A member with no measures may still hold committee seats, and that is
	// worth tabs of its own rather than the "nothing linked" card.
	const hasRecord = member.measures.length > 0 || committees.length > 0

	return (
		<div>
			{/* The tab row carries its own rule, so the heading only draws one
			    when there are no tabs beneath it. */}
			<div
				className={`flex flex-col justify-between gap-3 pb-4 sm:flex-row sm:items-end ${
					hasRecord ? '' : 'border-b border-[var(--rule)]'
				}`}
			>
				<div>
					<p className='eyebrow'>Legislative record</p>
					<h2 className='section-title mt-3'>
						{member.measures.length > 0
							? `Credited on ${member.measures.length} measure${member.measures.length === 1 ? '' : 's'}.`
							: 'Measures they contributed to.'}
					</h2>
				</div>

				{member.measures.length > 0 ? (
					<p className='meta'>
						<span className='num font-medium text-[var(--ink)]'>{principal.length}</span> as
						principal ·{' '}
						<span className='num font-medium text-[var(--ink)]'>{coAuthored.length}</span> as
						co-author
					</p>
				) : null}
			</div>

			{!hasRecord ? (
				<div className='mt-8'>
					<NoMeasures member={member} credited={credited} total={total} />
				</div>
			) : (
				<>
					<div
						ref={tablistRef}
						role='tablist'
						aria-label='Legislative record'
						onKeyDown={handleKeyDown}
						className='tab-list mt-7'
					>
						{tabs.map((tab) => {
							const selected = tab.key === activeKey

							return (
								<button
									key={tab.key}
									type='button'
									role='tab'
									id={`tab-${tab.key}`}
									aria-selected={selected}
									aria-controls={`panel-${tab.key}`}
									// Only the selected tab takes tab focus; the arrow keys
									// move between them from there.
									tabIndex={selected ? 0 : -1}
									onClick={() => setChosen(tab.key)}
									className='tab'
								>
									{tab.label}
									<span className='tab-count'>{tab.count}</span>
								</button>
							)
						})}
					</div>

					<div
						role='tabpanel'
						id={`panel-${active.key}`}
						aria-labelledby={`tab-${active.key}`}
						tabIndex={0}
						className='mt-6'
					>
						{active.key === 'committees'
							? committees
									.slice(0, shown)
									.map((committee, index) => (
										<CommitteeRow key={committee.slug} committee={committee} index={index} />
									))
							: active.measures
									.slice(0, shown)
									.map((measure, index) => (
										<MeasureRow key={measure.id} measure={measure} index={index} />
									))}

						{remaining > 0 ? (
							<div className='flex flex-col items-center gap-2 pt-8'>
								<button
									type='button'
									onClick={() =>
										setShownByTab((current) => ({
											...current,
											[activeKey]: shown + PAGE_SIZE,
										}))
									}
									className='btn btn-quiet'
								>
									Show {Math.min(PAGE_SIZE, remaining)} more
									<svg
										className='size-3.5'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										aria-hidden='true'
									>
										<path d='m6 9 6 6 6-6' />
									</svg>
								</button>
								<p className='meta-sm'>
									<span className='num'>{remaining.toLocaleString()}</span> more below
								</p>
							</div>
						) : null}

						{active.count === 0 ? (
							<p className='max-w-2xl text-sm leading-6 text-[var(--ink-3)]'>{active.empty}</p>
						) : null}
					</div>

					{/* The caveat is about what this list leaves out, so it only earns
					    its place when there is a list. On an empty tab the panel has
					    just said the same thing in one line. */}
					{active.count > 0 && active.key !== 'committees' ? (
						<p className='mt-8 max-w-2xl text-[13px] leading-6 text-[var(--ink-3)]'>
							This list covers measures whose authorship the registry has captured. It is not a
							complete legislative record — most measure pages have not been scraped, so a member
							may have filed far more than appears here.
						</p>
					) : null}
				</>
			)}
		</div>
	)
}
