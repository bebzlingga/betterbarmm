import { needKindLabel, needPosterLabel, type SchoolNeed } from '@betterbarmm/db/needs'
import { CheckCircleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { longDate } from './parts'

/** One posted need: what, where, who said so, and whether it has been met. */
export function NeedCard({ need, school = true }: { need: SchoolNeed; school?: boolean }) {
	return (
		<article className='flex h-full flex-col border border-[var(--rule)] bg-[var(--paper)] p-5'>
			<div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
				<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>{needKindLabel(need.kind)}</span>
				{need.status === 'met' ? (
					<span className='inline-flex items-center gap-1 text-[0.71875rem] font-semibold text-[var(--accent)]'>
						<CheckCircleIcon size={13} weight='fill' aria-hidden='true' /> Met
					</span>
				) : null}
			</div>
			<h3 className='mt-2 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.01em] text-[var(--ink)]'>{need.title}</h3>
			{school ? (
				<Link href={`/schools/${need.school_id}`} className='rule-link mt-1 self-start text-[0.8125rem]'>
					{need.school_name}, {need.town_name}
				</Link>
			) : null}
			<p className='mt-3 line-clamp-4 flex-1 whitespace-pre-line text-[0.875rem] leading-6 text-[var(--ink-2)]'>{need.details}</p>
			{need.note ? <p className='mt-3 bg-[var(--paper-2)] px-3 py-2 text-[0.8125rem] leading-5 text-[var(--ink-2)]'>{need.note}</p> : null}
			<p className='mt-4 text-[0.75rem] text-[var(--ink-3)]'>
				{need.quantity ? `${need.quantity.toLocaleString('en-PH')} · ` : ''}Posted by {needPosterLabel(need.poster).toLowerCase()}, {longDate(need.created_at.slice(0, 10))}
			</p>
		</article>
	)
}
