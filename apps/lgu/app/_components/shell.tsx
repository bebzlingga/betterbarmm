import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { areaHref, lguProvinces } from '@betterbarmm/lgu-data'
import { SiteNav } from './site-nav'
import { UnitFinder } from './unit-finder'

/**
 * Every page in the workspace closes the same way: the project's ask on the
 * brand band, then the estate footer on the dark ground. Both come from
 * `@betterbarmm/editorial`, so this workspace ends exactly as the landing site
 * and the other three do.
 *
 * The finder wraps everything rather than sitting in the header, so "/" reaches
 * it from any page and the overlay is mounted once for the whole workspace
 * rather than once per route.
 */
export function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<UnitFinder>
				<SiteNav />
				<main>{children}</main>
			</UnitFinder>

			<CtaPanel />

			<SiteFooter
				base='https://betterbarmm.com'
				columns={[
					{
						title: 'Provinces',
						links: lguProvinces.map((province) => ({
							href: `https://lgu.betterbarmm.com${areaHref(province)}`,
							label: province.name,
						})),
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
				blurb='Every province, city, municipality and barangay in the Bangsamoro, with its population, land area, and the officials elected to run it. Trace it back to the census it came from.'
				note='Local government in the Bangsamoro'
			/>
		</div>
	)
}
