import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CtaAction, CtaPanel, Rise } from '@betterbarmm/editorial'
import { discoverBarmmTopics } from '../../_components/discover-barmm-data'
import { DiscoverChapterHero } from '../../_components/discover-hero'
import { photo } from '../../_components/discover-media'
import { ChapterLinkCard, DiscoverTopicBody } from '../../_components/discover-topic'
import { discoverTopicMedia, topicMedia } from '../../_components/discover-topic-media'
import { SiteHeader } from '../../_components/site-header'

export function generateStaticParams() {
	return discoverBarmmTopics.map((topic) => ({ slug: topic.slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const topic = discoverBarmmTopics.find((item) => item.slug === slug)

	if (!topic) {
		return { title: 'Discover BARMM' }
	}

	return {
		title: `${topic.navTitle ?? topic.label} — Discover BARMM`,
		description: topicMedia(slug)?.standfirst ?? topic.description,
	}
}

/** The photograph that stands in for a chapter when it is linked from another. */
const chapterCardPhoto = {
	history: 'makhdumMosque',
	governance: 'parliamentBuilding',
	'local-government': 'cotabatoPlaza',
	people: 'singkil',
	'culture-places': 'budBongao',
} as const

export default async function DiscoverTopicPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const index = discoverBarmmTopics.findIndex((item) => item.slug === slug)

	if (index === -1) {
		notFound()
	}

	const topic = discoverBarmmTopics[index]
	const media = discoverTopicMedia[topic.slug]
	const previous = discoverBarmmTopics[index - 1]
	const next = discoverBarmmTopics[index + 1]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			{/* Transparent over the opening photograph, solid once the reader has
			    scrolled into the text. The progress hairline under the bar is the
			    chapter's own length — these run to three thousand words and a reader
			    is entitled to know how much of one they are in. */}
			<SiteHeader activeItem='discover' overlay />

			<DiscoverChapterHero
				chapter={`Chapter ${String(index + 1).padStart(2, '0')} of ${String(discoverBarmmTopics.length).padStart(2, '0')} · Discover BARMM`}
				title={topic.title}
				standfirst={media?.standfirst ?? topic.description}
				photo={photo(media?.hero ?? 'panampangan')}
				scrollTo='#read'
			/>

			<DiscoverTopicBody topic={topic} media={media} />

			{/* ---- Where to go next ----

			    Two photographs the size of doors rather than two text rows. At the
			    foot of three thousand words, a hairline link is not a strong enough
			    signal that there is another chapter. */}
			<section>
				<div className='bb-container pb-28 pt-24 lg:pb-36 lg:pt-32'>
					<Rise distance={14}>
						<div className='bb-kicker'>
							<span>&mdash;</span>
							<span>Keep reading</span>
						</div>
					</Rise>

					<div className='mt-12 grid gap-5 sm:grid-cols-2'>
						<Rise distance={18}>
							{previous ? (
								<Link href={`/discover/${previous.slug}`} className='group block'>
									<ChapterLinkCard
										label='← Previous chapter'
										title={previous.navTitle ?? previous.label}
										photoKey={chapterCardPhoto[previous.slug as keyof typeof chapterCardPhoto]}
									/>
								</Link>
							) : (
								<Link href='/discover' className='group block'>
									<ChapterLinkCard
										label='← Back to the start'
										title={`All ${discoverBarmmTopics.length} chapters`}
										photoKey='panampangan'
									/>
								</Link>
							)}
						</Rise>

						<Rise delay={0.09} distance={18}>
							{next ? (
								<Link href={`/discover/${next.slug}`} className='group block'>
									<ChapterLinkCard
										label='Next chapter →'
										title={next.navTitle ?? next.label}
										photoKey={chapterCardPhoto[next.slug as keyof typeof chapterCardPhoto]}
										align='right'
									/>
								</Link>
							) : (
								<Link href='https://election.betterbarmm.com' className='group block'>
									<ChapterLinkCard
										label='Next →'
										title='The 2026 Election workspace'
										photoKey='parliamentSession'
										align='right'
									/>
								</Link>
							)}
						</Rise>
					</div>
				</div>
			</section>

			<CtaPanel
				label='Keep it honest'
				lines={['Names change.', 'Figures get revised.']}
				standfirst='Where this chapter differs from an official page, the official page is right — and the correction is welcome. Send the source and it gets checked against the record.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Send a correction
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<Link href='/discover' className='bb-btn bb-btn-ghost'>
						All {discoverBarmmTopics.length} chapters
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
