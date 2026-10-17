import { ArrowUpRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import { CraftCard } from './craft-card'
import { SiteHeader } from './site-header'
import { PhotoCredit } from './discover-figure'
import { GROUP, commonsThumb, craft, crafts, creditOf, festivals } from '../_lib/crafts'

// Important: the shared base styles set the body face on p, li and dd outside any layer.
const serif = 'font-[family-name:var(--font-craft)]!'

/** The catalogue. It lives in the crafts layout, so it stays put, scrolled where the reader left it, while a craft opens over it. */
export function CraftsCatalogue() {
	const groups = (Object.keys(GROUP) as (keyof typeof GROUP)[]).map((g) => ({ g, list: crafts.filter((c) => c.group === g) })).filter((x) => x.list.length)
	const peoples = new Set(crafts.map((c) => c.people)).size
	// Three pieces for the masthead, one each of cloth, brass and mat.
	const cover = ['yakan-tennun', 'gador', 'tepo'].map(craft).filter((c) => c?.images[0])

	return (
		<main className='min-h-screen bg-[#f4efe8] text-[#3b2419]'>
			<SiteHeader activeItem='crafts' />

			<section className='bg-[radial-gradient(ellipse_at_75%_0%,#a7694c,#7b4a35_45%,#4a2c22)] px-4 py-16 text-[#f4e8dc] sm:px-6 lg:py-24'>
				<div className='mx-auto grid max-w-[84rem] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]'>
					<div>
					<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#e7c9a9]'>
						{crafts.length} crafts · {peoples} peoples
					</p>
					<h1 className={`${serif} mt-3 max-w-3xl text-[40px] font-bold leading-[1.08] sm:text-[56px]`}>Crafts of the Bangsamoro</h1>
					<p className={`${serif} mt-5 max-w-2xl text-[18px] leading-[1.6] text-[#ecdccd]`}>
						What the region weaves, casts and carves: where each piece is made, who still makes it, and where a visitor can watch it made or buy it from the hands that made it.
					</p>
					<nav aria-label='Kinds of craft' className='mt-9 flex flex-wrap gap-2'>
						{groups.map(({ g, list }) => (
							<a key={g} href={`#${g}`} className='rounded-full border border-[#e7c9a9]/40 px-4 py-1.5 text-[13.5px] transition hover:bg-white hover:text-[#3b2419]'>
								{GROUP[g]} <span className='text-[#d9bba6]'>{list.length}</span>
							</a>
						))}
					</nav>
					</div>
					<div className='relative hidden h-[26rem] lg:block'>
						{cover.map((c, i) => (
							<span
								key={c!.slug}
								className={`bb-frame absolute w-56 overflow-hidden rounded-[6px] ${['top-0 left-0 h-72 -rotate-3', 'top-10 right-0 h-64 rotate-2', 'bottom-0 left-24 h-52 rotate-1'][i]}`}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={commonsThumb(c!.images[0]!.url, 500)} alt='' className='size-full object-cover' />
								<PhotoCredit photo={creditOf(c!.images[0]!)} />
							</span>
						))}
					</div>
				</div>
			</section>

			<div className='mx-auto max-w-[84rem] px-4 py-14 sm:px-6 lg:py-20'>
				{groups.map(({ g, list }) => (
					<section key={g} id={g} aria-labelledby={`h-${g}`} className='mb-16 scroll-mt-24'>
						<h2 id={`h-${g}`} className={`${serif} text-[28px] font-bold`}>
							{GROUP[g]}
						</h2>
						<ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							{list.map((c) => (
								<li key={c.slug}>
									<CraftCard c={c} />
								</li>
							))}
						</ul>
					</section>
				))}

				{festivals.length ? (
					<section aria-labelledby='festivals' className='border-t border-[#e4d8cb] pt-14'>
						<h2 id='festivals' className={`${serif} text-[28px] font-bold`}>
							When to go
						</h2>
						<p className='mt-2 max-w-2xl text-[14.5px] leading-[1.6] text-[#5a3d2e]'>The festivals where these crafts are shown, worn and sold.</p>
						<ul className='mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
							{festivals.map((f) => (
								<li key={f.name} className='rounded-[6px] bg-white p-5'>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a6a4f]'>{f.month}</p>
									<p className={`${serif} mt-1 text-[19px] font-bold`}>{f.name}</p>
									<p className='mt-0.5 flex items-center gap-1 text-[13px] text-[#8a6d5c]'>
										<MapPinIcon size={13} aria-hidden='true' /> {f.place}
									</p>
									<p className='mt-2 text-[14px] leading-[1.6] text-[#5a3d2e]'>{f.note}</p>
									<a href={f.source} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-0.5 text-[11.5px] text-[#8a6d5c] hover:text-[#5a3424]'>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</section>
				) : null}

				<p className='mt-16 max-w-3xl text-[12.5px] leading-[1.7] text-[#8a6d5c]'>
					Every fact here is linked to the page it came from. Photos are from Wikimedia Commons under free licences, each credited on the photo.
				</p>
			</div>
		</main>
	)
}
