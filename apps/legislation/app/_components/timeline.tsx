import type { StatusTone } from '../_lib/labels'

/* ============================================================
   A path walked down the page

   Both paths on the legislative process page use this: the thirteen-step
   bill path and the shorter one a resolution takes. Keeping the spine, the
   dots, and the spacing in one place is what makes them read as two routes
   through the same building rather than two unrelated lists.

   The dots take the tones the registry gives a bill's status, so a step here
   and a measure sitting at that step elsewhere on the site are the same
   colour.
   ============================================================ */

export const TONE_FILL: Record<StatusTone, string> = {
	filed: 'bg-[var(--tone-file-fg)]',
	early: 'bg-[var(--tone-early-fg)]',
	committee: 'bg-[var(--tone-committee-fg)]',
	advancing: 'bg-[var(--tone-move-fg)]',
	passed: 'bg-[var(--tone-pass-fg)]',
	enacted: 'bg-[var(--tone-done-fg)]',
	archived: 'bg-[var(--tone-idle-fg)]',
	neutral: 'bg-[var(--tone-idle-fg)]',
}

export const TONE_HALO: Record<StatusTone, string> = {
	filed: 'ring-[var(--tone-file-bg)]',
	early: 'ring-[var(--tone-early-bg)]',
	committee: 'ring-[var(--tone-committee-bg)]',
	advancing: 'ring-[var(--tone-move-bg)]',
	passed: 'ring-[var(--tone-pass-bg)]',
	enacted: 'ring-[var(--tone-done-bg)]',
	archived: 'ring-[var(--tone-idle-bg)]',
	neutral: 'ring-[var(--tone-idle-bg)]',
}

export type TimelineItem = {
	/** Stable key for the row. */
	id: string
	tone: StatusTone
	content: React.ReactNode
}

export function Timeline({
	items,
	/**
	 * Closes the gap between steps, for a path whose steps are a paragraph
	 * each rather than a stage broken into parts. The spine is the same
	 * either way; only the air around it changes.
	 */
	dense = false,
	className,
}: {
	items: TimelineItem[]
	dense?: boolean
	className?: string
}) {
	return (
		<ol className={className}>
			{items.map((item, index) => (
				<li
					key={item.id}
					className={`relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-5 last:pb-0 sm:gap-x-7 ${
						dense ? 'pb-9' : 'pb-14'
					}`}
				>
					{/* The spine runs from under this step's dot to the next one.
					    Absolute on the row rather than in the marker column, so it
					    crosses the gap between steps instead of stopping at the bottom
					    of the text. */}
					{index === items.length - 1 ? null : (
						<span
							aria-hidden='true'
							className='absolute bottom-0 left-2 top-8 w-px -translate-x-1/2 bg-[var(--rule)]'
						/>
					)}

					<span
						aria-hidden='true'
						className={`mt-1.5 size-4 rounded-full ring-4 ${TONE_FILL[item.tone]} ${TONE_HALO[item.tone]}`}
					/>

					<div>{item.content}</div>
				</li>
			))}
		</ol>
	)
}
