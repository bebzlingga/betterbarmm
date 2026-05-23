import { SiteHeader } from '../_components/site-header'

const contributionPaths = [
	{
		label: 'Source leads',
		title: 'Send records we should index',
		description: 'Share official documents, public datasets, archival links, or agency pages that can strengthen BetterBARMM source coverage.',
	},
	{
		label: 'Data review',
		title: 'Check labels, figures, and context',
		description: 'Help verify names, categories, dates, amounts, offices, and summaries against official sources and local knowledge.',
	},
	{
		label: 'Public context',
		title: 'Explain what records mean',
		description: 'Contribute plain-language notes that help people understand programs, places, institutions, and public decisions.',
	},
	{
		label: 'Build support',
		title: 'Improve the public interface',
		description: 'Support design, accessibility, research workflows, code, documentation, or data pipelines that make the platform easier to use.',
	},
]

export default function ContributePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='contribute' />

			<section className='relative overflow-hidden border-b border-[var(--ink)]'>
				<div
					className='absolute inset-0 opacity-70'
					aria-hidden='true'
				>
					<div className='absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,var(--rule-soft)_1px,transparent_1px),linear-gradient(to_bottom,var(--rule-soft)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:96px_96px]' />
				</div>

				<div className='relative mx-auto max-w-7xl px-8 py-16 sm:py-20 lg:py-32'>
					<p className='eyebrow'>Contribute to BetterBARMM</p>
					<h1 className='mt-4 max-w-6xl text-5xl font-extrabold leading-[0.92] tracking-[-0.04em] sm:mt-5 sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[9rem]'>Help make public records usable.</h1>
					<p className='mt-6 max-w-3xl text-base leading-6! text-[var(--ink-2)] sm:mt-8 sm:text-lg sm:leading-7! lg:text-xl lg:leading-9!'>
						BetterBARMM is a public transparency project. If you have source documents, corrections, local context, research notes, or skills that can make Bangsamoro public information clearer, we
						want to hear from you.
					</p>
					<div className='mt-8 flex flex-col gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] sm:flex-row sm:flex-wrap'>
						<a
							href='mailto:support@betterbarmm.com'
							className='inline-flex w-fit border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-[var(--paper)] transition hover:bg-[var(--accent)]'
						>
							support@betterbarmm.com
						</a>
					</div>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-8 py-20 sm:py-24 lg:py-32'>
				<div className='mb-12 flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='eyebrow'>Ways to help</p>
						<h2 className='mt-3 max-w-3xl text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Small contributions can improve the public record.</h2>
					</div>
					<p className='max-w-lg text-base leading-6 text-[var(--ink-3)]'>
						Every useful correction, source link, and review note makes the portal more reliable for citizens, journalists, researchers, and public servants.
					</p>
				</div>

				<div className='grid border-y border-[var(--ink)] sm:grid-cols-2 lg:grid-cols-4'>
					{contributionPaths.map((item, index) => (
						<div
							key={item.label}
							className='border-b border-[var(--rule)] py-5 sm:border-r sm:p-6 sm:[&:nth-child(2n)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0'
						>
							<div className='flex items-center justify-between gap-4'>
								<p className='inline-block bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.28em] text-white'>0{index + 1}</p>
								<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>{item.label}</p>
							</div>
							<h3 className='mt-5 text-xl font-extrabold leading-tight tracking-[-0.02em]'>{item.title}</h3>
							<p className='mt-4 text-sm leading-snug! text-[var(--ink-2)]'>{item.description}</p>
						</div>
					))}
				</div>
			</section>

			<section className='bg-[var(--paper-2)] py-20 sm:py-24 lg:py-32'>
				<section className='mx-auto max-w-7xl px-8 '>
					<div className='grid gap-16 pt-10 lg:grid-cols-[minmax(18rem,0.7fr)_1fr]'>
						<div>
							<p className='eyebrow'>Contributor roll</p>
							<h2 className='mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em] sm:text-5xl'>Names will live here.</h2>
							<p className='mt-5 text-base leading-6 text-[var(--ink-3)]'>As verified contributions are accepted, this page will recognize people and groups who helped improve the public record.</p>
						</div>

						<div className='border-t border-[var(--ink)]'>
							<div className='grid gap-4 py-8 sm:grid-cols-[8rem_1fr] sm:items-start'>
								<p className='mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>Open slot</p>
								<div>
									<h3 className='text-2xl font-extrabold tracking-[-0.02em]'>Your name could be listed here.</h3>
									<p className='mt-3 text-sm leading-6 text-[var(--ink-2)]'>
										Send a useful source, correction, review note, or improvement. Once reviewed, contributor names can appear here with the kind of public record work they helped strengthen.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</section>
		</main>
	)
}
