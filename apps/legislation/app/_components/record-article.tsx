import Link from 'next/link'
import { statusToneClass, toPersonName } from '../_lib/labels'
import type { LegislationRecord, MeasureReading } from '../_lib/legislation-data'
import { JourneyList } from './journey'

type RecordArticleProps = {
	record: LegislationRecord
	/**
	 * Roster name -> member slug, for the authors block. Resolved by the page
	 * rather than here, so this stays a plain render of one record.
	 */
	memberSlugs?: Record<string, string>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<p className='label label-strong'>{label}</p>
			<div className='mt-2 bb-body text-[var(--ink-2)]'>{children}</div>
		</div>
	)
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<section>
			<p className='label label-strong'>{label}</p>
			<div className='mt-3'>{children}</div>
		</section>
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
							className='mt-[0.5rem] size-1 shrink-0 rounded-full bg-[var(--ink-mute)]'
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
function Reading({ reading }: { reading: MeasureReading }) {
	return (
		<div className='space-y-9'>
			<Section label='What this measure does'>
				<div className='space-y-4 copy text-[var(--ink-2)]'>
					{reading.whatItDoes.split('\n\n').map((paragraph, index) => (
						<p key={index}>{paragraph}</p>
					))}
				</div>
			</Section>

			{reading.whyProposed ? (
				<Section label='Why it was proposed'>
					<p className='copy text-[var(--ink-2)]'>{reading.whyProposed}</p>
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
			<Section label='Raised during deliberations'>
				{reading.deliberation.length > 0 ? (
					<ul className='grid gap-2'>
						{reading.deliberation.map((point, index) => (
							<li key={index} className='flex gap-3 copy text-[var(--ink-2)]'>
								<span
									aria-hidden='true'
									className='mt-[0.5rem] size-1 shrink-0 rounded-full bg-[var(--ink-mute)]'
								/>
								{point}
							</li>
						))}
					</ul>
				) : (
					<p className='copy text-[var(--ink-3)]'>
						No published record of the debate on this measure. Parliament&rsquo;s journals cover
						sittings up to March 2023 only, and no committee report on it has been published.
					</p>
				)}
			</Section>

			{reading.insight ? (
				<Section label='What to notice'>
					<p className='copy text-[var(--ink-2)]'>{reading.insight}</p>
				</Section>
			) : null}

			{reading.readFrom.length > 0 ? (
				<p className='meta-sm border-t border-[var(--rule-soft)] pt-4'>
					Read from{' '}
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
					{reading.readOn ? ` \u00b7 read ${reading.readOn}` : ''}. This section is our reading of
					those documents, not Parliament&rsquo;s words.
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
export function RecordArticle({ record, memberSlugs = {} }: RecordArticleProps) {
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
			{/* Ranged left, sharing an edge with the detail underneath: the head and
			    the body are one read down the same column, and a centred head over a
			    left-ranged body put a seam across the page. */}
			<div className='bb-container pt-12 lg:pt-20'>
				{/* Badges never break, so on a phone the row wraps rather than running
				    off the edge — a measure can carry a status and a Cabinet mark at
				    once. */}
				<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
					<p className='num shrink-0 text-[13px] font-medium text-[var(--ink-3)]'>
						{record.display}
					</p>
					{/* The one place the status is stated — it rides above the title
					    rather than repeating under it. */}
					<span className={statusToneClass[record.statusTone]}>{record.statusShort}</span>

					{/* Filed by the Government of the Day rather than by a member: a
					    cabinet measure arrives with the executive behind it, which is
					    worth knowing before reading a word of it. It takes the office
					    tone, because it says who filed this rather than where it
					    stands. */}
					{record.isCabinetMeasure ? (
						<span className='badge badge-plain badge-role shrink-0'>Cabinet measure</span>
					) : null}
				</div>

				{/* The full official name alone. The registry's condensed name for a
				    measure is a fragment cut out of that same sentence, so standing it
				    above the title read as a false start. Held to a measure rather than
				    run across the page column: an official title is a sentence, and a
				    sentence forty words long is unreadable at 88rem. */}
				<h1 className='mt-4 max-w-5xl text-[1.5rem] font-bold leading-[1.25] text-[var(--ink)] sm:text-[2rem]'>
					{record.title}
				</h1>

				{lead ? (
					<p className='mt-5 max-w-4xl copy text-[var(--ink-2)]'>{lead}</p>
				) : null}
			</div>

			{/* Where it stands, under the name of the thing it happened to. No
			    heading — a dated rail beneath a measure's title says what it is — and
			    a tinted band rather than a second pair of rules, since the rail is
			    already a set of lines. The band runs the full width of the page; the
			    rail inside it keeps the site's column. */}
			{record.journey.length > 0 ? (
				<div className='mt-11 bg-[var(--paper-2)]'>
					<div className='bb-container pb-12 pt-16'>
						<JourneyList stages={record.journey} />
					</div>
				</div>
			) : null}

			<div className='bb-container pb-24 pt-12 lg:pb-32'>
				<div className='grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(14.5rem,18.7rem)] lg:gap-32 xl:gap-40'>
					{/* Main column.

					    `reg-measure` is what turns this from a page into a document. The
					    column is about 970px at desktop width, which runs the summaries
					    of the longer autonomy acts past a hundred characters a line —
					    comfortably readable for a table row and punishing for six
					    paragraphs of statute. The sidebar keeps the full track; only the
					    prose is held to a measure. */}
					<div className='reg-measure space-y-9'>
						{/* What the stage on the rail above actually means for the
						    measure — the first thing to read once you know where it
						    stands, so it leads the column. */}
						<p className='copy text-[var(--ink-3)]'>{record.statusMeaning}</p>

						{record.reading ? <Reading reading={record.reading} /> : null}

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
												className='mt-[0.5rem] size-1 shrink-0 rounded-full bg-[var(--ink-mute)]'
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
						{/* Straight to the source. Everything in this record is a reading
					    of a document published elsewhere, so the way to the original
					    heads the column that carries the record's particulars. */}
						{sourceHref ? (
							<a
								href={sourceHref}
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-solid w-full'
							>
								Official page
								<svg
									className='size-3.5'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'
								>
									<path d='M7 17 17 7M9 7h8v8' />
								</svg>
							</a>
						) : null}

						{hasRelations ? (
							<Section label='Connected measures'>
								<div className='grid gap-2.5 text-sm text-[var(--ink-2)]'>
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
						<div className='grid gap-5 border-t border-[var(--rule)] pt-6 first:border-t-0 first:pt-0'>
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
							<Section label='Authors'>
								{/* Principal authors first, then co-authors, each block A–Z by
								    surname. A name the roster knows opens that member's
								    profile; one it doesn't is still shown, just not linked. */}
								<ul className='grid gap-1.5 bb-body text-[var(--ink-2)]'>
									{authors.map(({ name, displayName, isPrincipal }) => {
										const slug = memberSlugs[name.toUpperCase()]

										return (
											<li key={name} className='flex flex-wrap items-baseline gap-x-2'>
												{slug ? (
													<Link href={`/members/${slug}`} className='rule-link rule-link-quiet'>
														{displayName}
													</Link>
												) : (
													<span>{displayName}</span>
												)}
												{record.coAuthors.length > 0 && record.principalAuthors.length > 0 ? (
													<span className='meta-sm'>
														{isPrincipal ? 'Principal Author' : 'Co-Author'}
													</span>
												) : null}
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
					<div className='mt-12 border-t border-[var(--rule)] pt-5'>
						<p className='label label-strong'>Sources</p>
						<div className='mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
							{record.sourceUrl ? (
								<a
									href={record.sourceUrl}
									target='_blank'
									rel='noreferrer'
									className='rule-link'
								>
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
										className='rule-link'
									>
										{source.type.replace(/_/g, ' ')}
									</a>
								) : (
									<span key={`${record.id}-source-${index}`} className='text-[var(--ink-3)]'>
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
