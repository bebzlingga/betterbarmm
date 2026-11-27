import { DragScroll } from './drag-scroll'
import { SiteNav } from './site-nav'
import { TravelFooter } from './travel-footer'

/**
 * Every page in the workspace closes the same way: the workspace's own footer, the project's ask at its top (user decision: the Discover look, in place of the estate's band and footer).
 *
 * The footer's bottom-right line is where each workspace states what its pages
 * rest on. The others name a source — PSA, COMELEC, Parliament. This one has
 * no source to name, and saying so there is the whole point: it is the last
 * line on every page in the workspace.
 */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>

			<TravelFooter />
			<DragScroll />
		</div>
	)
}
