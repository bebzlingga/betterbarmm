'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from './_components/site-header'
import {
	ArticleSkeleton,
	CardsSkeleton,
	ChapterSkeleton,
	DirectorySkeleton,
	FilterRowSkeleton,
	DiscoverSkeleton,
	ExplainersSkeleton,
	HeroSkeleton,
	HomeSkeleton,
	NewsSkeleton,
} from './_components/page-skeletons'

/* What a page shows while it streams in: its shape in grey (user decision), matched to the page coming, block for
   block. Each page draws its own header, so the skeleton does too, or the bar would vanish while the next page loads.
   Every page now opens on the photograph header (the travel look), so the skeleton does too, dark, under the clear
   bars. A client component only to read the path. */
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
		: path === '/directory' || path.startsWith('/directory/') ? <DirectorySkeleton />
		: null
	// Every other page opens on the photograph header: centred where the page is a front door (services, about,
	// contact, contribute: PageBand), ranged left elsewhere (Masthead), then its body as rounded cards.
	const centred = ['/services', '/services/lgu', '/about', '/contact', '/contribute'].includes(path)
	const services = path === '/services' || path === '/services/lgu'
	return (
		<>
			<SiteHeader activeItem={path.startsWith('/discover') ? 'discover' : undefined} />
			{own ?? (
				<div role='status'>
					<span className='sr-only'>Loading…</span>
					<HeroSkeleton center={centred} field={services} chips={centred ? 4 : 0} />
					{services ? <FilterRowSkeleton /> : null}
					<CardsSkeleton />
				</div>
			)}
		</>
	)
}
