import type { Metadata } from 'next'
import Link from 'next/link'
import { MemberAvatar } from '../../_components/member-avatar'
import { PageHeader } from '../../_components/page-header'
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

function Card({ member }: { member: Elected }) {
	const { elected } = member
	// Cited lines first; a Transition Authority veteran without them falls
	// back on Parliament's own biosketch. A line naming a relative the family
	// list already carries is left to that list, so the tie is said once.
	const background = elected.background.filter(
		(line) => !elected.family.some((relative) => line.includes(relative.name.replace(/\s*'[^']*'\s*/g, ' ').trim())),
	)
	return (
		<article className='flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-5'>
			<div className='flex items-start gap-4'>
				<MemberAvatar name={member.displayName} src={member.photoUrl} />
				<div className='min-w-0'>
					<h3 className='text-[16px] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]'>
						<Link href={`/members/${member.slug}`} className='hover:text-[var(--accent)]'>
							{member.displayName}
						</Link>
					</h3>
					<p className='mt-1 text-[12.5px] leading-snug text-[var(--ink-3)]'>
						{[elected.where, elected.party].filter(Boolean).join(' · ')}
					</p>
					{elected.votes != null ? (
						<p className='num mt-1 text-[12px] text-[var(--ink-mute)]'>{elected.votes.toLocaleString('en-PH')} votes</p>
					) : null}
				</div>
			</div>

			{member.phases.length > 1 ? (
				<p className='mt-4 self-start bg-[var(--paper-2)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]'>
					Sat in the Transition Authority
					{member.principalCount ? ` · ${member.principalCount} measures as principal` : ''}
				</p>
			) : null}

			{elected.born || elected.education.length ? (
				<dl className='mt-4 grid gap-1.5 text-[12.5px]'>
					{elected.born ? (
						<div className='flex gap-2'>
							<dt className='w-16 shrink-0 text-[var(--ink-mute)]'>Born</dt>
							<dd className='text-[var(--ink-2)]'>{[elected.born, elected.birthplace].filter(Boolean).join(', ')}</dd>
						</div>
					) : null}
					{elected.education.length ? (
						<div className='flex gap-2'>
							<dt className='w-16 shrink-0 text-[var(--ink-mute)]'>Studied</dt>
							<dd className='text-[var(--ink-2)]'>{elected.education.join('; ')}</dd>
						</div>
					) : null}
				</dl>
			) : null}

			{background.length ? (
				<ul className='mt-4 grid gap-2 text-[13px] leading-[1.6] text-[var(--ink-2)]'>
					{background.slice(0, 3).map((line) => (
						<li key={line} className='relative pl-3.5 before:absolute before:left-0 before:top-[0.6em] before:size-1 before:bg-[var(--brass)]'>
							{line}
						</li>
					))}
				</ul>
			) : member.bio.length ? (
				// Parliament's own biosketch, opened; the rest is on their page.
				<p className='mt-4 line-clamp-4 text-[13px] leading-[1.6] text-[var(--ink-2)]'>{member.bio[0]}</p>
			) : (
				<p className='mt-4 text-[13px] text-[var(--ink-mute)]'>Nothing found and cited beyond the ballot yet.</p>
			)}

			{elected.family.length ? (
				<div className='mt-5 border-t border-[var(--rule)] pt-4'>
					<p className='text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>Family in public life</p>
					<ul className='mt-2 grid gap-1.5 text-[13px] leading-snug'>
						{elected.family.map((relative) => (
							<li key={relative.name + relative.relation}>
								<span className='text-[var(--ink-3)]'>{relative.relation[0]!.toUpperCase() + relative.relation.slice(1)} </span>
								<span className='font-semibold text-[var(--ink)]'>{relative.name}</span>
								{relative.role ? <span className='text-[var(--ink-3)]'>, {relative.role}</span> : null}
								{relative.source ? (
									<a href={relative.source.url} target='_blank' rel='noreferrer' title={relative.source.label} className='ml-1 text-[11px] text-[var(--ink-mute)] hover:text-[var(--accent)]'>
										[source]
									</a>
								) : null}
							</li>
						))}
					</ul>
				</div>
			) : null}

			<Link href={`/members/${member.slug}`} className='mt-auto pt-5 text-[12.5px] font-semibold text-[var(--accent)]'>
				Full profile →
			</Link>
		</article>
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
