import { lguProvinces } from '@betterbarmm/lgu-data'
import type { Metadata } from 'next'
import { AreaFinder } from '../_components/area-finder'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'My area',
	description: 'Pick your town or city in the Bangsamoro: its officials and member of Parliament, its tax allotment, what its government is buying, and the laws that name it.',
	path: '/my-area',
})

export default function MyAreaIndex() {
	const areas = lguProvinces.map((p) => ({
		slug: p.slug,
		name: p.name,
		units: p.municipalities.map((m) => ({ slug: m.slug, name: m.name })),
	}))
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='my-area' />
			<Masthead
				brand
				label='My area'
				lines={['Your town,', 'on one page.']}
				muted={[1]}
				size='display'
				standfirst='Who governs it and who represents it in Parliament, the money it gets, what its government is buying, and the laws and resolutions that name it — gathered from every workspace.'
			/>
			<section className='bb-container bb-section'>
				<AreaFinder areas={areas} />
			</section>
		</main>
	)
}
