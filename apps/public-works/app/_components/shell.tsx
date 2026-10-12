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
						title: 'Public Works',
						links: [
							{ href: '/', label: 'Projects' },
							{ href: '/towns', label: 'By town' },
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
				blurb='Every road, bridge, water system and building the Bangsamoro budget has funded since FY 2020, where it is, what it cost, and the bid notice behind it.'
				note='Public works in the Bangsamoro'
			/>
		</div>
	)
}
