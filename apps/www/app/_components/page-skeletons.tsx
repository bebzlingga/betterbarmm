import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'

/* ============================================================
   Page skeletons

   Each page's own shape while it loads (user decision: the skeleton
   matches the structure and placement of the page). Every block here
   carries the classes of the thing it stands for — the same container,
   padding, grid and type size — so nothing moves when the page lands.
   The loading screen is a client component, so nothing here imports a
   dataset: the chapter tabs are grey too, in the tabs' own layout.
   ============================================================ */

const W = [78, 62, 86, 70, 56, 82, 66, 74]

/** The centred head on the brand band: label, headline, standfirst, and the search field where the page has one. */
function BandHead({ pad, title = 'min(26rem, 70%)', field = true, chips = 0 }: { pad: string; title?: string; field?: boolean; chips?: number }) {
	return (
		<section aria-hidden='true' className='brand-bg bb-lattice relative overflow-hidden'>
			<div className={`bb-container relative text-center ${pad}`}>
				<SkeletonLine className='text-[0.625rem]' width='14rem' />
				<SkeletonLine className='bb-display-md mt-4' width={title} />
				<div className='mx-auto mt-4 max-w-xl text-[0.9375rem] leading-7'>
					<SkeletonLine width='96%' />
					<SkeletonLine width='72%' />
				</div>
				{field ? <Skeleton className='mx-auto mt-8 h-14 w-full max-w-2xl' /> : null}
				{chips ? (
					<div className='mt-6 flex flex-wrap justify-center gap-2'>
						{Array.from({ length: chips }, (_, i) => (
							<Skeleton key={i} className='h-8 rounded-full' style={{ width: `${5 + (i % 3)}rem` }} />
						))}
					</div>
				) : null}
			</div>
			<div className='bb-weave' />
		</section>
	)
}

/** A section head: kicker, two display lines, and a lead on the right where the page has one. */
function HeadSkeleton({ lead = false }: { lead?: boolean }) {
	return (
		<div className='bb-head-gap'>
			<div className='border-t border-[var(--brass-line)] pt-[0.85rem]'>
				<SkeletonLine className='text-[0.625rem]' width='9rem' />
			</div>
			<div className={`mt-9 grid gap-7 ${lead ? 'lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16' : ''}`}>
				<div className='bb-display-md'>
					<SkeletonLine width='min(24rem, 80%)' />
					<SkeletonLine width='min(30rem, 92%)' />
				</div>
				{lead ? (
					<div className='bb-body lg:pb-2'>
						<SkeletonLine width='94%' />
						<SkeletonLine width='60%' />
					</div>
				) : null}
			</div>
		</div>
	)
}

/** The Discover header (discover-hero.tsx): words only, on the brand band. */
function PhotoHero({ size }: { size: 'index' | 'chapter' }) {
	return (
		<header aria-hidden='true' className='brand-bg bb-lattice relative overflow-hidden'>
			<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)]'>
				<div className='max-w-4xl'>
					{size === 'chapter' ? <SkeletonLine className='mb-8 text-[0.625rem]' width='7rem' /> : null}
					<SkeletonLine className='text-[0.625rem]' width='14rem' />
					<div className={size === 'index' ? 'bb-display mt-5' : 'bb-display-md mt-5 max-w-[22ch]'}>
						<SkeletonLine width='min(30rem, 90%)' />
						<SkeletonLine width='min(24rem, 70%)' />
					</div>
					<div className='mt-6 max-w-[38rem] text-[1.0625rem] leading-[1.65]'>
						<SkeletonLine width='95%' />
						<SkeletonLine width='70%' />
					</div>
					<div className='mt-6 flex gap-2'>
						{[5, 6, 5.5, 6.5].map((w) => (
							<Skeleton key={w} className='h-7 rounded-full' style={{ width: `${w}rem` }} />
						))}
					</div>
					<Skeleton className='mt-9 size-10 rounded-full' />
				</div>
			</div>
			<div className='bb-weave' />
		</header>
	)
}

/** The primer's chapters as the bento draws them: the first large, 4 beside it. */
function BentoSkeleton() {
	return (
		<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2'>
			{Array.from({ length: 5 }, (_, i) => (
				<Skeleton
					key={i}
					className={`rounded-[3px] ${i === 0 ? 'min-h-[26rem] sm:col-span-2 lg:row-span-2 lg:min-h-[38rem]' : 'min-h-[18rem]'}`}
				/>
			))}
		</div>
	)
}

/** Two columns of running text, as the chapters and the front page open. */
function Columns({ lines = 7 }: { lines?: number }) {
	return (
		<div className='grid gap-x-12 bb-body leading-8 lg:grid-cols-2'>
			{[0, 1].map((c) => (
				<div key={c}>
					{Array.from({ length: lines }, (_, i) => (
						<SkeletonLine key={i} width={i === lines - 1 ? '45%' : `${W[(i + c * 3) % W.length]! + 14}%`} />
					))}
				</div>
			))}
		</div>
	)
}

function Status({ children }: { children: React.ReactNode }) {
	return (
		<div role='status'>
			<span className='sr-only'>Loading…</span>
			{children}
		</div>
	)
}

export function HomeSkeleton() {
	return (
		<Status>
			<section aria-hidden='true' className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-20 lg:py-32'>
					<div className='mx-auto max-w-5xl text-center'>
						<SkeletonLine className='text-[0.625rem]' width='16rem' />
						<SkeletonLine
							className='bb-display-md mt-5 [font-size:clamp(2.4rem,11vw,3.4rem)]! sm:[font-size:clamp(1.6rem,6.4vw,5rem)]!'
							width='min(44rem, 92%)'
						/>
						<div className='mx-auto mt-6 max-w-xl text-[0.9375rem] leading-7'>
							<SkeletonLine width='95%' />
							<SkeletonLine width='70%' />
						</div>
						<Skeleton className='mx-auto mt-8 h-12 w-full max-w-xl' />
						<div className='mt-6 flex justify-center gap-6 text-[0.8125rem]'>
							<SkeletonLine width='10rem' />
							<SkeletonLine width='7rem' />
						</div>
					</div>
				</div>
			</section>
			<Skeleton className='h-[4.5rem] rounded-none!' />
			<section aria-hidden='true' className='bb-container bb-section'>
				<HeadSkeleton lead />
				<div className='mt-10 flex flex-wrap gap-2'>
					{Array.from({ length: 7 }, (_, i) => (
						<Skeleton key={i} className='h-9 rounded-full' style={{ width: `${6 + (i % 3) * 1.5}rem` }} />
					))}
				</div>
				<div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{Array.from({ length: 8 }, (_, i) => (
						<Skeleton key={i} className='min-h-[13rem] sm:min-h-[16.5rem]' />
					))}
				</div>
			</section>
		</Status>
	)
}

export function DiscoverSkeleton() {
	return (
		<Status>
			<PhotoHero size='index' />
			<Skeleton className='h-[4.5rem] rounded-none!' />
			<section aria-hidden='true' className='bb-container bb-section'>
				<HeadSkeleton lead />
				<div className='mt-12'>
					<BentoSkeleton />
				</div>
			</section>
		</Status>
	)
}

export function ChapterSkeleton() {
	return (
		<Status>
			<PhotoHero size='chapter' />
			{/* The chapter tabs (chapter-grid.tsx), in grey. */}
			<div aria-hidden='true' className='border-b border-[var(--rule)]'>
				<div className='bb-container flex overflow-hidden'>
					{Array.from({ length: 5 }, (_, i) => (
						<div key={i} className='min-w-[11rem] flex-1 border-b-[3px] border-transparent px-1 py-4 pr-6'>
							<SkeletonLine className='text-[0.625rem]' width='1.25rem' />
							<SkeletonLine className='mt-1 text-[0.9375rem]' width={`${55 + (i % 3) * 12}%`} />
						</div>
					))}
				</div>
			</div>
			<section aria-hidden='true' className='bb-container bb-section'>
				<Columns />
			</section>
		</Status>
	)
}

export function NewsSkeleton() {
	return (
		<Status>
			<BandHead pad='py-16 lg:py-24' title='min(18rem, 60%)' />
			<section aria-hidden='true' className='bb-container bb-section'>
				<div className='mx-auto grid max-w-5xl gap-14'>
					{[0, 1].map((day) => (
						<div key={day}>
							<SkeletonLine className='text-[0.625rem]' width='11rem' />
							<div className='mt-4'>
								{Array.from({ length: 4 }, (_, i) => (
									<div
										key={i}
										className='grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3.5 gap-y-1 border-t border-[var(--rule)] py-5 sm:grid-cols-[5.25rem_minmax(0,1fr)] sm:gap-x-5 md:grid-cols-[6rem_minmax(0,1fr)_12rem] md:gap-x-6'
									>
										<Skeleton className='row-span-2 aspect-square self-start sm:aspect-[3/2] md:row-span-1' />
										<div className='min-w-0'>
											<SkeletonLine className='text-[1.05rem] leading-snug' width={`${W[(i + day) % W.length]}%`} />
											<div className='mt-2 text-[0.875rem] leading-[1.7]'>
												<SkeletonLine width='96%' />
												<SkeletonLine width='58%' />
											</div>
										</div>
										<div className='col-start-2 text-[0.78125rem] leading-[1.7] md:col-start-auto md:text-right'>
											<SkeletonLine width='6rem' />
											<SkeletonLine width='3.5rem' />
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</Status>
	)
}

export function ExplainersSkeleton() {
	return (
		<Status>
			<section aria-hidden='true' className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)]'>
					<SkeletonLine className='text-[0.625rem]' width='8rem' />
					<div className='bb-display-md mt-6'>
						<SkeletonLine width='min(34rem, 85%)' />
						<SkeletonLine width='min(22rem, 60%)' />
					</div>
					<SkeletonLine className='mt-7 text-[0.9375rem] leading-8' width='min(40rem, 90%)' />
				</div>
				<div className='bb-weave' />
			</section>
			<section aria-hidden='true' className='bb-container bb-section'>
				<div className='flex flex-wrap gap-2'>
					{Array.from({ length: 5 }, (_, i) => (
						<Skeleton key={i} className='h-8 rounded-full' style={{ width: `${5.5 + (i % 2) * 2}rem` }} />
					))}
				</div>
				<div className='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{Array.from({ length: 6 }, (_, i) => (
						<div key={i} className='border border-[var(--rule)]'>
							<Skeleton className='aspect-[1200/622] rounded-none!' />
							<div className='p-5'>
								<SkeletonLine className='text-[0.625rem]' width='5rem' />
								<SkeletonLine className='mt-2 text-[1.0625rem] leading-snug' width='90%' />
								<SkeletonLine className='text-[1.0625rem] leading-snug' width='60%' />
								<div className='mt-3 text-[0.8125rem] leading-6'>
									<SkeletonLine width='96%' />
									<SkeletonLine width='80%' />
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		</Status>
	)
}

export function ArticleSkeleton() {
	return (
		<Status>
			<section aria-hidden='true' className='brand-bg bb-lattice relative overflow-hidden'>
				<div className='bb-container relative py-[clamp(3.75rem,7vw,6.5rem)] text-center'>
					<SkeletonLine className='text-[0.625rem]' width='12rem' />
					<div className='mx-auto mt-6 max-w-[32ch] text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02]'>
						<SkeletonLine width='100%' />
					</div>
					<div className='mx-auto mt-6 max-w-[54em] text-[1.05rem] leading-[1.6]'>
						<SkeletonLine width='96%' />
						<SkeletonLine width='88%' />
						<SkeletonLine width='50%' />
					</div>
					<SkeletonLine className='mt-6 text-[0.8125rem]' width='9rem' />
				</div>
				<div className='bb-weave' />
			</section>
			<div aria-hidden='true' className='bb-container bb-section !pt-[clamp(2.5rem,5vw,4rem)]'>
				<div className='mx-auto max-w-[54rem] leading-[1.7]'>
					<SkeletonLine className='text-[1.375rem]' width='50%' />
					{[0, 1, 2].map((p) => (
						<div key={p} className='mt-5 text-[1rem]'>
							{Array.from({ length: 4 }, (_, i) => (
								<SkeletonLine key={i} width={i === 3 ? '40%' : `${W[(i + p * 2) % W.length]! + 16}%`} />
							))}
						</div>
					))}
					<Skeleton className='mt-8 h-64 w-full' />
				</div>
			</div>
		</Status>
	)
}

export function DirectorySkeleton() {
	return (
		<Status>
			<BandHead pad='py-16 lg:py-24' title='min(16rem, 55%)' chips={5} />
			<div aria-hidden='true' className='bb-container py-14 lg:py-20'>
				<Skeleton className='h-[5.5rem] w-full rounded-none!' />
				{/* The section tabs (switch-tabs.tsx), then the open section's line. */}
				<div className='mt-14 flex gap-8 border-b border-[var(--rule)] py-4'>
					{['11rem', '9rem', '10rem', '6rem'].map((w) => (
						<SkeletonLine key={w} className='text-[1.0625rem]' width={w} />
					))}
				</div>
				<SkeletonLine className='mt-8 text-[0.84375rem]' width='min(30rem, 80%)' />
				<div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
					{Array.from({ length: 8 }, (_, i) => (
						<div key={i} className='overflow-hidden border border-[var(--rule)]'>
							{/* The office card (directory-index-view.tsx): the logo, name, the number and the email, its head at the foot. */}
							<div className='grid h-28 place-items-center'>
								<Skeleton className='size-[4.5rem] rounded-full' />
							</div>
							<div className='px-5 pb-5 text-center'>
								<SkeletonLine className='text-[1rem] leading-snug' width={`${W[i % W.length]}%`} />
								<div className='mt-6 flex justify-center gap-2'>
									<Skeleton className='h-7 w-28 rounded-full' />
									<Skeleton className='h-7 w-36 rounded-full' />
								</div>
							</div>
							<div className='flex items-center gap-3 border-t border-[var(--rule)] px-4 py-3'>
								<Skeleton className='size-11 shrink-0 rounded-full' />
								<div className='flex-1'>
									<SkeletonLine className='text-[0.875rem] leading-tight' width='70%' />
									<SkeletonLine className='text-[0.6875rem] leading-tight' width='35%' />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Status>
	)
}
