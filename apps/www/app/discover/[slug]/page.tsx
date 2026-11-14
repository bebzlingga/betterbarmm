import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { pageMeta } from '../../_lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CtaAction, CtaPanel, Rise } from '@betterbarmm/editorial'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { DiscoverChapterHero } from '../../_components/discover-hero'
import { photo } from '../../_components/discover-media'
import { DiscoverTopicBody } from '../../_components/discover-topic'
import { ChapterTabs, ChapterTile } from '../../_components/chapter-grid'
import { chapterCards } from '../../_lib/chapters'
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
		return { title: 'Discover BARMM', robots: { index: false, follow: true } }
	}

	return pageMeta({
		title: `${topic.navTitle ?? topic.label} — Discover BARMM`,
		description: topicMedia(slug)?.standfirst ?? topic.description,
		path: `/discover/${slug}`,
	})
}

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
	const previous = chapterCards[index - 1]
	const next = chapterCards[index + 1]

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			{/* The same bar as every other page (user decision). Its progress hairline is the chapter's own length —
			    these run to three thousand words and a reader is entitled to know how much of one they are in. */}
			<SiteHeader activeItem='discover' />

			<DiscoverChapterHero
				chapter={`Chapter ${String(index + 1).padStart(2, '0')} of ${String(discoverBarmmTopics.length).padStart(2, '0')} · Discover BARMM`}
				title={topic.title}
				standfirst={media?.standfirst ?? topic.description}
				chips={chapterCards[index]?.contains}
				scrollTo='#read'
			/>

			<ChapterTabs cards={chapterCards} current={topic.slug} />

			<DiscoverTopicBody topic={topic} media={media} />

			{/* ---- Where to go next ----

			    The next chapter as a photograph the width of the page, with what it holds,
			    so the end of three thousand words reads as a door. The last chapter opens
			    on the region's election instead. The previous chapter is a quiet link. */}
			<section className='bb-container pb-28 pt-24 lg:pb-36 lg:pt-32'>
				<Rise distance={18}>
					{next ? (
						<ChapterTile card={next} index={index + 1} wide label={`Up next · Chapter ${String(index + 2).padStart(2, '0')}`} />
					) : (
						<ChapterTile
							card={{
								href: 'https://election.betterbarmm.com',
								title: 'The 2026 Election workspace',
								blurb: 'You have read every chapter. The region now votes for its parliament for the first time: the parties, candidates and districts.',
								photo: photo('parliamentSession'),
								contains: ['Parties', 'Candidates', 'Districts'],
							}}
							index={index + 1}
							wide
							label='Up next'
						/>
					)}
				</Rise>
				<div className='mt-6 flex flex-wrap items-center justify-between gap-4 text-[0.8125rem] font-semibold'>
					{previous ? (
						<Link href={previous.href} className='inline-flex items-center gap-1.5 text-[var(--ink-3)] hover:text-[var(--accent)]'>
							<ArrowLeftIcon className='size-3.5' weight='bold' aria-hidden='true' /> Chapter {String(index).padStart(2, '0')}: {previous.title}
						</Link>
					) : (
						<span />
					)}
					<Link href='/discover' className='inline-flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--accent)]'>
						All {chapterCards.length} chapters <ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
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
