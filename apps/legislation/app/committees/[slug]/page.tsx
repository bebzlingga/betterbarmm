import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFirstParliament, type FirstParliamentPerson } from '../../_lib/members-data'
import { MemberAvatar } from '../../_components/member-avatar'
import { CommitteeIcon } from '../../_components/committee-icon'
import { Hero } from '../../_components/hero'
import { toDisplayTitle } from '../../_lib/labels'
import { Reveal } from '../../_components/reveal'
import { ShowAll } from '../../_components/show-all'
import { ReferralList, type Referral } from '../../_components/referral-list'
import { findRecordByTitle } from '../../_lib/legislation-data'
import {
	getCommittee,
	getCommitteeSlugs,
	getCommitteesDataset,
	type CommitteeSeat,
} from '../../_lib/committees-data'

export function generateStaticParams() {
	return getCommitteeSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const committee = getCommittee(slug)

	if (!committee) return { title: 'Committee not found' }

	return {
		title: committee.name,
		description:
			committee.jurisdiction.slice(0, 200) ||
			`${committee.name} of the Bangsamoro Parliament — membership and referred measures.`,
	}
}

/** One person's seat. Links to their profile when the roster knows them. */
function Seat({ seat }: { seat: CommitteeSeat }) {
	const body = (
		<>
			<MemberAvatar name={seat.displayName} />
			<span className='min-w-0'>
				<span className='block text-sm font-medium leading-snug text-[var(--ink)]'>
					{seat.displayName}
				</span>
				<span className='meta-sm mt-0.5 block'>{seat.role}</span>
			</span>
		</>
	)

	return seat.slug ? (
		<Link href={`/members/${seat.slug}`} className='flex items-center gap-3 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-2.5 pr-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'>
			{body}
		</Link>
	) : (
		<div className='flex items-center gap-3 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-2.5 pr-4'>{body}</div>
	)
}

export default async function CommitteePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const committee = getCommittee(slug)

	if (!committee) notFound()

	const { generatedAt } = getCommitteesDataset()
	const current = getFirstParliament().committees.find((c) => c.slug === slug)

	// The committee pages cite a referral by title alone, so each one is looked
	// up in the registry and the row opens that record rather than sending the
	// reader to a Parliament permalink that says less than we already hold.
	const toReferral = (item: { title: string; url: string }): Referral => ({
		...item,
		record: findRecordByTitle(item.title),
	})
	const referredBills = committee.referredBills.map(toReferral)
	const referredResolutions = committee.referredResolutions.map(toReferral)

	const officers = committee.seats.filter(
		(seat) => seat.role !== 'Member' && seat.role !== 'Ex-officio',
	)
	const members = committee.seats.filter((seat) => seat.role === 'Member')
	const exOfficio = committee.seats.filter((seat) => seat.role === 'Ex-officio')

	const chair = current?.chair
	const seated = current && current.members.length > 0 ? current.members.length + current.viceChairs.length + 1 : 0
	const referred = committee.referredBills.length + committee.referredResolutions.length

	return (
		<>
		{/* The committee on the crimson header (user decision: the travel look); its chair and its record so far on a
		    cream card at the right. */}
		<Hero
			small
			auto
			kicker={committee.statutory ? 'Bangsamoro Parliament · statutory committee' : 'Bangsamoro Parliament · committee'}
			title={committee.name}
			lede={committee.inShort || undefined}
			side={
				<div className='rounded-[var(--dv-r)] bg-[#f6f1ea] p-6 text-[#1d1a16] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] sm:p-7'>
					<div className='flex items-start gap-4'>
						<CommitteeIcon name={committee.name} className='size-14 !bg-[#8a2418]/10 !text-[#8a2418]' />
						{chair ? (
							<div className='min-w-0'>
								<p className='text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#8a2418]'>Chair, First Parliament</p>
								{chair.member ? (
									<Link href={`/members/${chair.member.slug}`} className='mt-1 block font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold leading-tight hover:text-[#8a2418]'>
										{chair.member.displayName}
									</Link>
								) : (
									<p className='mt-1 font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold leading-tight'>{chair.name}</p>
								)}
							</div>
						) : null}
					</div>
					<dl className='mt-6 grid grid-cols-3 gap-2 text-center'>
						{[
							{ value: seated || '–', label: 'seated now' },
							{ value: referred, label: 'referred before' },
							{ value: committee.reports.length, label: committee.reports.length === 1 ? 'report' : 'reports' },
						].map((f) => (
							<div key={f.label} className='rounded-2xl bg-white px-2 py-4'>
								<dd className='num font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[#8a2418]'>{f.value}</dd>
								<dt className='mt-1.5 text-[0.75rem] leading-tight text-[#5c564d]'>{f.label}</dt>
							</div>
						))}
					</dl>
				</div>
			}
		/>
		<section className='bb-container py-[clamp(4rem,8vw,7rem)]'>
			{/* Two columns: what it is on the left, what it holds on the right. */}
			{/* The single column is stated, not implicit — an implicit `auto` track
			    sizes to its contents' min-content and cannot shrink to a phone. See
			    the note on the same grid in `members/[slug]`. */}
			<div className='grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:gap-20'>
				<Reveal>
					<div className='tv-wash rounded-[var(--dv-r)] p-6 sm:p-8'>
						<div className='mb-8 flex flex-wrap gap-1.5 empty:hidden'>
							{/* Same mark the index carries, so the two pages agree about what
							    kind of committee this is. */}
							{committee.statutory ? (
								<span className='badge badge-plain badge-committee'>Statutory</span>
							) : null}
							{current && current.members.length > 0 ? (
								<span className='badge badge-plain badge-idle'>{current.members.length + current.viceChairs.length + 1} seated</span>
							) : null}
						</div>

						{/* Parliament's own words. Quoted rather than paraphrased — the
						    scope of a committee is a legal question, not a summary. */}
						{committee.jurisdiction ? (
							<div>
								<p className='label label-strong'>Duties, powers, and jurisdiction</p>
								<p className='mt-3 bb-body text-[var(--ink-2)]'>
									{committee.jurisdiction}
								</p>
								{/* What the badge above means, said once, where the thing it
								    qualifies is on screen. A reader who has not seen the index
								    has no other way to find out. */}
								{committee.statutory ? (
									<p className='mt-3 text-xs leading-5 text-[var(--ink-mute)]'>
										One of the 17 statutory committees — the permanent committees the
										Rules of the Parliament name themselves. What a measure is about
										decides which of them it goes to.
									</p>
								) : null}
							</div>
						) : null}

						{committee.subcommittees ? (
							<div className='mt-8 border-t border-[var(--rule-soft)] pt-6'>
								<p className='label label-strong'>Subcommittees</p>
								<p className='mt-3 bb-body text-[var(--ink-2)]'>
									{committee.subcommittees}
								</p>
							</div>
						) : null}

						<p className='mt-8 border-t border-[var(--rule-soft)] pt-6 text-xs leading-5 text-[var(--ink-mute)]'>
							Membership, jurisdiction, and referrals as published on{' '}
							<a href={committee.url} target='_blank' rel='noreferrer' className='rule-link'>
								the committee&rsquo;s official page
							</a>
							, captured {generatedAt}. The Transition Authority roster below is the last one that page listed before the First Parliament.
						</p>
					</div>
				</Reveal>

				<Reveal delay={80}>
					<div>
						{/* ---- Who sits on it now ---- */}
						{current ? (
							<div className='mb-10'>
								<p className='pg-hero-kicker !text-[var(--accent)]'>First Parliament · from 30 October 2026</p>
								<h2 className='dv-title mt-3'>Who sits on it now</h2>
								{current.chair ? (
									<div className='mt-6 flex items-center gap-4 rounded-2xl border border-[var(--rule)] p-3 pr-6 sm:w-fit'>
										<MemberAvatar name={current.chair.member?.displayName ?? current.chair.name} src={current.chair.member?.photoUrl} />
										<div>
											<p className='label label-strong'>Chair</p>
											{current.chair.member ? (
												<Link href={`/members/${current.chair.member.slug}`} className='mt-1 block text-[1.0625rem] font-bold text-[var(--ink)] hover:text-[var(--accent)]'>
													{current.chair.member.displayName}
												</Link>
											) : (
												<p className='mt-1 text-[1.0625rem] font-bold text-[var(--ink)]'>{current.chair.name}</p>
											)}
										</div>
									</div>
								) : null}
								{current.viceChairs.length > 0 || current.members.length > 0 ? (
									<div className='mt-8 grid gap-6'>
										{([['Vice-chairs', current.viceChairs], ['Members', current.members]] as const)
											.filter(([, people]) => people.length)
											.map(([label, people]) => (
												<div key={label}>
													<p className='label label-strong'>{label} ({people.length})</p>
													<ul className='mt-3 flex flex-wrap gap-2'>
														{people.map((p: FirstParliamentPerson) => (
															<li key={p.name}>
																{p.member ? (
																	<Link href={`/members/${p.member.slug}`} className='dv-pill !py-1.5 !pl-1.5'>
																		{p.member.photoUrl ? (
																			// eslint-disable-next-line @next/next/no-img-element -- a local portrait, sized here
																			<img src={p.member.photoUrl} alt='' className='size-7 rounded-full object-cover object-top' />
																		) : null}
																		{p.member.displayName}
																	</Link>
																) : (
																	<span className='dv-pill !py-2'>{p.name}</span>
																)}
															</li>
														))}
													</ul>
												</div>
											))}
									</div>
								) : (
									<p className='mt-5 text-[0.875rem] leading-6 text-[var(--ink-3)]'>
										Parliament has named the chair; the vice-chairs and members appear here once it posts them.
									</p>
								)}
								<p className='mt-4 text-[0.875rem] leading-6 text-[var(--ink-3)]'>
									No measure has been referred to it and no report filed yet in the First Parliament.
								</p>
							</div>
						) : null}

						{/* ---- The Transition Authority: its roster, reports and referrals, folded away so the current
						    committee leads ---- */}
						<details className='group rounded-[var(--dv-r)] border border-[var(--rule)] px-6 sm:px-8'>
							<summary className='flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden'>
								<span>
									<span className='eyebrow block'>In the Transition Authority · 2019 to 2025</span>
									<span className='mt-1.5 block text-[0.8125rem] text-[var(--ink-3)]'>
										{officers.length + members.length + exOfficio.length} seats on its last roster · {committee.reports.length} reports ·{' '}
										{committee.referredBills.length + committee.referredResolutions.length} measures referred
									</span>
								</span>
								<span aria-hidden='true' className='text-[1.25rem] leading-none text-[var(--ink-3)] transition group-open:rotate-45'>+</span>
							</summary>
							<div className='pb-10 pt-4'>
								<p className='mb-6 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
									The committee’s last roster, as Parliament’s page listed it on {generatedAt}, and what was referred to it and what it reported before the First Parliament.
								</p>
								{officers.length > 0 ? (
								<div>
									<p className='label label-strong'>Chair and vice-chairs</p>
									<div className='mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-3'>
										{officers.map((seat) => (
											<Seat key={`${seat.rosterName}-${seat.role}`} seat={seat} />
										))}
									</div>
								</div>
							) : null}

							{members.length > 0 ? (
								<div className='mt-8'>
									<p className='label label-strong'>Members ({members.length})</p>
									<div className='mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-3'>
										{members.map((seat) => (
											<Seat key={seat.rosterName} seat={seat} />
										))}
									</div>
								</div>
							) : null}

							{exOfficio.length > 0 ? (
								<div className='mt-8'>
									<p className='label label-strong'>Ex-officio members ({exOfficio.length})</p>
									<p className='meta-sm mt-2 max-w-2xl'>
										Seated by virtue of another office they hold, rather than by assignment.
									</p>
									<div className='mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-3'>
										{exOfficio.map((seat) => (
											<Seat key={seat.rosterName} seat={seat} />
										))}
									</div>
								</div>
							) : null}
									{/* ---- Reports ---- */}
									{committee.reports.length > 0 ? (
										<div className='mt-12'>
											<p className='label label-strong label-lg'>
												Committee reports <span className='num'>({committee.reports.length})</span>
											</p>
											<p className='meta-sm mt-2 max-w-2xl'>
												What the committee reported back to the plenary. Numbers and dates are as filed;
												the text of each report sits on Parliament&rsquo;s site.
											</p>
											<div className='mt-4 overflow-hidden rounded-2xl border border-[var(--rule)] [&_.row]:px-5 [&_.row:last-child]:border-0'>
												<ShowAll noun='reports'>
													{committee.reports.map((report) => (
														<a
															key={report.number}
															href={report.url}
															target='_blank'
															rel='noreferrer'
															className='row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5'
														>
															<span className='num text-[0.8125rem] font-medium text-[var(--ink)]'>
																{report.title}
															</span>
															<span className='meta-sm shrink-0'>{report.dateDisplay}</span>
														</a>
													))}
												</ShowAll>
											</div>
										</div>
									) : null}

									{/* ---- Referred measures ---- */}
									{committee.referredBills.length + committee.referredResolutions.length > 0 ? (
										<div className='mt-12 grid gap-10'>
											<ReferralList
												label='Referred bills'
												noun='bills'
												items={referredBills}
											/>
											<ReferralList
												label='Referred resolutions'
												noun='resolutions'
												items={referredResolutions}
											/>
										</div>
									) : (
										<p className='mt-12 max-w-2xl bb-body text-[var(--ink-3)]'>
											No measures are listed as referred to this committee on its official page.
										</p>
									)}
							</div>
						</details>
					</div>
				</Reveal>
			</div>
		</section>
		</>
	)
}
