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
		<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
			<Reveal>
				<div className='card grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)] lg:gap-14'>
					<div>
						<span className='badge badge-plain badge-idle'>Not yet compiled</span>

						{/* The space after the label is explicit: the text that follows runs
						    onto a second line, and JSX trims each line of a multi-line node
						    — which ate it and printed "Journalhaven't". */}
						<h2 className='mt-4 max-w-xl text-xl font-semibold leading-snug sm:text-2xl'>
							{category.officialLabel}{' '}
							haven&rsquo;t been captured yet.
						</h2>

						<p className='mt-4 max-w-xl text-sm leading-6 text-[var(--ink-2)]'>
							{category.description}
						</p>

						<p className='mt-4 max-w-xl text-sm leading-6 text-[var(--ink-3)]'>
							This section is built and waiting on data. The moment the records are compiled into
							the registry, they will appear here with the same search, filtering, and
							plain-language notes as every other category.
						</p>

						<div className='mt-7 flex flex-wrap gap-2.5'>
							<a
								href={category.sourceUrl}
								target='_blank'
								rel='noreferrer'
								className='btn btn-solid'
							>
								View the official source
							</a>
							<Link href='/bills' className='btn btn-quiet'>
								Browse bills instead
							</Link>
						</div>
					</div>

					{gaps.length > 0 ? (
						<aside className='border-t border-[var(--rule)] pt-8 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0'>
							<p className='label'>What&rsquo;s missing</p>
							<ul className='mt-4 grid gap-3'>
								{gaps.map((gap, index) => (
									<li key={index} className='text-[13px] leading-6 text-[var(--ink-3)]'>
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
