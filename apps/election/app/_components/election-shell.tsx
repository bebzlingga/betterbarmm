import { ElectionFooter } from './election-footer'
import { SiteNav } from './site-nav'

/**
 * Every page in the workspace opens and closes the same way: the estate's bar
 * at the top, the project's ask on a warm band at the foot, then the
 * workspace's own footer on the deep ground (user decision: the travel look). All three come from `@betterbarmm/editorial` or
 * follow it, so this workspace begins and ends exactly as the landing site and
 * the other three do — which is the point of them being shared rather than
 * written out per app.
 */
export function ElectionShell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>

			{/* The ask on a warm band, then the workspace's footer, as travel's pages close (user decision: the travel look). */}
			<ElectionFooter />
		</div>
	)
}
