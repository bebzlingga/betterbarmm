import type { Metadata } from 'next'
import { AccidentMap } from '../_components/accident-map'
import { AccidentOpener } from '../_components/accident-opener'
import { SiteHeader } from '../_components/site-header'
import { accidents, accidentsMeta } from '../_lib/accidents'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Accidents',
	description:
		'Road crashes, sea mishaps, fires, shootings and other incidents across the Bangsamoro since 2025, mapped from the news reports that covered them, with the dead and injured counted and every report linked.',
	path: '/accidents',
})

export default function AccidentsPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='accidents' />

			{/* The band opens straight on the map's door — the same ground and
			    seam the masthead would have drawn, with nothing else in it. */}
			<section className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative w-full'>
					<AccidentOpener incidents={accidents} />
				</div>
				<div className='bb-weave' aria-hidden='true' />
			</section>

			<section id='accident-map' className='bb-container bb-section scroll-mt-[var(--site-header-h)]'>
				<AccidentMap incidents={accidents} />

				<p className='mt-16 text-[13px] leading-[1.7] text-[var(--ink-3)]'>
					{accidentsMeta.note}{' '}Shootings are the one deliberate kind carried; bombings and clan feuds are not. A dot sits on the barangay the report named where it could be located, otherwise on the town&rsquo;s centre; a report that named only the province sits faintly at the province&rsquo;s centre and adds nothing to the heat. Figures are as the last report gave them. Headlines belong to their outlets; BetterBARMM links to them and does not reproduce
					the stories. Sulu left the region in 2024 and is not mapped. Know of an accident that is missing or wrong?{' '}
					<a href='/report' className='underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
						Tell us
					</a>
					.
				</p>
			</section>
		</main>
	)
}
