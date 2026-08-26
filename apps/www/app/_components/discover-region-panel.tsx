import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { bangsamoroDistrictSeats, bangsamoroParliament } from './discover-barmm-data'
import { PhotoFrame } from './discover-figure'
import { photo } from './discover-media'
import { BarSegment, Counter, LineReveal, OkirBloom, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'

/**
 * The six accent steps the seat bar is built from.
 *
 * A categorical palette would be wrong here: the constituencies are not
 * unrelated categories, they are shares of one 32-seat total. So the bar steps
 * one hue by lightness, largest share darkest — which stays readable under any
 * colour vision, because lightness is the channel that survives. The seventh
 * and smallest block falls back to the last step.
 */
const SEAT_TONES = [
	'var(--accent)',
	'color-mix(in oklab, var(--accent) 86%, var(--ink))',
	'color-mix(in oklab, var(--accent) 72%, var(--ink))',
	'color-mix(in oklab, var(--accent) 58%, var(--ink))',
	'color-mix(in oklab, var(--accent) 45%, var(--ink))',
	'color-mix(in oklab, var(--accent) 33%, var(--ink))',
	'color-mix(in oklab, var(--accent) 22%, var(--ink))',
]

function Stat({
	value,
	suffix,
	label,
	note,
}: {
	value: number
	suffix?: string
	label: string
	note: string
}) {
	return (
		<div className='border-t border-[var(--brass-line)] pt-6'>
			<p className='bb-figure text-[var(--ink)]'>
				<Counter value={value} suffix={suffix} />
			</p>
			<p className='mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)]'>
				{label}
			</p>
			<p className='mt-2.5 bb-body text-[var(--ink-2)]'>{note}</p>
		</div>
	)
}

/**
 * The region as figures, on the one dark panel of the page.
 *
 * It answers the question the chapters take three thousand words to get to:
 * what is actually being governed here, and by whom. The seat bar is the piece
 * that does the work — 32 district seats laid out at their true relative widths,
 * so "Lanao del Sur" reads as nearly a third of the map before the label is read
 * at all. It fills from the left as it arrives, one segment after another, so
 * the bar is assembled rather than switched on.
 *
 * Everything is transcribed from the project's own election dataset, and the
 * panel says so and links to it. A figure without a source on this site is a
 * bug.
 */
export function DiscoverRegionPanel({
	topicCount,
	peopleCount,
	momentCount,
	institutionCount,
}: {
	topicCount: number
	peopleCount: number
	momentCount: number
	institutionCount: number
}) {
	const total = bangsamoroDistrictSeats.reduce((sum, block) => sum + block.seats, 0)

	return (
		// Hairlines top and bottom. In light mode the panel announces itself by
		// being dark; in dark mode it sits a few points off the page and needs an
		// edge, or the section transition reads as a rendering artefact.
		<section className='bb-ground bb-grain bb-lattice relative isolate overflow-hidden border-y border-[var(--rule)]'>
			<OkirBloom className='absolute -right-[16%] -top-[34%] size-[min(40rem,84vw)] opacity-[0.15]' />

			<div className='bb-container relative z-2 bb-section'>
				<Rise distance={14}>
					<div className='bb-kicker'>
						<span>02</span>
						<span>The region, in figures</span>
					</div>
				</Rise>

				<div className='mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16'>
					<div>
						<LineReveal
							as='h2'
							lines={['One region.', 'Eighty seats.']}
							className='bb-display-md text-[var(--ink)]'
							lineClassName={[undefined, 'bb-mute']}
						/>

						<Rise delay={0.2} distance={16}>
							<p className='mt-8 max-w-2xl bb-body text-[var(--ink-2)]'>
								BARMM is the only autonomous region in the Philippines with its own parliament. On{' '}
								<strong className='font-semibold text-[var(--ink)]'>
									{bangsamoroParliament.electionDay}
								</strong>
								, its voters elect all {bangsamoroParliament.totalSeats} members for the first time —{' '}
								{bangsamoroParliament.partyRepresentativeSeats} by party, {total} by district, and{' '}
								{bangsamoroParliament.reservedSeats} reserved for sectors the Organic Law names. That
								Parliament then chooses the Chief Minister.
							</p>
						</Rise>

						{/* ---- The seat bar ---- */}
						<div className='mt-14'>
							<Rise distance={12}>
								<div className='flex items-baseline justify-between gap-4'>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-3)]'>
										District seats by constituency
									</p>
									<p className='num text-[13px] text-[var(--ink-3)]'>{total} of 80</p>
								</div>
							</Rise>

							<div className='bb-bar mt-4'>
								{bangsamoroDistrictSeats.map((block, index) => (
									<BarSegment
										key={block.constituency}
										index={index}
										className='bb-bar-seg h-full origin-left'
										style={{
											width: `${(block.seats / total) * 100}%`,
											background: SEAT_TONES[index] ?? SEAT_TONES.at(-1),
										}}
										title={`${block.constituency}: ${block.seats} seats`}
									/>
								))}
							</div>

							<Stagger gap={0.05} className='mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2'>
								{bangsamoroDistrictSeats.map((block, index) => (
									<StaggerItem key={block.constituency} distance={10}>
										<div className='flex items-center gap-3 border-b border-[var(--rule-soft)] pb-3'>
											<span
												aria-hidden='true'
												className='size-2.5 shrink-0 rotate-45'
												style={{ background: SEAT_TONES[index] ?? SEAT_TONES.at(-1) }}
											/>
											<span className='min-w-0 flex-1 truncate text-[13px] text-[var(--ink-2)]'>
												{block.constituency}
											</span>
											<span className='num text-[13px] font-semibold text-[var(--ink)]'>
												{block.seats}
											</span>
										</div>
									</StaggerItem>
								))}
							</Stagger>

							<Rise delay={0.1} distance={12}>
								<p className='mt-7 max-w-2xl text-[12.5px] leading-6 text-[var(--ink-3)]'>
									Sulu is not on this list. The Supreme Court excluded it from BARMM, so it is not a
									constituency with no seats — it is no longer part of the region. Seat figures come
									from the{' '}
									<a
										href={bangsamoroParliament.source.href}
										target='_blank'
										rel='noreferrer'
										className='rule-link'
									>
										{bangsamoroParliament.source.label}
									</a>
									, which carries the COMELEC and Parliament records behind each one.
								</p>
							</Rise>
						</div>
					</div>

					{/* The chamber the seats are actually in — the bar on the left is an
					    abstraction, and the picture is what it abstracts. */}
					<div className='lg:sticky lg:top-24 lg:self-start'>
						<PhotoFrame
							photo={photo('parliamentHall')}
							className='aspect-[16/10]'
							sizes='(min-width: 1024px) 34vw, 100vw'
							delay={0.12}
						/>

						<a
							href='/soon'
							className='group mt-6 flex items-center justify-between gap-4 border-t border-[var(--brass-line)] py-5 transition hover:border-[var(--accent)]'
						>
							<span>
								<span className='block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)]'>
									Go deeper
								</span>
								<span className='mt-1.5 block text-[15px] font-semibold text-[var(--ink)]'>
									The 2026 Election workspace
								</span>
							</span>
							<ArrowUpRightIcon
								className='size-5 shrink-0 text-[var(--ink-3)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]'
								aria-hidden='true'
							/>
						</a>
					</div>
				</div>

				{/* ---- What this guide holds ----

				    A band across the full measure rather than a column stacked beside
				    the seat bar, which left the two sides wildly different heights and
				    a hole under the shorter one. */}
				<Stagger
					gap={0.09}
					className='mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4'
				>
					<StaggerItem>
						<Stat
							value={peopleCount}
							label='Peoples'
							note='Moro, Indigenous, and settler communities documented by BCPCH.'
						/>
					</StaggerItem>
					<StaggerItem>
						<Stat
							value={momentCount}
							label='Moments'
							note='From the sultanates to the first regular parliamentary election.'
						/>
					</StaggerItem>
					<StaggerItem>
						<Stat
							value={institutionCount}
							label='Institutions'
							note='Ministries, commissions, and offices mapped in plain language.'
						/>
					</StaggerItem>
					<StaggerItem>
						<Stat
							value={topicCount}
							label='Chapters'
							note='History, government, people, and the places that hold them.'
						/>
					</StaggerItem>
				</Stagger>
			</div>
		</section>
	)
}
