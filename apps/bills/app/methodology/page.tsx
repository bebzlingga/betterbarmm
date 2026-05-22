import { BillsPageHeader } from '../_components/bills-page-header'
import { BillsShell } from '../_components/bills-shell'
import { getBillsViewModel } from '../_lib/bills-data'

const checks = [
	{
		check: 'BAA identity',
		rule: 'Use BAA number, official title, and approval date from Parliament or Official Gazette listings.',
		status: 'Indexed',
	},
	{
		check: 'Source trail',
		rule: 'Keep Parliament index/detail links, Gazette category pages, PDF links, and uploaded PDF references where available.',
		status: 'Linked',
	},
	{
		check: 'Analysis',
		rule: 'Add plain-language gist, key effects, policy type, and related BAA references as review notes, not legal substitutes.',
		status: 'Reviewed',
	},
	{
		check: 'Limitations',
		rule: 'Mark records where PDFs were inaccessible, not extractable, or only partially reviewed in the browsing environment.',
		status: 'Visible',
	},
]

export default function BillsMethodologyPage() {
	const { metadata } = getBillsViewModel()

	return (
		<BillsShell activeItem='methodology'>
			<BillsPageHeader
				eyebrow='Methodology'
				title='How the legislative ledger is assembled.'
				description='This page explains how the bills workspace turns official BAA listings, source links, and reviewed PDFs into searchable public records.'
				meta={metadata.coverage}
			/>

			<section className='mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:py-32'>
				<div className='grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24'>
					<div>
						<p className='eyebrow'>Checks</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Review rules stay beside the data.</h2>
					</div>
					<div className='border-t border-[var(--ink)]'>
						{checks.map((item) => (
							<div
								key={item.check}
								className='grid gap-4 border-b border-[var(--rule)] py-6 sm:grid-cols-[12rem_1fr_8rem]'
							>
								<p className='font-bold'>{item.check}</p>
								<p className='text-sm leading-6 text-[var(--ink-2)]'>{item.rule}</p>
								<p className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)] sm:text-right'>{item.status}</p>
							</div>
						))}
					</div>
				</div>

				<div className='mt-20 grid gap-10 lg:mt-32 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24'>
					<div>
						<p className='eyebrow'>Known limitations</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Source verification still matters.</h2>
					</div>
					<div className='border-t border-[var(--ink)]'>
						{metadata.importantLimitations.map((limitation, index) => (
							<div
								key={limitation}
								className='grid gap-4 border-b border-[var(--rule)] py-6 sm:grid-cols-[4rem_1fr]'
							>
								<p className='mt-1 inline-flex h-fit w-fit self-start bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white'>0{index + 1}</p>
								<p className='text-sm leading-6 text-[var(--ink-2)]'>{limitation}</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</BillsShell>
	)
}
