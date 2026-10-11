import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { notFound, redirect } from 'next/navigation'
import {
	LguMasthead,
	LguSourceNote,
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
	lguAreas,
	lguProvinces,
	personName,
} from '@betterbarmm/lgu-data'
import { LguFinances } from '../_components/lgu-finances'
import { LguDisclosure } from '../_components/lgu-disclosure'
import { NtaChart } from '../_components/nta-chart'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'

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

const H2 = 'scroll-mt-32 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'

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
	const ntaYear = finances.years.at(-1)!
	const nta = (row(finances, province.slug, ntaYear)?.nta as number | null | undefined) ?? null
	const area = lguAreas.find((one) => one.slug === province.slug)
	const towns = province.municipalities.length - cities.length
	const units = [
		cities.length ? `${cities.length} ${cities.length === 1 ? 'city' : 'cities'}` : null,
		towns ? `${towns} ${towns === 1 ? 'municipality' : 'municipalities'}` : null,
	]
		.filter(Boolean)
		.join(' and ')
	const lead = [
		`${province.name} is a ${province.kind === 'Province' ? 'province' : 'part'} of the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)${capital ? `, with its capital at ${capital.name}` : ''}.`,
		province.population != null
			? `It had ${formatNumber(province.population)} people at the 2024 census${regionShare != null ? `, ${regionShare}% of the region’s` : ''}${change != null ? `, ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% since 2020` : ''}.`
			: null,
		`It has ${units}, with ${formatNumber(province.barangayCount)} barangays between them${province.areaKm2 ? `, across ${formatArea(province.areaKm2)}` : ''}.`,
		area ? `Its voters elect ${area.seats} of the 80 members of the Bangsamoro Parliament.` : null,
		biggest.length > 1 ? `Its most populous are ${biggest.slice(0, -1).map((unit) => unit.name).join(', ')} and ${biggest.at(-1)!.name}.` : null,
		nta ? `In FY ${ntaYear} the provincial government received ${nta >= 1e9 ? `₱${(nta / 1e9).toFixed(2)} billion` : `₱${(nta / 1e6).toFixed(1)} million`} in National Tax Allotment, as it reported to BLGF.` : null,
	]
		.filter(Boolean)
		.join(' ')

	// Who governs it now: the top of the current term's canvass for each
	// single-seat office. The board's seat counts are not on record, so its
	// winners cannot be told from the rest and it is left to Local officials.
	const termId = lguData.officials?.currentTermId
	const current = termId ? province.officials?.[termId] : undefined
	const termLabel = termId ? `${termId.replace('-', '–')} term` : ''
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
				kicker={`${province.kind} · Bangsamoro`}
				name={province.name}
			>
				<div className='mt-7 max-w-[58rem] space-y-4 text-[15px] leading-7 text-[var(--ink-2)]'>
					<p>{lead}</p>
					{/* The directory's own note on the province; the region guide's where it has none. */}
					{province.note || area?.note ? <p>{province.note || area?.note}</p> : null}
				</div>
			</LguMasthead>

			<div className='bb-container bb-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-24'>
				{/* ---- The province, read down: its towns, then its own records ---- */}
				<div className='min-w-0'>
					<section>
						<h2 id='units' className={H2}>
							<span className='num text-[var(--ink-3)]'>{province.municipalities.length}</span>{' '}
							{cities.length > 0 ? 'Cities and Municipalities' : 'Municipalities'}
						</h2>
						<ul className='mt-6 columns-2 gap-x-8 sm:columns-3 lg:columns-4'>
							{[...province.municipalities]
								.sort((x, y) => x.name.localeCompare(y.name))
								.map((unit) => (
									<li key={unit.slug} className='break-inside-avoid border-b border-[var(--rule-soft)]'>
										<Link
											href={`/${province.slug}/${unit.slug}`}
											className='group flex items-center justify-between gap-2 py-2.5 text-[15px] text-[var(--ink)] transition hover:text-[var(--accent)]'
										>
											<span className='min-w-0'>
												{unit.name}
												{unit.isCapital ? <span className='ml-2 text-[12px] text-[var(--ink-3)]'>Capital</span> : null}
											</span>
											<ArrowRightIcon
												size={13}
												className='shrink-0 text-[var(--ink-mute)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
												aria-hidden='true'
											/>
										</Link>
									</li>
								))}
						</ul>
					</section>

					{/* The provincial government's own NTA, year by year. */}
					<section className='mt-20'>
						<NtaChart unitKey={province.slug} />
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
					<dl>
						{[
							{
								label: 'Population (2024)',
								value: formatNumber(province.population),
								detail: change != null ? `${change > 0 ? '+' : ''}${change}% since the 2020 census` : null,
							},
							{
								label: cities.length > 0 ? 'Cities and municipalities' : 'Municipalities',
								value: String(province.municipalities.length),
								detail:
									biggest.length > 0 && province.municipalities.length > 1
										? `Largest: ${biggest.map((unit) => unit.name).join(', ')}`
										: null,
							},
							{ label: 'Barangays', value: formatNumber(province.barangayCount), detail: null },
							{
								label: 'Land area',
								value: formatArea(province.areaKm2),
								detail: density(province) != null ? `${formatNumber(density(province))} people per km²` : null,
							},
							...(regionShare != null
								? [
										{
											label: 'Share of BARMM’s people',
											value: `${regionShare}%`,
											detail: `${formatNumber(province.population)} of the region’s ${formatNumber(lguData.totals.population)}`,
										},
									]
								: []),
						].map((stat) => (
							<div key={stat.label} className='border-b border-[var(--rule)] py-5 first:pt-0'>
								<dt className='bb-label'>{stat.label}</dt>
								<dd className='num mt-2 text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
									{stat.value}
								</dd>
								{stat.detail ? <dd className='mt-1.5 text-[12.5px] leading-5 text-[var(--ink-3)]'>{stat.detail}</dd> : null}
							</div>
						))}
					</dl>

					{officials.length > 0 ? (
						<div className='mt-10'>
							<h2 className='text-[15px] font-semibold text-[var(--ink)]'>Current officials</h2>
							<p className='mt-1 text-[12.5px] text-[var(--ink-3)]'>{termLabel}</p>
							<dl className='mt-4'>
								{officials.map((official) => (
									<div key={official.position} className='border-b border-[var(--rule)] py-4'>
										<dt className='bb-label'>{official.position}</dt>
										<dd className='mt-1.5 text-[15px] font-semibold text-[var(--ink)]'>{official.name}</dd>
										{official.party ? <dd className='mt-0.5 text-[12.5px] text-[var(--ink-3)]'>{official.party}</dd> : null}
									</div>
								))}
							</dl>
							<Link href='/officials' className='rule-link mt-4 inline-block text-[13px]'>
								Every official, every term
							</Link>
						</div>
					) : null}
				</aside>
			</div>

			<div className='bb-container bb-section-bottom'>
				<LguSourceNote />
			</div>
		</>
	)
}
