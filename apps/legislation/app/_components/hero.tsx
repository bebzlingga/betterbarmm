/* ============================================================
   The top of every page in the registry, in the travel workspace's
   look (user decision: as the landing site's pattern header): the
   brand crimson and its lattice, up under both bars, which run clear
   over it (globals.css, `body:has(.dv-hero)`); the warm light from the
   top and the malong's warp along the foot. The page's words sit at its
   foot; a column on the right from a wide screen where a page has one.
   ============================================================ */

export function Hero({
	kicker,
	title,
	lede,
	top,
	small = false,
	tall = false,
	auto = false,
	side,
	children,
}: {
	kicker?: React.ReactNode
	title: React.ReactNode
	lede?: React.ReactNode
	/** Above the title in place of the kicker: a record's number and status. */
	top?: React.ReactNode
	/** A long title (a measure's official name): a step smaller. */
	small?: boolean
	/** Most of the first screen, as the front page's is. */
	tall?: boolean
	/** As tall as its words, no more: a page whose header carries a lot. */
	auto?: boolean
	/** A column on the right of the words from a wide screen; under them on a phone. */
	side?: React.ReactNode
	children?: React.ReactNode
}) {
	return (
		<header className={`dv-hero brand-bg bb-lattice ${tall ? 'dv-hero-tall' : ''} ${auto ? 'dv-hero-auto' : ''}`}>
			<span
				aria-hidden='true'
				className='bb-glow absolute -top-[22rem] left-1/2 -z-10 h-[40rem] w-[64rem] max-w-[160vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,206,84,0.7)_0%,rgba(255,170,40,0.3)_38%,transparent_70%)]! opacity-80!'
			/>
			<span aria-hidden='true' className='bb-weave absolute inset-x-0 bottom-0' />
			<div
				className={`bb-container relative flex min-h-[inherit] flex-col justify-end ${side ? 'lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-14 xl:gap-20' : ''}`}
			>
				<div className='min-w-0'>
					{top ?? (kicker ? <p className='pg-hero-kicker'>{kicker}</p> : null)}
					<h1 className={`pg-hero-title mt-4 ${small ? 'pg-hero-title-sm' : ''} ${side ? '!max-w-none' : ''}`}>{title}</h1>
					{lede ? <div className='mt-5 max-w-3xl text-[1.0625rem] leading-relaxed text-white/85 md:text-[1.125rem]'>{lede}</div> : null}
					{children}
				</div>
				{side ? <div className='mt-10 min-w-0 lg:mt-0'>{side}</div> : null}
			</div>
		</header>
	)
}
