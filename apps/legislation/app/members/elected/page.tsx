import type { Metadata } from 'next'
import Link from 'next/link'
import { MemberAvatar } from '../../_components/member-avatar'
import { PageHeader } from '../../_components/page-header'
import { ProfileDialog } from '../../_components/profile-dialog'
import { getElectedMembers, type ElectedSeat, type Member } from '../../_lib/members-data'

export const metadata: Metadata = {
	title: 'Elected Parliament',
	description:
		'The 80 Members elected to the first Bangsamoro Parliament on 14 September 2026: who they are, the seat they won, what they did before, and their relatives in public life — each from a cited source.',
}

/* ============================================================
   The first elected Parliament, one card a Member

   The seat and the vote, what they did before, and relatives in public
   life. Every line comes from a source the Member's record cites; a
   relationship is listed only where a source states it, never inferred
   from a shared surname, which in the region proves nothing.
   ============================================================ */

type Elected = Member & { elected: ElectedSeat }

const SEATS = [
	{ id: 'district', seat: 'District representative', title: 'District seats', note: 'Won by vote in a district.' },
	{ id: 'party', seat: 'Party representative', title: 'Party seats', note: 'Filled from the lists of the parties that won the regional vote.' },
	{ id: 'sectoral', seat: 'Sectoral representative', title: 'Sectoral seats', note: 'Women, youth, the ulama, settlers and traditional leaders.' },
	{ id: 'indigenous', seat: 'Non-Moro indigenous peoples representative', title: 'Indigenous seats', note: 'For the non-Moro indigenous peoples.' },
]

/** "Basilan's 1st district" → "Basilan". */
const province = (where?: string) => where?.split("'s ")[0] ?? 'Other'

function groupBy(members: Elected[], key: (m: Elected) => string) {
	const groups = new Map<string, Elected[]>()
	for (const m of members) groups.set(key(m), [...(groups.get(key(m)) ?? []), m])
	return [...groups]
}

const sentenceCase = (s: string) => s[0]!.toUpperCase() + s.slice(1)

const LABEL = 'text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'

/** The lines to show: cited ones, less any naming a relative the family list
 *  already carries, so a tie is said once. */
function backgroundOf({ elected }: Elected) {
	return elected.background.filter(
		(line) => !elected.family.some((relative) => line.includes(relative.name.replace(/\s*'[^']*'\s*/g, ' ').trim())),
	)
}

/** The card: who, where, and a taste of the rest. */
function CardFace({ member }: { member: Elected }) {
	const { elected } = member
	const background = backgroundOf(member)
	return (
		<>
			<div className='flex items-start gap-4'>
				<MemberAvatar name={member.displayName} src={member.photoUrl} />
				<div className='min-w-0'>
					<h3 className='text-[16px] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{member.displayName}</h3>
					<p className='mt-1 text-[12.5px] leading-snug text-[var(--ink-3)]'>{[elected.where, elected.party].filter(Boolean).join(' · ')}</p>
					{elected.votes != null ? <p className='num mt-1 text-[12px] text-[var(--ink-mute)]'>{elected.votes.toLocaleString('en-PH')} votes</p> : null}
				</div>
			</div>
			{background.length || member.bio.length ? (
				<p className='mt-4 line-clamp-3 text-[13px] leading-[1.6] text-[var(--ink-2)]'>{background[0] ?? member.bio[0]}</p>
			) : (
				<p className='mt-4 text-[13px] text-[var(--ink-mute)]'>Nothing found and cited beyond the ballot yet.</p>
			)}
			<div className='mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-5 text-[11.5px]'>
				{member.phases.length > 1 ? <span className='bg-[var(--paper-2)] px-2 py-0.5 font-semibold text-[var(--ink-2)]'>Transition Authority</span> : null}
				{elected.family.length ? (
					<span className='bg-[var(--paper-2)] px-2 py-0.5 font-semibold text-[var(--ink-2)]'>
						{elected.family.length} {elected.family.length === 1 ? 'relative' : 'relatives'} in public life
					</span>
				) : null}
				<span className='ml-auto font-semibold text-[var(--accent)]'>View profile</span>
			</div>
		</>
	)
}

/** The profile: the picture left, everything known right. */
function Profile({ member }: { member: Elected }) {
	const { elected } = member
	const background = backgroundOf(member)
	const lines = background.length ? background : member.bio
	return (
		<div className='grid md:grid-cols-[17rem_minmax(0,1fr)]'>
			<div className='bg-[var(--paper-2)] p-6 md:p-7'>
				{member.photoUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- local portrait, unsized
					<img src={member.photoUrl} alt={member.displayName} className='aspect-[4/5] w-full border border-[var(--rule)] object-cover' />
				) : (
					<div className='grid aspect-[4/5] w-full place-items-center border border-[var(--rule)] bg-[var(--paper)] p-10' title={`No official photograph found for ${member.displayName}`}>
						{/* eslint-disable-next-line @next/next/no-img-element -- the seal, sized by its frame */}
						<img src='/images/members/BTA-logo.png' alt='' aria-hidden='true' className='w-2/3 opacity-60' />
					</div>
				)}
				{elected.photoSource ? (
					<p className='mt-2 text-[11px] text-[var(--ink-mute)]'>
						Photo:{' '}
						<a href={elected.photoSource.url} target='_blank' rel='noreferrer' className='rule-link'>
							{elected.photoSource.label}
						</a>
					</p>
				) : null}
				<dl className='mt-6 grid gap-4 text-[13px]'>
					<div>
						<dt className={LABEL}>Seat</dt>
						<dd className='mt-1 text-[var(--ink)]'>{[elected.seat, elected.where].filter(Boolean).join(' · ')}</dd>
					</div>
					{elected.party ? (
						<div>
							<dt className={LABEL}>Party</dt>
							<dd className='mt-1 text-[var(--ink)]'>{elected.party}</dd>
						</div>
					) : null}
					{elected.votes != null ? (
						<div>
							<dt className={LABEL}>Votes</dt>
							<dd className='num mt-1 text-[var(--ink)]'>{elected.votes.toLocaleString('en-PH')}</dd>
						</div>
					) : null}
					<div>
						<dt className={LABEL}>Term</dt>
						<dd className='mt-1 text-[var(--ink)]'>{elected.term}</dd>
					</div>
				</dl>
			</div>

			<div className='p-6 md:p-8'>
				<h2 className='pr-8 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{member.displayName}</h2>
				{member.phases.length > 1 ? (
					<p className='mt-2 text-[13px] text-[var(--ink-3)]'>
						Sat in the Transition Authority{member.principalCount ? ` · ${member.principalCount} measures as principal` : ''}
					</p>
				) : null}

				{elected.born || elected.education.length ? (
					<dl className='mt-6 grid gap-3 text-[13.5px] sm:grid-cols-[6rem_minmax(0,1fr)]'>
						{elected.born ? (
							<>
								<dt className='text-[var(--ink-mute)]'>Born</dt>
								<dd className='text-[var(--ink-2)]'>{[elected.born, elected.birthplace].filter(Boolean).join(', ')}</dd>
							</>
						) : null}
						{elected.education.length ? (
							<>
								<dt className='text-[var(--ink-mute)]'>Education</dt>
								<dd>
									<ul className='grid gap-1 text-[var(--ink-2)]'>
										{elected.education.map((line) => (
											<li key={line}>{line}</li>
										))}
									</ul>
								</dd>
							</>
						) : null}
					</dl>
				) : null}

				<section className='mt-7'>
					<h3 className={LABEL}>Background</h3>
					{lines.length ? (
						<ul className='mt-3 grid gap-2.5 text-[14px] leading-[1.65] text-[var(--ink-2)]'>
							{lines.map((line) => (
								<li key={line} className='relative pl-3.5 before:absolute before:left-0 before:top-[0.65em] before:size-1 before:bg-[var(--brass)]'>
									{line}
								</li>
							))}
						</ul>
					) : (
						<p className='mt-3 text-[13.5px] text-[var(--ink-mute)]'>Nothing found and cited beyond the ballot yet.</p>
					)}
				</section>

				{elected.family.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Family in public life</h3>
						<ul className='mt-3 grid gap-2 text-[14px] leading-snug'>
							{elected.family.map((relative) => (
								<li key={relative.name + relative.relation}>
									<span className='text-[var(--ink-3)]'>{sentenceCase(relative.relation)} </span>
									<span className='font-semibold text-[var(--ink)]'>{relative.name}</span>
									{relative.role ? <span className='text-[var(--ink-3)]'>, {relative.role}</span> : null}
									{relative.source ? (
										<a href={relative.source.url} target='_blank' rel='noreferrer' title={relative.source.label} className='ml-1.5 text-[11.5px] text-[var(--ink-mute)] hover:text-[var(--accent)]'>
											source
										</a>
									) : null}
								</li>
							))}
						</ul>
					</section>
				) : null}

				{elected.sources.length ? (
					<section className='mt-7 border-t border-[var(--rule)] pt-5'>
						<h3 className={LABEL}>Sources</h3>
						<ul className='mt-2 grid gap-1 text-[12px] leading-snug'>
							{elected.sources.map((source) => (
								<li key={source.url}>
									<a href={source.url} target='_blank' rel='noreferrer' className='text-[var(--ink-3)] hover:text-[var(--accent)]'>
										{source.label}
									</a>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<Link href={`/members/${member.slug}`} className='bb-btn bb-btn-solid mt-8'>
					Full record
				</Link>
			</div>
		</div>
	)
}

function Card({ member }: { member: Elected }) {
	return (
		<ProfileDialog label={`Profile of ${member.displayName}`} card={<CardFace member={member} />}>
			<Profile member={member} />
		</ProfileDialog>
	)
}

export default function ElectedPage() {
	const members = getElectedMembers()
	const withFamily = members.filter((m) => m.elected.family.length).length
	const veterans = members.filter((m) => m.phases.length > 1).length

	return (
		<>
			<PageHeader
				emphasis='brand'
				align='left'
				size='compact'
				eyebrow={`${members.length} Members · elected 14 September 2026`}
				title='The first elected'
				titleMuted='Parliament.'
			/>

			{/* The make-up at a glance, and a way down to each kind of seat. */}
			<nav aria-label='Seats' className='border-b border-[var(--rule)]'>
				<ol className='bb-container grid grid-cols-2 lg:grid-cols-4'>
					{SEATS.map((s) => {
						const count = members.filter((m) => m.elected.seat === s.seat).length
						return (
							<li key={s.id} className='border-[var(--rule)] max-lg:border-b max-lg:odd:border-r lg:border-r lg:first:border-l'>
								<a href={`#${s.id}`} className='group flex h-full flex-col px-5 py-6 transition hover:bg-[var(--paper-2)] sm:px-8'>
									<span className='num text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>{count}</span>
									<span className='mt-2 text-[14px] font-bold text-[var(--ink)] group-hover:text-[var(--accent)]'>{s.title}</span>
									<span className='mt-1 text-[12px] leading-snug text-[var(--ink-3)]'>{s.note}</span>
								</a>
							</li>
						)
					})}
				</ol>
			</nav>

			<div className='bb-container pt-10'>
				<p className='max-w-[52rem] text-[13.5px] leading-[1.7] text-[var(--ink-3)]'>
					{veterans} of the {members.length} sat in the Transition Authority; their full record is on their page. {withFamily} have a relative in public life
					that a source names. A relationship is listed only where a source states it, never from a shared surname. Something wrong or missing?{' '}
					<a href='https://betterbarmm.com/contact' className='rule-link'>
						Tell us
					</a>
					.
				</p>
			</div>

			{SEATS.map((s, i) => {
				const seated = members.filter((m) => m.elected.seat === s.seat)
				if (!seated.length) return null
				const groups =
					s.id === 'district'
						? groupBy([...seated].sort((a, b) => (a.elected.where ?? '').localeCompare(b.elected.where ?? '')), (m) => province(m.elected.where))
						: s.id === 'party'
							? groupBy([...seated].sort((a, b) => (a.elected.party ?? '').localeCompare(b.elected.party ?? '') || a.displayName.localeCompare(b.displayName)), (m) => m.elected.party ?? 'Independent')
							: [['', seated] as [string, Elected[]]]
				return (
					<section key={s.id} id={s.id} className={`scroll-mt-24 ${i % 2 ? 'bg-[var(--paper-2)]' : ''}`}>
						<div className='bb-container bb-section'>
							<p className='bb-label'>{String(i + 1).padStart(2, '0')}</p>
							<h2 className='mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{s.title}</h2>
							{groups.map(([name, list]) => (
								<div key={name} className='mt-10'>
									{name ? (
										<h3 className='mb-4 flex items-baseline gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-2)]'>
											{name}
											<span className='num text-[var(--ink-mute)]'>{list.length}</span>
										</h3>
									) : null}
									<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
										{list.map((m) => (
											<Card key={m.slug} member={m} />
										))}
									</div>
								</div>
							))}
						</div>
					</section>
				)
			})}
		</>
	)
}
