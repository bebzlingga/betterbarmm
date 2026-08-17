import { EnvelopeSimpleIcon } from '@phosphor-icons/react/ssr'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { SiteHeader } from '../_components/site-header'

const contributionPaths = [
	{
		label: 'Source leads',
		title: 'Send records we should index',
		description:
			'Share official documents, public datasets, archival links, or agency pages that can strengthen BetterBARMM source coverage.',
	},
	{
		label: 'Data review',
		title: 'Check labels, figures, and context',
		description:
			'Help verify names, categories, dates, amounts, offices, and summaries against official sources and local knowledge.',
	},
	{
		label: 'Public context',
		title: 'Explain what records mean',
		description:
			'Contribute plain-language notes that help people understand programmes, places, institutions, and public decisions.',
	},
	{
		label: 'Build support',
		title: 'Improve the public interface',
		description:
			'Support design, accessibility, research workflows, code, documentation, or data pipelines that make the platform easier to use.',
	},
]

export default function ContributePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='contribute' />

			<PageHeader
				eyebrow='Contribute to BetterBARMM'
				title='Help make public records'
				titleMuted='usable.'
				description='BetterBARMM is a public transparency project. If you have source documents, corrections, local context, research notes, or skills that can make Bangsamoro public information clearer, we want to hear from you.'
			>
				<a href='mailto:support@betterbarmm.com' className='btn btn-solid btn-lg'>
					<EnvelopeSimpleIcon size={16} weight='fill' aria-hidden='true' />
					support@betterbarmm.com
				</a>
			</PageHeader>

			{/* ---- Ways to help ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='flex flex-col justify-between gap-3 border-b border-[var(--rule)] pb-3 lg:flex-row lg:items-end'>
						<div>
							<p className='eyebrow'>Ways to help</p>
							<h2 className='mt-3 text-2xl font-semibold leading-tight'>
								Small contributions improve the public record.
							</h2>
						</div>
						<p className='max-w-xl text-sm leading-6 text-[var(--ink-3)]'>
							Every useful correction, source link, and review note makes the portal more reliable
							for citizens, journalists, researchers, and public servants.
						</p>
					</div>

					<div>
						{contributionPaths.map((item, index) => (
							<div
								key={item.label}
								style={{ '--row-index': index } as React.CSSProperties}
								className='row row-in grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 py-6'
							>
								<span className='num text-[13px] font-medium text-[var(--ink-3)]'>
									{String(index + 1).padStart(2, '0')}
								</span>
								<div className='min-w-0'>
									<span className='badge badge-plain badge-idle'>{item.label}</span>
									<h3 className='mt-2 text-[16.5px] font-medium leading-snug text-[var(--ink)]'>
										{item.title}
									</h3>
									<p className='mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</Reveal>
			</section>

			{/* ---- Contributor roll ---- */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='grid gap-10 border-t border-[var(--rule)] pt-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16'>
						<div>
							<p className='eyebrow'>Contributor roll</p>
							<h2 className='mt-3 text-2xl font-semibold leading-tight'>Names will live here.</h2>
							<p className='mt-3 text-sm leading-6 text-[var(--ink-3)]'>
								As verified contributions are accepted, this page will recognise the people and
								groups who helped improve the public record.
							</p>
						</div>

						<div className='card p-8 lg:p-10'>
							<span className='badge badge-plain badge-early'>Open slot</span>
							<h3 className='mt-4 text-xl font-semibold leading-snug text-[var(--ink)]'>
								Your name could be listed here.
							</h3>
							<p className='mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-2)]'>
								Send a useful source, correction, review note, or improvement. Once reviewed,
								contributor names can appear here with the kind of public record work they helped
								strengthen.
							</p>
							<a href='mailto:support@betterbarmm.com' className='btn btn-quiet mt-7'>
								<EnvelopeSimpleIcon size={15} weight='fill' aria-hidden='true' />
								Send a contribution
							</a>
						</div>
					</div>
				</Reveal>
			</section>
		</main>
	)
}
