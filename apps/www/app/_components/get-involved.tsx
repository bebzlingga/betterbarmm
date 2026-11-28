import { ArrowRightIcon, FileArrowUpIcon, MagnifyingGlassPlusIcon, PencilSimpleLineIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'

const ASKS = [
	{ icon: PencilSimpleLineIcon, title: 'Send a correction', note: 'A wrong figure, a dead link, a name misspelled: tell us and it gets fixed.' },
	{ icon: FileArrowUpIcon, title: 'Send a document', note: 'A law, a budget, a report or an ordinance worth adding to the record.' },
	{ icon: MagnifyingGlassPlusIcon, title: 'Tell us what is missing', note: 'A record you looked for here and could not find.' },
]

/**
 * The site's closing ask, at the foot of every page that does not end on an ask of its own, as travel's sits above
 * its footer (user decision: the travel look): the question on the left, what a reader can send stacked on the right.
 */
export function GetInvolved() {
	return (
		<section className='tv-ask'>
			<div className='bb-container grid gap-12 py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:py-32'>
				<div>
					<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>Get involved</p>
					<h2 className='mt-4 max-w-[38rem] font-[family-name:var(--font-display)] text-[clamp(2.25rem,4.2vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--ink)]'>
						Public records get better when people check them.
					</h2>
					<p className='mt-6 max-w-xl text-[1rem] leading-relaxed text-[var(--ink-2)]'>
						Spotted an error, or have a document worth adding? Every correction and every source makes the record stronger, and the official source is always
						right where we are wrong.
					</p>
					<Link href='/about' className='mt-8 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'>
						About the project <ArrowRightIcon size={14} weight='bold' aria-hidden='true' />
					</Link>
				</div>
				<ul className='border-b border-[var(--rule)] lg:self-center'>
					{ASKS.map(({ icon: Glyph, title, note }) => (
						<li key={title} className='border-t border-[var(--rule)]'>
							<Link href='/contribute' className='group flex items-start gap-5 py-6'>
								<Glyph size={26} weight='duotone' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
								<span className='min-w-0 flex-1'>
									<span className='block font-[family-name:var(--font-display)] text-[1.125rem] font-bold text-[var(--ink)]'>{title}</span>
									<span className='mt-1 block text-[0.875rem] leading-relaxed text-[var(--ink-3)]'>{note}</span>
								</span>
								<span className='mt-1 inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition group-hover:text-[var(--accent)]'>
									Send
									<ArrowRightIcon size={14} weight='bold' className='transition group-hover:translate-x-1' aria-hidden='true' />
								</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}
