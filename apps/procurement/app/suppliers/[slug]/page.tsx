import { WarningIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Masthead, longDate, peso } from '../../_components/parts'
import { supplierHref, supplierProfile } from '../../_lib/philgeps'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const p = supplierProfile((await params).slug)
	if (!p) return {}
	return {
		title: p.supplier.name,
		description: `Every contract PhilGEPS records ${p.supplier.name} winning from a BARMM government office: ${p.supplier.awards} contracts worth ${peso(p.supplier.amount)}.`,
	}
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const TH = 'py-2.5 pr-6 text-[0.71875rem] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)] last:pr-0'
const TD = 'py-3 pr-6 align-top last:pr-0'

export default async function SupplierPage({ params }: { params: Promise<{ slug: string }> }) {
	const p = supplierProfile((await params).slug)
	if (!p) notFound()
	const { supplier: s, contracts, offices, byYear, entry, duringBlacklist, similar } = p
	const first = contracts.at(-1)?.date
	const top = Math.max(...byYear.map(([, v]) => v), 1)

	return (
		<>
			<Masthead
				kicker={`Supplier · ${s.group}`}
				name={s.name}
				stacked
				note={`${s.awards.toLocaleString('en-PH')} contract${s.awards === 1 ? '' : 's'} won from ${offices.length} BARMM office${offices.length === 1 ? '' : 's'}, worth ${peso(s.amount)}${first ? `, from ${longDate(first)}` : ''}${s.last ? ` to ${longDate(s.last)}` : ''}.`}
			/>

			<div className='bb-container bb-section [&>section+section]:mt-16'>
				{entry ? (
					<section className='border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--paper))] p-6'>
						<p className='flex items-center gap-2 font-semibold text-[var(--accent)]'>
							<WarningIcon size={18} weight='fill' aria-hidden='true' /> The same name is on the government&rsquo;s procurement blacklist
						</p>
						<p className='mt-3 max-w-[48rem] text-[0.90625rem] leading-7 text-[var(--ink-2)]'>
							The Government Procurement Policy Board lists <strong>{entry.blacklisted_entity}</strong> as blacklisted from{' '}
							{longDate(entry.min_date)} to {longDate(entry.max_date)}. The match is by name only: a different business can share a name, so check the
							order before drawing anything from it.
							{duringBlacklist.length
								? ` ${duringBlacklist.length} of the contracts below are dated inside a blacklisting period.`
								: ' None of the contracts below is dated inside a blacklisting period.'}
						</p>
						<ul className='mt-4 space-y-2 text-[0.84375rem]'>
							{entry.orders.map((o, i) => (
								<li key={i} className='border-t border-[var(--rule)] pt-2'>
									<strong>{o.procuring_entity}</strong>, {longDate(o.start_date)} to {longDate(o.end_date)}
									<span className='block text-[0.78125rem] text-[var(--ink-3)]'>{o.project}</span>
								</li>
							))}
						</ul>
						<a href='https://onlineblacklistingportal.gppb.gov.ph/' target='_blank' rel='noreferrer' className='rule-link mt-4 inline-block text-[0.8125rem]'>
							GPPB Online Blacklisting Portal
						</a>
					</section>
				) : null}

				{byYear.length > 1 ? (
					<section>
						<h2 className={H2}>By year</h2>
						<div className='mt-6 flex h-40 items-end gap-3 border-b border-[var(--rule)]'>
							{byYear.map(([y, v]) => (
								<div key={y} className='flex h-full flex-1 flex-col items-center justify-end gap-1.5'>
									<span className='num text-[0.6875rem] text-[var(--ink-2)]'>{peso(v)}</span>
									<span className='w-full max-w-16 bg-[var(--accent)]' style={{ height: `${Math.max((v / top) * 80, 1)}%` }} title={`${y}: ${peso(v)}`} />
								</div>
							))}
						</div>
						<div className='mt-2 flex gap-3'>
							{byYear.map(([y]) => (
								<span key={y} className='num flex-1 text-center text-[0.6875rem] text-[var(--ink-3)]'>
									{y}
								</span>
							))}
						</div>
					</section>
				) : null}

				<section>
					<h2 className={H2}>Who it won from</h2>
					<p className='mt-2 text-[0.875rem] text-[var(--ink-3)]'>Share is of all the contracts PhilGEPS records that office awarding.</p>
					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[36rem] border-collapse text-left text-[0.875rem]'>
							<thead>
								<tr className='border-b border-[var(--rule)]'>
									<th className={TH}>Office</th>
									<th className={`${TH} text-right`}>Contracts</th>
									<th className={`${TH} text-right`}>Share</th>
									<th className={`${TH} text-right`}>Amount</th>
								</tr>
							</thead>
							<tbody>
								{offices.map((o) => (
									<tr key={o.entity.slug} className='border-b border-[var(--rule)]'>
										<td className={TD}>
											<Link href={`/${o.entity.slug}`} className='rule-link font-semibold text-[var(--ink)]'>
												{o.entity.name}
											</Link>
										</td>
										<td className={`${TD} num text-right`}>{o.awards}</td>
										<td className={`${TD} num text-right ${o.share >= 0.5 ? 'font-semibold text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>{Math.round(o.share * 100)}%</td>
										<td className={`${TD} num whitespace-nowrap text-right font-semibold`}>{peso(o.amount)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section>
					<h2 className={H2}>Every contract</h2>
					<ul className='mt-6'>
						{contracts.map((c, i) => {
							const flagged = duringBlacklist.includes(c)
							return (
								<li key={i} className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 border-t border-[var(--rule)] py-4'>
									<div className='min-w-0'>
										<p className='text-[0.90625rem] font-semibold leading-6'>{c.notice.title ?? c.notice.category ?? 'Untitled notice'}</p>
										<p className='mt-1 text-[0.75rem] text-[var(--ink-3)]'>
											{[c.date && longDate(c.date), `Ref. ${c.notice.ref}`, c.contractNo && `Contract ${c.contractNo}`].filter(Boolean).join(' · ')}
										</p>
										{flagged ? <p className='mt-1 text-[0.75rem] font-semibold text-[var(--accent)]'>Dated inside a blacklisting period of the same name</p> : null}
									</div>
									<p className='num text-right text-[0.9375rem] font-semibold'>{c.amount != null ? peso(c.amount) : '—'}</p>
								</li>
							)
						})}
					</ul>
				</section>

				{similar.length ? (
					<section>
						<h2 className={H2}>Similar names</h2>
						<p className='mt-2 max-w-[46rem] text-[0.875rem] leading-6 text-[var(--ink-3)]'>
							Suppliers whose names begin the same way. They may be related businesses, or have nothing in common but a word.
						</p>
						<ul className='mt-5 grid gap-x-10 sm:grid-cols-2'>
							{similar.map((o) => (
								<li key={o.name} className='flex items-baseline justify-between gap-4 border-t border-[var(--rule)] py-2.5'>
									<Link href={supplierHref(o.name)} className='rule-link text-[0.875rem] font-semibold text-[var(--ink)]'>
										{o.name}
									</Link>
									<span className='num shrink-0 text-[0.8125rem] text-[var(--ink-3)]'>{peso(o.amount)}</span>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
		</>
	)
}
