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
						title: 'Procurement',
						links: [
							{ href: '/', label: 'Procuring entities' },
							{ href: '/notices', label: 'Bid notices' },
							{ href: '/suppliers', label: 'Suppliers' },
							{ href: '/patterns', label: 'Patterns' },
							{ href: '/follow-the-peso', label: 'Follow the peso' },
							{ href: '/how-it-works', label: 'How it works' },
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
				blurb='Every bid notice a BARMM government office has posted on PhilGEPS, what it set out to buy and for how much, and who won the contract.'
				note='Government procurement in the Bangsamoro'
				bottomRight='Notices and awards from PhilGEPS open data'
			/>
		</div>
	)
}
