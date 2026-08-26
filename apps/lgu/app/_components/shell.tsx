import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { SiteNav } from './site-nav'

/**
 * Every page in the workspace closes the same way: the project's ask on the
 * crimson band, then the estate footer on the dark ground. Both come from
 * `@betterbarmm/editorial`, so this workspace ends exactly as the landing site
 * and the other three do.
 */
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
						title: 'Provinces',
						links: lguProvinces.map((province) => ({
							href: `https://lgu.betterbarmm.com/${province.slug}`,
							label: province.name,
						})),
					},
					{
						title: 'Workspaces',
						links: [
							{ href: 'https://election.betterbarmm.com', label: 'Election' },
							{ href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
							{ href: 'https://budget.betterbarmm.com', label: 'Budget' },
							{ href: 'https://betterbarmm.com/discover', label: 'Discover BARMM' },
						],
					},
					{
						title: 'Project',
						links: [
							{ href: '/about', label: 'About' },
							{ href: '/contribute', label: 'Contribute' },
							{ href: 'mailto:support@betterbarmm.com', label: 'Email us' },
						],
					},
				]}
				blurb='Every province, city, municipality and barangay in the Bangsamoro, with the population and land area on record for each, the officials COMELEC canvassed into office, and the services each rung is responsible for.'
				note='Local government in the Bangsamoro'
				bottomRight='Structure from PSA · figures from the 2024 census'
			/>
		</div>
	)
}
