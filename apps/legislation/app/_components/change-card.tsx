import Link from 'next/link'
import { stageTone, type Change } from '../_lib/changes'
import { statusToneClass } from '../_lib/labels'

/* ============================================================
   What changed, a measure at a time

   The steps on record come one per line, and a busy week names the same
   bill four or five times — deferred, then deferred again, then read. Set
   as rows that was a wall of repeats. Grouped, each measure is one card:
   its number and name, then the steps it took in that span, newest first,
   and the way in at the foot, as the landing site draws its cards.
   ============================================================ */

export type MeasureSteps = { key: string; label: string; title: string; href?: string; steps: Pick<Change, 'date' | 'stage' | 'note'>[] }

/** The changes grouped by measure, in the order the newest step of each was taken. */
export function groupByMeasure(changes: Change[]): MeasureSteps[] {
	const byKey = new Map<string, MeasureSteps>()
	for (const change of changes) {
		const key = change.href ?? change.label
		const entry = byKey.get(key) ?? { key, label: change.label, title: change.title, href: change.href, steps: [] }
		entry.steps.push({ date: change.date, stage: change.stage, note: change.note })
		byKey.set(key, entry)
	}
	return [...byKey.values()]
}

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const at = (iso: string) => new Date(`${iso}T00:00:00Z`)
const CARD =
	'group flex h-full min-w-0 flex-col overflow-hidden border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'

export function ChangeCard({ measure, maxSteps = 4 }: { measure: MeasureSteps; maxSteps?: number }) {
	const shown = measure.steps.slice(0, maxSteps)
	const rest = measure.steps.length - shown.length
	const body = (
		<>
			<div className='flex flex-1 flex-col p-5'>
				<p className='text-[0.96875rem] font-extrabold tracking-[-0.01em] text-[var(--ink)] group-hover:text-[var(--accent)]'>{measure.label}</p>
				<p className='mt-1 line-clamp-2 text-[0.84375rem] leading-[1.55] text-[var(--ink-2)]'>{measure.title}</p>
				<ol className='mt-4 grid gap-2 border-t border-[var(--rule-soft)] pt-3'>
					{shown.map((step, i) => (
						<li key={i} className='grid grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-2'>
							<span className='num pt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{DAY.format(at(step.date))}</span>
							<span className='flex min-w-0 flex-wrap items-center gap-1'>
								<span className={`${statusToneClass[stageTone(step.stage)]} max-w-full !whitespace-normal !rounded-[0.625rem] text-left`}>{step.stage}</span>
								{step.note ? <span className='badge badge-plain badge-idle'>{step.note}</span> : null}
							</span>
						</li>
					))}
				</ol>
				{rest > 0 ? <p className='mt-2 text-[0.75rem] text-[var(--ink-mute)]'>and {rest} more {rest === 1 ? 'step' : 'steps'}</p> : null}
			</div>
			{measure.href ? (
				<span className='flex items-center justify-between gap-3 border-t border-[var(--rule)] px-5 py-3 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white'>
					Open the record
					<svg className='size-3.5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
						<path d='M5 12h14M13 6l6 6-6 6' />
					</svg>
				</span>
			) : null}
		</>
	)
	return (
		<li>
			{measure.href ? (
				<Link href={measure.href} className={CARD}>
					{body}
				</Link>
			) : (
				<div className={CARD}>{body}</div>
			)}
		</li>
	)
}
