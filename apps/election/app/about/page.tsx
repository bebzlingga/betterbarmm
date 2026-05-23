import { ElectionShell } from '../_components/election-shell'
import { formatDate, getElectionViewModel, labelize, type Source } from '../_lib/election-data'

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
	return (
		<div className='max-w-4xl'>
			<p className='eyebrow'>{eyebrow}</p>
			<h2 className='mt-3 text-3xl font-extrabold leading-none tracking-[-0.035em] sm:text-5xl'>{title}</h2>
			<p className='mt-5 text-base leading-snug text-[var(--ink-2)] sm:text-lg sm:leading-8'>{description}</p>
		</div>
	)
}

function MethodCard({ label, title, description }: { label: string; title: string; description: string }) {
	return (
		<article className='bg-[var(--paper)] p-6'>
			<p className='eyebrow text-[9px]'>{label}</p>
			<h3 className='mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em]'>{title}</h3>
			<p className='mt-4 text-sm leading-snug text-[var(--ink-2)]'>{description}</p>
		</article>
	)
}

function SourceCard({ source }: { source: Source }) {
	return (
		<article className='border-t border-[var(--rule)] py-10'>
			<div className='flex flex-col justify-between gap-3 sm:flex-row'>
				<p className='eyebrow text-[9px]'>{source.id}</p>
				<p className='font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>{source.date ? formatDate(source.date) : labelize(source.type)}</p>
			</div>
			<h3 className='mt-5 text-xl font-extrabold leading-tight tracking-[-0.025em]'>{source.title}</h3>
			<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{[source.publisher, labelize(source.type)].filter(Boolean).join(' / ')}</p>
			{source.url ? (
				<div className='mt-5 text-xs leading-snug text-[var(--ink)]'>
					<span>References: </span>
					<a
						href={source.url}
						target='_blank'
						rel='noreferrer'
						className='rule-link font-bold '
					>
						{source.title}
					</a>
				</div>
			) : null}
		</article>
	)
}

export default function AboutPage() {
	const { sources, dataQuality, stats } = getElectionViewModel()

	const coverage = [
		{
			label: 'Regional parties',
			value: stats.regionalParties,
			detail: 'Official regional parliamentary party entries.',
		},
		{
			label: 'Sectoral candidates',
			value: stats.sectoralCandidates,
			detail: 'Candidates grouped by reserved sector.',
		},
		{
			label: 'District COC filers',
			value: stats.districtCocFilers,
			detail: 'Working candidate coverage by parliamentary district.',
		},
		{
			label: 'Timeline events',
			value: stats.timelineEvents,
			detail: 'Schedule changes, legal milestones, and election dates.',
		},
	]

	const methodology = [
		{
			label: 'Official first',
			title: 'Use controlling records where available.',
			description: 'COMELEC records are treated as the controlling source for official regional party ballot entries and regional sectoral candidates when the dataset includes them.',
		},
		{
			label: 'Separate tracks',
			title: 'Do not mix the three seat paths.',
			description: 'Party-representative entries, single-member district candidates, and sectoral candidates are kept in separate structures because voters encounter and evaluate them differently.',
		},
		{
			label: 'Working status',
			title: 'Flag records that still need verification.',
			description: 'District COC filers are kept as working candidate records until official district Certified Lists of Candidates and later substitutions or withdrawals are checked.',
		},
		{
			label: 'Legacy care',
			title: 'Keep old nominee lists out of current results.',
			description: 'Legacy 2025 party nominee lists are preserved only as reference data where available. They are not presented as final 2026 nominee lists.',
		},
	]

	return (
		<ElectionShell activeItem='about'>
			<section className='border-b border-[var(--ink)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionIntro
						eyebrow='About the workspace'
						title='A civic reference for the BARMM parliamentary election.'
						description='This workspace turns election documents into browsable views: parties, candidates, sectors, districts, source notes, and the timeline leading to Election Day.'
					/>
					<div className='mt-12 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4'>
						{coverage.map((item) => (
							<article
								key={item.label}
								className='bg-[var(--paper)] p-6'
							>
								<p className='eyebrow text-[9px]'>{item.label}</p>
								<p className='num mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em]'>{item.value}</p>
								<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{item.detail}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] bg-[var(--paper-2)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8'>
					<SectionIntro
						eyebrow='Methodology'
						title='How records are selected and labeled.'
						description='The methodology is simple: prefer official election records, keep source confidence visible, and separate official candidate lists from working or legacy reference data.'
					/>
					<div className='mt-10 grid gap-px border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4'>
						{methodology.map((item) => (
							<MethodCard
								key={item.label}
								{...item}
							/>
						))}
					</div>
				</div>
			</section>

			<section className='border-b border-[var(--ink)] py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto max-w-7xl px-6 sm:px-8 '>
					<SectionIntro
						eyebrow='Quality notes'
						title='Confidence labels stay attached to the data.'
						description='Each major section keeps a quality note so readers can tell official ballot records apart from working district lists, legacy nominee references, and mixed-source descriptions.'
					/>
					<div className='mt-12 grid sm:grid-cols-2 lg:grid-cols-3'>
						{dataQuality.map(([key, value]) => (
							<article
								key={key}
								className='border border-[var(--rule)] bg-[var(--paper)] p-5 md:-ml-px md:-mt-px'
							>
								<p className='eyebrow text-[9px]'>{labelize(key)}</p>
								<p className='mt-3 text-sm leading-snug text-[var(--ink-2)]'>{value}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className='py-14 sm:py-24 lg:py-32'>
				<div className='mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]'>
					<SectionIntro
						eyebrow='Sources'
						title='The source list is part of the product.'
						description='The workspace keeps source records visible so the public can inspect where each election record came from and which items still need official verification.'
					/>
					<div className='border-b border-[var(--rule)]'>
						{sources.map((source) => (
							<SourceCard
								key={source.id}
								source={source}
							/>
						))}
					</div>
				</div>
			</section>
		</ElectionShell>
	)
}
