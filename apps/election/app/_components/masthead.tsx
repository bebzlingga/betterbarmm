import { Counter, LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'

export type MastheadFact = {
	value: number | string
	label: string
	/**
	 * What the figure counts, in a line.
	 *
	 * A bare number under a two-word label leaves the reader to guess the
	 * denominator — "13 parties" of what, "205 candidates on record" out of how
	 * many. Where a figure needs saying, it says it, and the row lays itself out
	 * as a grid rather than a run so every caption has a column to sit in.
	 */
	detail?: string
	/** Count up to the figure. Off for anything that is not a plain number. */
	count?: boolean
	group?: boolean
}

type MastheadProps = {
	/** The small brass line above the headline — which workspace, or which page of it. */
	label: string
	/** The headline, one entry per line. Where it breaks is a decision, not arithmetic. */
	lines: string[]
	/** Indices of `lines` set in the muted grey — the qualifier, not the claim. */
	muted?: number[]
	standfirst: string
	/** The figures on the brass rule under the standfirst. Three at most; six is a table. */
	facts?: MastheadFact[]
	/** Ranged right on the same rule as the facts — the page's actions, or a note on the record. */
	children?: React.ReactNode
}

/**
 * The head of every page in this workspace.
 *
 * It used to be a crimson band with a hand-set type scale that ran to 8rem,
 * which is a size the rest of the estate does not have and a colour it spends
 * once, at the foot of the page, on the one ask. This is the same masthead the
 * landing site and the other workspaces open with: paper ground, okir bloom
 * behind it, the headline on the shared display scale, and the figures on a
 * brass rule rather than in six bordered boxes.
 */
export function Masthead({
	label,
	lines,
	muted = [],
	standfirst,
	facts,
	children,
}: MastheadProps) {
	return (
		<section className='bb-lattice relative overflow-hidden'>
			<OkirBloom
				variant='tally'
				className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]'
			/>
			<span aria-hidden='true' className='bb-glow absolute -right-[10%] -top-[20%] size-[34rem]' />

			<div className='bb-container relative pb-16 pt-16 lg:pb-24 lg:pt-24'>
				<Rise distance={14}>
					<p className='bb-label'>{label}</p>
				</Rise>

				<LineReveal
					lines={lines}
					delay={0.08}
					className='bb-display mt-7 text-[var(--ink)]'
					lineClassName={lines.map((_, index) => (muted.includes(index) ? 'bb-mute' : undefined))}
				/>

				<Rise delay={0.35} distance={16}>
					{/* Wider than the estate's reading measure. `bb-measure` caps at 34em,
					    which is right for a column of prose a reader settles into; a
					    standfirst is one sentence read once, under a headline that runs
					    the page, and at 34em it stacked into five short lines and left
					    the masthead looking like a narrow column pushed to the left. */}
					<p className='mt-9 max-w-[46rem] text-[17px] leading-8 text-[var(--ink-2)]'>
						{standfirst}
					</p>
				</Rise>

				{/* The figures and the actions share one rule. Stacked, the buttons sat
				    a third block down from a headline that had already said its piece,
				    and the rule under the figures read as the end of the masthead with
				    something stranded below it. Ranged right of the same line, the
				    reader takes in what there is and what to do with it together.

				    Centred against the figures rather than sat on their baseline. A
				    figure is a tall block — a label, a numeral and a caption — and a
				    button aligned to the bottom of one hangs off the end of the row
				    instead of belonging to it.

				    Held well off the standfirst above, and off its own rule. The
				    masthead is a claim and then the size of the thing claimed; run
				    close together they read as one paragraph with numbers in it. */}
				{facts?.length || children ? (
					<Rise delay={0.5} distance={14}>
						<div
							className={`mt-20 flex flex-wrap justify-between gap-x-12 gap-y-8 border-t border-[var(--brass-line)] pt-9 ${
								// Figures with captions are tall blocks of uneven height, so the
								// row aligns them at the top; a plain run of three numerals has
								// nothing to rag and centres against the actions beside it.
								facts?.some((fact) => fact.detail) ? 'items-start' : 'items-center'
							}`}
						>
							{facts?.length ? (
								<dl
									className={
										facts.some((fact) => fact.detail)
											? 'grid flex-1 gap-x-10 gap-y-8 min-[380px]:grid-cols-2 lg:grid-cols-4'
											: 'flex flex-wrap gap-x-10 gap-y-6'
									}
								>
									{/* The term above its figure in the source and under it on the
									    page. A list has to name a thing before it describes it, and
									    the figure is the description — so `dt` leads and the column
									    is reversed to put it back underneath.

									    It used to carry the label twice: once hidden for a screen
									    reader and once printed in a paragraph that belonged to
									    neither the term nor the figure. Anyone listening heard
									    "Seats in Parliament, 80, Seats in Parliament". */}
									{facts.map((fact) => (
										// `justify-end` is the top of a reversed column: main-start is
										// the bottom, so the default packs the pair down and the
										// numerals end up at whatever height the longest caption in the
										// row leaves them. Packed to the top instead, every figure sits
										// on one line and the captions run on beneath, ragged, which is
										// the right way round.
										<div key={fact.label} className='flex flex-col-reverse justify-end'>
											{/* The caption belongs to the figure, so it rides inside the
											    same `dt` rather than as a third element the list does not
											    account for. */}
											<dt className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
												{fact.label}
												{fact.detail ? (
													<span className='mt-2 block max-w-[16rem] font-sans text-[13px] font-normal normal-case leading-[1.5] tracking-normal text-[var(--ink-3)]'>
														{fact.detail}
													</span>
												) : null}
											</dt>
											<dd className='bb-figure-sm text-[var(--ink)]'>
												{fact.count && typeof fact.value === 'number' ? (
													<Counter value={fact.value} group={fact.group} />
												) : (
													fact.value
												)}
											</dd>
										</div>
									))}
								</dl>
							) : null}

							{children ? (
								<div className='flex flex-wrap items-center gap-3 lg:justify-end'>{children}</div>
							) : null}
						</div>
					</Rise>
				) : null}
			</div>

			<div className='bb-weave' aria-hidden='true' />
		</section>
	)
}
