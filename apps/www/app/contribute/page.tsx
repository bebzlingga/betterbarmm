import { ArrowRightIcon, ArrowUpRightIcon, BookOpenTextIcon, CheckIcon, CodeIcon, EnvelopeSimpleIcon, ListNumbersIcon, MagnifyingGlassIcon, PaperclipIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'
import Link from 'next/link'
import { CtaAction, CtaPanel } from '@betterbarmm/editorial'
import { photo } from '../_components/discover-media'
import { BADGE, CARD, CARD_FOOT, ICON_TILE, PageBand, SectionTitle } from '../_components/page-band'
import { QuoteBand } from '../_components/quote-band'
import { SiteHeader } from '../_components/site-header'

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

			<PageBand
				label='Contribute to BetterBARMM'
				title='Help make public records usable'
				standfirst='BetterBARMM is a public transparency project. If you have source documents, corrections, local context, research notes, or skills that can make Bangsamoro public information clearer, we want to hear from you.'
				jumps={[
					{ href: '#ways', label: 'Ways to help', icon: PaperclipIcon },
					{ href: '#include', label: 'What to include', icon: CheckIcon },
					{ href: '#next', label: 'What happens next', icon: ListNumbersIcon },
				]}
			>
				{/* Fixed colours: inside the band, --paper and --ink point at its crimson ground. */}
				<a href='mailto:support@betterbarmm.com' className='inline-flex items-center gap-2 bg-white px-5 py-3 text-[0.875rem] font-bold text-[#8f2328] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)] transition hover:bg-[#fff3cf]'>
					<EnvelopeSimpleIcon size={16} weight='fill' aria-hidden='true' />
					support@betterbarmm.com
				</a>
			</PageBand>

			{/* ---- Ways to help ---- */}
			<section id='ways' aria-labelledby='ways-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] bb-section'>
				<SectionTitle
					id='ways'
					title='Small contributions improve the record'
					lead='Every useful correction, source link, and review note makes the portal more reliable for citizens, journalists, researchers, and public servants.'
				/>

				<ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{contributionPaths.map((item) => (
						<li key={item.label} className={CARD}>
							<div className='flex flex-1 flex-col items-center px-5 pb-6 pt-8 text-center'>
								<span className={ICON_TILE}>
									<item.icon size={24} weight='duotone' aria-hidden='true' />
								</span>
								<span className={`${BADGE} mt-4`}>{item.label}</span>
								<h3 className='mt-3 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em]'>
									{/* An email already titled for this kind of help; the whole card opens it. */}
									<a href={mail(item.subject)} className='after:absolute after:inset-0 group-hover:text-[var(--accent)]'>
										{item.title}
									</a>
								</h3>
								<p className='mt-2 text-[0.84375rem] leading-[1.65] text-[var(--ink-2)]'>{item.description}</p>
							</div>
							<p className={CARD_FOOT}>
								<span className='inline-flex items-center gap-1.5'>
									<EnvelopeSimpleIcon size={14} aria-hidden='true' /> Email a {item.subject.toLowerCase()}
								</span>
								<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
							</p>
						</li>
					))}
				</ul>

				{/* What to put in it. */}
				<div id='include' className='mt-6 grid scroll-mt-[calc(var(--site-header-h)+1rem)] gap-6 border border-[var(--rule)] bg-[var(--paper-2)] p-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:p-8'>
					<div>
						<p className='text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>What to include</p>
						<p className='mt-1 text-[0.8125rem] leading-[1.6] text-[var(--ink-3)]'>Each email above opens with these as headings.</p>
					</div>
					<ul className='grid gap-3 sm:grid-cols-2'>
						{include.map((line) => (
							<li key={line} className='flex gap-3 bg-[var(--paper)] p-3.5 text-[0.90625rem] leading-[1.55] text-[var(--ink-2)]'>
								<span className='grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white'>
									<CheckIcon size={13} weight='bold' aria-hidden='true' />
								</span>
								{line}
							</li>
						))}
					</ul>
				</div>
			</section>

			<QuoteBand
				photo={photo('cotabatoPlaza')}
				quote='The official source is always right where we are wrong.'
				attribution='Cotabato City — the seat of the Bangsamoro Government'
				height='short'
			/>

			{/* ---- What happens next: the four steps as numbered cards, joined by an arrow on a wide screen. ---- */}
			<section id='next' aria-labelledby='next-title' className='bb-container scroll-mt-[calc(var(--site-header-h)+1rem)] bb-section'>
				<SectionTitle id='next' title='Four steps, and none of them hidden' lead='Where what you send goes, from your email to the page.' />
				<ol className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					{whatHappens.map((step, i) => (
						<li key={step.title} className='relative flex flex-col border border-[var(--rule)] bg-[var(--paper)] p-6'>
							<span className='num text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]'>{String(i + 1).padStart(2, '0')}</span>
							<h3 className='mt-4 text-[1.0625rem] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]'>{step.title}</h3>
							<p className='mt-2 text-[0.84375rem] leading-[1.65] text-[var(--ink-2)]'>{step.description}</p>
							{i < whatHappens.length - 1 ? (
								<span aria-hidden='true' className='absolute -right-[0.95rem] top-9 z-1 hidden size-7 place-items-center rounded-full border border-[var(--rule)] bg-[var(--paper)] text-[var(--accent)] lg:grid'>
									<ArrowRightIcon size={13} weight='bold' />
								</span>
							) : null}
						</li>
					))}
				</ol>
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
