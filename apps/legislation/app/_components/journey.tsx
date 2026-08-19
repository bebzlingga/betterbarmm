import { statusToneClass, type StatusTone } from '../_lib/labels'
import type { JourneyStage } from '../_lib/legislation-data'

const TONE_FILL: Record<StatusTone, string> = {
	filed: 'bg-[var(--tone-file-fg)]',
	early: 'bg-[var(--tone-early-fg)]',
	committee: 'bg-[var(--tone-committee-fg)]',
	advancing: 'bg-[var(--tone-move-fg)]',
	passed: 'bg-[var(--tone-pass-fg)]',
	enacted: 'bg-[var(--tone-done-fg)]',
	archived: 'bg-[var(--tone-idle-fg)]',
	neutral: 'bg-[var(--tone-idle-fg)]',
}

/** The halo that picks the current stage out of the ones behind it. */
const TONE_HALO: Record<StatusTone, string> = {
	filed: 'ring-[var(--tone-file-bg)]',
	early: 'ring-[var(--tone-early-bg)]',
	committee: 'ring-[var(--tone-committee-bg)]',
	advancing: 'ring-[var(--tone-move-bg)]',
	passed: 'ring-[var(--tone-pass-bg)]',
	enacted: 'ring-[var(--tone-done-bg)]',
	archived: 'ring-[var(--tone-idle-bg)]',
	neutral: 'ring-[var(--tone-idle-bg)]',
}

/**
 * The tone a rung carries, read off the rung itself rather than off the record.
 *
 * A stage means the same thing on every measure — first reading is the same
 * blue whether the bill stopped there or went on to become law — so one colour
 * means one thing across the whole registry, and the rail runs through the
 * palette in passage order. These are the same tones the status badges take,
 * which is what makes "In committee" on a row and the committee dot on the
 * rail recognisably the same fact.
 *
 * Order matters: "Approved on Third and Final Reading" is a third reading, and
 * "Approved on Second Reading" is still a floor stage rather than passage.
 */
function stageTone(label: string): StatusTone {
	const value = label.toLowerCase()

	if (/archived|withdrawn|superseded|lapsed/.test(value)) return 'archived'
	if (/enacted|ratified/.test(value)) return 'enacted'
	if (/third reading/.test(value)) return 'passed'
	if (/committee|referred/.test(value)) return 'committee'
	if (/second reading|plenary|deferred/.test(value)) return 'advancing'
	if (/approved|adopted/.test(value)) return 'passed'
	if (/first reading/.test(value)) return 'early'
	if (/filed/.test(value)) return 'filed'

	return 'neutral'
}

/**
 * The stage ladder, compact.
 *
 * A status string tells you where a measure is; this tells you how far it got
 * and how much is left, which is the question most readers actually have. Filled
 * segments are stages reached, the accent segment is where it stands now.
 */
export function StageLadder({
	stages,
	className = '',
}: {
	stages: JourneyStage[]
	className?: string
}) {
	if (stages.length === 0) return null

	const reached = stages.filter((stage) => stage.reached).length
	const currentLabel = stages.find((stage) => stage.current)?.label

	return (
		<div className={className}>
			<div
				className='ladder'
				role='img'
				aria-label={`${reached} of ${stages.length} stages reached${currentLabel ? `, currently at ${currentLabel}` : ''}`}
			>
				{stages.map((stage, index) => (
					<span
						key={`${stage.label}-${index}`}
						className='ladder-step'
						data-reached={stage.reached}
						data-current={stage.current}
					/>
				))}
			</div>
		</div>
	)
}

/**
 * The same ladder expanded into a timeline, with stage names and the dates
 * behind them.
 *
 * Left to right rather than top to bottom: a bill's path is a sequence, and
 * a horizontal rail says "distance travelled" in a way a stacked list can't.
 * The row scrolls when the stages outrun the width.
 */
export function JourneyList({ stages }: { stages: JourneyStage[] }) {
	if (stages.length === 0) return null

	const reached = stages.filter((stage) => stage.reached).length
	const currentLabel = stages.find((stage) => stage.current)?.label

	return (
		<ol
			className='timeline'
			aria-label={`${reached} of ${stages.length} stages reached${currentLabel ? `, currently at ${currentLabel}` : ''}`}
		>
			{stages.map((stage, index) => {
				const isLast = index === stages.length - 1
				const tone = stageTone(stage.label)
				const next = stages[index + 1]

				return (
					<li key={`${stage.label}-${index}`} className='timeline-stage flex gap-3.5 md:block'>
						{/* The rail. Across a row of columns the dot sits at the centre of
						    its own, with the connector split into the half that arrives and
						    the half that leaves — so the dot lands over the middle of the
						    stage name rather than at its left edge, and the line still runs
						    unbroken from one dot to the next. The first stage's arriving
						    half and the last stage's leaving half are drawn transparent
						    rather than dropped, so every dot is centred on the same amount
						    of rail.

						    Stacked on a phone it is the same construction turned ninety
						    degrees, and keeps the original shape: the marker column runs
						    down beside the names, the dot sits at the head of its stage,
						    and only the leaving half is drawn.

						    A segment is travelled once the stage at its far end is
						    reached, and takes that stage's colour with it. Each rung is
						    drawn in its own tone, so the rail runs blue through amber to
						    green as a measure advances; the rungs still ahead stay grey,
						    and the current one is picked out by a halo. */}
						<div className='flex flex-col items-center md:flex-row md:items-center' aria-hidden='true'>
							<span
								className={`hidden md:block md:h-px md:flex-1 ${
									index === 0
										? 'bg-transparent'
										: stage.reached
											? TONE_FILL[tone]
											: 'bg-[var(--rule)]'
								}`}
							/>
							<span
								className={`mt-1 size-2.5 shrink-0 rounded-full md:mt-0 ${
									stage.reached
										? `${TONE_FILL[tone]} ${stage.current ? `ring-4 ${TONE_HALO[tone]}` : ''}`
										: 'border border-[var(--rule)] bg-[var(--tone-idle-bg)]'
								}`}
							/>
							{!isLast && next ? (
								<span
									className={`w-px flex-1 md:h-px md:w-auto ${
										next.reached ? TONE_FILL[stageTone(next.label)] : 'bg-[var(--rule)]'
									}`}
								/>
							) : (
								<span className='hidden bg-transparent md:block md:h-px md:flex-1' />
							)}
						</div>

						{/* Stacked, each name has the full measure, reads as a line, and
						    stays ranged left beside the rail. Divided into columns from
						    `md` it centres under its own dot and is allowed to break
						    mid-word, so a long stage never pushes into the one beside it.
						    The padding is symmetric there for the same reason the text is:
						    a centred name needs equal room on both sides. */}
						<div
							className={`min-w-0 md:mt-3 md:px-2 md:pb-0 md:text-center ${isLast ? '' : 'pb-7'}`}
						>
							{/* "Now" rides at the end of the stage name, so it reads as part
							    of the line rather than as a second row over the rail. */}
							<p
								className={`hyphens-auto break-words text-[13px] leading-snug ${
									stage.reached ? 'font-medium text-[var(--ink)]' : 'text-[var(--ink-display)]'
								}`}
							>
								{stage.label}
								{stage.current ? (
									<span
										className={`${statusToneClass[tone]} badge-plain timeline-now ml-1.5 align-middle`}
									>
										Now
									</span>
								) : null}
							</p>
							{stage.dateDisplay ? <p className='meta-sm mt-1'>{stage.dateDisplay}</p> : null}
						</div>
					</li>
				)
			})}
		</ol>
	)
}
