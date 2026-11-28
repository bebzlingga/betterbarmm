'use client'

import {
  BooksIcon,
  ArrowUpRightIcon,
  BuildingsIcon,
  ReceiptIcon,
  CheckSquareOffsetIcon,
  CoinsIcon,
  CompassIcon,
  DatabaseIcon,
  GavelIcon,
  HardHatIcon,
  LifebuoyIcon,
  type Icon,
} from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { Stagger, StaggerItem } from '@betterbarmm/editorial'
import type { Topic } from '../_lib/workspaces'

export type WorkspaceState = 'live' | 'soon' | 'planned'

/** One glyph per workspace, keyed by its label. */
const ICONS: Record<string, Icon> = {
  Election: CheckSquareOffsetIcon,
  Legislation: GavelIcon,
  Budget: CoinsIcon,
  'Public works': HardHatIcon,
  'Local government': BuildingsIcon,
  Procurement: ReceiptIcon,
  'Travel & Places': CompassIcon,
  'Public services': LifebuoyIcon,
  Library: BooksIcon,
  'Source layer': DatabaseIcon,
}

export type Workspace = {
  label: string
  topic: Topic
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
	return (
		// Rounded cards on a gap, in the travel look (user decision), in place of the hairline grid.
		<div>
			<Stagger
				gap={0.05}
				className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
			>
				{workspaces.map((workspace, index) => {
					const Glyph = ICONS[workspace.label]
					const body = (
						<>
							<span className='flex items-center justify-between gap-3'>
								<span className='num text-[0.75rem] font-semibold text-[var(--brass)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<span className='bb-chip'>{workspace.measure}</span>
							</span>

							{Glyph ? (
								<Glyph
									size={32}
									weight='duotone'
									aria-hidden='true'
									className={`mt-8 ${workspace.state === 'live' ? 'text-[var(--accent)]' : 'text-[var(--ink-display)]'}`}
								/>
							) : null}

							<span
								className={`mt-5 block text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] transition duration-200 lg:text-[1.65rem] ${
									workspace.state === 'soon'
										? 'text-[var(--ink-display)] group-hover:text-[var(--accent)]'
										: workspace.href
											? 'text-[var(--ink)] group-hover:text-[var(--accent)]'
											: 'text-[var(--ink-display)]'
								}`}
							>
								{workspace.label}
							</span>

							<span className={`mt-3 block flex-1 bb-body ${workspace.state === 'soon' ? 'text-[var(--ink-mute)]' : 'text-[var(--ink-2)]'}`}>
								{workspace.blurb}
							</span>

							<span className='mt-8 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-4'>
								<span className='flex items-center gap-3'>
									{workspace.state === 'live' ? <LivePulse /> : null}
									<span className='font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{STATE_LABEL[workspace.state]}
									</span>
								</span>

								{workspace.href ? (
									<ArrowUpRightIcon
										className='size-4 shrink-0 text-[var(--ink-3)] transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
										aria-hidden='true'
									/>
								) : null}
							</span>
						</>
					)

					const className = `group flex h-full flex-col rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] p-7 transition duration-300 lg:p-8 ${
						workspace.href
							? 'hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))] hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]'
							: ''
					}`

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

			</Stagger>
		</div>
	)
}
