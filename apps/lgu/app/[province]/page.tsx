import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { notFound, redirect } from 'next/navigation'
import {
	CARD,
	LguMasthead,
	LguSourceNote,
} from '../_components/lgu-parts'
import {
	density,
	findProvince,
	formatNumber,
	growth,
	areaHref,
	isSingleUnitArea,
	largestUnits,
	lguData,
	areaHistory,
	boardSeatsSource,
	boardWinners,
	lguAreas,
	lguProvinces,
	personName,
} from '@betterbarmm/lgu-data'
import { LguFinances } from '../_components/lgu-finances'
import { LguDisclosure } from '../_components/lgu-disclosure'
import { NtaChart } from '../_components/nta-chart'
import { LgsfReceived } from '../_components/lgsf-received'
import { LocatorMap } from '../_components/locator-map'
import { Official } from '../_components/official'
import { houseSeats, provinceSeats } from '@betterbarmm/lgu-data/house-seats'

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

const H2 = 'scroll-mt-32 dv-title'

export default async function ProvincePage({ params }: { params: Promise<{ province: string }> }) {
	const { province: slug } = await params
	const province = findProvince(slug)
	if (!province) notFound()
	if (isSingleUnitArea(province)) redirect(areaHref(province))

	// The terms before 2025, which are winners only — see the history package.

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

	// The opening paragraph, as an encyclopedia would begin: what the place is,
	// then its people, land and units, every figure the directory's own.
	const capital = province.municipalities.find((unit) => unit.isCapital)
	const area = lguAreas.find((one) => one.slug === province.slug)
	const towns = province.municipalities.length - cities.length
	const units = [
		cities.length ? `${cities.length} ${cities.length === 1 ? 'city' : 'cities'}` : null,
		towns ? `${towns} ${towns === 1 ? 'municipality' : 'municipalities'}` : null,
	]
		.filter(Boolean)
		.join(' and ')
	// Two sentences of the directory's own facts; the figures sit just below.
	const lead = [
		`${province.name} is a ${province.kind === 'Province' ? 'province' : 'part'} of BARMM${capital ? ` with its capital at ${capital.name}` : ''}, and elects ${area?.seats ?? '—'} of the 80 members of the Bangsamoro Parliament.`,
		province.population != null
			? `It had ${formatNumber(province.population)} people at the 2024 census, in ${units} and ${formatNumber(province.barangayCount)} barangays.`
			: `It has ${units} and ${formatNumber(province.barangayCount)} barangays.`,
	].join(' ')

	// Who governs it now: the top of the current term's canvass for each
	// single-seat office. The board's seat counts are not on record, so its
	// winners cannot be told from the rest and it is left to Local officials.
	const termId = lguData.officials?.currentTermId
	const current = termId ? province.officials?.[termId] : undefined
	const termLabel = termId ? `${termId.replace('-', '–')} term` : ''
	const board = boardWinners(province.slug, current?.board)
	const history = areaHistory(province.slug)
	const officials = (
		[
			['Governor', current?.governor],
			['Vice-Governor', current?.viceGovernor],
		] as const
	).flatMap(([position, contest]) => {
		const top = contest?.ranked[0]
		return top ? [{ position, name: personName(top.name), party: top.party ?? null }] : []
	})

	return (
		<>
			<LguMasthead
				kicker={[province.kind, capital ? `capital ${capital.name}` : null, area?.seats ? `${area.seats} seats in Parliament` : null].filter(Boolean).join(' · ')}
				name={province.name}
				note={history ? (history.summary ?? history.paragraphs.join(' ')) : lead}
				figures={[
						{
							label: 'Population (2024)',
							value: formatNumber(province.population),
							detail: change != null ? `${change > 0 ? '+' : ''}${change}% since the 2020 census` : undefined,
						},
						{
							label: cities.length > 0 ? 'Cities and municipalities' : 'Municipalities',
							value: String(province.municipalities.length),
							detail: biggest.length > 0 && province.municipalities.length > 1 ? `Largest: ${biggest.map((unit) => unit.name).join(', ')}` : undefined,
						},
						{ label: 'Barangays', value: formatNumber(province.barangayCount) },
						{
							label: 'Land area',
							// Whole square kilometres: the band's figures are large, and the decimals would not fit.
							value: province.areaKm2 != null ? `${formatNumber(Math.round(province.areaKm2))} km²` : '—',
							detail: density(province) != null ? `${formatNumber(density(province))} people per km²` : undefined,
						},
						...(regionShare != null
							? [{ label: 'Share of BARMM’s people', value: `${regionShare}%`, detail: `Of the region’s ${formatNumber(lguData.totals.population)}` }]
							: []),
					]} />

			<div className='bb-container bb-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-28'>
				{/* ---- The province, read down: its towns, then its own records ---- */}
				<div className='min-w-0'>
					<section>
						<h2 id='units' className={H2}>
							{cities.length > 0 ? 'Cities and municipalities' : 'Municipalities'}{' '}
							<span className='num text-[var(--ink-mute)]'>· {province.municipalities.length}</span>
						</h2>
						<ul className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
							{[...province.municipalities]
								.sort((x, y) => x.name.localeCompare(y.name))
								.map((unit) => (
									<li key={unit.slug} className='flex'>
										<Link href={`/${province.slug}/${unit.slug}`} className={`${CARD} w-full flex-row items-center gap-3 px-4 py-3.5`}>
											<span className='min-w-0 flex-1'>
												<span className='flex items-center gap-2'>
													<span className='truncate text-[0.9375rem] font-bold tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]'>{unit.name}</span>
													{unit.isCapital ? <span className='shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>Capital</span> : null}
													{unit.isCity ? <span className='shrink-0 rounded-full bg-[var(--paper-2)] px-2 py-0.5 font-mono text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-2)]'>City</span> : null}
												</span>
												<span className='num mt-0.5 block text-[0.75rem] text-[var(--ink-3)]'>
													{unit.population != null ? `${formatNumber(unit.population)} people · ` : ''}
													{unit.barangays.length} barangays
												</span>
											</span>
											<ArrowRightIcon size={14} weight='bold' className='shrink-0 text-[var(--ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]' aria-hidden='true' />
										</Link>
									</li>
								))}
						</ul>
					</section>

					{/* The provincial government's own NTA, year by year. */}
					<section className='mt-20'>
						<NtaChart unitKey={province.slug} />
					</section>

					<section className='mt-20'>
						<LgsfReceived unitKey={province.slug} name={`the provincial government of ${province.name}`} />
					</section>

					{province.kind === 'Province' ? (
						<>
							<section className='mt-20'>
								<h2 id='disclosure' className={H2}>
									Full disclosure
								</h2>
								<div className='mt-6'>
									<LguDisclosure unitKey={province.slug} name={`the provincial government of ${province.name}`} />
								</div>
							</section>

							<section className='mt-20'>
								<h2 id='finances' className={H2}>
									Finances
								</h2>
								<div className='mt-6'>
									<LguFinances unitKey={province.slug} name={`the provincial government of ${province.name}`} />
								</div>
							</section>
						</>
					) : null}

				</div>

				{/* ---- Beside it: the province in figures, then who governs it ---- */}
				<aside className='order-first lg:order-none'>
					<div className='mb-4 overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)]'>
						<LocatorMap areaSlug={province.slug} label={province.name} />
					</div>

					{officials.length > 0 ? (
						<div className='rounded-[var(--dv-r)] border border-[var(--rule)] p-5'>
							<h2 className='text-[0.9375rem] font-semibold text-[var(--ink)]'>Current officials</h2>
							<p className='mt-1 text-[0.78125rem] text-[var(--ink-3)]'>{termLabel}</p>
							<ul className='mt-4'>
								{officials.map((official) => (
									<Official key={official.position} name={official.name} party={official.party} role={official.position} />
								))}
							</ul>

							{board ? (
								<div className='mt-8'>
									<h3 className='text-[0.875rem] font-semibold text-[var(--ink)]'>Sangguniang Panlalawigan</h3>
									{board.districts.map(({ district, members }) => (
										<div key={district} className='mt-4'>
											<p className='bb-label'>{district}</p>
											<ul className='mt-1'>
												{members.map((member) => (
													<Official
														key={member.name}
														name={personName(member.name)}
														party={member.party ?? null}
														role='Board member'
													/>
												))}
											</ul>
										</div>
									))}
									{board.note ? <p className='mt-4 text-[0.75rem] leading-5 text-[var(--ink-3)]'>{board.note}</p> : null}
									<p className='mt-3 text-[0.75rem] leading-5 text-[var(--ink-3)]'>
										Seats per district from{' '}
										<a href={boardSeatsSource.href} target='_blank' rel='noreferrer' className='rule-link'>
											{boardSeatsSource.label}
										</a>
										.
									</p>
								</div>
							) : null}

							{provinceSeats(province.slug).length > 0 ? (
								<div className='mt-8'>
									<h3 className='text-[0.875rem] font-semibold text-[var(--ink)]'>House of Representatives</h3>
									<ul className='mt-1'>
										{provinceSeats(province.slug).map((seat) => (
											<Official
												key={seat.district}
												name={personName(seat.name)}
												party={seat.party}
												role={`Representative, ${seat.district === 'Lone district' ? 'lone district' : seat.district}`}
											/>
										))}
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

			<div className='bb-container bb-section-bottom'>
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
			</div>
		</>
	)
}
