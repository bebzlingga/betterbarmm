import { CtaPanel } from '@betterbarmm/editorial'
import { SiteFooter } from './site-footer'
import { SiteNav } from './site-nav'

/**
 * Every page in the registry closes the same way: the standing caveat, the one
 * ask on the crimson band, then the estate footer on the dark ground.
 *
 * The panel used to sit on the hub alone. It is here instead because a reader
 * arriving on a single bill from a search result — which is most of them —
 * never sees the hub, and they are exactly the reader who most needs to be told
 * that the summary they just read is a reading of a document rather than the
 * document.
 */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>

			{/* The project's ask, not the registry's. Same panel, same words, at the
			    foot of every page of every app — one project, said once. */}
			<CtaPanel />

			<SiteFooter />
		</div>
	)
}
