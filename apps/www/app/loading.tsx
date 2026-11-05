'use client'

import { PageSkeleton } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'
import { SiteHeader } from './_components/site-header'

/* What a page shows while it streams in: its shape in grey (user decision), matched to the page coming — its band,
   its alignment, its padding. Each page draws its own header, so the skeleton does too, or the bar would vanish while
   the next page loads. A client component only to read the path: the front page, the directory, the news, the
   services and each explainer open on a centred band, every other page on a masthead ranged left. */
export default function Loading() {
	const path = usePathname()
	return (
		<>
			<SiteHeader />
			{path === '/' ? (
				<PageSkeleton center />
			) : path === '/directory' || path === '/news' ? (
				<PageSkeleton center pad='py-16 lg:py-24' />
			) : path === '/services' || path === '/services/lgu' ? (
				// The ways in under the words, not a field.
				<PageSkeleton center pad='py-16 lg:py-24' field='mt-8 h-[2.1rem] max-w-md rounded-full' />
			) : path.startsWith('/explainers/') ? (
				<PageSkeleton center pad='py-[clamp(3.75rem,7vw,6.5rem)]' field={false} />
			) : (
				<PageSkeleton />
			)}
		</>
	)
}
