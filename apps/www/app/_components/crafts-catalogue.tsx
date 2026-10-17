import { ArrowUpRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import { CraftCard } from './craft-card'
import { SiteHeader } from './site-header'
import { PhotoCredit } from './discover-figure'
import { GROUP, commonsThumb, craft, crafts, creditOf, festivals } from '../_lib/crafts'
import { GetInvolved } from './get-involved'

// Important: the shared base styles set the body face on p, li and dd outside any layer.
const serif = 'font-[family-name:var(--font-craft)]!'

// BCPCH's coffee-table book. Its page on the commission's site sits at a "landung" address, the name of its other book.
const PUSAKA = {
	page: 'https://bcpch.bangsamoro.gov.ph/landung-creative-reflections-of-the-colorful-and-diverse-bangsamoro-cultural-heritage/',
	pdf: 'https://bcpch.bangsamoro.gov.ph/wp-content/uploads/2025/02/Page_Compressed-BARMM-CTB_009-downsize-version-1-compressed.pdf',
	landung: 'https://bcpch.bangsamoro.gov.ph/landung/',
}

/** The catalogue. It lives in the crafts layout, so it stays put, scrolled where the reader left it, while a craft opens over it. */
export function CraftsCatalogue() {
	const groups = (Object.keys(GROUP) as (keyof typeof GROUP)[]).map((g) => ({ g, list: crafts.filter((c) => c.group === g) })).filter((x) => x.list.length)
	const peoples = new Set(crafts.map((c) => c.people)).size
	// Three pieces for the masthead, one each of cloth, brass and mat.
	const cover = ['yakan-tennun', 'gador', 'tepo'].map(craft).filter((c) => c?.images[0])

	return (
		<main className='min-h-screen bg-[#f4efe8] text-[#3b2419]'>
			<SiteHeader activeItem='crafts' />

			<section className='bg-[radial-gradient(ellipse_at_75%_0%,#c8453a,#8f2328_45%,#4a0f14)] px-4 py-16 text-[#f4e8dc] sm:px-6 lg:py-24'>
				<div className='mx-auto grid max-w-[84rem] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]'>
					<div>
					<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#e7c9a9]'>
						{crafts.length} crafts · {peoples} peoples
					</p>
					<h1 className={`${serif} mt-3 max-w-4xl text-[48px] font-bold leading-[1.04] sm:text-[68px] lg:text-[80px]`}>
						Living Crafts
						<br />
						of the Bangsamoro
					</h1>
					<p className={`${serif} mt-5 max-w-2xl text-[18px] leading-[1.6] text-[#ecdccd]`}>
						What the region weaves, casts and carves: where each piece is made, who still makes it, and where a visitor can watch it made or buy it from the hands that made it.
					</p>
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

			{/* The region's own catalogue of the same heritage, read before anything else here. */}
			<section aria-labelledby='pusaka' className='border-b border-[#e4d8cb] bg-[#efe6dc]'>
				<div className='mx-auto grid max-w-[84rem] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-20'>
					<a href={PUSAKA.pdf} target='_blank' rel='noreferrer' className='group block'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src='/crafts/pusaka-cover.jpg'
							alt='The cover of Pusaka: inaul, okir, a kris hilt, tepo weaving and the Grand Mosque of Cotabato City'
							width={1100}
							height={778}
							loading='lazy'
							className='block w-full transition duration-500 group-hover:opacity-90'
						/>
					</a>
					<div>
						<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9a6a4f]'>
							From the Bangsamoro Commission for the Preservation of Cultural Heritage
						</p>
						<h2 id='pusaka' className={`${serif} mt-3 text-[40px] font-bold leading-[1.05] sm:text-[52px]`}>
							Pusaka
						</h2>
						<p className={`${serif} mt-1 text-[19px] italic text-[#8a6d5c]`}>Embodying Prestige of the BARMM’s Cultural Properties</p>
						<p className={`${serif} mt-5 max-w-xl text-[17px] leading-[1.65] text-[#5a3d2e]`}>
							The commission’s own coffee-table book of the region’s heritage, province by province: 78 cultural items, from the inaul and the brassware of
							Maguindanao to the okir and torogan of Lanao, Yakan tennun, and the tepo mats and boats of Tawi-Tawi.
						</p>
						<dl className='mt-6 flex flex-wrap gap-x-10 gap-y-3'>
							{[
								['78', 'cultural items'],
								['5', 'provinces'],
								['118', 'pages'],
							].map(([n, label]) => (
								<div key={label}>
									<dt className='sr-only'>{label}</dt>
									<dd className={`${serif} text-[30px] font-bold leading-none`}>
										{n} <span className='font-[family-name:var(--font-dm-sans)] text-[13px] font-normal text-[#8a6d5c]'>{label}</span>
									</dd>
								</div>
							))}
						</dl>
						<div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
							<a href={PUSAKA.pdf} target='_blank' rel='noreferrer' className={`${serif} inline-flex items-center gap-2 bg-[#3b2419] px-7 py-3 text-[15px] text-[#f4efe8] transition hover:bg-[#5a3424]`}>
								Read the book <span className='font-[family-name:var(--font-dm-sans)] text-[12px] text-[#d9bba6]'>PDF, 17 MB</span>
							</a>
							<a href={PUSAKA.page} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[14px] text-[#7b4a35] underline decoration-[#d9c7b5] underline-offset-4 hover:decoration-[#7b4a35]'>
								On the commission’s site <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
							</a>
						</div>
						<p className='mt-6 max-w-xl text-[13px] leading-[1.6] text-[#8a6d5c]'>
							Posted by the commission in February 2025, it still includes Sulu, which the Supreme Court ruled out of BARMM in 2024. For children, the commission also publishes{' '}
							<a href={PUSAKA.landung} target='_blank' rel='noreferrer' className='underline decoration-[#d9c7b5] underline-offset-4 hover:text-[#5a3424]'>
								Landung
							</a>
							, a colouring book of the same heritage.
						</p>
					</div>
				</div>
			</section>

			<div className='mx-auto max-w-[84rem] px-4 pt-14 pb-20 sm:px-6 lg:pt-20 lg:pb-28'>
				{groups.map(({ g, list }) => (
					<section key={g} id={g} aria-labelledby={`h-${g}`} className='mb-16 scroll-mt-24 last:mb-0'>
						<h2 id={`h-${g}`} className={`${serif} text-[28px] font-bold`}>
							{GROUP[g]}
						</h2>
						<ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
							{list.map((c) => (
								<li key={c.slug}>
									<CraftCard c={c} plain />
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			{/* When to go: a white band of its own, the catalogue's last word before the ask. */}
			<section aria-labelledby='festivals' className='bg-white'>
				<div className='mx-auto max-w-[84rem] px-4 py-16 sm:px-6 lg:py-20'>
					{festivals.length ? (
						<>
							<h2 id='festivals' className={`${serif} text-[28px] font-bold`}>
								When to go
							</h2>
							<p className='mt-2 max-w-2xl text-[14.5px] leading-[1.6] text-[#5a3d2e]'>The festivals where these crafts are shown, worn and sold.</p>
							<ul className='mt-8 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
								{festivals.map((f) => (
									<li key={f.name} className='border-t border-[#d9c7b5] pt-4'>
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
						</>
					) : null}
					<p className='mt-16 max-w-3xl text-[12.5px] leading-[1.7] text-[#8a6d5c]'>
						Every fact here is linked to the page it came from. Photos are from Wikimedia Commons under free licences, each credited on the photo.
					</p>
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
