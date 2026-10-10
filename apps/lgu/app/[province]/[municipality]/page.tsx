import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
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
	officialsTerms,
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
import { provinceHistory, tookOffice, unitHistory } from '@betterbarmm/lgu-data/history'
import { barangayOfficials, rosterCoverage, unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
import { BarangayList } from '../../_components/barangay-list'
import {
	HeldOffice,
	MultiSeat,
	NoCanvass,
	OfficeLineage,
	Reconstructed,
	SingleSeat,
	UnitRollPanel,
} from '../../_components/lgu-officials'
import { LguTabs } from '../../_components/lgu-tabs'
import { LguFinances, LguRecognition } from '../../_components/lgu-finances'
import { LguTermPicker } from '../../_components/lgu-term-picker'
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
		['Mayor', mayor ? personName(mayor) : 'No canvass on record', '#officials'],
		['Vice-mayor', vice ? personName(vice) : '—', '#officials'],
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

/**
 * The town's National Tax Allotment year by year: one series, so one hue and
 * no legend, the figure printed over each column and the exact one on hover.
 * A year with no report is drawn as a gap with a dash, never as zero.
 */
function NtaChart({ unitKey }: { unitKey: string }) {
	const years = finances.years.map((year) => ({
		year,
		nta: (row(finances, unitKey, year)?.nta as number | null | undefined) ?? null,
	}))
	if (!years.some((one) => one.nta)) return null
	const top = Math.max(...years.map((one) => one.nta ?? 0))
	const short = (value: number) =>
		value >= 1e9 ? `₱${(value / 1e9).toFixed(2)}B` : `₱${(value / 1e6).toFixed(1)}M`
	// Ten columns on a phone leave about 34px each: no peso sign, whole millions.
	const tiny = (value: number) => (value >= 1e9 ? `${(value / 1e9).toFixed(2)}B` : `${Math.round(value / 1e6)}M`)

	return (
		<figure className='m-0 mt-10'>
			<div className='grid h-44 items-end gap-1.5 sm:gap-4' style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
				{years.map(({ year, nta }) => (
					// The label rides on top of its bar; the bar's height is a share of
					// the track under the label row, so the tallest one never overruns.
					<div key={year} className='flex h-full flex-col items-center justify-end pt-6'>
						<div className='flex w-full flex-1 flex-col items-center justify-end'>
							<span className='num mb-1.5 whitespace-nowrap text-[9.5px] text-[var(--ink-2)] sm:text-[12.5px]'>
								<span className='sm:hidden'>{nta ? tiny(nta) : '—'}</span>
								<span className='hidden sm:inline'>{nta ? short(nta) : '—'}</span>
							</span>
							{nta ? (
								<div
									className='w-full max-w-16'
									style={{
										height: `calc(${(nta / top) * 100}% - 1.5rem)`,
										minHeight: '2px',
										// One hue, solid at the top and fading to the baseline.
										background: 'linear-gradient(to top, transparent, var(--accent))',
									}}
									title={`FY ${year}: ₱${nta.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
								/>
							) : (
								<div className='h-px w-full max-w-16 bg-[var(--rule)]' aria-hidden='true' />
							)}
						</div>
					</div>
				))}
			</div>
			<div className='grid gap-1.5 border-t border-[var(--rule)] pt-2 sm:gap-4' style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
				{years.map(({ year }) => (
					<span key={year} className='num text-center text-[10.5px] text-[var(--ink-3)] sm:text-[12px]'>
						<span className='sm:hidden'>’{String(year).slice(2)}</span>
						<span className='hidden sm:inline'>{year}</span>
					</span>
				))}
			</div>
			<figcaption className='mt-4 flex flex-wrap items-baseline justify-between gap-2'>
				<span className='text-[12.5px] font-semibold text-[var(--ink)]'>National Tax Allotment, by year</span>
				<span className='text-[11px] text-[var(--ink-3)]'>
					Reported to BLGF. FY {finances.years.at(-1)} is preliminary.
				</span>
			</figcaption>
		</figure>
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
				<p className='text-[1.15rem] font-medium leading-[1.55] tracking-[-0.01em] text-[var(--ink)] sm:text-[1.35rem]'>
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
				    108 pages, so they live once, on How it works. */}
				<a
					href='/how-it-works#services'
					className='mt-8 block border-t border-[var(--rule)] pt-4 text-[14px] leading-6 text-[var(--ink-2)] hover:text-[var(--accent)]'
				>
					What a {unitKind(unit)} must provide, and the most it may charge you, is set by the Bangsamoro
					Local Governance Code — the same for every {unitKind(unit)}. <span className='font-semibold text-[var(--ink)] underline underline-offset-4'>See How it works</span>
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

function Officials({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	// Three records, in descending order of what they can tell you. `officials`
	// is COMELEC's own 2025 canvass. `history` is OpenHalalan: a reconstructed
	// canvass where the vote counts survive, a roll of winners where they do
	// not. Each term draws from the best it has, and the panels differ so a
	// reader can see which they are looking at.
	const history = unitHistory(unit.slug)
	const provincialHistory = provinceHistory(province.slug)

	return (
		<div>
			{/* The whole run of the office, before the term-by-term detail — the
			    question most readers arrive with is who has run this town, and
			    that is not answerable from any single term. */}
			<div className='mb-14'>
				<OfficeLineage
					terms={officialsTerms}
					holders={Object.fromEntries(
						officialsTerms.map((term) => [
							term.id,
							unit.officials?.[term.id]?.mayor?.ranked[0] ??
								tookOffice(history[term.id], 'mayor'),
						]),
					)}
				/>
			</div>

			<LguTermPicker
				panels={officialsTerms
					.map((term) => {
						const record = history[term.id]
						const provincial = province.officials?.[term.id]
						const provincialRecord = provincialHistory[term.id]

						// The 2025 canvass, or a reconstructed one — the same shape
						// either way, so the same components draw it.
						const canvass =
							unit.officials?.[term.id] ??
							(record?.kind === 'canvass' ? record : undefined)

						const above =
							provincial?.governor || provincial?.viceGovernor ? (
								<>
									<SeatsAbove
										label={`And for ${province.name} as a whole`}
										governor={
											provincial.governor ? (
												<SingleSeat title='Provincial Governor' contest={provincial.governor} />
											) : null
										}
										viceGovernor={
											provincial.viceGovernor ? (
												<SingleSeat
													title='Provincial Vice-Governor'
													contest={provincial.viceGovernor}
												/>
											) : null
										}
										href={`/${province.slug}#officials`}
									/>
								</>
							) : provincialRecord?.governor || provincialRecord?.viceGovernor ? (
								<SeatsAbove
									label={`And for ${provincialRecord.undivided ?? province.name} as a whole`}
									governor={
										provincialRecord.kind === 'canvass' ? (
											provincialRecord.governor ? (
												<SingleSeat
													title='Provincial Governor'
													contest={provincialRecord.governor}
												/>
											) : null
										) : provincialRecord.governor ? (
											<HeldOffice title='Provincial Governor' holder={provincialRecord.governor} />
										) : null
									}
									viceGovernor={
										provincialRecord.kind === 'canvass' ? (
											provincialRecord.viceGovernor ? (
												<SingleSeat
													title='Provincial Vice-Governor'
													contest={provincialRecord.viceGovernor}
												/>
											) : null
										) : provincialRecord.viceGovernor ? (
											<HeldOffice
												title='Provincial Vice-Governor'
												holder={provincialRecord.viceGovernor}
											/>
										) : null
									}
									href={`/${province.slug}#officials`}
								/>
							) : (
								/* No provincial row is not an omission here. Cotabato City's
								   charter bars it from the provincial ballot, and the Special
								   Geographic Area has no provincial government of its own —
								   both are facts about the ballot, and a page that just showed
								   nothing would read as a gap in the record. */
								<div className='mt-12 border-t border-[var(--rule)] pt-8'>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
										And above the {unitKind(unit)}
									</p>
									<p className='mt-4 max-w-2xl text-[13.5px] leading-7 text-[var(--ink-2)]'>
										{province.kind === 'City'
											? `${unit.name} is an independent component city. Its charter bars its voters from electing a governor, a vice-governor or a provincial board, so its ballot ends at the city — the next office above it is the Bangsamoro Parliament.`
											: `The Special Geographic Area is not a province and elects no governor, vice-governor or provincial board. ${unit.name} votes for its own officials and, separately, for the Bangsamoro Parliament.`}
									</p>
								</div>
							)

						if (canvass?.mayor || canvass?.viceMayor || canvass?.council) {
							return {
								id: term.id,
								node: (
									<div>
										{term.status === 'canvass' ? <Reconstructed note={term.note} /> : null}
										<div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
											{canvass.mayor ? <SingleSeat title='Mayor' contest={canvass.mayor} /> : null}
											{canvass.viceMayor ? (
												<SingleSeat title='Vice-Mayor' contest={canvass.viceMayor} />
											) : null}
										</div>
										{canvass.council ? (
											<div className='mt-12'>
												<MultiSeat
													title={unit.isCity ? 'Sangguniang Panlungsod' : 'Sangguniang Bayan'}
													contests={canvass.council}
												/>
											</div>
										) : null}
										{above}
									</div>
								),
							}
						}

						if (record?.kind === 'roll' && (record.mayor || record.viceMayor || record.council)) {
							return {
								id: term.id,
								node: (
									<div>
										<UnitRollPanel roll={record} isCity={unit.isCity} note={term.note} />
										{above}
									</div>
								),
							}
						}

						return null
					})
					.filter((panel) => panel !== null)}
				empty={<NoCanvass name={unit.name} />}
			/>

			{/* Which posts exist at each rung is set by law, not by the town, so it
			    reads the same on all 108 of these pages. It lives on How it works
			    now; what belongs here is the canvass above, and a way through
			    to the general answer. */}
			<div className='mt-14 grid gap-6 border-t border-[var(--brass-line)] pt-6 sm:grid-cols-2 sm:gap-10'>
				<Link href='/how-it-works#offices' className='group flex items-start justify-between gap-4'>
					<span>
						<span className='block text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
							The offices, and who fills them
						</span>
						<span className='mt-1.5 block text-[12.5px] leading-6 text-[var(--ink-3)]'>
							Every elected and appointed post a {unitKind(unit)} has, and the barangay posts
							underneath it, with what each is paid. Set by the Bangsamoro Local Governance
							Code, so the structure is the same everywhere.
						</span>
					</span>
					<ArrowUpRightIcon
						className='mt-0.5 size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
						aria-hidden='true'
					/>
				</Link>

				<Link href='/how-it-works#where-to-look' className='group flex items-start justify-between gap-4'>
					<span>
						<span className='block text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
							Where to find the current names
						</span>
						<span className='mt-1.5 block text-[12.5px] leading-6 text-[var(--ink-3)]'>
							Anyone who took office after the 2025 canvass, and the barangays DILG has no
							roster for, are held by the offices that publish them.
						</span>
					</span>
					<ArrowUpRightIcon
						className='mt-0.5 size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
						aria-hidden='true'
					/>
				</Link>
			</div>
		</div>
	)
}

/**
 * The provincial offices, named on a town's page.
 *
 * A reader on a town page should not have to climb a level to find out who
 * the governor was in the term they are looking at.
 */
function SeatsAbove({
	label,
	governor,
	viceGovernor,
	href,
}: {
	label: string
	governor: React.ReactNode
	viceGovernor: React.ReactNode
	href: string
}) {
	return (
		<div className='mt-12 border-t border-[var(--rule)] pt-8'>
			<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
				{label}
			</p>
			<div className='mt-5 grid gap-10 lg:grid-cols-2 lg:gap-16'>
				{governor}
				{viceGovernor}
			</div>
			<Link
				href={href}
				className='mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
			>
				Provincial board and the full provincial canvass
				<span aria-hidden='true'>&rarr;</span>
			</Link>
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

			<section className='bb-container bb-section-bottom pt-12'>
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
							id: 'officials',
							label: 'Officials',
							panel: <Officials unit={unit} province={province} />,
						},
						{
							id: 'finances',
							label: 'Finances',
							panel: <LguFinances unitKey={`${province.slug}/${unit.slug}`} name={unit.name} recognition={false} />,
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
