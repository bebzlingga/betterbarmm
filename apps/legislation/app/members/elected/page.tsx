import type { Metadata } from 'next'
import Link from 'next/link'
import { MEMBER_CARD_FOOT, MemberAvatar, MemberPortrait } from '../../_components/member-avatar'
import { BandSectionTitle, RegistryBand } from '../../_components/registry-band'
import { ProfileDialog } from '../../_components/profile-dialog'
import { getElectedMembers, getFirstParliament, type ElectedSeat, type FirstParliamentPerson, type Member } from '../../_lib/members-data'

export const metadata: Metadata = {
	title: 'First Parliament',
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

/** A kind of seat's Members as the page lists them: districts by province,
 *  party seats by party, the rest as one group. */
function groupsFor(id: string, seated: Elected[]): [string, Elected[]][] {
	if (!seated.length) return []
	if (id === 'district')
		return groupBy([...seated].sort((a, b) => (a.elected.where ?? '').localeCompare(b.elected.where ?? '')), (m) => province(m.elected.where))
	if (id === 'party')
		return groupBy(
			[...seated].sort((a, b) => (a.elected.party ?? '').localeCompare(b.elected.party ?? '') || a.displayName.localeCompare(b.displayName)),
			(m) => m.elected.party ?? 'Independent',
		)
	return [['', seated]]
}

function groupBy(members: Elected[], key: (m: Elected) => string) {
	const groups = new Map<string, Elected[]>()
	for (const m of members) groups.set(key(m), [...(groups.get(key(m)) ?? []), m])
	return [...groups]
}

const sentenceCase = (s: string) => s[0]!.toUpperCase() + s.slice(1)

const BULLET = 'relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-[var(--accent)]'

const LABEL = 'text-[0.65625rem] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'

/** Relatives named with a public role. */
const publicRelatives = (elected: ElectedSeat) => elected.family.filter((relative) => relative.name && relative.role)

/** Dated lines, "2019–2023 · Role", as a timeline: the years in their own column. */
function Timeline({ title, lines }: { title: string; lines: string[] }) {
	if (!lines.length) return null
	return (
		<section className='mt-7'>
			<h3 className={LABEL}>{title}</h3>
			<ol className='mt-3 grid gap-2.5 text-[0.875rem] leading-[1.5]'>
				{lines.map((line) => {
					const cut = line.indexOf(' · ')
					const [when, what] = cut >= 0 ? [line.slice(0, cut), line.slice(cut + 3)] : ['', line]
					return (
						<li key={line} className='grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3'>
							<span className='num text-[0.78125rem] font-semibold text-[var(--ink-3)]'>{when || '—'}</span>
							<span className='text-[var(--ink-2)]'>{what}</span>
						</li>
					)
				})}
			</ol>
		</section>
	)
}

/** The lines to show: cited ones, less any naming a relative the family list
 *  already carries, so a tie is said once. */
function backgroundOf({ elected }: Elected) {
	return elected.background.filter(
		(line) => !elected.family.some((relative) => relative.name != null && line.includes(relative.name.replace(/\s*'[^']*'\s*/g, ' ').trim())),
	)
}

/** The card, as the roster draws a Member: the face, the name, the posts they hold and where they won, centred; the
 *  rest of the record at the foot. */
function CardFace({ member }: { member: Elected }) {
	const { elected } = member
	const relatives = publicRelatives(elected).length
	return (
		<>
			<div className='flex flex-1 flex-col items-center px-5 pb-6 pt-7'>
				<MemberPortrait name={member.displayName} src={member.photoUrl} />
				<h3 className='mt-4 font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold leading-snug tracking-[-0.015em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{member.displayName}</h3>
				{elected.roles.length ? <p className='mt-1 text-[0.75rem] font-semibold leading-snug text-[var(--accent)]'>{elected.roles.join(' · ')}</p> : null}
				<p className='mt-1.5 text-[0.78125rem] leading-snug text-[var(--ink-3)]'>{[elected.where, elected.party].filter(Boolean).join(' · ')}</p>
				{member.phases.length > 1 || relatives ? (
					<p className='mt-3 flex flex-wrap justify-center gap-1.5'>
						{member.phases.length > 1 ? <span className='badge badge-plain badge-role'>Transition Authority</span> : null}
						{relatives ? (
							<span className='badge badge-plain badge-idle'>
								{relatives} {relatives === 1 ? 'relative' : 'relatives'} in public life
							</span>
						) : null}
					</p>
				) : null}
			</div>
			<div className={MEMBER_CARD_FOOT}>
				<span className='num text-[var(--ink-3)] group-hover:text-white/85'>{elected.votes != null ? `${elected.votes.toLocaleString('en-PH')} votes` : 'No vote count'}</span>
				<span className='inline-flex items-center gap-1.5 font-semibold'>
					View profile
					<svg className='size-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<path d='M5 12h14M13 6l6 6-6 6' />
					</svg>
				</span>
			</div>
		</>
	)
}

/** The profile: the picture left, everything known right. */
function Profile({ member }: { member: Elected }) {
	const { elected } = member
	const background = backgroundOf(member)
	const lines = background.length ? background : member.bio
	const principal = member.measures
		.filter((measure) => measure.role === 'Principal Author')
		.sort((a, b) => b.dateIso.localeCompare(a.dateIso))
		.slice(0, 6)
	return (
		// Each column scrolls on its own, so the picture and the close button stay put.
		<div className='grid h-full min-h-0 overflow-y-auto overscroll-contain md:grid-cols-[22rem_minmax(0,1fr)] md:overflow-hidden'>
			<div className='tv-wash p-6 md:overflow-y-auto md:overscroll-contain md:p-8'>
				{member.photoUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- local portrait, unsized
					<img src={member.photoUrl} alt={member.displayName} className='aspect-[4/5] w-full rounded-[1.5rem] object-cover object-top' />
				) : (
					<div className='grid aspect-[4/5] w-full place-items-center rounded-[1.5rem] bg-[var(--paper)] p-10' title={`No official photograph found for ${member.displayName}`}>
						{/* eslint-disable-next-line @next/next/no-img-element -- the seal, sized by its frame */}
						<img src='/images/members/BTA-logo.png' alt='' aria-hidden='true' className='w-2/3 opacity-60' />
					</div>
				)}
				{elected.photoSource ? (
					<p className='mt-2 text-[0.6875rem] text-[var(--ink-mute)]'>
						Photo:{' '}
						<a href={elected.photoSource.url} target='_blank' rel='noreferrer' className='rule-link'>
							{elected.photoSource.label}
						</a>
					</p>
				) : null}
				<dl className='mt-6 grid gap-4 text-[0.8125rem]'>
					{elected.roles.length ? (
						<div>
							<dt className={LABEL}>Office</dt>
							<dd className='mt-1 text-[var(--ink)]'>{elected.roles.join(' · ')}</dd>
						</div>
					) : null}
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

			<div className='p-6 md:overflow-y-auto md:overscroll-contain md:p-10'>
				<h2 className='pr-10 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{member.displayName}</h2>
				{member.phases.length > 1 ? (
					<p className='mt-2 text-[0.8125rem] text-[var(--ink-3)]'>
						Sat in the Transition Authority{member.principalCount ? ` · ${member.principalCount} measures as principal` : ''}
					</p>
				) : null}

				{elected.born ? (
					<p className='mt-4 text-[0.84375rem] text-[var(--ink-3)]'>
						Born {[elected.born, elected.birthplace].filter(Boolean).join(', ')}
					</p>
				) : null}

				{elected.education.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Education</h3>
						<ul className='mt-3 grid gap-2 text-[0.875rem] leading-[1.55] text-[var(--ink-2)]'>
							{elected.education.map((line) => (
								<li key={line} className={BULLET}>
									{line}
								</li>
							))}
						</ul>
					</section>
				) : null}

				<Timeline title='Career' lines={elected.career} />
				<Timeline title='Political affiliation' lines={elected.affiliations} />
				<Timeline title='Elections' lines={elected.elections} />

				{elected.accomplishments.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Accomplishments</h3>
						<ul className='mt-3 grid gap-2 text-[0.875rem] leading-[1.55] text-[var(--ink-2)]'>
							{elected.accomplishments.map((line) => (
								<li key={line} className={BULLET}>
									{line}
								</li>
							))}
						</ul>
					</section>
				) : null}

				{/* Before a profile is restructured, the cited lines as they are. */}
				{!elected.career.length && !elected.accomplishments.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Background</h3>
						{lines.length ? (
							<ul className='mt-3 grid gap-2 text-[0.875rem] leading-[1.55] text-[var(--ink-2)]'>
								{lines.map((line) => (
									<li key={line} className={BULLET}>
										{line}
									</li>
								))}
							</ul>
						) : (
							<p className='mt-3 text-[0.84375rem] text-[var(--ink-mute)]'>Nothing found and cited beyond the ballot yet.</p>
						)}
					</section>
				) : null}

				{principal.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Recent measures as principal author</h3>
						<ul className='mt-3 grid gap-2 text-[0.84375rem] leading-snug'>
							{principal.map((measure) => (
								<li key={measure.id} className='rounded-xl bg-[var(--paper-2)] px-4 py-3'>
									<Link href={measure.href} className='line-clamp-2 text-[var(--ink)] hover:text-[var(--accent)]'>
										<span className='num mr-2 font-semibold text-[var(--ink)]'>{measure.numberLabel}</span>
										{measure.title}
									</Link>
									<span className='mt-0.5 block text-[0.75rem] text-[var(--ink-mute)]'>
										{[measure.status, measure.dateDisplay].filter(Boolean).join(' · ')}
									</span>
								</li>
							))}
						</ul>
						{member.principalCount > principal.length ? (
							<p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>
								And {member.principalCount - principal.length} more on their full record.
							</p>
						) : null}
					</section>
				) : null}

				{elected.family.length ? (
					<section className='mt-7'>
						<h3 className={LABEL}>Family</h3>
						<ul className='mt-3 grid gap-2 text-[0.875rem] leading-snug'>
							{elected.family.map((relative) => (
								<li key={`${relative.name}${relative.relation}${relative.role}`}>
									<span className='text-[var(--ink-3)]'>{sentenceCase(relative.relation)} </span>
									{/* A private relative, such as children, is a count, not a name. */}
									{relative.name ? (
										<>
											<span className='font-semibold text-[var(--ink)]'>{relative.name}</span>
											{relative.role ? <span className='text-[var(--ink-3)]'>, {relative.role}</span> : null}
										</>
									) : (
										<span className='text-[var(--ink-2)]'>{relative.role}</span>
									)}
									{relative.source ? (
										<a href={relative.source.url} target='_blank' rel='noreferrer' title={relative.source.label} className='ml-1.5 text-[0.71875rem] text-[var(--ink-mute)] hover:text-[var(--accent)]'>
											source
										</a>
									) : null}
								</li>
							))}
						</ul>
					</section>
				) : null}

				{elected.sources.length ? (
					<section className='mt-8 border-t border-[var(--rule-soft)] pt-6'>
						<h3 className={LABEL}>Sources</h3>
						<ul className='mt-2 grid gap-1 text-[0.75rem] leading-snug'>
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

				<Link href={`/members/${member.slug}`} className='dv-btn dv-btn-accent mt-8'>
					Full record
					<svg className='size-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<path d='M5 12h14M13 6l6 6-6 6' />
					</svg>
				</Link>
			</div>
		</div>
	)
}

type Neighbour = { id: string; name: string; photo?: string }

function Card({ member, prev, next }: { member: Elected; prev?: Neighbour; next?: Neighbour }) {
	return (
		<ProfileDialog id={member.slug} label={`Profile of ${member.displayName}`} card={<CardFace member={member} />} prev={prev} next={next}>
			<Profile member={member} />
		</ProfileDialog>
	)
}

/** One person in an office: the portrait and name, linked to their record where they are a Member. */
function Holder({ p, role }: { p: FirstParliamentPerson | { name: string; member?: Member }; role?: string }) {
	const name = p.member?.displayName ?? p.name
	const body = (
		<>
			<MemberAvatar name={name} src={p.member?.photoUrl} />
			<span className='min-w-0'>
				<span className='block text-[0.9375rem] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{name}</span>
				{role ? <span className='mt-0.5 block text-[0.75rem] leading-snug text-[var(--ink-3)]'>{role}</span> : null}
			</span>
		</>
	)
	return p.member ? (
		<Link href={`/members/${p.member.slug}`} className='group flex items-center gap-4 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-3 pr-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'>
			{body}
		</Link>
	) : (
		<div className='flex items-center gap-4 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-3 pr-5'>{body}</div>
	)
}

/** The chamber's officers, the cabinet seats Members hold, and the Secretariat, as Parliament's site lists them. */
function Officers() {
	const fp = getFirstParliament()
	if (!fp.speaker) return null
	const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s.-])([a-z])/g, (m) => m.toUpperCase())
	const groups: { title: string; people: { p: FirstParliamentPerson; role?: string }[] }[] = [
		{ title: 'Speaker', people: [{ p: fp.speaker }] },
		{ title: 'Deputy Speakers', people: fp.deputySpeakers.map((p) => ({ p })) },
		{ title: 'Majority Floor Leader', people: fp.floorLeader ? [{ p: fp.floorLeader }] : [] },
		{ title: 'Deputy Majority Floor Leaders', people: fp.deputyFloorLeaders.map((p) => ({ p })) },
		{ title: 'In the cabinet', people: fp.cabinet.map((c) => ({ p: { name: c.member.displayName, member: c.member }, role: c.roles.join(' · ') })) },
	]
	return (
		<section id='officers' className='tv-wash scroll-mt-24'>
			<div className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
				<BandSectionTitle title='Who presides, and who runs the House' lead='The chamber’s officers, the cabinet seats Members hold, and the Secretariat.' />
				<div className='mt-12 grid gap-x-12 gap-y-12 lg:grid-cols-2'>
					{groups.filter((g) => g.people.length).map((g) => (
						<div key={g.title} className={g.people.length > 4 ? 'lg:col-span-2' : ''}>
							<h3 className={LABEL}>{g.title}</h3>
							<div className={`mt-4 grid gap-3 ${g.people.length > 4 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'}`}>
								{g.people.map(({ p, role }) => (
									<Holder key={p.name} p={p} role={role} />
								))}
							</div>
						</div>
					))}
					<div>
						<h3 className={LABEL}>Secretariat</h3>
						<dl className='mt-4 grid gap-3 rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-5 text-[0.9375rem]'>
							{fp.secretaryGeneral ? (
								<div>
									<dt className='text-[0.75rem] text-[var(--ink-3)]'>Secretary General</dt>
									<dd className='font-bold text-[var(--ink)]'>{titleCase(fp.secretaryGeneral.split(', ').reverse().join(' '))}</dd>
								</div>
							) : null}
							{fp.sergeantAtArms ? (
								<div>
									<dt className='text-[0.75rem] text-[var(--ink-3)]'>Sergeant-at-Arms</dt>
									<dd className='font-bold text-[var(--ink)]'>{titleCase(fp.sergeantAtArms)}</dd>
								</div>
							) : null}
						</dl>
					</div>
				</div>
				<p className='mt-10 text-[0.78125rem] text-[var(--ink-3)]'>
					From Parliament’s{' '}
					<a href={fp.source ?? 'https://parliament.bangsamoro.gov.ph/parliament-officers/'} target='_blank' rel='noreferrer' className='rule-link'>
						officers page
					</a>
					{fp.captured ? `, as of ${new Date(fp.captured).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}; cabinet posts from the BetterBARMM Directory.
				</p>
			</div>
		</section>
	)
}

export default function ElectedPage() {
	const members = getElectedMembers()
	const sections = SEATS.map((s) => groupsFor(s.id, members.filter((m) => m.elected.seat === s.seat)))
	// The page's own order, so Previous and Next walk it as a reader would.
	const order = sections.flatMap((groups) => groups.flatMap(([, list]) => list))
	const neighbour = (m?: Elected) => (m ? { id: m.slug, name: m.displayName, photo: m.photoUrl } : undefined)
	const withFamily = members.filter((m) => publicRelatives(m.elected).length).length
	const veterans = members.filter((m) => m.phases.length > 1).length

	return (
		<>
			<RegistryBand
				label='Elected 14 September 2026 · sitting from 30 October 2026'
				title='The First Parliament'
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>{members.length} Members. </span>
						The Bangsamoro’s first elected Parliament: who presides, who sits in the cabinet, and every Member by the seat they won.
					</>
				}
				side={
					/* The make-up at a glance, and a way down to each kind of seat: a cream card on the header's right. */
					<nav aria-label='Seats' className='rounded-[var(--dv-r)] bg-[#f6f1ea] p-3 text-[#1d1a16] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] sm:p-4'>
						<ol className='grid grid-cols-2 gap-2'>
							{SEATS.map((s) => {
								const count = members.filter((m) => m.elected.seat === s.seat).length
								return (
									<li key={s.id}>
										<a href={`#${s.id}`} className='group flex h-full flex-col rounded-2xl p-4 transition hover:bg-white sm:p-5'>
											<span className='num font-[family-name:var(--font-display)] text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] text-[#8a2418]'>{count}</span>
											<span className='mt-3 text-[0.9375rem] font-extrabold'>{s.title}</span>
											<span className='mt-1 text-[0.78125rem] leading-snug text-[#5c564d]'>{s.note}</span>
										</a>
									</li>
								)
							})}
						</ol>
					</nav>
				}
			/>

			<Officers />

			{SEATS.map((s, i) => {
				const groups = sections[i]!
				if (!groups.length) return null
				return (
					<section key={s.id} id={s.id} className={`scroll-mt-24 ${i % 2 ? 'tv-wash-flip' : ''}`}>
						<div className='bb-container py-[clamp(4.5rem,9vw,8rem)]'>
							<BandSectionTitle title={s.title} count={groups.reduce((n, [, list]) => n + list.length, 0)} lead={s.note} />
							{groups.map(([name, list]) => (
								<div key={name} className='mt-12'>
									{name ? (
										<h3 className='mb-5 font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
											{name} <span className='font-semibold text-[var(--ink-mute)]'>· {list.length}</span>
										</h3>
									) : null}
									<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
										{list.map((m) => (
											<Card
												key={m.slug}
												member={m}
												prev={neighbour(order[order.indexOf(m) - 1])}
												next={neighbour(order[order.indexOf(m) + 1])}
											/>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
				)
			})}

			{/* How the page was put together, after the Members themselves. */}
			<section className='border-t border-[var(--rule-soft)]'>
				<div className='bb-container py-14'>
				<p className='text-[0.875rem] leading-[1.7] text-[var(--ink-3)]'>
					{veterans} of the {members.length} sat in the Transition Authority; their full record is on their page. {withFamily} have a relative in public life
					that a source names. A relationship is listed only where a source states it, never from a shared surname. Something wrong or missing?{' '}
					<a href='https://betterbarmm.com/contact' className='rule-link'>
						Tell us
					</a>
					.
				</p>
				</div>
			</section>
		</>
	)
}
