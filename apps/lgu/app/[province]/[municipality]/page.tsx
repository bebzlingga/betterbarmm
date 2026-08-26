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
import {
	APPOINTED_OFFICES,
	ELECTED_POSTS,
	LEGAL_BASIS,
	OFFICIAL_LOOKUPS,
	SERVICES,
} from '@betterbarmm/lgu-data'
import { MultiSeat, NoCanvass, SingleSeat } from '../../_components/lgu-officials'
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

	const kind = found.unit.isCity ? 'City' : 'Municipality'
	return {
		title: `${found.unit.name}, ${found.province.name} — Local government directory`,
		description: `${kind} in ${found.province.name}, BARMM. Population, land area, ${found.unit.barangays.length} barangays, elected offices, and devolved services.`,
	}
}

/** The label a unit answers to — used in headings and prose alike. */
function unitKind(unit: LguUnit): 'province' | 'city' | 'municipality' {
	return unit.isCity ? 'city' : 'municipality'
}

function Overview({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const change = growth(unit)

	return (
		<div className='grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16'>
			<div>
				<p className='text-[1.15rem] font-medium leading-[1.55] tracking-[-0.01em] text-[var(--ink)] sm:text-[1.35rem]'>
					{unit.name} is {unit.isCity ? 'a component city' : 'a municipality'} of {province.name}
					{province.kind === 'Province' ? ', in the Bangsamoro Autonomous Region in Muslim Mindanao' : ''}
					{unit.isCapital ? ', and its capital' : ''}. It is divided into{' '}
					{unit.barangays.length} {unit.barangays.length === 1 ? 'barangay' : 'barangays'}
					{unit.population != null ? `, and had ${formatNumber(unit.population)} residents at the 2024 census` : ''}.
				</p>

				{unit.formedFrom ? (
					<p className='mt-6 max-w-2xl text-[14.5px] leading-7 text-[var(--ink-2)]'>
						It was constituted from barangays of {unit.formedFrom} in North Cotabato, which voted to
						join BARMM in the 2019 plebiscite. The municipality was created by Bangsamoro Autonomy
						Act and ratified by plebiscite on April 13, 2024 — recent enough that national
						statistics for it are not yet published separately.
					</p>
				) : null}

				<div className='mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2'>
					{[
						['Province', province.name],
						['Classification', unit.isCity ? 'Component city' : 'Municipality'],
						['Barangays', String(unit.barangays.length)],
						['PSGC code', unit.psgc ?? 'Not yet assigned'],
					].map(([label, value]) => (
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
				</div>
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
							<li key={law.href} className='border-t border-[var(--rule-soft)] py-3 first:border-t-0'>
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
	const share =
		unit.population != null && province.population
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
		[`Share of ${province.name}`, share == null ? '—' : `${share}%`],
	]

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

function Barangays({ unit }: { unit: LguUnit }) {
	const sorted = [...unit.barangays].sort((a, b) => a.name.localeCompare(b.name))

	return (
		<div>
			<div className='flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--brass-line)] pb-3'>
				<h3 className='bb-label'>All barangays</h3>
				<p className='num text-[13px] font-semibold text-[var(--brass)]'>{sorted.length}</p>
			</div>

			<ol className='mt-2 grid sm:grid-cols-2 lg:grid-cols-3'>
				{sorted.map((barangay, index) => (
					<li
						key={`${barangay.name}-${index}`}
						className='flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-2.5 sm:pr-6'
					>
						<span className='num w-7 shrink-0 text-[10.5px] text-[var(--ink-3)]'>
							{String(index + 1).padStart(2, '0')}
						</span>
						<span className='min-w-0 flex-1 text-[13.5px] text-[var(--ink)]'>{barangay.name}</span>
						{barangay.psgc ? (
							<span className='num shrink-0 text-[10.5px] text-[var(--ink-mute)]'>
								{barangay.psgc}
							</span>
						) : null}
					</li>
				))}
			</ol>

			<p className='mt-6 max-w-3xl text-[12.5px] leading-6 text-[var(--ink-3)]'>
				Each barangay is its own local government unit with an elected punong barangay and council.
				The code beside a name is its PSGC identifier — the number every national record uses for
				that barangay.
			</p>
		</div>
	)
}

function Officials({ unit, province }: { unit: LguUnit; province: LguProvince }) {
	const posts = ELECTED_POSTS[unitKind(unit)]

	return (
		<div>
			<LguTermPicker
				panels={officialsTerms
					.map((term) => {
						const officials = unit.officials?.[term.id]
						const provincial = province.officials?.[term.id]
						if (!officials?.mayor && !officials?.viceMayor && !officials?.council) return null

						return {
							id: term.id,
							node: (
								<div>
									<div className='grid gap-10 lg:grid-cols-2 lg:gap-16'>
										{officials.mayor ? (
											<SingleSeat title='Mayor' contest={officials.mayor} />
										) : null}
										{officials.viceMayor ? (
											<SingleSeat title='Vice-Mayor' contest={officials.viceMayor} />
										) : null}
									</div>

									{officials.council ? (
										<div className='mt-12'>
											<MultiSeat
												title={unit.isCity ? 'Sangguniang Panlungsod' : 'Sangguniang Bayan'}
												contests={officials.council}
											/>
										</div>
									) : null}

									{/* The province's own officials, named once here so a reader on
									    a town page does not have to climb a level to find them. */}
									{provincial?.governor || provincial?.viceGovernor ? (
										<div className='mt-12 border-t border-[var(--rule)] pt-8'>
											<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
												And for {province.name} as a whole
											</p>
											<div className='mt-5 grid gap-10 lg:grid-cols-2 lg:gap-16'>
												{provincial.governor ? (
													<SingleSeat
														title='Provincial Governor'
														contest={provincial.governor}
													/>
												) : null}
												{provincial.viceGovernor ? (
													<SingleSeat
														title='Provincial Vice-Governor'
														contest={provincial.viceGovernor}
													/>
												) : null}
											</div>
											<Link
												href={`/${province.slug}#officials`}
												className='mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
											>
												Provincial board and the full provincial canvass
												<span aria-hidden='true'>&rarr;</span>
											</Link>
										</div>
									) : null}
								</div>
							),
						}
					})
					.filter((panel) => panel !== null)}
				empty={<NoCanvass name={unit.name} />}
			/>

			{/* ---- The offices themselves ---- */}
			<div className='mt-16 border-t border-[var(--brass-line)] pt-8'>
				<h3 className='bb-display-sm text-[var(--ink)]'>The offices, and who fills them.</h3>
				<p className='mt-3 max-w-3xl text-[13.5px] leading-6 text-[var(--ink-2)]'>
					Which posts exist at each level is set by law rather than by the town, so this part of the
					page holds whoever is in office. Barangay officials are elected separately and are not
					carried in the 2025 canvass above.
				</p>
			</div>

			<div className='mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16'>
				<div>
					<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>
						Elected — {unit.isCity ? 'city' : 'municipal'} level
					</h3>
					<ul className='mt-2'>
						{posts.map((post) => (
							<li key={post.title} className='border-b border-[var(--rule-soft)] py-3.5'>
								<p className='text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									{post.title}
								</p>
								<p className='mt-1.5 text-[13px] leading-6 text-[var(--ink-2)]'>{post.note}</p>
							</li>
						))}
					</ul>

					<h3 className='bb-label mt-10 block w-full border-b border-[var(--brass-line)] pb-3'>
						Elected — in each of the {unit.barangays.length} barangays
					</h3>
					<ul className='mt-2'>
						{ELECTED_POSTS.barangay.map((post) => (
							<li key={post.title} className='border-b border-[var(--rule-soft)] py-3.5'>
								<p className='text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
									{post.title}
								</p>
								<p className='mt-1.5 text-[13px] leading-6 text-[var(--ink-2)]'>{post.note}</p>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>
						Appointed offices
					</h3>
					<p className='mt-3 text-[12.5px] leading-6 text-[var(--ink-3)]'>
						The people a resident actually deals with. A business permit goes to the treasurer, a
						birth certificate to the civil registrar.
					</p>
					<ul className='mt-3'>
						{APPOINTED_OFFICES.map((office) => (
							<li key={office.title} className='border-b border-[var(--rule-soft)] py-3'>
								<p className='text-[14px] font-semibold text-[var(--ink)]'>{office.title}</p>
								<p className='mt-1 text-[12.5px] leading-5 text-[var(--ink-2)]'>{office.note}</p>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className='mt-12'>
				<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>
					Where to find the current names
				</h3>
				<div className='grid sm:grid-cols-2'>
					{OFFICIAL_LOOKUPS.map((lookup) => (
						<a
							key={lookup.href}
							href={lookup.href}
							target='_blank'
							rel='noreferrer'
							className='group flex flex-col border-b border-[var(--rule)] py-5 transition hover:bg-[var(--paper-2)] sm:px-5 sm:[&:nth-child(odd)]:border-r'
						>
							<div className='flex items-start justify-between gap-3'>
								<h4 className='text-[15px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{lookup.office}
								</h4>
								<ArrowUpRightIcon
									className='mt-0.5 size-3.5 shrink-0 text-[var(--ink-3)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</div>
							<p className='mt-2 text-[12.5px] leading-6 text-[var(--ink-2)]'>{lookup.what}</p>
						</a>
					))}
				</div>
			</div>
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
					These services are devolved to this level by the Local Government Code, so they describe
					what {unit.name} is mandated to provide — not an inventory of what its offices currently
					run. For opening hours, requirements and fees, the unit&rsquo;s own hall is the source.
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

	return (
		<>

			<LguMasthead
				breadcrumb={
					<LguBreadcrumb
						trail={[{ label: province.name, href: `/${province.slug}` }]}
					>
						{unit.name}
					</LguBreadcrumb>
				}
				badges={
					<>
						<span className='badge badge-plain badge-committee'>
							{unit.isCity ? 'Component city' : 'Municipality'}
						</span>
						{unit.isCapital ? <span className='badge badge-plain badge-early'>Capital</span> : null}
					</>
				}
				kicker={province.name}
				name={unit.name}
			/>

			<section className='bb-container bb-section-bottom pt-12'>
				<LguTabs
					tabs={[
						{ id: 'overview', label: 'Overview', panel: <Overview unit={unit} province={province} /> },
						{
							id: 'demographics',
							label: 'Demographics',
							panel: <Demographics unit={unit} province={province} />,
						},
						{
							id: 'barangays',
							label: 'Barangays',
							badge: unit.barangays.length,
							panel: <Barangays unit={unit} />,
						},
						{
							id: 'officials',
							label: 'Officials',
							panel: <Officials unit={unit} province={province} />,
						},
						{ id: 'services', label: 'Services', panel: <Services unit={unit} /> },
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
						href={`/${province.slug}`}
						className='bb-btn bb-btn-ghost mt-10'
					>
						<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
						All of {province.name}
					</Link>
				</Rise>
			</section>
		</>
	)
}
