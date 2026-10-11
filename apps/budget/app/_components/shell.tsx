import { HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react/ssr'
import { CtaPanel, SiteFooter, UtilityBar } from '@betterbarmm/editorial'
import { Suspense } from 'react'
import { FISCAL_YEARS, LATEST_YEAR, budgetFor, sectors } from '@betterbarmm/budget-data'
import { FooterYear } from './footer-year'
import { BudgetFinder } from './budget-finder'
import { SiteNav } from './site-nav'
import { ThemeToggle } from './theme-toggle'

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
	/* Each Act's short title, so the footer can name the year it is showing
	   without the browser holding either Act to do it. */
	const acts = Object.fromEntries(FISCAL_YEARS.map((fy) => [String(fy), budgetFor(fy).budget.act]))

	// The five sectors the most money sits in. A more useful way back into the
	// workspace from a footer than a list of ministry names: it is what a
	// reader is looking for rather than who happens to hold it, and it avoids
	// the office whose name runs to seventy-six characters.
	const topSectors = sectors.slice(0, 5)

	return (
		<div className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<BudgetFinder>
				{/* The bar reads `?fy=` to say which year is showing and to keep the
				    year on every link out of it, which makes it a client component that
				    reads the query string. Next needs that behind a boundary, because
				    the 404 page is prerendered with no query string to read.

				    `null` rather than a barless copy of the nav: the fallback is only
				    ever seen on that one prerendered page, and a nav that renders twice
				    in two shapes is worse than one that arrives a frame late. */}
				{/* Above the boundary, not inside it. The strip reads no query
				    string, so there is no reason for it to wait on the one thing
				    here that does — inside the `Suspense` it prerendered as nothing
				    and arrived a frame late with the nav, which on this workspace
				    alone left the top of the page empty on first paint. */}
				<UtilityBar
					base='https://betterbarmm.com'
					current='budget'
					className='bb-strip bg-[var(--paper-2)]'
					switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
					end={
						<>
							<ThemeToggle />
							{/* Phones have no room for it in the strip; the wrapper hides it. */}
							<span className='hidden self-stretch sm:flex'>
								<a
									href='https://betterbarmm.com/contribute'
									target='_blank'
									rel='noreferrer'
									className='bb-btn bb-btn-accent !px-4 !py-0 !text-[9.5px]'
								>
									<HandHeartIcon size={13} weight='fill' aria-hidden='true' />
									Contribute
								</a>
							</span>
						</>
					}
				/>

				<Suspense fallback={null}>
					<SiteNav />
				</Suspense>
				<main>{children}</main>
			</BudgetFinder>

			{/* `cta-tight`: the panel pads itself with the estate's own section
			    rhythm; this puts it on the workspace's. */}
			<div className='cta-tight'>
				<CtaPanel />
			</div>

			<SiteFooter
				base='https://betterbarmm.com'
				columns={[
					{
						title: 'The budget',
						links: [
							{ href: 'https://budget.betterbarmm.com/sectors', label: 'By sector' },
							{ href: 'https://budget.betterbarmm.com/offices', label: 'All offices' },
							{ href: 'https://budget.betterbarmm.com/programs', label: 'Programs' },
							{ href: 'https://budget.betterbarmm.com/projects', label: 'Construction projects' },
							{ href: 'https://budget.betterbarmm.com/sources', label: 'Sources & downloads' },
						],
					},
					{
						title: 'Most spent on',
						links: topSectors.map((sector) => ({
							href: `https://budget.betterbarmm.com/sectors/${sector.slug}`,
							label: sector.name,
						})),
					},
				]}
				blurb='The enacted Bangsamoro budget, ministry by ministry: what each office was given, what it is meant to do with it, and what is being built. Trace every figure back to the Act it came from.'
				/* Both years' titles go down, and the footer picks the one the URL is
				   showing. The fallback is the latest year, which is what a page with
				   no `?fy=` is showing anyway. */
				note={
					<Suspense fallback={`${acts[String(LATEST_YEAR)]} · fiscal year ${LATEST_YEAR}`}>
						<FooterYear acts={acts} />
					</Suspense>
				}
				bottomRight={
					<Suspense fallback={`Compiled from ${acts[String(LATEST_YEAR)]}`}>
						<FooterYear acts={acts} prefix='Compiled from ' />
					</Suspense>
				}
			/>
		</div>
	)
}
