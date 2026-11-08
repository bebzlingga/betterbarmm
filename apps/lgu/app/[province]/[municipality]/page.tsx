import { ArrowLeftIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
	allUnitParams,
	density,
	findUnit,
	formatArea,
	formatNumber,
	townHistory,
	growth,
	unitClass,
	winners,
	type LguProvince,
	type LguUnit,
} from '@betterbarmm/lgu-data'
import {
	LguBreadcrumb,
	LguMasthead,
	LguSourceNote,
} from '../../_components/lgu-parts'
import { lguData, personName } from '@betterbarmm/lgu-data'
import { barangayOfficials, unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { LguFinances } from '../../_components/lgu-finances'
import { AuditFindings } from '../../_components/audit-findings'
import { auditsFor } from '@betterbarmm/lgu-data/coa'
import { LguDisclosure } from '../../_components/lgu-disclosure'
import { NtaChart } from '../../_components/nta-chart'
import { LgsfReceived } from '../../_components/lgsf-received'
import { LocatorMap } from '../../_components/locator-map'
import { Official } from '../../_components/official'
import { barangayCounts, barangayPopulation } from '@betterbarmm/lgu-data/barangay-population'
import { ntaShares } from '@betterbarmm/lgu-data/nta'
import { houseSeat, houseSeats } from '@betterbarmm/lgu-data/house-seats'
import { AmongTowns, BarangayCards, CensusChart, ChartCard, FigureCards, NtaSplit, RankedBars, type FigureCard } from '../../_components/lgu-figures'
export function generateStaticParams() {
	return allUnitParams()
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ province: string; municipality: string }>
}): Promise<Metadata> {
	const { province, municipality } = await params
	const found = findUnit(province, municipality)
	if (!found) return { title: 'Local government — Discover BARMM' }

	// Cotabato City is its own area, so "Cotabato City, Cotabato City" is what
	// the obvious template produces. Where the unit is the whole area, the area
	// is BARMM.
	const where = found.province.name === found.unit.name ? 'BARMM' : found.province.name
	return {
		title: `${found.unit.name}, ${where} — Local government directory`,
		description: `${unitClass(found.unit)} in ${where}. Population, land area, ${found.unit.barangays.length} barangays, elected offices, and devolved services.`,
	}
}

/**
 * The opening sentence, which is not the same sentence for every unit.
 *
 * Cotabato City is an independent component city and belongs to no province,
 * so "a component city of Cotabato City" — what a naive template produced here
 * — was both a tautology and wrong about the one fact that makes the city
 * unusual. The Special Geographic Area is not a province either, so a unit
 * inside it is *in* the area rather than *of* a province.
 */
function opening(unit: LguUnit, province: LguProvince): string {
	const article = unit.isCity ? unitClass(unit).toLowerCase() : 'municipality'
	const region = 'the Bangsamoro Autonomous Region in Muslim Mindanao'

	if (province.kind === 'City') {
		return `${unit.name} is an ${article} in ${region}. It answers to no province — its charter bars its voters from electing provincial officials — though PSA and COMELEC both file it inside Maguindanao del Norte.`
	}

	const where =
		province.kind === 'Special area'
			? `a ${article} of the Special Geographic Area, in ${region}`
			: `a ${article} of ${province.name}, in ${region}${unit.isCapital ? ', and its capital' : ''}`

	return `${unit.name} is ${where}.`
}

const peso = (value: number) => (value >= 1e9 ? `₱${(value / 1e9).toFixed(2)}B` : `₱${(value / 1e6).toFixed(1)}M`)

const H2 = 'scroll-mt-32 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

export default async function UnitPage({
	params,
}: {
	params: Promise<{ province: string; municipality: string }>
}) {
	const { province: provinceSlug, municipality } = await params
	const found = findUnit(provinceSlug, municipality)
	if (!found) notFound()

	const { province, unit } = found
	const siblings = province.municipalities
	const index = siblings.findIndex((m) => m.slug === unit.slug)
	const previous = siblings[index - 1]
	const next = siblings[index + 1]

	// Cotabato City is the only unit in its own area, so a trail through the
	// area would read "Cotabato City / Cotabato City".
	const trail =
		province.name === unit.name ? [] : [{ label: province.name, href: `/${province.slug}` }]

	const key = `${province.slug}/${unit.slug}`
	const rosters = unitRosters(unit.slug)
	const history = townHistory(province.slug, unit.slug)
	const change = growth(unit)
	// Two sentences of the directory's own facts; the figures sit just below.
	const lead = `${opening(unit, province)} It has ${unit.barangays.length} ${unit.barangays.length === 1 ? 'barangay' : 'barangays'}${unit.population != null ? ` and had ${formatNumber(unit.population)} residents at the 2024 census` : ''}.`

	// A share needs something to be a share of: Cotabato City is its whole area.
	const share =
		province.municipalities.length > 1 && unit.population != null && province.population
			? Math.round((unit.population / province.population) * 1000) / 10
			: null
	// The year's allotment: the latest DBM year that has begun, else the earliest.
	const ntaYear = ntaShares.years.filter((year) => year <= new Date().getFullYear()).at(-1) ?? ntaShares.years[0]
	const nta = ntaShares.units[key]
	const ntaOwn = nta?.lgu?.[String(ntaYear)] ?? null
	const ntaBarangays = nta?.barangays?.[String(ntaYear)] ?? null

	const counts = barangayCounts(key)
	const barangayRows = unit.barangays.map((barangay) => {
		const id = barangay.psgc ?? barangay.name
		const captain = rosters[id]?.punongBarangay?.name
		return { key: id, name: barangay.name, captain: captain ? personName(captain) : null, population: counts[id] ?? null }
	})
	const largest = barangayRows
		.filter((row) => row.population != null)
		.sort((a, b) => b.population! - a.population!)
	const towns = province.municipalities.flatMap((town) => (town.population != null ? [{ name: town.name, value: town.population }] : []))

	const cards: FigureCard[] = [
		{
			label: 'Population (2024)',
			value: formatNumber(unit.population),
			detail: change != null ? `${change > 0 ? '+' : ''}${change}% since the 2020 census` : 'PSA census',
			tone: 'accent',
		},
		...(unit.areaKm2 != null ? [{ label: 'Land area', value: formatArea(unit.areaKm2), detail: 'PSA' }] : []),
		...(density(unit) != null ? [{ label: 'Density', value: `${formatNumber(density(unit))} / km²`, detail: 'People per km²' }] : []),
		{
			label: 'Barangays',
			value: String(unit.barangays.length),
			detail: largest[0] ? `Largest: ${largest[0].name}` : null,
			tone: 'accent',
		},
		...(share != null ? [{ label: `Share of ${province.name}`, value: `${share}%`, detail: 'Of its people' }] : []),
		...(ntaOwn != null
			? [{ label: `FY ${ntaYear} tax allotment`, value: peso(ntaOwn), detail: 'DBM allocation', tone: 'brass' as const }]
			: []),
		{ label: 'PSGC code', value: unit.psgc ?? 'Not yet assigned', detail: null },
	]

	// Who governs it now: the top of the current canvass for mayor and vice-mayor,
	// and the council's winners at its seats.
	const termId = lguData.officials?.currentTermId
	const current = termId ? unit.officials?.[termId] : undefined
	const termLabel = termId ? `${termId.replace('-', '–')} term` : ''
	const officials = (
		[
			['Mayor', current?.mayor],
			['Vice-Mayor', current?.viceMayor],
		] as const
	).flatMap(([position, contest]) => {
		const top = contest?.ranked[0]
		return top ? [{ position, name: personName(top.name), party: top.party ?? null }] : []
	})
	const council = (current?.council ?? []).flatMap((contest) => winners(contest))
	const councilName = unit.isCity ? 'Sangguniang Panlungsod' : 'Sangguniang Bayan'
	const seat = houseSeat(key)

	return (
		<>
			<LguMasthead
				// Nothing above Cotabato City but the directory itself, so no trail there.
				breadcrumb={trail.length ? <LguBreadcrumb trail={trail}>{unit.name}</LguBreadcrumb> : undefined}
				kicker={[
					unitClass(unit),
					unit.isCapital && province.kind === 'Province' ? 'provincial capital' : null,
					province.name === unit.name ? 'Bangsamoro' : province.name,
				]
					.filter(Boolean)
					.join(' · ')}
				name={unit.name}
			>
				{history ? (
					<div className='mt-12 grid gap-6 text-[0.9375rem] leading-7 text-[var(--ink-2)] lg:grid-cols-2 lg:gap-20'>
						<p>{history.summary ?? history.paragraphs.join(' ')}</p>
						<p>{lead}</p>
					</div>
				) : (
					<div className='mt-12 max-w-[58rem] space-y-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
						<p>{lead}</p>
						{[unit.nameNote, unit.populationNote].filter(Boolean).map((note) => (
							<p key={note}>{note}</p>
						))}
						{unit.formedFrom ? (
							<p>
								It was constituted from barangays of {unit.formedFrom} in North Cotabato, which voted to join BARMM in
								the 2019 plebiscite, and ratified as a municipality by plebiscite on April 13, 2024.
							</p>
						) : null}
					</div>
				)}
			</LguMasthead>

			{/* ---- The town in figures: the headline numbers, then a card per question ---- */}
			<section className='bb-container pt-16 sm:pt-20'>
				<h2 id='figures' className={H2}>
					{unit.name} in figures
				</h2>
				<p className='mt-2 max-w-[46rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
					PSA&rsquo;s census counts and land areas, and the tax allotment DBM sets for it. Each figure says where it is from.
				</p>
				<div className='mt-8'>
					<FigureCards cards={cards} />
				</div>
				<div className='mt-14 grid gap-x-16 gap-y-14 lg:grid-cols-2'>
					{unit.population != null && unit.population2020 != null ? (
						<ChartCard title='Population, 2020 and 2024' note={`PSA census counts for ${unit.name}.`} source='PSA, 2020 and 2024 Census of Population'>
							<CensusChart before={unit.population2020} now={unit.population} />
						</ChartCard>
					) : null}
					{largest.length > 1 ? (
						<ChartCard
							title='Most populous barangays'
							note={`The ${Math.min(10, largest.length)} largest of ${unit.barangays.length}, by the 2024 census.`}
							source={
								<>
									<a href={barangayPopulation.source.href} target='_blank' rel='noreferrer' className='rule-link'>
										{barangayPopulation.source.label}
									</a>
								</>
							}
						>
							<RankedBars rows={largest.slice(0, 10).map((row) => ({ label: row.name, value: row.population! }))} />
						</ChartCard>
					) : null}
					{towns.length > 1 && unit.population != null ? (
						<ChartCard
							title={`Among ${province.name}’s towns`}
							note={`Every ${province.kind === 'Special area' ? 'town of the area' : 'city and town of the province'}, largest to smallest by the 2024 census. Hover a column for its name.`}
							source='PSA, 2024 Census of Population'
						>
							<AmongTowns towns={towns} current={unit.name} />
						</ChartCard>
					) : null}
					{ntaOwn != null ? (
						<ChartCard
							title={`National Tax Allotment, FY ${ntaYear}`}
							note={`What DBM allocates to ${unit.name} and, separately, to its barangays.`}
							source={
								<a href={ntaShares.source[0]?.href} target='_blank' rel='noreferrer' className='rule-link'>
									{ntaShares.source[0]?.label}
								</a>
							}
						>
							<NtaSplit own={ntaOwn} barangays={ntaBarangays} isCity={unit.isCity} />
						</ChartCard>
					) : null}
					{/* The allotment year by year, in a card of its own. */}
					<div className='border-t border-[var(--rule)] pt-6 empty:hidden lg:col-span-2 [&_figure]:mt-0 [&_h2]:font-[family-name:inherit] [&_h2]:text-[1.0625rem] [&_h2]:font-semibold [&_h2]:tracking-normal'>
						<NtaChart unitKey={key} />
					</div>
				</div>
			</section>

			<div className='bb-container bb-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-28'>
				{/* ---- The town, read down: its barangays, then its own records ---- */}
				<div className='min-w-0'>
					<section>
						<h2 id='barangays' className={H2}>
							<span className='num text-[var(--ink-3)]'>{unit.barangays.length}</span>{' '}
							{unit.barangays.length === 1 ? 'Barangay' : 'Barangays'}
						</h2>
						<p className='mt-2 text-[0.875rem] leading-6 text-[var(--ink-3)]'>Ranked by people at the 2024 census, each with its punong barangay.</p>
						<div className='mt-6'>
							<BarangayCards rows={barangayRows} total={unit.population} whole={unit.isCity ? 'city' : 'town'} />
						</div>
						<p className='mt-4 text-[0.78125rem] leading-6 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink-3)]'>
							Punong barangay from DILG&rsquo;s directory, read {barangayOfficials.capturedAt}, where it lists one.{' '}
							<a href={barangayOfficials.source.href} target='_blank' rel='noreferrer' className='rule-link'>
								Source
							</a>
							. Population from{' '}
							<a href={barangayPopulation.source.href} target='_blank' rel='noreferrer' className='rule-link'>
								{barangayPopulation.source.label}
							</a>
							.
						</p>
					</section>

					<section className='mt-20'>
						<LgsfReceived unitKey={key} name={unit.name} />
					</section>

					<section className='mt-20'>
						<h2 id='disclosure' className={H2}>
							Full disclosure
						</h2>
						<div className='mt-6'>
							<LguDisclosure unitKey={key} name={unit.name} />
						</div>
					</section>

					<section className='mt-20'>
						<h2 id='finances' className={H2}>
							Finances
						</h2>
						<div className='mt-6'>
							<LguFinances unitKey={key} name={unit.name} recognition={false} />
						</div>
					</section>

					<section className='mt-20'>
						<h2 id='audits' className={H2}>
							What the auditor found
						</h2>
						<p className='mt-3 max-w-[46rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
							The Commission on Audit&rsquo;s yearly report on {unit.name}&rsquo;s books, in plain words.
						</p>
						<div className='mt-6'>
							<AuditFindings reports={auditsFor(key)} name={unit.name} />
						</div>
					</section>
				</div>

				{/* ---- Beside it: where it is, then who governs it ---- */}
				<aside className='order-first lg:order-none'>
					<div className='mb-8'>
						<LocatorMap areaSlug={province.slug} unit={{ psgc: unit.psgc ?? null, name: unit.name }} label={unit.name} />
					</div>

					{officials.length > 0 || council.length > 0 ? (
						<div className='mt-10'>
							<h2 className='text-[0.9375rem] font-semibold text-[var(--ink)]'>Current officials</h2>
							<p className='mt-1 text-[0.78125rem] text-[var(--ink-3)]'>{termLabel}</p>
							<ul className='mt-4'>
								{officials.map((official) => (
									<Official key={official.position} name={official.name} party={official.party} role={official.position} />
								))}
							</ul>
							{council.length > 0 ? (
								<div className='mt-8'>
									<h3 className='text-[0.875rem] font-semibold text-[var(--ink)]'>{councilName}</h3>
									<ul className='mt-1'>
										{council.map((member) => (
											<Official key={member.name} name={personName(member.name)} party={member.party ?? null} role='Council member' />
										))}
									</ul>
								</div>
							) : null}
							{seat ? (
								<div className='mt-8'>
									<h3 className='text-[0.875rem] font-semibold text-[var(--ink)]'>House of Representatives</h3>
									<ul className='mt-1'>
										<Official
											name={personName(seat.name)}
											party={seat.party}
											role={`Representative, ${seat.province}${seat.district === 'Lone district' ? '’s lone district' : `, ${seat.district}`}`}
										/>
									</ul>
									<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
										Elected May 2025, from{' '}
										<a href={houseSeats.source.href} target='_blank' rel='noreferrer' className='rule-link'>
											{houseSeats.source.label}
										</a>
										.
									</p>
								</div>
							) : null}
							<Link href='/officials' className='rule-link mt-6 inline-block text-[0.8125rem]'>
								Every official, every term
							</Link>
						</div>
					) : null}
				</aside>
			</div>

			<section className='bb-container bb-section-bottom'>
				{history ? (
					<p className='mb-8 text-[0.78125rem] leading-6 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink-3)]'>
						<span className='font-semibold text-[var(--ink-3)]'>History sources:</span>{' '}
						{history.sources.map((source, i) => (
							<span key={source.href}>
								{i > 0 ? ' · ' : ''}
								<a href={source.href} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--ink)]'>
									{source.label}
								</a>
							</span>
						))}
					</p>
				) : null}
				<LguSourceNote />

				{/* ---- Move along the province ---- */}
				<div className='mt-10 grid bg-[var(--paper-2)] sm:grid-cols-2'>
					{previous ? (
						<Link
							href={`/${province.slug}/${previous.slug}`}
							className='group flex items-center gap-3 px-6 py-6 transition hover:bg-[var(--paper-3)]'
						>
							<ArrowLeftIcon
								className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-x-1 group-hover:text-[var(--accent)]'
								aria-hidden='true'
							/>
							<span className='min-w-0'>
								<span className='block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									Previous
								</span>
								<span className='mt-1 block truncate text-[0.9375rem] font-medium text-[var(--ink)]'>
									{previous.name}
								</span>
							</span>
						</Link>
					) : (
						<span className='hidden sm:block' />
					)}

					{next ? (
						<Link
							href={`/${province.slug}/${next.slug}`}
							className='group flex items-center justify-end gap-3 px-6 py-6 text-right transition hover:bg-[var(--paper-3)] sm:col-start-2'
						>
							<span className='min-w-0'>
								<span className='block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									Next
								</span>
								<span className='mt-1 block truncate text-[0.9375rem] font-medium text-[var(--ink)]'>
									{next.name}
								</span>
							</span>
							<span
								aria-hidden='true'
								className='shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:translate-x-1 group-hover:text-[var(--accent)]'
							>
								&rarr;
							</span>
						</Link>
					) : null}
				</div>

			</section>
		</>
	)
}
