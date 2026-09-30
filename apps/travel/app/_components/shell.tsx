import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { travelAreas } from '@betterbarmm/travel-data'
import { SiteNav } from './site-nav'

/**
 * Every page in the workspace closes the same way: the project's ask on the
 * brand band, then the estate footer on the dark ground. Both come from
 * `@betterbarmm/editorial`, so this workspace ends exactly as the others do.
 *
 * The footer's bottom-right line is where each workspace states what its pages
 * rest on. The others name a source — PSA, COMELEC, Parliament. This one has
 * no source to name, and saying so there is the whole point: it is the last
 * line on every page in the workspace.
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
						title: 'Areas',
						links: travelAreas.map((area) => ({
							href: `https://travel.betterbarmm.com/${area.slug}`,
							label: area.name,
						})),
					},
					{
						title: 'The guide',
						links: [
							{ href: 'https://travel.betterbarmm.com/routes', label: 'Routes' },
							{ href: 'https://travel.betterbarmm.com/places', label: 'Places' },
							{ href: 'https://travel.betterbarmm.com/food', label: 'Food' },
							{ href: 'https://travel.betterbarmm.com/stays', label: 'Where to sleep' },
							{ href: 'https://travel.betterbarmm.com/plan', label: 'Plan a trip' },
						],
					},
					{
						title: 'Workspaces',
						links: [
							{ href: 'https://lgu.betterbarmm.com', label: 'Local government' },
							{ href: 'https://election.betterbarmm.com', label: 'Election' },
							{ href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
							{ href: 'https://budget.betterbarmm.com', label: 'Budget' },
						],
					},
				]}
				blurb='Seven areas, from the seat of government at Cotabato City to the sandbars of Tawi-Tawi — what there is to see, what to eat, where lodging actually exists, and an honest account of the security picture in each.'
				note='Traveling the Bangsamoro'
				bottomRight='Written, not captured · verify before you travel'
			/>
		</div>
	)
}
