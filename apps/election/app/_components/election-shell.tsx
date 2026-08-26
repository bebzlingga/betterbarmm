import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { SiteNav } from './site-nav'

/**
 * Every page in the workspace opens and closes the same way: the estate's bar
 * at the top, the project's one ask on the crimson band at the foot, then the
 * footer on the dark ground. All three come from `@betterbarmm/editorial` or
 * follow it, so this workspace begins and ends exactly as the landing site and
 * the other three do — which is the point of them being shared rather than
 * written out per app.
 */
export function ElectionShell({ children }: { children: React.ReactNode }) {
	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteNav />
			<main>{children}</main>

			<CtaPanel />

			<SiteFooter
				base='https://betterbarmm.com'
				columns={[
					{
						title: 'This workspace',
						links: [
							{ href: 'https://election.betterbarmm.com/', label: 'The election' },
							{ href: 'https://election.betterbarmm.com/candidates', label: 'Candidates' },
							{ href: 'https://election.betterbarmm.com/parties/UBJP', label: 'The parties' },
						],
					},
					{
						title: 'Workspaces',
						links: [
							{ href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
							{ href: 'https://budget.betterbarmm.com', label: 'Budget' },
							{ href: 'https://lgu.betterbarmm.com', label: 'Local government' },
							{ href: 'https://betterbarmm.com/discover', label: 'Discover BARMM' },
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
				blurb='The first regular election of the Bangsamoro Parliament, as a public record: the parties on the regional ballot, the candidates who filed in each district, the reserved seats, the dates the vote moved through — and the source behind every line of it.'
				note='The 2026 Bangsamoro Parliamentary Election'
				bottomRight='Dataset: datasets/election/election.min.json'
			/>
		</div>
	)
}
