import { ArrowRightIcon, ArrowUpRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { CraftCard } from './craft-card'
import { SiteHeader } from './site-header'
import { PhotoCredit } from './discover-figure'
import { GROUP, byPhoto, commonsThumb, craft, crafts, creditOf, festivals, markets } from '../_lib/crafts'
import { HonestBand } from './honest-band'
import { PhotoHero } from './photo-hero'
import { CraftsMap } from './crafts-map'
import { craftMap, makerSupport } from '../_lib/craft-places'
import type { BuyAt } from '../_lib/crafts'
import { monthYear } from './directory-bits'


// BCPCH's coffee-table book. Its page on the commission's site sits at a "landung" address, the name of its other book.
const PUSAKA = {
	page: 'https://bcpch.bangsamoro.gov.ph/landung-creative-reflections-of-the-colorful-and-diverse-bangsamoro-cultural-heritage/',
	pdf: 'https://bcpch.bangsamoro.gov.ph/wp-content/uploads/2025/02/Page_Compressed-BARMM-CTB_009-downsize-version-1-compressed.pdf',
	landung: 'https://bcpch.bangsamoro.gov.ph/landung/',
}

/** The catalogue. It lives in the crafts layout, so it stays put, scrolled where the reader left it, while a craft opens over it. */
export function CraftsCatalogue() {
	const groups = (Object.keys(GROUP) as (keyof typeof GROUP)[]).map((g) => ({ g, list: byPhoto(crafts.filter((c) => c.group === g)) })).filter((x) => x.list.length)
	const peoples = new Set(crafts.map((c) => c.people)).size
	// Three pieces for the masthead, one each of cloth, brass and mat.
	const cover = ['yakan-tennun', 'gador', 'tepo'].map(craft).filter((c) => c?.images[0])
	// Every place to buy, once, with the crafts it sells.
	const shops = new Map<string, BuyAt & { crafts: { slug: string; name: string }[] }>()
	for (const c of crafts)
		for (const b of c.buy ?? []) {
			const k = `${b.name}|${b.place}`
			const s = shops.get(k) ?? { ...b, crafts: [] }
			s.crafts.push({ slug: c.slug, name: c.name })
			shops.set(k, s)
		}
	for (const m of markets) shops.set(`${m.name}|${m.place}`, { ...m, crafts: [] })
	// Inside the region first, by place; those outside it last.
	const outside = (b: BuyAt) => b.place.includes('outside BARMM')
	const buyList = [...shops.values()].sort((a, b) => Number(outside(a)) - Number(outside(b)) || a.place.localeCompare(b.place))
	const missing = `mailto:support@betterbarmm.com?subject=${encodeURIComponent('Crafts: one we have missed')}&body=${encodeURIComponent('The craft, the people who make it and the town:\n\nA maker, a shop or a fair, if you know one:\n\nThe source (a link, a document, or how you know):\n')}`

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='crafts' />

			{/* The travel look (user decision: crafts redesigned too): the crimson header the site's other pages open on, the
			    three pieces of the masthead (cloth, brass, mat) fanned on its right. */}
			<PhotoHero
				photos={[]}
				kicker={`${crafts.length} crafts · ${peoples} peoples`}
				title={<span className='block text-[clamp(2.5rem,4.8vw,4.5rem)] leading-[1.02]'>Living Crafts of the Bangsamoro</span>}
				lede='What the region weaves, casts and carves: where each piece is made, who still makes it, and where a visitor can watch it made or buy it from the hands that made it.'
				side={
					<div className='relative mx-auto hidden h-[24rem] w-full max-w-[26rem] lg:block'>
						{cover.map((c, i) => (
							<span
								key={c!.slug}
								className={`bb-frame absolute w-52 overflow-hidden rounded-2xl shadow-[0_30px_50px_-24px_rgba(0,0,0,0.7)] ring-4 ring-white/90 ${['left-0 top-2 h-64 -rotate-6', 'right-0 top-8 h-60 rotate-3', 'bottom-0 left-24 h-48 rotate-1'][i]}`}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={commonsThumb(c!.images[0]!.url, 500)} alt='' className='size-full object-cover' />
								<PhotoCredit photo={creditOf(c!.images[0]!)} />
							</span>
						))}
					</div>
				}
			>
				{/* The kinds, as the ways in. */}
				<nav aria-label='Kinds of craft' className='mt-8 flex flex-wrap gap-2'>
					{groups.map(({ g, list }) => (
						<a key={g} href={`#${g}`} className='dv-btn dv-btn-glass !px-4 !py-2 !text-[0.8125rem]'>
							{GROUP[g]} <span className='num font-normal text-white/60'>{list.length}</span>
						</a>
					))}
				</nav>
			</PhotoHero>

			{/* The region's own catalogue of the same heritage, read before anything else here. */}
			<section aria-labelledby='pusaka' className='tv-wash'>
				<div className='bb-container dv-section'>
					<div className='grid items-start gap-8 overflow-hidden rounded-[1.5rem] border border-[var(--rule)] bg-[var(--paper)] p-5 shadow-[0_24px_50px_-34px_rgba(0,0,0,0.45)] sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:p-9'>
						<a href={PUSAKA.pdf} target='_blank' rel='noreferrer' className='group block overflow-hidden rounded-2xl'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src='/crafts/pusaka-cover.jpg'
								alt='The cover of Pusaka: inaul, okir, a kris hilt, tepo weaving and the Grand Mosque of Cotabato City'
								width={1100}
								height={778}
								loading='lazy'
								className='block w-full transition duration-500 group-hover:scale-[1.02]'
							/>
						</a>
						<div>
							<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
								From the Bangsamoro Commission for the Preservation of Cultural Heritage
							</p>
							<h2 id='pusaka' className='dv-title mt-3 !text-[clamp(2.25rem,3.8vw,3.25rem)]'>
								Pusaka
							</h2>
							<p className='mt-1 text-[1.0625rem] italic text-[var(--ink-3)]'>Embodying Prestige of the BARMM’s Cultural Properties</p>
							<p className='mt-5 max-w-xl text-[1rem] leading-[1.7] text-[var(--ink-2)]'>
								The commission’s own coffee-table book of the region’s heritage, province by province: 78 cultural items, from the inaul and the brassware of
								Maguindanao to the okir and torogan of Lanao, Yakan tennun, and the tepo mats and boats of Tawi-Tawi.
							</p>
							<dl className='mt-6 flex flex-wrap gap-2'>
								{[
									['78', 'cultural items'],
									['5', 'provinces'],
									['118', 'pages'],
								].map(([n, label]) => (
									<div key={label} className='rounded-2xl bg-[color-mix(in_srgb,var(--paper-2)_65%,var(--paper))] px-4 py-3'>
										<dt className='sr-only'>{label}</dt>
										<dd className='font-[family-name:var(--font-display)] text-[1.625rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>
											{n} <span className='font-[family-name:var(--font-dm-sans)] text-[0.8125rem] font-normal tracking-normal text-[var(--ink-3)]'>{label}</span>
										</dd>
									</div>
								))}
							</dl>
							<div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-3'>
								<a href={PUSAKA.pdf} target='_blank' rel='noreferrer' className='inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold text-[var(--paper)] transition hover:bg-[var(--accent)]'>
									Read the book <span className='font-[family-name:var(--font-dm-sans)] text-[0.75rem] font-normal opacity-70'>PDF, 17 MB</span>
								</a>
								<a href={PUSAKA.page} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 text-[0.875rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'>
									On the commission’s site <ArrowUpRightIcon size={12} weight='bold' aria-hidden='true' />
								</a>
							</div>
							<p className='mt-6 max-w-xl text-[0.8125rem] leading-[1.6] text-[var(--ink-3)]'>
								Posted by the commission in February 2025, it still includes Sulu, which the Supreme Court ruled out of BARMM in 2024. For children, the commission also publishes{' '}
								<a href={PUSAKA.landung} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
									Landung
								</a>
								, a colouring book of the same heritage.
							</p>
						</div>
					</div>
				</div>
			</section>

			<div className='bb-container dv-section'>
				{groups.map(({ g, list }) => (
					<section key={g} id={g} aria-labelledby={`h-${g}`} className='mb-20 scroll-mt-8 last:mb-0'>
						<div className='flex items-end justify-between gap-4'>
							<h2 id={`h-${g}`} className='dv-title'>
								{GROUP[g]}
							</h2>
							<span className='num rounded-full bg-[var(--paper-2)] px-3 py-1 text-[0.8125rem] font-semibold text-[var(--ink-2)]'>{list.length}</span>
						</div>
						<ul className='mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
							{list.map((c) => (
								<li key={c.slug}>
									<CraftCard c={c} />
								</li>
							))}
						</ul>
					</section>
				))}
			</div>

			{/* Where they are made: every town a craft names, on the map. */}
			<section aria-labelledby='made' className='tv-wash'>
				<div className='bb-container dv-section'>
					<h2 id='made' className='dv-title'>
						Where they are made
					</h2>
					<p className='dv-lede'>Each dot is a town a source names; the larger, the more crafts made there. A faint dot holds the crafts whose town no source names, on their province.</p>
					<div className='mt-8'>
						<CraftsMap points={craftMap()} />
					</div>
				</div>
			</section>

			{buyList.length ? (
				<section aria-labelledby='buy' className='bb-container dv-section'>
					<h2 id='buy' className='dv-title'>
						Where to buy
					</h2>
					<p className='dv-lede'>Fairs, centres and shops where these crafts are sold, each as dated as its source. Check before you travel.</p>
					<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{buyList.map((b) => (
							<li key={b.name + b.place} className='tv-card !p-6'>
								<p className='font-[family-name:var(--font-display)] text-[1.125rem] font-bold leading-snug tracking-[-0.02em]'>
									{b.url ? (
										<a href={b.url} target='_blank' rel='noreferrer' className='hover:text-[var(--accent)]'>
											{b.name}
										</a>
									) : (
										b.name
									)}
								</p>
								<p className='mt-1 flex items-center gap-1 text-[0.8125rem] text-[var(--ink-3)]'>
									<MapPinIcon size={13} aria-hidden='true' /> {b.place}
								</p>
								<p className='mt-3 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{b.note}</p>
								<p className='mt-3 flex flex-wrap gap-1.5 text-[0.75rem]'>
									{b.crafts.length ? null : <span className='rounded-full bg-[var(--paper-2)] px-2.5 py-1 text-[var(--ink-3)]'>Crafts of many kinds</span>}
									{b.crafts.map((c) => (
										<Link key={c.slug} href={`/crafts/${c.slug}`} scroll={false} className='rounded-full bg-[color-mix(in_srgb,var(--accent)_8%,var(--paper))] px-2.5 py-1 font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white'>
											{c.name}
										</Link>
									))}
								</p>
								<a href={b.source} target='_blank' rel='noreferrer' className='mt-auto inline-flex items-center gap-0.5 pt-4 text-[0.71875rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									Source, {monthYear(b.as_of)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</li>
						))}
					</ul>
				</section>
			) : null}

			{/* When to go, then the help there is for makers. */}
			<section aria-labelledby='festivals' className='tv-wash'>
				<div className='bb-container dv-section'>
					{festivals.length ? (
						<>
							<h2 id='festivals' className='dv-title'>
								When to go
							</h2>
							<p className='dv-lede'>The festivals where these crafts are shown, worn and sold.</p>
							<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
								{festivals.map((f) => (
									<li key={f.name} className='tv-card !p-6'>
										<span className='w-fit rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,var(--paper))] px-3 py-1 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>{f.month}</span>
										<p className='mt-3 font-[family-name:var(--font-display)] text-[1.1875rem] font-bold leading-snug tracking-[-0.02em]'>{f.name}</p>
										<p className='mt-1 flex items-center gap-1 text-[0.8125rem] text-[var(--ink-3)]'>
											<MapPinIcon size={13} aria-hidden='true' /> {f.place}
										</p>
										<p className='mt-3 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{f.note}</p>
										<a href={f.source} target='_blank' rel='noreferrer' className='mt-auto inline-flex items-center gap-0.5 pt-4 text-[0.71875rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
											Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
										</a>
									</li>
								))}
							</ul>
						</>
					) : null}
					{makerSupport.length ? (
						<div className='mt-20'>
							<h2 className='dv-title'>Help for makers</h2>
							<p className='dv-lede'>What the region’s offices list for the people who weave, cast and carve: teaching, registering a workshop, better tools, a table at a fair.</p>
							<ul className='mt-6 divide-y divide-[var(--rule-soft)] rounded-[1.25rem] border border-[var(--rule)] bg-[var(--paper)] px-6 py-2 sm:px-10 sm:py-3'>
								{makerSupport.map((m) => (
									<li key={m.href}>
										<Link href={m.href} className='group grid gap-1 py-6 sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-6'>
											<span>
												<span className='block font-[family-name:var(--font-display)] text-[1rem] font-bold text-[var(--ink)] group-hover:text-[var(--accent)]'>{m.name}</span>
												<span className='mt-0.5 block text-[0.84375rem] leading-[1.55] text-[var(--ink-2)]'>{m.why}</span>
											</span>
											<span className='flex items-center gap-1 text-[0.78125rem] text-[var(--ink-3)] sm:justify-end'>
												{m.office} <ArrowRightIcon size={12} className='transition group-hover:translate-x-0.5' aria-hidden='true' />
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			</section>

			{/* The page's own ask, in the site's closing band (user decision: the travel look). */}
			<HonestBand
				label='Help the catalogue'
				title='A craft we have missed?'
				standfirst='Or a maker, a shop, a price or a photo of your own. Send it with a source; it is checked before it goes up, and credited to you if you like.'
				primary={{ href: missing, label: 'Send it' }}
				secondary={{ href: '/contribute', label: 'Other ways to help' }}
			/>

		</main>
	)
}
