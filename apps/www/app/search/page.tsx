import type { Metadata } from 'next'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { SiteSearch } from '../_components/site-search'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Search',
	description: 'Search every BetterBARMM workspace at once: towns and barangays, laws and resolutions, members of Parliament, budget offices, and procurement offices and suppliers.',
	path: '/search',
})

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const { q } = await searchParams
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />
			<Masthead brand label='Search' lines={['Everything,', 'in one box.']} muted={[1]} size='display' />
			<section className='bb-container bb-section'>
				<SiteSearch initial={q ?? ''} />
			</section>
		</main>
	)
}
