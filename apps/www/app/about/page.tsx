import { BankIcon, CheckSquareOffsetIcon, DatabaseIcon, FileMagnifyingGlassIcon, ScrollIcon } from '@phosphor-icons/react/ssr'
import { SiteHeader } from '../_components/site-header'

const principles = [
	{
		label: 'Source first',
		title: 'Start with official records.',
		description: 'Every workspace is organized around a source trail: public PDFs, datasets, laws, candidate lists, budget acts, and other records that readers can inspect directly.',
		icon: DatabaseIcon,
	},
	{
		label: 'Context second',
		title: 'Explain what the record means.',
		description: 'Documents are easier to use when they come with dates, labels, plain-language notes, links, and enough background to understand why the record matters.',
		icon: FileMagnifyingGlassIcon,
	},
	{
		label: 'Care always',
		title: 'Treat public information as living data.',
		description: 'Names, figures, statuses, districts, nominee lists, appropriations, and legal records can change. BetterBARMM keeps warnings and verification notes close to the data.',
		icon: CheckSquareOffsetIcon,
	},
]

const workspaceNotes = [
	{
		label: 'Election',
		title: 'Choose Leaders. Shape Bangsamoro.',
		description: 'The election workspace helps readers follow the 2026 BARMM Parliamentary Elections: parties, district candidates, sectoral seats, timelines, and developing stories.',
		href: 'https://election.betterbarmm.com',
		status: 'Open',
		icon: CheckSquareOffsetIcon,
	},
	{
		label: 'Budget',
		title: 'Follow the money.',
		description: 'The budget workspace turns appropriations into browsable fiscal years, offices, programs, expense classes, source files, and budget lines.',
		href: 'https://budget.betterbarmm.com',
		status: 'Open',
		icon: BankIcon,
	},
	{
		label: 'Bills',
		title: 'Know your laws.',
		description: 'The bills workspace organizes Bangsamoro Autonomy Acts and legislative records so readers can track laws, categories, source links, and public context.',
		href: 'https://bills.betterbarmm.com',
		status: 'Open',
		icon: ScrollIcon,
	},
	{
		label: 'Data',
		title: 'Open the source layer.',
		description: 'The data layer is the long-term home for datasets, source documents, validation notes, release context, and reusable public files.',
		href: '/',
		status: 'In progress',
		icon: DatabaseIcon,
	},
]

const readerGuide = [
	{
		label: '1',
		title: 'Read the summary, then open the source.',
		description: 'Use BetterBARMM to find the record faster, but treat the official document or dataset as the controlling reference for citation.',
	},
	{
		label: '2',
		title: 'Check dates, status, and scope.',
		description: 'A budget line, candidate list, or bill can be tied to a specific fiscal year, filing period, version, office, committee, or legal stage.',
	},
	{
		label: '3',
		title: 'Watch for confidence notes.',
		description: 'Some records are official and complete. Others are working lists, legacy references, extracted data, or summaries that need careful verification.',
	},
	{
		label: '4',
		title: 'Send corrections and missing context.',
		description: 'Public records improve when readers share better source links, local knowledge, corrections, and review notes.',
	},
]

const audienceNotes = [
	'Citizens who want to understand how public decisions are made.',
	'Journalists and researchers who need source trails and reusable context.',
	'Civil society groups tracking public money, elections, laws, services, and local governance.',
	'Public servants who need cleaner ways to explain records and spot gaps in public information.',
]

export default function AboutPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />

			<section className='relative overflow-hidden border-b border-[var(--ink)]'>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:py-32'>
					<p className='eyebrow'>About BetterBARMM</p>
					<h1 className='mt-4 max-w-5xl text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] min-[380px]:text-5xl sm:mt-5 sm:text-6xl sm:tracking-[-0.04em] md:text-7xl lg:text-[5.75rem] xl:text-[6.75rem]'>
						Better transparency. Better governance.
					</h1>
					<p className='mt-6 max-w-3xl text-base leading-6 text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-7 lg:text-xl lg:leading-snug'>
						BetterBARMM is a public information project for the Bangsamoro. It organizes records, explains methods, and keeps source trails visible so people can understand how public decisions move
						through elections, budgets, laws, offices, and services.
					</p>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-32'>
				<div className='grid gap-10 border-b border-[var(--ink)] pb-12 lg:grid-cols-2 lg:gap-16'>
					<div>
						<p className='eyebrow'>Why it exists</p>
						<h2 className='mt-4 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] min-[380px]:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl'>
							Public records only work when people can use them.
						</h2>
					</div>
					<div className='max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug lg:mt-8'>
						<p>
							Public information often exists, but it can be scattered across PDFs, agency pages, spreadsheets, press releases, legal documents, and social posts. That makes it hard for ordinary
							readers to answer practical questions: who is running, what a law says, where the money goes, which office is responsible, or what source supports a claim.
						</p>
						<p className='mt-5'>
							BetterBARMM treats transparency as a usability problem. The goal is not only to publish records. The goal is to make public records easier to find, compare, question, cite, and improve.
						</p>
					</div>
				</div>

				<div className='grid border-b border-[var(--ink)] md:grid-cols-3'>
					{principles.map((item, index) => {
						const Icon = item.icon

						return (
							<article
								key={item.label}
								className='border-b border-[var(--rule)] py-6 last:border-b-0 md:border-b-0 md:border-r md:p-6 md:last:border-r-0'
							>
								<p className='eyebrow'>
									0{index + 1} / {item.label}
								</p>
								<div className='mt-8 text-[var(--accent)]'>
									<Icon
										className='size-10 sm:size-12'
										weight='duotone'
										aria-hidden='true'
									/>
								</div>
								<h3 className='mt-5 text-2xl font-extrabold leading-tight tracking-[-0.02em]'>{item.title}</h3>
								<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{item.description}</p>
							</article>
						)
					})}
				</div>
			</section>

			<section className='discover-dark-section'>
				<div className='mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-32'>
					<div className='grid gap-10 border-b border-[var(--rule)] pb-12 lg:grid-cols-2 lg:gap-16'>
						<div>
							<p className='eyebrow'>What it is</p>
							<h2 className='mt-4 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] min-[380px]:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl'>
								A public workspace, not an official authority.
							</h2>
						</div>
						<div className='max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug lg:mt-8'>
							<p>
								BetterBARMM is an independent civic information layer. It is designed to help people navigate public records about the Bangsamoro, but it is not a substitute for official government,
								COMELEC, Parliament, ministry, court, or agency records.
							</p>
							<p className='mt-5'>
								When the site summarizes a document, normalizes a table, groups a record, or explains an issue, readers should still verify important details against the original source. The site is a
								guide to the record, not the final record itself.
							</p>
						</div>
					</div>

					<div className='grid sm:grid-cols-2 lg:grid-cols-4'>
						{workspaceNotes.map((workspace, index) => {
							const Icon = workspace.icon
							const isOpen = workspace.status === 'Open'
							const content = (
								<>
									<div className='flex items-center justify-between gap-4'>
										<p className='eyebrow'>
											0{index + 1} / {workspace.label}
										</p>
										<span className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${isOpen ? 'text-[var(--accent)]' : 'text-[var(--ink-3)]'}`}>{workspace.status}</span>
									</div>
									<div className='mt-8 text-[var(--accent)]'>
										<Icon
											className='size-10 sm:size-12'
											weight='duotone'
											aria-hidden='true'
										/>
									</div>
									<h3 className='mt-5 text-2xl font-extrabold leading-tight tracking-[-0.02em]'>{workspace.title}</h3>
									<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{workspace.description}</p>
								</>
							)
							const className =
								'group block border-b border-[var(--rule)] py-6 text-[var(--ink)] transition hover:bg-[var(--paper-2)] sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0'

							if (isOpen) {
								return (
									<a
										key={workspace.label}
										href={workspace.href}
										className={className}
									>
										{content}
									</a>
								)
							}

							return (
								<article
									key={workspace.label}
									className={className}
								>
									{content}
								</article>
							)
						})}
					</div>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-32'>
				<div className='grid gap-10 border-b border-[var(--rule)] pb-12 lg:grid-cols-2 lg:gap-16'>
					<div>
						<p className='eyebrow'>How to use it</p>
						<h2 className='mt-4 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] min-[380px]:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl'>
							Use BetterBARMM as a starting point for verification.
						</h2>
					</div>
					<p className='max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug lg:mt-8'>
						The site is built for reading and checking. It helps readers move from a question to a source-backed record, then from that record to better public discussion.
					</p>
				</div>

				<div className='grid border-b border-[var(--rule)] sm:grid-cols-2'>
					{readerGuide.map((item, index) => (
						<article
							key={item.title}
							className={`border-b border-[var(--rule)] py-6 last:border-b-0 sm:p-6 ${index >= readerGuide.length - 2 ? 'sm:border-b-0' : ''} ${index % 2 === 0 ? 'sm:border-r' : ''}`}
						>
							<p className='inline-block bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-white'>{item.label}</p>
							<h3 className='mt-5 text-2xl font-extrabold leading-tight tracking-[-0.02em]'>{item.title}</h3>
							<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{item.description}</p>
						</article>
					))}
				</div>
			</section>

			<section className='bg-[var(--paper-2)]'>
				<div className='mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-32'>
					<div className='grid gap-10 border-b border-[var(--ink)] pb-20 lg:grid-cols-2 lg:gap-16'>
						<div>
							<p className='eyebrow'>Who it serves</p>
							<h2 className='mt-4 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] min-[380px]:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl'>A shared memory for public work.</h2>
						</div>
						<div className='max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-snug lg:mt-8'>
							<p>
								BetterBARMM is built for anyone trying to understand the public record. It should help people ask better questions, verify claims more carefully, and preserve context that would
								otherwise be scattered or forgotten.
							</p>
							<div className='mt-8 grid border-y border-[var(--rule)]'>
								{audienceNotes.map((note, index) => (
									<div
										key={note}
										className='grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-4 border-b border-[var(--rule)] py-4 text-sm leading-snug text-[var(--ink-2)] last:border-b-0'
									>
										<span className='mt-[2px] font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>0{index + 1}</span>
										<span className='min-w-0'>{note}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='grid gap-8 pt-16 sm:grid-cols-[1fr_auto] sm:items-center'>
						<div>
							<p className='eyebrow'>Contribute</p>
							<h2 className='mt-4 max-w-3xl text-3xl font-extrabold leading-none tracking-[-0.03em] sm:text-4xl'>Better records need many careful readers.</h2>
							<p className='mt-5 max-w-3xl text-sm leading-6 text-[var(--ink-2)] sm:text-base sm:leading-7'>
								Send source links, corrections, missing context, or notes about confusing records. The project becomes more useful when the public trail becomes easier to inspect.
							</p>
						</div>
						<a
							href='/contribute'
							className='inline-flex w-full justify-center border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--paper)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] sm:w-fit'
						>
							Contribute
						</a>
					</div>
				</div>
			</section>
		</main>
	)
}
