import { ArrowUpRightIcon, WarningIcon } from '@phosphor-icons/react/ssr'
import {
	Counter,
	LineReveal,
	OkirBloom,
	OkirRule,
	Rise,
	SectionHead,
	Stagger,
	StaggerItem,
} from '@betterbarmm/editorial'
import {
	formatNumber,
	lguCounts,
	lguData,
	lguLadder,
	lguLookups,
	lguProvinces,
	lguReferences,
} from '@betterbarmm/lgu-data'
import Link from 'next/link'

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
		<div>
			{lguLadder.map((rung, index) => (
				<Rise key={rung.level} delay={index * 0.06} distance={16}>
					<div className='grid gap-x-10 gap-y-4 border-t border-[var(--brass-line)] py-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,17rem)]'>
						<div>
							<p className='num text-[12px] font-semibold text-[var(--brass)]'>
								{String(index + 1).padStart(2, '0')}
							</p>
							<h3 className='mt-2 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
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
										className='flex items-baseline gap-2.5 border-b border-[var(--rule-soft)] py-2 text-[13.5px] text-[var(--ink-2)]'
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
 * The provinces, as the front door of the directory.
 *
 * Every card is a link down into the tree rather than a summary that ends here
 * — this is the rung the reader browses from, and the counts on it come
 * straight out of the dataset so they cannot drift from the pages underneath.
 */
function Provinces() {
	return (
		<Stagger gap={0.05} className='overflow-hidden'>
			<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'>
				{lguProvinces.map((province) => (
					<StaggerItem key={province.slug} distance={14} className='min-w-0'>
						<Link
							href={`/${province.slug}`}
							className='group flex h-full flex-col border-l border-t border-[var(--rule)] p-7 transition hover:bg-[var(--paper-2)] lg:p-8'
						>
							<div className='flex items-baseline justify-between gap-3'>
								<p className='bb-label'>{province.kind}</p>
								<ArrowUpRightIcon
									className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</div>

							<h3 className='mt-8 text-[1.5rem] font-extrabold leading-none tracking-[-0.035em] text-[var(--ink)] transition duration-500 group-hover:text-[var(--accent)]'>
								{province.name}
							</h3>

							<p className='mt-3 flex-1 text-[13.5px] leading-7 text-[var(--ink-2)]'>
								{province.note}
							</p>

							<dl className='mt-7 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--rule)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Population</dt>
									<dd className='text-[var(--ink)]'>{formatNumber(province.population)}</dd>
									<span aria-hidden='true'>people</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Cities and municipalities</dt>
									<dd className='text-[var(--ink)]'>{province.municipalities.length}</dd>
									<span aria-hidden='true'>LGUs</span>
								</div>
								<div className='flex gap-1.5'>
									<dt className='sr-only'>Barangays</dt>
									<dd className='text-[var(--ink)]'>{formatNumber(province.barangayCount)}</dd>
									<span aria-hidden='true'>barangays</span>
								</div>
							</dl>
						</Link>
					</StaggerItem>
				))}
			</div>
		</Stagger>
	)
}

/**
 * Where the parts of the record this workspace does not hold actually live.
 *
 * Barangay officials are elected on a separate schedule and are not in the 2025
 * canvass, so 2,180 punong barangay are still missing. Saying "coming soon" and
 * stopping would waste the visit; every office listed here already publishes
 * part of the answer, so the page hands the reader over rather than leaving
 * them at a dead end.
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
								<h3 className='text-[17px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
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
	return (
		<>
			{/* ---- Masthead ---- */}
			<section className='bb-lattice relative overflow-hidden'>
				<OkirBloom className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]' />
				<span aria-hidden='true' className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]' />

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
						<p className='bb-measure mt-9 text-[17px] leading-8 text-[var(--ink-2)]'>
							The region down to the barangay: what each unit is, how many people live in it, which
							posts are on its ballot, and the governors, mayors and councillors COMELEC canvassed
							into office in 2025.
						</p>
					</Rise>

					<Rise delay={0.5} distance={14}>
						<dl className='mt-14 flex flex-wrap gap-x-10 gap-y-6 border-t border-[var(--brass-line)] pt-6'>
							{/* Every figure here is the dataset's own, summed from the units this
							    workspace can actually open. `lguCounts` carries a larger
							    barangay total from a different vintage of the record; quoting it
							    on a directory masthead would promise four hundred barangays that
							    are not in the directory. The gap between the two is explained in
							    the note below rather than hidden by picking one. */}
							{[
								{ value: lguData.totals.provinces + 1, label: 'Provinces and cities', group: false },
								{ value: lguData.totals.lgus, label: 'Cities and municipalities', group: false },
								{ value: lguData.totals.barangays, label: 'Barangays', group: true },
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

			{/* ---- The units ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Where to start'
					title={`${lguData.totals.provinces} provinces`}
					titleMuted='and a city.'
					lead='Each one opens onto its cities and municipalities, and each of those onto its barangays, its officials, and the services it is responsible for.'
					aside={
						<p className='num text-[12px] text-[var(--ink-3)]'>
							<span className='font-semibold text-[var(--brass)]'>
								{formatNumber(lguData.totals.population)}
							</span>{' '}
							people
						</p>
					}
				/>

				{/* The numbers here come from two records that no longer agree with
				    each other. Saying which is which is the whole job. */}
				<Rise delay={0.1} distance={14}>
					<div className='bb-measure mt-12 flex gap-3 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)] p-4'>
						<WarningIcon
							className='mt-0.5 size-4 shrink-0 text-[var(--accent)]'
							weight='fill'
							aria-hidden='true'
						/>
						<p className='text-[13px] leading-7 text-[var(--ink-2)]'>{lguCounts.sulnote}</p>
					</div>
				</Rise>

				<Provinces />
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- The ladder ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
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
								A voter in Marawi elects a governor, a mayor, a barangay captain — and, separately, a
								Member of the Bangsamoro Parliament. BARMM sits over the local government units in
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
								was enacted on {lguReferences.localGovernanceCode.enacted}, setting out how local
								units inside BARMM are governed — alongside the national{' '}
								<a
									href={lguReferences.nationalCode.href}
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
									Local Government Code of 1991
								</a>
								, which defines the offices themselves.
							</p>
						</div>
					</div>
				</Rise>
			</section>

			{/* ---- What is not here yet ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='03'
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
