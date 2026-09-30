import { ArrowLeftIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
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
import { LguTermPicker } from '../_components/lgu-term-picker'
import { UnitGrid, type UnitCard } from '../_components/unit-grid'
import { LineReveal, OkirRule, Rise } from '@betterbarmm/editorial'

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

/** The mayor of the term now in office, for the card grid. */
function currentMayor(unit: LguUnit): string | null {
	const termId = lguData.officials?.currentTermId
	const mayor = termId ? unit.officials?.[termId]?.mayor : undefined
	return mayor?.ranked[0]?.name ?? null
}

/** A unit flattened to what the browser-side grid needs. */
function toCard(province: LguProvince, unit: LguUnit): UnitCard {
	return {
		name: unit.name,
		href: `/${province.slug}/${unit.slug}`,
		isCity: unit.isCity,
		isCapital: unit.isCapital,
		cityClass: unit.cityClass,
		formedFrom: unit.formedFrom,
		mayor: currentMayor(unit),
		population: unit.population,
		barangays: unit.barangays.length,
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
	const municipalities = province.municipalities.filter((unit) => !unit.isCity)
	const biggest = largestUnits(province)
	const change = growth(province)
	const gap = unaccounted(province)

	// This province against the region it sits in. The dataset's regional total
	// is summed from the same areas, so the two figures are measured the same way
	// and the share is a real comparison rather than two vintages divided by each
	// other.
	const regionShare =
		province.population != null && lguData.totals.population
			? Math.round((province.population / lguData.totals.population) * 1000) / 10
			: null

	const groups = [
		{
			title: cities.length === 1 ? 'City' : 'Cities',
			units: cities,
			label: 'cities',
		},
		{ title: 'Municipalities', units: municipalities, label: 'municipalities' },
	].filter((group) => group.units.length > 0)

	return (
		<>
			<LguMasthead
				brand
				breadcrumb={<LguBreadcrumb trail={[]}>{province.name}</LguBreadcrumb>}
				kicker={`${province.kind} · Bangsamoro`}
				name={province.name}
				note={province.note}
			>
				{/* ---- The province in figures ---- */}
				<Rise delay={0.3} distance={14}>
					<div className='mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
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

			{/* ---- Who runs it ---- */}
			{province.officials ? (
				<section id='officials' className='bb-container scroll-mt-24 pt-16 lg:pt-20'>
					<Rise distance={12}>
						<div className='bb-kicker'>
							<span>01</span>
							<span>Who runs it</span>
						</div>
					</Rise>

					<LineReveal
						as='h2'
						lines={[`Who runs ${province.name}.`]}
						className='bb-display-sm mt-8 text-[var(--ink)]'
					/>

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
				</section>
			) : null}

			<OkirRule className='mx-auto mt-16 max-w-[88rem] opacity-70 lg:mt-20' />

			{/* ---- The units ---- */}
			<section className='bb-container bb-section-bottom'>
				{groups.map((group, groupIndex) => (
					<div key={group.title} className='mt-16'>
						<Rise distance={12}>
							<div className='bb-kicker'>
								<span>{String(groupIndex + (province.officials ? 2 : 1)).padStart(2, '0')}</span>
								<span>{group.title}</span>
							</div>
							<div className='mt-6 flex items-baseline justify-between gap-4 border-b border-[var(--ink)] pb-3'>
								<h2 className='text-[1.4rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>
									Every {group.title.toLowerCase().replace(/ies$/, 'y').replace(/s$/, '')} in{' '}
									{province.name}
								</h2>
								<p className='num text-[13px] font-semibold text-[var(--brass)]'>
									{group.units.length}
								</p>
							</div>
						</Rise>

						<UnitGrid
							units={group.units.map((unit) => toCard(province, unit))}
							label={group.label}
							searchable={group.units.length > 12}
						/>
					</div>
				))}

				<LguSourceNote className='mt-16' />

				<Rise distance={12}>
					<Link href='/' className='bb-btn bb-btn-ghost mt-10'>
						<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
						All of local government
					</Link>
				</Rise>
			</section>
		</>
	)
}
