import type { Metadata } from 'next'
import { OkirRule, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { dishes, foodNotes, type FoodTradition } from '@betterbarmm/travel-data'
import { TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'
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
	const byTradition = TRADITION_ORDER.map((tradition) => ({
		tradition,
		list: dishes.filter((dish) => dish.tradition === tradition),
	})).filter((group) => group.list.length)

	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>Food</TravelBreadcrumb>}
				kicker={`${dishes.length} things to eat`}
				name='Food'
				note='The best argument for coming here, and the least written-about food in the Philippines. It is halal, it is heavy on coconut and turmeric and chilli, and its nearest relatives are in Sabah and Sulawesi rather than in Luzon. There is no single Bangsamoro cuisine — each entry names whose it is.'
			/>

			{/* ---- How eating works ------------------------------------------ */}
			<section className='bb-section'>
				<div className='bb-container'>
					<SectionHead
						index='01'
						eyebrow='Before the dishes'
						title='How eating here'
						titleMuted='actually works.'
						size='sm'
					/>

					<div className='mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2 xl:grid-cols-3'>
						{foodNotes.map((note) => (
							<div key={note.title}>
								<p className='item-title'>{note.title}</p>
								<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{note.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---- The dishes ------------------------------------------------ */}
			{byTradition.map((group, index) => (
				<section
					key={group.tradition}
					id={group.tradition.toLowerCase()}
					className={`bb-section ${index % 2 === 0 ? 'bb-section-top' : ''}`}
				>
					<div className='bb-container'>
						<SectionHead
							index={String(index + 2).padStart(2, '0')}
							eyebrow={
								group.tradition === 'Shared'
									? 'Made across the region under close variations of the same name'
									: `${group.tradition} cooking`
							}
							title={group.tradition === 'Shared' ? 'Region-wide' : group.tradition}
							titleMuted={`${group.list.length} ${group.list.length === 1 ? 'dish' : 'dishes'}`}
							size='sm'
						/>

						<Stagger className='mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
							{group.list.map((dish) => (
								<StaggerItem key={dish.slug}>
									<article id={dish.slug} className='tv-card h-full'>
										{photoForDish(dish.slug) ? (
											<div className='mb-5'>
												<PhotoFigure photo={photoForDish(dish.slug)!} size='inset' />
											</div>
										) : null}
										{dish.essential ? (
											<span className='badge badge-plain !text-[9.5px] self-start'>
												Do not leave without
											</span>
										) : null}

										<h3 className={`item-title-lg ${dish.essential ? 'mt-3' : ''}`}>{dish.name}</h3>

										<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--brass)]'>
											{dish.summary}
										</p>

										<p className='mt-4 flex-1 text-[14px] leading-7 text-[var(--ink-2)]'>
											{dish.detail}
										</p>

										<div className='mt-5 border-t border-[var(--rule-soft)] pt-4'>
											<p className='bb-label'>Where to find it</p>
											<p className='mt-2 text-[13px] leading-6 text-[var(--ink-3)]'>
												{dish.whereToFind}
											</p>
										</div>
									</article>
								</StaggerItem>
							))}
						</Stagger>
					</div>
				</section>
			))}

			<section className='bb-section'>
				<div className='bb-container'>
					<OkirRule />
					<p className='mt-8 max-w-3xl text-[14px] leading-7 text-[var(--ink-3)]'>
						No restaurants are named and no prices are given. Places in this region open and close
						faster than a guide can track, and the best cooking is in markets and in houses in any
						case — so what is given is what to look for and roughly where that kind of place is,
						which stays true for longer than an address would.
					</p>
				</div>
			</section>
		</>
	)
}
