import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { APPOINTED_OFFICES, ELECTED_POSTS, lguLadder, lguLookups, lguReferences } from '@betterbarmm/lgu-data'

/* The reference half of the workspace: who you elect at each rung, every post
   a unit has, and where the names this directory does not hold are kept. It
   reads the same for every unit, so it lives once, on What each level does. */

/**
 * The ladder of units, largest first.
 *
 * Set as a stack of rungs rather than a table, because the interesting column
 * is "who do you actually vote for" and that is a list, not a cell. The region
 * is the first rung and is marked as the odd one out — it is where the whole
 * confusion starts.
 */
export function Ladder() {
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
export function Offices() {
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
export function Lookups() {
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

/** One voter, two governments: why BARMM does not replace the local units. */
export function TwoBallots() {
	return (
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
	)
}
