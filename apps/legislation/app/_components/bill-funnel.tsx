/* ============================================================
   Where the bills actually are

   One bar, divided by stage in the order a bill travels them (user decision:
   the ring it replaced spent most of its slices as slivers too thin to read
   or hover). A thin gap of surface divides each stage from the next; the
   rows under the bar carry each stage's count, share and meaning, so a 1%
   stage is read there rather than from its sliver.

   The color is a one-hue ramp rather than the status tones the badges use.
   Stages are a sequence, which makes this ordinal, and ordinal data takes
   lightness steps so the order is visible in the color itself. The badge
   tones are also measurably unsafe at this size — the committee and early
   hues sit ΔE 3.7 apart under deuteranopia. See `--funnel-1..4` in the
   stylesheet.
   ============================================================ */

export type FunnelSlice = {
	label: string
	count: number
	/** A `--funnel-*` token. */
	color: string
	/** What the stage means, one line. */
	note: string
}

export function BillFunnel({ slices, total }: { slices: FunnelSlice[]; total: number }) {
	const share = (count: number) => (count / total) * 100

	return (
		<figure className='mx-auto max-w-5xl text-left'>
			<div
				className='flex h-14 gap-[2px] overflow-hidden rounded-[4px]'
				role='img'
				aria-label={`Distribution of ${total.toLocaleString()} bills across stages. ${slices
					.map((slice) => `${slice.label}, ${slice.count}`)
					.join('. ')}.`}
			>
				{slices.map((slice) => (
					<div
						key={slice.label}
						title={`${slice.label}: ${slice.count.toLocaleString()} of ${total.toLocaleString()}`}
						// A floor of a few pixels, so a stage of 5 is still a mark.
						className='h-full min-w-[4px]'
						style={{ flexGrow: slice.count, flexBasis: 0, background: slice.color }}
					/>
				))}
			</div>

			<figcaption className='mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5'>
				{slices.map((slice) => {
					const pct = share(slice.count)
					return (
						<div key={slice.label} className='border-t border-[var(--rule)] pt-4'>
							<p className='flex items-center gap-2'>
								<span aria-hidden='true' className='size-2.5 shrink-0 rounded-full' style={{ background: slice.color }} />
								<span className='item-title text-[var(--ink)]'>{slice.label}</span>
							</p>
							<p className='mt-2 flex items-baseline gap-2'>
								<span className='num text-[1.375rem] font-semibold leading-none text-[var(--ink)]'>{slice.count.toLocaleString()}</span>
								<span className='num text-[0.8125rem] text-[var(--ink-3)]'>{pct < 1 ? '<1' : Math.round(pct)}%</span>
							</p>
							<p className='mt-2 text-[0.8125rem] leading-[1.55] text-[var(--ink-3)]'>{slice.note}</p>
						</div>
					)
				})}
			</figcaption>
		</figure>
	)
}
