import { BillBrowser } from './_components/bill-browser'
import { BillsPageHeader } from './_components/bills-page-header'
import { BillsShell } from './_components/bills-shell'
import { getBillsViewModel } from './_lib/bills-data'

function StatCard({ label, value, detail, className = '' }: { label: string; value: string | number; detail: string; className?: string }) {
	return (
		<div className={`border-[var(--rule)] px-4 py-5 sm:px-6 ${className}`}>
			<p className='eyebrow text-[9px]'>{label}</p>
			<p className='num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>{value}</p>
			<p className='mt-3 text-xs leading-snug text-[var(--ink-3)]'>{detail}</p>
		</div>
	)
}

function statBorderClass(index: number) {
	const compactLeft = index % 2 === 0 ? 'min-[520px]:border-l-0' : 'min-[520px]:border-l'
	const lgLeft = index === 0 ? 'lg:border-l-0' : 'lg:border-l'

	return [compactLeft, lgLeft].join(' ')
}

export default function BillsPage() {
	const { records, categories, actionTypes, stats, metadata } = getBillsViewModel()
	const statCards = [
		{
			label: 'Acts indexed',
			value: stats.totalBills.toLocaleString(),
			detail: 'Bangsamoro Autonomy Acts currently organized in the ledger.',
		},
		{
			label: 'Categories',
			value: stats.categories.toLocaleString(),
			detail: 'Policy tags used to group laws for faster review.',
		},
		{
			label: 'Source-linked',
			value: stats.sourceLinked.toLocaleString(),
			detail: 'Acts with source documents or official references attached.',
		},
		{
			label: 'Budget laws',
			value: stats.budgetActs.toLocaleString(),
			detail: 'Budget-related acts separated for fiscal review.',
		},
	]

	return (
		<BillsShell activeItem='overview'>
			<BillsPageHeader
				eyebrow='Legislative ledger'
				title='Bangsamoro laws, simplified.'
				description='Browse Bangsamoro Autonomy Acts by number, title, category, author, source link, and plain-language analysis. Each row opens a detail view for source notes and review context.'
				meta={`${metadata.coverage} / generated ${metadata.generatedAt}`}
			/>

			<section className='border-b border-[var(--ink)]'>
				<div className='mx-auto grid max-w-7xl grid-cols-1 px-2 min-[520px]:grid-cols-2 sm:px-4 lg:grid-cols-4'>
					{statCards.map((card, index) => (
						<StatCard
							key={card.label}
							className={statBorderClass(index)}
							{...card}
						/>
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
