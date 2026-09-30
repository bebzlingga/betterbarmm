'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { Barangay } from '@betterbarmm/lgu-data'
import type { BarangayRoster } from '@betterbarmm/lgu-data/barangay-officials'
import { useMemo, useState } from 'react'

/**
 * Every barangay in a unit, alphabetical, filterable, and openable.
 *
 * Marawi has 96 of them and Parang 25; a plain three-column list is fine to
 * read and useless to search, which is the thing a reader on this tab is
 * usually doing. The filter matches the PSGC code and the names of the
 * officials as well as the barangay name, because anyone arriving from a
 * national record has the code and not the spelling — and because "who is my
 * captain" and "which barangay is this person the captain of" are both
 * questions people arrive with.
 *
 * Numbering follows the alphabetical order rather than the filtered order, so
 * a barangay keeps the same number whether or not the list is filtered — the
 * number is a position in the town's list, not a row count.
 *
 * A barangay with no roster still opens, and says that DILG has no roster for
 * it. Roughly a quarter of the region's barangays are in that state, and a row
 * that simply refused to open would read as a page that was broken rather than
 * a record that is missing.
 */
export function BarangayList({
	barangays,
	rosters,
	capturedAt,
	sourceHref,
}: {
	barangays: Barangay[]
	/** Keyed by PSGC code, or by name where the barangay has none. */
	rosters: Record<string, BarangayRoster | undefined>
	capturedAt: string
	sourceHref: string
}) {
	const [query, setQuery] = useState('')

	const sorted = useMemo(
		() =>
			[...barangays]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((barangay, index) => {
					const roster = rosters[barangay.psgc ?? barangay.name]
					const people = [
						roster?.punongBarangay,
						...(roster?.council ?? []),
						roster?.skChairperson,
						roster?.secretary,
						roster?.treasurer,
					].filter((person) => person != null)
					return {
						...barangay,
						index: index + 1,
						roster,
						count: people.length,
						haystack: [barangay.name, barangay.psgc ?? '', ...people.map((p) => p.name)]
							.join(' ')
							.toLowerCase(),
					}
				}),
		[barangays, rosters],
	)

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return sorted
		return sorted.filter((barangay) => barangay.haystack.includes(q))
	}, [sorted, query])

	const withRoster = sorted.filter((barangay) => barangay.count > 0).length

	return (
		<div>
			<div className='flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--brass-line)] pb-3'>
				<h3 className='bb-label'>All barangays</h3>
				<p className='num text-[13px] font-semibold text-[var(--brass)]'>
					{query ? `${shown.length} of ${sorted.length}` : sorted.length}
				</p>
			</div>

			{sorted.length > 12 ? (
				<label className='flex items-center gap-3 border-b border-[var(--rule)] py-3'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Filter barangays</span>
					<input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Filter by barangay, official, or PSGC code…'
						className='min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>
			) : null}

			<ol className='mt-2'>
				{shown.map((barangay) => (
					<li
						key={`${barangay.name}-${barangay.index}`}
						className='border-b border-[var(--rule-soft)]'
					>
						<details className='group'>
							<summary className='flex cursor-pointer list-none items-baseline gap-3 py-3 transition hover:bg-[var(--paper-2)]'>
								<span className='num w-7 shrink-0 text-[10.5px] text-[var(--ink-3)]'>
									{String(barangay.index).padStart(2, '0')}
								</span>
								<span className='min-w-0 flex-1 text-[13.5px] text-[var(--ink)]'>
									{barangay.name}
									{barangay.roster?.punongBarangay ? (
										<span className='mt-0.5 block text-[12px] leading-5 text-[var(--ink-3)]'>
											{barangay.roster.punongBarangay.name}
										</span>
									) : null}
								</span>
								{barangay.count > 0 ? (
									<span className='num shrink-0 text-[10.5px] text-[var(--brass)]'>
										{barangay.count}
									</span>
								) : (
									<span className='shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
										no roster
									</span>
								)}
								{barangay.psgc ? (
									<span className='num hidden shrink-0 text-[10.5px] text-[var(--ink-mute)] sm:inline'>
										{barangay.psgc}
									</span>
								) : null}
								<span
									aria-hidden='true'
									className='shrink-0 text-[var(--ink-3)] transition group-open:rotate-90'
								>
									&rsaquo;
								</span>
							</summary>
							<Roster roster={barangay.roster} name={barangay.name} href={sourceHref} />
						</details>
					</li>
				))}
			</ol>

			{shown.length === 0 ? (
				<p className='py-10 text-center text-[13.5px] text-[var(--ink-3)]'>
					Nothing here matches “{query.trim()}”.
				</p>
			) : null}

			<div className='mt-6 max-w-3xl space-y-3 text-[12.5px] leading-6 text-[var(--ink-3)]'>
				<p>
					Each barangay is its own local government unit with an elected punong barangay and
					council. The code beside a name is its PSGC identifier — the number every national record
					uses for that barangay.
				</p>
				<p>
					Officials are from DILG&rsquo;s Barangay Officials Directory as it stood on {capturedAt};{' '}
					{withRoster} of these {sorted.length} barangays have an entry in it. DILG publishes no
					term alongside the names and updates the directory as barangays report, so a name here
					is the last one filed rather than a guarantee of who holds the office today.{' '}
					<a href={sourceHref} target='_blank' rel='noreferrer' className='rule-link'>
						DILG&rsquo;s directory
					</a>{' '}
					also carries contact details, which are not repeated here.
				</p>
			</div>
		</div>
	)
}

/** The people in one barangay, elected first and appointed after. */
function Roster({
	roster,
	name,
	href,
}: {
	roster: BarangayRoster | undefined
	name: string
	href: string
}) {
	if (!roster || Object.keys(roster).length === 0) {
		return (
			<p className='pb-4 pl-10 pr-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>
				DILG&rsquo;s directory has no roster on file for {name}. That is a gap in the directory, not
				a barangay without officials —{' '}
				<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
					ask DILG
				</a>{' '}
				or the municipal hall.
			</p>
		)
	}

	const appointed = [
		roster.secretary ? (['Barangay Secretary', roster.secretary.name] as const) : null,
		roster.treasurer ? (['Barangay Treasurer', roster.treasurer.name] as const) : null,
	].filter((row) => row != null)

	return (
		<div className='grid gap-6 pb-5 pl-10 pr-4 sm:grid-cols-2 sm:gap-10'>
			<div>
				{roster.punongBarangay ? (
					<>
						<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
							Punong Barangay
						</p>
						<p className='mt-1 text-[15px] font-bold leading-tight tracking-[-0.015em] text-[var(--ink)]'>
							{roster.punongBarangay.name}
						</p>
					</>
				) : null}

				{roster.skChairperson ? (
					<div className='mt-4'>
						<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
							SK Chairperson
						</p>
						<p className='mt-1 text-[13.5px] leading-5 text-[var(--ink)]'>
							{roster.skChairperson.name}
						</p>
					</div>
				) : null}

				{appointed.length > 0 ? (
					<dl className='mt-4'>
						{appointed.map(([label, person]) => (
							<div key={label} className='mt-2 first:mt-0'>
								<dt className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>
									{label} · appointed
								</dt>
								<dd className='mt-0.5 text-[13px] leading-5 text-[var(--ink-2)]'>{person}</dd>
							</div>
						))}
					</dl>
				) : null}
			</div>

			{roster.council?.length ? (
				<div>
					<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
						Sangguniang Barangay · {roster.council.length}
					</p>
					<ol className='mt-1'>
						{roster.council.map((member, index) => (
							<li
								key={`${member.name}-${index}`}
								className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-1.5 last:border-b-0 text-[13px] leading-5 text-[var(--ink-2)]'
							>
								<span className='num w-4 shrink-0 text-[10px] text-[var(--ink-mute)]'>
									{index + 1}
								</span>
								{member.name}
							</li>
						))}
					</ol>
				</div>
			) : null}
		</div>
	)
}
