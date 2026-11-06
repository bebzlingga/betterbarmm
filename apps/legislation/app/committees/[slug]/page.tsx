import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFirstParliament, type FirstParliamentPerson } from '../../_lib/members-data'
import { MemberAvatar } from '../../_components/member-avatar'
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
		<Link href={`/members/${seat.slug}`} className='cell flex items-center gap-3 p-3'>
			{body}
		</Link>
	) : (
		<div className='flex items-center gap-3 p-3'>{body}</div>
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

	return (
		<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
			{/* Two columns: what it is on the left, what it holds on the right. */}
			{/* The single column is stated, not implicit — an implicit `auto` track
			    sizes to its contents' min-content and cannot shrink to a phone. See
			    the note on the same grid in `members/[slug]`. */}
			<div className='grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-24 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-32'>
				<Reveal>
					<div>
						<p className='eyebrow'>Bangsamoro Parliament</p>

						<h1 className='mt-3 text-[1.75rem] font-bold leading-[1.1] text-[var(--ink)] sm:text-[2rem]'>
							{committee.name}
						</h1>

						<div className='mt-5 flex flex-wrap gap-1.5'>
							{/* Same mark the index carries, so the two pages agree about what
							    kind of committee this is. */}
							{committee.statutory ? (
								<span className='badge badge-plain badge-committee'>Statutory</span>
							) : null}
							{current && current.members.length > 0 ? (
								<span className='badge badge-plain badge-idle'>{current.members.length + current.viceChairs.length + 1} seated</span>
							) : null}
							{committee.reports.length > 0 ? (
								<span className='badge badge-plain badge-done'>
									{committee.reports.length} reports filed
								</span>
							) : null}
						</div>

						{/* Parliament's own words. Quoted rather than paraphrased — the
						    scope of a committee is a legal question, not a summary. */}
						{committee.jurisdiction ? (
							<div className='mt-8'>
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
							<div className='mt-8 border-t border-[var(--rule)] pt-6'>
								<p className='label label-strong'>Subcommittees</p>
								<p className='mt-3 bb-body text-[var(--ink-2)]'>
									{committee.subcommittees}
								</p>
							</div>
						) : null}

						<p className='mt-8 border-t border-[var(--rule)] pt-6 text-xs leading-5 text-[var(--ink-mute)]'>
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
							<div className='mb-14'>
								<p className='eyebrow'>First Parliament · from 30 October 2026</p>
								{current.chair ? (
									<div className='mt-4 flex items-center gap-4'>
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
									<div className='mt-6 grid gap-4'>
										{([['Vice-chairs', current.viceChairs], ['Members', current.members]] as const)
											.filter(([, people]) => people.length)
											.map(([label, people]) => (
												<div key={label}>
													<p className='label label-strong'>{label} ({people.length})</p>
													<ul className='mt-2 grid gap-1 sm:grid-cols-2 xl:grid-cols-3'>
														{people.map((p: FirstParliamentPerson) => (
															<li key={p.name} className='text-[0.875rem] text-[var(--ink-2)]'>
																{p.member ? (
																	<Link href={`/members/${p.member.slug}`} className='hover:text-[var(--accent)]'>
																		{p.member.displayName}
																	</Link>
																) : (
																	p.name
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
							</div>
						) : null}

						{/* ---- Who sat on it before: history, folded away so the current committee leads ---- */}
						{officers.length + members.length + exOfficio.length > 0 ? (
							<details className='group mb-10 border-y border-[var(--rule)]'>
								<summary className='flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden'>
									<span>
										<span className='eyebrow block'>In the Transition Authority</span>
										<span className='mt-1.5 block text-[0.8125rem] text-[var(--ink-3)]'>
											The last roster before the First Parliament: {officers.length + members.length + exOfficio.length} seats, as of {generatedAt}
										</span>
									</span>
									<span aria-hidden='true' className='text-[1.25rem] leading-none text-[var(--ink-3)] transition group-open:rotate-45'>+</span>
								</summary>
								<div className='pb-8 pt-2'>
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

								</div>
							</details>
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
								<div className='mt-4'>
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
				</Reveal>
			</div>
		</section>
	)
}
