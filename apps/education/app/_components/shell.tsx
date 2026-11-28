import { EducationFooter } from './education-footer'
import { SiteNav } from './site-nav'

/** Every page closes as travel's do (user decision: the travel look, as legislation's): the ask on a warm band, then the workspace's own footer. */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>
			<EducationFooter />
		</div>
	)
}
