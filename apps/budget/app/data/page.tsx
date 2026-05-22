import { Download, FileJson, FileText } from 'lucide-react'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { BudgetMetricStrip } from '../_components/budget-metric-strip'
import { BudgetPageHeader } from '../_components/budget-page-header'
import { BudgetPageShell } from '../_components/budget-page-shell'
import { budgetDataFiles, type BudgetDataFile } from '../_lib/budget-data-files'
import { buildAgencyRows, buildProgramRows, compactCurrency, getFullBudgetSelection } from '../_lib/budget-view-model'

const datasetRoot = join(process.cwd(), '..', '..', 'datasets', 'budget')

function fileDownloadHref(file: string) {
	return `/data/download?file=${encodeURIComponent(file)}`
}

function fileSizeFor(file: BudgetDataFile) {
	const stats = statSync(join(datasetRoot, file.relativePath))

	return stats.size
}

function formatBytes(bytes: number) {
	if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
	if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`

	return `${bytes} B`
}

function displayFileName(file: BudgetDataFile) {
	return file.file.replaceAll('BAA', 'GAAB')
}

export default function BudgetDataPage() {
	const selection = getFullBudgetSelection()
	const agencyRows = buildAgencyRows(selection.budget)
	const programRows = buildProgramRows(selection.budget)

	return (
		<BudgetPageShell activeItem='Data'>
			<section className='mb-12 mt-10 sm:mt-16'>
				<BudgetPageHeader
					eyebrow='Data catalogue'
					title={<>Files, fields, and source coverage for the BARMM budget index.</>}
					description={
						<>
							The GAAB remains the best source for BARMM budget figures. This page follows the BetterGov data view: source files first, normalized fields second, and validation notes close to
							the tables they describe.
						</>
					}
				/>
			</section>

			<BudgetMetricStrip
				metrics={[
					{
						label: 'Indexed total',
						value: compactCurrency(selection.budget.total_appropriation),
						detail: selection.budget.act_number,
					},
					{
						label: 'Source files',
						value: budgetDataFiles.length,
						detail: 'JSON and GAAB PDFs',
					},
					{
						label: 'Objects',
						value: agencyRows.length,
						detail: 'Normalized agencies',
					},
					{
						label: 'Programs',
						value: programRows.length,
						detail: 'FPAP lines',
					},
				]}
			/>

			<section className='mb-12 mt-20 sm:mt-32'>
				<div className='mb-6! flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Source inventory</p>
						<h2 className='num mt-2 text-3xl font-extrabold uppercase tracking-normal sm:text-5xl'>GAAB Files</h2>
					</div>
					<p className='font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{budgetDataFiles.length} files</p>
				</div>
				<div className='overflow-x-auto bg-[var(--paper)]'>
					<div className='divide-y divide-[var(--rule-soft)] md:min-w-[840px]'>
						{budgetDataFiles.map((file) => {
							const Icon = file.type === 'JSON' ? FileJson : FileText

							return (
								<div
									key={file.file}
									className='grid items-center gap-4 px-4 py-5 transition hover:bg-[var(--paper-2)] sm:px-6 md:grid-cols-[minmax(18rem,1fr)_6rem_7rem_7rem_10rem] lg:gap-6 xl:grid-cols-[minmax(28rem,1fr)_8rem_8rem_8rem_11rem]'
								>
									<div className='flex items-center gap-4'>
										<span className='grid size-9 shrink-0 place-items-center border border-[var(--rule)] text-[var(--accent)]'>
											<Icon
												className='size-4'
												aria-hidden='true'
											/>
										</span>
										<div>
											<p className='text-sm font-semibold text-[var(--ink)]'>{displayFileName(file)}</p>
											<p className='mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{file.role}</p>
										</div>
									</div>
									<p className='num text-sm font-semibold text-[var(--ink)]'>{file.year}</p>
									<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>{file.type}</p>
									<p className='font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)]'>{formatBytes(fileSizeFor(file))}</p>
									<a
										href={fileDownloadHref(file.file)}
										download={displayFileName(file)}
										className='inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--paper)] transition hover:bg-[var(--accent)] md:w-auto'
									>
										<Download
											className='size-3'
											aria-hidden='true'
										/>
										Download
									</a>
								</div>
							)
						})}
					</div>
				</div>
			</section>
		</BudgetPageShell>
	)
}
