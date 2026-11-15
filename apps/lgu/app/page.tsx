import { LineReveal, Rise } from '@betterbarmm/editorial'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
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
		<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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
							<div className='flex flex-1 flex-col p-6'>
								<p className='bb-label'>
									{[province.kind, capital && capital !== province.name ? `capital ${capital}` : null].filter(Boolean).join(' · ')}
								</p>
								<h3 className='mt-3 text-[1.375rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>
									{province.name}
								</h3>
								<p className='mt-2 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{ABOUT[province.slug] ?? province.note}</p>
								<dl className='mt-auto grid grid-cols-2 gap-px bg-[var(--rule-soft)] pt-px'>
									{figures.map(([label, value]) => (
										<div key={label} className='bg-[var(--paper)] pb-1 pt-4 [&:nth-child(even)]:pl-4'>
											<dt className='font-mono text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>{label}</dt>
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
			{/* ---- Masthead ---- */}
			<section className='bb-lattice brand-bg relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -left-[16rem] -top-[22rem] h-[40rem] w-[64rem] max-w-[160vw] bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
				/>

				<div className='bb-container relative grid items-center gap-10 py-16 lg:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'>
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

					{/* Every figure here is the directory's own, summed from the units it can actually open. PSA's regional
					    totals are larger and count different things; the note under the areas says how much and why. */}
					<LguFigures
						className='mt-2 lg:col-span-2'
						figures={[
							// Cotabato City is counted with the cities, not here.
							{ label: 'Provinces and special area', value: '', count: lguProvinces.filter((area) => area.kind !== 'City').length, group: false },
							{ label: 'Cities and municipalities', value: '', count: lguData.totals.lgus, group: false },
							{ label: 'Barangays', value: '', count: lguData.totals.barangays },
							{ label: 'Captains on record', value: '', count: regionRoster.listed },
							{ label: 'People, 2024 census', value: '', count: lguData.totals.population },
							{ label: `NTA to its LGUs, FY ${ntaYear}`, value: `₱${(ntaTotal / 1e9).toFixed(1)}B` },
						]}
					/>
				</div>
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container bb-section'>
				<SectionTitle
					title={`${lguData.totals.provinces} provinces, a city and a special area`}
					lead='Open an area to see its cities, municipalities, barangays and officials.'
				/>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job — so it is shown, not folded away (user decision). */}
				<aside className='mt-12 border border-[var(--rule)] bg-[var(--paper-2)] px-6 py-6 sm:px-8'>
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
