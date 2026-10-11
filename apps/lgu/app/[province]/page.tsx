import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import {
	LguMasthead,
	LguSourceNote,
	LguFigures,
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
import { LguTermPicker } from '../_components/lgu-term-picker'
import { LguFinances } from '../_components/lgu-finances'
import { LguDisclosure } from '../_components/lgu-disclosure'
import { NtaChart } from '../_components/nta-chart'
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
				kicker={`${province.kind} · Bangsamoro`}
				name={province.name}
				note={province.note}
			>
				<NtaChart unitKey={province.slug} />
			</LguMasthead>

			{/* The province in figures, and against the region, on a light band
			    under the masthead. */}
			<div className='bg-[var(--paper-2)]'>
				<div className='bb-container py-14 lg:py-18'>
				{/* ---- The province in figures ---- */}
				<Rise delay={0.3} distance={14}>
					<LguFigures
						className=''
						figures={[
							{
								label: 'Population (2024)',
								value: formatNumber(province.population),
								count: province.population,
								detail: change != null ? `${change > 0 ? '+' : ''}${change}% since the 2020 census.` : undefined,
							},
							{
								label: cities.length > 0 ? 'Cities and municipalities' : 'Municipalities',
								value: String(province.municipalities.length),
								count: province.municipalities.length,
								group: false,
								detail:
									biggest.length > 0 && province.municipalities.length > 1
										? `Largest: ${biggest.map((unit) => unit.name).join(', ')}.`
										: undefined,
							},
							{
								label: 'Barangays',
								value: formatNumber(province.barangayCount),
								count: province.barangayCount,
							},
							{
								label: 'Land area',
								value: formatArea(province.areaKm2),
								detail:
									density(province) != null ? `${formatNumber(density(province))} people per km².` : undefined,
							},
						]}
					/>
				</Rise>
				</div>
				<div className='bb-container'>
					<div className='grid gap-8 border-t border-[var(--brass-line)] py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-18'>
					{regionShare != null ? (
						<p className='max-w-[34rem] text-[15px] leading-7 text-[var(--ink-2)]'>
							{province.name} is home to{' '}
							<span className='num font-semibold text-[var(--ink)]'>{regionShare}%</span> of the people of
							BARMM: {formatNumber(province.population)} of the region&rsquo;s{' '}
							{formatNumber(lguData.totals.population)} at the 2024 census.
						</p>
					) : null}
					{regionShare != null ? (
						<Rise delay={0.1} distance={14}>
							<ShareBar
								share={regionShare}
								label='Share of BARMM’s people'
								ofLabel='The rest of BARMM’s people'
								caption={false}
							/>
						</Rise>
					) : null}
					</div>
				</div>
			</div>

			{/* The towns first, because finding your own is why most people open a
			    province page; the officials and the money are a tab away rather than
			    a long scroll below. */}
			<section className='bb-container bb-section-bottom'>
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
										columns={[
											{ key: 'mayor', label: 'Mayor', format: 'text', hideBelow: 'md' },
											{ key: 'population', label: 'Population', format: 'int' },
											{ key: 'barangays', label: 'Barangays', format: 'int' },
											{ key: 'area', label: 'Land area', format: 'area', hideBelow: 'lg' },
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
									{
										id: 'disclosure',
										label: 'Full disclosure',
										panel: (
											<LguDisclosure
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
