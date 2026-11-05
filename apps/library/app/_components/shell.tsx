import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { SiteNav } from './site-nav'

/** Every page closes as the rest of the estate does: the ask, then the footer. */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>

			<CtaPanel />

			<SiteFooter
				base='https://betterbarmm.com'
				columns={[
					{
						title: 'Library',
						links: [
							{ href: '/', label: 'Overview' },
							{ href: '/books', label: 'Books' },
							{ href: '/authors', label: 'Authors' },
							{ href: '/publishers', label: 'Publishers' },
							{ href: '/magazines', label: 'Magazines' },
							{ href: '/sources', label: 'Sources' },
						],
					},
					{
						title: 'Project',
						links: [
							{ href: 'https://betterbarmm.com/about', label: 'About' },
							{ href: 'https://betterbarmm.com/contribute', label: 'Contribute' },
							{ href: 'mailto:support@betterbarmm.com', label: 'Email us' },
						],
					},
				]}
				blurb='The books written about the Bangsamoro and its peoples, who wrote and published them, where each can be bought, borrowed or read free, and the magazines the region’s own offices put out.'
				note='A library of the Bangsamoro'
			/>
		</div>
	)
}
