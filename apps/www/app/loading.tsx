'use client'

import { PageSkeleton } from '@betterbarmm/editorial'
import { usePathname } from 'next/navigation'
import { SiteHeader } from './_components/site-header'
import {
	ArticleSkeleton,
	ChapterSkeleton,
	DirectorySkeleton,
	DiscoverSkeleton,
	ExplainersSkeleton,
	HomeSkeleton,
	NewsSkeleton,
} from './_components/page-skeletons'

/* What a page shows while it streams in: its shape in grey (user decision), matched to the page coming — its band,
   its alignment, its padding, and for the main pages their structure and placement (user decision), block for block. Each page draws its own header, so the skeleton does too, or the bar would vanish while
   the next page loads. A client component only to read the path: the front page, the directory, the news, the
   services and each explainer open on a centred band, every other page on a masthead ranged left. */
export default function Loading() {
	const path = usePathname()
	// The pages drawn in their own shape (page-skeletons.tsx); every other page on the shared one.
	const own =
		path === '/' ? <HomeSkeleton />
		: path === '/discover' ? <DiscoverSkeleton />
		: path.startsWith('/discover/') ? <ChapterSkeleton />
		: path === '/news' ? <NewsSkeleton />
		: path === '/explainers' ? <ExplainersSkeleton />
		: path.startsWith('/explainers/') ? <ArticleSkeleton />
		: path === '/directory' ? <DirectorySkeleton />
		: null
	return (
		<>
			<SiteHeader activeItem={path.startsWith('/discover') ? 'discover' : undefined} />
			{own ??
				(path === '/services' || path === '/services/lgu' ? (
					// The ways in under the words, not a field.
					<PageSkeleton center pad='py-16 lg:py-24' field='mt-8 h-[2.1rem] max-w-md rounded-full' />
				) : (
					<PageSkeleton />
				))}
		</>
	)
}
