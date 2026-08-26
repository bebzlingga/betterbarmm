import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CtaAction, CtaPanel, LineReveal, Rise } from '@betterbarmm/editorial'
import {
	discoverBarmmTopics,
	type DiscoverBarmmTopic,
} from '../_components/discover-barmm-data'
import { PhotoFrame } from '../_components/discover-figure'
import { DiscoverGallery } from '../_components/discover-gallery'
import { DiscoverHero } from '../_components/discover-hero'
import {
	DiscoverIndexRows,
	type DiscoverIndexRow,
} from '../_components/discover-index-rows'
import { DiscoverMarquee } from '../_components/discover-marquee'
import { discoverPhotos, photo } from '../_components/discover-media'
import { DiscoverRegionPanel } from '../_components/discover-region-panel'
import { discoverIndexGallery } from '../_components/discover-topic-media'
import { lguData } from '@betterbarmm/lgu-data'
import { SectionHead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'

export const metadata: Metadata = {
	title: 'Discover BARMM — a guide to the Bangsamoro',
	description:
		'A source-backed public guide to the Bangsamoro Autonomous Region in Muslim Mindanao: its history, its government, its local government units, its peoples, and the places that hold them.',
}

/**
 * What each chapter actually contains, in the reader's terms.
 *
 * Not a description of the page — a list of what they will find on it. "Six
 * centuries" tells someone whether to click; "explore the history of the
 * region" does not.
 */
function chapterContains(topic: DiscoverBarmmTopic): string[] {
	switch (topic.slug) {
		case 'history':
			return [`${topic.timeline?.length ?? 0} moments`, 'Sultanates', 'Peace process', 'Organic Law']
		case 'governance':
			return [
				'Parliament',
				'Chief Minister',
				`${topic.detailCards?.length ?? 0} institutions`,
				'Ministries',
			]
		case 'local-government':
			// From the directory dataset, not the PSA totals that still count Sulu.
			return [
				`${lguData.totals.barangays.toLocaleString('en-US')} barangays`,
				`${lguData.totals.lgus} cities and towns`,
				'Demographics',
				'Services',
			]
		case 'people': {
			const moro = topic.peopleGroups?.[0]?.people.length ?? 0
			return [`${moro} Moro groups`, 'Indigenous peoples', 'Settlers', 'Languages']
		}
		default:
			return ['Mosques', 'Islands', 'Food', 'Textiles']
	}
}

/** The names the region calls itself by. */
const marqueeNames = [
	'Meranao',
	'Maguindanaon',
	'Iranun',
	'Yakan',
	'Tausug',
	'Sama',
	'Sama di Laut',
	'Jama Mapun',
	'Kagan',
	'Kolibugan',
	'Sangil',
	'Molbog',
	'Palawanon',
	'Teduray',
	'Lambangian',
	'Manobo Dulangan',
] as const

/**
 * The chapter count, spelled out.
 *
 * A headline is the one place on this site where a figure reads better as a
 * word — "5 chapters." at display size looks like a typo. The map keeps the
 * headline honest if a chapter is added, and falls back to the numeral rather
 * than going stale.
 */
const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight']
const CHAPTER_COUNT_WORD =
	COUNT_WORDS[discoverBarmmTopics.length] ?? String(discoverBarmmTopics.length)

/** Photographs that stand in for each chapter on the index. */
const chapterPhoto = {
	history: 'makhdumMosque',
	governance: 'governmentCenter',
	'local-government': 'cotabatoPlaza',
	people: 'tausugAttire',
	'culture-places': 'panampangan',
} as const

export default function DiscoverBarmmPage() {
	const rows: DiscoverIndexRow[] = discoverBarmmTopics.map((topic) => ({
		slug: topic.slug,
		word: topic.navTitle ?? topic.label,
		blurb: topic.description,
		contains: chapterContains(topic),
		photo: discoverPhotos[chapterPhoto[topic.slug as keyof typeof chapterPhoto]],
	}))

	// Counts for the figures panel are derived rather than written down, so a new
	// timeline event or a new ministry updates the headline number by itself.
	const peopleCount = discoverBarmmTopics
		.flatMap((topic) => topic.peopleGroups ?? [])
		.reduce((sum, group) => sum + group.people.length, 0)
	const momentCount = discoverBarmmTopics.reduce(
		(sum, topic) => sum + (topic.timeline?.length ?? 0),
		0,
	)
	const institutionCount = discoverBarmmTopics
		.filter((topic) => topic.slug === 'governance')
		.reduce((sum, topic) => sum + (topic.detailCards?.length ?? 0), 0)

	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			{/* The bar rides over the photograph until the reader has scrolled past
			    it — a solid strip across the top of a full-bleed masthead cuts the
			    sky off exactly where the picture is doing its work. */}
			<SiteHeader activeItem='discover' overlay />

			<DiscoverHero
				size='index'
				kicker='A Bangsamoro primer'
				lines={['Get to know', 'the Bangsamoro.']}
				outline={[1]}
				standfirst='Before the budgets, the bills, and the ballot papers — the region itself. Six centuries of history, thirteen Moro peoples, a parliament of eighty, and the islands, lakes and mosques in between. Sourced throughout, and free to check.'
				photo={photo('panampangan')}
				scrollTo='#chapters'
				scrollLabel={`${discoverBarmmTopics.length} chapters`}
				footnote={
					<p className='num text-[12.5px] text-white/55'>
						{discoverBarmmTopics.length} chapters · {momentCount} moments · {peopleCount} peoples
					</p>
				}
			/>

			{/* ---- The names ---- */}
			<DiscoverMarquee items={marqueeNames} duration={54} />

			{/* ---- Chapters ---- */}
			<section id='chapters' className='bb-container scroll-mt-20 bb-section'>
				<SectionHead
					index='01'
					eyebrow='Where to start'
					title={`${CHAPTER_COUNT_WORD} chapters.`}
					titleMuted='Read them in any order.'
					lead='Each one is a plain-language guide with its sources attached — written for someone arriving with no background at all.'
				/>

				<div>
					<DiscoverIndexRows rows={rows} />
				</div>
			</section>

			{/* ---- The region, in figures ---- */}
			<DiscoverRegionPanel
				topicCount={discoverBarmmTopics.length}
				peopleCount={peopleCount}
				momentCount={momentCount}
				institutionCount={institutionCount}
			/>

			{/* ---- Two entry points, as pictures ----

			    Not every reader wants a chapter. Some want the oldest mosque in the
			    country; some want to know who is running for what. These are the two
			    doors out of the primer, and they are the size of doors. */}
			<section className='bb-container bb-section'>
				<SectionHead index='03' eyebrow='Two ways in' title='Start anywhere.' />

				<div className='mt-14 grid gap-6 lg:grid-cols-2'>
					<Link href='/discover/history' className='group block'>
						<PhotoFrame
							photo={photo('makhdumMosque')}
							className='aspect-[4/3] sm:aspect-[16/10]'
							sizes='(min-width: 1024px) 46vw, 100vw'
							zoom
							scrim='soft'
							hideCredit
						>
							<span className='absolute inset-0 z-2 flex flex-col justify-end p-7 lg:p-10'>
								<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>
									Start at the beginning
								</span>
								<span className='mt-3 max-w-[14ch] text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-4xl'>
									How BARMM came to be
								</span>
								<span className='mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80'>
									Read the timeline
									<ArrowRightIcon
										className='size-3.5 transition duration-500 group-hover:translate-x-1'
										aria-hidden='true'
									/>
								</span>
							</span>
						</PhotoFrame>
					</Link>

					<Link href='/soon' className='group block'>
						<PhotoFrame
							photo={photo('parliamentSession')}
							className='aspect-[4/3] sm:aspect-[16/10]'
							sizes='(min-width: 1024px) 46vw, 100vw'
							zoom
							scrim='soft'
							hideCredit
							delay={0.1}
						>
							<span className='absolute inset-0 z-2 flex flex-col justify-end p-7 lg:p-10'>
								<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>
									Already know the region?
								</span>
								<span className='mt-3 max-w-[14ch] text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white sm:text-4xl'>
									The 2026 Election workspace
								</span>
								<span className='mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80'>
									Parties, candidates, districts
									<ArrowRightIcon
										className='size-3.5 transition duration-500 group-hover:translate-x-1'
										aria-hidden='true'
									/>
								</span>
							</span>
						</PhotoFrame>
					</Link>
				</div>
			</section>

			{/* ---- The picture wall ----

			    Bottom padding only: the two doors above it close on a full step of
			    section rhythm, and a second one on top of that read as the page
			    having ended. */}
			<section className='bb-section-bottom'>
				<div className='bb-container'>
					<SectionHead
						index='04'
						eyebrow='In pictures'
						title='The region,'
						titleMuted='as it looks.'
						lead='Every photograph here is public domain or openly licensed, and names its photographer. Open one for the full frame and its source file.'
					/>
				</div>

				<div>
					<DiscoverGallery photos={discoverIndexGallery.map((key) => discoverPhotos[key])} />
				</div>
			</section>

			{/* ---- Caveat ----

			    The one thing a primer on a contested region has to say out loud, and
			    it is set at the size of a claim rather than as a footnote. */}
			{/* Bottom padding only. The picture wall above already ends on a full step
			    of section rhythm, and two of them stacked left the closing note
			    marooned a screen below the thing it qualifies. */}
			<section className='bb-container bb-section-bottom'>
				<Rise distance={14}>
					<div className='bb-kicker'>
						<span>05</span>
						<span>Before you cite this</span>
					</div>
				</Rise>

				{/* Full width rather than the narrow right-hand column of a split. This is
				    the page saying what it is not, which is the last thing a reader should
				    have to squint at. */}
				<div className='mt-10'>
					<LineReveal
						as='h2'
						lines={['This is a starting point,', 'not the last word.']}
						className='bb-display-sm text-[var(--ink)]'
						lineClassName={[undefined, 'bb-mute']}
					/>

					<Rise delay={0.15} distance={18}>
						{/* `bb-prose` caps itself at 34em in the shared layer, and unlayered CSS
						    outranks any utility — so the override is inline. Two columns keep
						    the measure readable across the full width. */}
						<div className='bb-prose dsc-two-column mt-10' style={{ maxWidth: 'none' }}>
							<p>
								Discover BARMM is written for readers who want context before opening a budget line
								or a bill. It is deliberately plain, and it points at official sources rather than
								replacing them — names, figures, and office-holders change, and the official page is
								always right where we are wrong.
							</p>
							<p>
								Some of what is here is contested history, told by people who lived different sides
								of it. Where an account is disputed, this guide says so rather than picking a
								winner. If something is wrong, out of date, or missing, the correction is welcome
								and the source is what settles it.
							</p>
						</div>
					</Rise>
				</div>
			</section>

			<CtaPanel
				label='Keep it honest'
				lines={['Found something', 'we got wrong?']}
				standfirst='Names, figures, and office-holders change. Where this guide differs from an official page, the official page is right — and the correction is welcome.'
			>
				<CtaAction>
					<Link href='/contribute' className='bb-btn bb-btn-brass'>
						Send a correction
						<ArrowRightIcon className='size-3.5' weight='bold' aria-hidden='true' />
					</Link>
				</CtaAction>
				<CtaAction>
					<Link href='/about' className='bb-btn bb-btn-ghost'>
						How this is built
					</Link>
				</CtaAction>
			</CtaPanel>
		</main>
	)
}
