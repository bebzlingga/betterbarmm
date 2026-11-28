import Image from 'next/image'
import { MapPinIcon } from '@phosphor-icons/react/ssr'
import { photo, type DiscoverPhotoKey } from './discover-media'

/* ============================================================
   A page's header in the travel workspace's look (user decision:
   the site in the travel look)

   The region's own photographs across the page, turning under a dark
   wash, with the strip and the masthead running clear over them (the
   bars do it themselves: globals.css, `body:has(.dv-hero)`). Each
   photograph's place and credit sit bottom right, turning with it.
   The page's words sit at the foot, or centred as the front page's
   search is. The page's tokens are re-pointed for the dark ground, so
   a button or a line a page passes in reads there unchanged.
   ============================================================ */

/** Landscapes, landmarks and crafts that read at the full width; a page with none of its own draws from these. */
const POOL: DiscoverPhotoKey[] = [
	'panampangan',
	'lakeLanao',
	'marawiGrandMosque',
	'budBongao',
	'parliamentBuilding',
	'makhdumMosque',
	'cotabatoPlaza',
	'governmentCenter',
	'yakanWeaving',
	'torogan',
	'singkil',
	'marawiIslamicCenter',
]

/** Three of the pool for a page, chosen by its title so each page has its own and keeps them. */
export function photosFor(seed: string): DiscoverPhotoKey[] {
	const h = [...seed].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)
	return [0, 4, 8].map((k) => POOL[(h + k) % POOL.length]!)
}

/* ---- The pattern header (user decision: photographs only on the front page and Discover; every other page's header
   is the brand crimson with its lattice, as the site's headers were before, under the clear bars). The header takes
   `brand-bg bb-lattice` (the ground and the okir lattice, fading before the type); this adds the warm light from the
   top and the malong's warp along the foot. ---- */
export const BRAND_HEAD = 'brand-bg bb-lattice'

export function HeroPattern() {
	return (
		<>
			<span
				aria-hidden='true'
				className='bb-glow absolute -top-[22rem] left-1/2 -z-10 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
			/>
			<span aria-hidden='true' className='bb-weave absolute inset-x-0 bottom-0' />
		</>
	)
}

export function PhotoHero({
	photos,
	kicker,
	title,
	lede,
	center = false,
	tall = false,
	aside,
	showPhotos = false,
	side,
	children,
}: {
	/** A column on the right of the words from a wide screen (a map, a card); under them on a phone. */
	side?: React.ReactNode
	photos: DiscoverPhotoKey[]
	/** Photographs under the words: the front page and Discover only (user decision); every other page has the pattern. */
	showPhotos?: boolean
	kicker?: React.ReactNode
	title: React.ReactNode
	lede?: React.ReactNode
	/** The words centred, as the front page's search is. */
	center?: boolean
	/** Nearly the first screen, as the front page's is. */
	tall?: boolean
	/** Beside the kicker and title, on their left: a seal or a logo. */
	aside?: React.ReactNode
	children?: React.ReactNode
}) {
	// At most four: the turning is timed for two, three or four (dv-fade-2, -3 and dv-fade).
	const shown = showPhotos ? [...new Set(photos)].slice(0, 4).map(photo) : []
	const n = shown.length
	const turn = (i: number) =>
		(n > 1 ? { '--i': i, '--n': n, ...(n < 4 ? { animationName: `dv-fade-${n}` } : {}) } : { animation: 'none', opacity: 1 }) as React.CSSProperties

	return (
		<header className={`dv-hero ${tall ? 'dv-hero-tall' : ''} ${center ? 'dv-hero-center' : ''} ${shown.length ? '' : `dv-hero-plain ${BRAND_HEAD}`}`}>
			{shown.length ? null : <HeroPattern />}
			{shown.map((p, i) => (
				<figure key={p.source} className='dv-slide' style={turn(i)}>
					<Image
						src={p.src}
						alt={p.alt}
						fill
						sizes='100vw'
						priority={i === 0}
						placeholder={i === 0 ? 'blur' : 'empty'}
						className='dv-slide-img'
						style={n > 1 ? { '--i': i, '--n': n } as React.CSSProperties : { animation: 'none' }}
					/>
				</figure>
			))}
			{shown.length ? <span aria-hidden='true' className='dv-hero-shade' /> : null}
			{shown.map((p, i) => (
				<p key={p.source} data-first={i === 0 || undefined} className='dv-slide-cap' style={turn(i)}>
					{p.place ? (
						<span className='inline-flex items-center gap-1.5 font-semibold text-white/60'>
							<MapPinIcon size={14} weight='fill' aria-hidden='true' />
							{p.place}
						</span>
					) : null}
					<a href={p.source} target='_blank' rel='noreferrer' className='text-[0.6875rem] text-white/40 hover:text-white/80'>
						Photo: {p.credit} · {p.license}
					</a>
				</p>
			))}

			<div
				className={`bb-container relative flex min-h-[inherit] flex-col ${side ? 'lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-20' : ''} ${center ? 'items-center justify-center pb-16 pt-[calc(var(--tv-nav-h)+3rem)] text-center' : 'justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-24'}`}
			>
				<div className={`min-w-0 ${center ? 'w-full' : ''}`}>
					<div className={aside ? 'flex items-center gap-5 sm:gap-8' : undefined}>
						{aside}
						<div className='min-w-0'>
							{kicker ? <p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>{kicker}</p> : null}
							<h1 className={`pg-hero-title mt-4 ${center ? 'mx-auto' : ''} ${side ? '!max-w-none' : ''}`}>{title}</h1>
						</div>
					</div>
					{lede ? <p className={`mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.125rem] ${center ? 'mx-auto' : ''}`}>{lede}</p> : null}
					{children}
				</div>
				{side ? <div className='mt-10 min-w-0 lg:mt-0'>{side}</div> : null}
			</div>
		</header>
	)
}
