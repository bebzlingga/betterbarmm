import Link from 'next/link'
import { lgsf } from '@betterbarmm/lgu-data/lgsf'

const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : `₱${(n / 1e6).toFixed(1)}M`)

/**
 * The Local Government Support Fund projects DBM lists for one LGU, its own
 * only: a province's page does not count its towns'. Newest first.
 */
export function LgsfReceived({ unitKey, name }: { unitKey: string; name: string }) {
	const projects = lgsf.projects
		.filter((p) => p.unit === unitKey)
		.sort((a, b) => b.year - a.year || (b.saro ?? 0) - (a.saro ?? 0))
	const allotted = projects.reduce((t, p) => t + (p.saro ?? 0), 0)
	const released = projects.reduce((t, p) => t + (p.nca ?? 0), 0)

	return (
		<>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 className='font-[family-name:var(--font-display)] text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
					Support fund received
				</h2>
				<Link href='/lgsf' className='rule-link text-[12.5px] text-[var(--ink-3)]'>
					Every project in BARMM
				</Link>
			</div>

			{projects.length ? (
				<>
					<p className='mt-3 text-[13px] text-[var(--ink-3)]'>
						<span className='num font-semibold text-[var(--ink)]'>{projects.length}</span>{' '}
						{projects.length === 1 ? 'project' : 'projects'} from DBM&rsquo;s Local Government Support Fund ·{' '}
						<span className='num font-semibold text-[var(--ink)]'>{peso(allotted)}</span> allotted ·{' '}
						<span className='num font-semibold text-[var(--ink)]'>{peso(released)}</span> released
					</p>
					<ul className='mt-6 border-t border-[var(--ink)]'>
						{projects.map((p, i) => (
							<li key={i} className='flex items-start justify-between gap-6 border-b border-[var(--rule)] py-4'>
								<div className='min-w-0'>
									<p className='text-[14.5px] font-semibold leading-6 text-[var(--ink)]'>{p.project}</p>
									<p className='mt-1 text-[12px] text-[var(--ink-3)]'>
										FY {p.year} · {p.program}
										{p.barangay ? ` · Barangay ${p.barangay}` : ''}
									</p>
								</div>
								<div className='shrink-0 text-right'>
									<p className='num text-[14.5px] text-[var(--ink)]'>{p.saro == null ? '—' : peso(p.saro)}</p>
									<p className='num mt-1 text-[12px] text-[var(--ink-3)]'>
										{p.nca == null ? 'Not yet released' : `${peso(p.nca)} released`}
									</p>
								</div>
							</li>
						))}
					</ul>
				</>
			) : (
				<p className='mt-3 text-[14px] leading-6 text-[var(--ink-3)]'>
					DBM lists no Local Government Support Fund project for {name} from FY 2022 to 2026.
				</p>
			)}
		</>
	)
}
