import type { Metadata } from 'next'
import { AccidentMap } from '../_components/accident-map'
import { AccidentOpener } from '../_components/accident-opener'
import { SiteHeader } from '../_components/site-header'
import { accidents, accidentsMeta } from '../_lib/accidents'
import { pageMeta } from '../_lib/seo'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'Incident Watch',
	description:
		'Road crashes, sea mishaps, fires, shootings and other incidents across the Bangsamoro since 2019, mapped from the news reports that covered them, with the dead and injured counted and every report linked.',
	path: '/incidents',
})

export default function AccidentsPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='accidents' />

			{/* The page opens straight on the map's door, in the photograph header. */}
			<AccidentOpener />

			<section id='accident-map' className='bb-container pb-24 pt-14 lg:pb-32 lg:pt-20'>
				<AccidentMap incidents={accidents} />

				<p className='mt-16 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
					{accidentsMeta.note}{' '}Shootings are the one deliberate kind carried, those of clan wars and armed clashes included; bombings are not. The years before 2022 are thinly covered: fewer of their reports were indexed, so a quiet year on the map was not necessarily a quiet year. A dot sits on the barangay the report named where it could be located, otherwise on the town&rsquo;s centre; a report that named only the province sits faintly at the province&rsquo;s main town and adds nothing to the heat. Figures are as the last report gave them. Headlines belong to their outlets; BetterBARMM links to them and does not reproduce
					the stories. Sulu left the region in 2024 and is not mapped. Know of an accident that is missing or wrong?{' '}
					<a href='/report' className='underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--accent)]'>
						Tell us
					</a>
					.
				</p>
			</section>
			<GetInvolved />
		</main>
	)
}
