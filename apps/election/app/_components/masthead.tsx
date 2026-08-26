import { Counter, LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'

export type MastheadFact = {
	value: number | string
	label: string
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
			<OkirBloom className='absolute -right-[14%] -top-[38%] size-[min(44rem,86vw)] opacity-[0.15]' />
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
					<p className='bb-measure mt-9 text-[17px] leading-8 text-[var(--ink-2)]'>{standfirst}</p>
				</Rise>

				{/* The figures and the actions share one rule. Stacked, the buttons sat
				    a third block down from a headline that had already said its piece,
				    and the rule under the figures read as the end of the masthead with
				    something stranded below it. Ranged right of the same line, the
				    reader takes in what there is and what to do with it together. */}
				{facts?.length || children ? (
					<Rise delay={0.5} distance={14}>
						<div className='mt-14 flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-t border-[var(--brass-line)] pt-6'>
							{facts?.length ? (
								<dl className='flex flex-wrap gap-x-10 gap-y-6'>
									{facts.map((fact) => (
										<div key={fact.label}>
											<dt className='sr-only'>{fact.label}</dt>
											<dd className='bb-figure-sm text-[var(--ink)]'>
												{fact.count && typeof fact.value === 'number' ? (
													<Counter value={fact.value} group={fact.group} />
												) : (
													fact.value
												)}
											</dd>
											<p className='mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
												{fact.label}
											</p>
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
