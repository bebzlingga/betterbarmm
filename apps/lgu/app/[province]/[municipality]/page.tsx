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
	ShareBar,
} from '../../_components/lgu-parts'
import { LEGAL_BASIS, LOCAL_CHARGES, SERVICES } from '@betterbarmm/lgu-data'
import { provinceHistory, tookOffice, unitHistory } from '@betterbarmm/lgu-data/history'
import { barangayOfficials, unitRosters } from '@betterbarmm/lgu-data/barangay-officials'
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
import { LguTermPicker } from '../../_components/lgu-term-picker'
import { Rise } from '@betterbarmm/editorial'
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

function Overview({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const change = growth(unit)

	// Naming the area is only worth a row when it is a different place from the
	// unit — Cotabato City is its own area, and "Area: Cotabato City" says
	// nothing on Cotabato City's page.
	const facts: [string, string][] = [
		...(province.name === unit.name
			? []
			: ([[province.kind === 'Province' ? 'Province' : 'Area', province.name]] as [
					string,
					string,
				][])),
		['Classification', unitClass(unit)],
		...(unit.alsoKnownAs ? ([['Also known as', unit.alsoKnownAs]] as [string, string][]) : []),
		['Barangays', String(unit.barangays.length)],
		['PSGC code', unit.psgc ?? 'Not yet assigned'],
	]

	return (
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

				<dl className='mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2'>
					{facts.map(([label, value]) => (
						<div
							key={label}
							className='flex items-baseline justify-between gap-4 border-b border-[var(--rule-soft)] py-2.5'
						>
							<dt className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
								{label}
							</dt>
							<dd className='text-right text-[13.5px] font-medium text-[var(--ink)]'>{value}</dd>
						</div>
					))}
				</dl>
			</div>

			<div>
				<div className='grid gap-x-8 gap-y-8 sm:grid-cols-2'>
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

				<div className='bb-plate mt-10 p-6'>
					<p className='bb-label'>Governed under</p>
					<ul className='mt-3'>
						{LEGAL_BASIS.map((law) => (
							<li
								key={law.href}
								className='border-t border-[var(--rule-soft)] py-3 first:border-t-0'
							>
								<a
									href={law.href}
									target='_blank'
									rel='noreferrer'
									className='group flex items-start justify-between gap-3'
								>
									<span>
										<span className='block text-[13.5px] font-medium leading-5 text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
											{law.label}
										</span>
										<span className='mt-1 block text-[12px] leading-5 text-[var(--ink-3)]'>
											{law.note}
										</span>
									</span>
									<ArrowUpRightIcon
										className='mt-0.5 size-3.5 shrink-0 text-[var(--ink-3)]'
										aria-hidden='true'
									/>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}

function Demographics({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const change = growth(unit)

	// A share is a comparison, and a unit that is the whole of its area has
	// nothing to compare itself with — Cotabato City was reading "Cotabato
	// City's share of Cotabato City: 100%".
	const alone = province.municipalities.length === 1
	const share =
		!alone && unit.population != null && province.population
			? Math.round((unit.population / province.population) * 1000) / 10
			: null

	const rows: [string, string][] = [
		['Population, 2024 census', formatNumber(unit.population)],
		['Population, 2020 census', formatNumber(unit.population2020)],
		[
			'Change, 2020 to 2024',
			change == null
				? '—'
				: `${change > 0 ? '+' : ''}${change}% (${formatNumber(
						unit.population != null && unit.population2020 != null
							? unit.population - unit.population2020
							: null,
					)} people)`,
		],
		['Land area', formatArea(unit.areaKm2)],
		['Population density', density(unit) == null ? '—' : `${formatNumber(density(unit))} per km²`],
		['Barangays', String(unit.barangays.length)],
		[
			'Average barangay population',
			unit.population == null
				? '—'
				: formatNumber(Math.round(unit.population / unit.barangays.length)),
		],
	]

	if (!alone) rows.push([`Share of ${province.name}`, share == null ? '—' : `${share}%`])

	return (
		<div className='grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16'>
			<div>
				{/* The one figure in the table that is a comparison rather than a
				    measurement, drawn rather than printed. A town that is a third of
				    its province and one that is a thirtieth are different kinds of
				    place, and "31%" in a column of rows does not say so nearly as
				    fast as a bar that is a third full. */}
				{share != null ? (
					<div className='mb-10'>
						<ShareBar
							share={share}
							label={`${unit.name}'s share of ${province.name}`}
							ofLabel={`The rest of ${province.name}`}
						/>
					</div>
				) : null}

				<h3 className='bb-label'>The record</h3>
				<dl className='mt-4'>
					{rows.map(([label, value]) => (
						<div
							key={label}
							className='flex items-baseline justify-between gap-6 border-b border-[var(--rule-soft)] py-3'
						>
							<dt className='text-[13.5px] text-[var(--ink-2)]'>{label}</dt>
							<dd className='num text-right text-[14px] font-medium text-[var(--ink)]'>{value}</dd>
						</div>
					))}
				</dl>
			</div>

			<div>
				<h3 className='bb-label'>Reading it</h3>
				<div className='mt-5 space-y-4 text-[13.5px] leading-7 text-[var(--ink-2)]'>
					<p>
						Population is the count as of July 1, 2024, the reference date of the 2024 Census of
						Population. The 2020 figure is from the census before it, so the change covers 4 years
						rather than a single year.
					</p>
					<p>
						Density is the census population over the land area on record. It is a flat average: a
						coastal town whose people all live along one road will read the same as one spread
						evenly across its hills.
					</p>
					<p>
						Average barangay population divides the total across every barangay equally, which no
						municipality actually does — it is useful for comparing units, not for describing one.
					</p>
				</div>
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
			    reads the same on all 108 of these pages. It lives on the workspace
			    home now; what belongs here is the canvass above, and a way through
			    to the general answer. */}
			<div className='mt-14 grid gap-6 border-t border-[var(--brass-line)] pt-6 sm:grid-cols-2 sm:gap-10'>
				<Link href='/#offices' className='group flex items-start justify-between gap-4'>
					<span>
						<span className='block text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
							The offices, and who fills them
						</span>
						<span className='mt-1.5 block text-[12.5px] leading-6 text-[var(--ink-3)]'>
							Every elected and appointed post a {unitKind(unit)} has, and the barangay posts
							underneath it, with what each is paid. Set by the Bangsamoro Local Governance
							Code, so the ladder is the same everywhere.
						</span>
					</span>
					<ArrowUpRightIcon
						className='mt-0.5 size-3.5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
						aria-hidden='true'
					/>
				</Link>

				<Link href='/#where-to-look' className='group flex items-start justify-between gap-4'>
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

function Services({ unit }: { unit: LguUnit }) {
	return (
		<div>
			<div className='max-w-3xl'>
				<h3 className='bb-display-sm text-[var(--ink)]'>
					What a {unit.isCity ? 'city' : 'municipality'} is responsible for.
				</h3>
				<p className='mt-4 text-[14.5px] leading-7 text-[var(--ink-2)]'>
					These services are devolved to this level by the Bangsamoro Local Governance Code, so they
					describe what {unit.name} is mandated to provide — not an inventory of what its offices
					currently run. For opening hours and requirements, the unit&rsquo;s own hall is the source.
				</p>
			</div>

			<div className='mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3'>
				{SERVICES.cityMunicipality.map((group, index) => (
					<div key={group.title}>
						<div className='flex items-baseline justify-between gap-3 border-t border-[var(--brass-line)] pt-3'>
							<h4 className='bb-label'>{group.title}</h4>
							<span className='num text-[11px] font-semibold text-[var(--brass)]'>
								{String(index + 1).padStart(2, '0')}
							</span>
						</div>
						<ul className='mt-3'>
							{group.items.map((item) => (
								<li
									key={item}
									className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-2.5 text-[13.5px] leading-6 text-[var(--ink-2)]'
								>
									<span
										aria-hidden='true'
										className='mt-1.5 size-1.5 shrink-0 rotate-45 bg-[var(--brass)]'
									/>
									{item}
								</li>
							))}
						</ul>
					</div>
				))}
			</div>

			<div className='mt-12'>
				<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>
					And at the barangay
				</h3>
				<div className='mt-4 grid gap-x-10 gap-y-8 sm:grid-cols-2'>
					{SERVICES.barangay.map((group) => (
						<div key={group.title}>
							<h4 className='text-[14px] font-semibold text-[var(--ink)]'>{group.title}</h4>
							<ul className='mt-2'>
								{group.items.map((item) => (
									<li
										key={item}
										className='border-b border-[var(--rule-soft)] py-2.5 text-[13px] leading-6 text-[var(--ink-2)]'
									>
										{item}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			<Charges name={unit.name} isCity={unit.isCity} />
		</div>
	)
}

/**
 * What a resident pays the unit, and by when.
 *
 * The rest of this tab answers what the town owes you; this answers what you
 * owe the town, which is the other half of the question and the one people
 * arrive with. Every figure is the ceiling the Code and its IRR set — a
 * sanggunian may levy less and many do — so the rates read "up to" and the
 * page says plainly that the hall has the ordinance.
 */
function Charges({ name, isCity }: { name: string; isCity: boolean }) {
	return (
		<div className='mt-14 border-t border-[var(--brass-line)] pt-8'>
			<div className='max-w-3xl'>
				<h3 className='bb-display-sm text-[var(--ink)]'>And what you pay it.</h3>
				<p className='mt-4 text-[14.5px] leading-7 text-[var(--ink-2)]'>
					These are the ceilings the Bangsamoro Local Governance Code and its implementing rules
					set on what a {isCity ? 'city' : 'municipality'} and its barangays may charge, with the
					deadlines that go with them. {name} sets its own rates by ordinance and may charge less,
					so treat these as the most it can be rather than the bill — the hall has the ordinance.
				</p>
			</div>

			<ul className='mt-8'>
				{LOCAL_CHARGES.map((charge) => (
					<li
						key={charge.what}
						className='grid gap-x-8 gap-y-1 border-b border-[var(--rule-soft)] py-4 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]'
					>
						<div>
							<p className='text-[14px] font-semibold leading-snug text-[var(--ink)]'>
								{charge.what}
							</p>
							<p className='mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-mute)]'>
								{charge.basis}
							</p>
						</div>
						<div>
							<p className='text-[13.5px] leading-6 text-[var(--ink-2)]'>{charge.rate}</p>
							<p className='mt-1 text-[12.5px] leading-6 text-[var(--ink-3)]'>{charge.when}</p>
						</div>
					</li>
				))}
			</ul>
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
				breadcrumb={<LguBreadcrumb trail={trail}>{unit.name}</LguBreadcrumb>}
				badges={
					<>
						<span className='badge badge-plain badge-committee'>{unitClass(unit)}</span>
						{unit.isCapital && province.kind === 'Province' ? (
							<span className='badge badge-plain badge-early'>Provincial capital</span>
						) : null}
					</>
				}
				kicker={province.name === unit.name ? 'Bangsamoro' : province.name}
				name={unit.name}
			/>

			<section className='bb-container bb-section-bottom pt-12'>
				<LguTabs
					tabs={[
						{
							id: 'overview',
							label: 'Overview',
							panel: <Overview unit={unit} province={province} />,
						},
						{
							id: 'demographics',
							label: 'Demographics',
							panel: <Demographics unit={unit} province={province} />,
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
							id: 'services',
							label: 'Services',
							panel: <Services unit={unit} />,
						},
					]}
				/>

				<LguSourceNote className='mt-14' />

				{/* ---- Move along the province ---- */}
				<div className='mt-10 grid gap-4 sm:grid-cols-2'>
					{previous ? (
						<Link
							href={`/${province.slug}/${previous.slug}`}
							className='group flex items-center gap-3 border-t border-[var(--brass-line)] py-5 transition hover:bg-[var(--paper-2)]'
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
							className='group flex items-center justify-end gap-3 border-t border-[var(--brass-line)] py-5 text-right transition hover:bg-[var(--paper-2)]'
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

				<Rise distance={12}>
					<Link
						href={siblings.length === 1 ? '/' : `/${province.slug}`}
						className='bb-btn bb-btn-ghost mt-10'
					>
						<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
						{siblings.length === 1 ? 'All of local government' : `All of ${province.name}`}
					</Link>
				</Rise>
			</section>
		</>
	)
}
