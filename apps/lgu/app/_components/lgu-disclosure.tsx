import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import { fdpp, fdppPortal, type FdppPeriod, type FdppPosting } from '@betterbarmm/lgu-data/fdpp'
import { DisclosureTable, type DisclosureCell } from './disclosure-table'

/* ============================================================
   The full disclosure tab

   What one province, city or municipality has posted to DILG's
   Full Disclosure Policy Portal: one table, a year at a time, the
   policy's documents down the side and the periods they cover
   across, a tick where something is posted and a link to DILG's
   file. A dash is a period with nothing on the portal, and the
   note says that is all it means.

   The cells are worked out here, on the server; the table only
   switches years.
   ============================================================ */

const column = (posting: FdppPosting) => (posting.period.quarter ? `q${posting.period.quarter}` : 'year')

const when = (p: FdppPeriod) => (p.year ? `${p.quarter ? `Q${p.quarter} ` : ''}${p.year}` : '')

/* Which documents come quarterly, read off every unit's postings: a cell a
   document never has (Q2 of the annual budget) is left blank, not dashed. */
const QUARTERLY = [
	...new Set(Object.values(fdpp.units).flatMap((rows) => rows.filter((p) => p.period.quarter).map((p) => p.document))),
]

export function LguDisclosure({ unitKey, name }: { unitKey: string; name: string }) {
	const postings = fdpp.units[unitKey] ?? []
	const byYear: Record<number, Record<string, DisclosureCell>> = {}
	for (const posting of postings) {
		const year = posting.period.year
		if (year == null) continue
		const cells = (byYear[year] ??= {})
		cells[`${posting.document}:${column(posting)}`] ??= { href: `${fdpp.download}${posting.id}`, posted: when(posting.posted) }
	}
	const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
	const portal = fdppPortal(unitKey)

	return (
		<div>
			<p className='text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
				Under DILG’s Full Disclosure Policy, every province, city and municipality must post its budget, its
				procurement plans, its quarterly statements and how it used its development and disaster funds, in three
				conspicuous places and on DILG’s portal. This is what {name} has put on the portal since 2023.{' '}
				<a
					href={portal?.href ?? `${fdpp.source[0].href}/index?region_filter=19`}
					target='_blank'
					rel='noreferrer'
					className='font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 transition hover:text-[var(--accent)]'
				>
					{portal?.town
						? `All of ${name}’s postings on DILG’s portal`
						: portal
							? 'The province’s postings on DILG’s portal, its towns’ included'
							: 'All BARMM postings on DILG’s portal'}
					<ArrowUpRightIcon size={13} className='ml-1 inline' aria-hidden='true' />
				</a>
			</p>

			{years.length === 0 ? (
				<p className='mt-10 bg-[var(--paper-2)] px-6 py-5 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>
					Nothing from {name} has been put on the portal since 2023.
				</p>
			) : (
				<DisclosureTable
					years={years}
					documents={fdpp.documents}
					quarterly={QUARTERLY}
					byYear={byYear}
					portal={portal?.town ? portal.href : undefined}
				/>
			)}

			<p className='mt-10 text-[0.78125rem] leading-6 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink-3)]'>
				A tick opens the file DILG holds; a dash means nothing is on the portal for that period, not that the
				document was never produced. Annual documents sit under Year, quarterly ones under their quarter. From{' '}
				<a href={fdpp.source[0].href} target='_blank' rel='noreferrer' className='rule-link'>
					{fdpp.source[0].label}
					<ArrowUpRightIcon size={11} className='ml-0.5 inline' aria-hidden='true' />
				</a>
				, read {fdpp.generatedAt}.
			</p>
		</div>
	)
}
