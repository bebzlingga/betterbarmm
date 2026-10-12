import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead, longDate, peso } from '../_components/parts'
import { SVP_CEILING, blacklistedSuppliers, bunching, dominantSuppliers, overBudget, sameDayClusters, supplierHref } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Patterns',
	description:
		'Five patterns in BARMM procurement worth a second look: budgets bunched under the bidding threshold, same-day purchases that add up past it, one supplier winning most of an office’s contracts, and awards above budget.',
}

/* ============================================================
   Patterns

   Signals, not findings. Each section says what the pattern is, why the
   law cares, what innocent reasons produce it, and lists where it shows,
   so a reader can open the notices and judge for themselves.

   An index of the five up top, each with its one figure; then each in a
   band of its own: the claim and its figure left, what it rests on and
   what else could explain it right, in one paragraph, and the evidence under both.
   ============================================================ */

const TH = 'py-2.5 pr-6 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-3)] last:pr-0'
const TD = 'py-3 pr-6 align-middle last:pr-0'
const ROW = 'border-b border-[var(--rule-soft,var(--rule))] transition hover:bg-[var(--paper-2)]'
const n = (x: number) => x.toLocaleString('en-PH')

const PATTERNS = [
	{ id: 'threshold', title: 'Budgets bunched under the bidding threshold', stat: n(bunching.lastPercent), label: 'notices budgeted ₱990,000–₱999,999' },
	{ id: 'same-day', title: 'Same office, same item, same day', stat: n(sameDayClusters.length), label: 'same-day sets that pass ₱1,000,000' },
	{ id: 'one-supplier', title: 'One supplier, most of an office’s contracts', stat: n(dominantSuppliers.length), label: 'offices where one supplier won half or more' },
	{ id: 'over-budget', title: 'Awards above the approved budget', stat: n(overBudget.length), label: 'notices awarded more than their budget' },
	{ id: 'blacklist', title: 'Suppliers sharing a name with the blacklist', stat: n(blacklistedSuppliers.length), label: 'suppliers named like a barred entity' },
]

/** A section in a band of its own. */
function Pattern({
	i,
	tint,
	lead,
	also,
	children,
}: {
	i: number
	tint?: boolean
	lead: React.ReactNode
	also: React.ReactNode
	children: React.ReactNode
}) {
	const p = PATTERNS[i]!
	return (
		<section id={p.id} className={`scroll-mt-24 ${tint ? 'bg-[var(--paper-2)]' : ''}`}>
			<div className='bb-container bb-section'>
				<header className='grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)]'>
					<div>
						<p className='bb-label'>{String(i + 1).padStart(2, '0')}</p>
						<h2 className='mt-3 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>{p.title}</h2>
						<p className='mt-6'>
							<span className='num block text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>{p.stat}</span>
							<span className='mt-1.5 block text-[12.5px] leading-snug text-[var(--ink-3)]'>{p.label}</span>
						</p>
					</div>
					<div className='lg:pt-7'>
						{/* What the pattern is, then the innocent reasons that also produce it. */}
						<p className='text-[14px] leading-[1.7] text-[var(--ink-2)]'>
							{lead} {also}
						</p>
					</div>
				</header>
				<div className='mt-12'>
					{children}
				</div>
			</div>
		</section>
	)
}

/** A thin bar under a figure, against the largest in its column. */
function Bar({ value, max, tone = 'bg-[var(--accent)]' }: { value: number; max: number; tone?: string }) {
	return (
		<span className='mt-1.5 block h-1 w-full bg-[var(--rule)]' aria-hidden='true'>
			<span className={`block h-full ${tone}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
		</span>
	)
}

function Bunching() {
	const max = Math.max(...bunching.bins.map((b) => b.count), 1)
	return (
		<figure className='m-0'>
			<div className='-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
				<div className='relative min-w-[40rem]'>
					<div className='flex h-60 items-end gap-[2px] border-b border-[var(--rule)]'>
						{bunching.bins.map((b) => (
							<span
								key={b.from}
								title={`${peso(b.from)}–${peso(b.from + bunching.step - 1)}: ${n(b.count)} notices`}
								className={`flex-1 transition hover:opacity-70 ${b.from < SVP_CEILING ? 'bg-[var(--accent)]' : 'bg-[var(--ink-mute)] opacity-60'}`}
								style={{ height: `${Math.max((b.count / max) * 100, 0.5)}%` }}
							/>
						))}
					</div>
					{/* The ceiling, half-way along: ₱1M sits at bin 30 of 60. */}
					<div className='pointer-events-none absolute left-1/2 top-0 h-60 border-l border-dashed border-[var(--ink)]' aria-hidden='true' />
					<div className='mt-2 flex justify-between text-[11px] text-[var(--ink-3)]'>
						<span>₱700,000</span>
						<span className='font-semibold text-[var(--ink)]'>₱1,000,000 ceiling</span>
						<span>₱1,300,000</span>
					</div>
				</div>
			</div>
			<figcaption className='mt-6 grid gap-6 border-t border-[var(--rule)] pt-5 sm:grid-cols-3'>
				{[
					[n(bunching.justBelow), 'in the ₱100,000 just below the line'],
					[n(bunching.justAbove), 'in the ₱100,000 just above it'],
					[n(bunching.lastPercent), 'in the last ₱10,000 before it'],
				].map(([v, l]) => (
					<p key={l}>
						<span className='num block text-[1.5rem] font-extrabold tracking-[-0.03em] text-[var(--ink)]'>{v}</span>
						<span className='text-[12.5px] text-[var(--ink-3)]'>{l}</span>
					</p>
				))}
			</figcaption>
		</figure>
	)
}

export default function PatternsPage() {
	const lastMax = Math.max(...bunching.offices.map((o) => o.count), 1)
	const clusters = sameDayClusters.slice(0, 20)
	const clusterMax = Math.max(...clusters.map((c) => c.total), 1)
	const dominantMax = Math.max(...dominantSuppliers.map((d) => d.amount), 1)

	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Patterns'
				note='Five patterns in the record worth a second look. None is proof of wrongdoing: each has innocent explanations, given below. They are where a reader, an auditor or a journalist might start.'
			/>

			{/* The five at a glance, each a way down to its section. */}
			<nav aria-label='The patterns' className='border-b border-[var(--rule)]'>
				<ol className='bb-container grid grid-cols-2 lg:grid-cols-4'>
					{PATTERNS.slice(0, 4).map((p, i) => (
						<li key={p.id} className='border-[var(--rule)] max-lg:border-b max-lg:odd:border-r lg:border-r lg:first:border-l'>
							<a href={`#${p.id}`} className='group flex h-full flex-col px-5 py-5 transition sm:px-8 sm:py-7 hover:bg-[var(--paper-2)]'>
								<span className='bb-label'>{String(i + 1).padStart(2, '0')}</span>
								<span className='mt-3 min-h-[2.75em] text-[13px] sm:text-[14px] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]'>{p.title}</span>
								<span className='num pt-5 text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--accent)]'>{p.stat}</span>
								<span className='mt-1.5 text-[12px] leading-snug text-[var(--ink-3)]'>{p.label}</span>
							</a>
						</li>
					))}
				</ol>
			</nav>

			<Pattern
				i={0}
				lead={
					<>
						Under the old procurement law most offices here could skip public bidding for a purchase of up to{' '}
						<strong>₱1,000,000</strong> (small value procurement). If budgets were set by need alone, about as many would
						fall just above that line as just below it. Instead <strong>{n(bunching.justBelow)}</strong> notices sit in the
						₱100,000 below it and <strong>{n(bunching.justAbove)}</strong> in the ₱100,000 above.
					</>
				}
				also='An office may simply budget up to the most it can spend without bidding, and many goods are bought in standard lots. The worry is the other reason, a larger need cut to fit under the line.'
			>
				<Bunching />
				<div className='mt-14 overflow-x-auto'>
					<table className='w-full min-w-[34rem] border-collapse text-left text-[14px]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>Office</th>
								<th className={`${TH} w-[14rem] text-right`}>₱990,000–₱999,999</th>
								<th className={`${TH} text-right`}>All its notices</th>
							</tr>
						</thead>
						<tbody>
							{bunching.offices.map((o) => (
								<tr key={o.entity.slug} className={ROW}>
									<td className={TD}>
										<Link href={`/${o.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
											{o.entity.name}
										</Link>
									</td>
									<td className={`${TD} num text-right font-semibold`}>
										{n(o.count)}
										<Bar value={o.count} max={lastMax} />
									</td>
									<td className={`${TD} num text-right text-[var(--ink-3)]`}>{n(o.total)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Pattern>

			<Pattern
				i={1}
				tint
				lead={
					<>
						Splitting one purchase into several smaller ones to stay under a threshold is prohibited (RA 12009 IRR Sec.
						39, as it was under RA 9184). One sign of it is an office posting several notices in the same category on the
						same day, each under ₱1,000,000, that together pass it. That happens <strong>{n(sameDayClusters.length)}</strong>{' '}
						times in this record.
					</>
				}
				also='Many will be separate needs, such as catering for different events on the same day, which is why each has to be read.'
			>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[44rem] border-collapse text-left text-[14px]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>Office</th>
								<th className={TH}>Category</th>
								<th className={TH}>Day</th>
								<th className={`${TH} text-right`}>Notices</th>
								<th className={`${TH} w-[10rem] text-right`}>Together</th>
							</tr>
						</thead>
						<tbody>
							{clusters.map((c) => (
								<tr key={`${c.entity.slug}-${c.category}-${c.date}`} className={ROW}>
									<td className={TD}>
										<Link href={`/${c.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
											{c.entity.name}
										</Link>
									</td>
									<td className={`${TD} text-[var(--ink-2)]`}>{c.category}</td>
									<td className={`${TD} whitespace-nowrap text-[var(--ink-2)]`}>{longDate(c.date)}</td>
									<td className={`${TD} num text-right`}>{c.count}</td>
									<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>
										{peso(c.total)}
										<Bar value={c.total} max={clusterMax} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Pattern>

			<Pattern
				i={2}
				lead='Competitive bidding should spread contracts across suppliers over time. These are the offices with at least 10 recorded awards where a single supplier won half or more of them.'
				also='A specialised need, a remote town with one supplier, or a framework contract can all explain it; so can bidding that is not open.'
			>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[44rem] border-collapse text-left text-[14px]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>Office</th>
								<th className={TH}>Supplier</th>
								<th className={`${TH} w-[11rem] text-right`}>Share of its awards</th>
								<th className={`${TH} w-[10rem] text-right`}>Amount</th>
							</tr>
						</thead>
						<tbody>
							{dominantSuppliers.map((d) => (
								<tr key={`${d.entity.slug}-${d.supplier}`} className={ROW}>
									<td className={TD}>
										<Link href={`/${d.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
											{d.entity.name}
										</Link>
									</td>
									<td className={TD}>
										<Link href={supplierHref(d.supplier)} className='rule-link text-[var(--ink-2)]'>
											{d.supplier}
										</Link>
									</td>
									<td className={`${TD} num whitespace-nowrap text-right`}>
										<span className='font-semibold'>{Math.round((d.awards / d.of) * 100)}%</span>
										<span className='text-[var(--ink-3)]'> · {n(d.awards)} of {n(d.of)}</span>
										<Bar value={d.awards} max={d.of} />
									</td>
									<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>
										{peso(d.amount)}
										<Bar value={d.amount} max={dominantMax} tone='bg-[var(--ink)]' />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Pattern>

			<Pattern
				i={3}
				tint
				lead={`The approved budget is a ceiling: a bid above it is disqualified. Yet ${overBudget.length} notices here carry awards that add up to more.`}
				also='Several are close to double their budget, which looks like an amount entered twice at the source rather than an overpayment, but only the office’s own records can say.'
			>
				<div className='overflow-x-auto'>
					<table className='w-full min-w-[44rem] border-collapse text-left text-[14px]'>
						<thead>
							<tr className='border-b border-[var(--rule)]'>
								<th className={TH}>Office</th>
								<th className={TH}>Reference</th>
								<th className={`${TH} text-right`}>Budget</th>
								<th className={`${TH} text-right`}>Awarded</th>
								<th className={`${TH} text-right`}>Times budget</th>
							</tr>
						</thead>
						<tbody>
							{overBudget.map((o) => {
								const times = o.awarded / o.notice.abc!
								return (
									<tr key={o.notice.ref} className={ROW}>
										<td className={TD}>
											<Link href={`/${o.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
												{o.entity.name}
											</Link>
										</td>
										<td className={`${TD} num text-[var(--ink-2)]`}>
											{o.notice.ref}
											{o.notice.date ? <span className='text-[var(--ink-3)]'> · {longDate(o.notice.date)}</span> : null}
										</td>
										<td className={`${TD} num whitespace-nowrap text-right`}>{peso(o.notice.abc!)}</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{peso(o.awarded)}</td>
										<td className={`${TD} num whitespace-nowrap text-right`}>
											<span className={`inline-block min-w-[3.5rem] px-2 py-0.5 text-center text-[12.5px] font-semibold ${times >= 1.9 ? 'bg-[var(--accent)] text-[var(--paper)]' : 'bg-[var(--paper-2)] text-[var(--ink)]'}`}>
												×{times.toFixed(times < 1.1 ? 2 : 1)}
											</span>
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</Pattern>

			<Pattern
				i={4}
				lead={`The Government Procurement Policy Board keeps a public list of suppliers barred from government contracts for a period. ${blacklistedSuppliers.length} suppliers that won BARMM contracts share a name with an entity on it.`}
				also='A name is not proof it is the same business, and most of these orders came from offices elsewhere in the country. Each supplier’s page shows the orders and whether any BARMM contract fell inside one.'
			>
				<ul className='grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3'>
					{blacklistedSuppliers.map(({ supplier, entry }) => (
						<li key={supplier.name} className='border-t border-[var(--rule)]'>
							<Link href={supplierHref(supplier.name)} className='group flex items-baseline justify-between gap-4 py-3.5'>
								<span className='text-[14px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>{supplier.name}</span>
								<span className='num shrink-0 text-[12px] text-[var(--ink-3)]'>
									barred {new Date(`${entry.min_date}T00:00:00Z`).getUTCFullYear()}–{new Date(`${entry.max_date}T00:00:00Z`).getUTCFullYear()}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Pattern>

			<section className='border-t border-[var(--rule)]'>
				<div className='bb-container py-12'>
					<p className='max-w-[52rem] text-[13px] leading-6 text-[var(--ink-3)]'>
						Read from PhilGEPS as every other figure here; see{' '}
						<Link href='/sources' className='rule-link'>
							Sources
						</Link>{' '}
						for what the record leaves out, and{' '}
						<Link href='/how-it-works' className='rule-link'>
							How it works
						</Link>{' '}
						for the thresholds. Local governments have their own, lower ceilings; the ₱1,000,000 line is the one that
						applied to the region&rsquo;s ministries and offices.
					</p>
				</div>
			</section>
		</>
	)
}
