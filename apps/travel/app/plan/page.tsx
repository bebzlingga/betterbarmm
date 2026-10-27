import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDE_PAGES } from '../_lib/guide'
import { festivals, planSections } from '@betterbarmm/travel-data'
import { GuideLayout, GuideSection, TravelMasthead } from '../_components/travel-parts'
import { photo, type TravelPhotoKey } from '../_lib/media'

/** The sections a photograph helps, and which: the arrival city, a mosque for manners, the sandbar for the season. */
const SECTION_PHOTO: Record<string, TravelPhotoKey> = { 'getting-here': 'cotabatoPlaza', etiquette: 'marawiGrandMosque', 'when-to-go': 'panampangan' }

export const metadata: Metadata = {
	title: 'Plan a trip',
	description:
		'Getting to BARMM, the security picture area by area, manners in a Muslim region, when to go, money and connectivity, language, permissions, and health.',
}

/* Plan a trip, as plain reading (user decision): each topic a heading and its text in one column, with no summary
   boxes, maps or tables beside it. The text is the guide's own, unchanged. */
export default function PlanPage() {
	if (!GUIDE_PAGES) notFound()
	return (
		<>
			<TravelMasthead
				kicker='The guide'
				name='Plan a trip'
				note='The practical half of the guide, and the answers to the questions a first-time visitor actually asks — several of which nobody publishes a straight answer to.'
			/>

			<GuideLayout
				toc={[
					...planSections.map((s) => ({ id: s.slug, title: s.title })),
					{ id: 'calendar', title: 'The calendar' },
					{ id: 'before-you-go', title: 'Before you go' },
				]}
			>
				{planSections.map((section) => (
					<GuideSection
						key={section.slug}
						id={section.slug}
						title={section.title}
						lede={section.lede}
						photo={SECTION_PHOTO[section.slug] ? photo(SECTION_PHOTO[section.slug]!) : undefined}
					>
						{section.body.map((paragraph) => (
							<p key={paragraph.slice(0, 40)}>{paragraph}</p>
						))}
						{section.slug === 'safety' ? (
							<p>
								The picture differs from one area to the next, so each area&rsquo;s own page carries its own:{' '}
								<Link href='/' className='rule-link'>
									start from the places
								</Link>
								, or open an area from the menu.
							</p>
						) : null}
					</GuideSection>
				))}

				<GuideSection
					id='calendar'
					title='The calendar'
					photo={photo('singkil')}
					lede='The Islamic observances carry no fixed date because they have none — the Hijri calendar is lunar and shifts about 11 days earlier each Gregorian year. The civil festivals are fixed and are given their month.'
				>
					{festivals.map((festival) => (
						<div key={festival.name}>
							<h3>
								{festival.name} <span className='font-normal text-[var(--ink-3)]'>· {festival.when}</span>
							</h3>
							<p>{festival.what}</p>
						</div>
					))}
				</GuideSection>

				<GuideSection id='before-you-go' title='Before you go'>
					<p>
						Nothing here is legal, medical or security advice, and none of it has been verified on the ground. Advisories
						change, roads change, and the person in the town you are going to knows more than this page does. Where a
						decision matters, this guide points at who publishes the current position rather than paraphrasing it into
						staleness.
					</p>
					<p>
						Signal disappears on the outer islands and thins on the Lake Lanao circuit. Leave your route and your expected
						return with someone before you lose it, rather than after — and contact the area&rsquo;s tourism office, which is
						normal courtesy here and is the single most useful thing a visitor can do.
					</p>
				</GuideSection>
			</GuideLayout>
		</>
	)
}
