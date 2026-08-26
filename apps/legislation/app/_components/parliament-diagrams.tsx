/* ============================================================
   Two things on the rulebook page that are pictures

   Both sections below were three paragraphs of prose describing something
   with a shape. A sitting calendar is a calendar; a vote either writes names
   down or it does not. Read as text a reader has to hold "first Wednesday",
   "third and fourth week" and "every Thursday" in their head at once and
   build the month themselves. Drawn, it is one glance.

   Neither diagram adds a fact. Everything in them is in the rules cited
   beside them, which is why the text they replace could go rather than sit
   underneath as a caption of itself.

   CSS grid rather than SVG: both are tables of cells, they have to reflow on
   a phone, and every colour has to come from a token so the dark theme and
   the brand band get them for free. An SVG would have fixed all three.
   ============================================================ */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'] as const

/** Which weeks of the month the Parliament actually sits, per Rule VI. */
const WEEKS = [
	{ label: 'Week 1', sits: false },
	{ label: 'Week 2', sits: false },
	{ label: 'Week 3', sits: true },
	{ label: 'Week 4', sits: true },
]

function Marker({ tone, children }: { tone: 'question' | 'privilege'; children: React.ReactNode }) {
	const tint =
		tone === 'question'
			? 'bg-[var(--tone-early-bg)] text-[var(--tone-early-fg)]'
			: 'bg-[var(--tone-move-bg)] text-[var(--tone-move-fg)]'

	return (
		<span
			className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-[0.04em] ${tint}`}
		>
			{children}
		</span>
	)
}

/**
 * A month of sittings.
 *
 * The empty fortnight is the point. Parliament sits on eight afternoons a
 * month, and the one hour the executive has to answer questions falls in a
 * week it is not otherwise sitting at all — which is visible here and was not
 * visible in the sentence that said it.
 */
export function SittingCalendar() {
	return (
		<figure className='mt-2'>
			<div className='overflow-x-auto'>
				<div className='min-w-[30rem]'>
					{/* Day names, over a spacer the width of the week column. */}
					<div className='grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] gap-1.5'>
						<span />
						{DAYS.map((day) => (
							<span key={day} className='label pb-2 text-center'>
								{day}
							</span>
						))}
					</div>

					{WEEKS.map((week) => (
						<div
							key={week.label}
							className='grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] items-stretch gap-1.5 pb-1.5'
						>
							<span className='meta-sm self-center'>{week.label}</span>

							{DAYS.map((day) => {
								// Question Hour and the Chief Minister's Hour share the first
								// Wednesday; Privilege Hour is every Thursday it sits.
								const isQuestionDay = week.label === 'Week 1' && day === 'Wed'
								const isPrivilegeDay = week.sits && day === 'Thu'

								return (
									<div
										key={day}
										className={`flex min-h-[3.75rem] flex-col items-center justify-center rounded-[var(--radius-sm)] px-1 py-2 text-center ${
											week.sits
												? 'bg-[var(--accent-soft)] text-[var(--ink)]'
												: 'border border-dashed border-[var(--rule)] text-[var(--ink-mute)]'
										}`}
									>
										{week.sits ? (
											<span className='num text-[11px] font-semibold leading-none'>1:00 pm</span>
										) : isQuestionDay ? null : (
											<span className='text-[11px] leading-none'>&mdash;</span>
										)}
										{isQuestionDay ? <Marker tone='question'>Questions</Marker> : null}
										{isPrivilegeDay ? <Marker tone='privilege'>Privilege</Marker> : null}
									</div>
								)
							})}
						</div>
					))}
				</div>
			</div>

			<figcaption className='mt-5 flex flex-wrap gap-x-6 gap-y-2 bb-body text-[var(--ink-3)]'>
				<span className='flex items-center gap-2'>
					<span className='size-3 rounded-[3px] bg-[var(--accent-soft)]' aria-hidden='true' />
					Plenary sits, from 1:00 pm
				</span>
				<span className='flex items-center gap-2'>
					<span className='size-3 rounded-[3px] bg-[var(--tone-early-bg)]' aria-hidden='true' />
					Question Hour, or the Chief Minister&rsquo;s Hour once a quarter
				</span>
				<span className='flex items-center gap-2'>
					<span className='size-3 rounded-[3px] bg-[var(--tone-move-bg)]' aria-hidden='true' />
					Privilege Hour
				</span>
			</figcaption>
		</figure>
	)
}

/** One row of the vote diagram: a member, and what the record keeps of them. */
function VoteRow({ named, name, answer }: { named: boolean; name: string; answer: string }) {
	return (
		<div className='flex items-center gap-3 border-t border-[var(--rule-soft)] py-2 first:border-t-0'>
			<span
				aria-hidden='true'
				className={`size-2 shrink-0 rounded-full ${named ? 'bg-[var(--tone-done-fg)]' : 'bg-[var(--ink-mute)]'}`}
			/>
			<span className={`flex-1 text-[13px] ${named ? 'text-[var(--ink)]' : 'text-[var(--ink-mute)]'}`}>
				{name}
			</span>
			<span className={`num text-[12px] ${named ? 'text-[var(--ink-2)]' : 'text-[var(--ink-mute)]'}`}>
				{answer}
			</span>
		</div>
	)
}

/**
 * What each kind of vote leaves behind.
 *
 * The page's most important claim is that you can see how members voted on
 * seven measures and on nothing else. That is a claim about two record
 * formats, so it is shown as two records.
 */
export function VoteComparison() {
	return (
		<figure className='mt-2 grid gap-5 sm:grid-cols-2'>
			{[
				{
					kind: 'Shouted vote',
					when: 'Second reading — most measures',
					rows: [
						{ named: false, name: 'Member', answer: '—' },
						{ named: false, name: 'Member', answer: '—' },
						{ named: false, name: 'Member', answer: '—' },
					],
					result: 'Approved',
					note: 'The record keeps the outcome. Who was on which side is never written down.',
					tone: 'idle' as const,
				},
				{
					kind: 'Vote by name',
					when: 'Third reading — 7 measures on record',
					rows: [
						{ named: true, name: 'Member A', answer: 'Yes' },
						{ named: true, name: 'Member B', answer: 'No' },
						{ named: true, name: 'Member C', answer: 'Abstain' },
					],
					result: 'Approved',
					note: 'The rules make the Journal record these in full, so every position survives.',
					tone: 'done' as const,
				},
			].map((panel) => (
				<div
					key={panel.kind}
					className='rounded-[var(--radius-lg)] border border-[var(--rule)] p-5'
				>
					<p className='item-title text-[var(--ink)]'>{panel.kind}</p>
					<p className='meta-sm mt-1'>{panel.when}</p>

					<div className='mt-4'>
						{panel.rows.map((row, index) => (
							<VoteRow key={index} {...row} />
						))}
					</div>

					<div className='mt-4 flex items-center justify-between border-t border-[var(--rule)] pt-3'>
						<span className='label'>In the Journal</span>
						<span
							className={`badge badge-plain ${panel.tone === 'done' ? 'badge-done' : 'badge-idle'}`}
						>
							{panel.result}
						</span>
					</div>

					<p className='mt-3 bb-body text-[var(--ink-3)]'>{panel.note}</p>
				</div>
			))}
		</figure>
	)
}
