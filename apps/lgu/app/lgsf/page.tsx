import type { Metadata } from 'next'
import { lguProvinces } from '@betterbarmm/lgu-data'
import { lgsf } from '@betterbarmm/lgu-data/lgsf'
import { LguMasthead } from '../_components/lgu-parts'
import { LgsfExplorer, type LgsfRow } from '../_components/lgsf-explorer'

export const metadata: Metadata = {
	title: 'Local Government Support Fund — Local government directory',
	description:
		'Every Local Government Support Fund project DBM lists for a BARMM province, city or municipality: what it is for, how much was allotted and how much cash has been released, FY 2023 to 2026.',
}

/* The Bangsamoro Government's own fund for its LGUs, from each year's
   appropriations act: the program total, in pesos. FY 2026 renamed it. */
const BARMM_FUND = [
	{ year: 2022, amount: 1_394_016_000, act: 23 },
	{ year: 2023, amount: 2_297_491_000, act: 32 },
	{ year: 2024, amount: 6_536_000_000, act: 56 },
	{ year: 2025, amount: 10_153_071_200, act: 65 },
	{ year: 2026, amount: 5_206_146_100, act: 85 },
]

/* Directory names by key, so a row reads the way the rest of the site does. */
const NAMES = new Map(
	lguProvinces.flatMap((province) => [
		[province.slug, province.name] as const,
		...province.municipalities.map((unit) => [`${province.slug}/${unit.slug}`, unit.name] as const),
	]),
)

export default function LgsfPage() {
	const rows: LgsfRow[] = lgsf.projects.map((p, i) => ({
		key: String(i),
		href: `/${p.unit}`,
		project: p.project,
		lgu: NAMES.get(p.unit) ?? p.lgu ?? p.province,
		area: NAMES.get(p.unit.split('/')[0]) ?? p.province,
		barangay: p.barangay,
		program: p.program,
		year: p.year,
		saro: p.saro,
		nca: p.nca,
	}))

	const years = [...new Set(rows.map((r) => r.year))].sort()
	const byYear = years.map((year) => ({
		year,
		total: rows.filter((r) => r.year === year).reduce((t, r) => t + (r.saro ?? 0), 0),
	}))
	const top = Math.max(...byYear.map((y) => y.total))
	const cols = { gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }

	return (
		<>
			<LguMasthead
				kicker='The money · Bangsamoro'
				name='Support fund'
				noteBeside
				noteEnd
				chart
				note='On top of its NTA, a town or province can be given money from the national Local Government Support Fund for a named project: a rescue vehicle, a day care centre, food packs. This is every one DBM lists for BARMM. Allotted is what was approved; released is the cash sent so far.'
			>
				<figure className='m-0 mt-16 lg:mt-20'>
					<div className='grid h-40 items-end gap-3 sm:gap-6' style={cols}>
						{byYear.map(({ year, total }) => (
							<div key={year} className='flex h-full flex-col items-center justify-end'>
								<span className='num mb-1.5 text-[11px] text-[var(--ink-2)] sm:text-[12.5px]'>
									₱{total >= 1e9 ? `${(total / 1e9).toFixed(2)}B` : `${Math.round(total / 1e6)}M`}
								</span>
								<div className='w-full max-w-16' style={{ height: `calc(${(total / top) * 100}% - 1.5rem)`, background: 'linear-gradient(to top, transparent, var(--accent))' }} />
							</div>
						))}
					</div>
					<div className='grid gap-3 border-t border-[var(--rule)] pt-2 sm:gap-6' style={cols}>
						{byYear.map(({ year }) => (
							<span key={year} className='num text-center text-[12px] text-[var(--ink-3)]'>
								{year}
							</span>
						))}
					</div>
					<figcaption className='mt-4 text-[12.5px] font-semibold text-[var(--ink)]'>
						DBM&rsquo;s support fund allotted to BARMM&rsquo;s local governments, by year
					</figcaption>
				</figure>
			</LguMasthead>

			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container grid gap-8 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20'>
					<div>
						<h2 className='text-[1.25rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>BARMM has a support fund of its own</h2>
						<p className='mt-3 text-[15px] leading-7 text-[var(--ink-2)]'>
							Besides DBM&rsquo;s, the Bangsamoro budget sets aside a Local Government Support Fund for the
							region&rsquo;s provinces, cities, towns and barangays, renamed in FY 2026 the Sustainable Assistance
							Mechanism for Local Moral Governance. Which local governments receive it, and for what, has not been
							published yet, so none of it is in the list below. Each must report its use every quarter to MILG
							and MFBM and post it under Full Disclosure; we will add it here once the recipients are out.
						</p>
					</div>
					<dl className='grid content-start'>
						{BARMM_FUND.map((f) => (
							<div key={f.year} className='flex items-baseline justify-between gap-4 border-b border-[var(--rule)] py-2.5'>
								<dt className='text-[13.5px] text-[var(--ink-3)]'>
									FY {f.year}{' '}
									<a href={`https://legislation.betterbarmm.com/acts/${f.act}`} className='rule-link text-[12px]'>
										BAA {f.act}
									</a>
								</dt>
								<dd className='num text-[15px] font-semibold text-[var(--ink)]'>₱{(f.amount / 1e9).toFixed(2)}B</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<section className='bb-container bb-section'>
				<LgsfExplorer rows={rows} years={years} programs={lgsf.programs.filter((p) => rows.some((r) => r.program === p.code))} />

				<div className='mt-10 space-y-2 text-[13px] leading-6 text-[var(--ink-3)]'>
					<p>
						<strong className='font-semibold text-[var(--ink-2)]'>Allotted</strong> is the Special Allotment
						Release Order (SARO), the authority to spend.{' '}
						<strong className='font-semibold text-[var(--ink-2)]'>Released</strong> is the Notice of Cash
						Allocation (NCA), the cash itself. They are the same money, so they are never added. A release says
						what a local government was given, not what it built.
					</p>
					<p>
						Source:{' '}
						<a href='https://compass.dbm.gov.ph/lgsf' target='_blank' rel='noreferrer' className='rule-link'>
							DBM COMPASS, Local Government Support Fund
						</a>
						, FY 2022–2026. BARMM&rsquo;s local governments appear only under Financial Assistance to LGUs, the
						Growth Equity Fund and the Green, Green, Green Program. Sulu, in BARMM until 2024, is left out, as is
						Isabela City, which DBM files under BARMM but is in Region IX.
					</p>
				</div>
			</section>
		</>
	)
}
