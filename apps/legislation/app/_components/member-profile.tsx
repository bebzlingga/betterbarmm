import type { Member } from '../_lib/members-data'
import { MemberAvatar } from './member-avatar'

/* ============================================================
   Who a member is

   Column one of a profile: the person, their term, and where they sat.
   What carries their name is column two, in `member-record`, which is
   interactive and ships as a client component — this side stays static
   markup rendered on the server.
   ============================================================ */

/**
 * One labelled cell in the fact list. Several values stack as lines.
 *
 * The label takes full ink — `label-strong` — because in this column it is a
 * heading standing on its own rather than a caption annotating a number, and
 * a muted grey made the list read as a footnote.
 */
function Fact({ label, value }: { label: string; value: string | string[] }) {
	const lines = Array.isArray(value) ? value : [value]

	return (
		<div>
			{/* The same heading the record page gives its blocks: brass capitals
			    at the heavier weight, so a member's particulars read as the page's
			    structure and the answers under them carry the ink. */}
			<p className='label label-section'>{label}</p>
			<div className='mt-2.5 bb-body text-[var(--ink-2)]'>
				{lines.map((line, index) => (
					<p key={index}>{line}</p>
				))}
			</div>
		</div>
	)
}

/**
 * Words that end in a full stop without ending a sentence. Without these,
 * "MP Akmad I. Abas" and "Piang, Ramon A., Sr. He served…" both split in the
 * wrong place, and the opening line of a biography reads as a fragment.
 */
const ABBREVIATIONS = new Set([
	'MR',
	'MRS',
	'MS',
	'DR',
	'ATTY',
	'HON',
	'ENGR',
	'PROF',
	'GEN',
	'COL',
	'SGT',
	'JR',
	'SR',
	'ST',
	'NO',
	'MP',
	'PHD',
])

/** Splits on sentence ends, stepping over initials and titles. */
function toSentences(text: string): string[] {
	const boundary = /[.!?]\s+(?=[A-Z“"(])/g
	const sentences: string[] = []
	let start = 0
	let match: RegExpExecArray | null

	while ((match = boundary.exec(text)) !== null) {
		const end = match.index + 1
		const word =
			text
				.slice(start, end)
				.replace(/[.!?]$/, '')
				.split(/\s+/)
				.pop() ?? ''

		// A single letter is an initial; the rest are titles and suffixes.
		if (word.length <= 1 || ABBREVIATIONS.has(word.replace(/\./g, '').toUpperCase())) continue

		sentences.push(text.slice(start, end).trim())
		start = end
	}

	const tail = text.slice(start).trim()
	if (tail) sentences.push(tail)

	return sentences
}

const HONORIFICS = new Set([
	'MP',
	'ATTY',
	'HON',
	'DR',
	'MR',
	'MRS',
	'MS',
	'ENGR',
	'PROF',
	'BAI',
	'DATU',
	'SULTAN',
	'ALHAJ',
])

const bareWord = (word: string) => word.replace(/[^A-Za-zÑñ-]/g, '').toUpperCase()

/**
 * Words that shouldn't take an article in front of them, because they open a
 * clause rather than name a thing.
 */
const NO_ARTICLE = new Set([
	'A',
	'AN',
	'THE',
	'HE',
	'SHE',
	'THEY',
	'HIS',
	'HER',
	'THEIR',
	'THIS',
	'THAT',
	'ONE',
	'BORN',
	'CURRENTLY',
	'SINCE',
	'PRIOR',
	'AFTER',
	'BEFORE',
	'DURING',
	'ELECTED',
	'APPOINTED',
	'SERVING',
	'FORMERLY',
	'EDUCATED',
	'GRADUATED',
	'AMONG',
	'AS',
	'IN',
	'AT',
	'ON',
	'FROM',
	'WITH',
	'FOR',
])

/**
 * Drops a name the biography opens with — but only when it is a masthead
 * rather than the subject of a sentence.
 *
 * Nearly every biosketch begins with the name in running prose: "MP Akmad I.
 * Abas is the commander of…", "Abdullah Biston Hashim, the eldest son of…".
 * There the name carries the grammar, and cutting it leaves a fragment. A
 * few instead stamp the name across the top in capitals and follow it with a
 * description — "ATTY. NAGUIB G. SINARIMBO Governance Expert, Legislator,
 * and a Champion of Public Service" — which only repeats the heading printed
 * directly above it.
 *
 * Two things have to hold before anything is cut: the run has to be written
 * in capitals, and it has to reach the member's surname. Anything else is
 * left exactly as published — a middle name this registry has never seen is
 * far more likely than a masthead.
 */
function withoutLeadingName(text: string, member: Member): string {
	const surname = bareWord(member.rosterName.split(',')[0] ?? '')
	const words = text.split(/\s+/)
	let index = 0
	let reachedSurname = false

	while (index < words.length) {
		const raw = words[index].replace(/[,;:]$/, '')
		const word = bareWord(raw)

		// Capitals only — a title-case name is prose, not a masthead.
		if (!word || raw !== raw.toUpperCase()) break
		if (!HONORIFICS.has(word) && word.length > 1 && !/^[A-ZÑ-]+$/.test(word)) break

		if (word === surname) reachedSurname = true
		index += 1
	}

	if (!reachedSurname) return text

	const rest = words
		.slice(index)
		.join(' ')
		.replace(/^[\s,;:.–—-]+/, '')

	// Nothing but the name: the heading already says it, so there is no bio.
	if (!rest) return ''

	// Lowercase means the name was the subject — leave the sentence whole.
	if (!/^[A-ZÑ“"]/.test(rest)) return text

	// What's left is a description, so it needs the article the name replaced.
	const head = bareWord(rest.split(/\s+/)[0] ?? '')
	if (NO_ARTICLE.has(head)) return rest

	return `${/^[AEIOU]/.test(head) ? 'An' : 'A'} ${rest}`
}

/**
 * Parliament's biosketch, kept short.
 *
 * These run to several hundred words of unbroken prose — more than a profile
 * column can carry before the record itself is pushed off the screen. The
 * opening three or four sentences show as one paragraph; the official profile
 * link below carries the rest. Cut rather than summarised: this is a public
 * figure's own account of themselves, and rewriting it here would put words
 * in their mouth. Every sentence shown is one they published.
 */
function Biography({ member }: { member: Member }) {
	// Several biosketches open on a masthead or a section head — "CAREER
	// SUMMARY", "I. INTRODUCTION", the name stamped in capitals — and only
	// get to the person a paragraph or two later. Prose is what ends in a
	// full stop; if a biography is nothing but headings and bullets, it is
	// shown as published rather than dropped.
	const prose = member.bio.filter(
		(paragraph) => /[.!?”"]$/.test(paragraph.trim()) && !/^[-–—•▪➢*·]/.test(paragraph.trim()),
	)
	const paragraphs = prose.length > 0 ? prose : member.bio

	const sentences = [
		...toSentences(withoutLeadingName(paragraphs[0] ?? '', member)),
		// Later paragraphs carry the rest; a first paragraph one line long
		// would otherwise be the whole profile.
		...paragraphs.slice(1).flatMap(toSentences),
	]

	const brief: string[] = []

	for (const sentence of sentences) {
		brief.push(sentence)
		// Whichever comes first: enough sentences to introduce someone, or
		// enough words to fill the column. These run long, so the length is
		// usually what stops it.
		if (brief.join(' ').length >= 260 || brief.length >= 4) break
	}

	const text = brief.join(' ')

	if (!text) {
		return (
			<p className='mt-7 bb-body text-[var(--ink-3)]'>
				Parliament has not published a biography for this member.
			</p>
		)
	}

	return <p className='mt-7 bb-body text-[var(--ink-2)]'>{text}</p>
}

/** Column one: who this person is. */
export function MemberIdentity({ member, titleId }: { member: Member; titleId?: string }) {
	return (
		<div>
			<MemberAvatar name={member.displayName} src={member.photoUrl} size='lg' />

			<h1
				id={titleId}
				className='mt-6 text-[1.75rem] font-bold leading-[1.1] text-[var(--ink)] sm:text-[2rem]'
			>
				{member.displayName}
			</h1>

			{/* Standing, office, and authorship in one row. The roster form of the
			    name used to sit here, which only restated the heading above it in
			    capitals — these say something the name doesn't. */}
			<div className='mt-4 flex flex-wrap gap-1.5'>
				<span
					className={`badge badge-plain ${
						member.isInstitution ? 'badge-early' : member.isIncumbent ? 'badge-done' : 'badge-idle'
					}`}
				>
					{member.isInstitution
						? 'Institutional author'
						: member.isIncumbent
							? 'Currently serving'
							: 'Former member'}
				</span>

				{/* A position can name two offices; each gets its own badge. */}
				{member.roleTitle
					?.split('/')
					.map((part) => part.trim())
					.filter(Boolean)
					.map((role) => (
						<span key={role} className='badge badge-plain badge-role'>
							{role}
						</span>
					))}

				{member.principalCount > 0 ? (
					<span className='badge badge-plain badge-done'>{member.principalCount} as principal</span>
				) : null}
				{member.coAuthorCount > 0 ? (
					<span className='badge badge-plain badge-early'>{member.coAuthorCount} as co-author</span>
				) : null}
			</div>

			{/* Parliament's own biosketch, in its own words. Roughly half the
			    member pages carry one; the rest have an empty Profile tab, and
			    saying so beats leaving a blank where a life should be. */}
			{member.bio.length > 0 ? (
				<Biography member={member} />
			) : member.isInstitution ? null : (
				<p className='mt-7 bb-body text-[var(--ink-3)]'>
					Parliament has not published a biography for this member.
				</p>
			)}

			{member.notes ? (
				<p className='mt-4 bb-body text-[var(--ink-2)]'>{member.notes}</p>
			) : null}

			{/* No rule under the name — the badges already close that block, and a
			    separator here only cuts the person in half. Space does the work. */}
			{member.isInstitution ? null : (
				<div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-1'>
					<Fact label='Term of office' value={member.termOfOffice} />
					{/* One sitting per line — three date ranges run together read as
				    one long date rather than three terms. */}
					<Fact
						label='Parliaments'
						value={member.parliamentsServed.length > 0 ? member.parliamentsServed : 'Not recorded'}
					/>
					<Fact label='Represents' value={member.representation ?? 'Not recorded'} />
					<Fact label='Position' value={member.position ?? 'BTA Member'} />
					{member.officeAddress ? <Fact label='Office' value={member.officeAddress} /> : null}
				</div>
			)}

			{member.profileUrl || member.socialMediaUrl ? (
				<div className='mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
					{member.profileUrl ? (
						<a href={member.profileUrl} target='_blank' rel='noreferrer' className='rule-link'>
							Official profile
						</a>
					) : null}
					{member.socialMediaUrl ? (
						<a href={member.socialMediaUrl} target='_blank' rel='noreferrer' className='rule-link'>
							Social media
						</a>
					) : null}
				</div>
			) : null}
		</div>
	)
}
