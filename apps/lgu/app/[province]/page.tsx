import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
	largestUnits,
	lguData,
	lguProvinces,
	officialsTerms,
	type LguUnit,
} from '@betterbarmm/lgu-data'
import { MultiSeat, NoCanvass, SingleSeat } from '../_components/lgu-officials'
import { LguTermPicker } from '../_components/lgu-term-picker'
import { LineReveal, OkirRule, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
export function generateStaticParams() {
	return lguProvinces.map((province) => ({ province: province.slug }))
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

export default async function ProvincePage({
	params,
}: {
	params: Promise<{ province: string }>
}) {
	const { province: slug } = await params
	const province = findProvince(slug)
	if (!province) notFound()

	const cities = province.municipalities.filter((unit) => unit.isCity)
	const municipalities = province.municipalities.filter((unit) => !unit.isCity)
	const biggest = largestUnits(province)
	const change = growth(province)

	// This province against the region it sits in. The dataset's regional total
	// is summed from the same municipalities, so the two figures are measured the
	// same way and the share is a real comparison rather than two vintages
	// divided by each other.
	const regionShare =
		province.population != null && lguData.totals.population
			? Math.round((province.population / lguData.totals.population) * 1000) / 10
			: null

	return (
		<>

			<LguMasthead
				breadcrumb={
					<LguBreadcrumb trail={[]}>
						{province.name}
					</LguBreadcrumb>
				}
				kicker={`${province.kind} · Bangsamoro`}
				name={province.name}
				note={province.note}
			>
				{/* ---- The province in figures ---- */}
				<Stagger gap={0.07} className='mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
					<StaggerItem>
						<LguStat
							value={formatNumber(province.population)}
							count={province.population}
							label='Population (2024)'
						/>
					</StaggerItem>
					<StaggerItem>
						<LguStat
							value={String(province.municipalities.length)}
							count={province.municipalities.length}
							group={false}
							label={cities.length > 0 ? 'Cities and municipalities' : 'Municipalities'}
						/>
					</StaggerItem>
					<StaggerItem>
						<LguStat
							value={formatNumber(province.barangayCount)}
							count={province.barangayCount}
							label='Barangays'
						/>
					</StaggerItem>
					<StaggerItem>
						<LguStat value={formatArea(province.areaKm2)} label='Land area' />
					</StaggerItem>
				</Stagger>

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
							{biggest.length > 0 ? (
								<p>
									Largest:{' '}
									<span className='font-semibold text-[var(--ink)]'>
										{biggest.map((unit) => unit.name).join(', ')}
									</span>
								</p>
							) : null}
							{/* A province total that had to be added up from its towns is a
							    weaker figure than one the census published for the province,
							    so the page says which one it is showing. */}
							{province.populationSource === 'summed from municipalities' ? (
								<p className='text-[var(--ink-mute)]'>Population summed from its municipalities</p>
							) : null}
						</div>
					</Rise>
				</div>
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

					<div className='mt-12'>
						<LguTermPicker
							panels={officialsTerms
								.map((term) => {
									const officials = province.officials?.[term.id]
									if (!officials) return null

									return {
										id: term.id,
										node: (
											<div>
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
														<MultiSeat title='Sangguniang Panlalawigan' contests={officials.board} />
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
				{[
					{ title: cities.length === 1 ? 'City' : 'Cities', units: cities },
					{ title: 'Municipalities', units: municipalities },
				]
					.filter((group) => group.units.length > 0)
					.map((group, groupIndex) => (
						<div key={group.title} className='mt-16 first:mt-16'>
							<Rise distance={12}>
								<div className='bb-kicker'>
									<span>{String(groupIndex + 2).padStart(2, '0')}</span>
									<span>{group.title}</span>
								</div>
								<div className='mt-6 flex items-baseline justify-between gap-4 border-b border-[var(--rule)] pb-3'>
									<h2 className='text-[1.4rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>
										Every {group.title.toLowerCase().replace(/s$/, '')} in {province.name}
									</h2>
									<p className='num text-[13px] font-semibold text-[var(--brass)]'>
										{group.units.length}
									</p>
								</div>
							</Rise>

							<Stagger gap={0.03} className='grid sm:grid-cols-2 lg:grid-cols-3'>
								{group.units.map((unit) => (
									<StaggerItem key={unit.slug} distance={12}>
										<Link
											href={`/${province.slug}/${unit.slug}`}
											className='group flex h-full flex-col border-b border-[var(--rule)] py-5 transition hover:bg-[var(--paper-2)] sm:border-r sm:px-5 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0'
										>
											<div className='flex items-start justify-between gap-3'>
												<h3 className='text-[17px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
													{unit.name}
												</h3>
												<ArrowUpRightIcon
													className='mt-1 size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
													aria-hidden='true'
												/>
											</div>

											<div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1'>
												{unit.isCapital ? (
													<span className='badge badge-plain badge-early'>Capital</span>
												) : null}
												{unit.isCity ? (
													<span className='badge badge-plain badge-committee'>City</span>
												) : null}
												{unit.formedFrom ? (
													<span className='meta-sm'>from {unit.formedFrom}</span>
												) : null}
											</div>

											{currentMayor(unit) ? (
												<p className='mt-3 text-[13px] leading-5 text-[var(--ink-2)]'>
													<span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
														Mayor{' '}
													</span>
													<span className='font-semibold text-[var(--ink)]'>
														{currentMayor(unit)}
													</span>
												</p>
											) : null}

											<dl className='mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-[var(--ink-3)]'>
												<div className='flex gap-1.5'>
													<dt className='sr-only'>Population</dt>
													<dd className='num font-semibold text-[var(--ink)]'>
														{formatNumber(unit.population)}
													</dd>
													<span aria-hidden='true'>people</span>
												</div>
												<div className='flex gap-1.5'>
													<dt className='sr-only'>Barangays</dt>
													<dd className='num font-semibold text-[var(--ink)]'>
														{unit.barangays.length}
													</dd>
													<span aria-hidden='true'>barangays</span>
												</div>
											</dl>
										</Link>
									</StaggerItem>
								))}
							</Stagger>
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
