'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { statusToneClass, toPersonName } from '../_lib/labels'
import type { LegislationRecord, MeasureReading } from '../_lib/legislation-data'
import { JourneyList } from './journey'

type RecordDetailProps = {
	record: LegislationRecord
	/**
	 * Roster name -> member slug, for the authors block. Passed in rather than
	 * looked up here: the roster is a server-side dataset, and this dialog runs
	 * on the client.
	 */
	memberSlugs?: Record<string, string>
	onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<p className='label label-strong'>{label}</p>
			<div className='mt-2 text-sm leading-6 text-[var(--ink-2)]'>{children}</div>
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
					<li key={index} className='flex gap-3 text-sm leading-6 text-[var(--ink-2)]'>
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
				<div className='space-y-4 text-base leading-7 text-[var(--ink-2)]'>
					{reading.whatItDoes.split('\n\n').map((paragraph, index) => (
						<p key={index}>{paragraph}</p>
					))}
				</div>
			</Section>

			{reading.whyProposed ? (
				<Section label='Why it was proposed'>
					<p className='text-sm leading-6 text-[var(--ink-2)]'>{reading.whyProposed}</p>
				</Section>
			) : null}

			<ReadingList label='Who it affects' items={reading.whoIsAffected} />
			<ReadingList label='Who would implement it' items={reading.implementedBy} />

			{reading.funding ? (
				<Section label='Funding'>
					<p className='text-sm leading-6 text-[var(--ink-2)]'>
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
							<li key={index} className='flex gap-3 text-sm leading-6 text-[var(--ink-2)]'>
								<span
									aria-hidden='true'
									className='mt-[0.5rem] size-1 shrink-0 rounded-full bg-[var(--ink-mute)]'
								/>
								{point}
							</li>
						))}
					</ul>
				) : (
					<p className='text-sm leading-6 text-[var(--ink-3)]'>
						No published record of the debate on this measure. Parliament&rsquo;s journals cover
						sittings up to March 2023 only, and no committee report on it has been published.
					</p>
				)}
			</Section>

			{reading.insight ? (
				<Section label='What to notice'>
					<p className='text-sm leading-6 text-[var(--ink-2)]'>{reading.insight}</p>
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

export function RecordDetail({ record, memberSlugs = {}, onClose }: RecordDetailProps) {
	const closeButtonRef = useRef<HTMLButtonElement>(null)
	const dialogRef = useRef<HTMLElement>(null)

	// Lock scroll, close on Escape, and keep Tab inside the dialog while open.
	useEffect(() => {
		const previousOverflow = document.body.style.overflow
		const previouslyFocused = document.activeElement as HTMLElement | null

		document.body.style.overflow = 'hidden'

		// `preventScroll` matters: focusing an element inside a fixed overlay
		// still makes the browser scroll the document to "reveal" it, which
		// jumps the list behind the dialog to the bottom before the panel is
		// even visible. The same applies when focus is handed back on close.
		closeButtonRef.current?.focus({ preventScroll: true })

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
				return
			}

			if (event.key !== 'Tab' || !dialogRef.current) return

			const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
			)
			if (focusable.length === 0) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', handleKeyDown)
			previouslyFocused?.focus({ preventScroll: true })
		}
	}, [onClose])

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
	const authors = useMemo(() => {
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
	}, [record.principalAuthors, record.coAuthors])

	// Rendered into `document.body` rather than where it sits in the tree. A
	// modal has to measure itself against the viewport, and any ancestor
	// carrying a transform, filter, or `contain` would silently become its
	// containing block instead — which is what put this dialog off-screen.
	// The portal also lifts it clear of every stacking context on the page.
	return createPortal(
		<div
			className='overlay-in fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(20,20,18,0.45)] backdrop-blur-[2px] sm:p-6'
			role='presentation'
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose()
			}}
		>
			<section
				ref={dialogRef}
				role='dialog'
				aria-modal='true'
				aria-labelledby='record-dialog-title'
				// The panel owns the corners, the border, and the shadow — and clips
				// to them. The scrollport is the wrapper inside, so the scrollbar
				// stops short of the radius instead of running past it.
				className='sheet-in flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)] sm:h-auto sm:max-h-[85vh] sm:w-[94vw] sm:rounded-[22px] sm:border sm:border-[var(--rule)] sm:shadow-[0_32px_80px_-24px_rgba(0,0,0,0.35)] lg:w-[75vw]'
			>
				<div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
					{/* Sticky bar */}
					<div className='sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--paper)]/90 px-6 py-3.5 backdrop-blur-md sm:px-12'>
						<div className='flex min-w-0 items-center gap-3'>
							<p className='num shrink-0 text-[13px] font-medium text-[var(--ink-3)]'>
								{record.display}
							</p>
							{/* The one place the status is stated — it rides in the bar at
							    every width rather than repeating under the title. */}
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
						<button
							ref={closeButtonRef}
							type='button'
							onClick={onClose}
							aria-label='Close record'
							className='inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--ink-3)] transition hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
						>
							<svg
								className='size-4'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								aria-hidden='true'
							>
								<path d='M18 6 6 18M6 6l12 12' />
							</svg>
						</button>
					</div>

					<div className='px-6 pb-14 pt-8 sm:px-12 sm:pt-10'>
						{/* The full official name alone. The registry's condensed name for a
						    measure is a fragment cut out of that same sentence, so standing
						    it above the title read as a false start. A rule under the pair
						    closes the head of the record off from the detail below. */}
						<div className='pb-11'>
							<h2
								id='record-dialog-title'
								className='text-2xl font-semibold leading-[1.15] sm:text-[1.75rem]'
							>
								{record.title}
							</h2>

							{lead ? <p className='mt-5 text-base leading-6 text-[var(--ink-2)]'>{lead}</p> : null}
						</div>

						{/* Where it stands, under the name of the thing it happened to. No
						    heading — a dated rail beneath a measure's title says what it is —
						    and a tinted band rather than a second pair of rules, since the
						    rail is already a set of lines. */}
						{record.journey.length > 0 ? (
							<div className='-mx-6 bg-[var(--paper-2)] px-6 pb-8 pt-11 sm:-mx-12 sm:px-12'>
								<JourneyList stages={record.journey} />
							</div>
						) : null}

						<div className='mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(14.5rem,18.7rem)] lg:gap-32 xl:gap-40'>
							{/* Main column */}
							<div className='space-y-9'>
								{/* What the stage on the rail above actually means for the
								    measure — the first thing to read once you know where it
								    stands, so it leads the column. */}
								<p className='text-sm leading-6 text-[var(--ink-3)]'>{record.statusMeaning}</p>

								{record.reading ? <Reading reading={record.reading} /> : null}

								{record.gist && lead !== record.gist ? (
									<Section label='Plain-language analysis'>
										<p className='text-base leading-6 text-[var(--ink-2)]'>{record.gist}</p>
									</Section>
								) : null}

								{record.keyEffects.length > 0 ? (
									<Section label='Key effects'>
										<ul className='grid gap-2.5'>
											{record.keyEffects.map((effect, index) => (
												<li
													key={`${record.id}-effect-${index}`}
													className='flex gap-3 text-sm leading-6 text-[var(--ink-2)]'
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
										<p className='text-sm leading-6 text-[var(--ink-3)]'>{record.titleOfficial}</p>
									</Section>
								) : null}

								{record.citizenEngage ? (
									<Section label='How to take part'>
										<p className='text-sm leading-6 text-[var(--ink-2)]'>{record.citizenEngage}</p>
									</Section>
								) : null}

								{record.watchpoints.length > 0 ? (
									<Section label='Watchpoints'>
										<ul className='grid gap-2'>
											{record.watchpoints.map((point, index) => (
												<li
													key={`${record.id}-watch-${index}`}
													className='text-sm leading-6 text-[var(--ink-2)]'
												>
													{point}
												</li>
											))}
										</ul>
									</Section>
								) : null}

								{record.signalValue ? (
									<Section label='Who it affects'>
										<p className='text-sm leading-6 text-[var(--ink-2)]'>{record.signalValue}</p>
									</Section>
								) : null}

								{record.researchLeads.length > 0 ? (
									<Section label='Where to dig deeper'>
										<ul className='grid gap-2'>
											{record.researchLeads.map((lead, index) => (
												<li
													key={`${record.id}-lead-${index}`}
													className='text-sm leading-6 text-[var(--ink-3)]'
												>
													{lead}
												</li>
											))}
										</ul>
									</Section>
								) : null}

								{record.notes ? (
									<Section label='Data note'>
										<p className='text-sm leading-6 text-[var(--ink-2)]'>{record.notes}</p>
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
										className='btn btn-solid w-full'
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
													href={`/acts?focus=${record.becameActNumber}`}
													className='rule-link w-fit'
												>
													Became BAA {record.becameActNumber}
												</Link>
											) : null}

											{record.originBillNumber !== undefined ? (
												<Link
													href={`/bills?focus=${record.originBillNumber}`}
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
															<Link href={`/acts?focus=${number}`} className='rule-link'>
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
															<Link href={`/acts?focus=${number}`} className='rule-link'>
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
										<ul className='grid gap-1.5 text-sm leading-6 text-[var(--ink-2)]'>
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

						{record.disclaimer ? (
							<p className='mt-6 max-w-3xl text-xs leading-5 text-[var(--ink-mute)]'>
								{record.disclaimer}
							</p>
						) : null}
					</div>
				</div>
			</section>
		</div>,
		document.body,
	)
}
