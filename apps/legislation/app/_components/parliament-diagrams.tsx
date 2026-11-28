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
   a phone, and every color has to come from a token so the dark theme and
   the brand band get them for free. An SVG would have fixed all three.
   ============================================================ */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'] as const

type Tone = 'question' | 'privilege' | 'chief'
/** One afternoon: whether the plenary sits, and the fixed hours that fall on it. */
type Day = { sits: boolean; marks?: { tone: Tone; label: string }[] }
/** Four weeks of Monday to Thursday, the shape both rulebooks fit in. */
export type SittingMonth = Day[][]

const TINT: Record<Tone, string> = {
	question: 'bg-[var(--tone-early-bg)] text-[var(--tone-early-fg)]',
	privilege: 'bg-[var(--tone-move-bg)] text-[var(--tone-move-fg)]',
	chief: 'bg-[var(--tone-done-bg)] text-[var(--tone-done-fg)]',
}

/** The Transition Authority's month, per Rules VI, IX, X and XI: weeks 3 and 4
    sit Monday to Thursday, Privilege Hour every Thursday it sits, and Question
    Hour (or the Chief Minister's Hour) on the first Wednesday, a week it does
    not otherwise sit. */
export const BTA_MONTH: SittingMonth = [0, 1, 2, 3].map((week) =>
	DAYS.map((day) => {
		const sits = week >= 2
		if (week === 0 && day === 'Wed') return { sits, marks: [{ tone: 'question', label: 'Questions' }] }
		if (sits && day === 'Thu') return { sits, marks: [{ tone: 'privilege', label: 'Privilege' }] }
		return { sits }
	}),
)

export const BTA_LEGEND: { tone: Tone | 'sits'; label: string }[] = [
	{ tone: 'sits', label: 'Plenary sits, from 1:00 pm' },
	{ tone: 'question', label: 'Question Hour, or the Chief Minister’s Hour once a quarter' },
	{ tone: 'privilege', label: 'Privilege Hour' },
]

function Marker({ tone, children }: { tone: Tone; children: React.ReactNode }) {
	const tint = TINT[tone]

	return (
		<span
			className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase leading-none tracking-[0.04em] ${tint}`}
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
export function SittingCalendar({ month = BTA_MONTH, legend = BTA_LEGEND }: { month?: SittingMonth; legend?: typeof BTA_LEGEND }) {
	return (
		<figure className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'>
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

					{month.map((week, w) => (
						<div
							key={w}
							className='grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] items-stretch gap-1.5 pb-1.5'
						>
							<span className='meta-sm self-center'>Week {w + 1}</span>

							{week.map((day, d) => (
								<div
									key={DAYS[d]}
									className={`flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl px-1 py-2 text-center ${
										day.sits
											? 'bg-[var(--accent-soft)] text-[var(--ink)]'
											: 'border border-dashed border-[var(--rule)] text-[var(--ink-mute)]'
									}`}
								>
									{day.sits ? (
										<span className='num text-[0.6875rem] font-semibold leading-none'>1:00 pm</span>
									) : day.marks ? null : (
										<span className='text-[0.6875rem] leading-none'>&mdash;</span>
									)}
									{day.marks?.map((mark) => (
										<Marker key={mark.label} tone={mark.tone}>
											{mark.label}
										</Marker>
									))}
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			<figcaption className='mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--rule-soft)] pt-5 bb-body text-[var(--ink-3)]'>
				{legend.map((item) => (
					<span key={item.label} className='flex items-center gap-2'>
						<span
							className={`size-3 rounded-[3px] ${item.tone === 'sits' ? 'bg-[var(--accent-soft)]' : TINT[item.tone].split(' ')[0]}`}
							aria-hidden='true'
						/>
						{item.label}
					</span>
				))}
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
			<span className={`flex-1 text-[0.8125rem] ${named ? 'text-[var(--ink)]' : 'text-[var(--ink-mute)]'}`}>
				{name}
			</span>
			<span className={`num text-[0.75rem] ${named ? 'text-[var(--ink-2)]' : 'text-[var(--ink-mute)]'}`}>
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
type VotePanel = { kind: string; when: string; note: string; rows?: { named: boolean; name: string; answer: string }[] }

/** Each rulebook names its two kinds of vote differently; the picture is the same. */
export function VoteComparison({ shouted, named }: { shouted?: Partial<VotePanel>; named?: Partial<VotePanel> } = {}) {
	return (
		<figure className='grid gap-4 sm:grid-cols-2'>
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
					...shouted,
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
					...named,
				},
			].map((panel) => (
				<div
					key={panel.kind}
					className='rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6 sm:p-7'
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
