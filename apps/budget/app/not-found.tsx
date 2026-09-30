import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { FISCAL_YEARS, budget } from '@betterbarmm/budget-data'

export const metadata: Metadata = {
	title: 'Page not found',
	description: 'That address is not in the Act. Where to look instead.',
}

/* ============================================================
   404

   Two things land a reader here, and only one of them is a
   mistyped address. The other is the year switch: an office
   page is the office as that Act has it, so a ministry created
   in FY 2023 has no page under `?fy=2020`, and following the
   year menu off one is a 404 on a slug that is perfectly real
   in the year it came from. That is the first thing this page
   says, because it is the one a reader can act on — the same
   address in another year is a page.

   On the paper, centerd, and not on the crimson masthead every
   other page opens with (user decision): the band is the head of
   a document, and this is not the head of anything.

   Plain `Link`, not `YearLink`. This page is prerendered with
   no query string to read — the same reason the nav sits behind
   a Suspense boundary in the shell.
   ============================================================ */

export default function NotFound() {
	return (
		/* Set by eye rather than to the workspace's band (user decision): the block
		   sits nearer the nav than a masthead would and carries its air underneath,
		   where the closing panel's own rhythm adds to it. */
		<section className='bb-container pb-24 pt-24 text-center lg:pb-40 lg:pt-36'>
			<p className='bb-label'>404</p>

			{/* No measure on it: the claim is 32 characters and the container is wide
			    enough to hold them on one row (user decision), so a `max-w` here was
			    the only thing breaking it in two. It still wraps on a phone, where
			    one row would mean setting a display line at body size. */}
			<h1 className='bb-display-md mt-6 text-[var(--ink)] lg:whitespace-nowrap'>
				That address is not <span className='bb-mute'>in this Act.</span>
			</h1>

			<p className='mx-auto mt-7 max-w-2xl text-[15px] leading-8 text-[var(--ink-2)]'>
				Nothing has been taken down. Every figure the {FISCAL_YEARS.length} Acts carry is still here
				— but each page is one Act, so an office or sector that a later Act created has no page in
				an earlier one, and a link carrying a <code className='money'>?fy=</code> from elsewhere can
				land on a year that never held it. The latest Act, FY {budget.fiscalYear}, is below.
			</p>

			<div className='mt-9 flex flex-wrap items-center justify-center gap-3'>
				<Link href='/' className='bb-btn bb-btn-solid'>
					All {FISCAL_YEARS.length} years
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</Link>
				<Link href='/offices' className='bb-btn bb-btn-ghost'>
					Every office
				</Link>
				<Link href='/sectors' className='bb-btn bb-btn-ghost'>
					Every sector
				</Link>
				<Link href='/sources' className='bb-btn bb-btn-ghost'>
					Sources
				</Link>
			</div>
		</section>
	)
}
