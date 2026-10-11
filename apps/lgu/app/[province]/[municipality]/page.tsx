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
	growth,
	unitClass,
	type LguProvince,
	type LguUnit,
} from '@betterbarmm/lgu-data'
import {
	LguBreadcrumb,
	LguMasthead,
	LguSourceNote,
	LguStat,
} from '../../_components/lgu-parts'
import { lguData, personName } from '@betterbarmm/lgu-data'
import { finances, row } from '@betterbarmm/lgu-data/fiscal'
import { barangayOfficials, rosterCoverage, unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { BarangayList } from '../../_components/barangay-list'
import { LguTabs } from '../../_components/lgu-tabs'
import { LguFinances, LguRecognition } from '../../_components/lgu-finances'
import { LguDisclosure } from '../../_components/lgu-disclosure'
import { NtaChart } from '../../_components/nta-chart'
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

/** The label a unit answers to — used in headings and prose alike. */
function unitKind(unit: LguUnit): 'province' | 'city' | 'municipality' {
	return unit.isCity ? 'city' : 'municipality'
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

/**
 * The answers most visitors came for, from the tabs that hold them in full:
 * who is in office, how the town is classed, what it receives, and whether it
 * has passed the Seal of Good Local Governance. Each row opens its tab.
 */
function AtAGlance({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const key = `${province.slug}/${unit.slug}`
	const term = lguData.officials?.currentTermId
	const canvass = term ? unit.officials?.[term] : undefined
	const mayor = canvass?.mayor?.ranked[0]?.name
	const vice = canvass?.viceMayor?.ranked[0]?.name
	const ntaYear = finances.years.at(-1)!
	const nta = row(finances, key, ntaYear)?.nta as number | null | undefined

	const rows: [string, string, string][] = [
		['Mayor', mayor ? personName(mayor) : 'No canvass on record', '/officials'],
		['Vice-mayor', vice ? personName(vice) : '—', '/officials'],
		[`NTA, FY ${ntaYear}`, nta ? (nta >= 1e9 ? `₱${(nta / 1e9).toFixed(2)} billion` : `₱${(nta / 1e6).toFixed(1)} million`) : '—', '#finances'],
	]

	return (
		<div className='mt-10 border-t border-[var(--ink)]'>
			<h3 className='pt-4 text-[14px] font-semibold text-[var(--ink)]'>At a glance</h3>
			<dl className='mt-2'>
				{rows.map(([label, value, href]) => (
					<a
						key={label}
						href={href}
						className='flex items-baseline justify-between gap-6 border-b border-[var(--rule-soft)] py-3 transition hover:bg-[var(--paper-2)]'
					>
						<dt className='text-[13px] text-[var(--ink-3)]'>{label}</dt>
						<dd className='text-right text-[14px] font-medium text-[var(--ink)]'>{value}</dd>
					</a>
				))}
			</dl>
		</div>
	)
}

function Overview({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const change = growth(unit)
	const roster = rosterCoverage([unit])

	// Naming the area is only worth a row when it is a different place from the
	// unit — Cotabato City is its own area, and "Area: Cotabato City" says
	// nothing on Cotabato City's page.
	// A share needs something to be a share of: Cotabato City is its whole area.
	const share =
		province.municipalities.length > 1 && unit.population != null && province.population
			? Math.round((unit.population / province.population) * 1000) / 10
			: null
	const facts: [string, string][] = [
		...(unit.alsoKnownAs ? ([['Also known as', unit.alsoKnownAs]] as [string, string][]) : []),
		['Population, 2020 census', formatNumber(unit.population2020)],
		...(share != null ? ([[`Share of ${province.name}’s people`, `${share}%`]] as [string, string][]) : []),
		['Captains in DILG’s directory', `${roster.listed} of ${roster.total}`],
		['PSGC code', unit.psgc ?? 'Not yet assigned'],
	]

	return (
		<div>
		<div className='grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16'>
			<div>
				<p className='text-[15px] leading-7 text-[var(--ink-2)]'>
					{opening(unit, province)} It is divided into {unit.barangays.length}{' '}
					{unit.barangays.length === 1 ? 'barangay' : 'barangays'}
					{unit.population != null
						? `, and had ${formatNumber(unit.population)} residents at the 2024 census.`
						: '.'}
				</p>

				{[unit.nameNote, unit.populationNote].filter(Boolean).map((note) => (
					<p
						key={note}
						className='mt-6 max-w-2xl border-l-2 border-[var(--brass)] pl-4 text-[13px] leading-6 text-[var(--ink-2)]'
					>
						{note}
					</p>
				))}

				{unit.formedFrom ? (
					<p className='mt-6 max-w-2xl text-[14.5px] leading-7 text-[var(--ink-2)]'>
						It was constituted from barangays of {unit.formedFrom} in North Cotabato, which voted to
						join BARMM in the 2019 plebiscite. The municipality was created by Bangsamoro Autonomy
						Act and ratified by plebiscite on April 13, 2024 — recent enough that national
						statistics for it are not yet published separately.
					</p>
				) : null}

				<AtAGlance unit={unit} province={province} />
			</div>

			<div>
				<div className='grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8'>
					<LguStat
						value={formatNumber(unit.population)}
						count={unit.population}
						label='Population (2024)'
					/>
					<LguStat value={formatArea(unit.areaKm2)} label='Land area' />
					<LguStat
						value={density(unit) == null ? '—' : formatNumber(density(unit))}
						count={density(unit)}
						label='People per km²'
					/>
					<LguStat
						value={change == null ? '—' : `${change > 0 ? '+' : ''}${change}%`}
						label='Change since 2020'
					/>
				</div>

				<dl className='mt-10'>
					{facts.map(([label, value]) => (
						<div
							key={label}
							className='flex items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] py-2.5'
						>
							<dt className='text-[13px] text-[var(--ink-3)]'>{label}</dt>
							<dd className='text-right text-[14px] font-medium text-[var(--ink)]'>{value}</dd>
						</div>
					))}
				</dl>

				{/* Services and charges are set by the Code and read the same on all
				    108 pages, so they live once, on What each level does. */}
				<a
					href='/what-each-level-does#services'
					className='mt-8 block border-t border-[var(--rule)] pt-4 text-[14px] leading-6 text-[var(--ink-2)] hover:text-[var(--accent)]'
				>
					What a {unitKind(unit)} must provide, and the most it may charge you, is set by the Bangsamoro
					Local Governance Code — the same for every {unitKind(unit)}. <span className='font-semibold text-[var(--ink)] underline underline-offset-4'>See what each level does</span>
				</a>
			</div>
		</div>

		{/* How the town is classed, audited and recognised — about the unit, not
		    its money, so here rather than under Finances (user decision). */}
		<div className='mt-14'>
			<LguRecognition unitKey={`${province.slug}/${unit.slug}`} />
		</div>
		</div>
	)
}

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
				<NtaChart unitKey={`${province.slug}/${unit.slug}`} />
			</LguMasthead>

			<section className='bb-container bb-section-bottom'>
				<LguTabs
					tabs={[
						{
							id: 'overview',
							label: 'Overview',
							panel: <Overview unit={unit} province={province} />,
						},
						{
							id: 'barangays',
							label: 'Barangays',
							badge: unit.barangays.length,
							panel: (
								<BarangayList
									barangays={unit.barangays}
									rosters={unitRosters(unit.slug)}
									capturedAt={barangayOfficials.capturedAt}
									sourceHref={barangayOfficials.source.href}
								/>
							),
						},
						{
							id: 'finances',
							label: 'Finances',
							panel: <LguFinances unitKey={`${province.slug}/${unit.slug}`} name={unit.name} recognition={false} />,
						},
						{
							id: 'disclosure',
							label: 'Full disclosure',
							panel: <LguDisclosure unitKey={`${province.slug}/${unit.slug}`} name={unit.name} />,
						},
					]}
				/>

				<LguSourceNote className='mt-14' />

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
