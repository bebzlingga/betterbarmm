import { Counter, LineReveal, Rise } from '@betterbarmm/editorial'
import {
	lguAreas,
	lguCounts,
	lguData,
	lguProvinces,
	areaHref,
	type LguProvince,
} from '@betterbarmm/lgu-data'
import Link from 'next/link'
import { rosterCoverage } from '@betterbarmm/lgu-data/barangay-officials'
import { ntaShares } from '@betterbarmm/lgu-data/nta'
import { RegionMap } from './_components/region-map'

/** District seats in the Bangsamoro Parliament, joined on by slug. */
function seatsFor(province: LguProvince): number | null {
	return lguAreas.find((area) => area.slug === province.slug)?.seats ?? null
}

function capitalOf(province: LguProvince): string | null {
	return province.municipalities.find((unit) => unit.isCapital)?.name ?? null
}

/** One line or three on each area for its card; the dataset's notes are longer and uneven. */
const ABOUT: Record<string, string> = {
	basilan: 'An island province off Zamboanga. The City of Isabela sits on the island but belongs to Region IX, not BARMM.',
	'lanao-del-sur': 'The province around Lake Lanao, the largest lake in Mindanao, with Marawi on its northern shore. The most populous area of the region.',
	'maguindanao-del-norte': 'The northern half of the former Maguindanao, divided by plebiscite in 2022. PSGC still lists the old province, so the split is applied town by town.',
	'maguindanao-del-sur': 'The southern half of the former Maguindanao, divided by plebiscite in 2022, along the upper Pulangi valley.',
	'tawi-tawi': 'The southernmost province of the Philippines, a chain of islands reaching toward Sabah, with Bongao its capital.',
	'cotabato-city': 'An independent component city that answers to no province, and the seat of the Bangsamoro Government. It voted to join BARMM in 2019.',
	'special-geographic-area': '63 barangays of North Cotabato that voted to join BARMM in 2019, made into 8 municipalities and ratified by plebiscite in April 2024.',
}

/**
 * The seven areas BARMM contains, one card each: its name, a line about it, and
 * the same five figures, so they still read across as a comparison.
 */
function Areas() {
	return (
		<ul className='mt-14 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-16'>
			{lguProvinces.map((province) => {
				const capital = capitalOf(province)
				const figures = [
					['Cities and municipalities', province.municipalities.length],
					['Barangays', province.barangayCount],
					['Population', province.population],
					['Parliament seats', seatsFor(province)],
				] as const
				return (
					<li key={province.slug} className='border-t border-[var(--rule)]'>
						<Link href={areaHref(province)} className='group flex h-full flex-col px-5 pb-6 pt-7 transition-colors duration-300 hover:bg-[var(--paper-2)]'>
							<p className='bb-label'>
								{[province.kind, capital && capital !== province.name ? `capital ${capital}` : null].filter(Boolean).join(' · ')}
							</p>
							<h3 className='mt-3 flex items-baseline justify-between gap-4 text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
								{province.name}
								<span aria-hidden='true' className='text-[1rem] text-[var(--ink-3)] transition duration-500 group-hover:translate-x-1 group-hover:text-[var(--accent)]'>
									&rarr;
								</span>
							</h3>
							<p className='mt-2 line-clamp-3 min-h-[4.5rem] text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
								{ABOUT[province.slug] ?? province.note}
							</p>
							<dl className='mt-auto grid grid-cols-2 gap-x-6 gap-y-4 pt-6'>
								{figures.map(([label, value]) => (
									<div key={label} className='border-t border-[var(--rule-soft)] pt-3'>
										<dt className='text-[0.71875rem] text-[var(--ink-3)]'>{label}</dt>
										<dd className='num mt-1 text-[1.125rem] font-bold text-[var(--ink)]'>
											{value != null ? value.toLocaleString('en-PH') : '—'}
										</dd>
									</div>
								))}
							</dl>
							<p className='mt-4 text-[0.75rem] text-[var(--ink-mute)]'>
								{rosterCoverage(province.municipalities).listed.toLocaleString('en-PH')} of {province.barangayCount.toLocaleString('en-PH')} barangay captains on record
							</p>
						</Link>
					</li>
				)
			})}
		</ul>
	)
}

export default function LguHomePage() {
	const regionRoster = rosterCoverage(lguProvinces.flatMap((province) => province.municipalities))
	// DBM's NTA allocation to all of BARMM's local governments, barangays included.
	const ntaYear = ntaShares.years[0]!
	const ntaTotal = ntaShares.region[ntaYear]!

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
					/>
					</div>

					{/* Every drawn area is a link to its page. */}
					<Rise delay={0.3} distance={14} className='hidden lg:block lg:pt-12'>
						<RegionMap />
					</Rise>

					<Rise delay={0.55} distance={14} className='mt-6 lg:col-span-2 lg:mt-12'>
						<dl className='grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6'>
							{/* Every figure here is the directory's own, summed from the units
							    it can actually open. PSA's regional totals are larger and
							    count different things; the note under the areas below says
							    exactly how much larger and why, rather than the page picking
							    one and hoping. */}
							{[
								{
									// Cotabato City is counted with the cities, not here.
									value: lguProvinces.filter((area) => area.kind !== 'City').length,
									label: 'Provinces and special area',
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
									value: regionRoster.listed,
									label: 'Barangay captains on record',
									group: true,
								},
								{
									value: lguData.totals.population,
									label: 'People, 2024 census',
									group: true,
								},
								{
									value: Math.round(ntaTotal / 1e8) / 10,
									label: `NTA to its LGUs, FY ${ntaYear}`,
									group: false,
									prefix: '₱',
									suffix: 'B',
									decimals: 1,
								},
							].map((fact) => (
								<div key={fact.label} className='border-t border-[var(--brass-line)] pt-6'>
									<dt className='sr-only'>{fact.label}</dt>
									<dd className='bb-figure-sm text-[var(--ink)]'>
										<Counter value={fact.value} group={fact.group} prefix={fact.prefix} suffix={fact.suffix} decimals={fact.decimals} />
									</dd>
									<p className='mt-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{fact.label}
									</p>
								</div>
							))}
						</dl>
					</Rise>
				</div>
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container bb-section'>
				<div className='grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16'>
					<h2 className='bb-display-sm text-[var(--ink)]'>
						{lguData.totals.provinces} provinces, a city and a special area
					</h2>
					<p className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
						Open an area to see its cities, municipalities, barangays and officials.
					</p>
				</div>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job — so it is shown, not folded away (user decision). */}
				<aside className='mt-20 bg-[var(--paper-2)] px-6 py-6 sm:px-8'>
					<h3 className='text-[0.9375rem] font-semibold text-[var(--ink)]'>Why this total is smaller than PSA&rsquo;s</h3>
					<div className='mt-3 space-y-3 text-[0.875rem] leading-7 text-[var(--ink-2)]'>
						<p>{lguCounts.sulnote}</p>
						<p>{lguCounts.reconcileNote}</p>
					</div>
				</aside>
			</section>

		</>
	)
}
