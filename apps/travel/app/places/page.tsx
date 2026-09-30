import Link from 'next/link'
import type { Metadata } from 'next'
import { SectionHead, Stagger, StaggerItem } from '@betterbarmm/editorial'
import {
	places,
	PLACE_KIND_LABEL,
	pointForArea,
	pointsInArea,
	travelAreas,
	type PlaceKind,
} from '@betterbarmm/travel-data'
import { Caution, GateList, TravelBreadcrumb, TravelMasthead } from '../_components/travel-parts'
import { TravelMap } from '../_components/travel-map'
import { PhotoFigure } from '../_components/photo-figure'
import { photoForPlace } from '../_lib/media'

export const metadata: Metadata = {
	title: 'Places',
	description:
		'Everything worth going to see across the seven areas of BARMM — sacred sites, coast, landscape, craft towns and recent history, each with what has to be arranged before you go.',
}

/**
 * Grouped by area rather than by kind.
 *
 * Kind is the more interesting axis and the wrong one to organize by: nobody
 * plans a trip around visiting three waterfalls in three provinces. A traveler
 * is in one area at a time, so that is the grouping, and the kind rides along
 * on each entry.
 */
export default function PlacesPage() {
	const byArea = travelAreas
		.map((area) => ({ area, list: places.filter((place) => place.area === area.slug) }))
		.filter((group) => group.list.length)

	const kinds = [...new Set(places.map((place) => place.kind))] as PlaceKind[]

	return (
		<>
			<TravelMasthead
				breadcrumb={<TravelBreadcrumb>Places</TravelBreadcrumb>}
				kicker={`${places.length} places · ${byArea.length} areas`}
				name='Places'
				note='Grouped by area, because that is how a trip is actually made. Each entry says what is there and what has to be arranged, permitted or dressed for before you go — and nothing here carries an opening time or a fee, because those are the fields a guide gets wrong first.'
			>
				<div className='mt-10 flex flex-wrap gap-2 border-t border-[var(--brass-line)] pt-8'>
					{kinds.map((kind) => (
						<span key={kind} className='bb-chip'>
							{PLACE_KIND_LABEL[kind]}
						</span>
					))}
				</div>
			</TravelMasthead>

			{byArea.map((group, index) => (
				<section
					key={group.area.slug}
					id={group.area.slug}
					className={`bb-section ${index % 2 === 1 ? 'bb-section-top' : ''}`}
				>
					<div className='bb-container'>
						<SectionHead
							index={String(index + 1).padStart(2, '0')}
							eyebrow={group.area.tagline}
							title={group.area.name}
							titleMuted={`${group.list.length} ${group.list.length === 1 ? 'place' : 'places'}`}
							aside={
								<Link href={`/${group.area.slug}`} className='rule-link-quiet'>
									The area guide
								</Link>
							}
							size='sm'
						/>

						<div className='mt-10'>
							<TravelMap
								points={
									pointsInArea(group.area.slug).length
										? pointsInArea(group.area.slug)
										: [pointForArea(group.area.slug)!].filter(Boolean)
								}
								caption={`Where these places sit in ${group.area.name}. Approximate coordinates with a true scale bar; not for navigation.`}
							/>
						</div>

						<Stagger className='mt-10 grid gap-8'>
							{group.list.map((place) => (
								<StaggerItem key={place.slug}>
									<article
										id={place.slug}
										className='grid gap-8 border-t border-[var(--brass-line)] pt-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14'
									>
										<div>
											<div className='flex flex-wrap items-center gap-x-3 gap-y-1.5'>
												<span className='tv-kind'>{PLACE_KIND_LABEL[place.kind]}</span>
												{place.signature ? (
													<span className='badge badge-plain !text-[9.5px]'>Signature</span>
												) : null}
												<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
													{place.municipality}
												</span>
											</div>

											<h3 className='section-title-sm mt-3'>{place.name}</h3>

											{place.alsoKnownAs?.length ? (
												<p className='mt-1.5 text-[13px] italic text-[var(--ink-3)]'>
													Also {place.alsoKnownAs.join(', ')}
												</p>
											) : null}

											<div className='bb-prose mt-5'>
												{place.detail.map((paragraph) => (
													<p key={paragraph.slice(0, 40)}>{paragraph}</p>
												))}
											</div>
										</div>

										<div className='grid content-start gap-8 lg:pt-10'>
											{photoForPlace(place.slug) ? (
												<PhotoFigure photo={photoForPlace(place.slug)!} size='inset' />
											) : null}
											<GateList label='Before you go' items={place.beforeYouGo} />
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
					<Caution label='What is not on this list'>
						A place is here only if it could be described concretely. Plenty of the region is worth
						seeing and is not written up below — beaches nobody has named, towns with one good
						reason to stop, the whole interior of Lanao del Sur. An entry that reduced to
						&ldquo;a beautiful beach&rdquo; would be a placeholder rather than information, so it was
						left out. Ask locally; the answers are better than any list.
					</Caution>
				</div>
			</section>
		</>
	)
}
