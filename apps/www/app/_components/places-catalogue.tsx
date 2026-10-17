import { WarningCircleIcon } from '@phosphor-icons/react/ssr'
import { AREA, KIND, byPhoto, place, places } from '../_lib/places'
import { commonsThumb } from '../_lib/commons'
import { PhotoCredit } from './discover-figure'
import { GetInvolved } from './get-involved'
import { PlaceCard } from './place-card'
import { SiteHeader } from './site-header'

/** The catalogue. It lives in the places layout, so it stays put, scrolled where the reader left it, while a place opens over it. */
export function PlacesCatalogue() {
	const kinds = (Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => ({ k, list: byPhoto(places.filter((p) => p.kind === k)) })).filter((x) => x.list.length)
	const cover = place('panampangan-island')?.images[0] ?? place('bud-bongao')?.images[0]
	const areas = new Set(places.map((p) => p.area)).size

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
					<h1 className='mt-3 max-w-3xl text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-[64px] lg:text-[76px]'>
						Places of the
						<br />
						Bangsamoro
					</h1>
					<p className='mt-5 max-w-xl text-[17px] leading-[1.6] text-white/85'>
						Islands and white sand, lakes in the highlands, mosques, falls and the old forts and houses of the sultanates: what is there, how to get there, and what to know before you go.
					</p>
				</div>
				{cover ? <PhotoCredit photo={{ credit: cover.author, license: cover.license, source: cover.page }} /> : null}
			</section>

			<div className='bb-container pt-12'>
				<p className='flex max-w-4xl gap-3 border-l-2 border-[#d9a441] pl-4 text-[14px] leading-[1.6] text-[#34505a]'>
					<WarningCircleIcon size={18} weight='fill' className='mt-0.5 shrink-0 text-[#9a6a16]' aria-hidden='true' />
					<span>
						Several governments advise against travel to parts of Mindanao, including much of BARMM. Check your government’s current advice, go with someone local, and confirm a place is open before you set out.
					</span>
				</p>
			</div>

			<div className='bb-container pt-14 pb-20 lg:pt-16 lg:pb-28'>
				{kinds.map(({ k, list }) => (
					<section key={k} id={k} aria-labelledby={`h-${k}`} className='mb-16 scroll-mt-24 last:mb-0'>
						<h2 id={`h-${k}`} className='text-[28px] font-extrabold tracking-[-0.02em]'>
							{KIND[k]} <span className='text-[#8aa3a9]'>{list.length}</span>
						</h2>
						<ul className='mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
							{list.map((p) => (
								<li key={p.slug}>
									<PlaceCard p={p} />
								</li>
							))}
						</ul>
					</section>
				))}
				<p className='mt-16 text-[12.5px] leading-[1.7] text-[#4d6670]'>
					Every place is traced to the pages it came from, and the guide’s own entries are the travel workspace’s. Photos are from Wikimedia Commons or English Wikipedia under free licences, each credited on the photo. {Object.keys(AREA).length} areas: Basilan, Lanao del Sur, Maguindanao del Norte and del Sur, Tawi-Tawi, Cotabato City and the Special Geographic Area.
				</p>
			</div>
			<GetInvolved />
		</main>
	)
}
