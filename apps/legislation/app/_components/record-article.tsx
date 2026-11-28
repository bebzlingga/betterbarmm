import { ArrowSquareOutIcon, FileTextIcon, InfoIcon, LinkSimpleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { Hero } from './hero'
import { statusToneClass, toPersonName } from '../_lib/labels'
import type { LegislationRecord, MeasureReading } from '../_lib/legislation-data'
import { JourneyList } from './journey'
import { committeeReportsFor, floorRecordFor, namedVotesForAct, type CommitteeReport, type FloorEntry, type NamedVote } from '../_lib/journal-data'
import { recordHref } from '../_lib/categories'
import { getOfficialBillForAct } from '../_lib/official-measures'

type RecordArticleProps = {
	record: LegislationRecord
	/**
	 * Roster name -> member slug, for the authors block. Resolved by the page
	 * rather than here, so this stays a plain render of one record.
	 */
	memberSlugs?: Record<string, string>
	/** Each author's portrait, keyed the same way, where one has been collected. */
	memberPhotos?: Record<string, string>
}

/**
 * One particular of the record — when it was ratified, which sitting, what
 * subject.
 *
 * The label is the quiet half. It was set in the page's own ink at
 * `.label-strong`, which put "Sector" at the same weight of color as the
 * sector itself; in a column of six of these the eye landed on the questions
 * rather than the answers. Plain `.label` is the muted step, and the value
 * under it keeps the ink.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		// Set as the landing site sets a Member's particulars (user decision): a small mono label, the value under it
		// at the sidebar's own size.
		<div>
			<p className='font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{label}</p>
			<div className='mt-1.5 text-[0.9375rem] leading-[1.5] text-[var(--ink)]'>{children}</div>
		</div>
	)
}

function Section({ label, small = false, children }: { label: string; small?: boolean; children: React.ReactNode }) {
	return (
		// Headed as the travel look heads its sections (user decision): the display face, no rule between sections; the
		// space alone sets each off from the last. A step smaller in the side column.
		<section>
			<h2
				className={`font-[family-name:var(--font-display)] font-extrabold tracking-[-0.025em] text-[var(--ink)] ${small ? 'text-[1.125rem]' : 'text-[clamp(1.25rem,1.8vw,1.5rem)]'}`}
			>
				{label}
			</h2>
			<div className={small ? 'mt-4' : 'mt-5'}>{children}</div>
		</section>
	)
}

/**
 * A written passage of a reading, kept as the paragraphs it was written in.
 *
 * A reading is prose, and its blank lines carry the argument — `\n\n` in the
 * source is a paragraph break, not whitespace. Rendered into a single `<p>`
 * it collapses into one wall, which is what happened to every insight on the
 * site until this existed.
 */
function Prose({ text }: { text: string }) {
	return (
		<div className='space-y-4 copy text-[var(--ink-2)]'>
			{text.split('\n\n').map((paragraph, index) => (
				<p key={index}>{paragraph}</p>
			))}
		</div>
	)
}

/** A list under a label, for the parts of a reading that are lists. */
function ReadingList({ label, items }: { label: string; items: string[] }) {
	if (items.length === 0) return null

	return (
		<Section label={label}>
			<ul className='grid gap-2'>
				{items.map((item, index) => (
					<li key={index} className='flex gap-3 copy text-[var(--ink-2)]'>
						<span
							aria-hidden='true'
							className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]'
						/>
						{item}
					</li>
				))}
			</ul>
		</Section>
	)
}

/**
 * The reading of a measure's own documents.
 *
 * It answers the questions a reader actually arrives with — what does this do,
 * why was it filed, who does it reach, who runs it, what does it cost, what
 * changes — and it names the documents it was read from, because an analysis
 * that doesn't show its sources is just an assertion.
 */
/** Dated journal entries, each linked to its journal page. */
function FloorList({ entries }: { entries: FloorEntry[] }) {
	return (
		<ol className='grid gap-3'>
			{entries.map((entry, index) => (
				<li key={index} className='grid gap-1.5 rounded-2xl bg-[var(--paper-2)] p-4 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-5 sm:p-5'>
					<Link href={`/journal/${entry.journalKey}`} className='text-[0.78125rem] font-semibold leading-5 text-[var(--ink-3)] hover:text-[var(--accent)]'>
						{entry.dates}
						<span className='block font-normal'>{entry.journalTitle}</span>
					</Link>
					<p className='copy text-[var(--ink-2)]'>{entry.text}</p>
				</li>
			))}
		</ol>
	)
}

function Reading({ reading, floor = [], named = [], reports = [] }: { reading: MeasureReading; floor?: FloorEntry[]; named?: NamedVote[]; reports?: CommitteeReport[] }) {
	// Debate points from the journals, unless the reading already carries them (it was read from the same journals).
	const said = reading.deliberation.length ? [] : floor.filter((entry) => entry.kind === 'point')
	const actions = floor.filter((entry) => entry.kind === 'action')
	const tallies = floor.filter((entry) => entry.kind === 'tally')
	return (
		<div className='space-y-12'>
			<Section label='What this measure does'>
				<Prose text={reading.whatItDoes} />
			</Section>

			{reading.whyProposed ? (
				<Section label='Why it was proposed'>
					<Prose text={reading.whyProposed} />
				</Section>
			) : null}

			<ReadingList label='Who it affects' items={reading.whoIsAffected} />
			<ReadingList label='Who would implement it' items={reading.implementedBy} />

			{reading.funding ? (
				<Section label='Funding'>
					<p className='copy text-[var(--ink-2)]'>
						<span className='font-medium text-[var(--ink)]'>
							{reading.funding.required ? 'Carries an appropriation. ' : 'No appropriation. '}
						</span>
						{reading.funding.detail}
					</p>
				</Section>
			) : null}

			<ReadingList label='What changes if it becomes law' items={reading.whatChanges} />

			{/* Stated as an absence rather than left out: "no record" is itself a
			    finding about how much of Parliament's debate is published. */}
			{reports.length > 0 ? (
				<Section label='In committee'>
					<ol className='grid gap-6'>
						{reports.map((report) => (
							<li key={report.number}>
								<p className='copy text-[var(--ink-2)]'>
									<a href={report.pdfUrl ?? report.url} target='_blank' rel='noreferrer' className='font-medium text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
										Committee Report No. {report.number}
									</a>
									{report.committees.length ? `, ${report.committees.join(' and ')}` : ''}
									{report.date ? `, ${new Date(`${report.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}` : ''}
									{report.recommendation ? `: recommended ${report.recommendation}${report.substituteBill ? ` (Bill ${report.substituteBill})` : ''}.` : '.'}
								</p>
								{report.points.length ? (
									<ul className='mt-2 grid gap-1.5'>
										{report.points.map((point, index) => (
											<li key={index} className='flex gap-3 copy text-[var(--ink-2)]'>
												<span aria-hidden='true' className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]' />
												{point}
											</li>
										))}
									</ul>
								) : null}
							</li>
						))}
					</ol>
				</Section>
			) : null}

			<Section label='Raised during deliberations'>
				{reading.deliberation.length > 0 || said.length > 0 ? (
					<>
					{reading.deliberation.length > 0 ? (
					<ul className='grid gap-2'>
						{reading.deliberation.map((point, index) => (
							<li key={index} className='flex gap-3 copy text-[var(--ink-2)]'>
								<span
									aria-hidden='true'
									className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]'
								/>
								{point}
							</li>
						))}
					</ul>
					) : null}
					{said.length > 0 ? <FloorList entries={said} /> : null}
					</>
				) : reports.length > 0 ? (
					<p className='copy text-[var(--ink-3)]'>
						No published record of the floor debate on this measure; what the committee found is above. Parliament&rsquo;s
						journals cover sittings up to March 2023 only.
					</p>
				) : (
					<p className='copy text-[var(--ink-3)]'>
						No published record of the debate on this measure. Parliament&rsquo;s journals cover
						sittings up to March 2023 only, and no committee report on it has been published.
					</p>
				)}
			</Section>

			{actions.length > 0 ? (
				<Section label='On the floor'>
					<FloorList entries={actions} />
				</Section>
			) : null}

			{named.length > 0 || tallies.length > 0 ? (
				<Section label='How it was voted'>
					<div className='grid gap-5'>
						{named.map((vote, index) => (
							<div key={index}>
								<p className='copy text-[var(--ink-2)]'>
									<span className='font-medium text-[var(--ink)]'>{vote.stage}, {new Date(`${vote.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}:</span>{' '}
									{vote.result} by roll call, {vote.tally.favor} in favour, {vote.tally.against} against, {vote.tally.abstained} abstaining.
								</p>
								<details className='mt-2 text-[0.875rem] text-[var(--ink-2)]'>
									<summary className='cursor-pointer font-medium text-[var(--accent)]'>Who voted how</summary>
									{([['In favour', vote.inFavor], ['Against', vote.against], ['Abstained', vote.abstained]] as const)
										.filter(([, names]) => names.length)
										.map(([label, names]) => (
											<p key={label} className='mt-2 leading-6'>
												<span className='font-semibold text-[var(--ink)]'>{label} ({names.length}):</span> {names.join(', ')}
											</p>
										))}
									<p className='mt-2 text-[0.78125rem] text-[var(--ink-3)]'>
										From{' '}
										<a href={vote.journalUrl} target='_blank' rel='noreferrer' className='rule-link'>
											{vote.journalTitle || 'the journal'}
										</a>
										.
									</p>
								</details>
							</div>
						))}
						{named.length === 0
							? tallies.map((entry, index) => (
									<p key={index} className='copy text-[var(--ink-2)]'>
										<span className='font-medium text-[var(--ink)]'>{entry.dates}:</span> {entry.tally!.yes} in favour, {entry.tally!.no} against, {entry.tally!.abstain} abstaining. {entry.text}
									</p>
								))
							: null}
					</div>
				</Section>
			) : null}

			{reading.insight ? (
				<Section label='What to notice'>
					<Prose text={reading.insight} />
				</Section>
			) : null}

			{reading.readFrom.length > 0 ? (
				<p className='meta-sm border-t border-[var(--rule-soft)] pt-5'>
					{reading.basis === 'title' ? 'Drawn from' : 'Read from'}{' '}
					{reading.readFrom.map((doc, index) => (
						<span key={doc.label}>
							{index > 0 ? ', ' : ''}
							{doc.url ? (
								<a href={doc.url} target='_blank' rel='noreferrer' className='rule-link'>
									{doc.label}
								</a>
							) : (
								doc.label
							)}
						</span>
					))}
					{reading.readOn
						? ` \u00b7 ${reading.basis === 'title' ? 'written' : 'read'} ${reading.readOn}`
						: ''}.{' '}
					{reading.basis === 'title'
						? 'Parliament has published no readable text of this measure, so this section works from its title and index record alone.'
						: 'This section is our reading of those documents, not Parliament\u2019s words.'}
				</p>
			) : null}
		</div>
	)
}

/**
 * One measure, as a page.
 *
 * Everything the registry holds on a single record, laid out on the site's own
 * column and gutters — the same grid the category lists and member profiles
 * use — so a record reads as a document rather than as a panel over a list.
 */
export function RecordArticle({ record, memberSlugs = {}, memberPhotos = {} }: RecordArticleProps) {
	const hasRelations =
		record.becameActNumber !== undefined ||
		record.originBillNumber !== undefined ||
		record.amendsBaa.length > 0 ||
		record.amendedByBaa.length > 0 ||
		Boolean(record.repeals)

	// The official title is worth showing separately only when the readable
	// title isn't just a re-cased copy of it.
	const showOfficialTitle =
		record.titleOfficial.toLowerCase().trim() !== record.title.toLowerCase().trim()

	// The lead paragraph: the most direct answer to "what is this".
	const lead = record.citizenMeaning ?? record.gist

	/**
	 * Whether this measure has been read.
	 *
	 * Six of the sections below are rule-based: they are generated from the
	 * title and the registry's metadata, and they exist so a measure nobody has
	 * read still says something. Once someone has actually read the documents,
	 * they are worse than redundant — "Creates or strengthens a Bangsamoro
	 * institution" sits under three paragraphs that named the office, the money
	 * and the eligibility test, and a "Watchpoints" heading carrying "Authors
	 * are recorded on the origin bill's page" is bookkeeping wearing the clothes
	 * of an insight. So a reading replaces them rather than stacking on top.
	 *
	 * The two that survive a reading are the ones it doesn't cover: the official
	 * title as published, and how to take part.
	 */
	const hasReading = Boolean(record.reading)

	// The most specific way back to the source: the measure's own page where
	// one was captured, its category's index otherwise. A captured PDF is the
	// last resort — it answers the question, but it isn't the page a reader
	// would have landed on.
	const sourceHref =
		record.sourceLinks.find((source) => /official/i.test(source.type) && source.url)?.url ??
		record.sourceUrl ??
		record.sourceLinks.find((source) => source.url)?.url

	// Credited names, principal authors first and each block alphabetical.
	// The source lists them in whatever order the index printed them, which
	// on a long bill is no order at all — a reader looking for one name
	// needs the list to be searchable by eye.
	const authors = (() => {
		const seen = new Set<string>()

		const block = (names: string[], isPrincipal: boolean) =>
			[...names]
				.sort((left, right) => left.localeCompare(right, 'en'))
				.filter((name) => {
					// Principal authorship is the stronger claim and is read first,
					// so a name in both lists keeps only that entry.
					const key = name.toUpperCase()
					if (seen.has(key)) return false
					seen.add(key)
					return true
				})
				.map((name) => ({ name, displayName: toPersonName(name), isPrincipal }))

		return [...block(record.principalAuthors, true), ...block(record.coAuthors, false)]
	})()

	return (
		<article>
			{/* The head on the crimson header (user decision: the travel look): the number and status, the official title
			    and the summary. Badges never break, so on a phone the row wraps; a measure can carry a status and a
			    Cabinet mark at once (filed by the Government of the Day: the office tone, as it says who filed it). */}
			<Hero
				small
				auto
				top={
					<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
						<p className='num pg-hero-kicker shrink-0'>{record.display}</p>
						<span className={statusToneClass[record.statusTone]}>{record.statusShort}</span>
						{record.isCabinetMeasure ? <span className='badge badge-plain badge-role shrink-0'>Cabinet measure</span> : null}
					</div>
				}
				title={record.title}
				lede={lead ? <p className='copy max-w-4xl text-white/85'>{lead}</p> : null}
			/>

			{/* Where it stands, under the head on the paper ground. The rail
			    scrolls horizontally on narrow screens inside `JourneyList`. */}
			{record.journey.length > 0 ? (
				<div className='tv-wash'>
					<div className='bb-container py-10 lg:py-12'>
						<div className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] px-3 py-7 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.45)] sm:px-6'>
							<JourneyList stages={record.journey} />
						</div>
					</div>
				</div>
			) : null}

			<div className='bb-container pb-24 pt-16 lg:pb-32 lg:pt-20'>
				<div className='grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:gap-24 xl:gap-32'>
					{/* Main column. The prose fills its track (user decision): the sidebar gap
					    is margin enough, and a narrower measure left a third of the page empty. */}
					<div className='space-y-12'>
						{/* What the stage on the rail above actually means for the
						    measure — the first thing to read once you know where it
						    stands, so it leads the column, on a rounded panel of its own. */}
						<p className='flex items-start gap-3.5 rounded-[var(--dv-r)] bg-[var(--paper-2)] px-5 py-4 copy text-[var(--ink-2)] sm:px-6'>
							<InfoIcon size={22} weight='duotone' aria-hidden='true' className='mt-0.5 shrink-0 text-[var(--accent)]' />
							{record.statusMeaning}
						</p>

						{record.reading ? (
							<Reading
								reading={record.reading}
								floor={floorRecordFor(recordHref(record))}
								named={record.category === 'acts' ? namedVotesForAct(record.number) : []}
								reports={
									record.category === 'acts'
										? committeeReportsFor('bills', getOfficialBillForAct(record.number)?.number ?? -1)
										: committeeReportsFor(record.category, record.number)
								}
							/>
						) : null}

						{!hasReading && record.gist && lead !== record.gist ? (
							<Section label='Plain-language analysis'>
								<p className='copy text-[var(--ink-2)]'>{record.gist}</p>
							</Section>
						) : null}

						{!hasReading && record.keyEffects.length > 0 ? (
							<Section label='Key effects'>
								<ul className='grid gap-2.5'>
									{record.keyEffects.map((effect, index) => (
										<li
											key={`${record.id}-effect-${index}`}
											className='flex gap-3 copy text-[var(--ink-2)]'
										>
											<span
												aria-hidden='true'
												className='mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-[var(--accent)]'
											/>
											{effect}
										</li>
									))}
								</ul>
							</Section>
						) : null}

						{showOfficialTitle ? (
							<Section label='Official title as published'>
								<p className='copy text-[var(--ink-3)]'>{record.titleOfficial}</p>
							</Section>
						) : null}

						{record.citizenEngage ? (
							<Section label='How to take part'>
								<p className='copy text-[var(--ink-2)]'>{record.citizenEngage}</p>
							</Section>
						) : null}

						{!hasReading && record.watchpoints.length > 0 ? (
							<Section label='Watchpoints'>
								<ul className='grid gap-2'>
									{record.watchpoints.map((point, index) => (
										<li
											key={`${record.id}-watch-${index}`}
											className='copy text-[var(--ink-2)]'
										>
											{point}
										</li>
									))}
								</ul>
							</Section>
						) : null}

						{!hasReading && record.signalValue ? (
							<Section label='Who it affects'>
								<p className='copy text-[var(--ink-2)]'>{record.signalValue}</p>
							</Section>
						) : null}

						{!hasReading && record.researchLeads.length > 0 ? (
							<Section label='Where to dig deeper'>
								<ul className='grid gap-2'>
									{record.researchLeads.map((lead, index) => (
										<li
											key={`${record.id}-lead-${index}`}
											className='copy text-[var(--ink-3)]'
										>
											{lead}
										</li>
									))}
								</ul>
							</Section>
						) : null}

						{!hasReading && record.notes ? (
							<Section label='Data note'>
								<p className='copy text-[var(--ink-2)]'>{record.notes}</p>
							</Section>
						) : null}
					</div>

					{/* Side column */}
					<aside className='grid content-start gap-8'>
						{/* Straight to the source. Everything in this record is a reading of a document published elsewhere, so
						    the way to the original heads the column that carries the record's particulars (user decision: not
						    in the head). */}
						{sourceHref ? (
							<a href={sourceHref} target='_blank' rel='noreferrer' className='dv-btn dv-btn-accent w-full justify-center'>
								Official page
								<ArrowSquareOutIcon size={17} weight='bold' aria-hidden='true' />
							</a>
						) : null}

						{hasRelations ? (
							<Section small label='Connected measures'>
								<div className='grid gap-2.5 rounded-[var(--dv-r)] border border-[var(--rule)] p-5 text-sm text-[var(--ink-2)]'>
									{record.becameActNumber !== undefined ? (
										<Link
											href={`/acts/${record.becameActNumber}`}
											className='rule-link w-fit'
										>
											Became BAA {record.becameActNumber}
										</Link>
									) : null}

									{record.originBillNumber !== undefined ? (
										<Link
											href={`/bills/${record.originBillNumber}`}
											className='rule-link w-fit'
										>
											Originated as Bill {record.originBillNumber}
										</Link>
									) : null}

									{record.amendsBaa.length > 0 ? (
										<p>
											Amends{' '}
											{record.amendsBaa.map((number, index) => (
												<span key={number}>
													{index > 0 ? ', ' : ''}
													<Link href={`/acts/${number}`} className='rule-link'>
														BAA {number}
													</Link>
												</span>
											))}
										</p>
									) : null}

									{record.amendedByBaa.length > 0 ? (
										<p>
											Amended by{' '}
											{record.amendedByBaa.map((number, index) => (
												<span key={number}>
													{index > 0 ? ', ' : ''}
													<Link href={`/acts/${number}`} className='rule-link'>
														BAA {number}
													</Link>
												</span>
											))}
										</p>
									) : null}

									{record.repeals ? <p>Repeals {record.repeals}</p> : null}
								</div>
							</Section>
						) : null}

						{/* The record's own particulars — what it is, when, and under
						    which sitting. They head the column: they answer the shortest
						    questions, and the list of names below can run long. */}
						<div className='tv-wash grid gap-5 rounded-[var(--dv-r)] p-6'>
							<Field label={record.dateLabel}>{record.dateDisplay}</Field>

							{record.session ? <Field label='Session'>{record.session}</Field> : null}
							{record.era ? <Field label='Parliament'>{record.era}</Field> : null}

							{record.sectors.length > 0 ? (
								<Field label='Sector'>
									{record.sectors.map((tag) => tag.label).join(', ')}
								</Field>
							) : null}

							{record.types.length > 0 ? (
								<Field label='Measure type'>
									{record.types.map((tag) => tag.label).join(', ')}
								</Field>
							) : null}

							{record.appropriationAmount ? (
								<Field label='Appropriation'>
									<span className='num font-medium text-[var(--ink)]'>
										{record.appropriationAmount}
									</span>
									{record.fiscalYear ? (
										<span className='meta-sm block'>FY {record.fiscalYear}</span>
									) : null}
								</Field>
							) : null}
						</div>

						{authors.length > 0 ? (
							<Section small label={`Authors · ${authors.length}`}>
								{/* Principal authors first, then co-authors, each block A–Z by
								    surname. A name the roster knows opens that member's
								    profile; one it doesn't is still shown, just not linked. */}
								<ul className='grid gap-0.5 rounded-[var(--dv-r)] border border-[var(--rule)] p-2'>
									{authors.map(({ name, displayName, isPrincipal }) => {
										const slug = memberSlugs[name.toUpperCase()]
										const photo = memberPhotos[name.toUpperCase()]
										// Initials from the roster form, "Surname, Given M.": the given name's, then the surname's.
										const [surname = '', given = ''] = displayName.split(',').map((part) => part.trim())
										const initials = `${given[0] ?? ''}${surname[0] ?? ''}`.toUpperCase()
										const both = record.coAuthors.length > 0 && record.principalAuthors.length > 0
										const inner = (
											<>
												{/* The member's own portrait where one has been collected; their initials where not. The principal
												    author's ringed in crimson. */}
												{photo ? (
													// eslint-disable-next-line @next/next/no-img-element -- portraits are local files of mixed sizes
													<img
														src={photo}
														alt=''
														className={`size-10 shrink-0 rounded-full object-cover object-top ${isPrincipal ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--paper)]' : 'border border-[var(--rule)]'}`}
													/>
												) : (
													<span className={`grid size-10 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold ${isPrincipal ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
														{initials}
													</span>
												)}
												<span className='min-w-0 pt-0.5'>
													<span className='block truncate text-[0.875rem] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>{displayName}</span>
													{both ? <span className='block text-[0.71875rem] text-[var(--ink-3)]'>{isPrincipal ? 'Principal author' : 'Co-author'}</span> : null}
												</span>
											</>
										)

										return (
											<li key={name}>
												{/* A name the roster knows opens that member's profile; one it doesn't is still shown. */}
												{slug ? (
													<Link href={`/members/${slug}`} className='group flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--paper-2)]'>
														{inner}
													</Link>
												) : (
													<span className='flex items-start gap-3 px-3 py-2.5'>{inner}</span>
												)}
											</li>
										)
									})}
								</ul>
							</Section>
						) : null}
					</aside>
				</div>

				{/* Sources */}
				{record.sourceUrl || record.sourceLinks.length > 0 ? (
					<div className='mt-16 border-t border-[var(--rule-soft)] pt-8'>
						<p className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>Sources</p>
						<div className='mt-4 flex flex-wrap gap-2.5'>
							{record.sourceUrl ? (
								<a
									href={record.sourceUrl}
									target='_blank'
									rel='noreferrer'
									className='dv-pill !text-[0.8125rem]'
								>
									<LinkSimpleIcon size={15} weight='bold' aria-hidden='true' className='text-[var(--accent)]' />
									Official page
								</a>
							) : null}
							{record.sourceLinks.map((source, index) =>
								source.url ? (
									<a
										key={`${record.id}-source-${index}`}
										href={source.url}
										target='_blank'
										rel='noreferrer'
										className='dv-pill !text-[0.8125rem] capitalize'
									>
										<FileTextIcon size={15} weight='duotone' aria-hidden='true' className='text-[var(--accent)]' />
										{source.type.replace(/_/g, ' ')}
									</a>
								) : (
									<span key={`${record.id}-source-${index}`} className='dv-pill !text-[0.8125rem] text-[var(--ink-3)]'>
										{source.fileName ?? source.type.replace(/_/g, ' ')}
									</span>
								),
							)}
						</div>
					</div>
				) : null}

			</div>
		</article>
	)
}
