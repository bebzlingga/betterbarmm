import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
	LguBreadcrumb,
	LguMasthead,
	LguSourceNote,
	LguStat,
	ShareBar,
} from '../_components/lgu-parts'
import {
	density,
	findProvince,
	formatArea,
	formatNumber,
	growth,
	areaHref,
	isSingleUnitArea,
	largestUnits,
	lguData,
	lguProvinces,
	personName,
	officialsTerms,
	unaccounted,
	type LguProvince,
	type LguUnit,
} from '@betterbarmm/lgu-data'
import {
	MultiSeat,
	NoCanvass,
	OfficeLineage,
	ProvinceRollPanel,
	Reconstructed,
	SingleSeat,
} from '../_components/lgu-officials'
import { provinceHistory, tookOffice } from '@betterbarmm/lgu-data/history'
import { rosterCoverage } from '@betterbarmm/lgu-data/barangay-officials'
import { LguTermPicker } from '../_components/lgu-term-picker'
import { LguFinances } from '../_components/lgu-finances'
import { LguTabs } from '../_components/lgu-tabs'
import { DataTable, type DataRow } from '../_components/data-table'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'
import { Rise } from '@betterbarmm/editorial'

export function generateStaticParams() {
	// Cotabato City's area page is a list of one thing named after the thing.
	// It is not prerendered; the route below redirects anyone who reaches it.
	return lguProvinces
		.filter((province) => !isSingleUnitArea(province))
		.map((province) => ({ province: province.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ province: string }>
}): Promise<Metadata> {
	const { province: slug } = await params
	const province = findProvince(slug)
	if (!province) return { title: 'Local government — Discover BARMM' }

	return {
		title: `${province.name} — Local government directory`,
		description: `${province.municipalities.length} cities and municipalities, ${formatNumber(
			province.barangayCount,
		)} barangays. Population, land area, officials and services for ${province.name} in BARMM.`,
	}
}

/** The mayor of the term now in office. */
function currentMayor(unit: LguUnit): string | null {
	const termId = lguData.officials?.currentTermId
	const mayor = termId ? unit.officials?.[termId]?.mayor : undefined
	return mayor?.ranked[0]?.name ?? null
}

/** A unit as one row of the province's table. */
function toRow(province: LguProvince, unit: LguUnit, ntaYear: number): DataRow {
	const mayor = currentMayor(unit)
	return {
		key: unit.slug,
		href: `/${province.slug}/${unit.slug}`,
		name: unit.name,
		meta:
			[unit.isCapital ? 'Capital' : null, unit.isCity ? (unit.cityClass ?? 'City') : null, unit.formedFrom ? `from ${unit.formedFrom}` : null]
				.filter(Boolean)
				.join(' · ') || undefined,
		mobile: mayor ? `Mayor ${personName(mayor)}` : undefined,
		values: {
			mayor: mayor ? personName(mayor) : null,
			population: unit.population,
			barangays: unit.barangays.length,
			area: unit.areaKm2,
			nta: (row(finances, `${province.slug}/${unit.slug}`, ntaYear)?.nta as number | null) ?? null,
		},
	}
}

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
	const { province: slug } = await params
	const province = findProvince(slug)
	if (!province) notFound()
	if (isSingleUnitArea(province)) redirect(areaHref(province))

	// The terms before 2025, which are winners only — see the history package.
	const history = provinceHistory(province.slug)

	const cities = province.municipalities.filter((unit) => unit.isCity)
	const biggest = largestUnits(province)
	const change = growth(province)
	const gap = unaccounted(province)
	const roster = rosterCoverage(province.municipalities)

	// This province against the region it sits in. The dataset's regional total
	// is summed from the same areas, so the two figures are measured the same way
	// and the share is a real comparison rather than two vintages divided by each
	// other.
	const regionShare =
		province.population != null && lguData.totals.population
			? Math.round((province.population / lguData.totals.population) * 1000) / 10
			: null

	const ntaYear = finances.years.at(-1)!

	return (
		<>
			<LguMasthead
				breadcrumb={<LguBreadcrumb trail={[]}>{province.name}</LguBreadcrumb>}
				kicker={`${province.kind} · Bangsamoro`}
				name={province.name}
				note={province.note}
			>
				{/* ---- The province in figures ---- */}
				<Rise delay={0.3} distance={14}>
					<div className='mt-14 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4'>
						<LguStat
							value={formatNumber(province.population)}
							count={province.population}
							label='Population (2024)'
						/>
						<LguStat
							value={String(province.municipalities.length)}
							count={province.municipalities.length}
							group={false}
							label={cities.length > 0 ? 'Cities and municipalities' : 'Municipalities'}
						/>
						<LguStat
							value={formatNumber(province.barangayCount)}
							count={province.barangayCount}
							label='Barangays'
						/>
						<LguStat value={formatArea(province.areaKm2)} label='Land area' />
					</div>
				</Rise>

				<div className='mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16'>
					{regionShare != null ? (
						<Rise delay={0.1} distance={14}>
							<ShareBar
								share={regionShare}
								label={`${province.name}'s share of BARMM`}
								ofLabel='The rest of the region'
							/>
						</Rise>
					) : null}

					<Rise delay={0.15} distance={14}>
						<div className='flex flex-wrap gap-x-8 gap-y-2.5 text-[13px] text-[var(--ink-3)] lg:justify-end'>
							{density(province) != null ? (
								<p>
									<span className='num font-semibold text-[var(--ink)]'>
										{formatNumber(density(province))}
									</span>{' '}
									people per km²
								</p>
							) : null}
							{change != null ? (
								<p>
									<span className='num font-semibold text-[var(--ink)]'>
										{change > 0 ? '+' : ''}
										{change}%
									</span>{' '}
									since the 2020 census
								</p>
							) : null}
							<p>
								<span className='num font-semibold text-[var(--ink)]'>
									{formatNumber(roster.listed)} of {formatNumber(roster.total)}
								</span>{' '}
								barangay captains in DILG&rsquo;s directory
							</p>
							{biggest.length > 0 && province.municipalities.length > 1 ? (
								<p>
									Largest:{' '}
									<span className='font-semibold text-[var(--ink)]'>
										{biggest.map((unit) => unit.name).join(', ')}
									</span>
								</p>
							) : null}
						</div>
					</Rise>
				</div>

				{/* Where the province figure and its own municipalities disagree, the
				    page says so and by how much. A total that silently fails to match
				    the list under it is the kind of thing a reader notices second and
				    stops trusting the page over. */}
				{province.populationNote || gap ? (
					<Rise delay={0.2} distance={12}>
						<div className='mt-10 border-l-2 border-[var(--brass)] bg-[var(--paper-2)] px-5 py-4'>
							<p className='bb-label'>About this figure</p>
							<div className='bb-measure mt-3 space-y-2 text-[12.5px] leading-6 text-[var(--ink-2)]'>
								{province.populationNote ? <p>{province.populationNote}</p> : null}
								{gap ? (
									<p>
										The cities and municipalities below add up to{' '}
										<span className='num font-semibold text-[var(--ink)]'>
											{formatNumber((province.population ?? 0) - gap.people)}
										</span>
										, which is {formatNumber(Math.abs(gap.people))}{' '}
										{gap.people > 0 ? 'short of' : 'more than'} the provincial figure.
										{gap.missingUnits > 0
											? ` ${gap.missingUnits === 1 ? 'One unit has' : `${gap.missingUnits} units have`} no 2024 count in the record, and ${gap.missingUnits === 1 ? 'accounts' : 'account'} for the difference.`
											: ' The source record does not explain the difference, so neither does this page.'}
									</p>
								) : null}
								{province.populationSource === 'summed from municipalities' ? (
									<p className='text-[var(--ink-mute)]'>
										This province has no published census figure of its own here, so the total is
										summed from its municipalities.
									</p>
								) : null}
							</div>
						</div>
					</Rise>
				) : null}
			</LguMasthead>

			{/* The towns first, because finding your own is why most people open a
			    province page; the officials and the money are a tab away rather than
			    a long scroll below. */}
			<section className='bb-container bb-section-bottom pt-12'>
				<LguTabs
					tabs={[
						{
							id: 'units',
							label: 'Cities and municipalities',
							badge: province.municipalities.length,
							panel: (
								<div>
									<DataTable
										caption={`Cities and municipalities of ${province.name}`}
										nameLabel='City or municipality'
										filterLabel={province.municipalities.length > 12 ? 'cities and municipalities' : undefined}
										columns={[
											{ key: 'mayor', label: 'Mayor', format: 'text', hideBelow: 'md' },
											{ key: 'population', label: 'Population', format: 'int' },
											{ key: 'barangays', label: 'Barangays', format: 'int' },
											{ key: 'area', label: 'Land area, km²', format: 'area', hideBelow: 'lg' },
											{ key: 'nta', label: `NTA, FY ${ntaYear}`, format: 'peso', hideBelow: 'sm' },
										]}
										rows={province.municipalities.map((unit) => toRow(province, unit, ntaYear))}
									/>
								</div>
							),
						},
						...(province.officials
							? [
									{
										id: 'officials',
										label: 'Officials',
										panel: (
											<div>

					{/* Who has governed the province since 2001, before the term-by-term
					    detail — one term answers who the governor is, the run answers
					    who the province has been governed by. */}
					<div className='mt-12'>
						<OfficeLineage
							terms={officialsTerms}
							holders={Object.fromEntries(
								officialsTerms.map((term) => [
									term.id,
									province.officials?.[term.id]?.governor?.ranked[0] ??
										tookOffice(history[term.id], 'governor'),
								]),
							)}
						/>
					</div>

					<div className='mt-14'>
						<LguTermPicker
							panels={officialsTerms
								.map((term) => {
									const record = history[term.id]
									// COMELEC's own canvass, or a reconstructed one — the same
									// shape either way, so the same components draw it.
									const officials =
										province.officials?.[term.id] ??
										(record?.kind === 'canvass' ? record : undefined)

									if (!officials) {
										if (
											record?.kind !== 'roll' ||
											(!record.governor && !record.viceGovernor && !record.board?.length)
										) {
											return null
										}
										return {
											id: term.id,
											node: <ProvinceRollPanel roll={record} note={term.note} />,
										}
									}

									return {
										id: term.id,
										node: (
											<div>
												{term.status === 'canvass' ? <Reconstructed note={term.note} /> : null}
												{record?.kind === 'canvass' && record.undivided ? (
													<p className='mb-8 max-w-2xl border border-[var(--rule)] bg-[var(--paper-2)] p-4 text-[13px] leading-6 text-[var(--ink-2)]'>
														{record.undivided} was still one province in this term. This is its
														canvass — the governor, vice-governor and board elected by what is now
														both Maguindanao del Norte and Maguindanao del Sur. Neither half
														elected its own until 2025.
													</p>
												) : null}
												<div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
													{officials.governor ? (
														<SingleSeat title='Provincial Governor' contest={officials.governor} />
													) : null}
													{officials.viceGovernor ? (
														<SingleSeat
															title='Provincial Vice-Governor'
															contest={officials.viceGovernor}
														/>
													) : null}
												</div>

												{officials.board ? (
													<div className='mt-12'>
														<MultiSeat
															title='Sangguniang Panlalawigan'
															contests={officials.board}
														/>
													</div>
												) : null}
											</div>
										),
									}
								})
								.filter((panel) => panel !== null)}
							empty={<NoCanvass name={province.name} />}
						/>
					</div>
											</div>
										),
									},
								]
							: []),
						...(province.kind === 'Province'
							? [
									{
										id: 'finances',
										label: 'Finances',
										panel: (
											<LguFinances
												unitKey={province.slug}
												name={`the provincial government of ${province.name}`}
											/>
										),
									},
								]
							: []),
					]}
				/>

				<LguSourceNote className='mt-14' />
			</section>
		</>
	)
}
