import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { OkirCorner, Rise } from '@betterbarmm/editorial'
import {
	formatNumber,
	lguCounts,
	lguData,
	lguLadder,
	lguLookups,
	lguReferences,
} from '@betterbarmm/lgu-data'
import { Reveal } from './reveal'

/**
 * The ladder of units, largest first.
 *
 * Set as a stack of rungs rather than a table, because the interesting column
 * is "who do you actually vote for" and that is a list, not a cell. The region
 * is the first rung and is marked as the odd one out — it is where the whole
 * confusion starts.
 */
function Ladder() {
	return (
		<div className='mt-12'>
			{lguLadder.map((rung, index) => (
				<Reveal key={rung.level} delay={index * 60}>
					{/* A hairline between one rung and the next, and none over the first — the
					    ladder opens straight off the figures above it.

					    Decided by the index rather than by `first:`. Each rung is wrapped in
					    its own `Reveal`, so every one of them is the first child of its own
					    parent — `first:border-t-0` matched all four and the separators never
					    appeared at all. */}
					<div
						className={`grid gap-x-10 gap-y-4 py-7 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,17rem)] ${
							index === 0 ? '' : 'border-t border-[var(--rule)]'
						}`}
					>
						<div>
							<p className='num text-[11px] font-medium text-[var(--ink-3)]'>
								{String(index + 1).padStart(2, '0')}
							</p>
							<h3 className='mt-2 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
								{rung.level}
							</h3>
						</div>

						<div>
							<p className='font-medium bb-body text-[var(--ink)]'>{rung.what}</p>
							<p className='mt-3 max-w-xl bb-body text-[var(--ink-2)]'>
								{rung.note}
							</p>
						</div>

						<div>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
								You elect
							</p>
							<ul className='mt-3'>
								{rung.elects.map((post) => (
									<li
										key={post}
										className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-2 text-[13.5px] text-[var(--ink-2)]'
									>
										<span
											aria-hidden='true'
											className='mt-1.5 size-1.5 shrink-0 bg-[var(--accent)]'
										/>
										{post}
									</li>
								))}
							</ul>
						</div>
					</div>
				</Reveal>
			))}
		</div>
	)
}

/**
 * The way into the directory.
 *
 * The province cards used to live here, and every one of them opened a page in
 * this app. The directory is its own workspace now — a province, its towns,
 * their barangays and their elected officials is a great deal more than a
 * chapter, and it was the tail wagging the dog to keep six hundred routes
 * inside an explainer.
 *
 * So this chapter does the explaining and points at the workspace once, at the
 * size of a door. What a barangay is belongs here; which barangays there are
 * belongs there.
 */
function Directory() {
	return (
		<Rise delay={0.1} distance={16}>
			<a
				href='/soon'
				className='bb-plate group relative mt-14 flex flex-col gap-8 p-9 transition hover:bg-[var(--paper-3)] lg:flex-row lg:items-center lg:justify-between lg:p-12'
			>
				<OkirCorner position='top-right' className='m-3 size-6 opacity-50' />

				<div className='max-w-xl'>
					<p className='bb-label'>The workspace</p>
					<h3 className='mt-5 text-[1.6rem] font-extrabold leading-tight tracking-[-0.035em] text-[var(--ink)] sm:text-[2rem]'>
						Look up any province, city, municipality, or barangay.
					</h3>
					<p className='bb-measure mt-4 bb-body text-[var(--ink-2)]'>
						{lguData.totals.lgus} cities and municipalities across{' '}
						{lguData.totals.provinces} provinces and a city, with{' '}
						{formatNumber(lguData.totals.barangays)} barangays, the population and land area on record
						for each, and the officials COMELEC canvassed into office in 2025.
					</p>
				</div>

				<span className='bb-btn bb-btn-solid shrink-0'>
					Open the directory
					<ArrowUpRightIcon className='size-3.5' aria-hidden='true' />
				</span>
			</a>
		</Rise>
	)
}

/**
 * The directory that does not exist yet, and what to do until it does.
 *
 * This is the one section of Discover that has to admit a gap. Saying "coming
 * soon" and stopping would waste the visit; every office listed here already
 * publishes part of the answer, so the page hands the reader over rather than
 * leaving them at a dead end.
 */
function Lookups() {
	return (
		<div className='mt-12'>
			<Reveal>
				<div className='grid border-t border-[var(--rule)] sm:grid-cols-2'>
					{lguLookups.map((lookup, index) => (
						<a
							key={lookup.href}
							href={lookup.href}
							target='_blank'
							rel='noreferrer'
							style={{ '--row-index': index } as React.CSSProperties}
							className='row-in group flex flex-col border-b border-[var(--rule)] py-6 transition hover:bg-[var(--paper-2)] sm:px-6 sm:[&:nth-child(odd)]:border-r'
						>
							<div className='flex items-start justify-between gap-4'>
								<h4 className='text-[16px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{lookup.office}
								</h4>
								<ArrowUpRightIcon
									className='size-4 shrink-0 text-[var(--ink-3)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</div>
							<p className='mt-2.5 bb-body text-[var(--ink-2)]'>{lookup.what}</p>
						</a>
					))}
				</div>
			</Reveal>
		</div>
	)
}

/**
 * Local government in the Bangsamoro, end to end.
 *
 * The ladder, the units, the caveat about the numbers, and where to look up a
 * name. It is deliberately the plainest chapter on Discover — someone reaching
 * this page usually wants one specific fact about one specific town, not an
 * essay.
 */
export function DiscoverLguGuide() {
	return (
		<>
			{/* ---- The units ----

		    First, not last. It is the answer to "how big is this" — the question a
		    reader has before they can make sense of a ladder of unit types, and it
		    was sitting three blocks below where they asked it. */}
			<Reveal>
				<div>
					<div className='flex flex-wrap items-end justify-between gap-6'>
						<div>
							<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
								What the region contains
							</p>
							<h3 className='mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-3xl'>
								{lguData.totals.cities} cities. {lguData.totals.lgus - lguData.totals.cities}{' '}
								municipalities.{' '}
								<span className='text-[var(--ink-display)]'>
									{formatNumber(lguData.totals.barangays)} barangays.
								</span>
							</h3>
						</div>
						<p className='num text-[13px] text-[var(--ink-3)]'>
							{formatNumber(lguData.totals.population)} people · {lguCounts.populationAsOf}
						</p>
					</div>

				</div>
			</Reveal>

	
		{/* ---- The ladder ---- */}
			<Ladder />

			<Directory />

			{/* ---- The directory in waiting ---- */}
			<Lookups />
		</>
	)
}
