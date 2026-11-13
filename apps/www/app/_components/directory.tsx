import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	BooksIcon,
	BuildingsIcon,
	CheckSquareOffsetIcon,
	CoinsIcon,
	CompassIcon,
	DatabaseIcon,
	GavelIcon,
	GraduationCapIcon,
	HardHatIcon,
	LifebuoyIcon,
	ReceiptIcon,
	ShieldWarningIcon,
	SirenIcon,
	SpiralIcon,
	TargetIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { TOPICS, type Project } from '../_lib/workspaces'
import type { Workspace } from './workspace-index'

/* ============================================================
   The directory

   Every workspace and project on the front page, grouped by what a
   reader is looking for rather than by how the site is built (user
   decision). They ran as two sections in two styles, the workspaces
   in a grid of text and the projects as picture cards, and a reader
   had to know which kind held what they wanted before they could
   find it. Here every one is a row of the same shape, and the whole
   set is visible at once.

   An arrow up and out goes to a workspace of its own; an arrow
   across stays on this site.
   ============================================================ */

/** One glyph per entry, keyed by its label. */
const ICONS: Record<string, Icon> = {
	Legislation: GavelIcon,
	Election: CheckSquareOffsetIcon,
	'Local government': BuildingsIcon,
	Budget: CoinsIcon,
	Procurement: ReceiptIcon,
	'Development Plan Scorecard': TargetIcon,
	'Public works': HardHatIcon,
	Education: GraduationCapIcon,
	'Public services': LifebuoyIcon,
	'Incident Watch': SirenIcon,
	Preparedness: ShieldWarningIcon,
	'Travel & Places': CompassIcon,
	Library: BooksIcon,
	Crafts: SpiralIcon,
	'Open Data': DatabaseIcon,
}

type Entry = Pick<Workspace, 'label' | 'topic' | 'href' | 'blurb'> & { open: boolean }

function Row({ entry }: { entry: Entry }) {
	const Glyph = ICONS[entry.label]
	const external = entry.href?.startsWith('http')
	const Arrow = external ? ArrowUpRightIcon : ArrowRightIcon
	const body = (
		<>
			{Glyph ? (
				<Glyph
					size={20}
					weight='duotone'
					aria-hidden='true'
					className={`mt-0.5 shrink-0 ${entry.open ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]'}`}
				/>
			) : null}
			<span className='min-w-0 flex-1'>
				<span className='flex items-baseline justify-between gap-3'>
					<span
						className={`text-[0.96875rem] font-extrabold tracking-[-0.02em] ${entry.open ? 'text-[var(--ink)] group-hover:text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}
					>
						{entry.label}
					</span>
					{entry.open ? (
						<Arrow
							className='size-3.5 shrink-0 text-[var(--ink-3)] transition duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
							aria-hidden='true'
						/>
					) : (
						<span className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Coming</span>
					)}
				</span>
				<span className='mt-1 line-clamp-2 text-[0.8125rem] leading-[1.55] text-[var(--ink-3)]'>{entry.blurb}</span>
			</span>
		</>
	)
	const className = 'group -mx-3 flex gap-3.5 px-3 py-4 transition duration-200'
	if (!entry.open || !entry.href) return <div className={className}>{body}</div>
	return external ? (
		<a href={entry.href} className={`${className} hover:bg-[var(--paper-2)]`}>
			{body}
		</a>
	) : (
		<Link href={entry.href} className={`${className} hover:bg-[var(--paper-2)]`}>
			{body}
		</Link>
	)
}

export function Directory({ workspaces, projects }: { workspaces: Workspace[]; projects: Project[] }) {
	// Workspaces that are planned show as coming; a project that is not live yet stays off the page.
	const entries: Entry[] = [
		...workspaces.map((w) => ({ ...w, open: w.state === 'live' && Boolean(w.href) })),
		...projects.filter((p) => p.state === 'live').map((p) => ({ ...p, open: Boolean(p.href) })),
	]
	const groups = TOPICS.map((topic) => ({ ...topic, entries: entries.filter((entry) => entry.topic === topic.key) })).filter(
		(group) => group.entries.length,
	)
	const columns = groups.filter((group) => group.key !== 'data')
	const data = groups.find((group) => group.key === 'data')

	return (
		<div>
			<div className='grid gap-x-14 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-20'>
				{columns.map((group) => (
					<section key={group.key} aria-labelledby={`topic-${group.key}`} className='border-t-2 border-[var(--ink)] pt-5'>
						<h3 id={`topic-${group.key}`} className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
							{group.title}
						</h3>
						<p className='mt-1 text-[0.8125rem] text-[var(--ink-3)]'>{group.lead}</p>
						<ul className='mt-3 divide-y divide-[var(--rule-soft)]'>
							{group.entries.map((entry) => (
								<li key={entry.label}>
									<Row entry={entry} />
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			{/* The data under every group, as one band across the foot rather than a column of one. */}
			{data ? (
				<ul className='mt-12 border-y border-[var(--rule)]'>
					{data.entries.map((entry) => (
						<li key={entry.label}>
							<Row entry={entry} />
						</li>
					))}
				</ul>
			) : null}
		</div>
	)
}
