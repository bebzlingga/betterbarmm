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
import { LguDisclosure } from '../../_components/lgu-disclosure'
import { NtaChart } from '../../_components/nta-chart'
import { LocatorMap } from '../../_components/locator-map'
import { Official } from '../../_components/official'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'
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
	const ntaYear = finances.years.at(-1)!
	const nta = (row(finances, key, ntaYear)?.nta as number | null | undefined) ?? null
	const mayorNow = (() => {
		const term = lguData.officials?.currentTermId
		const top = term ? unit.officials?.[term]?.mayor?.ranked[0] : undefined
		return top ? `${personName(top.name)}${top.party ? ` (${top.party})` : ''}` : null
	})()
	const lead = [
		`${opening(unit, province)} It is divided into ${unit.barangays.length} ${unit.barangays.length === 1 ? 'barangay' : 'barangays'}${unit.areaKm2 ? ` across ${formatArea(unit.areaKm2)}` : ''}.`,
		unit.population != null
			? `It had ${formatNumber(unit.population)} residents at the 2024 census${growth(unit) != null ? `, ${growth(unit)! > 0 ? 'up' : 'down'} ${Math.abs(growth(unit)!)}% since 2020` : ''}.`
			: null,
		mayorNow ? `Its mayor for the ${lguData.officials!.currentTermId.replace('-', '–')} term is ${mayorNow}.` : null,
		nta ? `In FY ${ntaYear} it received ${nta >= 1e9 ? `₱${(nta / 1e9).toFixed(2)} billion` : `₱${(nta / 1e6).toFixed(1)} million`} in National Tax Allotment, as reported to BLGF.` : null,
	]
		.filter(Boolean)
		.join(' ')

	// A share needs something to be a share of: Cotabato City is its whole area.
	const share =
		province.municipalities.length > 1 && unit.population != null && province.population
			? Math.round((unit.population / province.population) * 1000) / 10
			: null
	const stats = [
		{
			label: 'Population (2024)',
			value: formatNumber(unit.population),
			detail: change != null ? `${change > 0 ? '+' : ''}${change}% since the 2020 census` : null,
		},
		{ label: 'Barangays', value: String(unit.barangays.length), detail: null },
		{
			label: 'Land area',
			value: formatArea(unit.areaKm2),
			detail: density(unit) != null ? `${formatNumber(density(unit))} people per km²` : null,
		},
		...(share != null
			? [{ label: `Share of ${province.name}’s people`, value: `${share}%`, detail: null }]
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
					<div className='mt-12 gap-20 text-[15px] leading-7 text-[var(--ink-2)] lg:columns-2 [&>p+p]:mt-4'>
						{history.paragraphs.map((paragraph) => (
							<p key={paragraph.slice(0, 40)}>{paragraph}</p>
						))}
						<p>{lead}</p>
					</div>
				) : (
					<div className='mt-12 max-w-[58rem] space-y-4 text-[15px] leading-7 text-[var(--ink-2)]'>
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

			<div className='bb-container bb-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-28'>
				{/* ---- The town, read down: its barangays, then its own records ---- */}
				<div className='min-w-0'>
					<section>
						<h2 id='barangays' className={H2}>
							<span className='num text-[var(--ink-3)]'>{unit.barangays.length}</span>{' '}
							{unit.barangays.length === 1 ? 'Barangay' : 'Barangays'}
						</h2>
						<ul className='mt-6 columns-2 gap-x-8 sm:columns-3 lg:columns-4'>
							{[...unit.barangays]
								.sort((x, y) => x.name.localeCompare(y.name))
								.map((barangay) => {
									const captain = rosters[barangay.psgc ?? barangay.name]?.punongBarangay?.name
									return (
										<li key={barangay.psgc ?? barangay.name} className='break-inside-avoid border-b border-[var(--rule-soft)] py-2.5'>
											<span className='block text-[15px] font-semibold text-[var(--ink)]'>{barangay.name}</span>
											{captain ? (
												<span className='mt-0.5 block text-[12px] text-[var(--ink-3)]'>{personName(captain)}</span>
											) : null}
										</li>
									)
								})}
						</ul>
						<p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink-3)]'>
							Punong barangay from DILG&rsquo;s directory, read {barangayOfficials.capturedAt}, where it lists one.{' '}
							<a href={barangayOfficials.source.href} target='_blank' rel='noreferrer' className='rule-link'>
								Source
							</a>
						</p>
					</section>

					{/* The town's own NTA, year by year. */}
					<section className='mt-20'>
						<NtaChart unitKey={key} />
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
				</div>

				{/* ---- Beside it: the town in figures, then who governs it ---- */}
				<aside className='order-first lg:order-none'>
					<div className='mb-8'>
						<LocatorMap areaSlug={province.slug} unit={{ psgc: unit.psgc ?? null, name: unit.name }} label={unit.name} />
					</div>
					<dl>
						{stats.map((stat) => (
							<div key={stat.label} className='border-b border-[var(--rule)] py-5 first:pt-0'>
								<dt className='bb-label'>{stat.label}</dt>
								<dd className='num mt-2 text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
									{stat.value}
								</dd>
								{stat.detail ? <dd className='mt-1.5 text-[12.5px] leading-5 text-[var(--ink-3)]'>{stat.detail}</dd> : null}
							</div>
						))}
					</dl>

					{officials.length > 0 || council.length > 0 ? (
						<div className='mt-10'>
							<h2 className='text-[15px] font-semibold text-[var(--ink)]'>Current officials</h2>
							<p className='mt-1 text-[12.5px] text-[var(--ink-3)]'>{termLabel}</p>
							<ul className='mt-4'>
								{officials.map((official) => (
									<Official key={official.position} name={official.name} party={official.party} role={official.position} />
								))}
							</ul>
							{council.length > 0 ? (
								<div className='mt-8'>
									<h3 className='text-[14px] font-semibold text-[var(--ink)]'>{councilName}</h3>
									<ul className='mt-1'>
										{council.map((member) => (
											<Official key={member.name} name={personName(member.name)} party={member.party ?? null} role='Council member' />
										))}
									</ul>
								</div>
							) : null}
							<Link href='/officials' className='rule-link mt-6 inline-block text-[13px]'>
								Every official, every term
							</Link>
						</div>
					) : null}
				</aside>
			</div>

			<section className='bb-container bb-section-bottom'>
				{history ? (
					<p className='mb-8 text-[12.5px] leading-6 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink-3)]'>
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
								<span className='block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									Previous
								</span>
								<span className='mt-1 block truncate text-[15px] font-medium text-[var(--ink)]'>
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
								<span className='block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
									Next
								</span>
								<span className='mt-1 block truncate text-[15px] font-medium text-[var(--ink)]'>
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
