import { BILL_PATH_STEPS } from './bill-path-steps'
import { TONE_FILL, TONE_HALO } from './timeline'

/* ============================================================
   The seven stages, named and nothing more

   A preview, not the thing: the process page walks each stage with what
   happens inside it, and repeating any of that here would give a reader two
   versions to reconcile — which is why the interactive rail came off this
   page in the first place. All this says is how many steps there are and what
   they are called, which is what makes the link beneath it worth following.

   It moves, and the movement carries the one idea the row exists for. A
   stage that has not been reached is grey; the head runs the line and each
   stage takes its own colour as the head arrives. So the row is not seven
   labelled dots, it is a bill travelling — which is the thing the process
   page then explains.

   The reveal is generated per step rather than written once in the shared
   stylesheet. It has to be: a step must light at its own moment and then
   stay lit until the whole row resets together, and "its own moment" is a
   different keyframe boundary for every step. Doing it with one rule and
   seven `animation-delay`s puts each step on its own clock, so the last
   stages are still lit while the head is starting its next pass. One rule
   per step, all sharing a single unshifted timeline, resets them together.

   The animation is CSS only — no client component, nothing to hydrate — and
   under `prefers-reduced-motion` it lands on the finished state rather than
   the starting one, so the row reads as complete instead of permanently grey.
   ============================================================ */

/**
 * One pass, and how much of it the head spends travelling.
 *
 * Slow on purpose. The row is ambient — it sits under a headline nobody came
 * to watch — and at a brisk pace seven flares in sequence read as a loading
 * spinner. At this length each stage holds long enough to be read as a stage.
 */
const CYCLE_SECONDS = 15
const TRAVEL_SHARE = 0.78

/** Percentage of the cycle at which the head reaches a given step. */
function arrivalAt(index: number, lastIndex: number): number {
	return (index / lastIndex) * TRAVEL_SHARE * 100
}

/**
 * The reveal keyframes, one set per step.
 *
 * `hold` is where every step lets go at once, and it sits after the head has
 * finished and the line has faded, so nothing resets in view.
 */
function keyframesFor(index: number, lastIndex: number): string {
	const at = arrivalAt(index, lastIndex)
	const r = (n: number) => Math.round(n * 100) / 100
	// Before its moment a step is grey: the toned dot and the label are the
	// things being revealed, so both start hidden and the grey dot underneath
	// shows through.
	const before = index === 0 ? '' : `0%,${r(at)}%`
	const dark = before ? `${before}{opacity:0;transform:scale(.82)}` : ''
	const dim = before ? `${before}{opacity:.38}` : ''

	return [
		`@keyframes bp-dot-${index}{`,
		index === 0 ? '0%{opacity:0;transform:scale(.82)}' : dark,
		`${r(at + 0.9)}%{opacity:1;transform:scale(1.35)}`,
		`${r(at + 4)}%{opacity:1;transform:scale(1)}`,
		`88%{opacity:1;transform:scale(1)}`,
		`96%,100%{opacity:0;transform:scale(.82)}}`,
		`@keyframes bp-flare-${index}{`,
		`0%,${r(at)}%{opacity:0;transform:scale(1)}`,
		`${r(at + 0.7)}%{opacity:.45;transform:scale(1.2)}`,
		`${r(at + 7)}%,100%{opacity:0;transform:scale(3.4)}}`,
		`@keyframes bp-label-${index}{`,
		index === 0 ? '0%{opacity:.38}' : dim,
		`${r(at + 2)}%{opacity:1}`,
		`88%{opacity:1}`,
		`96%,100%{opacity:.38}}`,
	].join('')
}

export function BillPathPreview() {
	const lastIndex = BILL_PATH_STEPS.length - 1
	const keyframes = BILL_PATH_STEPS.map((_, index) => keyframesFor(index, lastIndex)).join('')

	return (
		<div
			className='relative mx-auto mt-12 max-w-4xl'
			style={{ '--bill-path-cycle': `${CYCLE_SECONDS}s` } as React.CSSProperties}
		>
			{/* Derived from the step list, so adding an eighth stage retimes the row
			    rather than leaving a dot that never lights. */}
			<style>{keyframes}</style>

			{/* One hairline behind the whole row, inset by half a column at each end
			    so it starts and stops at the outer dots rather than running off the
			    edge. Only at `lg`, where the seven sit on one line — at the narrower
			    counts it would join dots on different rows. */}
			<span
				aria-hidden='true'
				className='absolute left-[7.143%] right-[7.143%] top-[7px] hidden h-px bg-[var(--rule)] lg:block'
			/>

			{/* The travelled part of the line, drawn over the hairline in the accent
			    and grown from the left. */}
			<span
				aria-hidden='true'
				className='bill-path-line absolute left-[7.143%] right-[7.143%] top-[7px] hidden h-px origin-left bg-[var(--accent)] lg:block'
			/>

			{/* The head. Positioned inside the same track so its `left` percentages
			    resolve against the line rather than the container. */}
			<span
				aria-hidden='true'
				className='pointer-events-none absolute left-[7.143%] right-[7.143%] top-[7px] hidden lg:block'
			>
				<span className='bill-path-head absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_2px_var(--accent)]' />
			</span>

			<ol className='relative grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-7'>
				{BILL_PATH_STEPS.map((step, index) => {
					const timing = `var(--bill-path-cycle) linear infinite`

					return (
						<li key={step.label} className='flex flex-col items-center gap-3 text-center'>
							<span aria-hidden='true' className='relative flex size-3.5 shrink-0'>
								{/* The flare, behind everything and expanding out from under the
								    dot in the stage's own tone. */}
								<span
									className={`bill-path-flare absolute inset-0 rounded-full opacity-0 ${TONE_FILL[step.tone]}`}
									style={{ animation: `bp-flare-${index} ${timing}` }}
								/>

								{/* Not yet reached. The same grey the journey rail gives an
								    unreached rung, so "not there yet" looks the same wherever
								    the site says it. */}
								<span className='absolute inset-0 rounded-full border border-[var(--rule)] bg-[var(--tone-idle-bg)] ring-4 ring-[var(--paper-2)]' />

								{/* Reached. Fades in over the grey one at its moment. */}
								<span
									className={`bill-path-tone absolute inset-0 rounded-full opacity-0 ring-4 ring-[var(--paper-2)] ${TONE_FILL[step.tone]} ${TONE_HALO[step.tone]}`}
									style={{ animation: `bp-dot-${index} ${timing}` }}
								/>
							</span>

							<span
								className='bill-path-label text-[12.5px] leading-4 text-[var(--ink-3)] opacity-[.38]'
								style={{ animation: `bp-label-${index} ${timing}` }}
							>
								{step.label}
							</span>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
