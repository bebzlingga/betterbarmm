import { BuildingsIcon, CheckSquareOffsetIcon, CoinsIcon, FolderOpenIcon, HouseIcon, ScrollIcon, ShoppingCartIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import { GlobalSearch } from './global-search'
import { SwitchCloser } from './switch-closer'

/* ============================================================
   The strip above the masthead

   One line across the top of every workspace: a switch between the
   workspaces on the left, how to reach the project on the right. It is the estate
   talking, not the workspace — so it says the same thing on the
   budget site as on the registry, and its links point at
   betterbarmm.com wherever they are read from.

   Not sticky, and that is the point. The bar below it pins and
   ducks because a reader deep in a page still needs the
   navigation; nobody scrolls back up for a Facebook link. So this
   scrolls away with the top of the document and costs nothing
   after the first screen, which is why it can afford to exist at
   all. `--site-header-h` and `--sticky-top` are untouched: they
   describe the bar that sticks, and this is not it.

   The links are `base`-prefixed the same way the footer's are, so
   one list serves the landing site and five subdomains.
   ============================================================ */

const isAbsolute = (href: string) => href.startsWith('http') || href.startsWith('mailto:')

export type UtilityLink = { href: string; label: string }

/** The estate's own row, for an app that does not override it. */
export const ESTATE_LINKS: UtilityLink[] = [
	{ href: '/search', label: 'Search' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact us' },
	{ href: 'https://www.facebook.com/betterbarmm', label: 'Follow us on Facebook' },
]

type SwitchItem = { key: string; href: string; label: string; icon: typeof HouseIcon }

/** The live workspaces, in the order the front page lists them. */
const WORKSPACES = [
	{ key: 'home', href: 'https://betterbarmm.com', label: 'Discover BARMM', icon: HouseIcon },
	{ key: 'election', href: 'https://election.betterbarmm.com', label: 'Election', icon: CheckSquareOffsetIcon },
	{ key: 'legislation', href: 'https://legislation.betterbarmm.com', label: 'Legislation', icon: ScrollIcon },
	{ key: 'budget', href: 'https://budget.betterbarmm.com', label: 'Budget', icon: CoinsIcon },
	{ key: 'lgu', href: 'https://lgu.betterbarmm.com', label: 'Local Government', icon: BuildingsIcon },
	{ key: 'procurement', href: 'https://procurement.betterbarmm.com', label: 'Procurement', icon: ShoppingCartIcon },
] as const

export type WorkspaceKey = (typeof WORKSPACES)[number]['key']

/** The projects: records of a different kind, each a page on the landing
 *  site rather than a workspace of its own, listed from every workspace. */
const PROJECTS = [
	{ key: 'accidents', href: 'https://betterbarmm.com/accidents', label: 'Accident Monitor', icon: SirenIcon },
] as const

export type ProjectKey = (typeof PROJECTS)[number]['key']

/**
 * One dropdown of the strip. A dropdown rather than a row: it stays one
 * control however many entries there are. Native `<details>`, so it opens
 * without script; `SwitchCloser` shuts it from outside. Drawn twice, for
 * the workspaces and then the projects, so the two read as one control.
 */
function Switch({
	icon,
	label,
	value,
	heading,
	items,
	current,
	className = '',
}: {
	icon?: React.ReactNode
	label: string
	value?: string
	heading: string
	items: readonly SwitchItem[]
	current?: string
	className?: string
}) {
	return (
		<details className={`utility-bar-switch relative ${className}`}>
			<summary className='utility-bar-link cursor-pointer list-none'>
				{icon}
				<span className='font-bold'>{label}</span>
				{value ? <span className='text-[var(--ink)]'>{value}</span> : null}
				<svg viewBox='0 0 10 6' aria-hidden='true' className='utility-bar-caret size-2.5'>
					<path d='M1 1l4 4 4-4' fill='none' stroke='currentColor' strokeWidth='1.5' />
				</svg>
			</summary>
			{/* Every entry a row, its icon beside its name. */}
			<div className='absolute left-0 top-full z-50 mt-1 w-[16rem] max-w-[calc(100vw-2rem)] border border-[var(--rule)] bg-[var(--paper)] p-2 normal-case tracking-normal shadow-lg'>
				<p className='px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>{heading}</p>
				<ul className='grid'>
					{items.map((item) => {
						const on = item.key === current
						const Icon = item.icon
						return (
							<li key={item.key}>
								<a
									href={item.href}
									aria-current={on ? 'page' : undefined}
									className={`group flex items-center gap-3 px-2 py-2 transition ${on ? 'bg-[var(--paper-2)]' : 'hover:bg-[var(--paper-2)]'}`}
								>
									<span
										className={`grid size-5 shrink-0 place-items-center transition ${
											on ? 'text-[var(--accent)]' : 'text-[var(--ink-3)] group-hover:text-[var(--accent)]'
										}`}
									>
										<Icon size={16} weight={on ? 'fill' : 'regular'} aria-hidden='true' />
									</span>
									<span className={`text-[13.5px] font-semibold leading-tight ${on ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>
										{item.label}
									</span>
								</a>
							</li>
						)
					})}
				</ul>
			</div>
		</details>
	)
}

export function UtilityBar({
	/** Prefixed to internal hrefs, for an app that is not on betterbarmm.com. */
	base = '',
	/** Which workspace this is, so the switch can mark it. */
	current,
	/** Which project this page belongs to, if any, so the second switch can mark it. */
	project,
	links = ESTATE_LINKS,
	className = '',
	end,
	switchIcon,
}: {
	base?: string
	current?: WorkspaceKey
	project?: ProjectKey
	links?: UtilityLink[]
	/** A ground for the strip, e.g. `bb-ground` for the near-black band. */
	className?: string
	/** Controls ranged after the links — a theme switch, a call to action. */
	end?: React.ReactNode
	/** An icon before "Workspace:" in the switch. */
	switchIcon?: React.ReactNode
}) {
	const currentProject = PROJECTS.find((item) => item.key === project)
	const projectLabel = currentProject?.label
	// The project's own glyph when one is open, a folder when none is: the switch wears what it holds.
	const ProjectIcon = currentProject?.icon ?? FolderOpenIcon
	return (
		<div className={`utility-bar ${className}`}>
			<div className='mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-6 lg:px-8'>
				<div className='flex items-center gap-4 sm:gap-5'>
					<Switch
						icon={switchIcon}
						label='Workspace:'
						value={WORKSPACES.find((workspace) => workspace.key === current)?.label ?? 'Discover BARMM'}
						heading='Workspaces'
						items={WORKSPACES}
						current={current}
					/>
					{/* Phones have no room for a second switch; their menu lists the projects. */}
					<Switch
						icon={<ProjectIcon size={13} weight='bold' aria-hidden='true' />}
						label={projectLabel ? 'Project:' : 'Projects'}
						value={projectLabel}
						heading='Projects'
						items={PROJECTS}
						current={project}
						className='hidden sm:block'
					/>
					<SwitchCloser />
				</div>

				<nav aria-label='Project links' className='flex items-center gap-4 sm:gap-5'>
					{links.filter((link) => link.href !== '/search').map((link) => {
						const external = isAbsolute(link.href)
						return (
							<a
								key={link.href}
								href={external ? link.href : `${base}${link.href}`}
								{...(external && link.href.startsWith('http')
									? { target: '_blank', rel: 'noreferrer' }
									: {})}
								className='utility-bar-link'
							>
								{link.label}
							</a>
						)
					})}
					{/* Search last among the links, after Follow us on Facebook; it opens
					    in place rather than leaving for the /search page. */}
					{links.some((link) => link.href === '/search') ? <GlobalSearch base={base} /> : null}
					{end}
				</nav>
			</div>
		</div>
	)
}

/**
 * The strip's links for a phone's menu, where the strip has room only for
 * the workspace switch and the theme.
 */
export function UtilityMenuLinks({
	base = '',
	links = ESTATE_LINKS,
	onNavigate,
}: {
	base?: string
	links?: UtilityLink[]
	onNavigate?: () => void
}) {
	return (
		<>
			<p className='bb-label mt-7'>BetterBARMM</p>
			<div className='mt-3 grid'>
				{links.map((link) => {
					const external = isAbsolute(link.href)
					return (
						<a
							key={link.href}
							href={external ? link.href : `${base}${link.href}`}
							{...(external && link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
							onClick={onNavigate}
							className='border-b border-[var(--rule-soft)] py-2.5 last:border-b-0'
						>
							{link.label}
						</a>
					)
				})}
			</div>
		</>
	)
}
