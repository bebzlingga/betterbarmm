import Link from 'next/link'
import type { Metadata } from 'next'
import { LineReveal, OkirRule, Rise, SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import {
	areaPoints,
	dishes,
	essentialDishes,
	festivals,
	itineraries,
	places,
	planSections,
	signaturePlaces,
	travelAreas,
} from '@betterbarmm/travel-data'
import { Caution, Footing, PlaceCard } from './_components/travel-parts'
import { TravelMap } from './_components/travel-map'
import { PhotoFigure } from './_components/photo-figure'
import { photo, photoForDish, photoForPlace } from './_lib/media'

export const metadata: Metadata = {
	title: 'Traveling the Bangsamoro',
	description:
		'A written guide to the seven areas of BARMM — what there is to see, what to eat, where lodging actually exists, and an honest account of the security picture in each.',
}

const areaNames = new Map(travelAreas.map((area) => [area.slug, area.name]))

export default function TravelHome() {
	const essentials = essentialDishes()
	const signatures = signaturePlaces()

	return (
		<>
			{/* ---- Masthead ------------------------------------------------- */}
			<section className='bb-lattice relative overflow-hidden'>

				<div className='bb-container relative pb-20 pt-16 lg:pb-24 lg:pt-20'>
					<Rise distance={12}>
						<span className='bb-label'>The Bangsamoro, for visitors</span>
					</Rise>

					<LineReveal
						lines={['Seven areas,', 'and how to travel them.']}
						delay={0.06}
						className='bb-display mt-6 text-[var(--ink)]'
					/>

					<Rise delay={0.25} distance={14}>
						<p className='bb-lede mt-8 max-w-3xl'>
							The oldest mosque in the country, a sandbar that runs for kilometers, a lake old enough
							to have evolved its own fish, and the best food in the Philippines that nobody writes
							about. BARMM is also the part of the country most often described from a distance and
							least often described accurately — so this guide states what it knows, names what it
							does not, and never averages the region into a single answer.
						</p>
					</Rise>

					<Rise delay={0.4} distance={14}>
						<div className='mt-10 flex flex-wrap gap-3'>
							<Link href='/plan' className='bb-btn bb-btn-solid'>
								Plan a trip
							</Link>
							<Link href='/places' className='bb-btn bb-btn-ghost'>
								{places.length} places
							</Link>
							<Link href='/routes' className='bb-btn bb-btn-ghost'>
								{itineraries.length} routes
							</Link>
							<Link href='/food' className='bb-btn bb-btn-ghost'>
								{dishes.length} things to eat
							</Link>
						</div>
					</Rise>

					<Rise delay={0.5} distance={16}>
						<div className='mt-14 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end'>
							<PhotoFigure photo={photo('budBongao')} priority />
							<PhotoFigure photo={photo('panampangan')} size='inset' />
						</div>
					</Rise>
				</div>

				<div className='bb-weave' aria-hidden='true' />
			</section>

			{/* ---- What this is, and is not --------------------------------- */}
			<section className='bb-section'>
				<div className='bb-container'>
					<div className='grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16'>
						<div>
							<SectionHead
								index='01'
								eyebrow='Before you read any of it'
								title='This one is written,'
								titleMuted='not captured.'
								size='sm'
							/>
							<div className='bb-prose mt-6 max-w-2xl'>
								<p>
									Everywhere else on this estate is a record. Parliament&rsquo;s measures, COMELEC&rsquo;s
									canvass, PSA&rsquo;s census — captured from the body that published it, and traceable
									back to it.
								</p>
								<p>
									Nobody publishes an official inventory of what there is to see in the Bangsamoro,
									what is worth eating, or where a traveler can sleep. So this workspace is written
									from general knowledge of the region rather than taken from a source, and it is
									held to the rules that follow from that: no invented prices, no phone numbers, no
									opening hours, and no establishment endorsed. Where a figure would help and is not
									reliably known, the text says what is known instead.
								</p>
								<p>
									The geography underneath it is not invented. Every place names the municipality it
									sits in, and those come from the same local government dataset the{' '}
									<a href='https://lgu.betterbarmm.com' className='rule-link'>
										directory
									</a>{' '}
									is built on.
								</p>
							</div>
						</div>

						<div className='grid content-start gap-5'>
							<Caution label='Security, in one line'>
								The situation varies more between these seven areas than most countries vary
								internally. Cotabato City on an ordinary Tuesday and an interior municipality of
								Maguindanao del Sur are not the same question. Every area page carries its own
								account, and{' '}
								<Link href='/plan#safety' className='rule-link'>
									the planning page
								</Link>{' '}
								explains the protocol residents themselves use.
							</Caution>

							<Caution label='Sulu is not here'>
								The Supreme Court removed Sulu from BARMM in 2024, so it is not one of the seven areas
								below. It borders this guide&rsquo;s subject on every side and appears in it only where
								the history or the food genuinely crosses over — marked each time it does.
							</Caution>
						</div>
					</div>
				</div>
			</section>

			{/* ---- The seven areas ------------------------------------------ */}
			<section className='bb-section bb-section-top'>
				<div className='bb-container'>
					<SectionHead
						index='02'
						eyebrow='Start here'
						title='The seven areas,'
						titleMuted='and what each one asks of you.'
						lead='They are BARMM’s own divisions and the same ones the local government directory uses. The badge on each says how settled travel actually is there — which is a statement about infrastructure and coordination, not a danger rating.'
					/>

					<div className='mt-12 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-14'>
						<TravelMap
							points={areaPoints}
							caption='The seven areas. The spread is the point — Bongao is roughly 600 km from Marawi, and they are reached through different cities on different islands. Approximate coordinates with a true scale bar; there is no coastline because this site holds none it can vouch for. Not for navigation.'
						/>

						<div className='bb-prose'>
							<p>
								Nothing about this region is compact. Tawi-Tawi sits closer to Borneo than to any
								Philippine city of size; Lanao del Sur is highland country reached overland from
								Iligan; the Maguindanao provinces and Cotabato City are a river delta in between. A
								trip that tries to take in all of it spends most of itself in transit.
							</p>
							<p>
								So the useful unit is the area, and the honest advice is to pick one.{' '}
								<Link href='/routes' className='rule-link'>
									The routes
								</Link>{' '}
								are built that way.
							</p>
						</div>
					</div>

					<Stagger className='mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
						{travelAreas.map((area) => (
							<StaggerItem key={area.slug}>
								<Link href={`/${area.slug}`} className='tv-card h-full'>
									<Footing footing={area.footing} />

									<h3 className='item-title-lg mt-4'>{area.name}</h3>

									<p className='mt-3 flex-1 text-[14px] leading-7 text-[var(--ink-2)]'>
										{area.tagline}
									</p>

									<p className='mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
										Base · {area.base}
									</p>
								</Link>
							</StaggerItem>
						))}
					</Stagger>
				</div>
			</section>

			{/* ---- Signature places ----------------------------------------- */}
			<section className='bb-section'>
				<div className='bb-container'>
					<SectionHead
						index='03'
						eyebrow='If you only do a few things'
						title='The ones worth'
						titleMuted='crossing the country for.'
						aside={
							<Link href='/places' className='rule-link-quiet'>
								All {places.length} places
							</Link>
						}
					/>

					<Stagger className='mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
						{signatures.map((place) => {
							const image = photoForPlace(place.slug)
							return (
								<StaggerItem key={place.slug}>
									<div className='grid h-full content-start gap-5'>
										{image ? <PhotoFigure photo={image} size='inset' /> : null}
										<PlaceCard place={place} areaName={areaNames.get(place.area)} />
									</div>
								</StaggerItem>
							)
						})}
					</Stagger>
				</div>
			</section>

			{/* ---- Food ------------------------------------------------------ */}
			<section className='bb-section bb-section-top'>
				<div className='bb-container'>
					<SectionHead
						index='04'
						eyebrow='The reason to come back'
						title='Halal, coconut-heavy,'
						titleMuted='and closer to Sabah than to Manila.'
						lead='There is no pork and there is no single Bangsamoro cuisine — Maranao, Maguindanaon, Tausug, Sama and Yakan cooking are related and distinct. Start with these.'
						aside={
							<Link href='/food' className='rule-link-quiet'>
								The food guide
							</Link>
						}
					/>

					<Stagger className='mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
						{essentials.map((dish) => {
							const image = photoForDish(dish.slug)
							return (
								<StaggerItem key={dish.slug}>
									<div className='grid h-full content-start gap-5'>
										{image ? <PhotoFigure photo={image} size='inset' /> : null}
										<article className='tv-card'>
											<span className='tv-kind'>{dish.tradition}</span>
											<h3 className='item-title-lg mt-3'>{dish.name}</h3>
											<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{dish.summary}</p>
										</article>
									</div>
								</StaggerItem>
							)
						})}
					</Stagger>
				</div>
			</section>

			{/* ---- Planning -------------------------------------------------- */}
			<section className='bb-section'>
				<div className='bb-container'>
					<SectionHead
						index='05'
						eyebrow='The practical half'
						title='Getting there, getting it right,'
						titleMuted='and what to do when the signal goes.'
						aside={
							<Link href='/plan' className='rule-link-quiet'>
								Plan a trip
							</Link>
						}
					/>

					<OkirRule className='mt-10' />

					<div className='mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 xl:grid-cols-4'>
						{planSections.map((section) => (
							<Link key={section.slug} href={`/plan#${section.slug}`} className='group'>
								<p className='bb-label'>{section.title}</p>
								<p className='mt-3 text-[14px] leading-7 text-[var(--ink-2)]'>{section.lede}</p>
							</Link>
						))}
					</div>

					<div className='mt-14 border-t border-[var(--brass-line)] pt-10'>
						<p className='bb-label'>What is on</p>
						<div className='mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-3'>
							{festivals.map((festival) => (
								<div key={festival.name}>
									<p className='item-title'>{festival.name}</p>
									<p className='mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brass)]'>
										{festival.when}
									</p>
									<p className='mt-2.5 text-[13.5px] leading-6 text-[var(--ink-3)]'>{festival.what}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
