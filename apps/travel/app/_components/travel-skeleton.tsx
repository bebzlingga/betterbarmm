import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'

/* What a page shows while it streams in (user decision: match the layout): every travel page opens on a photograph
   header under the clear masthead, so the wait is that header in the dark, its lines in white, then the page's
   first row. Explore: the centred header with its search, then the grid of places. A destination or a place: the
   full-height header ranged left. Every other page: the shorter header (PageHero), then a rail of cards. The ink
   is re-pointed to white on the dark ground, so the grey reads there. */
export function TravelSkeleton({ path }: { path: string }) {
	const explore = path === '/'
	const discover = path.startsWith('/discover/')
	const place = path.startsWith('/places/')
	const calendar = path === '/calendar'

	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			<header aria-hidden='true' className={`dv-hero ${place ? 'pl-hero' : discover ? '' : 'pg-hero'}`} style={{ '--ink': '#fff', '--paper': 'rgb(255 255 255 / 0.25)' } as React.CSSProperties}>
				<div
					className={`bb-container relative flex min-h-[inherit] flex-col ${
						explore
							? 'items-center justify-center pb-16 pt-[calc(var(--tv-nav-h)+3rem)] text-center'
							: place
								? 'justify-end pb-16 pt-[calc(var(--tv-nav-h)+5rem)] md:pb-28'
								: 'justify-end pb-16 pt-[calc(var(--tv-nav-h)+4rem)] md:pb-24'
					}`}
				>
					{/* What sits above the name: a destination's seal, a place's kind chip, a list page's kicker. */}
					{discover ? (
						<Skeleton className='size-28 rounded-full md:size-36' />
					) : place ? (
						<Skeleton className='h-7 w-20 rounded-full' />
					) : (
						<SkeletonLine className='w-full text-[0.75rem]' width='8rem' />
					)}
					{/* The name, one line, at its own size. */}
					<div className={`${discover ? 'dv-hero-title' : place ? 'mt-4 text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95]' : 'pg-hero-title mt-4'} w-full !max-w-none`}>
						<SkeletonLine width={explore ? 'min(52rem, 90%)' : discover ? 'min(28rem, 70%)' : 'min(34rem, 75%)'} />
					</div>
					{/* A destination's woven strip and its line. */}
					{discover ? (
						<div className='mt-5 flex items-center gap-3 text-[0.8125rem]'>
							<Skeleton className='h-3 w-56 rounded-full' />
							<SkeletonLine width='16rem' />
						</div>
					) : null}
					<div className={`mt-5 w-full max-w-2xl text-[1.0625rem] leading-relaxed ${explore ? 'mx-auto' : ''}`}>
						<SkeletonLine width='92%' />
						{place ? null : <SkeletonLine width='60%' />}
					</div>
					{explore ? <Skeleton className='mx-auto mt-8 h-14 w-full max-w-2xl rounded-full' /> : null}
					{discover || place ? (
						<div className={`${place ? 'mt-7' : 'mt-8'} flex gap-3`}>
							<Skeleton className='h-12 w-44 rounded-full' />
							<Skeleton className='h-12 w-32 rounded-full' />
							{place ? <Skeleton className='h-12 w-28 rounded-full' /> : null}
						</div>
					) : null}
				</div>
				{/* A place's three thumbnails, bottom right on a wide screen. */}
				{place ? (
					<div className='absolute bottom-28 right-[var(--dv-gutter)] hidden gap-2 lg:flex'>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} className='h-20 w-28 rounded-xl' />
						))}
					</div>
				) : null}
			</header>

			{explore ? (
				<>
					{/* The categories, under the header. */}
					<div aria-hidden='true' className='border-b border-[var(--rule)]'>
						<div className='bb-container flex gap-9 overflow-hidden pb-3 pt-5 lg:justify-center lg:gap-12'>
							{Array.from({ length: 14 }, (_, i) => (
								<div key={i} className='flex shrink-0 flex-col items-center gap-2'>
									<Skeleton className='size-[22px] rounded-md' />
									<Skeleton className='h-2 w-10' />
								</div>
							))}
						</div>
					</div>
					<div aria-hidden='true' className='bb-container grid grid-cols-1 gap-x-8 gap-y-12 pb-24 pt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[48px] lg:gap-y-14 lg:pb-32 lg:pt-16 xl:grid-cols-4'>
						{Array.from({ length: 8 }, (_, i) => (
							<div key={i}>
								<Skeleton className='aspect-[4/3] w-full rounded-[1.25rem]' />
								<div className='mt-4'>
									<SkeletonLine className='text-[0.75rem]' width='40%' />
									<SkeletonLine className='mt-1.5 text-[1.0625rem] leading-snug' width='75%' />
									<SkeletonLine className='mt-1 text-[0.84375rem] leading-[1.55]' width='95%' />
								</div>
							</div>
						))}
					</div>
				</>
			) : calendar ? (
				<>
					{/* The month bar, then the first month: its name beside its anniversaries. */}
					<div aria-hidden='true' className='border-b border-[var(--rule)]'>
						<div className='bb-container flex justify-between gap-1 overflow-hidden py-3'>
							{Array.from({ length: 12 }, (_, i) => (
								<div key={i} className='flex shrink-0 flex-col items-center gap-1.5 px-3 py-1.5'>
									<Skeleton className='h-3 w-7' />
									<Skeleton className='h-2 w-3' />
								</div>
							))}
						</div>
					</div>
					<div aria-hidden='true' className='bb-container grid gap-10 py-16 lg:grid-cols-[16rem_minmax(0,1fr)]'>
						<SkeletonLine className='dv-title' width='10rem' />
						<Skeleton className='h-72 w-full rounded-[var(--dv-r)]' />
					</div>
				</>
			) : place ? (
				/* About this place, beside the card that stays in view. */
				<div aria-hidden='true' className='bb-container grid gap-x-16 gap-y-12 pb-16 pt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:pb-28 lg:pt-28'>
					<div>
						<SkeletonLine className='dv-title' width='18rem' />
						<div className='mt-5 text-[1.0625rem] leading-[1.75]'>
							{[96, 92, 98, 88, 94, 60].map((w, i) => (
								<SkeletonLine key={i} width={`${w}%`} />
							))}
						</div>
					</div>
					<Skeleton className='h-96 w-full rounded-[var(--dv-r)]' />
				</div>
			) : discover ? (
				/* The overview: its label, then the opening sentence set large. */
				<section aria-hidden='true' className='dv-section bb-container'>
					<SkeletonLine className='text-[0.75rem]' width='12rem' />
					<div className='mt-5 max-w-5xl text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12]'>
						<SkeletonLine width='96%' />
						<SkeletonLine width='70%' />
					</div>
				</section>
			) : (
				<section aria-hidden='true' className='dv-rail-section'>
					<div className='bb-container'>
						<SkeletonLine className='dv-title' width='min(20rem, 70%)' />
						<SkeletonLine className='dv-lede' width='min(30rem, 85%)' />
					</div>
					<div className='dv-rail'>
						{Array.from({ length: 5 }, (_, i) => (
							<Skeleton key={i} className='aspect-[3/4] w-[min(78vw,21rem)] shrink-0 rounded-[var(--dv-r)]' />
						))}
					</div>
				</section>
			)}
		</div>
	)
}
