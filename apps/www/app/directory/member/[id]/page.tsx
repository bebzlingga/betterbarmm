import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import firstParliament from '../../../../../../datasets/bills/bangsamoro_registry/members/first-parliament.json'
import parliament from '../../../../../../datasets/bills/bangsamoro_registry/members/parliament-2026.json'
import { DirectoryDialog } from '../../../_components/directory-dialog'
import { directoryOffices, memberId } from '../../../_lib/directory'
import { memberPortrait } from '../../../_lib/images'
import { pageMeta } from '../../../_lib/seo'

/* A Member of Parliament, opened over the Directory (user decision), with the profile the legislation workspace
   shows (apps/legislation/app/members/elected/page.tsx): the portrait and the seat on the left; education, career,
   political affiliation, elections, accomplishments, relatives in public life and the sources on the right. Every
   line is from a source the Member's record cites; a relative is listed only where a source states the tie. The
   measures they authored stay on the legislation workspace, which the full record links to. */

type Source = { label: string; url: string }
type Member = {
	fullName: string
	rosterName: string
	seatLabel: string
	district: string | null
	sector: string | null
	partyLabel: string | null
	votes: number | null
	born?: string | null
	birthplace?: string | null
	background?: string[]
	education?: string[]
	career?: string[]
	affiliations?: string[]
	elections?: string[]
	accomplishments?: string[]
	family?: { name?: string | null; relation: string; role?: string | null; source?: number | null }[]
	sources: Source[]
	photo?: { file: string; source?: Source } | null
}

const meta = parliament.meta as { term: { start: string; end: string } }
const members = parliament.members as unknown as Member[]
const officers = (firstParliament as unknown as { members: { url?: string | null; roles?: string[] }[] }).members
const find = (id: string) => members.find((m) => memberId(m) === id)
const LEGISLATION = 'https://legislation.betterbarmm.com'
const LABEL = 'font-mono text-[0.65625rem] font-bold uppercase tracking-[0.14em] text-[var(--brass)]'
const BULLET = 'relative pl-3.5 before:absolute before:left-0 before:top-[0.6em] before:size-1 before:bg-[var(--brass)]'
const day = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Manila' })
const sentenceCase = (s: string) => s[0]!.toUpperCase() + s.slice(1)
const words = (s: string) => s.toLowerCase().replace(/[^a-z\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2)

/** Posts a Member holds: Parliament's own (its profile page, joined by the address its portrait came from), then
 *  any office of the regional government the Directory names them as head of ("MP Atty. Naguib G. Sinarimbo"). */
function rolesOf(m: Member): string[] {
	const roles = [...(officers.find((o) => o.url && o.url === m.photo?.source?.url)?.roles ?? [])]
	const mine = new Set(words(`${m.fullName} ${m.rosterName}`))
	for (const office of directoryOffices) {
		const head = office.head?.name
		if (!head || !/^MP\b/.test(head)) continue
		const name = words(head.replace(/^MP\s+/, '').replace(/\b(Atty|Engr|Dr|Hon)\.?\s+/g, ''))
		if (!name.length || !name.every((w) => mine.has(w))) continue
		const title = office.head!.title
		const role = /^minister$/i.test(title) ? office.name.replace(/^Ministry/, 'Minister') : `${title}, ${office.name}`
		if (!roles.some((r) => r.toLowerCase() === role.toLowerCase())) roles.push(role)
	}
	return roles
}

export function generateStaticParams() {
	return members.map((m) => ({ id: memberId(m) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const m = find((await params).id)
	if (!m) return { title: 'Directory', robots: { index: false, follow: true } }
	return pageMeta({
		title: `${m.fullName} — Directory`,
		description: `${m.fullName}, ${m.seatLabel.toLowerCase()}${m.district ? ` for ${m.district}` : ''} in the Bangsamoro Parliament: career, elections and relatives in public life, from cited sources.`,
		path: `/directory/member/${memberId(m)}`,
	})
}

/** Dated lines, "2019–2023 · Role", as a timeline: the years in their own column. */
function Timeline({ title, lines }: { title: string; lines?: string[] }) {
	if (!lines?.length) return null
	return (
		<section>
			<h2 className={LABEL}>{title}</h2>
			<ol className='mt-3 grid gap-2.5 text-[0.90625rem] leading-[1.5]'>
				{lines.map((line) => {
					const cut = line.indexOf(' · ')
					const [when, what] = cut >= 0 ? [line.slice(0, cut), line.slice(cut + 3)] : ['', line]
					return (
						<li key={line} className='grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3'>
							<span className='num text-[0.8125rem] font-semibold text-[var(--ink-3)]'>{when || '—'}</span>
							<span className='text-[var(--ink-2)]'>{what}</span>
						</li>
					)
				})}
			</ol>
		</section>
	)
}

function Bullets({ title, lines }: { title: string; lines?: string[] }) {
	if (!lines?.length) return null
	return (
		<section>
			<h2 className={LABEL}>{title}</h2>
			<ul className='mt-3 grid gap-2 text-[0.90625rem] leading-[1.55] text-[var(--ink-2)]'>
				{lines.map((line) => (
					<li key={line} className={BULLET}>
						{line}
					</li>
				))}
			</ul>
		</section>
	)
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
	const m = find((await params).id)
	if (!m) notFound()
	const portrait = memberPortrait(m)
	const roles = rolesOf(m)
	const family = (m.family ?? []).map((r) => ({ ...r, source: r.source != null ? m.sources[r.source] : undefined }))
	// A tie the family list carries is said there, not again in the background.
	const background = (m.background ?? []).filter((line) => !family.some((r) => r.name && line.includes(r.name.replace(/\s*'[^']*'\s*/g, ' ').trim())))

	return (
		<DirectoryDialog id={memberId(m)} name={m.fullName}>
			<section className='bb-container py-12 lg:py-14'>
				<div className='grid gap-10 md:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14'>
					{/* The picture and the seat. */}
					<aside>
						{portrait ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={portrait.src} alt={m.fullName} className='aspect-[4/5] w-full border border-[var(--rule)] object-cover' />
						) : null}
						{m.photo?.source ? (
							<p className='mt-2 text-[0.6875rem] text-[var(--ink-mute)]'>
								Photo:{' '}
								<a href={m.photo.source.url} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)]'>
									Bangsamoro Parliament
								</a>
							</p>
						) : null}
						<dl className='mt-6 grid gap-4 bg-[var(--paper-2)] p-5 text-[0.84375rem]'>
							{roles.length ? (
								<div>
									<dt className={LABEL}>Office</dt>
									<dd className='mt-1 text-[var(--ink)]'>{roles.join(' · ')}</dd>
								</div>
							) : null}
							<div>
								<dt className={LABEL}>Seat</dt>
								<dd className='mt-1 text-[var(--ink)]'>{[m.seatLabel, m.district ?? m.sector].filter(Boolean).join(' · ')}</dd>
							</div>
							{m.partyLabel ? (
								<div>
									<dt className={LABEL}>Party</dt>
									<dd className='mt-1 text-[var(--ink)]'>{m.partyLabel}</dd>
								</div>
							) : null}
							{m.votes != null ? (
								<div>
									<dt className={LABEL}>Votes</dt>
									<dd className='num mt-1 text-[var(--ink)]'>{m.votes.toLocaleString('en-PH')}</dd>
								</div>
							) : null}
							<div>
								<dt className={LABEL}>Term</dt>
								<dd className='mt-1 text-[var(--ink)]'>
									{day(meta.term.start)} to {day(meta.term.end)}
								</dd>
							</div>
						</dl>
					</aside>

					{/* Everything known, each line from a cited source. */}
					<div className='min-w-0 space-y-8'>
						{/* The name heads the right-hand column (user decision: no red masthead). */}
						<header>
							<p className={LABEL}>Member of Parliament · {m.seatLabel}</p>
							<h1 className='mt-3 pr-10 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{m.fullName}</h1>
						</header>
						{m.born ? <p className='text-[0.90625rem] text-[var(--ink-3)]'>Born {[m.born, m.birthplace].filter(Boolean).join(', ')}</p> : null}
						<Bullets title='Education' lines={m.education} />
						<Timeline title='Career' lines={m.career} />
						<Timeline title='Political affiliation' lines={m.affiliations} />
						<Timeline title='Elections' lines={m.elections} />
						<Bullets title='Accomplishments' lines={m.accomplishments} />
						{/* Before a profile is restructured, the cited lines as they are. */}
						{!m.career?.length && !m.accomplishments?.length ? <Bullets title='Background' lines={background} /> : null}

						{family.length ? (
							<section>
								<h2 className={LABEL}>Relatives in public life</h2>
								<ul className='mt-3 grid gap-2 text-[0.90625rem] leading-snug'>
									{family.map((r) => (
										<li key={`${r.name}${r.relation}${r.role}`}>
											<span className='text-[var(--ink-3)]'>{sentenceCase(r.relation)} </span>
											{/* A private relative, such as children, is a count, not a name. */}
											{r.name ? (
												<>
													<span className='font-semibold text-[var(--ink)]'>{r.name}</span>
													{r.role ? <span className='text-[var(--ink-3)]'>, {r.role}</span> : null}
												</>
											) : (
												<span className='text-[var(--ink-2)]'>{r.role}</span>
											)}
											{r.source ? (
												<a href={r.source.url} target='_blank' rel='noreferrer' title={r.source.label} className='ml-1.5 text-[0.71875rem] text-[var(--ink-mute)] hover:text-[var(--accent)]'>
													source
												</a>
											) : null}
										</li>
									))}
								</ul>
								<p className='mt-2 text-[0.75rem] text-[var(--ink-mute)]'>Only where a source states the tie; a shared surname proves nothing.</p>
							</section>
						) : null}

						<section className='border-t border-[var(--rule)] pt-5'>
							<h2 className={LABEL}>Sources</h2>
							<ul className='mt-2 grid gap-1 text-[0.78125rem] leading-snug'>
								{m.sources.map((s) => (
									<li key={s.url + s.label}>
										<a href={s.url} target='_blank' rel='noreferrer' className='text-[var(--ink-3)] hover:text-[var(--accent)]'>
											{s.label}
										</a>
									</li>
								))}
							</ul>
						</section>

						<a href={`${LEGISLATION}/members/elected`} className='bb-btn bb-btn-solid'>
							Full record, with the measures they authored <ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
						</a>
					</div>
				</div>
			</section>
		</DirectoryDialog>
	)
}
