import { ArrowUpRightIcon, BedIcon, BowlFoodIcon, CalendarBlankIcon, MapPinIcon, NavigationArrowIcon, WarningCircleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { commonsThumb, cropStyle } from '../_lib/commons'
import { AREA, KIND_ONE, areaDishes, dishPhotoOf, eatPhotoOf, type FoodPhoto, areaLodging, nearby, staysNear, type Place } from '../_lib/places'
import { PlaceGallery } from './place-gallery'
import { photo as discoverPhoto } from './discover-media'
import { PhotoCredit } from './discover-figure'
import { PlaceCard } from './place-card'

/* One place, in the full-screen dialog over the catalogue, in the order a
   visitor reads a guide: its photograph with the name over it; the account of
   it beside a panel to plan the visit (getting there, when to go, before you
   go); what to do there; its photographs; what to eat and where to sleep; the
   sources; and what is nearby. */

/** The site's own photographs of a dish, from Discover BARMM, where there is one. */
const DISH_PHOTO = { pastil: 'pastil', 'tiyula-itum': 'tiyulaItum', palapa: 'paterPalapa' } as const
/** One shape for every food photograph: the site's own, then the food dataset's. */
type Shot = { src: string; page: string; credit: string; license: string; alt: string }
const asShot = (f: FoodPhoto | null): Shot | null => (f ? { src: commonsThumb(f.url, 500), page: f.page, credit: f.author, license: f.license, alt: f.caption } : null)
const dishPhoto = (slug: string): Shot | null => {
	if (slug in DISH_PHOTO) {
		const d = discoverPhoto(DISH_PHOTO[slug as keyof typeof DISH_PHOTO])
		return { src: d.src.src, page: d.source, credit: d.credit, license: d.license, alt: d.alt }
	}
	return asShot(dishPhotoOf(slug))
}

const label = 'font-mono text-[0.65625rem] font-semibold uppercase tracking-[0.14em]'
const site = (s: string) => {
	try {
		return new URL(s).hostname.replace(/^www\./, '')
	} catch {
		return s
	}
}

export function PlaceView({ p }: { p: Place }) {
	const hero = p.images[0]
	const dishesHere = areaDishes(p.area)
	const stays = staysNear(p)
	const lodgingHere = areaLodging(p.area)
	const near = nearby(p)
	// The place's own food first, then the area's dishes from the travel guide.
	const food = [...(p.eat ?? []).map((d) => ({ key: d.title, name: d.title, line: d.detail, who: p.municipality, photo: asShot(eatPhotoOf(p.slug, d.title)) })), ...dishesHere.map((d) => ({ key: d.slug, name: d.name, line: d.summary, who: d.tradition, photo: dishPhoto(d.slug) }))]
	return (
		<>
			<section className='bb-frame relative isolate flex min-h-[62dvh] items-end overflow-hidden bg-[#13303a] text-white'>
				{hero ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={commonsThumb(hero.url, 1280)} alt={hero.caption || p.name} style={cropStyle(hero, 16 / 9) ?? undefined} className='absolute inset-0 -z-10 size-full object-cover' />
				) : (
					<span aria-hidden='true' className='absolute inset-0 -z-10' style={{ background: `linear-gradient(135deg, ${p.colors.join(', ') || '#1f5a6b, #7fb3a8'})` }} />
				)}
				<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,20,26,0.88),rgba(8,20,26,0.35)_55%,rgba(8,20,26,0.1))]' />
				<div className='bb-container w-full pt-24 pb-10 sm:pb-14'>
					<p className={`${label} text-white/80`}>
						<Link href='/places' replace scroll={false} className='hover:text-white'>
							Places
						</Link>{' '}
						· {KIND_ONE[p.kind]}
					</p>
					<h1 className='mt-3 max-w-4xl text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem] lg:text-[4.5rem]'>{p.name}</h1>
					<p className='mt-3 flex items-center gap-1.5 text-[0.9375rem] text-white/85'>
						<MapPinIcon size={16} weight='fill' aria-hidden='true' /> {[p.municipality, AREA[p.area]].filter((x, i, a) => x && a.indexOf(x) === i).join(', ')}
					</p>
					{p.also_known_as?.length ? <p className='mt-1 text-[0.8125rem] text-white/70'>Also known as {p.also_known_as.join(', ')}</p> : null}
				</div>
				{hero ? <PhotoCredit photo={{ credit: hero.author, license: hero.license, source: hero.page }} /> : null}
			</section>

			{/* The account of the place, beside what a visitor needs to plan: how to get there, when, and what to know first. */}
			<section className='bb-container grid gap-12 pt-14 pb-6 lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)] lg:gap-20 lg:pt-20 lg:pb-8'>
				<div>
					<p className={`${label} text-[#1f6f78]`}>Overview</p>
					<p className='mt-3 text-[1.3125rem] font-semibold leading-[1.5] tracking-[-0.01em] text-[#13303a]'>{p.summary}</p>
					<div className='mt-6 space-y-4 text-[1rem] leading-[1.75] text-[#34505a]'>
						{p.detail.map((d) => (
							<p key={d}>{d}</p>
						))}
					</div>
				</div>
				{p.getting_there || p.best_time || p.before_you_go.length ? (
					<aside className='self-start bg-[#eef4f2] p-6 sm:p-8 lg:sticky lg:top-6'>
						<p className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>Plan your visit</p>
						<dl className='mt-5 space-y-6'>
							{p.getting_there ? (
								<div>
									<dt className={`${label} flex items-center gap-1.5 text-[#1f6f78]`}>
										<NavigationArrowIcon size={14} weight='fill' aria-hidden='true' /> Getting there
									</dt>
									<dd className='mt-2 text-[0.90625rem] leading-[1.65] text-[#34505a]'>{p.getting_there}</dd>
								</div>
							) : null}
							{p.best_time ? (
								<div>
									<dt className={`${label} flex items-center gap-1.5 text-[#1f6f78]`}>
										<CalendarBlankIcon size={14} weight='fill' aria-hidden='true' /> When to go
									</dt>
									<dd className='mt-2 text-[0.90625rem] leading-[1.65] text-[#34505a]'>{p.best_time}</dd>
								</div>
							) : null}
							{p.before_you_go.length ? (
								<div className='border-l-2 border-[#d9a441] pl-4'>
									<dt className={`${label} flex items-center gap-1.5 text-[#9a6a16]`}>
										<WarningCircleIcon size={14} weight='fill' aria-hidden='true' /> Before you go
									</dt>
									<dd>
										<ul className='mt-2 space-y-2 text-[0.875rem] leading-[1.6] text-[#34505a]'>
											{p.before_you_go.map((b) => (
												<li key={b}>{b}</li>
											))}
										</ul>
									</dd>
								</div>
							) : null}
						</dl>
					</aside>
				) : null}
			</section>

			{/* What to do there, numbered, across the page. */}
			{p.do?.length ? (
				<section aria-labelledby='do' className='bb-container py-10 lg:py-12'>
					<h2 id='do' className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>
						Things to do
					</h2>
					<ol className='mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'>
						{p.do.map((d, i) => (
							<li key={d.title} className='flex gap-4'>
								<span className='pt-0.5 font-mono text-[0.8125rem] font-semibold tabular-nums text-[#1f6f78]'>{String(i + 1).padStart(2, '0')}</span>
								<span className='min-w-0'>
									<span className='block text-[1rem] font-bold leading-snug text-[#13303a]'>{d.title}</span>
									<span className='mt-1 block text-[0.90625rem] leading-[1.6] text-[#4d6670]'>{d.detail}</span>
								</span>
							</li>
						))}
					</ol>
				</section>
			) : null}

			{/* Every photograph, each opening full size. */}
			{p.images.length > 1 ? (
				<section aria-labelledby='gallery' className='bb-container py-10 lg:py-12'>
					<h2 id='gallery' className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>
						Photographs
					</h2>
					<div className='mt-5'>
						<PlaceGallery images={p.images} name={p.name} />
					</div>
				</section>
			) : null}

			{/* What to eat, in the same grid as where to sleep. */}
			{food.length ? (
				<section aria-labelledby='food' className='bb-container py-10 lg:py-12'>
					<h2 id='food' className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>
						Food to try
					</h2>
					<ul className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
						{food.map((d) => (
							<li key={d.key} className='bb-frame relative bg-transparent!'>
								<span className='relative block aspect-[4/3] overflow-hidden bg-[#dfe9e6]'>
									{d.photo ? (
										<a href={d.photo.page} target='_blank' rel='noreferrer' title={`Photo: ${d.photo.credit}, ${d.photo.license}`}>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={d.photo.src} alt={d.photo.alt} loading='lazy' className='size-full object-cover' />
										</a>
									) : (
										<span className='grid size-full place-items-center bg-[linear-gradient(135deg,#e3efec,#cfe0dc)] text-[#1f6f78]'>
											<BowlFoodIcon size={28} weight='duotone' aria-hidden='true' />
										</span>
									)}
								</span>
								<span className='block pt-3'>
									{d.who ? <span className='font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.12em] text-[#1f6f78]'>{d.who}</span> : null}
									<span className='mt-0.5 block text-[0.90625rem] font-bold leading-snug text-[#13303a]'>{d.name}</span>
									<span className='mt-0.5 line-clamp-3 block text-[0.78125rem] leading-[1.5] text-[#4d6670]'>{d.line}</span>
									{d.photo ? <span className='mt-1 block text-[0.71875rem] text-[#7a8c92]'>Photo: {d.photo.credit}</span> : null}
								</span>
							</li>
						))}
					</ul>
					<p className='mt-3 text-[0.75rem] text-[#7a8c92]'>The food is halal. Named eateries come from dated listings, so check they are still open.</p>
				</section>
			) : null}

			{/* Where to sleep, shown only where there is somewhere listed: the guide's word on the area, then up to six places, each with its source. */}
			{stays.length ? (
				<section aria-labelledby='stay' className='bb-container py-10 lg:py-12'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
						<h2 id='stay' className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>
							Places to stay
						</h2>
						{lodgingHere ? <p className='max-w-2xl text-[0.84375rem] leading-[1.55] text-[#4d6670]'>{lodgingHere.booking}</p> : null}
					</div>
					<ul className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
							{stays.map((st) => (
								<li key={st.name + st.municipality} className='bb-frame relative bg-transparent!'>
									<span className='relative block aspect-[4/3] overflow-hidden bg-[#dfe9e6]'>
										{st.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={commonsThumb(st.image.url, 500)} alt='' loading='lazy' className='size-full object-cover' />
										) : (
											<span className='grid size-full place-items-center bg-[linear-gradient(135deg,#e3efec,#cfe0dc)] text-[#1f6f78]'>
												<BedIcon size={28} weight='duotone' aria-hidden='true' />
											</span>
										)}
										{st.image ? <PhotoCredit photo={{ credit: st.image.author, license: st.image.license, source: st.image.page }} /> : null}
									</span>
									<span className='block pt-3'>
										<span className='font-mono text-[0.59375rem] font-semibold uppercase tracking-[0.12em] text-[#1f6f78]'>
											{st.kind} · {st.municipality}
										</span>
										<span className='mt-0.5 block text-[0.90625rem] font-bold leading-snug text-[#13303a]'>{st.name}</span>
										<span className='mt-0.5 line-clamp-2 block text-[0.78125rem] leading-[1.5] text-[#4d6670]'>{st.note}</span>
										<a href={st.source} target='_blank' rel='noreferrer' className='mt-1 inline-flex items-center gap-0.5 text-[0.71875rem] text-[#7a8c92] hover:text-[#1f6f78]'>
											{st.accredited ? 'Accredited' : 'Named in'} {st.as_of.slice(0, 4)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
										</a>
									</span>
								</li>
							))}
						</ul>
					<p className='mt-3 text-[0.75rem] text-[#7a8c92]'>Each is named in an official or dated source; none could be checked against an accreditation list. No prices: rates change quickly, so confirm and book directly before you go.</p>
				</section>
			) : null}

			{/* Where every fact above was read. */}
			{p.sources.length ? (
				<section aria-label='Sources' className='bb-container pt-4 pb-14'>
					<p className='text-[0.8125rem] leading-[1.9] text-[#4d6670]'>
						<span className={`${label} mr-3 text-[#4d6670]`}>Sources</span>
						{p.sources.map((s, i) => (
							<span key={s}>
								{i ? <span className='mx-2 text-[#b5c6ca]'>·</span> : null}
								<a href={s} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 text-[#1f6f78] underline decoration-[#cfe0dc] underline-offset-4 hover:decoration-[#1f6f78]'>
									{site(s)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</span>
						))}
					</p>
				</section>
			) : null}

			{near.length ? (
				<section className='bg-[#eef4f2]'>
					<div className='bb-container py-16 lg:py-20'>
						<h2 className='text-[1.375rem] font-extrabold tracking-[-0.02em] text-[#13303a]'>Nearby and alike</h2>
						<ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							{near.map((n) => (
								<li key={n.slug}>
									<PlaceCard p={n} replace />
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}
		</>
	)
}
