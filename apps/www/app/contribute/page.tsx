import { ArrowRightIcon, ArrowUpRightIcon, BookOpenTextIcon, CheckIcon, CodeIcon, EnvelopeSimpleIcon, MagnifyingGlassIcon, PaperclipIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { CtaAction, CtaPanel, Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { photo } from '../_components/discover-media'
import { Masthead, SectionHead } from '../_components/masthead'
import { QuoteBand } from '../_components/quote-band'
import { SiteHeader } from '../_components/site-header'
import { StepList } from '../_components/step-list'

export const metadata: Metadata = pageMeta({
	title: 'Contribute',
	description:
		'Send source documents, corrections, local context, research notes, or skills that make Bangsamoro public information clearer.',
	path: '/contribute',
})

const contributionPaths = [
	{
		label: 'Source leads',
		icon: PaperclipIcon,
		subject: 'Source lead',
		title: 'Send records we should index',
		description:
			'Official documents, public datasets, archival links, or agency pages that strengthen the source coverage behind a workspace.',
	},
	{
		label: 'Data review',
		icon: MagnifyingGlassIcon,
		subject: 'Correction',
		title: 'Check labels, figures, and context',
		description:
			'Help verify names, categories, dates, amounts, offices, and summaries against official sources and local knowledge.',
	},
	{
		label: 'Public context',
		icon: BookOpenTextIcon,
		subject: 'Context note',
		title: 'Explain what records mean',
		description:
			'Plain-language notes that help people understand programs, places, institutions, and public decisions.',
	},
	{
		label: 'Build support',
		icon: CodeIcon,
		subject: 'Help build',
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
/** An email already addressed and titled, so the right person picks it up. */
const mail = (subject: string) =>
	`mailto:support@betterbarmm.com?subject=${encodeURIComponent(`[${subject}] `)}&body=${encodeURIComponent('The page or record:\n\nWhat it should say, or what to add:\n\nThe source (a link or a file):\n\nYour name, if you want to be credited:\n')}`

/** What makes a contribution quick to check. */
const include = [
	'The page or record it is about: a link is best.',
	'What it should say, or what is missing.',
	'The source that shows it: an official document, a gazette, an agency page.',
	'Your name, if you want the credit. Anonymous is fine.',
]

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
				brand
				label='Contribute to BetterBARMM'
				lines={['Help make public', 'records usable.']}
				muted={[1]}
				standfirst='BetterBARMM is a public transparency project. If you have source documents, corrections, local context, research notes, or skills that can make Bangsamoro public information clearer, we want to hear from you.'
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

				<Stagger gap={0.1} className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{contributionPaths.map((item) => (
						<StaggerItem key={item.label} className='h-full'>
							<a
								href={mail(item.subject)}
								className='group flex h-full flex-col rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] p-6 transition hover:border-[var(--ink-3)] lg:p-7'
							>
								<span className='flex items-center justify-between'>
									<span className='grid size-11 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white'>
										<item.icon size={22} weight='duotone' aria-hidden='true' />
									</span>
									<span className='font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-[var(--ink-mute)]'>{item.label}</span>
								</span>
								<h3 className='mt-6 text-[1.1rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{item.title}</h3>
								<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>{item.description}</p>
								<span className='mt-6 inline-flex items-center gap-1.5 border-t border-[var(--rule)] pt-4 text-[0.8125rem] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]'>
									<EnvelopeSimpleIcon size={15} aria-hidden='true' /> Email a {item.subject.toLowerCase()}
									<ArrowUpRightIcon className='ml-auto size-3.5' weight='bold' aria-hidden='true' />
								</span>
							</a>
						</StaggerItem>
					))}
				</Stagger>

				{/* What to put in it. */}
				<Rise delay={0.1} distance={14}>
					<div className='mt-6 grid gap-6 rounded-[3px] bg-[var(--paper-2)] p-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:p-8'>
						<p className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>What to include</p>
						<ul className='grid gap-3 sm:grid-cols-2'>
							{include.map((line) => (
								<li key={line} className='flex gap-3 text-[0.9375rem] leading-[1.6] text-[var(--ink-2)]'>
									<CheckIcon size={18} weight='bold' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
									{line}
								</li>
							))}
						</ul>
					</div>
				</Rise>
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
				/>

				<div className='pt-6 lg:pt-10'>
					<StepList steps={whatHappens} layout='row' />
				</div>
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
