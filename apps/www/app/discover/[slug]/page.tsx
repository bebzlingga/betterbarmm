import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { discoverBarmmTopics } from '../../_components/discover-barmm-data'
import { DiscoverTopicBody } from '../../_components/discover-topic'
import { PageHeader } from '../../_components/page-header'
import { SiteHeader } from '../../_components/site-header'

export function generateStaticParams() {
	return discoverBarmmTopics.map((topic) => ({ slug: topic.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params
	const topic = discoverBarmmTopics.find((item) => item.slug === slug)

	if (!topic) {
		return { title: 'Discover BARMM' }
	}

	return {
		title: `${topic.navTitle ?? topic.label} — Discover BARMM`,
		description: topic.description,
	}
}

export default async function DiscoverTopicPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const index = discoverBarmmTopics.findIndex((item) => item.slug === slug)

	if (index === -1) {
		notFound()
	}

	const topic = discoverBarmmTopics[index]
	const previous = discoverBarmmTopics[index - 1]
	const next = discoverBarmmTopics[index + 1]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='discover' />

			<PageHeader
				eyebrow={topic.navTitle ?? topic.label}
				title={topic.title}
				description={topic.description}
			>
				<Link href='/discover' className='btn btn-quiet'>
					<ArrowLeftIcon className='size-4' aria-hidden='true' />
					All of Discover BARMM
				</Link>
			</PageHeader>

			<section className='border-b border-[var(--rule)]'>
				<div className='mx-auto max-w-[88rem] px-6 py-12 lg:px-8'>
					<DiscoverTopicBody topic={topic} />
				</div>
			</section>

			{/* Where to go next, as a pair of rows rather than two boxes — the
			    same hairline-and-tint treatment the rest of the site uses. */}
			<section>
				<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
					<div className='grid sm:grid-cols-2 sm:gap-x-16'>
						{previous ? (
							<Link
								href={`/discover/${previous.slug}`}
								className='row group flex items-center gap-4 py-8'
							>
								<ArrowLeftIcon
									className='row-arrow size-4 shrink-0 group-hover:-translate-x-0.5'
									aria-hidden='true'
								/>
								<div className='min-w-0'>
									<p className='label label-strong'>Previous</p>
									<h2 className='mt-1.5 text-[16.5px] font-medium leading-snug text-[var(--ink)]'>
										{previous.navTitle ?? previous.label}
									</h2>
								</div>
							</Link>
						) : (
							<div className='hidden sm:block' />
						)}

						{next ? (
							<Link
								href={`/discover/${next.slug}`}
								className='row group flex items-center justify-between gap-4 py-8 text-right'
							>
								<div className='ml-auto min-w-0'>
									<p className='label label-strong'>Next</p>
									<h2 className='mt-1.5 text-[16.5px] font-medium leading-snug text-[var(--ink)]'>
										{next.navTitle ?? next.label}
									</h2>
								</div>
								<ArrowRightIcon className='row-arrow size-4 shrink-0' aria-hidden='true' />
							</Link>
						) : null}
					</div>
				</div>
			</section>
		</main>
	)
}
