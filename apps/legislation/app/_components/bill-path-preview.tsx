import { BILL_PATH_STEPS } from './bill-path-steps'
import { TONE_FILL, TONE_HALO } from './timeline'

/* ============================================================
   The seven stages, named and nothing more

   A preview, not the thing: the process page walks each stage with what
   happens inside it, and repeating any of that here would give a reader two
   versions to reconcile — which is why the interactive rail came off this
   page in the first place. All this says is how many steps there are and what
   they are called, which is what makes the link beneath it worth following.

   The dots take the same tones a bill's status wears everywhere else on the
   site, so the row is already familiar by the time anyone reaches it.
   ============================================================ */

export function BillPathPreview() {
	return (
		<div className='relative mx-auto mt-12 max-w-4xl'>
			{/* One hairline behind the whole row, inset by half a column at each end
			    so it starts and stops at the outer dots rather than running off the
			    edge. Only at `lg`, where the seven sit on one line — at the narrower
			    counts it would join dots on different rows. */}
			<span
				aria-hidden='true'
				className='absolute left-[7.143%] right-[7.143%] top-[7px] hidden h-px bg-[var(--rule)] lg:block'
			/>

			<ol className='relative grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-7'>
				{BILL_PATH_STEPS.map((step) => (
					<li key={step.label} className='flex flex-col items-center gap-3 text-center'>
						{/* The ring is the page colour, so the hairline passes behind the
						    dot without touching it. */}
						<span
							aria-hidden='true'
							className={`size-3.5 shrink-0 rounded-full ring-4 ring-[var(--paper-2)] ${TONE_FILL[step.tone]} ${TONE_HALO[step.tone]}`}
						/>
						<span className='text-[12.5px] leading-4 text-[var(--ink-3)]'>{step.label}</span>
					</li>
				))}
			</ol>
		</div>
	)
}
