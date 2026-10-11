import { CtaPanel } from '@betterbarmm/editorial'
import { SiteFooter } from './site-footer'
import { RegistryFinder } from './registry-finder'
import { SiteNav } from './site-nav'

/**
 * Every page in the registry closes the same way: the standing caveat, the one
 * ask on the brand band, then the estate footer on the dark ground.
 *
 * The panel used to sit on the hub alone. It is here instead because a reader
 * arriving on a single bill from a search result — which is most of them —
 * never sees the hub, and they are exactly the reader who most needs to be told
 * that the summary they just read is a reading of a document rather than the
 * document.
 */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<RegistryFinder>
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			{/* Descriptions at the budget workspace's size. The shared `.bb-body`
			    (section-head leads, explainer prose) and `.section-lead` run at
			    16.5px and 15.5px — a step larger than the budget pages, so the two
			    workspaces read differently. Set here, once, for this app only:
			    the landing site keeps the larger size. Important for the same
			    reason as the panel below — the shared rules are unlayered. */}
			<main className='[&_.bb-body]:text-[15px]! [&_.section-lead]:text-[15px]!'>{children}</main>

			{/* The project's ask, not the registry's. Same panel, same words, at the
			    foot of every page of every app — one project, said once. */}
			{/* "Get involved" on the same rhythm as every section above it, and as the
			    budget workspace's panel. CtaPanel pads itself with the estate's
			    larger `.bb-section` and takes no className, so it is reached
			    through a wrapper — marked important, because `.bb-section` is
			    unlayered CSS and beats any Tailwind utility otherwise. */}
			<div className='[&_.bb-section]:py-[clamp(3.75rem,7vw,6.5rem)]!'>
				<CtaPanel />
			</div>

			<SiteFooter />
		</div>
		</RegistryFinder>
	)
}
