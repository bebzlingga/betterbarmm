import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import {
	Counter,
	LineReveal,
	OkirRule,
	Rise,
	SectionHead,
	Stagger,
	StaggerItem,
} from '@betterbarmm/editorial'
import {
	APPOINTED_OFFICES,
	ELECTED_POSTS,
	formatNumber,
	lguAreas,
	lguCounts,
	lguData,
	lguLadder,
	lguLookups,
	lguProvinces,
	lguReferences,
	areaHref,
	type LguProvince,
} from '@betterbarmm/lgu-data'
import Link from 'next/link'
import { DistributionDonuts, type Slice } from './_components/distribution-donuts'
import { FinderTrigger } from './_components/unit-finder'

/** District seats in the Bangsamoro Parliament, joined on by slug. */
function seatsFor(province: LguProvince): number | null {
	return lguAreas.find((area) => area.slug === province.slug)?.seats ?? null
}

function capitalOf(province: LguProvince): string | null {
	return province.municipalities.find((unit) => unit.isCapital)?.name ?? null
}

/**
 * The two rings' data, largest area first.
 *
 * Sorted rather than left in the dataset's own order, because the ring paints
 * rank as lightness — an unsorted ramp would say the slices are ordered when
 * they are not.
 */
function slicesBy(measure: (province: LguProvince) => number): Slice[] {
	return lguProvinces
		.map((province) => ({
			name: province.name,
			value: measure(province),
			href: areaHref(province),
		}))
		.sort((a, b) => b.value - a.value)
}

const unitSlices = slicesBy((province) => province.municipalities.length)
const barangaySlices = slicesBy((province) => province.barangayCount)

/**
 * The seven areas BARMM contains, as a table of contents.
 *
 * Rows rather than cards. A reader on this page is choosing where to go next,
 * and a row can hold the three things that decide it — what the area is, how
 * big it is, and how much of Parliament it elects — on one line each, where a
 * card of the same width has to stack them and loses the comparison down the
 * column.
 */
function Areas() {
	return (
		<Stagger gap={0.05} className='mt-12'>
			{lguProvinces.map((province, index) => {
				const seats = seatsFor(province)
				const capital = capitalOf(province)
				const cities = province.municipalities.filter((unit) => unit.isCity).length

				return (
					<StaggerItem key={province.slug} distance={12}>
						<Link
							href={areaHref(province)}
							className='group grid gap-x-10 gap-y-5 border-t border-[var(--brass-line)] py-7 transition hover:bg-[var(--paper-2)] lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,15rem)] lg:py-8'
						>
							<div className='min-w-0'>
								<div className='flex items-baseline gap-3'>
									<span className='num text-[11px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<span className='bb-label'>{province.kind}</span>
								</div>

								<h3 className='mt-3 flex items-baseline gap-2 text-[1.6rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
									{province.name}
									<ArrowUpRightIcon
										className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								</h3>

								{capital && capital !== province.name ? (
									<p className='mt-3 text-[12.5px] text-[var(--ink-3)]'>
										Capital <span className='font-semibold text-[var(--ink-2)]'>{capital}</span>
									</p>
								) : null}
							</div>

							<p className='bb-measure text-[13.5px] leading-7 text-[var(--ink-2)]'>
								{province.note}
							</p>

							<dl className='flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)] lg:flex-col lg:gap-y-2.5'>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Population</dt>
									<dd className='num text-[var(--ink)]'>{formatNumber(province.population)}</dd>
									<span aria-hidden='true'>people</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Cities and municipalities</dt>
									<dd className='num text-[var(--ink)]'>{province.municipalities.length}</dd>
									<span aria-hidden='true'>
										{province.municipalities.length === 1
											? cities === 1
												? 'city'
												: 'municipality'
											: cities > 0
												? 'units, one a city'
												: 'municipalities'}
									</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Barangays</dt>
									<dd className='num text-[var(--ink)]'>{formatNumber(province.barangayCount)}</dd>
									<span aria-hidden='true'>barangays</span>
								</div>
								{seats != null ? (
									<div className='flex gap-1.5'>
										<dt className='sr-only'>Bangsamoro Parliament district seats</dt>
										<dd className='num text-[var(--brass)]'>{seats}</dd>
										<span aria-hidden='true'>seats in Parliament</span>
									</div>
								) : null}
							</dl>
						</Link>
					</StaggerItem>
				)
			})}
		</Stagger>
	)
}

/**
 * The ladder of units, largest first.
 *
 * Set as a stack of rungs rather than a table, because the interesting column
 * is "who do you actually vote for" and that is a list, not a cell. The region
 * is the first rung and is marked as the odd one out — it is where the whole
 * confusion starts.
 */
function Ladder() {
	return (
		<div className='mt-12'>
			{lguLadder.map((rung, index) => (
				<Rise key={rung.level} delay={index * 0.06} distance={16}>
					<div className='grid gap-x-10 gap-y-4 border-t border-[var(--brass-line)] py-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)_minmax(0,15rem)]'>
						<div>
							<span className='num text-[11px] font-semibold text-[var(--brass)]'>
								{String(index + 1).padStart(2, '0')}
							</span>
							<h3 className='mt-3 text-[1.6rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)]'>
								{rung.level}
							</h3>
						</div>

						<div>
							<p className='text-[15px] font-medium leading-7 text-[var(--ink)]'>{rung.what}</p>
							<p className='bb-measure mt-3 text-[13.5px] leading-7 text-[var(--ink-2)]'>
								{rung.note}
							</p>
						</div>

						<div>
							<p className='bb-label'>You elect</p>
							<ul className='mt-3'>
								{rung.elects.map((post) => (
									<li
										key={post}
										className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-2 text-[13px] leading-6 text-[var(--ink-2)]'
									>
										<span
											aria-hidden='true'
											className='mt-1.5 size-1.5 shrink-0 rotate-45 bg-[var(--brass)]'
										/>
										{post}
									</li>
								))}
							</ul>
						</div>
					</div>
				</Rise>
			))}
		</div>
	)
}

/**
 * Every post a unit has, elected and appointed.
 *
 * Moved here off the 108 unit pages, where it was 108 identical copies of a
 * list the Bangsamoro Local Governance Code fixes for all of them. Set as four columns of
 * rungs rather than one list, so a reader can find their own level and stop —
 * the province column is new here and could not exist on a municipality's page.
 */
function Offices() {
	const elected = [
		{ level: 'The province', posts: ELECTED_POSTS.province },
		{ level: 'The city', posts: ELECTED_POSTS.city },
		{ level: 'The municipality', posts: ELECTED_POSTS.municipality },
		{ level: 'The barangay', posts: ELECTED_POSTS.barangay },
	]

	return (
		<div className='mt-12'>
			<Stagger gap={0.05} className='overflow-hidden'>
				<div className='-ml-px -mt-px grid sm:grid-cols-2 xl:grid-cols-4'>
					{elected.map((rung) => (
						<StaggerItem key={rung.level} distance={12} className='min-w-0'>
							<div className='flex h-full flex-col border-l border-t border-[var(--rule)] p-6 lg:p-7'>
								<h3 className='bb-label'>Elected · {rung.level}</h3>
								<ul className='mt-4'>
									{rung.posts.map((post) => (
										<li
											key={post.title}
											className='border-t border-[var(--rule-soft)] py-3 first:border-t-0 first:pt-0'
										>
											<p className='text-[14.5px] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
												{post.title}
											</p>
											<p className='mt-1.5 text-[12.5px] leading-6 text-[var(--ink-2)]'>
												{post.note}
											</p>
											{post.detail ? (
												<p className='mt-1.5 text-[11.5px] leading-5 text-[var(--ink-3)]'>
													{post.detail}
												</p>
											) : null}
										</li>
									))}
								</ul>
							</div>
						</StaggerItem>
					))}
				</div>
			</Stagger>

			<Rise delay={0.1} distance={14}>
				<div className='mt-14 grid gap-8 border-t border-[var(--brass-line)] pt-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16'>
					<div>
						<h3 className='bb-display-sm text-[var(--ink)]'>Appointed.</h3>
						<p className='bb-measure mt-4 text-[13.5px] leading-7 text-[var(--ink-2)]'>
							Nobody votes for these, and they are the offices a resident actually deals with. A
							business permit goes to the treasurer, a birth certificate to the civil registrar.
							Every city and municipality is required or permitted to have them.
						</p>
					</div>

					<div className='grid gap-x-10 sm:grid-cols-2'>
						{APPOINTED_OFFICES.map((office) => (
							<div key={office.title} className='border-t border-[var(--rule-soft)] py-3'>
								<p className='text-[14px] font-semibold text-[var(--ink)]'>{office.title}</p>
								<p className='mt-1 text-[12.5px] leading-5 text-[var(--ink-2)]'>{office.note}</p>
							{office.detail ? (
								<p className='mt-1 text-[11.5px] leading-5 text-[var(--ink-3)]'>{office.detail}</p>
							) : null}
							</div>
						))}
					</div>
				</div>
			</Rise>
		</div>
	)
}

/**
 * Where the parts of the record this workspace does not hold actually live.
 *
 * Barangay officials are elected on a separate schedule and are not in the 2025
 * canvass, so the punong barangay of every barangay in the region are still
 * missing. Saying "coming soon" and stopping would waste the visit; every
 * office listed here already publishes part of the answer, so the page hands
 * the reader over rather than leaving them at a dead end.
 */
function Lookups() {
	return (
		<Stagger gap={0.05} className='overflow-hidden'>
			<div className='-ml-px -mt-px grid sm:grid-cols-2'>
				{lguLookups.map((lookup) => (
					<StaggerItem key={lookup.href} distance={14} className='min-w-0'>
						<a
							href={lookup.href}
							target='_blank'
							rel='noreferrer'
							className='group flex h-full flex-col border-l border-t border-[var(--rule)] p-7 transition hover:bg-[var(--paper-2)] lg:p-8'
						>
							<div className='flex items-start justify-between gap-4'>
								<h3 className='text-[16px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{lookup.office}
								</h3>
								<ArrowUpRightIcon
									className='mt-0.5 size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</div>
							<p className='mt-3 text-[13.5px] leading-7 text-[var(--ink-2)]'>{lookup.what}</p>
						</a>
					</StaggerItem>
				))}
			</div>
		</Stagger>
	)
}

export default function LguHomePage() {
	const cities = lguProvinces.reduce(
		(count, province) => count + province.municipalities.filter((unit) => unit.isCity).length,
		0,
	)

	return (
		<>
			{/* ---- Masthead ---- */}
			<section className='bb-lattice relative overflow-hidden'>
				<span
					aria-hidden='true'
					className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]'
				/>

				<div className='bb-container relative pb-16 pt-16 lg:pb-24 lg:pt-24'>
					<Rise distance={14}>
						<p className='bb-label'>Local government in the Bangsamoro</p>
					</Rise>

					<LineReveal
						lines={['Every province,', 'every town,', 'and who runs it.']}
						delay={0.08}
						className='bb-display mt-7 text-[var(--ink)]'
						lineClassName={[undefined, undefined, 'bb-mute']}
					/>

					<Rise delay={0.35} distance={16}>
						<p className='bb-measure mt-9 text-[16px] leading-8 text-[var(--ink-2)]'>
							The region down to the barangay: what each unit is, how many people live in it, which
							posts are on its ballot, and the governors, mayors and councillors COMELEC canvassed
							into office in 2025.
						</p>
					</Rise>

					{/* The front door proper. A province menu asks the reader to know
					    which province they live in, which is the easy half of the
					    question and not the half anyone arrives with. */}
					<Rise delay={0.45} distance={14}>
						<div className='mt-9 max-w-xl'>
							<FinderTrigger variant='field' />
						</div>
					</Rise>

					<Rise delay={0.55} distance={14}>
						<dl className='mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-[var(--brass-line)] pt-6'>
							{/* Every figure here is the directory's own, summed from the units
							    it can actually open. PSA's regional totals are larger and
							    count different things; the note under the areas below says
							    exactly how much larger and why, rather than the page picking
							    one and hoping. */}
							{[
								{
									value: lguProvinces.length,
									label: 'Provinces, city and special area',
									group: false,
								},
								{
									value: lguData.totals.lgus,
									label: 'Cities and municipalities',
									group: false,
								},
								{
									value: lguData.totals.barangays,
									label: 'Barangays',
									group: true,
								},
								{
									value: lguData.totals.population,
									label: 'People, 2024 census',
									group: true,
								},
							].map((fact) => (
								<div key={fact.label}>
									<dt className='sr-only'>{fact.label}</dt>
									<dd className='bb-figure-sm text-[var(--ink)]'>
										<Counter value={fact.value} group={fact.group} />
									</dd>
									<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{fact.label}
									</p>
								</div>
							))}
						</dl>
					</Rise>
				</div>

				<div className='bb-weave' aria-hidden='true' />
			</section>

			{/* ---- The areas ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Where to start'
					title={`${lguData.totals.provinces} provinces, a city,`}
					titleMuted='and a special area.'
					lead={`Each one opens onto its cities and municipalities, and each of those onto its barangays, its officials, and the services it is responsible for. ${cities} of the ${lguData.totals.lgus} units are cities.`}
					aside={
						<p className='num text-[12px] text-[var(--ink-3)]'>
							<span className='font-semibold text-[var(--brass)]'>
								{formatNumber(lguData.totals.population)}
							</span>{' '}
							people
						</p>
					}
				/>

				<Areas />

				{/* The numbers here and PSA's do not agree, and saying which is which
				    is the whole job. Folded away rather than set as a warning banner:
				    it is an answer to a question the reader has not asked yet, and it
				    was pushing the directory itself below the fold. */}
				<Rise delay={0.1} distance={14}>
					<details className='group mt-10 border-t border-[var(--brass-line)] pt-5'>
						<summary className='flex cursor-pointer list-none items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'>
							Why this total is smaller than PSA&rsquo;s
							<span
								aria-hidden='true'
								className='inline-block transition-transform duration-300 group-open:rotate-90'
							>
								&rsaquo;
							</span>
						</summary>
						<div className='bb-measure mt-4 space-y-3 text-[13px] leading-7 text-[var(--ink-2)]'>
							<p>{lguCounts.sulnote}</p>
							<p>{lguCounts.reconcileNote}</p>
						</div>
					</details>
				</Rise>
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- How the region divides ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='The shape of it'
					title='One province holds a third of the towns'
					titleMuted='and over half the barangays.'
					lead='The region does not divide evenly. Lanao del Sur alone accounts for 40 of the 108 cities and municipalities and 1,159 of the 2,180 barangays — more than the other six areas together — while Cotabato City is a single unit of 37.'
				/>

				<DistributionDonuts units={unitSlices} barangays={barangaySlices} />
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- The ladder ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='03'
					eyebrow='The ladder'
					title='Every rung,'
					titleMuted='and who you elect to it.'
					lead='From the region down to the barangay. These are different offices on different schedules, and the Bangsamoro Parliament does not replace any of them.'
				/>

				<Ladder />

				<Rise delay={0.1} distance={16}>
					<div className='mt-16 grid gap-8 border-t border-[var(--brass-line)] pt-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16'>
						<h3 className='bb-display-sm text-[var(--ink)]'>Two ballots, one voter.</h3>
						<div className='bb-prose'>
							<p>
								A voter in Marawi elects a governor, a mayor, a barangay captain — and, separately,
								a Member of the Bangsamoro Parliament. BARMM sits over the local government units in
								the region; it does not stand in for them.
							</p>
							<p>
								What the region did change is the rulebook underneath. The{' '}
								<a
									href={lguReferences.localGovernanceCode.href}
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
									{lguReferences.localGovernanceCode.label}
								</a>{' '}
								was enacted on {lguReferences.localGovernanceCode.enacted} and is the code these
								units are governed by: it creates the offices, fixes the terms and the pay, and
								devolves the services. Its{' '}
								<a
									href={lguReferences.implementingRules.href}
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
									implementing rules
								</a>{' '}
								followed on {lguReferences.implementingRules.promulgated}. The national{' '}
								<a
									href={lguReferences.nationalCode.href}
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
									Local Government Code of 1991
								</a>{' '}
								still applies inside BARMM, but only where the Bangsamoro one is silent.
							</p>
						</div>
					</div>
				</Rise>
			</section>

			{/* ---- The offices ----
			    This used to sit on every one of the 108 unit pages, which is 108
			    copies of a list that is identical on all of them: which posts exist
			    is set by the Bangsamoro Local Governance Code, not by the town. It belongs
			    once, here, with the ladder that introduces it. */}
			<section id='offices' className='bb-container bb-section scroll-mt-24'>
				<SectionHead
					index='04'
					eyebrow='The offices'
					title='Every post,'
					titleMuted='elected and appointed.'
					lead='Which offices a unit has is set by the Bangsamoro Local Governance Code rather than by the unit, so the ladder is the same in all 108 of them — though a municipality may do without several of the appointed posts a province and a city must fill. The elected posts are the ballot; the appointed ones are the people a resident actually deals with.'
				/>

				<Offices />
			</section>

			{/* ---- What is not here yet ---- */}
			<section id='where-to-look' className='bb-container bb-section scroll-mt-24'>
				<SectionHead
					index='05'
					eyebrow='What is not here yet'
					title='Barangay officials'
					titleMuted='are elected separately.'
					lead={`Governors, mayors, vice-mayors and councillors are here, from COMELEC's 2025 Certificates of Canvass. Barangay elections run on their own schedule and are not in that canvass, so the ${formatNumber(lguData.totals.barangays)} punong barangay are still to come — until then, these offices hold that part of the record.`}
				/>

				<Lookups />
			</section>
		</>
	)
}
