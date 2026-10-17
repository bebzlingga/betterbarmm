import { ArrowUpRightIcon, BedIcon, BowlFoodIcon, CalendarBlankIcon, CompassIcon, MapPinIcon, NavigationArrowIcon, WarningCircleIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { commonsThumb, cropStyle } from '../_lib/commons'
import { AREA, KIND_ONE, areaDishes, areaLodging, nearby, staysNear, type Place } from '../_lib/places'
import { PlaceGallery } from './place-gallery'
import { photo as discoverPhoto } from './discover-media'
import { PhotoCredit } from './discover-figure'
import { PlaceCard } from './place-card'

/* One place, in the full-screen dialog over the catalogue: its photograph
   across the top with the name over it, then what is there beside how to go
   and when to go, what to do and eat there and what to know first. Then its
   photographs, each opening full size, and what is nearby. */

/** The site's own photographs of a dish, from Discover BARMM, where there is one. */
const DISH_PHOTO = { pastil: 'pastil', 'tiyula-itum': 'tiyulaItum', palapa: 'paterPalapa' } as const
const dishPhoto = (slug: string) => (slug in DISH_PHOTO ? discoverPhoto(DISH_PHOTO[slug as keyof typeof DISH_PHOTO]) : null)

const label = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'
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
	const food = [...(p.eat ?? []).map((d) => ({ key: d.title, name: d.title, line: d.detail, who: p.municipality, photo: null })), ...dishesHere.map((d) => ({ key: d.slug, name: d.name, line: d.summary, who: d.tradition, photo: dishPhoto(d.slug) }))]
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
					<h1 className='mt-3 max-w-4xl text-[40px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[60px] lg:text-[72px]'>{p.name}</h1>
					<p className='mt-3 flex items-center gap-1.5 text-[15px] text-white/85'>
						<MapPinIcon size={16} weight='fill' aria-hidden='true' /> {[p.municipality, AREA[p.area]].filter((x, i, a) => x && a.indexOf(x) === i).join(', ')}
					</p>
					{p.also_known_as?.length ? <p className='mt-1 text-[13px] text-white/70'>Also known as {p.also_known_as.join(', ')}</p> : null}
				</div>
				{hero ? <PhotoCredit photo={{ credit: hero.author, license: hero.license, source: hero.page }} /> : null}
			</section>

			<section className='bb-container grid gap-12 py-14 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:gap-20 lg:py-20'>
				<div>
					<p className='text-[21px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#13303a]'>{p.summary}</p>
					<div className='mt-6 space-y-4 text-[16px] leading-[1.75] text-[#34505a]'>
						{p.detail.map((d) => (
							<p key={d}>{d}</p>
						))}
					</div>
				</div>
				<aside className='space-y-8'>
					{p.getting_there ? (
						<div>
							<p className={`${label} flex items-center gap-1.5 text-[#1f6f78]`}>
								<NavigationArrowIcon size={14} weight='fill' aria-hidden='true' /> Getting there
							</p>
							<p className='mt-2 text-[14.5px] leading-[1.65] text-[#34505a]'>{p.getting_there}</p>
						</div>
					) : null}
					{p.best_time ? (
						<div>
							<p className={`${label} flex items-center gap-1.5 text-[#1f6f78]`}>
								<CalendarBlankIcon size={14} weight='fill' aria-hidden='true' /> When to go
							</p>
							<p className='mt-2 text-[14.5px] leading-[1.65] text-[#34505a]'>{p.best_time}</p>
						</div>
					) : null}
					{p.do?.length ? (
						<div>
							<p className={`${label} flex items-center gap-1.5 text-[#1f6f78]`}>
								<CompassIcon size={14} weight='fill' aria-hidden='true' /> Things to do
							</p>
							<ul className='mt-2 space-y-2.5 text-[14.5px] leading-[1.6] text-[#34505a]'>
								{p.do.map((d) => (
									<li key={d.title}>
										<span className='font-semibold text-[#13303a]'>{d.title}.</span> {d.detail}
									</li>
								))}
							</ul>
						</div>
					) : null}
					{p.before_you_go.length ? (
						<div className='border-l-2 border-[#d9a441] pl-4'>
							<p className={`${label} flex items-center gap-1.5 text-[#9a6a16]`}>
								<WarningCircleIcon size={14} weight='fill' aria-hidden='true' /> Before you go
							</p>
							<ul className='mt-2 space-y-2 text-[14px] leading-[1.6] text-[#34505a]'>
								{p.before_you_go.map((b) => (
									<li key={b}>{b}</li>
								))}
							</ul>
						</div>
					) : null}
					{p.sources.length ? (
						<div>
							<p className={`${label} text-[#4d6670]`}>Read more</p>
							<ul className='mt-2 space-y-1 text-[13px]'>
								{p.sources.map((s) => (
									<li key={s}>
										<a href={s} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[#1f6f78] underline decoration-[#cfe0dc] underline-offset-4 hover:decoration-[#1f6f78]'>
											{site(s)} <ArrowUpRightIcon size={11} weight='bold' aria-hidden='true' />
										</a>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</aside>
			</section>


			{/* What to eat, in the same grid as where to sleep. */}
			{food.length ? (
				<section aria-labelledby='food' className='bb-container pb-14'>
					<h2 id='food' className='text-[22px] font-extrabold tracking-[-0.02em] text-[#13303a]'>
						Food to try <span className='text-[#8aa3a9]'>{food.length}</span>
					</h2>
					<ul className='mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
						{food.map((d) => (
							<li key={d.key} className='bb-frame relative bg-transparent!'>
								<span className='relative block aspect-[4/3] overflow-hidden bg-[#dfe9e6]'>
									{d.photo ? (
										<a href={d.photo.source} target='_blank' rel='noreferrer' title={`Photo: ${d.photo.credit}, ${d.photo.license}`}>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={d.photo.src.src} alt={d.photo.alt} loading='lazy' className='size-full object-cover' />
										</a>
									) : (
										<span className='grid size-full place-items-center bg-[linear-gradient(135deg,#e3efec,#cfe0dc)] text-[#1f6f78]'>
											<BowlFoodIcon size={28} weight='duotone' aria-hidden='true' />
										</span>
									)}
								</span>
								<span className='block pt-3'>
									{d.who ? <span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#1f6f78]'>{d.who}</span> : null}
									<span className='mt-0.5 block text-[14.5px] font-bold leading-snug text-[#13303a]'>{d.name}</span>
									<span className='mt-0.5 line-clamp-3 block text-[12.5px] leading-[1.5] text-[#4d6670]'>{d.line}</span>
									{d.photo ? <span className='mt-1 block text-[11.5px] text-[#7a8c92]'>Photo: {d.photo.credit}</span> : null}
								</span>
							</li>
						))}
					</ul>
					<p className='mt-3 text-[12px] text-[#7a8c92]'>The food is halal. Named eateries come from dated listings, so check they are still open.</p>
				</section>
			) : null}

			{/* Where to sleep, shown only where there is somewhere listed: the guide's word on the area, then up to six places, each with its source. */}
			{stays.length ? (
				<section aria-labelledby='stay' className='bb-container pb-14'>
					<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
						<h2 id='stay' className='text-[22px] font-extrabold tracking-[-0.02em] text-[#13303a]'>
							Places to stay <span className='text-[#8aa3a9]'>{stays.length}</span>
						</h2>
						{lodgingHere ? <p className='max-w-2xl text-[13.5px] leading-[1.55] text-[#4d6670]'>{lodgingHere.booking}</p> : null}
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
										<span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#1f6f78]'>
											{st.kind} · {st.municipality}
										</span>
										<span className='mt-0.5 block text-[14.5px] font-bold leading-snug text-[#13303a]'>{st.name}</span>
										<span className='mt-0.5 line-clamp-2 block text-[12.5px] leading-[1.5] text-[#4d6670]'>{st.note}</span>
										<a href={st.source} target='_blank' rel='noreferrer' className='mt-1 inline-flex items-center gap-0.5 text-[11.5px] text-[#7a8c92] hover:text-[#1f6f78]'>
											{st.accredited ? 'Accredited' : 'Named in'} {st.as_of.slice(0, 4)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
										</a>
									</span>
								</li>
							))}
						</ul>
					<p className='mt-3 text-[12px] text-[#7a8c92]'>Each is named in an official or dated source; none could be checked against an accreditation list. No prices: rates change quickly, so confirm and book directly before you go.</p>
				</section>
			) : null}

			{/* Every photograph, each opening full size. */}
			{p.images.length > 1 ? (
				<section aria-labelledby='gallery' className='bb-container pb-14'>
					<h2 id='gallery' className='text-[22px] font-extrabold tracking-[-0.02em] text-[#13303a]'>
						Photographs <span className='text-[#8aa3a9]'>{p.images.length}</span>
					</h2>
					<div className='mt-5'>
						<PlaceGallery images={p.images} name={p.name} />
					</div>
				</section>
			) : null}

			{near.length ? (
				<section className='bg-[#eef4f2]'>
					<div className='bb-container py-16 lg:py-20'>
						<h2 className='text-[22px] font-extrabold tracking-[-0.02em] text-[#13303a]'>Nearby and alike</h2>
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
