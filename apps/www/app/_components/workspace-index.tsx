'use client'

import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Stagger, StaggerItem } from '@betterbarmm/editorial'

export type WorkspaceState = 'live' | 'soon' | 'planned'

export type Workspace = {
  label: string
  /** Absent while a workspace is still only planned — the row is then inert. */
  href?: string
  blurb: string
  /** What the workspace covers, in the source's own units. */
  measure: string
  state: WorkspaceState
}

const STATE_LABEL: Record<WorkspaceState, string> = {
  live: 'Live',
  soon: 'Soon',
  planned: 'Planned',
}

/**
 * The mark on a workspace that is already open.
 *
 * It replaces a three-rung rail that drew the whole roadmap in every cell —
 * planned, building, live — which was a legend the reader had to learn in order
 * to get at the one fact they can act on: whether this one exists yet. A dot
 * that pulses says that much on its own, and the states that are not live say
 * it in the word beside it and nothing else.
 *
 * The ring is a second element rather than a shadow on the first, so it can
 * scale out past the dot without the label beside it moving. The provider sets
 * `reducedMotion="user"`, which drops the scale for a reader who asked for
 * stillness while leaving the dot itself in place.
 */
function LivePulse() {
  return (
    <span className='relative flex size-[7px] shrink-0' aria-hidden='true'>
      <motion.span
        className='absolute inset-0 rounded-full bg-[var(--accent)]'
        initial={{ opacity: 0.5, scale: 1 }}
        animate={{ opacity: 0, scale: 3.4 }}
        transition={{ duration: 2.2, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.35 }}
      />
      <span className='relative size-full rounded-full bg-[var(--accent)]' />
    </span>
  )
}

/**
 * Every workspace, live or planned, as a grid.
 *
 * They ran as full-width rows, one per line, which gave seven entries seven
 * screens' worth of vertical weight on a page whose subject is not the roadmap.
 * As a grid of three they read the way they actually are — a set, mostly not
 * built yet, in the order they will arrive — and the whole set is visible at
 * once, which is the only useful thing a reader can do with it.
 *
 * A cell with no link is a workspace that does not exist yet, and it says so
 * rather than going somewhere disappointing.
 */
export function WorkspaceIndex({ workspaces }: { workspaces: Workspace[] }) {
	// Seven entries fill neither a row of two nor a row of three, and the cells
	// carrying the rules are the entries themselves — so the rule above the last
	// row stopped a third of the way across, in mid-air. Empty cells carrying that
	// one border and nothing else finish the line, one for every column the row
	// is short. Only the first of them takes a left border — that one closes off
	// the right edge of the final card, and any past it would be a vertical
	// hanging in open space, dividing nothing from nothing.
	//
	// Counted from the length rather than written down, because the number is
	// different at every breakpoint and different again the day an eighth
	// workspace is added. A breakpoint needing fewer hides the spares rather than
	// rendering a second set.
	const shortBySm = (2 - (workspaces.length % 2)) % 2
	const shortByLg = (3 - (workspaces.length % 3)) % 3

	return (
		// Interior rules only: a hairline on the top and left of every cell, with
		// the grid pulled up and left by one pixel so the outer edges come off.
		// Drawing borders per-cell by index means re-counting them at every
		// breakpoint, and the count is different at each one.
		<div className='overflow-hidden'>
			<Stagger
				gap={0.05}
				className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-3'
			>
				{workspaces.map((workspace, index) => {
					const body = (
						<>
							<span className='flex items-center justify-between gap-3'>
								<span className='num text-[12px] font-semibold text-[var(--brass)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<span className='bb-chip'>{workspace.measure}</span>
							</span>

							<span
								className={`mt-9 block text-[2rem] font-extrabold leading-none tracking-[-0.035em] transition duration-500 lg:text-[2.25rem] ${
									workspace.href
										? 'text-[var(--ink)] group-hover:text-[var(--accent)]'
										: 'text-[var(--ink-display)]'
								}`}
							>
								{workspace.label}
							</span>

							<span className='mt-3 block flex-1 bb-body text-[var(--ink-2)]'>
								{workspace.blurb}
							</span>

							<span className='mt-8 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-4'>
								<span className='flex items-center gap-3'>
									{workspace.state === 'live' ? <LivePulse /> : null}
									<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{STATE_LABEL[workspace.state]}
									</span>
								</span>

								{workspace.href ? (
									<ArrowUpRightIcon
										className='size-4 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								) : null}
							</span>
						</>
					)

					const className =
						'group flex h-full flex-col border-l border-t border-[var(--rule)] p-7 transition hover:bg-[var(--paper-2)] lg:p-8'

					return (
						<StaggerItem key={workspace.label} distance={14} className='min-w-0'>
							{workspace.href ? (
								<a href={workspace.href} className={className}>
									{body}
								</a>
							) : (
								<div className={className}>{body}</div>
							)}
						</StaggerItem>
					)
				})}

				{Array.from({ length: Math.max(shortBySm, shortByLg) }, (_, index) => (
					<div
						key={`filler-${index}`}
						aria-hidden='true'
						className={`hidden border-t border-[var(--rule)] ${
							index === 0 ? 'border-l' : ''
						} ${index < shortBySm ? 'sm:block' : 'sm:hidden'} ${
							index < shortByLg ? 'lg:block' : 'lg:hidden'
						}`}
					/>
				))}
			</Stagger>
		</div>
	)
}
