import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GUIDE_PAGES } from '../_lib/guide'
import { dishes, foodNotes, type FoodTradition } from '@betterbarmm/travel-data'
import { GuideLayout, GuideSection, TravelMasthead } from '../_components/travel-parts'
import { PhotoFigure } from '../_components/photo-figure'
import { photoForDish } from '../_lib/media'

export const metadata: Metadata = {
	title: 'Food',
	description:
		'What to eat in the Bangsamoro — palapa, pastil, piaparan, tiyula itum, satti and the rest. Maranao, Maguindanaon, Tausug, Sama and Yakan cooking, and how eating actually works here.',
}

/** The order traditions appear in, roughly by how much of the region cooks that way. */
const TRADITION_ORDER: FoodTradition[] = [
	'Maranao',
	'Maguindanaon',
	'Tausug',
	'Sama',
	'Yakan',
	'Iranun',
	'Shared',
]

export default function FoodPage() {
	if (!GUIDE_PAGES) notFound()
	const byTradition = TRADITION_ORDER.map((tradition) => ({
		tradition,
		list: dishes.filter((dish) => dish.tradition === tradition),
	})).filter((group) => group.list.length)

	return (
		<>
			<TravelMasthead
				kicker='The guide'
				name='Food'
				note='The best reason to come, and the least written-about food in the Philippines: halal, rich in coconut, turmeric and chilli, closer to Sabah and Sulawesi than to Luzon. There is no single Bangsamoro cuisine — each dish names whose it is.'
			/>

			{/* Plain reading (user decision): how eating works, then each tradition's dishes, in one column. */}
			<GuideLayout
				toc={[
					{ id: 'how-eating-works', title: 'How eating works' },
					...byTradition.map((g) => ({ id: g.tradition.toLowerCase(), title: g.tradition === 'Shared' ? 'Region-wide' : `${g.tradition} cooking` })),
					{ id: 'no-restaurants', title: 'Why no restaurants' },
				]}
			>
				<GuideSection id='how-eating-works' title='How eating here actually works'>
					{foodNotes.map((note) => (
						<div key={note.title}>
							<h3>{note.title}</h3>
							<p>{note.body}</p>
						</div>
					))}
				</GuideSection>

				{byTradition.map((group) => (
					<GuideSection
						key={group.tradition}
						id={group.tradition.toLowerCase()}
						title={group.tradition === 'Shared' ? 'Region-wide' : `${group.tradition} cooking`}
						lede={group.tradition === 'Shared' ? 'Made across the region under close variations of the same name.' : undefined}
					>
						{group.list.map((dish) => (
							<div key={dish.slug} id={dish.slug} className='scroll-mt-24'>
								<h3>
									{dish.name}
									{dish.essential ? <span className='font-normal text-[var(--ink-3)]'> · do not leave without it</span> : null}
								</h3>
								{photoForDish(dish.slug) ? (
									<div className='my-4'>
										<PhotoFigure photo={photoForDish(dish.slug)!} size='inset' />
									</div>
								) : null}
								<p>{dish.summary}</p>
								<p>{dish.detail}</p>
								<p>
									<strong className='font-semibold text-[var(--ink)]'>Where to find it:</strong> {dish.whereToFind}
								</p>
							</div>
						))}
					</GuideSection>
				))}

				<GuideSection id='no-restaurants' title='Why no restaurants are named'>
					<p>
						No restaurants are named and no prices are given. Places in this region open and close faster than a guide can
						track, and the best cooking is in markets and in houses in any case — so what is given is what to look for and
						roughly where that kind of place is, which stays true for longer than an address would.
					</p>
				</GuideSection>
			</GuideLayout>
		</>
	)
}
