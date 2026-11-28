import { LguFooter } from './lgu-footer'
import { SiteNav } from './site-nav'
import { UnitFinder } from './unit-finder'

/**
 * Every page in the workspace closes the same way: the ask on a warm band, then
 * the workspace's own footer on the deep ground (user decision: the travel look).
 *
 * The finder wraps everything rather than sitting in the header, so "/" reaches
 * it from any page and the overlay is mounted once for the whole workspace
 * rather than once per route.
 */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<UnitFinder>
				<SiteNav />
				<main>{children}</main>
			</UnitFinder>

			{/* The ask on a warm band, then the workspace's footer, as travel's pages close (user decision: the travel look). */}
			<LguFooter />
		</div>
	)
}
