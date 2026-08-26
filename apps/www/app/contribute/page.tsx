import { ArrowRightIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaAction, CtaPanel, Magnetic, OkirCorner, OkirRule, Rise, Stagger, StaggerItem, Tilt } from '@betterbarmm/editorial'
import { photo } from '../_components/discover-media'
import { Masthead, SectionHead } from '../_components/masthead'
import { QuoteBand } from '../_components/quote-band'
import { SiteHeader } from '../_components/site-header'
import { StepList } from '../_components/step-list'

export const metadata: Metadata = {
	title: 'Contribute — BetterBARMM',
	description:
		'Send source documents, corrections, local context, research notes, or skills that make Bangsamoro public information clearer.',
}

const contributionPaths = [
	{
		label: 'Source leads',
		title: 'Send records we should index',
		description:
			'Official documents, public datasets, archival links, or agency pages that strengthen the source coverage behind a workspace.',
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
			'Plain-language notes that help people understand programmes, places, institutions, and public decisions.',
	},
	{
		label: 'Build support',
		title: 'Improve the public interface',
		description:
			'Design, accessibility, research workflows, code, documentation, or data pipelines that make the platform easier to use.',
	},
]

/**
 * What actually happens to something you send.
 *
 * The old page asked for contributions and then said nothing about where they
 * went, which is a poor trade to offer someone: the effort is theirs and the
 * process is invisible. Four steps is the whole of it, and saying so is the
 * strongest argument for sending the first one.
 */
const whatHappens = [
	{
		title: 'You send it, with a source.',
		description:
			'An email with a link, a file, or a description of what looks wrong. The source is the part that matters — a correction without one cannot be checked, and an unchecked correction cannot be published.',
	},
	{
		title: 'It gets checked against the record.',
		description:
			'Against the official document, dataset, or gazette entry it concerns. Where the official record and the correction disagree, the official record wins and the note says so.',
	},
	{
		title: 'The page changes, and says what changed.',
		description:
			'Corrections are applied to the workspace, and anything uncertain keeps a visible confidence note rather than being quietly smoothed over.',
	},
	{
		title: 'You are credited, if you want to be.',
		description:
			'Contributor names can appear on this page with the kind of record work they helped strengthen. Anonymous is equally fine — the correction is the point, not the byline.',
	},
]

export default function ContributePage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='contribute' />

			<Masthead
				label='Contribute to BetterBARMM'
				lines={['Help make public', 'records usable.']}
				muted={[1]}
				standfirst='BetterBARMM is a public transparency project. If you have source documents, corrections, local context, research notes, or skills that can make Bangsamoro public information clearer, we want to hear from you.'
				facts={[
					{ value: '4', label: 'Ways to help' },
					{ value: '1', label: 'Email address' },
					{ value: 'Open', label: 'To anyone' },
				]}
			>
				<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-solid'>
					<EnvelopeSimpleIcon size={15} weight='fill' aria-hidden='true' />
					support@betterbarmm.com
				</a>
				<Link href='/about' className='bb-btn bb-btn-ghost'>
					How this is built
				</Link>
			</Masthead>

			{/* ---- Ways to help ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='01'
					eyebrow='Ways to help'
					title='Small contributions'
					titleMuted='improve the record.'
					lead='Every useful correction, source link, and review note makes the portal more reliable for citizens, journalists, researchers, and public servants.'
				/>

				<Stagger gap={0.1} className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
					{contributionPaths.map((item, index) => (
						<StaggerItem key={item.label}>
							<Tilt max={4} className='h-full'>
								<article className='bb-plate relative flex h-full flex-col p-7 lg:p-8'>
									<OkirCorner position='top-right' className='m-2 size-6 opacity-50' />

									<span className='num text-[12px] font-semibold text-[var(--brass)]'>
										{String(index + 1).padStart(2, '0')}
									</span>

									<h3 className='mt-10 text-[1.05rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>
										{item.title}
									</h3>
									<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>
										{item.description}
									</p>

									<p className='mt-8 border-t border-[var(--rule)] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'>
										{item.label}
									</p>
								</article>
							</Tilt>
						</StaggerItem>
					))}
				</Stagger>
			</section>

			<QuoteBand
				photo={photo('cotabatoPlaza')}
				quote='The official source is always right where we are wrong.'
				attribution='Cotabato City — the seat of the Bangsamoro Government'
				height='short'
			/>

			{/* ---- What happens next ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='02'
					eyebrow='What happens next'
					title='Four steps,'
					titleMuted='and none of them hidden.'
					lead='Asking for corrections without saying where they go is a poor trade to offer anyone. This is the whole of the process.'
				/>

				<StepList steps={whatHappens} />
			</section>

			<OkirRule className='mx-auto max-w-[88rem] opacity-70' />

			{/* ---- Contributor roll ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					index='03'
					eyebrow='Contributor roll'
					title='Names will'
					titleMuted='live here.'
					lead='As verified contributions are accepted, this page will recognise the people and groups who helped improve the public record.'
				/>

				<Rise delay={0.1} distance={18}>
					<div className='bb-plate relative mt-14 overflow-hidden p-9 lg:p-14'>
						<OkirCorner position='top-left' className='m-4 opacity-60' />
						<OkirCorner position='bottom-right' className='m-4 opacity-60' />

						<div className='relative mx-auto max-w-2xl text-center'>
							<span className='badge badge-plain badge-early'>Open slot</span>

							<h3 className='mt-6 text-[1.6rem] font-extrabold leading-tight tracking-[-0.035em] text-[var(--ink)] sm:text-[2.1rem]'>
								Your name could be listed here.
							</h3>

							<p className='mt-5 bb-body text-[var(--ink-2)]'>
								Send a useful source, a correction, a review note, or an improvement. Once it has
								been checked against the record, contributor names can appear here with the kind of
								public record work they helped strengthen.
							</p>

							<div className='mt-9 flex justify-center'>
								<Magnetic strength={0.24}>
									<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-solid'>
										<EnvelopeSimpleIcon size={15} weight='fill' aria-hidden='true' />
										Send a contribution
									</a>
								</Magnetic>
							</div>
						</div>
					</div>
				</Rise>
			</section>

			<CtaPanel
				label='One address'
				lines={['Send a source.', 'Send a correction.']}
				standfirst='There is no form to fill in and no account to make. One email address reaches the people who maintain every workspace on this site.'
			>
				<CtaAction>
					<a href='mailto:support@betterbarmm.com' className='bb-btn bb-btn-brass'>
						<EnvelopeSimpleIcon size={15} weight='fill' aria-hidden='true' />
						support@betterbarmm.com
					</a>
				</CtaAction>
				<CtaAction>
					<Link href='/discover' className='bb-btn bb-btn-ghost'>
						Discover BARMM
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
