import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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
		<section className='mx-auto max-w-[88rem] px-6 pb-16 pt-12 lg:px-8 lg:pt-16'>
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
							<span className='badge badge-plain badge-idle'>{committee.memberCount} seated</span>
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
								<p className='mt-3 text-sm leading-6 text-[var(--ink-2)]'>
									{committee.jurisdiction}
								</p>
							</div>
						) : null}

						{committee.subcommittees ? (
							<div className='mt-8 border-t border-[var(--rule)] pt-6'>
								<p className='label label-strong'>Subcommittees</p>
								<p className='mt-3 text-sm leading-6 text-[var(--ink-2)]'>
									{committee.subcommittees}
								</p>
							</div>
						) : null}

						<p className='mt-8 border-t border-[var(--rule)] pt-6 text-xs leading-5 text-[var(--ink-mute)]'>
							Membership, jurisdiction, and referrals as published on{' '}
							<a href={committee.url} target='_blank' rel='noreferrer' className='rule-link'>
								the committee&rsquo;s official page
							</a>
							, captured {generatedAt}. The page lists current membership only.
						</p>
					</div>
				</Reveal>

				<Reveal delay={80}>
					<div>
						{/* ---- Who sits on it ---- */}
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
												<span className='num text-[13px] font-medium text-[var(--ink)]'>
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
							<p className='mt-12 max-w-2xl text-[13px] leading-6 text-[var(--ink-3)]'>
								No measures are listed as referred to this committee on its official page.
							</p>
						)}
					</div>
				</Reveal>
			</div>
		</section>
	)
}
