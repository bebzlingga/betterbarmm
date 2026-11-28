import { ArrowRightIcon, BuildingsIcon, CoinsIcon, HouseLineIcon, IdentificationBadgeIcon, MapTrifoldIcon, UsersThreeIcon } from '@phosphor-icons/react/ssr'
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
import { CARD, CARD_FOOT, LguFigures, SectionTitle } from './_components/lgu-parts'
import { Hero } from './_components/hero'
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
		<ul className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
			{lguProvinces.map((province) => {
				const capital = capitalOf(province)
				const figures = [
					['Cities and municipalities', province.municipalities.length],
					['Barangays', province.barangayCount],
					['Population', province.population],
					['Parliament seats', seatsFor(province)],
				] as const
				const roster = rosterCoverage(province.municipalities).listed
				return (
					<li key={province.slug} className='flex'>
						<Link href={areaHref(province)} className={`${CARD} w-full`}>
							<div className='flex flex-1 flex-col p-6 sm:p-7'>
								<p className='text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>
									{[province.kind, capital && capital !== province.name ? `capital ${capital}` : null].filter(Boolean).join(' · ')}
								</p>
								<h3 className='mt-3 text-[1.375rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
									{province.name}
								</h3>
								<p className='mt-2 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{ABOUT[province.slug] ?? province.note}</p>
								<dl className='mt-6 grid grid-cols-2 gap-2'>
									{figures.map(([label, value]) => (
										<div key={label} className='rounded-xl bg-[var(--paper-2)] px-3.5 py-3'>
											<dt className='text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)]'>{label}</dt>
											<dd className='num mt-1.5 text-[1.25rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>
												{value != null ? value.toLocaleString('en-PH') : '—'}
											</dd>
										</div>
									))}
								</dl>
							</div>
							<span className={CARD_FOOT}>
								<span className='num font-medium'>
									{roster.toLocaleString('en-PH')} of {province.barangayCount.toLocaleString('en-PH')} captains on record
								</span>
								<ArrowRightIcon size={14} weight='bold' aria-hidden='true' className='transition-transform group-hover:translate-x-0.5' />
							</span>
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
			{/* ---- Masthead: the crimson header under the clear bars, the region's map on its right (user decision: the
			     travel look) ---- */}
			<Hero
				kicker='Local government in the Bangsamoro'
				title='Every province, every municipality, and who runs it.'
				lede='Every province, city, municipality and barangay in the region, with its people, its land, its money and the officials elected to run it, each traced back to the record it came from.'
				side={
					// The region on the crimson itself, no card (user decision), each drawn area a link to its page: the areas in
					// gold, white under the pointer; the land around them a faint white; the lines between areas the crimson.
					<div
						className='relative hidden text-white lg:block'
						style={{ '--paper': '#8a2418', '--paper-3': 'rgba(255, 255, 255, 0.16)', '--accent': '#f1c453', '--ink': '#ffffff' } as React.CSSProperties}
					>
						<span className='flex items-center justify-between gap-3'>
							<span className='inline-flex items-center gap-1.5 rounded-full bg-white/[0.12] px-3 py-1.5 text-[0.75rem] font-semibold ring-1 ring-inset ring-white/20'>
								<MapTrifoldIcon size={13} weight='bold' aria-hidden='true' />
								Open an area
							</span>
							<span className='text-[0.75rem] text-white/60'>The Special Geographic Area has no published outline</span>
						</span>
						<RegionMap className='mt-4 max-h-[19rem]' />
					</div>
				}
			/>

			{/* Every figure here is the directory's own, summed from the units it can actually open. PSA's regional totals
			    are larger and count different things; the note under the areas says how much and why. On cards under the
			    header (user decision). */}
			<section className='lgu-under bb-container'>
				<LguFigures
					figures={[
						// Cotabato City is counted with the cities, not here.
						{ label: 'Provinces and special area', value: '', count: lguProvinces.filter((area) => area.kind !== 'City').length, group: false, icon: MapTrifoldIcon },
						{ label: 'Cities and municipalities', value: '', count: lguData.totals.lgus, group: false, icon: BuildingsIcon },
						{ label: 'Barangays', value: '', count: lguData.totals.barangays, icon: HouseLineIcon },
						{ label: 'Captains on record', value: '', count: regionRoster.listed, icon: IdentificationBadgeIcon },
						{ label: 'People, 2024 census', value: '', count: lguData.totals.population, icon: UsersThreeIcon },
						{ label: `NTA to its LGUs, FY ${ntaYear}`, value: `₱${(ntaTotal / 1e9).toFixed(1)}B`, icon: CoinsIcon },
					]}
				/>
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container dv-section'>
				<SectionTitle
					title={`${lguData.totals.provinces} provinces, a city and a special area`}
					lead='Open an area to see its cities, municipalities, barangays and officials.'
				/>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job — so it is shown, not folded away (user decision). */}
				<aside className='mt-12 rounded-[var(--dv-r)] bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] px-6 py-7 sm:px-9 sm:py-8'>
					<h3 className='font-[family-name:var(--font-display)] text-[1.0625rem] font-bold text-[var(--ink)]'>Why this total is smaller than PSA&rsquo;s</h3>
					<div className='mt-3 space-y-3 text-[0.875rem] leading-7 text-[var(--ink-2)]'>
						<p>{lguCounts.sulnote}</p>
						<p>{lguCounts.reconcileNote}</p>
					</div>
				</aside>
			</section>

		</>
	)
}
