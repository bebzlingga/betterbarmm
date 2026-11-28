import { BooksIcon, BrainIcon, BuildingsIcon, GraduationCapIcon, MapPinAreaIcon, CheckSquareOffsetIcon, CoinsIcon, DatabaseIcon, DiamondsFourIcon, FolderOpenIcon, HouseIcon, ScrollIcon, ShoppingCartIcon, SirenIcon, TargetIcon, UmbrellaIcon } from '@phosphor-icons/react/ssr'
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

type SwitchItem = { key: string; href: string; label: string; icon: typeof HouseIcon; group?: string; blurb?: string }

/** The groups the workspaces fall in, as the front page groups them. */
const GROUPS = ['Start here', 'Laws & elections', 'Public money', 'Sectors', 'Places & culture'] as const

/** The live workspaces, each in its group and with a line on what it holds. */
const WORKSPACES = [
	{ key: 'home', href: 'https://betterbarmm.com', label: 'Discover BARMM', icon: HouseIcon, group: 'Start here', blurb: 'The region, its government and every record' },
	{ key: 'legislation', href: 'https://legislation.betterbarmm.com', label: 'Legislation', icon: ScrollIcon, group: 'Laws & elections', blurb: 'Bills, laws and the members who filed them' },
	{ key: 'election', href: 'https://election.betterbarmm.com', label: 'Election', icon: CheckSquareOffsetIcon, group: 'Laws & elections', blurb: 'Parties, candidates and districts' },
	{ key: 'lgu', href: 'https://lgu.betterbarmm.com', label: 'Local Government', icon: BuildingsIcon, group: 'Laws & elections', blurb: 'Every province, town and barangay' },
	{ key: 'budget', href: 'https://budget.betterbarmm.com', label: 'Budget', icon: CoinsIcon, group: 'Public money', blurb: 'What each year’s Act sets aside' },
	{ key: 'procurement', href: 'https://procurement.betterbarmm.com', label: 'Procurement', icon: ShoppingCartIcon, group: 'Public money', blurb: 'Bids, contracts and who won them' },
	{ key: 'education', href: 'https://education.betterbarmm.com', label: 'Education', icon: GraduationCapIcon, group: 'Sectors', blurb: 'Every school, its learners and scholarships' },
	{ key: 'library', href: 'https://library.betterbarmm.com', label: 'Library', icon: BooksIcon, group: 'Places & culture', blurb: 'Books on the Bangsamoro and where to find them' },
	{ key: 'travel', href: 'https://travel.betterbarmm.com', label: 'Travel & Places', icon: MapPinAreaIcon, group: 'Places & culture', blurb: 'Beaches, islands, mosques and heritage' },
] as const

export type WorkspaceKey = (typeof WORKSPACES)[number]['key']

/** The projects: records of a different kind, each a page on the landing
 *  site rather than a workspace of its own, listed from every workspace. */
const PROJECTS = [
	{ key: 'accidents', href: 'https://betterbarmm.com/incidents', label: 'Incident Watch', icon: SirenIcon, blurb: 'Crashes, fires, floods and shootings, mapped from the news' },
	{ key: 'preparedness', href: 'https://betterbarmm.com/preparedness', label: 'Preparedness', icon: UmbrellaIcon, blurb: 'Hazards for every barangay and the evacuation sites near it' },
	{ key: 'plan', href: 'https://betterbarmm.com/development-plan', label: 'Plan scorecard', icon: TargetIcon, blurb: 'The regional plan’s targets beside the latest figures' },
	{ key: 'crafts', href: 'https://betterbarmm.com/crafts', label: 'Crafts', icon: DiamondsFourIcon, blurb: 'Weaves, mats, brass and gongs, and where each is made' },
	{ key: 'data', href: 'https://betterbarmm.com/data', label: 'Open data', icon: DatabaseIcon, blurb: 'Every workspace’s records as tables to download' },
	// A dialog, not a page: the landing site opens it over whatever page is open.
	{ key: 'brain', href: 'https://betterbarmm.com/#brain', label: 'Brain', icon: BrainIcon, blurb: 'A map of every source, dataset and workspace on the site' },
] as const

export type ProjectKey = (typeof PROJECTS)[number]['key']

/**
 * One dropdown of the strip. A dropdown rather than a row: it stays one
 * control however many entries there are. Native `<details>`, so it opens
 * without script; `SwitchCloser` shuts it from outside. Drawn twice, for
 * the workspaces and then the projects, so the two read as one control —
 * and one `name`, so the browser itself never lets both stand open.
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
	const grouped = items.some((item) => item.group)
	const row = (item: SwitchItem) => {
		const on = item.key === current
		const Icon = item.icon
		return (
			<li key={item.key}>
				{/* Each a rounded tile in the travel look (user decision): a soft tint under the pointer, the open one tinted and
				    marked by its filled glyph tile and its crimson name. */}
				<a
					href={item.href}
					aria-current={on ? 'page' : undefined}
					className={`group flex items-start gap-3 rounded-2xl p-3 transition-colors ${on ? 'bg-[color-mix(in_srgb,var(--accent)_7%,var(--paper))]' : 'hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))]'}`}
				>
					<span
						className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${on ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white'}`}
					>
						<Icon size={18} weight={on ? 'fill' : 'duotone'} aria-hidden='true' />
					</span>
					<span className='min-w-0 pt-0.5'>
						<span className={`block font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold leading-5 transition-colors ${on ? 'text-[var(--accent)]' : 'text-[var(--ink)] group-hover:text-[var(--accent)]'}`}>{item.label}</span>
						{item.blurb ? <span className='mt-0.5 block text-[0.75rem] font-normal leading-snug text-[var(--ink-3)]'>{item.blurb}</span> : null}
					</span>
				</a>
			</li>
		)
	}
	return (
		<details name='utility-bar-switch' className={`utility-bar-switch ${className}`}>
			<summary className='utility-bar-link cursor-pointer list-none'>
				{icon}
				{/* On the narrowest phones the value says enough; "Workspace:" would push the strip past the window. */}
				<span className={`font-bold ${value ? 'max-[399px]:hidden' : ''}`}>{label}</span>
				{value ? <span className='text-[var(--ink)]'>{value}</span> : null}
				<svg viewBox='0 0 10 6' aria-hidden='true' className='utility-bar-caret size-2.5'>
					<path d='M1 1l4 4 4-4' fill='none' stroke='currentColor' strokeWidth='1.5' />
				</svg>
			</summary>
			{/* The full width of the window under the strip (user decision), its rows in the page's own container:
			    the groups side by side from a laptop up, two to a row on a tablet, stacked on a phone. Placed against
			    the strip itself, which is the positioned box, not against this switch. */}
			<div className='absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-b-[1.5rem] bg-[var(--paper)] normal-case tracking-normal shadow-[0_36px_70px_-30px_rgba(0,0,0,0.55)] [scrollbar-width:thin]'>
				<div className='mx-auto max-w-[var(--bb-page-width)] px-3 py-7 sm:px-4 lg:px-5 lg:py-8'>
					{grouped ? (
						<div className='grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-5'>
							{GROUPS.map((g) => {
								const here = items.filter((item) => item.group === g)
								return here.length ? (
									<section key={g}>
										<p className='px-3 pb-1 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{g}</p>
										<ul className='mt-1 grid gap-0.5'>{here.map((item) => row(item))}</ul>
									</section>
								) : null
							})}
						</div>
					) : (
						<>
							<p className='px-3 pb-1 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{heading}</p>
							<ul className='mt-1 grid gap-x-4 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-5'>{items.map((item) => row(item))}</ul>
						</>
					)}
				</div>
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
		<div className={`utility-bar relative ${className}`}>
			<div className='mx-auto flex max-w-[var(--bb-page-width)] items-center justify-between gap-4 px-6 lg:px-8'>
				<div className='flex items-center gap-4 sm:gap-5'>
					<Switch
						icon={switchIcon}
						label='Workspace:'
						value={WORKSPACES.find((workspace) => workspace.key === current)?.label ?? 'Discover BARMM'}
						heading='Workspaces'
						items={WORKSPACES}
						current={current}
					/>
					{/* Below a tablet there is no room for a second switch; the menu lists the projects. */}
					<Switch
						icon={<ProjectIcon size={13} weight='bold' aria-hidden='true' />}
						label={projectLabel ? 'Project:' : 'Projects'}
						value={projectLabel}
						heading='Projects'
						items={PROJECTS}
						current={project}
						className='hidden md:block'
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
