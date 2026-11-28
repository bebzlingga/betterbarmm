import { HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react/ssr'
import { UtilityBar } from '@betterbarmm/editorial'
import { Suspense } from 'react'
import { BudgetFooter } from './budget-footer'
import { BudgetFinder } from './budget-finder'
import { SiteNav } from './site-nav'
import { ThemeToggle } from './theme-toggle'

/**
 * Every page in the workspace closes the same way: the ask on a warm band, then
 * the budget's own footer (user decision: the travel look).
 *
 * The finder wraps everything rather than sitting in the header, so "/" reaches
 * it from any page and the overlay is mounted once for the whole workspace
 * rather than once per route.
 */
export function Shell({ children }: { children: React.ReactNode }) {
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
					className='bb-strip site-strip bg-[var(--paper-2)]'
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
									className='bb-btn bb-btn-accent !px-4 !py-0 !text-[0.59375rem]'
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

			{/* The ask on a warm band, then the budget's footer, as travel's pages close (user decision: the travel look). */}
			<BudgetFooter />
		</div>
	)
}
