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
const ESTATE_LINKS: UtilityLink[] = [
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact us' },
	{ href: 'https://www.facebook.com/betterbarmm', label: 'Follow us on Facebook' },
]

/** The live workspaces, in the order the front page lists them. */
const WORKSPACES = [
	{ key: 'home', href: 'https://betterbarmm.com', label: 'BetterBARMM' },
	{ key: 'election', href: 'https://election.betterbarmm.com', label: 'Election' },
	{ key: 'legislation', href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
	{ key: 'budget', href: 'https://budget.betterbarmm.com', label: 'Budget' },
	{ key: 'lgu', href: 'https://lgu.betterbarmm.com', label: 'Local government' },
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
}: {
	base?: string
	current?: WorkspaceKey
	links?: UtilityLink[]
	/** A ground for the strip, e.g. `bb-ground` for the near-black band. */
	className?: string
	/** Controls ranged after the links — a theme switch, a call to action. */
	end?: React.ReactNode
}) {
	return (
		<div className={`utility-bar ${className}`}>
			<div className='mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-6 lg:px-8'>
				{/* A dropdown rather than a row: it stays one control however many
				    workspaces there are. Native `<details>`, so it opens without
				    script. Gone below `sm`; the main menu still reaches everything. */}
				<details className='utility-bar-switch relative hidden sm:block'>
					<summary className='utility-bar-link cursor-pointer list-none'>
						<span className='font-bold'>Workspace:</span>
						<span className='text-[var(--ink)]'>
							{WORKSPACES.find((workspace) => workspace.key === current)?.label ?? 'BetterBARMM'}
						</span>
						<svg viewBox='0 0 10 6' aria-hidden='true' className='utility-bar-caret size-2.5'>
							<path d='M1 1l4 4 4-4' fill='none' stroke='currentColor' strokeWidth='1.5' />
						</svg>
					</summary>
					<ul className='absolute left-0 top-full z-50 grid min-w-[12rem] border border-[var(--rule)] bg-[var(--paper)] py-1.5 shadow-lg'>
						{WORKSPACES.map((workspace) => (
							<li key={workspace.key}>
								<a
									href={workspace.href}
									aria-current={workspace.key === current ? 'page' : undefined}
									className='utility-bar-link w-full !py-2 px-4'
								>
									{workspace.label}
								</a>
							</li>
						))}
					</ul>
				</details>

				{/* Ranged right on every width. On a phone the switch is gone and
				    `justify-between` would strand the links on the left, so the row
				    pushes them over with a spacer rather than switching alignment. */}
				<span className='flex-1 sm:hidden' aria-hidden='true' />

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
