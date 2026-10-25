import { AREA, KIND, byPhoto, place, places } from '../_lib/places'
import { commonsThumb } from '../_lib/commons'
import { PhotoCredit } from './discover-figure'
import { GetInvolved } from './get-involved'
import { PlaceCard } from './place-card'
import { PlacesBrowser, type PlaceIndex } from './places-browser'
import { SiteHeader } from './site-header'

/** The catalogue. It lives in the places layout, so it stays put, scrolled where the reader left it, while a place opens over it. */
export function PlacesCatalogue() {
	const kinds = (Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => ({ k, list: byPhoto(places.filter((p) => p.kind === k)) })).filter((x) => x.list.length)
	const cover = place('panampangan-island')?.images[0] ?? place('bud-bongao')?.images[0]
	const areas = new Set(places.map((p) => p.area)).size
	// The kinds in the order they are listed, photographed places first within each; the cards drawn here, the filtering in the browser.
	const ordered = kinds.flatMap(({ list }) => list)
	const index: PlaceIndex[] = ordered.map((p) => ({
		slug: p.slug,
		kind: p.kind,
		area: p.area,
		text: [p.name, ...(p.also_known_as ?? []), p.municipality, AREA[p.area], KIND[p.kind], p.summary].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
	}))
	const cards = Object.fromEntries(ordered.map((p) => [p.slug, <PlaceCard key={p.slug} p={p} />]))

	return (
		<main className='min-h-screen bg-[#f6f9f8] text-[#13303a]'>
			<SiteHeader activeItem='places' />

			<section className='bb-frame relative isolate overflow-hidden bg-[#13303a] text-white'>
				{cover ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={commonsThumb(cover.url, 1280)} alt='' className='absolute inset-0 -z-10 size-full object-cover' />
				) : null}
				<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(8,26,32,0.92),rgba(8,26,32,0.6)_55%,rgba(8,26,32,0.2))]' />
				<div className='bb-container py-24 lg:py-32'>
					<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9fd6cf]'>
						{places.length} places · {areas} areas
					</p>
					{/* One line at every width, sized to the screen. */}
					<h1 className='mt-3 text-[clamp(1.75rem,6vw,5rem)] font-extrabold leading-[1] tracking-[-0.035em] whitespace-nowrap'>Places of the Bangsamoro</h1>
					<p className='mt-5 max-w-xl text-[17px] leading-[1.6] text-white/85'>
						Islands and white sand, lakes in the highlands, mosques, falls and the old forts and houses of the sultanates: what is there, how to get there, and what to know before you go.
					</p>
				</div>
				{cover ? <PhotoCredit photo={{ credit: cover.author, license: cover.license, source: cover.page }} /> : null}
			</section>

			<div className='bb-container pt-14 pb-20 lg:pt-16 lg:pb-28'>
				<PlacesBrowser
					index={index}
					cards={cards}
					kinds={kinds.map(({ k }) => ({ id: k, label: KIND[k] }))}
					areas={Object.entries(AREA)
						.filter(([id]) => places.some((p) => p.area === id))
						.map(([id, label]) => ({ id, label }))}
				/>
				<p className='mt-16 text-[12.5px] leading-[1.7] text-[#4d6670]'>
					Every place is traced to the pages it came from, and the guide’s own entries are the travel workspace’s. Photos are from Wikimedia Commons or English Wikipedia under free licences, each credited on the photo. {Object.keys(AREA).length} areas: Basilan, Lanao del Sur, Maguindanao del Norte and del Sur, Tawi-Tawi, Cotabato City and the Special Geographic Area.
				</p>
			</div>
			<GetInvolved />
		</main>
	)
}
