import { BillsPageHeader } from '../_components/bills-page-header'
import { BillsShell } from '../_components/bills-shell'
import { getBillsViewModel } from '../_lib/bills-data'

const principles = [
	{
		label: 'Source first',
		title: 'Every summary points back to a public record.',
		description: 'The workspace keeps Parliament and Official Gazette links close to the bill metadata so users can verify details before citing them.',
	},
	{
		label: 'Plain language',
		title: 'Legal records should be readable.',
		description: 'Titles, categories, policy notes, and effects are organized for quick scanning without replacing the official legal text.',
	},
	{
		label: 'Public memory',
		title: 'Acts stay searchable after the headline passes.',
		description: 'BAA records are grouped by number, year, category, authors, and policy effect so legislative history remains usable.',
	},
]

export default function BillsAboutPage() {
	const { metadata, stats } = getBillsViewModel()

	return (
		<BillsShell activeItem='about'>
			<BillsPageHeader
				eyebrow='About this workspace'
				title='A public index for Bangsamoro laws.'
				description='The bills app is a BetterBARMM workspace for reviewing enacted Bangsamoro Autonomy Acts, their source records, and short public-facing analysis.'
				meta={metadata.coverage}
			/>

			<section className='mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:py-32'>
				<div className='grid gap-10 lg:grid-cols-[0.75fr_1.25fr]'>
					<div>
						<p className='eyebrow'>What it covers</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>{stats.totalBills} acts in one reviewable ledger.</h2>
					</div>
					<p className='max-w-3xl text-base leading-7 text-[var(--ink-2)]'>
						{metadata.scopeNote} This is a transparency interface, not a legal opinion. Use it to discover records, understand broad policy context, and move from summaries back to official source
						documents.
					</p>
				</div>

				<div className='mt-12 grid border-y border-[var(--ink)] md:grid-cols-3'>
					{principles.map((item, index) => (
						<div
							key={item.label}
							className={`border-b border-[var(--rule)] py-6 md:border-b-0 md:p-6 ${index < principles.length - 1 ? 'md:border-r' : ''}`}
						>
							<p className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>{item.label}</p>
							<h3 className='mt-5 text-2xl font-extrabold leading-tight tracking-[-0.02em]'>{item.title}</h3>
							<p className='mt-4 text-sm leading-6 text-[var(--ink-2)]'>{item.description}</p>
						</div>
					))}
				</div>
			</section>
		</BillsShell>
	)
}
