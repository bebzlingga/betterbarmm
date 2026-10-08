import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Counter, LineReveal, Rise, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import {
	formatDate,
	formatNumber,
	lguAreas,
	lguCounts,
	lguData,
	lguProvinces,
	areaHref,
	type LguProvince,
} from '@betterbarmm/lgu-data'
import { barangayOfficials, rosterCoverage } from '@betterbarmm/lgu-data/barangay-officials'
import Link from 'next/link'
import { RegionMap } from './_components/region-map'
import { FinderTrigger } from './_components/unit-finder'

/** District seats in the Bangsamoro Parliament, joined on by slug. */
function seatsFor(province: LguProvince): number | null {
	return lguAreas.find((area) => area.slug === province.slug)?.seats ?? null
}

function capitalOf(province: LguProvince): string | null {
	return province.municipalities.find((unit) => unit.isCapital)?.name ?? null
}

/**
 * The seven areas BARMM contains, as a table of contents.
 *
 * Rows rather than cards. A reader on this page is choosing where to go next,
 * and a row can hold the three things that decide it — what the area is, how
 * big it is, and how much of Parliament it elects — on one line each, where a
 * card of the same width has to stack them and loses the comparison down the
 * column.
 */
function Areas() {
	return (
		<Stagger gap={0.05} className='mt-12'>
			{lguProvinces.map((province, index) => {
				const seats = seatsFor(province)
				const capital = capitalOf(province)
				const cities = province.municipalities.filter((unit) => unit.isCity).length
				const roster = rosterCoverage(province.municipalities)

				return (
					<StaggerItem key={province.slug} distance={12}>
						<Link
							href={areaHref(province)}
							className='group grid gap-x-10 gap-y-5 border-t border-[var(--brass-line)] py-7 transition hover:bg-[var(--paper-2)] lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,15rem)] lg:py-8'
						>
							<div className='min-w-0'>
								<div className='flex items-baseline gap-3'>
									<span className='num text-[11px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span className='bb-label'>{province.kind}</span>
								</div>

								<h3 className='mt-3 flex items-baseline gap-2 text-[1.6rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
									{province.name}
									<ArrowUpRightIcon
										className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								</h3>

								{capital && capital !== province.name ? (
									<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>
										Capital <span className='font-semibold text-[var(--ink-2)]'>{capital}</span>
									</p>
								) : null}
							</div>

							<p className='bb-measure text-[13.5px] leading-7 text-[var(--ink-2)]'>
								{province.note}
							</p>

							<dl className='flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] lg:flex-col lg:gap-y-2.5'>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Population</dt>
									<dd className='num text-[var(--ink)]'>{formatNumber(province.population)}</dd>
									<span aria-hidden='true'>people</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Cities and municipalities</dt>
									<dd className='num text-[var(--ink)]'>{province.municipalities.length}</dd>
									<span aria-hidden='true'>
										{province.municipalities.length === 1
											? cities === 1
												? 'city'
												: 'municipality'
											: cities > 0
												? 'units, one a city'
												: 'municipalities'}
									</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Barangays</dt>
									<dd className='num text-[var(--ink)]'>{formatNumber(province.barangayCount)}</dd>
									<span aria-hidden='true'>barangays</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Barangay captains in DILG&rsquo;s directory</dt>
									<dd className='num text-[var(--ink)]'>
										{formatNumber(roster.listed)}/{formatNumber(roster.total)}
									</dd>
									<span aria-hidden='true'>captains listed</span>
								</div>
								{seats != null ? (
									<div className='flex gap-1.5'>
										<dt className='sr-only'>Bangsamoro Parliament district seats</dt>
										<dd className='num text-[var(--brass)]'>{seats}</dd>
										<span aria-hidden='true'>seats in Parliament</span>
									</div>
								) : null}
							</dl>
						</Link>
					</StaggerItem>
				)
			})}
		</Stagger>
	)
}

export default function LguHomePage() {
	const regionRoster = rosterCoverage(lguProvinces.flatMap((province) => province.municipalities))
	const cities = lguProvinces.reduce(
		(count, province) => count + province.municipalities.filter((unit) => unit.isCity).length,
		0,
	)

	return (
		<>
			{/* ---- Masthead ---- */}
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]'
				/>

				<div className='bb-container relative grid items-center gap-12 py-[clamp(3.75rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
					<div>
					<Rise distance={14}>
						<p className='bb-label'>Local government in the Bangsamoro</p>
					</Rise>

					<LineReveal
						lines={['Every province,', 'every town,', 'and who runs it.']}
						delay={0.08}
						className='bb-display mt-7 text-[var(--ink)]'
						lineClassName={[undefined, undefined, 'bb-mute']}
					/>

					<Rise delay={0.35} distance={16}>
						<p className='bb-measure mt-9 text-[15px] leading-8 text-[var(--ink-2)]'>
							The region down to the barangay: what each unit is, how many people live in it, which
							posts are on its ballot, and the governors, mayors and councillors COMELEC canvassed
							into office in 2025.
						</p>
					</Rise>

					{/* The front door proper. A province menu asks the reader to know
					    which province they live in, which is the easy half of the
					    question and not the half anyone arrives with. */}
					<Rise delay={0.45} distance={14}>
						<div className='mt-9 max-w-xl'>
							<FinderTrigger variant='field' />
						</div>
					</Rise>

					<Rise delay={0.55} distance={14}>
						<dl className='mt-14 flex flex-wrap gap-x-8 gap-y-6 border-t border-[var(--brass-line)] pt-6'>
							{/* Every figure here is the directory's own, summed from the units
							    it can actually open. PSA's regional totals are larger and
							    count different things; the note under the areas below says
							    exactly how much larger and why, rather than the page picking
							    one and hoping. */}
							{[
								{
									value: lguProvinces.length,
									label: 'Provinces, city and special area',
									group: false,
								},
								{
									value: lguData.totals.lgus,
									label: 'Cities and municipalities',
									group: false,
								},
								{
									value: lguData.totals.barangays,
									label: 'Barangays',
									group: true,
								},
								{
									value: lguData.totals.population,
									label: 'People, 2024 census',
									group: true,
								},
							].map((fact) => (
								<div key={fact.label}>
									<dt className='sr-only'>{fact.label}</dt>
									<dd className='bb-figure-sm text-[var(--ink)]'>
										<Counter value={fact.value} group={fact.group} />
									</dd>
									<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{fact.label}
									</p>
								</div>
							))}
						</dl>
					</Rise>
					</div>

					{/* Every drawn area is a link to its page. */}
					<Rise delay={0.3} distance={14} className='hidden lg:block'>
						<RegionMap />
					</Rise>
				</div>
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Where to start'
					title={`${lguData.totals.provinces} provinces, a city,`}
					titleMuted='and a special area.'
					lead={`Each one opens onto its cities and municipalities, and each of those onto its barangays and their officials. ${cities} of the ${lguData.totals.lgus} units are cities. DILG's barangay directory names a captain for ${formatNumber(regionRoster.listed)} of the ${formatNumber(regionRoster.total)} barangays, as of ${formatDate(barangayOfficials.capturedAt)}.`}
					aside={
						<p className='num text-[12px] text-[var(--ink-3)]'>
							<span className='font-semibold text-[var(--brass)]'>
								{formatNumber(lguData.totals.population)}
							</span>{' '}
							people
						</p>
					}
				/>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job. Folded away rather than set as a warning banner:
				    it is an answer to a question the reader has not asked yet, and it
				    was pushing the directory itself below the fold. */}
				<Rise delay={0.1} distance={14}>
					<details className='group mt-10 border-t border-[var(--brass-line)] pt-5'>
						<summary className='flex cursor-pointer list-none items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
							Why this total is smaller than PSA&rsquo;s
							<span
								aria-hidden='true'
								className='inline-block transition-transform duration-300 group-open:rotate-90'
							>
								&rsaquo;
							</span>
						</summary>
						<div className='bb-measure mt-4 space-y-3 text-[13px] leading-7 text-[var(--ink-2)]'>
							<p>{lguCounts.sulnote}</p>
							<p>{lguCounts.reconcileNote}</p>
						</div>
					</details>
				</Rise>
			</section>

		</>
	)
}
