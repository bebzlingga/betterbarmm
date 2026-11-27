import { AirplaneTiltIcon, ArrowUpRightIcon, BoatIcon, ClockIcon, RepeatIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   A route as a ticket (user decision: Flights and Ferries redesigned)

   The two ends set large with a dashed line and the craft between
   them, then who flies or sails it, how long and how often as chips,
   any note, and the way out: a fare search or the route's source.
   ============================================================ */

export function RouteTicket({
	mode,
	from,
	to,
	fromSub,
	toSub,
	carriers,
	kind,
	duration,
	frequency,
	note,
	action,
}: {
	mode: 'air' | 'sea'
	from: string
	to: string
	/** A line under each end: an airport's code or city. */
	fromSub?: string
	toSub?: string
	carriers: string[]
	/** The kind of boat, for a ferry. */
	kind?: string
	duration?: string | null
	frequency?: string | null
	note?: string
	action: { href: string; label: string }
}) {
	const Craft = mode === 'air' ? AirplaneTiltIcon : BoatIcon
	return (
		<li className='flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6'>
			{/* The two ends, the craft between them. */}
			<div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3'>
				<div className='min-w-0'>
					<p className='font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>{from}</p>
					{fromSub ? <p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{fromSub}</p> : null}
				</div>
				<div className='flex w-20 items-center gap-1.5 text-[var(--accent)] sm:w-28' aria-hidden='true'>
					<span className='h-px flex-1 border-t-2 border-dashed border-[var(--rule)]' />
					<Craft size={20} weight='duotone' />
					<span className='h-px flex-1 border-t-2 border-dashed border-[var(--rule)]' />
				</div>
				<div className='min-w-0 text-right'>
					<p className='font-[family-name:var(--font-display)] text-[1.25rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>{to}</p>
					{toSub ? <p className='mt-0.5 text-[0.75rem] text-[var(--ink-3)]'>{toSub}</p> : null}
				</div>
			</div>

			{/* Who, how long, how often. */}
			<div className='mt-5 flex flex-wrap gap-2'>
				{kind ? <span className='rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-1 text-[0.75rem] font-semibold text-[var(--accent)]'>{kind}</span> : null}
				{duration ? (
					<span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.75rem] font-medium text-[var(--ink-2)]'>
						<ClockIcon size={13} aria-hidden='true' />
						{duration}
					</span>
				) : null}
				{frequency ? (
					<span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.75rem] font-medium text-[var(--ink-2)]'>
						<RepeatIcon size={13} aria-hidden='true' />
						{frequency}
					</span>
				) : null}
			</div>
			{carriers.length ? <p className='mt-4 text-[0.9375rem] font-semibold text-[var(--ink)]'>{carriers.join(', ')}</p> : null}
			{note ? <p className='mt-1.5 flex-1 text-[0.875rem] leading-relaxed text-[var(--ink-3)]'>{note}</p> : <span className='flex-1' />}

			<div className='mt-5 border-t border-dashed border-[var(--rule)] pt-4'>
				<a
					href={action.href}
					target='_blank'
					rel='noopener'
					className={
						mode === 'air'
							? 'inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] px-4 py-2 text-[0.8125rem] font-semibold text-[var(--paper)] transition hover:opacity-90'
							: 'inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'
					}
				>
					{action.label}
					<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
				</a>
			</div>
		</li>
	)
}
