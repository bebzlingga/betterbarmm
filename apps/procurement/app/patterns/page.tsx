import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead, longDate, peso } from '../_components/parts'
import { SVP_CEILING, bunching, dominantSuppliers, overBudget, sameDayClusters } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Patterns',
	description:
		'Four patterns in BARMM procurement worth a second look: budgets bunched under the bidding threshold, same-day purchases that add up past it, one supplier winning most of an office’s contracts, and awards above budget.',
}

/* ============================================================
   Patterns

   Signals, not findings. Each section says what the pattern is, why the
   law cares, what innocent reasons produce it, and lists where it shows,
   so a reader can open the notices and judge for themselves.
   ============================================================ */

const H2 = 'text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 max-w-[46rem] text-[15px] leading-7 text-[var(--ink-2)]'
const TH = 'py-2.5 pr-6 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] last:pr-0'
const TD = 'py-3 pr-6 align-top last:pr-0'
const n = (x: number) => x.toLocaleString('en-PH')

function Bunching() {
	const max = Math.max(...bunching.bins.map((b) => b.count), 1)
	return (
		<figure className='m-0 mt-10'>
			<div className='-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0'>
				<div className='relative min-w-[40rem]'>
					<div className='flex h-56 items-end gap-[2px] border-b border-[var(--rule)]'>
						{bunching.bins.map((b) => (
							<span
								key={b.from}
								title={`${peso(b.from)}–${peso(b.from + bunching.step - 1)}: ${n(b.count)} notices`}
								className={`flex-1 ${b.from < SVP_CEILING ? 'bg-[var(--accent)]' : 'bg-[var(--ink-mute)] opacity-60'}`}
								style={{ height: `${Math.max((b.count / max) * 100, 0.5)}%` }}
							/>
						))}
					</div>
					{/* The ceiling, half-way along: ₱1M sits at bin 30 of 60. */}
					<div className='pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-[var(--ink)]' aria-hidden='true' />
					<div className='mt-2 flex justify-between text-[11px] text-[var(--ink-3)]'>
						<span>₱700,000</span>
						<span className='font-semibold text-[var(--ink)]'>₱1,000,000</span>
						<span>₱1,300,000</span>
					</div>
				</div>
			</div>
			<figcaption className='mt-3 text-[12.5px] text-[var(--ink-3)]'>
				Notices by approved budget, in ₱10,000 steps. Red is under the ₱1,000,000 ceiling, grey above it.
			</figcaption>
		</figure>
	)
}

export default function PatternsPage() {
	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Patterns'
				note='Four patterns in the record worth a second look. None is proof of wrongdoing: each has innocent explanations, given below. They are where a reader, an auditor or a journalist might start.'
			/>

			<div className='bb-container bb-section [&>section+section]:mt-24'>
				<section>
					<p className='bb-label'>01</p>
					<h2 className={`${H2} mt-3`}>Budgets bunched under the bidding threshold</h2>
					<p className={P}>
						Under the old procurement law most offices here could skip public bidding for a purchase of up to{' '}
						<strong>₱1,000,000</strong> (small value procurement). If budgets were set by need alone, about as many
						would fall just above that line as just below it. Instead <strong>{n(bunching.justBelow)}</strong> notices
						sit in the ₱100,000 below it and <strong>{n(bunching.justAbove)}</strong> in the ₱100,000 above, and{' '}
						<strong>{n(bunching.lastPercent)}</strong> fall between ₱990,000 and ₱999,999.
					</p>
					<Bunching />
					<p className={P}>
						Innocent reasons: an office may simply budget up to the most it can spend without bidding, and many goods
						are bought in standard lots. The worry is the other reason, a larger need cut to fit under the line. The
						offices with the most notices in that last ₱10,000:
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[34rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className={TH}>Office</th>
									<th className={`${TH} text-right`}>₱990,000–₱999,999</th>
									<th className={`${TH} text-right`}>All its notices</th>
								</tr>
							</thead>
							<tbody>
								{bunching.offices.map((o) => (
									<tr key={o.entity.slug} className='border-b border-[var(--rule-soft,var(--rule))]'>
										<td className={TD}>
											<Link href={`/${o.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
												{o.entity.name}
											</Link>
										</td>
										<td className={`${TD} num text-right font-semibold`}>{n(o.count)}</td>
										<td className={`${TD} num text-right text-[var(--ink-3)]`}>{n(o.total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<p className='bb-label'>02</p>
					<h2 className={`${H2} mt-3`}>Same office, same item, same day</h2>
					<p className={P}>
						Splitting one purchase into several smaller ones to stay under a threshold is prohibited (RA 12009 IRR
						Sec. 39, as it was under RA 9184). One sign of it is an office posting several notices in the same category
						on the same day, each under ₱1,000,000, that together pass it. That happens{' '}
						<strong>{n(sameDayClusters.length)}</strong> times in this record. Many will be separate needs, such as
						catering for different events, which is why each has to be read. The largest:
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[40rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className={TH}>Office</th>
									<th className={TH}>Category</th>
									<th className={TH}>Day</th>
									<th className={`${TH} text-right`}>Notices</th>
									<th className={`${TH} text-right`}>Together</th>
								</tr>
							</thead>
							<tbody>
								{sameDayClusters.slice(0, 20).map((c) => (
									<tr key={`${c.entity.slug}-${c.category}-${c.date}`} className='border-b border-[var(--rule-soft,var(--rule))]'>
										<td className={TD}>
											<Link href={`/${c.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
												{c.entity.name}
											</Link>
										</td>
										<td className={`${TD} text-[var(--ink-2)]`}>{c.category}</td>
										<td className={`${TD} whitespace-nowrap text-[var(--ink-2)]`}>{longDate(c.date)}</td>
										<td className={`${TD} num text-right`}>{c.count}</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{peso(c.total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<p className='bb-label'>03</p>
					<h2 className={`${H2} mt-3`}>One supplier, most of an office&rsquo;s contracts</h2>
					<p className={P}>
						Competitive bidding should spread contracts across suppliers over time. Below are the offices with at least
						10 recorded awards where a single supplier won half or more of them. A specialised need, a remote town
						with one supplier, or a framework contract can all explain it; so can bidding that is not open.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[40rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className={TH}>Office</th>
									<th className={TH}>Supplier</th>
									<th className={`${TH} text-right`}>Won</th>
									<th className={`${TH} text-right`}>Amount</th>
								</tr>
							</thead>
							<tbody>
								{dominantSuppliers.map((d) => (
									<tr key={`${d.entity.slug}-${d.supplier}`} className='border-b border-[var(--rule-soft,var(--rule))]'>
										<td className={TD}>
											<Link href={`/${d.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
												{d.entity.name}
											</Link>
										</td>
										<td className={TD}>
											<Link href={`/notices?supplier=${encodeURIComponent(d.supplier)}`} className='rule-link text-[var(--ink-2)]'>
												{d.supplier}
											</Link>
										</td>
										<td className={`${TD} num whitespace-nowrap text-right`}>
											<span className='font-semibold'>{n(d.awards)}</span> of {n(d.of)} ({Math.round((d.awards / d.of) * 100)}%)
										</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{peso(d.amount)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<p className='bb-label'>04</p>
					<h2 className={`${H2} mt-3`}>Awards above the approved budget</h2>
					<p className={P}>
						{`The approved budget is a ceiling: a bid above it is disqualified. Yet ${overBudget.length} notices here carry awards that add up to more. `}Several are close to double their budget, which looks like an amount entered
						twice at the source rather than an overpayment, but only the office&rsquo;s own records can say.
					</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[40rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className={TH}>Office</th>
									<th className={TH}>Reference</th>
									<th className={`${TH} text-right`}>Budget</th>
									<th className={`${TH} text-right`}>Awarded</th>
								</tr>
							</thead>
							<tbody>
								{overBudget.map((o) => (
									<tr key={o.notice.ref} className='border-b border-[var(--rule-soft,var(--rule))]'>
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
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<p className='max-w-[46rem] text-[13px] leading-6 text-[var(--ink-3)]'>
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
				</section>
			</div>
		</>
	)
}
