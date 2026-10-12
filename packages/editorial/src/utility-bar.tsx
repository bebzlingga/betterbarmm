import { BuildingsIcon, CheckSquareOffsetIcon, CoinsIcon, HouseIcon, ScrollIcon, ShoppingCartIcon } from '@phosphor-icons/react/ssr'
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
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact us' },
	{ href: 'https://www.facebook.com/betterbarmm', label: 'Follow us on Facebook' },
]

/** Each workspace's icon. */
const ICONS = {
	home: HouseIcon,
	election: CheckSquareOffsetIcon,
	legislation: ScrollIcon,
	budget: CoinsIcon,
	lgu: BuildingsIcon,
	procurement: ShoppingCartIcon,
} as const

/** The live workspaces, in the order the front page lists them. */
const WORKSPACES = [
	{ key: 'home', href: 'https://betterbarmm.com', label: 'BetterBARMM' },
	{ key: 'election', href: 'https://election.betterbarmm.com', label: 'Election' },
	{ key: 'legislation', href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
	{ key: 'budget', href: 'https://budget.betterbarmm.com', label: 'Budget' },
	{ key: 'lgu', href: 'https://lgu.betterbarmm.com', label: 'Local government' },
	{ key: 'procurement', href: 'https://procurement.betterbarmm.com', label: 'Procurement' },
] as const

export type WorkspaceKey = (typeof WORKSPACES)[number]['key']

export function UtilityBar({
	/** Prefixed to internal hrefs, for an app that is not on betterbarmm.com. */
	base = '',
	/** Which workspace this is, so the switch can mark it. */
	current,
	links = ESTATE_LINKS,
	className = '',
	end,
	switchIcon,
}: {
	base?: string
	current?: WorkspaceKey
	links?: UtilityLink[]
	/** A ground for the strip, e.g. `bb-ground` for the near-black band. */
	className?: string
	/** Controls ranged after the links — a theme switch, a call to action. */
	end?: React.ReactNode
	/** An icon before "Workspace:" in the switch. */
	switchIcon?: React.ReactNode
}) {
	return (
		<div className={`utility-bar ${className}`}>
			<div className='mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-6 lg:px-8'>
				{/* A dropdown rather than a row: it stays one control however many
				    workspaces there are. Native `<details>`, so it opens without
				    script. */}
				<details className='utility-bar-switch relative'>
					<summary className='utility-bar-link cursor-pointer list-none'>
						{switchIcon}
						<span className='font-bold'>Workspace:</span>
						<span className='text-[var(--ink)]'>
							{WORKSPACES.find((workspace) => workspace.key === current)?.label ?? 'BetterBARMM'}
						</span>
						<svg viewBox='0 0 10 6' aria-hidden='true' className='utility-bar-caret size-2.5'>
							<path d='M1 1l4 4 4-4' fill='none' stroke='currentColor' strokeWidth='1.5' />
						</svg>
					</summary>
					{/* Every workspace a row, its icon beside its name. */}
					<div className='absolute left-0 top-full z-50 mt-1 w-[16rem] max-w-[calc(100vw-2rem)] border border-[var(--rule)] bg-[var(--paper)] p-2 normal-case tracking-normal shadow-lg'>
						<p className='px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)]'>Workspaces</p>
						<ul className='grid'>
							{WORKSPACES.map((workspace) => {
								const on = workspace.key === current
								return (
									<li key={workspace.key}>
										<a
											href={workspace.href}
											aria-current={on ? 'page' : undefined}
											className={`group flex items-center gap-3 px-2 py-2 transition ${on ? 'bg-[var(--paper-2)]' : 'hover:bg-[var(--paper-2)]'}`}
										>
											<span
												className={`grid size-5 shrink-0 place-items-center transition ${
													on ? 'text-[var(--accent)]' : 'text-[var(--ink-3)] group-hover:text-[var(--accent)]'
												}`}
											>
												{(() => {
													const Icon = ICONS[workspace.key]
													return <Icon size={16} weight={on ? 'fill' : 'regular'} aria-hidden='true' />
												})()}
											</span>
											<span className={`text-[13.5px] font-semibold leading-tight ${on ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>
												{workspace.label}
											</span>
										</a>
									</li>
								)
							})}
						</ul>
					</div>
				</details>
				<SwitchCloser />

				<nav aria-label='Project links' className='flex items-center gap-4 sm:gap-5'>
					{links.map((link) => {
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
