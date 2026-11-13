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
import { DirectoryGrid } from './directory-grid'
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

type Entry = Pick<Workspace, 'label' | 'topic' | 'href' | 'blurb' | 'measure'> & { open: boolean }

/** One workspace or project as a card. `feature` is the wide crimson one (the data underneath everything). */
function Card({ entry, topic, feature = false }: { entry: Entry; topic: string; feature?: boolean }) {
	const Glyph = ICONS[entry.label]
	const external = entry.href?.startsWith('http')
	const Arrow = external ? ArrowUpRightIcon : ArrowRightIcon
	const tile = feature
		? 'bg-white/12 text-white group-hover:bg-white group-hover:text-[var(--accent)]'
		: entry.open
			? 'bg-[var(--accent-soft)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'
			: 'bg-[var(--paper-2)] text-[var(--ink-mute)]'
	const body = (
		<>
			{/* A crimson rule that draws across the top on hover. */}
			{feature ? null : (
				<span aria-hidden='true' className='absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 ease-out group-hover:scale-x-100' />
			)}
			<span className='flex items-start justify-between gap-4'>
				<span className={`grid size-12 shrink-0 place-items-center transition duration-300 ${tile}`}>
					{Glyph ? <Glyph size={24} weight='duotone' aria-hidden='true' /> : null}
				</span>
				{entry.open ? (
					<span className={`text-[0.625rem] font-semibold uppercase tracking-[0.16em] ${feature ? 'text-white/70' : 'text-[var(--ink-mute)]'}`}>{topic}</span>
				) : (
					<span className='rounded-full bg-[var(--paper-2)] px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Coming soon</span>
				)}
			</span>
			<span className={feature ? 'mt-auto block pt-10 sm:max-w-[30rem]' : 'block'}>
				<span className={`mt-6 block font-extrabold tracking-[-0.025em] ${feature ? 'text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-white' : `text-[1.125rem] ${entry.open ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}`}>
					{entry.label}
				</span>
				<span className={`mt-2 line-clamp-3 text-[0.8125rem] leading-[1.6] ${feature ? 'text-white/80' : 'text-[var(--ink-3)]'}`}>{entry.blurb}</span>
			</span>
			<span className={`mt-auto flex items-center justify-between gap-3 pt-6`}>
				<span className={`text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ${feature ? 'text-white/70' : 'text-[var(--ink-mute)]'}`}>{entry.measure}</span>
				{entry.open ? (
					<span
						className={`grid size-9 shrink-0 place-items-center rounded-full transition duration-300 ${
							feature
								? 'bg-white text-[var(--accent)]'
								: 'border border-[var(--rule)] text-[var(--ink-3)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'
						}`}
					>
						<Arrow className='size-3.5 transition duration-300 group-hover:translate-x-0.5' weight='bold' aria-hidden='true' />
					</span>
				) : null}
			</span>
		</>
	)
	const base = `group relative flex h-full flex-col overflow-hidden p-6 transition duration-300 ${
		feature ? 'bg-[var(--accent)] sm:min-h-[15rem]' : 'border border-[var(--rule)] bg-[var(--paper)] sm:min-h-[16.5rem]'
	}`
	if (!entry.open || !entry.href) return <div className={`${base} opacity-70`}>{body}</div>
	const live = `${base} hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(25,23,19,0.5)] ${feature ? '' : 'hover:border-[var(--ink)]'}`
	return external ? (
		<a href={entry.href} className={live}>
			{body}
		</a>
	) : (
		<Link href={entry.href} className={live}>
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
	// Topic order, then the data underneath last as the wide feature card.
	const titles = Object.fromEntries(TOPICS.map((t) => [t.key, t.title]))
	const ordered = TOPICS.flatMap((t) => entries.filter((e) => e.topic === t.key))
	const items = ordered.map((e) => ({
		key: e.label,
		topic: e.topic,
		wide: e.topic === 'data',
		node: <Card entry={e} topic={titles[e.topic]} feature={e.topic === 'data'} />,
	}))
	const topics = TOPICS.map((t) => ({ key: t.key, title: t.title, count: entries.filter((e) => e.topic === t.key).length })).filter((t) => t.count)
	return <DirectoryGrid topics={topics} items={items} />
}
