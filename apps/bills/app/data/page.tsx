import { BillsShell } from '../_components/bills-shell'
import { getBillsViewModel } from '../_lib/bills-data'

const typeDescriptions: Record<string, string> = {
	amendment: 'Changes an existing Bangsamoro law, code, rule, or institutional setup. These records usually matter because they update how an earlier act is implemented or interpreted.',
	annual_general_appropriation:
		'Appropriates the annual operating budget of the Bangsamoro Government for a fiscal year, including ministries, offices, special-purpose funds, staffing, and fiscal rules.',
	appropriation_validity_extension_or_continuing_authority:
		'Extends or preserves the authority to use previously appropriated funds beyond the original period, often to keep programs, projects, or releases legally available.',
	code_or_framework_law:
		'Creates a broad legal framework or code for a major sector, such as governance, education, labor, civil service, elections, local government, or public financial management.',
	health_facility_establishment_or_upgrade:
		'Creates, converts, or upgrades a public health facility. These acts typically authorize service expansion, staffing, facilities, or funding support for a named locality.',
	institution_creation: 'Creates a public office, commission, authority, program, or institution with a defined mandate, structure, leadership, funding authority, or implementation role.',
	local_government_creation: 'Creates or recognizes a local government unit or municipality, usually defining its territorial, administrative, or governance basis.',
	substantive_policy_law: 'Sets a public policy, program, entitlement, rule, or institutional direction that is not primarily a budget, amendment, code, or office-creation measure.',
	supplemental_appropriation: 'Adds funding outside the regular annual budget cycle, usually to cover additional operating needs, urgent programs, or adjustments after the main budget has passed.',
	symbol_or_official_standard: 'Adopts or standardizes official Bangsamoro symbols, names, commemorations, observances, or other public identity markers.',
}

export default function BillsDataPage() {
	const { metadata, records, stats, actionTypes } = getBillsViewModel()
	const primaryLinks = Object.entries(metadata.primaryIndexLinks)
	const typeCounts = new Map<string, number>()

	for (const record of records) {
		typeCounts.set(record.actionType || 'general', (typeCounts.get(record.actionType || 'general') ?? 0) + 1)
	}

	return (
		<BillsShell activeItem='data'>
			<section className='mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-32'>
				<div className='max-w-4xl'>
					<div>
						<p className='eyebrow'>Dataset</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>{metadata.datasetName}</h2>
					</div>
					<div className='mt-6'>
						<p className='text-base leading-7 text-[var(--ink-2)]'>{metadata.scopeNote}</p>
					</div>
				</div>

				<div className='mt-10 border-y border-[var(--ink)] border-b-[var(--rule)] sm:mt-12'>
					<div className='grid sm:grid-cols-3'>
						{[
							['Coverage', metadata.coverage],
							['Generated', metadata.generatedAt],
							['Source-linked', stats.sourceLinked.toLocaleString()],
						].map(([label, value], index) => (
							<div
								key={label}
								className={`min-w-0 border-b border-[var(--rule)] py-5 sm:border-b-0 sm:p-5 sm:py-8 ${index < 2 ? 'sm:border-r' : ''}`}
							>
								<p className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>{label}</p>
								<p className='mt-3 break-words text-sm font-bold leading-5 text-[var(--ink)]'>{value}</p>
							</div>
						))}
					</div>
				</div>

				<div className='mb-20 border-b border-[var(--ink)] py-8 sm:mb-28 md:px-5 lg:mb-32'>
					<p className='eyebrow'>Primary source paths</p>
					<div className='mt-5 grid gap-3 md:grid-cols-2'>
						{primaryLinks.map(([label, href]) => (
							<a
								key={label}
								href={href}
								target='_blank'
								rel='noreferrer'
								className='flex min-w-0 items-center justify-between gap-4 border border-[var(--rule)] px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)]'
							>
								<span className='min-w-0 break-words'>{label.replaceAll('_', ' ')}</span>
								<span aria-hidden='true' className='shrink-0'>→</span>
							</a>
						))}
					</div>
				</div>

				<div className='mb-20 lg:mb-32'>
					<div className='max-w-3xl'>
						<p className='eyebrow'>Bill type glossary</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>What each type means.</h2>
						<p className='mt-5 text-sm leading-6 text-[var(--ink-3)]'>
							These are normalized analytical labels used for filtering. They help group acts by legal function, but the official title and source text remain the authority.
						</p>
					</div>
					<div className='mt-10 border-t border-[var(--ink)]'>
						{actionTypes.map((type) => (
							<div
								key={type.value}
								className='grid gap-4 border-b border-[var(--rule)] py-6 md:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] md:gap-10 lg:gap-16'
							>
								<div className='min-w-0'>
									<h3 className='text-lg! break-words font-extrabold leading-snug tracking-[-0.02em]'>{type.label}</h3>
									<p className='mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]'>{(typeCounts.get(type.value) ?? 0).toLocaleString()} acts</p>
								</div>
								<p className='min-w-0 text-sm leading-6 text-[var(--ink-2)]'>
									{typeDescriptions[type.value] ?? 'A normalized label used to group records with a similar legal function. Review the source link and official title for the exact legal effect.'}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className='grid gap-10 xl:grid-cols-[0.75fr_1.25fr]'>
					<div className='max-w-3xl xl:max-w-none'>
						<p className='eyebrow'>Full-text files reviewed</p>
						<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Budget acts received deeper PDF review.</h2>
					</div>
					<div className='grid border-t border-[var(--ink)]'>
						{metadata.uploadedSourceFilesRead.map((file) => (
							<div
								key={file.fileName}
								className='grid gap-4 border-b border-[var(--rule)] py-5 md:grid-cols-[10rem_1fr]'
							>
								<div className='min-w-0'>
									<p className='num text-xl font-extrabold'>BAA {file.relatedBaaNumber ?? '—'}</p>
									<p className='mt-2 break-words font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]'>{file.readStatus}</p>
								</div>
								<div className='min-w-0'>
									<h3 className='break-words font-bold leading-snug'>{file.fileName}</h3>
									<p className='mt-2 text-sm leading-6 text-[var(--ink-2)]'>{file.readingSummary}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</BillsShell>
	)
}
