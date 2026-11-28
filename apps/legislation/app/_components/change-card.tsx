import { ArrowRightIcon, FileTextIcon, GavelIcon, SealCheckIcon } from '@phosphor-icons/react/ssr'
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
	'group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'

/** The kind of measure, by its label: a resolution, a bill, or an act. */
const kindIcon = (label: string) => (/resolution/i.test(label) ? GavelIcon : /bill/i.test(label) ? FileTextIcon : SealCheckIcon)

export function ChangeCard({ measure, maxSteps = 4 }: { measure: MeasureSteps; maxSteps?: number }) {
	const shown = measure.steps.slice(0, maxSteps)
	const rest = measure.steps.length - shown.length
	const Glyph = kindIcon(measure.label)
	const body = (
		<>
			<div className='flex flex-1 flex-col p-6'>
				<div className='flex items-start gap-4'>
					<span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]'>
						<Glyph size={22} weight='duotone' aria-hidden='true' />
					</span>
					<div className='min-w-0'>
						<p className='num font-[family-name:var(--font-display)] text-[1.0625rem] font-bold tracking-[-0.015em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>{measure.label}</p>
						<p className='mt-1 line-clamp-2 text-[0.875rem] leading-[1.55] text-[var(--ink-2)]'>{measure.title}</p>
					</div>
				</div>
				<ol className='mt-5 grid gap-2.5 rounded-2xl bg-[color-mix(in_srgb,var(--paper-2)_75%,var(--paper))] p-4'>
					{shown.map((step, i) => (
						<li key={i} className='grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-2'>
							<span className='num pt-0.5 text-[0.75rem] font-medium text-[var(--ink-3)]'>{DAY.format(at(step.date))}</span>
							<span className='flex min-w-0 flex-wrap items-center gap-1'>
								<span className={`${statusToneClass[stageTone(step.stage)]} max-w-full !whitespace-normal !rounded-full text-left`}>{step.stage}</span>
								{step.note ? <span className='badge badge-plain badge-idle !rounded-full'>{step.note}</span> : null}
							</span>
						</li>
					))}
				</ol>
				{rest > 0 ? <p className='mt-3 text-[0.75rem] text-[var(--ink-mute)]'>and {rest} more {rest === 1 ? 'step' : 'steps'}</p> : null}
			</div>
			{measure.href ? (
				<span className='mt-auto flex items-center justify-between gap-3 px-6 pb-5 text-[0.84375rem] font-semibold text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]'>
					Open the record
					<span className='grid size-9 place-items-center rounded-full border border-[var(--rule)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'>
						<ArrowRightIcon size={15} weight='bold' aria-hidden='true' />
					</span>
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
