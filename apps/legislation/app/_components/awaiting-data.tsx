import Link from 'next/link'
import type { CategoryDefinition } from '../_lib/categories'
import { Reveal } from './reveal'

/**
 * Shown for categories whose route exists but whose records haven't been
 * captured yet. It states plainly what's missing and points at the official
 * source, rather than implying the category is empty.
 */
export function AwaitingData({ category, gaps }: { category: CategoryDefinition; gaps: string[] }) {
	return (
		<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
			<Reveal>
				<div className='tv-wash grid gap-10 rounded-[var(--dv-r)] p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)] lg:gap-14'>
					<div>
						<span className='badge badge-plain badge-idle'>Not yet compiled</span>

						{/* The space after the label is explicit: the text that follows runs
						    onto a second line, and JSX trims each line of a multi-line node
						    — which ate it and printed "Journalhaven't". */}
						<h2 className='dv-title mt-5 max-w-xl'>
							{category.officialLabel}{' '}
							haven&rsquo;t been captured yet.
						</h2>

						<p className='mt-4 max-w-xl bb-body text-[var(--ink-2)]'>
							{category.description}
						</p>

						<p className='mt-4 max-w-xl bb-body text-[var(--ink-3)]'>
							This section is built and waiting on data. The moment the records are compiled into
							the registry, they will appear here with the same search, filtering, and
							plain-language notes as every other category.
						</p>

						<div className='mt-7 flex flex-wrap gap-2.5'>
							<a
								href={category.sourceUrl}
								target='_blank'
								rel='noreferrer'
								className='dv-btn dv-btn-accent'
							>
								View the official source
							</a>
							<Link href='/bills' className='dv-btn dv-btn-line'>
								Browse bills instead
							</Link>
						</div>
					</div>

					{gaps.length > 0 ? (
						<aside className='rounded-[var(--dv-r)] bg-[var(--paper)] p-6 sm:p-7'>
							<p className='font-[family-name:var(--font-display)] text-[1.125rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>What&rsquo;s missing</p>
							<ul className='mt-4 grid gap-3'>
								{gaps.map((gap, index) => (
									<li key={index} className='bb-body text-[var(--ink-3)]'>
										{gap}
									</li>
								))}
							</ul>
						</aside>
					) : null}
				</div>
			</Reveal>
		</section>
	)
}
