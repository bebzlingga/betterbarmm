import type { Metadata } from 'next'
import Link from 'next/link'
import { areaHref, lguProvinces } from '@betterbarmm/lgu-data'
import { areaNta, ntaShare, ntaShares } from '@betterbarmm/lgu-data/nta'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'National Tax Allotment — Local government directory',
	description:
		'The National Tax Allotment DBM set for every BARMM province, city, municipality and its barangays for FY 2027: the regional total, the split by level, each province, and the 10 highest shares in each.',
}

const [PREV, YEAR] = [ntaShares.years.at(-2)!, ntaShares.years.at(-1)!]
const peso = (v: number) => `₱${Math.round(v).toLocaleString('en-PH')}`
const pct = (part: number, whole: number) => `${((part / whole) * 100).toFixed(1)}%`

/* Each area's allocation by level, the largest first. */
const AREAS = lguProvinces
	.map((province) => ({ province, now: areaNta(province.slug, YEAR), before: areaNta(province.slug, PREV) }))
	.sort((a, b) => b.now.total - a.now.total)
const sum = (pick: (a: (typeof AREAS)[number]['now']) => number, when: 'now' | 'before' = 'now') => AREAS.reduce((t, a) => t + pick(a[when]), 0)
const TOTAL = sum((a) => a.total)
const TOTAL_BEFORE = sum((a) => a.total, 'before')
const LEVELS = [
	// Fixed hues: the masthead's brand red sets --ink and --accent both to white.
	{ label: 'Provincial governments', value: sum((a) => a.province), color: '#ffffff' },
	{ label: 'Cities and municipalities', value: sum((a) => a.lgus), color: '#f6cf7a' },
	{ label: 'Barangays', value: sum((a) => a.barangays), color: '#4a0f08' },
]

/** A 100% bar and its legend: one row of shares that always adds up. `percent` when the values are already shares. */
function Split({ parts, whole, percent = false }: { parts: { label: string; value: number; color: string }[]; whole: number; percent?: boolean }) {
	return (
		<div>
			<div className='flex h-10 gap-1' role='img' aria-label={parts.map((p) => `${p.label} ${pct(p.value, whole)}`).join(', ')}>
				{parts.map((p) => (
					<div key={p.label} style={{ flex: p.value, background: p.color }} title={`${p.label}: ${peso(p.value)}`} />
				))}
			</div>
			<div className='mt-4 grid gap-4 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))]' style={{ '--n': parts.length } as React.CSSProperties}>
				{parts.map((p) => (
					<div key={p.label} className='border-t-4 pt-3' style={{ borderColor: p.color }}>
						<p className='text-[0.8125rem] font-semibold text-[var(--ink-2)]'>{p.label}</p>
						<p className='num mt-1 text-[1.125rem] font-semibold text-[var(--ink)]'>{percent ? `${p.value}%` : peso(p.value)}</p>
						{percent ? null : <p className='text-[0.75rem] text-[var(--ink-3)]'>{pct(p.value, whole)} of it</p>}
					</div>
				))}
			</div>
		</div>
	)
}

const H2 = 'dv-title'

export default function NtaPage() {
	return (
		<>
			<LguMasthead
				kicker='The money · Bangsamoro'
				name='National Tax Allotment'
				chart
				note={`Every local government’s share of national taxes, as the Department of Budget and Management set it for FY ${YEAR}. It is an allocation, not what each treasury has received, and for most of BARMM’s local governments it is nearly all of their income.`}
			>
				<div className='mt-14 lg:mt-16'>
					<p className='bb-label'>BARMM, FY {YEAR}</p>
					<p className='num mt-2 text-[2.25rem] font-bold leading-none text-[var(--accent)] sm:text-[3.5rem]'>{peso(TOTAL)}</p>
					<p className='mt-3 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
						For 5 provinces, 3 cities, {lguProvinces.flatMap((p) => p.municipalities).filter((m) => !m.isCity).length} municipalities and{' '}
						{lguProvinces.flatMap((p) => p.municipalities).reduce((t, m) => t + m.barangays.length, 0).toLocaleString('en-PH')} barangays.{' '}
						<strong className='font-semibold text-[var(--ink)]'>Up {pct(TOTAL - TOTAL_BEFORE, TOTAL_BEFORE)}</strong> from {peso(TOTAL_BEFORE)} in FY {PREV}.
					</p>
					<div className='mt-8'>
						<Split parts={LEVELS} whole={TOTAL} />
					</div>
				</div>
			</LguMasthead>

			<section className='bb-container bb-section'>
				<h2 className={H2}>By province</h2>
				<p className='mt-2 text-[0.875rem] text-[var(--ink-3)]'>Each area’s whole allocation, barangays included, and how it is split.</p>
				<div className='mt-6 overflow-x-auto'>
					<table className='w-full min-w-[56rem] border-collapse text-[0.875rem]'>
						<thead>
							<tr className='border-b border-[var(--rule)] text-left font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-3)]'>
								<th className='py-2 pr-4 font-semibold'>Area</th>
								<th className='py-2 pr-4 text-right font-semibold'>FY {PREV}</th>
								<th className='py-2 pr-4 text-right font-semibold'>FY {YEAR}</th>
								<th className='py-2 pr-4 text-right font-semibold'>Change</th>
								<th className='py-2 pr-4 text-right font-semibold'>Province gov&rsquo;t</th>
								<th className='py-2 pr-4 text-right font-semibold'>Cities &amp; municipalities</th>
								<th className='py-2 text-right font-semibold'>Barangays</th>
							</tr>
						</thead>
						<tbody>
							{AREAS.map(({ province, now, before }) => (
								<tr key={province.slug} className='border-b border-[var(--rule)]'>
									<td className='py-3 pr-4 font-semibold'>
										<Link href={areaHref(province)} className='rule-link'>
											{province.name}
										</Link>
									</td>
									<td className='num py-3 pr-4 text-right text-[var(--ink-3)]'>{peso(before.total)}</td>
									<td className='num py-3 pr-4 text-right font-semibold'>{peso(now.total)}</td>
									<td className='num py-3 pr-4 text-right text-[var(--ink-2)]'>+{pct(now.total - before.total, before.total)}</td>
									<td className='num py-3 pr-4 text-right'>{now.province ? peso(now.province) : '—'}</td>
									<td className='num py-3 pr-4 text-right'>{peso(now.lgus)}</td>
									<td className='num py-3 text-right'>{peso(now.barangays)}</td>
								</tr>
							))}
							<tr className='font-semibold'>
								<td className='py-3 pr-4'>BARMM</td>
								<td className='num py-3 pr-4 text-right text-[var(--ink-3)]'>{peso(TOTAL_BEFORE)}</td>
								<td className='num py-3 pr-4 text-right'>{peso(TOTAL)}</td>
								<td className='num py-3 pr-4 text-right text-[var(--ink-2)]'>+{pct(TOTAL - TOTAL_BEFORE, TOTAL_BEFORE)}</td>
								{LEVELS.map((l) => (
									<td key={l.label} className='num py-3 pr-4 text-right last:pr-0'>
										{peso(l.value)}
									</td>
								))}
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className='bg-[var(--paper-2)]'>
				<div className='bb-container bb-section'>
					<h2 className={H2}>The 10 highest shares in each province</h2>
					<p className='mt-2 text-[0.875rem] text-[var(--ink-3)]'>Each city’s or municipality’s own share for FY {YEAR}; its barangays get theirs separately.</p>
					<div className='mt-8 grid gap-6 lg:grid-cols-2'>
						{AREAS.filter(({ province }) => province.municipalities.length > 1).map(({ province }) => {
							const ranked = province.municipalities
								.map((unit) => ({ unit, share: ntaShare(`${province.slug}/${unit.slug}`, YEAR) }))
								.filter((r): r is { unit: (typeof r)['unit']; share: number } => r.share != null)
								.sort((a, b) => b.share - a.share)
							const top = ranked.slice(0, 10)
							const missing = province.municipalities.filter((unit) => ntaShare(`${province.slug}/${unit.slug}`, YEAR) == null)
							return (
								<div key={province.slug} className='bg-[var(--paper)] p-5 sm:p-6'>
									<h3 className='text-[1.125rem] font-extrabold tracking-[-0.01em] text-[var(--ink)]'>{province.name}</h3>
									<p className='text-[0.75rem] text-[var(--ink-3)]'>
										{ranked.length > 10 ? `Top 10 of ${province.municipalities.length}` : `${ranked.length} of ${province.municipalities.length}`}
									</p>
									<ol className='mt-4 space-y-2'>
										{top.map(({ unit, share }, i) => (
											<li key={unit.slug} className='grid grid-cols-[1.5rem_minmax(0,9rem)_1fr] items-center gap-2 text-[0.8125rem] sm:grid-cols-[1.5rem_11rem_1fr]'>
												<span className='num text-[0.6875rem] text-[var(--ink-3)]'>{String(i + 1).padStart(2, '0')}</span>
												<Link href={`/${province.slug}/${unit.slug}`} className='rule-link truncate font-semibold'>
													{unit.name}
													{unit.isCity ? ' City' : ''}
												</Link>
												<span className='flex min-w-0 items-center gap-2'>
													<span
														className='h-3 shrink-0'
														style={{ width: `${(share / top[0]!.share) * 55}%`, background: i === 0 ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 45%, var(--paper))' }}
													/>
													<span className='num whitespace-nowrap text-[0.75rem] text-[var(--ink-2)]'>{peso(share)}</span>
												</span>
											</li>
										))}
									</ol>
									{missing.length ? (
										<p className='mt-3 text-[0.75rem] text-[var(--ink-3)]'>
											{missing.map((m) => m.name).join(' and ')}: no municipal share listed by DBM yet, only for their barangays.
										</p>
									) : null}
									<p className='mt-4 text-right text-[0.78125rem]'>
										<Link href={areaHref(province)} className='rule-link'>
											Every LGU in {province.name} &rarr;
										</Link>
									</p>
								</div>
							)
						})}
					</div>
				</div>
			</section>

			<section className='bb-container bb-section'>
				<h2 className={H2}>How each share is set</h2>
				<div className='mt-6 grid gap-10 lg:grid-cols-2'>
					<div>
						<p className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
							40% of national taxes go to local governments (Local Government Code, Section 284). Since FY 2022, after the
							Supreme Court&rsquo;s Mandanas ruling, that 40% counts all national taxes, not only those the BIR collects.
							It is split by level, then among the units of each level (Section 285).
						</p>
					</div>
					<div className='space-y-6'>
						<Split
							parts={[
								{ label: 'Provinces', value: 23, color: 'var(--accent)' },
								{ label: 'Cities', value: 23, color: '#2f6b4a' },
								{ label: 'Municipalities', value: 34, color: '#5e7c9a' },
								{ label: 'Barangays', value: 20, color: '#c98a2b' },
							]}
							whole={100}
							percent
						/>
						<p className='text-[0.875rem] leading-6 text-[var(--ink-2)]'>
							Among provinces, cities or municipalities: <strong className='font-semibold'>50% by population, 25% by land area, 25% shared equally</strong>. Among barangays: 60% by population, 40% shared equally.
						</p>
					</div>
				</div>

				<div className='mt-12 space-y-2 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					<p>
						Source:{' '}
						<a href='https://compass.dbm.gov.ph/nta' target='_blank' rel='noreferrer' className='rule-link'>
							DBM COMPASS, National Tax Allotment
						</a>
						, FY {PREV} and FY {YEAR}; the sharing rules from the{' '}
						<a href='https://lawphil.net/statutes/repacts/ra1991/ra_7160_1991.html' target='_blank' rel='noreferrer' className='rule-link'>
							Local Government Code
						</a>{' '}
						and{' '}
						<a href='https://lawphil.net/judjuris/juri2018/jul2018/gr_199802_2018.html' target='_blank' rel='noreferrer' className='rule-link'>
							Mandanas v. Ochoa
						</a>
						. What each treasurer reported actually receiving is on{' '}
						<Link href='/finances' className='rule-link'>
							LGU finances
						</Link>
						.
					</p>
				</div>
			</section>
		</>
	)
}
