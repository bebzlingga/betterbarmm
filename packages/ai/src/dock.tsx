'use client'

/* ============================================================
   Ask Jo

   A button in the corner of every page, and the screen it opens.

   Jo is the assistant's name across the whole estate — a voice
   drawn from the everyday strength of Bangsamoro women, and the
   page behind "Who is Jo" on the landing site says what she
   stands for. The persona lives in the prompt and on that page;
   nothing here performs it.

   It is mounted once in each app's root layout rather than on a
   page, so a conversation four turns deep survives moving between
   pages, and closing it to read something does not lose it.

   The whole window, not a panel in the middle of one (user
   decision): an answer here is a paragraph and up to eight records
   under it, and a 600px box turned every one of them into a
   scroll. Full width with the content held to a reading column is
   the same shape the answers already have.

   It is still a native <dialog>, sized to the viewport: the focus
   trap, the Escape key and the inert page behind it are the
   browser's, not four hand-rolled approximations of them.

   It is never stored. The whole conversation is posted on each
   turn, because the endpoint keeps nothing, and leaving the site
   loses it — which is the honest behavior for a question nobody
   asked to have kept.

   The styling is plain CSS on this estate's own tokens, so it
   takes on whichever workspace it was opened in, dark mode
   included, without any app having to know it is there.
   ============================================================ */

import { useEffect, useRef, useState } from 'react'

type Source = { kind: string; title: string; note: string; href: string; photo?: { src: string; alt: string } }
type Series = { year: number; total: number }[]
type Dated = { era: string; title: string; description: string }
type Seated = { name: string; party: string; seat: string }
type Link = { title: string; href: string }
type Reply = {
	ok: boolean
	say?: string
	sources?: Source[]
	series?: Series
	timeline?: Dated[]
	roster?: Seated[]
	web?: Link[]
	error?: string
}
type Turn = {
	role: 'user' | 'assistant'
	text: string
	sources?: Source[]
	series?: Series
	timeline?: Dated[]
	roster?: Seated[]
	web?: Link[]
}

/**
 * The region's budget year by year, under an answer that is about it.
 *
 * Bars rather than a line: seven readings are a set of amounts and not a
 * continuous quantity, and at this size a line would be four pixels of slope
 * doing the work a column does by standing taller. Drawn in divs, because a
 * chart of seven numbers does not need a charting library and this file ships
 * to every page on the estate.
 *
 * The figures are on it, not in a tooltip — the dock is read once and closed,
 * and a number you have to hover to see is a number nobody reads.
 */
function Years({ series }: { series: Series }) {
	const most = Math.max(...series.map((one) => one.total)) || 1
	return (
		<figure className='ask-years'>
			{series.map((one) => (
				<div key={one.year} className='ask-year'>
					<span className='ask-year-fig'>{(one.total / 1e9).toFixed(1)}</span>
					<span className='ask-year-bar' style={{ height: `${(one.total / most) * 100}%` }} />
					<span className='ask-year-tag'>&rsquo;{String(one.year).slice(2)}</span>
				</div>
			))}
			<figcaption className='ask-years-cap'>Enacted budget, billions of pesos</figcaption>
		</figure>
	)
}

/**
 * A dated sequence, as a rail with the eras hanging off it.
 *
 * Six centuries asked for date by date is not a paragraph. The landing site
 * draws the same events with a scroll-driven fill and a photograph per era;
 * this is the same shape with neither, because the dock is a column of text a
 * reader is scrolling through an answer in, not a page they came to look at.
 *
 * Square markers, not round: everything on this estate is square, down to the
 * chips that were pills until somebody squared them. The rail is drawn behind
 * them and stopped on the last one, so it connects the events rather than
 * trailing off under the answer that follows.
 */
function Timeline({ events }: { events: Dated[] }) {
	return (
		<ol className='ask-time'>
			{events.map((event) => (
				<li key={event.era + event.title} className='ask-time-row'>
					<span aria-hidden className='ask-time-mark' />
					<p className='ask-time-era'>{event.era}</p>
					<p className='ask-time-name'>{event.title}</p>
					<p className='ask-time-body'>{event.description}</p>
				</li>
			))}
		</ol>
	)
}

/**
 * The answer, typed out (user decision), with whatever it carries under it.
 *
 * Only the newest turn types. An older one re-typing every time the list
 * re-renders would be a page that never settles, and a reader scrolling back
 * to something they have already read does not want to watch it arrive again.
 *
 * Characters rather than words, three to a frame: a word at a time reads as a
 * stutter at this size, and a sentence of 180 characters lands in about a
 * second, which is roughly as fast as it can go while still looking typed.
 *
 * Nothing under the answer appears until the answer has finished. A timeline
 * sliding in beside a half-written sentence is two things arriving at once,
 * and the sentence is the one that says what the other is.
 *
 * `prefers-reduced-motion` gets the whole answer immediately. The media query
 * is read once on mount rather than subscribed to: this component lives for a
 * second and a half, and a reader who changes the setting mid-answer is not a
 * case worth the listener.
 */
function Body({
	turn,
	live,
	children,
}: {
	turn: Turn
	live: boolean
	children: React.ReactNode
}) {
	const full = turn.text.length
	const [shown, setShown] = useState(live ? 0 : full)

	useEffect(() => {
		if (!live) return setShown(full)
		if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
			return setShown(full)
		setShown(0)
	}, [live, full, turn.text])

	useEffect(() => {
		if (shown >= full) return
		const id = window.setTimeout(() => setShown((was) => Math.min(full, was + 3)), 16)
		return () => window.clearTimeout(id)
	}, [shown, full])

	const done = shown >= full

	return (
		<div className='ask-body'>
			{/* The whole answer is in the DOM for a screen reader from the first
			    frame; only the visible half is typed. A live region that grew by
			    three characters every sixteen milliseconds would be read out as
			    it arrived, one fragment at a time. */}
			<span className='sr-only'>{turn.text}</span>
			<span aria-hidden={true}>
				<Prose text={turn.text.slice(0, shown)} />
			</span>

			{done ? (
				<>
					{turn.series ? <Years series={turn.series} /> : null}
					{turn.timeline?.length ? <Timeline events={turn.timeline} /> : null}
					{turn.roster?.length ? <Roster people={turn.roster} /> : null}
					{turn.web ? <FromWeb links={turn.web} /> : null}
					{children}
				</>
			) : null}
		</div>
	)
}

/**
 * Said where an answer came off the internet rather than off the records.
 *
 * The rest of the estate tells a transcribed Act from a page somebody put up
 * this morning by where the file lives. A web answer lives nowhere, so the
 * distinction has to be drawn here or it is not drawn at all — and it is
 * drawn whether or not the search returned citations, because an uncited
 * answer is the one that needs saying most.
 */
function FromWeb({ links }: { links: Link[] }) {
	return (
		<div className='ask-web'>
			<p className='ask-kind'>From the web, not from the records</p>
			{links.length ? (
				<ul className='ask-web-list'>
					{links.map((one) => (
						<li key={one.href}>
							<a href={one.href} target='_blank' rel='noreferrer noopener'>
								<span className='ask-web-name'>{one.title}</span>
								<Arrow size={13} className='ask-go' />
							</a>
						</li>
					))}
				</ul>
			) : (
				<p className='ask-web-none'>The search returned no page to point at for this one.</p>
			)}
		</div>
	)
}

/**
 * Who holds the seats, grouped by the party they sit for.
 *
 * A roster is the one answer that is genuinely a list: eighty names and the
 * seat each one holds is not a paragraph, and asked for the representatives of
 * each party a reader wants to run down a column, not read a sentence naming
 * three of them.
 *
 * Grouped by the party each member is recorded under, which is not always the
 * party whose total they count toward — several district winners ran under a
 * local label affiliated to an alliance. So the count printed here is of the
 * rows shown and is never called a party's seat total, which is a different
 * number and lives on the party's own record.
 */
function Roster({ people }: { people: Seated[] }) {
	const parties: { party: string; rows: Seated[] }[] = []
	for (const one of people) {
		const last = parties[parties.length - 1]
		if (last?.party === one.party) last.rows.push(one)
		else parties.push({ party: one.party, rows: [one] })
	}

	return (
		<div className='ask-roll'>
			{parties.map((group) => (
				<div key={group.party} className='ask-roll-group'>
					<p className='ask-kind'>
						{group.party} <span className='ask-roll-count'>{group.rows.length} shown</span>
					</p>
					<ul className='ask-roll-list'>
						{group.rows.map((one) => (
							<li key={one.name} className='ask-roll-row'>
								<span className='ask-roll-name'>{one.name}</span>
								<span className='ask-roll-seat'>{one.seat}</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}

const OPENERS = [
	'Who are the UBJP nominees?',
	'How many seats did BFP win?',
	'What does the budget give to health?',
	'How many barangays are in Marawi?',
]

/**
 * Whether Jo is on the estate at all.
 *
 * Off for now (user decision). One switch rather than six edits: the dock is
 * mounted in every app's layout, and taking the mounts out would mean putting
 * six of them back. Everything behind it — the corpus, the search, the route —
 * is untouched and still checked by `search.check.ts`, so this is a curtain
 * rather than a demolition.
 *
 * The hooks run either way, because they have to: React counts them, and a
 * component that returns early before calling them is a component that breaks
 * the moment this flips back to true.
 */
export const JO = false

export function AskDock() {
	const [open, setOpen] = useState(false)
	const [turns, setTurns] = useState<Turn[]>([])
	const [said, setSaid] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [asking, setAsking] = useState(false)
	const panel = useRef<HTMLDialogElement>(null)
	const box = useRef<HTMLTextAreaElement>(null)
	const foot = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const dialog = panel.current
		if (!dialog) return
		if (open && !dialog.open) {
			dialog.showModal()
			box.current?.focus()
		}
		if (!open && dialog.open) dialog.close()
	}, [open])

	// The newest turn, which is what somebody is waiting to read.
	useEffect(() => {
		if (open) foot.current?.scrollIntoView({ block: 'end' })
	}, [turns, asking, open])

	async function ask(text: string) {
		const question = text.trim()
		if (!question || asking) return

		const sent: Turn[] = [...turns, { role: 'user', text: question }]
		setTurns(sent)
		setSaid('')
		setError(null)
		setAsking(true)

		const reply = await fetch('/api/ask', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ turns: sent.map(({ role, text }) => ({ role, text })) }),
		})
			.then((response) => response.json() as Promise<Reply>)
			.catch((): Reply => ({ ok: false, error: 'That did not come back. Try again.' }))

		setAsking(false)
		if (!reply.ok) {
			setError(reply.error ?? 'That did not come back. Try again.')
			// What they typed goes back in the box rather than being lost to a
			// failed request — they can send it again with one key.
			setSaid(question)
			setTurns(turns)
			return
		}
		setTurns([
			...sent,
			{
				role: 'assistant',
				text: reply.say ?? '',
				sources: reply.sources,
				series: reply.series,
				timeline: reply.timeline,
				roster: reply.roster,
				web: reply.web,
			},
		])
	}

	// After every hook, never before one.
	if (!JO) return null

	return (
		<>
			<style>{CSS}</style>

			<button
				type='button'
				className='ask-launcher'
				hidden={open}
				aria-label='Ask Jo'
				onClick={() => setOpen(true)}
			>
				<Spark size={19} />
				<span>Ask</span>
			</button>

			<dialog ref={panel} className='ask-screen' aria-label='Ask Jo' onClose={() => setOpen(false)}>
				<header className='ask-head'>
					<div className='ask-column ask-bar'>
						<span aria-hidden className='ask-mark'>
							<Spark size={20} />
						</span>
						<span className='ask-titles'>
							<strong>Ask Jo</strong>
							<small>Measures, budgets, the election, towns and places — answered from the record</small>
						</span>
						{turns.length > 0 ? (
							<button
								type='button'
								className='ask-plain'
								disabled={asking}
								onClick={() => {
									setTurns([])
									setError(null)
									setSaid('')
								}}
							>
								<Compose />
								<span>Start again</span>
							</button>
						) : null}
						<button type='button' className='ask-plain ask-shut' onClick={() => setOpen(false)} aria-label='Close'>
							<Cross />
						</button>
					</div>
				</header>

				<div className='ask-scroll' data-empty={turns.length === 0}>
					<div className='ask-column ask-thread'>
						{turns.length === 0 ? (
							<div className='ask-opening'>
								{/* Who she is before what she does (user decision), in the order
								    the "Who is Jo" page takes it — and both, because a persona
								    that hides the machine spends the same credibility the rest
								    of the estate is built on. */}
								<p className='ask-hello'>I am Jo.</p>
								<p>
									A voice drawn from the everyday strength of Bangsamoro women — a daughter, a sister, a
									mother. I am also software: every question runs a search across the workspaces first, and
									I write only from what comes back.
								</p>
								<p>
									Ask me about a measure Parliament passed, what an office was appropriated, who won a seat
									in the September election, a town and the barangays in it, or where to go and what to eat.
									The records behind every answer are linked underneath it.
								</p>

								{/* A ruled list rather than chips (user decision). Four questions
								    as pills wrapped three-then-one and read as tags on the
								    paragraph above; ranged down the page they read as things to
								    press, and they take the same shape as the source rows under
								    every answer, which is the one list pattern this dock has. */}
								<p className='ask-kind ask-try'>Try one of these</p>
								<ul className='ask-openers'>
									{OPENERS.map((one) => (
										<li key={one}>
											<button type='button' className='ask-opener' onClick={() => ask(one)}>
												<span>{one}</span>
												<Arrow size={14} className='ask-go' />
											</button>
										</li>
									))}
								</ul>

								<p className='ask-whois'>
									<a href='https://betterbarmm.com/jo'>Who is Jo?</a>
								</p>
							</div>
						) : null}

						{turns.map((turn, at) =>
							turn.role === 'user' ? (
								<p key={at} className='ask-mine'>
									{turn.text}
								</p>
							) : (
								<div key={at} className='ask-said'>
									<span aria-hidden className='ask-dot'>
										<Spark />
									</span>
									<Body turn={turn} live={at === turns.length - 1}>
										{turn.sources?.length
											? grouped(turn.sources).map(([kind, rows]) => (
													<div key={kind} className='ask-group'>
														<p className='ask-kind'>{plural(kind, rows.length)}</p>
														<ul className='ask-sources'>
															{rows.map((source) => (
																<li key={source.href}>
																	<a href={source.href}>
																		{source.photo ? (
																			/* eslint-disable-next-line @next/next/no-img-element */
																			<img className='ask-shot' src={source.photo.src} alt={source.photo.alt} loading='lazy' decoding='async' />
																		) : null}
																		<span className='ask-lines'>
																			<span className='ask-name'>{source.title}</span>
																			<span className='ask-note'>{source.note}</span>
																		</span>
																		<Arrow size={14} className='ask-go' />
																	</a>
																</li>
															))}
														</ul>
													</div>
												))
											: null}
									</Body>
								</div>
							),
						)}

						{asking ? (
							<div className='ask-said ask-wait' role='status'>
								<span aria-hidden className='ask-dot'>
									<Spark />
								</span>
								<p className='ask-prose ask-waiting'>Reading the record…</p>
							</div>
						) : null}

						<div ref={foot} />
					</div>
				</div>

				<div className='ask-foot'>
					<div className='ask-column'>
						{error ? <p className='ask-error'>{error}</p> : null}
						<div className='ask-compose'>
							<textarea
								ref={box}
								rows={1}
								value={said}
								placeholder='Ask about a measure, a budget, a seat won, or a place to go'
								aria-label='What you want to know'
								onChange={(event) => setSaid(event.target.value)}
								onKeyDown={(event) => {
									// Enter sends; Shift-Enter is a new line, as every chat box works.
									// Not mid-composition — an IME's Enter is picking a word.
									if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
										event.preventDefault()
										void ask(said)
									}
								}}
							/>
							<button
								type='button'
								className={asking ? 'ask-send ask-busy' : 'ask-send'}
								aria-label={asking ? 'Asking' : 'Send'}
								disabled={asking || !said.trim()}
								onClick={() => void ask(said)}
							>
								{asking ? <Spinner /> : <Arrow />}
							</button>
						</div>
					</div>
				</div>
			</dialog>
		</>
	)
}

/** "Acts", "Bills", "Municipalities" — the heading over a run of one kind. */
const plural = (kind: string, count: number) =>
	count === 1 ? kind : kind.endsWith('y') ? `${kind.slice(0, -1)}ies` : `${kind}s`

/**
 * The records under an answer, gathered by what they are.
 *
 * A question about agriculture comes back with an office, four acts, three
 * bills and two programs, and as one flat run they read as ten
 * indistinguishable rows. Grouped, a reader can go straight to the money or
 * straight to the law. First-appearance order, so the best match still leads.
 */
function grouped(sources: Source[]): [string, Source[]][] {
	const kinds = new Map<string, Source[]>()
	for (const source of sources) {
		const run = kinds.get(source.kind)
		if (run) run.push(source)
		else kinds.set(source.kind, [source])
	}
	return [...kinds]
}

const BULLET = /^\s*[-*\u2022]\s+/

/** `**bold**`, with whatever else the model fenced or hashed taken off. */
function marked(line: string) {
	return line
		.replace(/^#{1,6}\s+/, '')
		.split(/\*\*(.+?)\*\*/g)
		.map((part, at) => (at % 2 ? <strong key={at}>{part}</strong> : part))
}

/**
 * The answer, rendered.
 *
 * A model writes Markdown whether or not it was asked to, and told not to it
 * writes it anyway — the same lesson as the arithmetic. So the little of it
 * that actually turns up is rendered rather than printed: bold, and bullets.
 * Nothing else, and no parser: a heading gets its hashes taken off and reads
 * as a line of prose, which is all a heading in a three-sentence answer ever
 * was.
 *
 * Bullets pasted onto one line — " - **Cotabato City** … - **Lamitan** …",
 * which is what `qwen2.5:7b` sends about half the time — are put back onto
 * lines of their own first. Only where a dash is followed by bold, since a
 * dash between two words is punctuation and not a list.
 */
export function Prose({ text }: { text: string }) {
	const blocks: { list: boolean; lines: string[] }[] = []
	for (const raw of text.replace(/\s+[-*\u2022]\s+(?=\*\*)/g, '\n- ').split('\n')) {
		const line = raw.trim()
		if (!line) continue
		const list = BULLET.test(line)
		const last = blocks[blocks.length - 1]
		if (last && last.list === list) last.lines.push(line.replace(BULLET, ''))
		else blocks.push({ list, lines: [line.replace(BULLET, '')] })
	}

	return (
		<>
			{blocks.map((block, at) =>
				block.list ? (
					<ul key={at} className='ask-list'>
						{block.lines.map((one, n) => (
							<li key={n}>{marked(one)}</li>
						))}
					</ul>
				) : (
					<p key={at} className='ask-prose'>
						{marked(block.lines.join(' '))}
					</p>
				),
			)}
		</>
	)
}

/** Start again: a fresh sheet and something to write on it. */
function Compose() {
	return (
		<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden focusable='false'>
			<path d='M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6' strokeLinecap='round' strokeLinejoin='round' />
			<path d='M18.4 2.6a2 2 0 0 1 2.8 2.8L12.6 14l-3.6.9.9-3.6 8.5-8.7z' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

/** The arrow's place while a question is in flight. */
function Spinner() {
	return (
		<svg className='ask-spin' viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' strokeWidth='2.5' aria-hidden focusable='false'>
			<circle cx='12' cy='12' r='9' opacity='0.25' />
			<path d='M21 12a9 9 0 0 0-9-9' strokeLinecap='round' />
		</svg>
	)
}

function Arrow({ size = 18, className }: { size?: number; className?: string }) {
	return (
		<svg className={className} viewBox='0 0 24 24' width={size} height={size} fill='none' stroke='currentColor' strokeWidth='2' aria-hidden focusable='false'>
			<path d='M4 12h15M13 6l6 6-6 6' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	)
}

function Cross() {
	return (
		<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden focusable='false'>
			<path d='M6 6l12 12M18 6L6 18' strokeLinecap='round' />
		</svg>
	)
}

function Spark({ size = 16 }: { size?: number }) {
	return (
		<svg viewBox='0 0 24 24' width={size} height={size} aria-hidden focusable='false'>
			<path d='M12 2.5l2.1 5.9 5.9 2.1-5.9 2.1L12 18.5l-2.1-5.9L4 10.5l5.9-2.1L12 2.5z' fill='currentColor' />
		</svg>
	)
}

const CSS = `
.ask-launcher {
	position: fixed; right: 24px; bottom: 24px; z-index: 60;
	display: inline-flex; align-items: center; gap: 9px;
	padding: 15px 24px; border: 0; border-radius: 999px;
	background: var(--accent, #8a2418); color: #fff;
	font: inherit; font-size: 16px; font-weight: 600; line-height: 1; cursor: pointer;
	box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24);
}
.ask-launcher:hover { filter: brightness(1.08); }
.ask-launcher[hidden] { display: none; }

/* The window, not a box in the middle of it. A dialog still, so the browser
   keeps the focus trap and Escape; only its size and edges are taken off. */
.ask-screen {
	width: 100vw; height: 100dvh; max-width: none; max-height: none;
	margin: 0; padding: 0; border: 0; border-radius: 0;
	background: var(--paper-2, #fbfbfa); color: var(--ink, #171715); font: inherit;
}
.ask-screen:not([open]) { display: none; }
.ask-screen[open] { display: flex; flex-direction: column; }
.ask-screen::backdrop { background: var(--paper-2, #fbfbfa); }

/* Arriving.

   The screen covers the whole page, and a full-page ground that simply
   replaces the one underneath it reads as a navigation — as though the
   question took you somewhere else. Rising the last few pixels into place
   says the opposite: the page is still there, this came up over it.

   Done in CSS on the dialog itself rather than by wrapping it in a motion
   component. display and overlay are discrete properties, so a dialog
   normally cannot animate out at all — it is removed from the top layer on
   the frame it closes and whatever was fading goes with it. allow-discrete
   holds both until the transition finishes, and the starting-style rule
   supplies the state to come from, which an element that was display:none a
   moment ago otherwise has no way to name. That pair is the whole reason no
   JavaScript is involved.

   Short, and shorter than it looks: this sits between a click and a reading
   surface, and anything past about a quarter of a second in that position is
   felt as the page being slow rather than as the screen being smooth. */
.ask-screen {
	opacity: 0;
	transform: translateY(10px) scale(0.994);
	transition:
		opacity 240ms cubic-bezier(0.22, 1, 0.36, 1),
		transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
		display 240ms allow-discrete,
		overlay 240ms allow-discrete;
}
.ask-screen[open] { opacity: 1; transform: none; }
@starting-style {
	.ask-screen[open] { opacity: 0; transform: translateY(10px) scale(0.994); }
}

/* The ground behind it fades on its own clock — a shade quicker in, so the
   page is already covered by the time the screen itself lands. */
.ask-screen::backdrop {
	opacity: 0;
	transition:
		opacity 200ms ease,
		display 200ms allow-discrete,
		overlay 200ms allow-discrete;
}
.ask-screen[open]::backdrop { opacity: 1; }
@starting-style {
	.ask-screen[open]::backdrop { opacity: 0; }
}

/* One reading column down the middle, which every part lines up on. */
.ask-column { width: 100%; max-width: 780px; margin: 0 auto; padding: 0 20px; }

.ask-head { flex: none; padding: 14px 0; border-bottom: 1px solid var(--rule-soft, #f1f1ee); }
.ask-bar { display: flex; align-items: center; gap: 12px; }
.ask-mark {
	display: inline-flex; align-items: center; justify-content: center;
	width: 42px; height: 42px; flex: none; border-radius: 13px;
	background: var(--accent, #8a2418); color: #fff;
}
.ask-titles { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.ask-titles strong { font-size: 18px; letter-spacing: -0.02em; }
.ask-titles small { font-size: 13px; color: var(--ink-mute, #76766e); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ask-plain {
	display: inline-flex; align-items: center; gap: 6px;
	flex: none; padding: 7px 12px; border: 0; border-radius: 999px;
	background: transparent; color: var(--ink-mute, #76766e);
	font: inherit; font-size: 12.5px; cursor: pointer;
}
.ask-plain:hover:not(:disabled) { background: var(--paper-3, #efefed); color: var(--ink, #171715); }
.ask-plain:disabled { opacity: 0.5; cursor: default; }
.ask-shut { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; padding: 0; }

/* Empty, the opening sits on the vertical middle instead of hard against the
   head with a screen of nothing under it. Auto block margins rather than
   justify-content: center — centred content taller than the box is clipped at
   the top with no way to scroll back to it, and this block is tall on a phone. */
.ask-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 28px 0 8px; display: flex; flex-direction: column; }
.ask-scroll[data-empty='true'] > .ask-thread { margin-block: auto; }
.ask-thread { display: flex; flex-direction: column; gap: 26px; }

.ask-opening { display: flex; flex-direction: column; gap: 13px; }
.ask-opening p { margin: 0; font-size: 15px; line-height: 1.65; text-wrap: pretty; color: var(--ink-3, #5a5a53); }
.ask-hello {
	font-size: 26px; line-height: 1.15; font-weight: 600; letter-spacing: -0.025em;
	color: var(--ink, #171715);
}
.ask-try { margin-top: 12px; }
.ask-whois { margin-top: 4px; font-size: 13px; }

.ask-openers { list-style: none; display: flex; flex-direction: column; margin: 0; padding: 0; }
.ask-openers li { border-top: 1px solid var(--rule-soft, #f1f1ee); }
.ask-openers li:last-child { border-bottom: 1px solid var(--rule-soft, #f1f1ee); }
.ask-opener {
	display: flex; align-items: center; justify-content: space-between; gap: 20px;
	width: 100%; padding: 14px 2px; border: 0; background: transparent;
	color: var(--ink-2, #3b3b36); font: inherit; font-size: 15px; text-align: left; cursor: pointer;
}
.ask-opener:hover { color: var(--accent, #8a2418); }
.ask-opener:hover .ask-go { color: var(--accent, #8a2418); transform: translateX(2px); }

/* ---- Everything arrives rather than being already there ----

   The budget workspace's own easing, cubic-bezier(0.16, 1, 0.3, 1), and its
   distance: a short rise of a few pixels under a fade, never a slide. The
   opening is staggered by child so it reads top to bottom the way it is meant
   to be read, and an answer and its records rise together when they land.

   Kept in CSS rather than pulled from the editorial package: this dock is
   embedded in six apps and ships its own styles, and a motion library in it
   would put the estate's animation runtime into every one of them twice. */
.ask-opening > * { animation: ask-rise 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ask-opening > *:nth-child(1) { animation-delay: 40ms; }
.ask-opening > *:nth-child(2) { animation-delay: 100ms; }
.ask-opening > *:nth-child(3) { animation-delay: 160ms; }
.ask-opening > *:nth-child(4) { animation-delay: 220ms; }
.ask-opening > *:nth-child(5) { animation-delay: 270ms; }
.ask-opening > *:nth-child(6) { animation-delay: 330ms; }
.ask-openers li { animation: ask-rise 480ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ask-openers li:nth-child(1) { animation-delay: 290ms; }
.ask-openers li:nth-child(2) { animation-delay: 340ms; }
.ask-openers li:nth-child(3) { animation-delay: 390ms; }
.ask-openers li:nth-child(4) { animation-delay: 440ms; }

.ask-mine, .ask-said { animation: ask-rise 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ask-said .ask-group { animation: ask-rise 480ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 120ms; }
.ask-years { animation: ask-rise 520ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 80ms; }
/* The bars grow from the baseline they are measured against. */
.ask-year-bar { transform-origin: bottom; animation: ask-grow 620ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ask-year:nth-child(1) .ask-year-bar { animation-delay: 140ms; }
.ask-year:nth-child(2) .ask-year-bar { animation-delay: 190ms; }
.ask-year:nth-child(3) .ask-year-bar { animation-delay: 240ms; }
.ask-year:nth-child(4) .ask-year-bar { animation-delay: 290ms; }
.ask-year:nth-child(5) .ask-year-bar { animation-delay: 340ms; }
.ask-year:nth-child(6) .ask-year-bar { animation-delay: 390ms; }
.ask-year:nth-child(7) .ask-year-bar { animation-delay: 440ms; }

@keyframes ask-rise {
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: none; }
}
@keyframes ask-grow {
	from { transform: scaleY(0); }
	to { transform: scaleY(1); }
}

/* What was asked: a pill on the right, as every chat writes it. */
.ask-mine {
	align-self: flex-end; max-width: 80%; margin: 0;
	padding: 11px 16px; border-radius: 18px;
	background: var(--paper-3, #efefed); color: var(--ink, #171715);
	font-size: 14.5px; line-height: 1.55; white-space: pre-wrap;
}

/* What came back: no bubble. It is the page's own prose, with the records
   under it — a box around a paragraph of that length reads as a quotation. */
.ask-said { display: flex; gap: 12px; align-items: flex-start; }
.ask-dot {
	display: inline-flex; align-items: center; justify-content: center;
	width: 26px; height: 26px; flex: none; margin-top: 1px; border-radius: 999px;
	background: var(--accent, #8a2418); color: #fff;
}
.ask-body { display: flex; flex-direction: column; gap: 14px; min-width: 0; flex: 1; }
.ask-group { display: flex; flex-direction: column; gap: 2px; }
.ask-kind {
	margin: 0 0 4px; font-size: 10.5px; font-weight: 600; text-transform: uppercase;
	letter-spacing: 0.09em; color: var(--ink-mute, #76766e);
}
.ask-prose {
	margin: 0; font-size: 14.5px; line-height: 1.65; text-wrap: pretty;
	color: var(--ink-2, #3b3b36);
}
.ask-prose strong, .ask-list strong { font-weight: 600; color: var(--ink, #171715); }
/* No markers and no indent: a bullet's worth of padding put the list on a
   different left edge from the paragraph above it, and these items carry a
   name and a sentence each — they read as lines, not as ticks. */
.ask-list {
	margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px;
	font-size: 14.5px; line-height: 1.6; text-wrap: pretty; color: var(--ink-2, #3b3b36);
}
/* The one line somebody sits in front of. Centerd on its mark rather than
   hung from the top of it, since there is only ever one line, and breathing
   so the wait reads as work rather than as a stall. */
.ask-wait { align-items: center; }
.ask-wait .ask-dot { margin-top: 0; animation: ask-breathe 1.4s ease-in-out infinite; }
.ask-waiting { color: var(--ink-mute, #76766e); animation: ask-fade 1.4s ease-in-out infinite; }

@keyframes ask-breathe {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.12); }
}
@keyframes ask-fade {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.55; }
}
@media (prefers-reduced-motion: reduce) {
	.ask-wait .ask-dot, .ask-waiting { animation: none; }
	.ask-spin { animation-duration: 2.4s; }
	/* Nothing travels and nothing grows. Everything is simply there — which is
	   what the setting asks for, and the only thing lost is the order it would
	   have arrived in. */
	.ask-opening > *,
	.ask-openers li,
	.ask-mine,
	.ask-said,
	.ask-said .ask-group,
	.ask-years,
	.ask-year-bar,
	.ask-time-row { animation: none; }
	.ask-opener:hover .ask-go { transform: none; }
	/* The fade stays — it is what stops the screen appearing from nowhere —
	   but nothing travels. */
	.ask-screen, .ask-screen[open] { transform: none; }
	@starting-style {
		.ask-screen[open] { transform: none; }
	}
}

/* A plain list, ruled rather than boxed (user decision): eight cards under
   every answer made the records look like eight offers to click, when they
   are the working underneath the sentence above them. */
/* The seven-year chart. A grid so the bars share one baseline and the
   figures above them stay on one row however tall each column is. */
.ask-years {
	display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;
	align-items: end; margin: 18px 0 0; padding: 0; height: 132px;
}
.ask-year { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 5px; }
.ask-year-fig { font-size: 10.5px; font-weight: 600; color: var(--ink-3, #5a5a53); font-variant-numeric: tabular-nums; }
.ask-year-bar { width: 100%; min-height: 2px; background: var(--accent, #8a2418); border-radius: 2px 2px 0 0; }
.ask-year-tag { font-size: 10px; color: var(--ink-mute, #76766e); font-variant-numeric: tabular-nums; }
.ask-years-cap {
	grid-column: 1 / -1; margin: 8px 0 0; font-size: 11px; color: var(--ink-mute, #76766e);
}

/* A web answer, fenced off. The brass edge is the estate's "this is a note
   about the thing, not the thing" mark, and it is the one block here that is
   not the project's own record. */
.ask-web {
	margin-top: 18px; padding: 12px 14px;
	border-left: 2px solid var(--brass, #b08d3f);
	background: var(--paper-3, #efefed);
}
.ask-web-list { list-style: none; margin: 6px 0 0; padding: 0; }
.ask-web-list a {
	display: flex; align-items: center; justify-content: space-between; gap: 14px;
	padding: 6px 0; text-decoration: none; color: inherit; font-size: 13.5px;
}
.ask-web-list a:hover .ask-web-name { color: var(--accent, #8a2418); }
.ask-web-list a:hover .ask-go { color: var(--accent, #8a2418); }
.ask-web-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ask-web-none { margin: 6px 0 0; font-size: 13px; color: var(--ink-mute, #76766e); }

/* The roster. A column of names with the seat each one holds ranged right, so
   a reader runs down the names and only crosses to the seat when one matters.
   Grouped under the party heading the records file each member under. */
.ask-roll { display: flex; flex-direction: column; gap: 18px; margin-top: 18px; }
.ask-roll-group { display: flex; flex-direction: column; gap: 2px; }
.ask-roll-count { font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--ink-mute, #76766e); }
.ask-roll-list { list-style: none; margin: 0; padding: 0; }
.ask-roll-row {
	display: flex; align-items: baseline; justify-content: space-between; gap: 18px;
	padding: 8px 2px; border-top: 1px solid var(--rule-soft, #f1f1ee);
}
.ask-roll-name { font-size: 14px; color: var(--ink, #171715); }
.ask-roll-seat { flex: none; font-size: 12px; color: var(--ink-mute, #76766e); text-align: right; }

/* Visually gone, still read out. The typed half of an answer is hidden from
   assistive technology and this carries the whole of it. */
.sr-only {
	position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
	overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

/* The timeline. A rail behind square markers, stopped on the last event so it
   connects them rather than trailing off under whatever follows.

   The rail is drawn by the row rather than by the list, because a single
   element down the side cannot know where the last marker is; each row draws
   its own segment from its marker downwards and the last row draws none. */
.ask-time { list-style: none; margin: 18px 0 0; padding: 0; }
.ask-time-row { position: relative; padding: 0 0 22px 26px; }
.ask-time-row:last-child { padding-bottom: 0; }
.ask-time-row::before {
	content: "";
	position: absolute; left: 4px; top: 16px; bottom: 0; width: 1px;
	background: var(--rule, #e7e7e3);
}
.ask-time-row:last-child::before { display: none; }
.ask-time-mark {
	position: absolute; left: 0; top: 7px;
	width: 9px; height: 9px; background: var(--accent, #8a2418);
}
.ask-time-era {
	margin: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
	text-transform: uppercase; color: var(--accent, #8a2418);
	font-variant-numeric: tabular-nums;
}
.ask-time-name {
	margin: 3px 0 0; font-size: 14.5px; font-weight: 600;
	letter-spacing: -0.01em; color: var(--ink, #171715);
}
.ask-time-body {
	margin: 5px 0 0; font-size: 13.5px; line-height: 1.6; text-wrap: pretty;
	color: var(--ink-2, #3b3b36);
}
.ask-time-row { animation: ask-rise 480ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ask-time-row:nth-child(1) { animation-delay: 60ms; }
.ask-time-row:nth-child(2) { animation-delay: 100ms; }
.ask-time-row:nth-child(3) { animation-delay: 140ms; }
.ask-time-row:nth-child(4) { animation-delay: 180ms; }
.ask-time-row:nth-child(5) { animation-delay: 220ms; }
.ask-time-row:nth-child(n + 6) { animation-delay: 260ms; }

.ask-sources { list-style: none; display: flex; flex-direction: column; margin: 0; padding: 0; }
.ask-sources li { border-top: 1px solid var(--rule-soft, #f1f1ee); }
.ask-sources a {
	display: flex; align-items: center; gap: 28px; padding: 12px 2px;
	text-decoration: none; color: inherit;
}
.ask-sources a:hover .ask-name { color: var(--accent, #8a2418); }
.ask-sources a:hover .ask-go { color: var(--accent, #8a2418); }
.ask-shot {
	width: 58px; height: 44px; flex: none; border-radius: 8px;
	object-fit: cover; background: var(--paper-3, #efefed);
}
.ask-lines { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.ask-name { font-size: 13.5px; font-weight: 600; color: var(--ink, #171715); }
.ask-note { font-size: 12.5px; line-height: 1.45; color: var(--ink-mute, #76766e); }
.ask-go { flex: none; color: var(--ink-mute, #76766e); transition: transform 200ms ease, color 200ms ease; }

.ask-foot { flex: none; display: flex; flex-direction: column; gap: 8px; padding: 12px 0 24px; }
.ask-error { margin: 0 0 8px; font-size: 12.5px; color: var(--accent, #8a2418); }

/* One pill, and the arrow sits inside it: the button is taken out of the flow
   and parked against the right edge, with the field's own right padding
   keeping the text from ever running under it. */
.ask-compose {
	position: relative;
	border: 1px solid var(--rule, #e7e7e3); border-radius: 999px;
	background: var(--paper, #fff);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.ask-compose:focus-within { border-color: var(--ink-mute, #76766e); }
.ask-compose textarea {
	/* field-sizing grows the box with what is typed, natively. Where it is
	   not supported the box stays one line and scrolls, which is why the
	   overflow is set rather than left to the default. */
	field-sizing: content;
	display: block; width: 100%; resize: none; max-height: 200px; overflow-y: auto;
	padding: 16px 56px 16px 22px; border: 0; background: transparent; color: var(--ink, #171715);
	font: inherit; font-size: 15px; line-height: 1.5; outline: none;
}
.ask-compose textarea::placeholder { color: var(--ink-mute, #76766e); }
.ask-send {
	position: absolute; right: 9px; bottom: 9px;
	display: inline-flex; align-items: center; justify-content: center;
	width: 36px; height: 36px; padding: 0; border: 0; border-radius: 999px;
	background: transparent; color: var(--ink-3, #5a5a53); cursor: pointer;
}
.ask-send:hover:not(:disabled) { background: var(--paper-3, #efefed); color: var(--ink, #171715); }
.ask-send:disabled { opacity: 0.4; cursor: default; }
/* Disabled while it works, but not dimmed: the spinner is the one thing on
   the screen saying anything is happening. */
.ask-send.ask-busy:disabled { opacity: 1; }
.ask-spin { animation: ask-spin 0.8s linear infinite; transform-origin: 50% 50%; }

@keyframes ask-spin {
	to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
	.ask-launcher { right: 16px; bottom: 16px; padding: 13px 20px; font-size: 15px; }
	.ask-column { padding: 0 16px; }
	.ask-scroll { padding-top: 20px; }
	.ask-titles small { display: none; }
}
`
