import { CtaPanel, SiteFooter } from '@betterbarmm/editorial'
import { SiteNav } from './site-nav'

/**
 * Every page in the workspace opens and closes the same way: the estate's bar
 * at the top, the project's one ask on the brand band at the foot, then the
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

			{/* `cta-tight`: the panel pads itself with the estate's own section
			    rhythm; this puts it on the workspace's. */}
			<div className='cta-tight'>
				<CtaPanel />
			</div>

			<SiteFooter
				base='https://betterbarmm.com'
				columns={[
					{
						title: 'This workspace',
						links: [
							{ href: 'https://election.betterbarmm.com/', label: 'The election' },
							{ href: 'https://election.betterbarmm.com/results', label: 'The result' },
							{ href: 'https://election.betterbarmm.com/candidates', label: 'Candidates' },
							{ href: 'https://election.betterbarmm.com/parties/UBJP', label: 'The parties' },
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
				blurb='The 2026 Bangsamoro Parliamentary Election as a public record: the parties and candidates on the ballot, the reserved seats, and the count that filled all 80. Trace every line back to the record it came from.'
				note='The 2026 Bangsamoro Parliamentary Election'
				bottomRight='Datasets: datasets/election/election.min.json, election-results.json'
			/>
		</div>
	)
}
