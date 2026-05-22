import { BillBrowser } from './_components/bill-browser'
import { BillsPageHeader } from './_components/bills-page-header'
import { BillsShell } from './_components/bills-shell'
import { getBillsViewModel } from './_lib/bills-data'

export default function BillsPage() {
	const { records, categories, actionTypes, stats, metadata } = getBillsViewModel()

	return (
		<BillsShell activeItem='overview'>
			<BillsPageHeader
				eyebrow='Legislative ledger'
				title='Bangsamoro laws, simplified.'
				description='Browse Bangsamoro Autonomy Acts by number, title, category, author, source link, and plain-language analysis. Each row opens a detail view for source notes and review context.'
				meta={`${metadata.coverage} / generated ${metadata.generatedAt}`}
			/>

			<section className='mx-auto max-w-7xl px-6 pt-14 sm:px-8 sm:pt-24'>
				<div className='grid border-y border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-4'>
					{[
						['Acts indexed', stats.totalBills.toLocaleString()],
						['Categories', stats.categories.toLocaleString()],
						['Source-linked', stats.sourceLinked.toLocaleString()],
						['Budget laws', stats.budgetActs.toLocaleString()],
					].map(([label, value], index) => (
						<div
							key={label}
							className={`border-b border-[var(--rule)] py-5 sm:p-6 ${index % 2 === 0 ? 'sm:border-r' : ''} lg:border-b-0 lg:border-r lg:last:border-r-0`}
						>
							<p className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>{label}</p>
							<p className='num mt-3 text-4xl font-extrabold leading-none tracking-[-0.04em] sm:text-5xl'>{value}</p>
						</div>
					))}
				</div>
			</section>

			<BillBrowser
				bills={records}
				categories={categories}
				actionTypes={actionTypes}
			/>
		</BillsShell>
	)
}
