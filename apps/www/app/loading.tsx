'use client'

import { PageSkeleton } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'
import { SiteHeader } from './_components/site-header'

/* What a page shows while it streams in: its shape in grey (user decision), matched to the page coming — its band,
   its alignment, its padding. Each page draws its own header, so the skeleton does too, or the bar would vanish while
   the next page loads. A client component only to read the path: the front page and the directory open on a centred
   band with a search field in it, every other page on a masthead ranged left. */
export default function Loading() {
	const path = usePathname()
	return (
		<>
			<SiteHeader />
			{path === '/' ? (
				<PageSkeleton center />
			) : path === '/directory' ? (
				<PageSkeleton center pad='py-16 lg:py-24' />
			) : (
				<PageSkeleton />
			)}
		</>
	)
}
