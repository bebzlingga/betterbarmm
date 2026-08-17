import {
	ArrowRightIcon,
	BankIcon,
	ClockCounterClockwiseIcon,
	MosqueIcon,
	UsersThreeIcon,
} from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { discoverBarmmTopics } from '../_components/discover-barmm-data'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { SiteHeader } from '../_components/site-header'

const discoverTopicIcons = [ClockCounterClockwiseIcon, BankIcon, UsersThreeIcon, MosqueIcon] as const

export default function DiscoverBarmmPage() {
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='discover' />

			<PageHeader
				eyebrow='Bangsamoro primer'
				title='Get to know'
				titleMuted='the Bangsamoro.'
				description='Start with the region: its history, cultures, institutions, and places. This is a growing, source-backed public guide for readers who want context before reading budgets, bills, and source records.'
			/>

			{/* Interior rules only: every cell draws its own top and left edge, and
			    the grid is nudged a pixel up and left so the outermost of those are
			    clipped away. That separates the cells at every breakpoint without
			    hand-counting which one starts a row or a column. */}
			<section className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
				<Reveal>
					<div className='overflow-hidden border-t border-[var(--rule)]'>
						<div className='-ml-px -mt-px grid sm:grid-cols-2 lg:grid-cols-4'>
							{discoverBarmmTopics.map((topic, index) => {
								const Icon = discoverTopicIcons[index]

								return (
									<Link
										key={topic.slug}
										href={`/discover/${topic.slug}`}
										style={{ '--row-index': index } as React.CSSProperties}
										className='row-in group flex h-full flex-col border-l border-t border-[var(--rule)] p-8 transition hover:bg-[var(--paper-2)] lg:p-10'
									>
										<Icon
											className='size-8 text-[var(--accent)]'
											weight='duotone'
											aria-hidden='true'
										/>
										<h2 className='mt-6 text-[15px] font-bold leading-snug text-[var(--ink)]'>
											{topic.navTitle ?? topic.title}
										</h2>
										<p className='mt-2 flex-1 text-[13px] leading-6 text-[var(--ink-2)]'>
											{topic.description}
										</p>
										<span className='meta-sm mt-6 inline-flex items-center gap-1.5 transition group-hover:text-[var(--accent)]'>
											Read
											<ArrowRightIcon
												className='size-3 transition group-hover:translate-x-0.5'
												aria-hidden='true'
											/>
										</span>
									</Link>
								)
							})}
						</div>
					</div>
				</Reveal>
			</section>
		</main>
	)
}
