import { SiteFooter as EditorialFooter } from '@betterbarmm/editorial'
import { categories } from '../_lib/categories'

/**
 * The registry's cut of the estate footer.
 *
 * The shell — the ground, the ornament, the mailing-list band, the rules — is
 * the shared one, so the foot of a bill page and the foot of the landing site
 * are the same object. Only what a reader of *this* app needs is different: the
 * six record classes in place of Discover's chapters, and the AI-assistance
 * notice, which belongs on the surface whose summaries are the ones being
 * qualified.
 *
 * Links out of the registry are absolute, because this app is served from its
 * own subdomain and a relative `/about` would land on the registry's own.
 */
export function SiteFooter() {
	return (
		<EditorialFooter
			base='https://betterbarmm.com'
			columns={[
				{
					title: 'Registry',
					// Absolute, so the shared footer's `base` prefix leaves them alone —
					// these point at this app, not at the landing site.
					links: categories.map((category) => ({
						href: `https://legislation.betterbarmm.com${category.href}`,
						label: category.label,
					})),
				},
				{
					title: 'This workspace',
					links: [
						{ href: 'https://legislation.betterbarmm.com/members', label: 'Members' },
						{ href: 'https://legislation.betterbarmm.com/committees', label: 'Committees' },
						{
							href: 'https://legislation.betterbarmm.com/how-parliament-works#the-bill-path',
							label: 'How a bill becomes law',
						},
						{ href: 'https://legislation.betterbarmm.com/about', label: 'Data' },
					],
				},
				{
					title: 'Sources',
					links: [
						{ href: 'https://parliament.bangsamoro.gov.ph/', label: 'Bangsamoro Parliament' },
						{ href: 'https://officialgazette.bangsamoro.gov.ph/', label: 'BARMM Official Gazette' },
					],
				},
			]}
			blurb={
				<>
					<span className='font-semibold text-[var(--ink)]'>AI-assisted analysis.</span> Summaries,
					classifications, and interface copy may be assisted by AI with human review. Verify legal
					details against the official Parliament or Gazette source before citation.
				</>
			}
			note='A public record of the Bangsamoro Parliament'
		/>
	)
}
