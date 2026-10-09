import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import {
	awards,
	cmci,
	coaAudits,
	finances,
	fundReleases,
	funds,
	incomeClass,
	procurement,
	row,
	sglg,
	type Table,
} from '@betterbarmm/lgu-data/fiscal'
import { LguStat, ShareBar } from './lgu-parts'

/* ============================================================
   The money tab

   What one province, city or municipality reported collecting and
   spending, what it borrowed, and what it has been recognised for.
   Every figure is a dataset's; this file only arranges them, and
   says beside each block what kind of figure it is — the line a
   reader most needs is that these are actuals, not the budget the
   council passed.
   ============================================================ */

const n = (value: unknown) => (value == null ? null : Number(value))

/** ₱1.23B, ₱45.6M, ₱789,000 — a column of these has to scan. */
function peso(value: unknown): string {
	const v = n(value)
	if (v == null || Number.isNaN(v)) return '—'
	const abs = Math.abs(v)
	if (abs >= 1e9) return `₱${(v / 1e9).toFixed(2)}B`
	if (abs >= 1e6) return `₱${(v / 1e6).toFixed(1)}M`
	return `₱${Math.round(v).toLocaleString('en-PH')}`
}

const sum = (r: Record<string, unknown>, ...keys: string[]) => keys.reduce((t, k) => t + (n(r[k]) ?? 0), 0)

function Block({ title, note, children }: { title: string; note?: React.ReactNode; children: React.ReactNode }) {
	return (
		<div className='mt-14 first:mt-0'>
			<h3 className='bb-label block w-full border-b border-[var(--brass-line)] pb-3'>{title}</h3>
			{children}
			{note ? <p className='mt-4 text-[12.5px] leading-6 text-[var(--ink-3)]'>{note}</p> : null}
		</div>
	)
}

function Source({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className='rule-link'>
			{children}
		</a>
	)
}

/** Lines down, years across: the shape of the statement itself. */
function YearTable({ years, lines }: { years: string[]; lines: [string, (year: string) => string, boolean?][] }) {
	return (
		<div className='mt-4'>
			{years.length > 3 ? (
				<p aria-hidden='true' className='mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] sm:hidden'>
					Swipe for every year &rarr;
				</p>
			) : null}
			<div className='overflow-x-auto'>
			<table className='w-full min-w-[36rem] border-collapse text-[13px]'>
				<thead>
					<tr>
						<th className='sticky left-0 z-[1] bg-[var(--paper)] py-2 pr-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>
							FY
						</th>
						{years.map((year) => (
							<th
								key={year}
								className='num py-2 pl-3 text-right font-mono text-[10px] font-semibold tracking-[0.1em] text-[var(--ink-3)]'
							>
								{year}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{lines.map(([label, cell, strong]) => (
						<tr key={label} className='border-t border-[var(--rule-soft)]'>
							<th
								scope='row'
								className={`sticky left-0 z-[1] w-[9rem] min-w-[9rem] bg-[var(--paper)] py-2.5 pr-4 text-left font-normal leading-snug sm:w-auto ${strong ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}
							>
								{label}
							</th>
							{years.map((year) => (
								<td
									key={year}
									className={`num py-2.5 pl-3 text-right ${strong ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink-2)]'}`}
								>
									{cell(year)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			</div>
		</div>
	)
}

/** One series, so one hue and no legend; the label and figure sit on the row. */
function Bars({ items }: { items: { label: string; value: number }[] }) {
	const top = Math.max(...items.map((item) => item.value), 1)
	const total = items.reduce((t, item) => t + item.value, 0) || 1
	return (
		<ul className='mt-5 space-y-3'>
			{items.map((item) => (
				<li key={item.label} className='grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] items-center gap-3'>
					<span className='truncate text-[13px] text-[var(--ink-2)]'>{item.label}</span>
					<span className='h-2.5 rounded-r-[4px] bg-[color-mix(in_oklab,var(--brass)_18%,transparent)]'>
						<span
							className='block h-full rounded-r-[4px] bg-[var(--accent)]'
							style={{ width: `${(item.value / top) * 100}%` }}
							title={`${item.label}: ${peso(item.value)} (${Math.round((item.value / total) * 100)}%)`}
						/>
					</span>
					<span className='num w-28 text-right text-[12.5px] text-[var(--ink)]'>
						{peso(item.value)} <span className='text-[var(--ink-3)]'>· {Math.round((item.value / total) * 100)}%</span>
					</span>
				</li>
			))}
		</ul>
	)
}

function yearsOf(table: Table, key: string): string[] {
	return Object.keys(table.units[key] ?? {}).sort()
}

export function LguFinances({ unitKey, name }: { unitKey: string; name: string }) {
	const years = yearsOf(finances, unitKey)
	const latest = years.at(-1)
	const f = latest ? row(finances, unitKey, latest)! : null
	const dependency = latest ? n(row(funds.dependency, unitKey, latest)?.ntaDependency) : null
	const drrmYears = yearsOf(funds.disasterFund, unitKey)
	const sefYears = yearsOf(funds.educationFund, unitKey)
	const classes = incomeClass.units[unitKey]
	const seals = sglg.units[unitKey] ?? {}
	const ranks = cmci.units[unitKey] ?? {}
	const won = awards.units[unitKey] ?? []
	const certificates = funds.borrowing.units[unitKey] ?? []
	const bids = procurement.units[unitKey] ?? {}
	const releases = Object.entries(fundReleases.units[unitKey] ?? {}).flatMap(([year, list]) =>
		list.map((release) => ({ year, ...release })),
	)
	const audits = coaAudits.units[unitKey] ?? {}
	const awardName = (id: string) => awards.awards.find((award) => award.id === id)

	if (!f && !classes && !Object.keys(seals).length && !won.length) {
		return (
			<p className='text-[14.5px] leading-7 text-[var(--ink-2)]'>
				No fiscal record names {name} yet. The towns of the Special Geographic Area were created in 2024 and
				have not filed a Statement of Receipts and Expenditures with the Bureau of Local Government Finance,
				nor been classified, ranked or awarded under their own names.
			</p>
		)
	}

	const r = (year: string) => row(finances, unitKey, year)!
	const latestCmci = Object.keys(ranks).sort().at(-1)

	return (
		<div>
			<p className='text-[14.5px] leading-7 text-[var(--ink-2)]'>
				What {name}&rsquo;s treasurer reported collecting and spending to the Bureau of Local Government
				Finance, year by year. These are <strong className='text-[var(--ink)]'>actuals, not the budget</strong>{' '}
				the sanggunian passed — that is in its own appropriation ordinance, which nobody publishes together.
				Barangays&rsquo; own money is not in these figures.
			</p>

			{f && latest ? (
				<>
					<div className='mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 lg:grid-cols-4'>
						<LguStat value={peso(f.operatingIncome)} label={`Operating income, FY ${latest}`} />
						<LguStat value={peso(f.nta)} label='Of which, National Tax Allotment' />
						<LguStat value={peso(f.operatingExpenditures)} label='Operating spending' />
						<LguStat value={peso(f.cashEnd)} label='Cash at year end' />
					</div>

					{dependency != null ? (
						<div className='mt-10 max-w-2xl'>
							<ShareBar
								share={Math.round(dependency * 1000) / 10}
								label={`NTA's share of regular income, FY ${latest}`}
								ofLabel='Local taxes, fees and other income'
							/>
						</div>
					) : null}

					<Block
						title='Income and spending by year'
						note={
							<>
								From BLGF&rsquo;s{' '}
								<Source href='https://blgf.gov.ph/lgu-fiscal-data/'>Statement of Receipts and Expenditures</Source>{' '}
								by LGU. A missing year is one {name} did not report.{' '}
								{`FY ${finances.years.at(-1)} is BLGF’s preliminary release.`}
							</>
						}
					>
						<YearTable
							years={years}
							lines={[
								['Local taxes and fees', (y) => peso(r(y).localSources)],
								['National Tax Allotment', (y) => peso(r(y).nta)],
								['Other shares, transfers and grants', (y) => peso(sum(r(y), 'otherNationalShares', 'interLocalTransfers', 'grants'))],
								['Operating income', (y) => peso(r(y).operatingIncome), true],
								['Operating spending', (y) => peso(r(y).operatingExpenditures), true],
								['Capital outlay', (y) => peso(r(y).capitalOutlay)],
								['Borrowed', (y) => peso(r(y).borrowings)],
								['Debt service (principal and interest)', (y) => peso(sum(r(y), 'debtPrincipal', 'debtInterest'))],
								['Cash at year end', (y) => peso(r(y).cashEnd)],
							]}
						/>
					</Block>

					<Block
						title={`Where operating money went, FY ${latest}`}
						note='Current operating spending by sector, as the SRE groups it. Capital outlay is separate, above.'
					>
						<Bars
							items={[
								{ label: 'General public services', value: n(f.generalPublicServices) ?? 0 },
								{ label: 'Education', value: n(f.education) ?? 0 },
								{ label: 'Health', value: n(f.health) ?? 0 },
								{
									label: 'Other social services',
									value: Math.max(0, (n(f.socialServices) ?? 0) - (n(f.education) ?? 0) - (n(f.health) ?? 0)),
								},
								{ label: 'Economic services', value: n(f.economicServices) ?? 0 },
								{ label: 'Interest on debt', value: n(f.debtInterest) ?? 0 },
							]}
						/>
					</Block>
				</>
			) : null}

			{/* The smaller records, two to a row on a wide screen rather than one
			    long column under the main table. */}
			<div className='mt-14 grid gap-x-12 gap-y-14 lg:grid-cols-2 [&>*]:!mt-0 [&>*]:min-w-0'>
			{drrmYears.length ? (
				<Block
					title='Disaster fund: budgeted against spent'
					note={
						<>
							The Local DRRM Fund is the one record here that sets a budget beside its spending. Spending above
							the appropriation can come from earlier years&rsquo; unspent funds. BLGF&rsquo;s FY 2021 file lists
							no BARMM LGU. Source:{' '}
							<Source href='https://blgf.gov.ph/lgu-fiscal-data/'>BLGF, LDRRMF by LGU</Source>.
						</>
					}
				>
					<YearTable
						years={drrmYears}
						lines={[
							['Appropriated', (y) => peso(row(funds.disasterFund, unitKey, y)!.appropriated)],
							['Spent', (y) => peso(row(funds.disasterFund, unitKey, y)!.spent), true],
							[
								'Share used',
								(y) => {
									const d = row(funds.disasterFund, unitKey, y)!
									return n(d.appropriated) ? `${Math.round(((n(d.spent) ?? 0) / n(d.appropriated)!) * 100)}%` : '—'
								},
							],
						]}
					/>
				</Block>
			) : null}

			{sefYears.some((y) => n(row(funds.educationFund, unitKey, y)!.rptCollected) || n(row(funds.educationFund, unitKey, y)!.spent)) ? (
				<Block
					title='Special Education Fund'
					note='The extra 1% real property tax for schools. Ordinary municipalities share their province’s, so many show little or none.'
				>
					<YearTable
						years={sefYears}
						lines={[
							['Collected', (y) => peso(row(funds.educationFund, unitKey, y)!.rptCollected)],
							['Spent', (y) => peso(row(funds.educationFund, unitKey, y)!.spent)],
						]}
					/>
				</Block>
			) : null}

			{certificates.length || Object.keys(bids).length || releases.length ? (
				<Block
					title='Borrowing, contracts and national releases'
					note={
						<>
							A borrowing certificate is DOF&rsquo;s clearance to borrow, not a loan; contracts awarded are not
							payments; a release is an allotment or cash, not spending. Sources:{' '}
							<Source href='https://blgf.gov.ph/lgu-fiscal-data/'>BLGF</Source>,{' '}
							<Source href='https://open.philgeps.gov.ph/'>PhilGEPS</Source>,{' '}
							<Source href='https://www.dbm.gov.ph/'>DBM SARO and NCA registers</Source>.
						</>
					}
				>
					{certificates.length ? (
						<ul className='mt-4'>
							{certificates.map((c) => (
								<li key={c.control} className='grid gap-x-6 border-b border-[var(--rule-soft)] py-3 md:grid-cols-[9rem_minmax(0,1fr)_8rem]'>
									<span className='num text-[12.5px] text-[var(--ink-3)]'>{c.date ?? '—'}</span>
									<span className='text-[13px] leading-6 text-[var(--ink-2)]'>
										<span className='font-semibold text-[var(--ink)]'>Cleared to borrow{c.barangay ? ` (Barangay ${c.barangay})` : ''}.</span>{' '}
										{c.purpose.length > 220 ? `${c.purpose.slice(0, 220)}…` : c.purpose}
									</span>
									<a href={c.href} target='_blank' rel='noreferrer' className='num text-right text-[13px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
										{peso(c.proposedAmount)}
									</a>
								</li>
							))}
						</ul>
					) : null}

					{Object.keys(bids).length ? (
						<YearTable
							years={Object.keys(bids).sort()}
							lines={[
								['PhilGEPS bids posted', (y) => (bids[y] ? String(bids[y].notices) : '—')],
								['Contracts awarded', (y) => (bids[y] ? peso(bids[y].awarded) : '—'), true],
							]}
						/>
					) : null}

					{releases.length ? (
						<ul className='mt-4'>
							{releases.map((release) => (
								<li key={release.number} className='grid gap-x-6 border-b border-[var(--rule-soft)] py-3 md:grid-cols-[9rem_minmax(0,1fr)_8rem]'>
									<span className='num text-[12.5px] text-[var(--ink-3)]'>
										{release.kind} · {release.date}
									</span>
									<span className='text-[13px] leading-6 text-[var(--ink-2)]'>
										{release.fund ? <span className='font-semibold text-[var(--ink)]'>{release.fund}. </span> : null}
										{release.purpose.length > 200 ? `${release.purpose.slice(0, 200)}…` : release.purpose}
									</span>
									<a href={release.href} target='_blank' rel='noreferrer' className='num text-right text-[13px] font-semibold text-[var(--ink)] hover:text-[var(--accent)]'>
										{peso(release.amount)}
									</a>
								</li>
							))}
						</ul>
					) : null}
				</Block>
			) : null}

			{classes || Object.keys(seals).length || latestCmci || won.length || Object.keys(audits).length ? (
				<Block
					title='Classification, audits and recognition'
					note='Seal and award lists name winners only: an LGU missing from one was not necessarily assessed, and did not necessarily fail.'
				>
					<dl className='mt-2'>
						{classes?.['2024'] ? (
							<Fact label='Income class (2024 reclassification)' href={classes['2024'].href}>
								{classes['2024'].class}
								{classes['2008'] ? <span className='text-[var(--ink-3)]'> · was {classes['2008'].class}</span> : null}
							</Fact>
						) : null}
						<Fact label='Seal of Good Local Governance' href={Object.values(seals)[0]?.href}>
							{Object.keys(seals).length ? Object.keys(seals).join(', ') : 'Not on the 2022–2024 passer lists'}
						</Fact>
						{latestCmci ? (
							<Fact label={`DTI competitiveness index, ${latestCmci}`} href={ranks[latestCmci]!.href}>
								{ranks[latestCmci]!.overall.toFixed(2)}
								{ranks[latestCmci]!.rank ? (
									<span className='text-[var(--ink-3)]'>
										{' '}
										· #{ranks[latestCmci]!.rank} of {ranks[latestCmci]!.rankCategory?.toLowerCase()}
									</span>
								) : null}
							</Fact>
						) : null}
						{Object.entries(audits).map(([year, audit]) => (
							<Fact key={year} label={`COA audit opinion, FY ${year}`} href={audit.href}>
								{audit.opinion[0]!.toUpperCase() + audit.opinion.slice(1)}
								<span className='text-[var(--ink-3)]'> · {audit.observations} observations</span>
							</Fact>
						))}
					</dl>

					{won.length ? (
						<ul className='mt-6'>
							{won
								.slice()
								.sort((a, b) => b.year - a.year)
								.map((award, i) => {
									const meta = awardName(award.award)
									return (
										<li key={i} className='flex items-start justify-between gap-4 border-b border-[var(--rule-soft)] py-3'>
											<a href={award.href} target='_blank' rel='noreferrer' className='group min-w-0'>
												<span className='block text-[13.5px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)]'>
													{meta?.name ?? award.award}
												</span>
												<span className='mt-0.5 block text-[12px] leading-5 text-[var(--ink-3)]'>
													{[
														meta?.agency,
														meta?.scope === 'regional' ? 'regional' : null,
														award.barangay ? `Barangay ${award.barangay}` : null,
														award.level,
														award.category,
														award.rank ? `rank ${award.rank}` : null,
													]
														.filter(Boolean)
														.join(' · ')}
												</span>
											</a>
											<span className='num shrink-0 text-[12.5px] font-semibold text-[var(--brass)]'>{award.year}</span>
										</li>
									)
								})}
						</ul>
					) : null}
				</Block>
			) : null}
			</div>
		</div>
	)
}

function Fact({ label, href, children }: { label: string; href?: string; children: React.ReactNode }) {
	return (
		<div className='flex flex-col gap-1 border-b border-[var(--rule-soft)] py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4'>
			<dt className='text-[13px] text-[var(--ink-3)]'>{label}</dt>
			<dd className='text-[13.5px] font-medium text-[var(--ink)] sm:text-right'>
				{href ? (
					<a href={href} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 hover:text-[var(--accent)]'>
						{children}
						<ArrowUpRightIcon className='size-3 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					</a>
				) : (
					children
				)}
			</dd>
		</div>
	)
}
