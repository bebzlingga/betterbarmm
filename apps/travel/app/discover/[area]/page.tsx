import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CraftsCulture } from '../../_components/crafts-culture'
import { findTravelArea, travelAreas } from '@betterbarmm/travel-data'
import { eatsInArea, explorePlaces, staysInArea, type ExplorePlace } from '@betterbarmm/travel-data/explore'
import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	CompassIcon,
	MapPinIcon,
	NavigationArrowIcon,
	PathIcon,
	SunHorizonIcon,
	TranslateIcon,
} from '@phosphor-icons/react/ssr'
import { Credit, PlaceCard, SeeAllCard } from '../../_components/discover-card'
import { Rail } from '../../_components/rail'
import { StayCard } from '../../_components/stay-card'
import { commonsSrcSet, commonsThumb } from '../../_lib/commons'
import { DESTINATIONS, findDestination, type Shot } from '../../_lib/discover'

/* ============================================================
   Discover: one destination, shown the way a travel app shows it
   (user decision) — a full-width photograph that turns, the area's
   name over it, then rails of its places, its crafts, where to eat and
   sleep, and the practical half at the foot.

   Every word is the guide's own (`travel-data`) and every picture is
   one of the area's places', credited where it shows. Nothing here
   is a rating, a price or an availability: none of those exist.
   ============================================================ */

export function generateStaticParams() {
	return DESTINATIONS.map(({ slug }) => ({ area: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
	const { area: slug } = await params
	const area = findTravelArea(slug)
	if (!area || !findDestination(slug)) return { title: 'Not found' }
	return { title: `Discover ${area.name}`, description: `${area.tagline} The places, crafts, food and stays of ${area.name}, and what to know before you go.` }
}

type Photo = { src: string; srcSet?: string; place: ExplorePlace; author: string; license: string; page: string }

/** A place's photograph at the width asked for, with its credit; none where the place or the picture is missing. */
function shot({ place: slug, image }: Shot, w: 960 | 1280 | 1920): Photo | null {
	const place = explorePlaces.find((p) => p.slug === slug)
	const img = place?.images[image]
	return place && img ? { src: commonsThumb(img.url, w, img.width), srcSet: w === 1920 ? commonsSrcSet(img.url, img.width) : undefined, place, author: img.author, license: img.license, page: img.page } : null
}

export default async function DiscoverPage({ params }: { params: Promise<{ area: string }> }) {
	const { area: slug } = await params
	const area = findTravelArea(slug)
	const destination = findDestination(slug)
	if (!area || !destination) notFound()

	const places = explorePlaces.filter((p) => p.area === slug)
	const photographed = places.filter((p) => p.images.length)
	const hero = destination.hero.map((s) => shot(s, 1920)).filter((p): p is Photo => Boolean(p))
	const feature = destination.feature ? shot(destination.feature, 1920) : null
	const eats = eatsInArea(slug)
	const stays = staysInArea(slug)
	const bestTime = area.whenToGo.split(/(?<=\.)\s/)[0]!
	// The intro's first sentence leads, set large; the rest of that paragraph follows it in the columns.
	const [lead = '', ...more] = area.intro[0]!.split(/(?<=[.!?])\s+(?=[A-Z])/)
	const rest = more.join(' ')
	const others = travelAreas.filter((a) => a.slug !== slug)


	return (
		<div className='dv'>
			{/* ---- The header: the area's photographs, turning, under its name ---- */}
			<header className='dv-hero'>
				{hero.map((photo, i) => (
					<figure key={photo.src} className='dv-slide' style={{ '--i': i, '--n': hero.length } as React.CSSProperties}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img decoding='async' src={photo.src} srcSet={photo.srcSet} sizes='100vw' alt={`${photo.place.name}, ${photo.place.municipality}`} fetchPriority={i === 0 ? 'high' : 'low'} className='dv-slide-img' />
					</figure>
				))}
				<span aria-hidden='true' className='dv-hero-shade' />
				{/* Each photograph's name and credit, bottom right, above the shade and turning with its photograph. */}
				{hero.map((photo, i) => (
					<p key={photo.src} data-first={i === 0 || undefined} className='dv-slide-cap dv-cap' style={{ '--i': i, '--n': hero.length } as React.CSSProperties}>
						<Link href={`/places/${photo.place.slug}`} className='inline-flex items-center gap-1.5 font-semibold text-white/60 hover:text-white'>
							<MapPinIcon size={14} weight='fill' aria-hidden='true' />
							{photo.place.name}
						</Link>
						<Credit photo={photo} className='!bg-transparent !p-0 !text-white/40 hover:!text-white/80' />
					</p>
				))}

				<div className='bb-container relative flex min-h-[inherit] flex-col justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-24'>
					{destination.seal ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img decoding='async' src={destination.seal} alt={`Seal of ${area.name}`} className='size-28 drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] md:size-36' />
					) : null}
					{/* The name in the colours of the province's own cloth (user decision), then a strip of it woven. */}
					<h1 className='dv-hero-title' style={destination.weave ? ({ '--w1': destination.weave.colors[0], '--w2': destination.weave.colors[1], '--w3': destination.weave.colors[2], '--w4': destination.weave.colors[3] } as React.CSSProperties) : undefined}>
						<span className={destination.weave ? 'dv-woven-text' : undefined}>{area.name}</span>
					</h1>
					{destination.weave ? (
						<a href={destination.weave.href} className='group mt-5 inline-flex w-fit items-center gap-3 text-[0.8125rem] text-white/75 hover:text-white'>
							<span
								aria-hidden='true'
								className='dv-weave h-3 w-56 rounded-full'
								style={{ '--w1': destination.weave.colors[0], '--w2': destination.weave.colors[1], '--w3': destination.weave.colors[2], '--w4': destination.weave.colors[3] } as React.CSSProperties}
							/>
							{destination.weave.label}
						</a>
					) : null}
					<p className='mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-white/90 md:text-[1.1875rem]'>{area.tagline}</p>
					<div className='mt-8 flex flex-wrap gap-3'>
						<a href='#places' className='dv-btn dv-btn-light'>
							<CompassIcon size={18} weight='bold' aria-hidden='true' />
							Explore {places.length} {places.length === 1 ? 'place' : 'places'}
						</a>
						<a href='#know' className='dv-btn dv-btn-glass'>
							<PathIcon size={18} weight='bold' aria-hidden='true' />
							Plan the trip
						</a>
					</div>
				</div>

			</header>


			{/* ---- Overview (user decision: redesigned): the intro's first sentence as a statement, the rest beside the quick
			    facts, then what the area is known for as a numbered row. ---- */}
			<section id='overview' className='dv-section bb-container'>
				<p className='dv-eyebrow'>Welcome to {area.name}</p>
				<p className='mt-5 max-w-5xl !font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.2vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-[var(--ink)]'>
					{lead}
				</p>

				<div className='mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20'>
					<div className='gap-10 space-y-5 text-[1rem] leading-[1.8] text-[var(--ink-2)] md:columns-2 md:space-y-0 [&>p]:mb-5 [&>p]:break-inside-avoid'>
						{[rest, ...area.intro.slice(1)].filter(Boolean).map((p) => (
							<p key={p.slice(0, 40)}>{p}</p>
						))}
					</div>

					<dl className='divide-y divide-[var(--rule)] self-start border-y border-[var(--rule)]'>
						{[
							{ icon: SunHorizonIcon, label: 'Best time', value: bestTime },
							{ icon: NavigationArrowIcon, label: 'Base yourself', value: area.base },
							{ icon: TranslateIcon, label: 'Languages', value: area.languages.join(', ') },
						].map(({ icon: Glyph, label, value }) => (
							<div key={label} className='flex gap-4 py-4'>
								<Glyph size={22} weight='duotone' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
								<div>
									<dt className='text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)]'>{label}</dt>
									<dd className='mt-1 text-[0.9375rem] leading-snug text-[var(--ink)]'>{value}</dd>
								</div>
							</div>
						))}
					</dl>
				</div>

				<h2 className='mt-16 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Known for</h2>
				{/* One row at a wide screen, however many lines the area has. */}
				<ol className={`mt-4 grid gap-4 sm:grid-cols-2 ${['lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5'][Math.min(Math.max(area.knownFor.length, 2), 5) - 2]}`}>
					{area.knownFor.map((k, n) => {
						// Each line on a photograph of a place it names (user decision); the place is named on the tile.
						const k1 = destination.knownFor?.[n]
						const photo = k1 ? shot(k1, 960) : null
						return photo ? (
							<li key={k} className='group relative isolate flex min-h-[17rem] flex-col overflow-hidden rounded-[var(--dv-r)] p-6 text-white'>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img decoding='async' src={photo.src} alt='' loading='lazy' className='dv-card-img' />
								<span aria-hidden='true' className='dv-card-shade' />
								<span className='font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-[#f1c453]'>
									{String(n + 1).padStart(2, '0')}
								</span>
								<p className='mt-auto font-[family-name:var(--font-display)] text-[1.1875rem] font-bold leading-snug'>{k}</p>
								<Link href={`/places/${photo.place.slug}`} className='mt-1.5 inline-flex w-fit items-center gap-1 text-[0.75rem] text-white/65 hover:text-white'>
									<MapPinIcon size={12} weight='fill' aria-hidden='true' />
									{photo.place.name}
								</Link>
								<Credit photo={photo} className='dv-card-credit absolute right-0 top-0 z-[1]' />
							</li>
						) : (
							<li key={k} className='rounded-[var(--dv-r)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--paper))] p-6'>
								<span className='font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>
									{String(n + 1).padStart(2, '0')}
								</span>
								<p className='mt-4 font-[family-name:var(--font-display)] text-[1.0625rem] font-bold leading-snug text-[var(--ink)]'>{k}</p>
							</li>
						)
					})}
				</ol>
			</section>

			{/* ---- The places: by kind, then the photographed ones on a rail ---- */}
			<div id='places' className='scroll-mt-[calc(var(--sticky-top)+4rem)] border-t border-[var(--rule)]'>
				<Rail title='Places worth the journey' lede={`${photographed.length} of the ${places.length} places in ${area.name}, in pictures.`}>
					{photographed.map((p) => (
						<PlaceCard key={p.slug} place={p} />
					))}
					<SeeAllCard href={`/?area=${slug}`} title={`See all ${places.length}`} note='On the map and in the list' places={photographed.slice(4)} />
				</Rail>
			</div>

			{/* ---- One place at the full width ---- */}
			{feature ? (
				<section className='dv-feature'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img decoding='async' src={feature.src} srcSet={feature.srcSet} sizes='100vw' alt={`${feature.place.name}, ${feature.place.municipality}`} loading='lazy' className='absolute inset-0 -z-10 size-full object-cover' />
					<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,12,18,0.85)_0%,rgba(6,12,18,0.45)_55%,rgba(6,12,18,0.1)_100%)]' />
					<div className='bb-container py-24 md:py-32'>
						<p className='dv-eyebrow !text-[#f1c453]'>Don’t miss</p>
						<h2 className='mt-4 max-w-xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white'>
							{feature.place.name}
						</h2>
						<p className='mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/85'>{feature.place.summary}</p>
						{feature.place.best_time ? (
							<p className='mt-4 flex max-w-lg items-start gap-2 text-[0.9375rem] text-white/80'>
								<SunHorizonIcon size={18} weight='duotone' className='mt-0.5 shrink-0 text-[#f1c453]' aria-hidden='true' />
								{feature.place.best_time}
							</p>
						) : null}
						<Link href={`/places/${feature.place.slug}`} className='dv-btn dv-btn-light mt-8'>
							See the place
							<ArrowUpRightIcon size={18} weight='bold' aria-hidden='true' />
						</Link>
					</div>
					<Credit photo={feature} className='absolute bottom-3 right-4' />
				</section>
			) : null}


			{/* ---- The area's peoples, crafts and craft festivals (user decision: connect the crafts and cultures) ---- */}
			<CraftsCulture area={slug} areaName={area.name} />

			{/* ---- Where to eat and where to sleep ---- */}
			{eats.length || stays.length ? (
			<div id='eat-stay' className='tv-wash scroll-mt-[calc(var(--sticky-top)+4rem)]'>
				{eats.length ? (
					<Rail title='Where to eat' lede={destination.eat ?? 'Halal kitchens and cafés, named where a public source names them.'}>
						{eats.map((e) => (
							<ul key={e.name} className='dv-rail-item'>
								<StayCard stay={e} />
							</ul>
						))}
					</Rail>
				) : null}
				{stays.length ? (
					<>
					{/* A rule between the two rails, at the page's width. */}
					{eats.length ? <div aria-hidden='true' className='bb-container'><div className='border-t border-[var(--rule)]' /></div> : null}
					<Rail title='Where to stay' lede={destination.stay ?? 'Named where a public source names them; ask the place directly.'}>
						{stays.map((s) => (
							<ul key={s.name} className='dv-rail-item'>
								<StayCard stay={s} />
							</ul>
						))}
					</Rail>
					</>
				) : null}
			</div>
			) : null}

			{/* ---- Two promotions side by side (user decision): the area's travel guide, and the calendar ---- */}
			<section className='bb-container grid gap-4 py-[clamp(4.5rem,9vw,8rem)] lg:grid-cols-2'>
				<Link href={`/guide/${slug}`} className='group flex items-center justify-between gap-6 rounded-[1.75rem] bg-[var(--ink)] p-8 text-[var(--paper)] md:p-10'>
					<span>
						<span className='block text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#f1c453]'>Before you go</span>
						<span className='mt-2 block font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-tight tracking-[-0.025em]'>
							The {area.name} travel guide
						</span>
						<span className='mt-2 block text-[0.9375rem] leading-relaxed opacity-75'>Getting there and around, where to sleep, when to go, the security picture and the trips worth taking.</span>
					</span>
					<span className='grid size-14 shrink-0 place-items-center rounded-full bg-[var(--paper)] text-[var(--ink)] transition group-hover:translate-x-1'>
						<ArrowRightIcon size={22} weight='bold' aria-hidden='true' />
					</span>
				</Link>
				<Link href='/calendar' className='group flex items-center justify-between gap-6 rounded-[1.75rem] bg-[var(--accent)] p-8 text-white md:p-10'>
					<span>
						<span className='block text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#f1c453]'>What’s on</span>
						<span className='mt-2 block font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold leading-tight tracking-[-0.025em]'>
							The year in {area.name}
						</span>
						<span className='mt-2 block text-[0.9375rem] leading-relaxed opacity-80'>Its festivals, the founding anniversaries of its towns, and the best months to go, on the Bangsamoro calendar.</span>
					</span>
					<span className='grid size-14 shrink-0 place-items-center rounded-full bg-white text-[var(--accent)] transition group-hover:translate-x-1'>
						<ArrowRightIcon size={22} weight='bold' aria-hidden='true' />
					</span>
				</Link>
			</section>



			{/* ---- Where next: the other areas as photo cards, each on one of its own places' photographs ---- */}
			<section className='dv-section tv-wash-flip'>
				<div className='bb-container'>
					<h2 className='dv-title'>Where next</h2>
					<p className='dv-lede'>The rest of the Bangsamoro, area by area.</p>
					<div className='mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{others.map((a) => {
							const own = explorePlaces.filter((p) => p.area === a.slug)
							const cover = own.find((p) => p.images.length)?.images[0]
							return (
								<div key={a.slug} className='dv-town group !min-h-[17rem]'>
									{cover ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img decoding='async' src={commonsThumb(cover.url, 960, cover.width)} alt='' loading='lazy' className='dv-card-img' />
									) : null}
									<span aria-hidden='true' className='dv-card-shade' />
									<span className='dv-chip absolute left-5 top-5'>
										{own.length} {own.length === 1 ? 'place' : 'places'}
									</span>
									<span className='absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/90 text-[#10161b] opacity-0 transition group-hover:opacity-100'>
										<ArrowUpRightIcon size={16} weight='bold' aria-hidden='true' />
									</span>
									<span className='absolute inset-x-0 bottom-0 p-7'>
										<Link href={findDestination(a.slug) ? `/discover/${a.slug}` : `/${a.slug}`} className='block font-[family-name:var(--font-display)] text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-white after:absolute after:inset-0'>{a.name}</Link>
										<span className='mt-1 line-clamp-2 text-[0.84375rem] leading-snug text-white/80'>{a.tagline}</span>
									</span>
								{cover ? <Credit photo={cover} className='dv-card-credit absolute bottom-0 right-0 z-[1]' /> : null}
								</div>
							)
						})}
					</div>
				</div>
			</section>
		</div>
	)
}
