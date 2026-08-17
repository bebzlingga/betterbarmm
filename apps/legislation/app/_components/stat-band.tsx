export type Stat = {
	label: string
	value: string | number
	detail: string
}

/**
 * A row of headline numbers. Separated by space and a single hairline rather
 * than boxed per cell — four framed panels read as four things to inspect,
 * where this reads as one summary line.
 */
export function StatBand({ stats }: { stats: Stat[] }) {
	return (
		<section className='mx-auto max-w-[88rem] px-6 lg:px-8'>
			<div className='grid gap-x-8 gap-y-10 border-y border-[var(--rule)] py-10 min-[560px]:grid-cols-2 lg:grid-cols-4'>
				{stats.map((stat) => (
					<div key={stat.label}>
						<p className='label'>{stat.label}</p>
						<p className='num mt-3 text-3xl font-semibold leading-none text-[var(--ink)]'>
							{stat.value}
						</p>
						<p className='mt-2.5 text-[13px] leading-5 text-[var(--ink-3)]'>{stat.detail}</p>
					</div>
				))}
			</div>
		</section>
	)
}
