import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { Stagger, StaggerItem } from '@betterbarmm/editorial'
import { lguLookups } from '@betterbarmm/lgu-data'

/* Where the parts of the record this workspace does not hold are kept.
   It reads the same for every unit, so it lives once, on What each level does. */

/**
 * Where the parts of the record this workspace does not hold actually live.
 *
 * Barangay officials are elected on a separate schedule and are not in the 2025
 * canvass, so the punong barangay of every barangay in the region are still
 * missing. Saying "coming soon" and stopping would waste the visit; every
 * office listed here already publishes part of the answer, so the page hands
 * the reader over rather than leaving them at a dead end.
 */
export function Lookups() {
	return (
		<Stagger gap={0.05} className='overflow-hidden'>
			<div className='-ml-px -mt-px grid sm:grid-cols-2'>
				{lguLookups.map((lookup) => (
					<StaggerItem key={lookup.href} distance={14} className='min-w-0'>
						<a
							href={lookup.href}
							target='_blank'
							rel='noreferrer'
							className='group flex h-full flex-col border-l border-t border-[var(--rule)] p-7 transition hover:bg-[var(--paper-2)] lg:p-8'
						>
							<div className='flex items-start justify-between gap-4'>
								<h3 className='text-[16px] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
									{lookup.office}
								</h3>
								<ArrowUpRightIcon
									className='mt-0.5 size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
									aria-hidden='true'
								/>
							</div>
							<p className='mt-3 text-[13.5px] leading-7 text-[var(--ink-2)]'>{lookup.what}</p>
						</a>
					</StaggerItem>
				))}
			</div>
		</Stagger>
	)
}

/** One voter, two governments: why BARMM does not replace the local units. */
