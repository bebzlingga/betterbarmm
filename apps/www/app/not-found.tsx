import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from './_components/masthead'
import { SiteHeader } from './_components/site-header'

export const metadata: Metadata = {
	title: 'Page not found — BetterBARMM',
	description: 'That address does not exist here. Where to go instead.',
}

/* ============================================================
   404

   A page that is missing on a records site is a different thing
   from a page that is missing on a shop. A reader who lands here
   was usually following a link to a specific record — from a story,
   a document, or their own notes — so the page says plainly that
   the address is wrong rather than that something broke, and hands
   them the three doors that do exist.
   ============================================================ */

export default function NotFound() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />

			<Masthead
				label='404'
				lines={['That address is not', 'part of this record.']}
				muted={[1]}
				standfirst='The page may have moved, or the link may have been mistyped. Nothing has been taken down: every record this site has published is still here under some address, and the three below are the ways back into it.'
			>
				<Link href='/' className='bb-btn bb-btn-solid'>
					Back to the front page
					<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
				</Link>
				<Link href='/discover' className='bb-btn bb-btn-ghost'>
					Discover BARMM
				</Link>
				<Link href='/contribute' className='bb-btn bb-btn-ghost'>
					Report a broken link
				</Link>
			</Masthead>
		</main>
	)
}
