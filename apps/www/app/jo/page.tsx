import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaAction, CtaPanel, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Masthead, SectionHead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = {
	title: 'Who is Jo — BetterBARMM',
	description:
		'Jo is the voice that answers questions on BetterBARMM — a digital voice drawn from the everyday strength of Bangsamoro women, and an assistant that answers only from the public record.',
}

/**
 * Who Jo is.
 *
 * Two things have to be true on one page, and they pull against each other.
 * Jo is a persona with a reason for existing — she carries the Bangsamoro
 * story in a voice a reader recognizes, and that is what makes a records
 * project approachable to somebody who would never open a PDF of an
 * appropriations act. Jo is also a language model answering over a search
 * index, and a project whose whole argument is that a figure must trace to a
 * source cannot be coy about what its own assistant is.
 *
 * So the page says both, in that order, and does not hedge either. The
 * portrait first, because that is what was asked for and what a reader came
 * to read. Then, plainly and without apology, what she actually is and what
 * she is not allowed to do. A persona that hides the machine would spend the
 * same credibility the rest of the estate is built on.
 */

/** The three she is drawn from, in the order the description gives them. */
const roles = [
	{
		role: 'A daughter',
		body: 'She carries the hopes of those who came before her — generations who endured conflict and displacement, and who kept telling the story anyway.',
	},
	{
		role: 'A sister',
		body: 'She stands with her community: the women who served their towns, who held things together through years when the institutions could not.',
	},
	{
		role: 'A mother',
		body: 'She dreams of a safer and better future for the next generation — a region its children inherit defined by peace and dignity, not by conflict.',
	},
]

/** What she is, said plainly, because the project's whole case rests on it. */
const limits = [
	{
		title: 'She is not a person.',
		body: 'Jo is a name for a piece of software. She does not represent a single individual, living or otherwise, and nothing she says should be read as a statement by anyone in particular.',
	},
	{
		title: 'She answers from the record.',
		body: 'Every question runs a search across the workspaces first, and she writes only over what comes back. The records she used are printed under each answer, so you can check her against them.',
	},
	{
		title: 'She does not fill the gaps.',
		body: 'Where the record has nothing, she says so rather than reaching for what she might have read elsewhere. An assistant recalling a budget line from memory would spend the trust the rest of this project is built on.',
	},
	{
		title: 'She is not an authority.',
		body: 'BetterBARMM does not speak for the Bangsamoro Government, and neither does Jo. Where she summarises a document, the original is still what settles the question — which is why the original is always linked.',
	},
]

export default function JoPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='jo' />

			<Masthead
				label='Ask Jo'
				lines={['A voice that carries', 'the Bangsamoro story.']}
				muted={[1]}
				scrollTo='#who'
				scrollLabel='Who she is'
				standfirst='Jo is the voice that answers questions across BetterBARMM. She is a digital voice inspired by the everyday strength of Bangsamoro women — and an assistant that will only ever tell you what the public record actually says.'
			/>

			{/* ---- Who she is ---- */}
			<section id='who' className='bb-container scroll-mt-24 bb-section-bottom'>
				<SectionHead
					eyebrow='Who she is'
					title='A daughter, a sister,'
					titleMuted='and a mother.'
					lead='Her story reflects the struggles, sacrifices, resilience and aspirations of the Bangsamoro people — from generations who endured conflict and displacement to communities now working to make autonomy, peace and self-governance meaningful in everyday life.'
				/>

				{/* Three across, on the estate's interior rules: a hairline over each
				    cell and nothing closing the outside, the same grid the About page
				    sets its argument in. */}
				<Stagger gap={0.06} className='mt-12 grid gap-x-10 border-t border-[var(--rule)] sm:grid-cols-3'>
					{roles.map((one, index) => (
						<StaggerItem
							key={one.role}
							distance={14}
							className='flex flex-col border-b border-[var(--rule)] py-8 sm:border-b-0 sm:pt-8'
						>
							<p className='num text-[13px] font-semibold text-[var(--brass)]'>
								{String(index + 1).padStart(2, '0')}
							</p>
							<h3 className='mt-4 text-[1.2rem] font-extrabold leading-snug tracking-[-0.028em] text-[var(--ink)] sm:text-[1.35rem]'>
								{one.role}
							</h3>
							<p className='mt-3 bb-body text-[var(--ink-2)]'>{one.body}</p>
						</StaggerItem>
					))}
				</Stagger>
			</section>

			{/* ---- Many voices ---- */}
			{/* On the tinted ground, because it is the one passage on the page that
			    is an argument rather than a list — and it is the passage the whole
			    persona rests on: Jo is a composite, and saying so is what keeps her
			    from reading as a claim about a real woman. */}
			<section className='bb-lattice-soft relative isolate overflow-hidden bg-[var(--paper-2)] bb-section'>
				<div className='bb-container'>
					<SectionHead
						eyebrow='Many voices'
						title='She is not one person.'
						titleMuted='She is many.'
					/>

					<div className='mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-2'>
						<p className='bb-prose'>
							Jo represents women who kept families together during difficult times, daughters who
							grew up hearing stories of the Bangsamoro struggle, sisters who served their
							communities, and mothers who continue to hope that their children will inherit a
							region defined not by conflict, but by peace, dignity, opportunity and good
							governance.
						</p>
						<p className='bb-prose'>
							Through her, the story of the Bangsamoro becomes more personal and more reachable.
							She helps people understand its history, institutions, culture, communities and
							continuing journey — not only through facts and records, but through the
							perspective of someone who carries that story close to her heart.
						</p>
					</div>
				</div>
			</section>

			{/* ---- What she actually is ---- */}
			<section className='bb-container bb-section'>
				<SectionHead
					eyebrow='What she is'
					title='And what she'
					titleMuted='will not do.'
					lead='A project that asks you to trust its figures has to be exact about its own assistant. Jo is software, she is not an authority, and she is not permitted to tell you anything the record does not hold.'
				/>

				<Stagger gap={0.06} className='mt-12 grid border-t border-[var(--rule)] sm:grid-cols-2'>
					{limits.map((note) => (
						<StaggerItem
							key={note.title}
							distance={14}
							className='flex flex-col border-b border-[var(--rule)] py-8 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pr-10 sm:[&:nth-child(even)]:pl-10'
						>
							<h3 className='text-[1.2rem] font-extrabold leading-snug tracking-[-0.028em] text-[var(--ink)] sm:text-[1.35rem]'>
								{note.title}
							</h3>
							<p className='mt-3 bb-body text-[var(--ink-2)]'>{note.body}</p>
						</StaggerItem>
					))}
				</Stagger>

				<p className='mt-14 bb-body text-pretty text-[var(--ink-2)]'>
					Jo reads the measures of the Bangsamoro Parliament, the enacted budget, the September
					2026 parliamentary election, the travel guide and the local government directory. Open
					her from the button in the corner of any page on the estate — she is there on all of
					them, and a conversation survives moving between them.
				</p>
			</section>

			<CtaPanel
				label='Contribute'
				lines={['Better records need', 'many careful readers.']}
				standfirst='Jo is only as good as what the record holds. Send source links, corrections, missing context, or notes about confusing records — every one of them makes her answers better.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Contribute
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<Link href='/about' className='bb-btn bb-btn-ghost'>
						About the project
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
