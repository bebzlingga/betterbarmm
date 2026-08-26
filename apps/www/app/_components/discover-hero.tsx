'use client'

import { ArrowDownIcon, ArrowLeftIcon } from '@phosphor-icons/react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { PhotoCredit } from './discover-figure'
import type { DiscoverPhoto } from './discover-media'
import { LineReveal, OkirBloom, Rise } from '@betterbarmm/editorial'

/**
 * The opening frame of Discover and of every chapter in it: one photograph the
 * width of the window with the title set over it.
 *
 * The rest of BetterBARMM opens on a masthead of type, because the rest of
 * BetterBARMM is a filing system. This half of the site has to make someone
 * want to read about a region they may know nothing about, and a sandbar in
 * Tawi-Tawi does that better than a paragraph can.
 *
 * Three things are happening at once as the reader scrolls away from it, and
 * they are deliberately unequal: the picture sinks slowly, the type rises past
 * it and fades, and the whole frame darkens. Matched speeds would read as one
 * flat plane sliding; unequal ones read as a camera moving through a scene, and
 * they hand the page underneath a clean edge to arrive on.
 *
 * Height is capped in `svh` rather than `vh` so a phone's collapsing address
 * bar cannot push the title off the bottom of the opening view; the `min-h` in
 * px keeps it from collapsing entirely on a short landscape window.
 */
export function DiscoverHero({
	kicker,
	/** The title, broken by hand — where a 9rem line breaks is a design decision. */
	lines,
	/** Which of those lines is set as an outline rather than solid. */
	outline = [],
	standfirst,
	photo,
	backHref,
	backLabel,
	scrollTo,
	scrollLabel = 'Start reading',
	/** Anything extra under the scroll cue — a count, a set of chips. */
	footnote,
	size = 'chapter',
}: {
	kicker: string
	lines: string[]
	outline?: number[]
	standfirst: string
	photo: DiscoverPhoto
	backHref?: string
	backLabel?: string
	/** Fragment the scroll cue jumps to. */
	scrollTo?: string
	scrollLabel?: string
	footnote?: React.ReactNode
	/** `index` is the taller cut used once, at the front of Discover. */
	size?: 'chapter' | 'index'
}) {
	const ref = useRef<HTMLElement>(null)
	const reduced = useReducedMotion()
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

	// The picture sinks a little and keeps growing; the type travels further and
	// leaves. The gap between the two is what reads as depth.
	const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
	const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
	const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-24%'])
	const contentFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

	return (
		<header
			ref={ref}
			className={`bb-frame bb-scrim relative w-full overflow-hidden ${
				size === 'index'
					? 'h-[92svh] max-h-[980px] min-h-[560px]'
					: 'h-[78svh] max-h-[840px] min-h-[440px]'
			}`}
		>
			<motion.div
				className='absolute inset-0'
				style={reduced ? undefined : { y: imageY, scale: imageScale }}
			>
				<Image
					src={photo.src}
					alt={photo.alt}
					fill
					priority
					sizes='100vw'
					placeholder='blur'
					className='object-cover'
				/>
			</motion.div>

			{/* The medallion over the picture rather than behind it — it is the one
			    mark that says which site this photograph is on. Held low enough that
			    it never competes with whatever the image is doing. */}
			<OkirBloom
				className='absolute -bottom-[32%] -right-[8%] size-[min(34rem,72vw)] text-white opacity-[0.13]'
				delay={0.6}
			/>

			<motion.div
				className='absolute inset-0 z-2 flex flex-col justify-end'
				style={reduced ? undefined : { y: contentY, opacity: contentFade }}
			>
				<div className='bb-container w-full pb-14 lg:pb-20'>
					{backHref ? (
						<Rise distance={10}>
							<Link
								href={backHref}
								className='inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 transition hover:text-white'
							>
								<ArrowLeftIcon className='size-3.5' aria-hidden='true' />
								{backLabel}
							</Link>
						</Rise>
					) : null}

					<Rise delay={0.06} distance={12}>
						<p className='mt-8 flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80'>
							<span className='h-px w-8 bg-[var(--brass)]' aria-hidden='true' />
							{kicker}
						</p>
					</Rise>

					<LineReveal
						lines={lines}
						delay={0.14}
						className={`${
							size === 'index' ? 'bb-display-lg mt-10' : 'bb-display-md mt-6'
						} bb-over max-w-[18ch] text-white`}
						lineClassName={lines.map((_, index) => (outline.includes(index) ? 'bb-outline-over' : undefined))}
					/>

					<Rise delay={0.42} distance={16}>
						{/* On the measure like the body copy, not on a container fraction.
						    Over a photograph a long line is harder again than on paper —
						    the ground under it is moving.

						    The small top margin is clearance rather than spacing. Each line
						    of the headline is revealed inside `.bb-line-mask`, which pads
						    its own bottom by 0.14em and takes the same back as a negative
						    margin so descenders are not cropped — and that negative margin
						    pulls whatever follows up into the headline's descender band. At
						    display size that is around 16px of overlap, which is what this
						    gives back. */}
						<p className='bb-measure mt-4 text-base leading-[var(--leading-body)] text-white/80 sm:text-[17px]'>
							{standfirst}
						</p>
					</Rise>

					{scrollTo ? (
						<Rise delay={0.54} distance={12}>
							<div className='mt-10 flex flex-wrap items-center gap-x-8 gap-y-4'>
								<a
									href={scrollTo}
									className='inline-flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:text-white'
								>
									<span className='bb-cue flex size-9 items-center justify-center rounded-full border border-white/35'>
										<ArrowDownIcon className='size-3.5' aria-hidden='true' />
									</span>
									{scrollLabel}
								</a>
								{footnote}
							</div>
						</Rise>
					) : null}
				</div>
			</motion.div>

			<PhotoCredit photo={photo} />
		</header>
	)
}

/**
 * The chapter cut, with the numbered kicker and the way back to the index.
 *
 * A thin wrapper rather than a second component: chapters and the Discover
 * front page want the same frame at two sizes, and two copies of a parallax
 * header would drift apart the first time one of them was tuned.
 */
export function DiscoverChapterHero({
	chapter,
	title,
	standfirst,
	photo,
	backHref = '/discover',
	backLabel = 'All chapters',
	scrollTo,
}: {
	chapter: string
	title: string
	standfirst: string
	photo: DiscoverPhoto
	backHref?: string
	backLabel?: string
	scrollTo?: string
}) {
	return (
		<DiscoverHero
			kicker={chapter}
			lines={[title]}
			standfirst={standfirst}
			photo={photo}
			backHref={backHref}
			backLabel={backLabel}
			scrollTo={scrollTo}
		/>
	)
}
