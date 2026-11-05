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
						title: 'Education',
						links: [
							{ href: '/', label: 'Overview' },
							{ href: '/schools', label: 'Schools' },
							{ href: '/map', label: 'Map' },
							{ href: '/needs', label: 'Needs' },
							{ href: '/budget', label: 'Budget' },
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
				blurb='Every public school in the region on a map and in a list, what schools say they need, and what the budget gives education, with the record behind each figure.'
				note='Education in the Bangsamoro'
			/>
		</div>
	)
}
