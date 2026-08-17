import { SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'
import { TransparencyNotice } from './transparency-notice'

export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>
			{/* Shown on every page, not just About — a reader landing on a single
			    measure from search is exactly who needs it. */}
			<TransparencyNotice />
			<SiteFooter />
		</div>
	)
}
