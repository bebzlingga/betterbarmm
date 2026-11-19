import type { Metadata } from 'next'
import Link from 'next/link'
import { travelAreas } from '@betterbarmm/travel-data'
import { eatsNote, exploreEats } from '@betterbarmm/travel-data/explore'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { StayCard } from '../_components/stay-card'
import { SectionHead, TravelMasthead } from '../_components/travel-parts'

export const metadata: Metadata = {
	title: 'Halal places to eat',
	description: 'Halal restaurants, cafés, bakeries and eateries across the Bangsamoro, area by area, each with its source and when it was last seen open.',
}

/* The places to eat (user decision: a section for halal restaurants and the like), area by area in the guide's order,
   as the cards the stays use. Sourced, in datasets/places/eats.json. */
export default function EatPage() {
	const byArea = travelAreas.map((area) => ({ area, eats: exploreEats.filter((eat) => eat.area === area.slug) })).filter((g) => g.eats.length)
	const certified = exploreEats.filter((eat) => eat.halal === 'certified').length

	return (
		<>
			<TravelMasthead
				kicker='Where to eat'
				name='Halal places to eat'
				note={`${exploreEats.length} restaurants, cafés, bakeries and eateries across ${byArea.length} areas${certified ? `, ${certified} of them halal-certified` : ''}. Each one was seen open in a recent post or report; confirm before you go.`}
			/>

			<section>
				<div className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
					{byArea.map(({ area, eats }, index) => (
						<div key={area.slug} id={area.slug} className={`scroll-mt-24 ${index ? 'mt-20' : ''}`}>
							<SectionHead
								title={area.name}
								aside={
									<Link href={`/${area.slug}`} className='group inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-3)] hover:text-[var(--accent)]'>
										The {area.name} guide
										<ArrowRightIcon size={13} weight='bold' className='transition group-hover:translate-x-0.5' aria-hidden='true' />
									</Link>
								}
							/>
							<ul className='mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[48px]'>
								{eats.map((eat) => (
									<StayCard key={eat.name} stay={eat} />
								))}
							</ul>
						</div>
					))}

					{/* Full width (user decision): what the list is and what "halal" means on it. */}
					<p className='mt-20 border-t border-[var(--rule)] pt-6 text-[0.8125rem] leading-[1.7] text-[var(--ink-3)]'>
						{eatsNote} “Halal-certified” means a source names a certification; “Halal” means a source says the place is halal,
						pork-free or Muslim-run; a place with neither may well be halal, but no source this list found says so. No prices,
						hours or ratings are given.
					</p>
				</div>
			</section>
		</>
	)
}
