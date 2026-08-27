import Image from 'next/image'
import {
	type DiscoverBarmmDetailCard,
	type DiscoverBarmmPeopleGroup,
	type DiscoverBarmmTimelineEvent,
	type DiscoverBarmmTopic,
} from './discover-barmm-data'
import { PhotoFigure, PhotoFrame } from './discover-figure'
import { COL_SPAN, packRows } from './discover-grid'
import { DiscoverLguGuide } from './discover-lgu-guide'
import { DiscoverTribeGuide } from './discover-tribe-guide'
import { discoverPhotos, type DiscoverPhotoKey } from './discover-media'
import { type DiscoverTopicMedia } from './discover-topic-media'
import { LineReveal, OkirCorner, Rise, Stagger, StaggerItem, Tilt } from '@betterbarmm/editorial'
import { Timeline } from './topic-timeline'

/**
 * A section heading with its kicker and standfirst, on a brass rule.
 *
 * Every module on a chapter page opens with one, so a reader scrolling fast
 * gets a consistent place to look for "what is this block". The claim arrives
 * line by line; the standfirst that qualifies it follows.
 */
function ModuleHead({
	index,
	eyebrow,
	title,
	description,
	split = false,
	tightGap = false,
}: {
	index: string
	eyebrow: string
	title: string
	/** A node rather than a string: one of these carries a link in its prose. */
	description?: React.ReactNode
	/**
	 * Set the standfirst beside the title rather than under it.
	 *
	 * For the modules whose standfirst is doing real work — a paragraph that
	 * explains where the material came from, not a line that repeats the
	 * heading. Stacked, those run the depth of a screen before the module's
	 * first row of content, and the reader arrives at the content having
	 * already scrolled past the sentence explaining it.
	 */
	split?: boolean
	/**
	 * Take the standard gap under the head rather than the wider one a split
	 * head normally gets.
	 *
	 * For a module whose content opens on furniture of its own — the tribe
	 * guide's sticky rail — where the wide gap leaves the head marooned above a
	 * bar that is already announcing the section.
	 */
	tightGap?: boolean
}) {
	const kicker = (
		<Rise distance={14}>
			{/* Number first here, unlike the group counters further down. This row
			    runs the full width of the page: ranged right, the number ends up an
			    arm's length from the label it belongs to, with a rule between them
			    and nothing to read. In a narrow column that distance is small
			    enough for the pairing to hold. */}
			<div className='bb-kicker'>
				<span>{index}</span>
				<span>{eyebrow}</span>
			</div>
		</Rise>
	)

	const heading = (topClass: string) => (
		<LineReveal
			as='h2'
			lines={[title]}
			className={`bb-display-sm ${topClass} max-w-[20ch] text-[var(--ink)]`}
		/>
	)

	if (split) {
		return (
			<div className={tightGap ? 'bb-head-gap' : 'bb-head-gap-lg'}>
				{/* The kicker runs above both columns, so the two things a reader is
				    meant to compare — the claim and the sentence qualifying it — start
				    on the same line. Nested inside the left column instead, the
				    standfirst lined up with the kicker and sat a heading's height above
				    the words it belongs to. */}
				{kicker}

				<div className='mt-8 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-16'>
					{heading('mt-0')}

					{description ? (
						<Rise delay={0.15} distance={16}>
							{/* No measure: the column is the measure here. The top padding is
							    optical — display type sits high in its own line box, so a
							    paragraph set flush against it reads as starting early. */}
							<p className='bb-body text-[var(--ink-2)] lg:pt-2'>{description}</p>
						</Rise>
					) : null}
				</div>
			</div>
		)
	}

	return (
		<div className='bb-head-gap'>
			{kicker}
			{heading('mt-8')}

			{description ? (
				<Rise delay={0.15} distance={16}>
					{/* On the measure, not on a `max-w-*`. A standfirst set to the
					    container's three-quarter width ran to 96 characters a line,
					    which is a headline's job done at body size. */}
					<p className='bb-measure mt-7 bb-body text-[var(--ink-2)]'>{description}</p>
				</Rise>
			) : null}
		</div>
	)
}

export function DiscoverTopicBody({
	topic,
	media,
}: {
	topic: DiscoverBarmmTopic
	media?: DiscoverTopicMedia
}) {
	const [lede, ...rest] = topic.sections
	const inline = media?.inline ? discoverPhotos[media.inline] : undefined

	// Modules are numbered as the reader meets them, so the count has to be
	// worked out from what this topic actually has rather than hardcoded.
	let moduleIndex = 0
	const nextIndex = () => String(++moduleIndex).padStart(2, '0')

	// Every paragraph after the lede is body. The last one used to be promoted
	// into a display blockquote, which meant the shape of a chapter's opening
	// depended on how many paragraphs it happened to have — delete one and the
	// sentence before it was pulled into 3rem type, whether or not it could
	// carry that.
	const body = rest

	return (
		// `#read` is what the hero's scroll cue points at. It used to sit on the
		// lede, which is fine until a chapter has no lede — so it rides the body
		// instead, and lands on whatever that chapter actually opens with.
		<div id='read' className='scroll-mt-24'>
			{/* ---- The lede ----

			    First paragraph at reading-aloud size with a drop cap, the rest set
			    beside a photograph, and the paragraph they were building to pulled
			    out on a brass rule. It is the shape a magazine opener takes, and it
			    does something useful: it stops the chapter starting with five
			    identical grey paragraphs.

			    Two chapters have one paragraph and four have five, so the lede and
			    the photograph share a row when there is nothing to follow — the
			    alternative left half the opening screen empty. */}
			{lede ? (
				<section className='bb-container bb-section'>
					{rest.length === 0 && inline ? (
						<div className='grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16'>
							<Rise distance={18}>
								<p className='bb-lede'>{lede}</p>
							</Rise>

							<PhotoFigure
								photo={inline}
								frameClassName='aspect-[4/3]'
								sizes='(min-width: 1024px) 42vw, 100vw'
								delay={0.14}
							/>
						</div>
					) : (
						<>
							{/* One column, the width of the page. The opening sentence used to hold
							    a column of its own at lede size with the rest beside it; without
							    that column it is simply the first paragraph, and the prose runs the
							    full measure. Two columns keep the line length readable at that
							    width — a single column across the container runs past 130
							    characters, roughly twice what the eye tracks back from. */}
							<Rise distance={18}>
								{/* Spacing is a margin on each paragraph rather than `space-y`, which
								    sets its margin on the same edge and loses the fight with any
								    per-paragraph override — the paragraphs ran together with no gap at
								    all. `bb-prose` caps itself at 34em in the shared layer and no
								    utility outranks unlayered CSS, so the override is inline. */}
								<div className='bb-prose bb-dropcap dsc-two-column' style={{ maxWidth: 'none' }}>
									{[lede, ...body].map((section, index) => (
										<p key={index}>{section}</p>
									))}
								</div>
							</Rise>

							{inline ? (
								<div className='mt-14 max-w-4xl'>
									<PhotoFigure
										photo={inline}
										frameClassName='aspect-[16/9]'
										sizes='(min-width: 1024px) 60vw, 100vw'
										delay={0.14}
									/>
								</div>
							) : null}
						</>
					)}
				</section>
			) : null}

			{/* Even top and bottom. The ground under this block is tinted, so both
			    edges are visible lines across the page — and a band with more air
			    above its heading than below its last row reads as having been cut
			    short rather than as having been set. */}
			{topic.timeline ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container bb-section'>
						<ModuleHead
							index={nextIndex()}
							eyebrow='The story'
							title='From the struggle to BARMM.'
							description={`${topic.timeline.length} moments that shaped the Bangsamoro — from centuries-old sultanates to the first regular parliamentary election.`}
							split
						/>
						<Timeline events={topic.timeline} eraPhotos={media?.eraPhotos} />
					</div>
				</section>
			) : null}

			{/* A shorter run-out than the standard step. On Governance this is the
			    last module on the page, and a full step under the cards on top of the
			    padding "Keep reading" carries of its own put the two blocks a screen
			    apart. */}
			{topic.detailCards ? (
				<section className='border-t border-[var(--rule)]'>
					<div className='bb-container bb-section-top pb-14 lg:pb-16'>
						<ModuleHead
							index={nextIndex()}
							eyebrow={topic.detailEyebrow ?? 'What to notice'}
							title={topic.detailTitle ?? 'Places, food, and heritage markers'}
							split
							description={
								topic.detailDescription ??
								'These cards point to recognizable entry points into BARMM: sacred landmarks, city sites, island landscapes, food traditions, and living craft.'
							}
						/>
						<DetailCards cards={topic.detailCards} cardPhotos={media?.cardPhotos} />
					</div>
				</section>
			) : null}

			{/* On the tinted ground rather than the page's own, the way the story band
			    is. This module is a directory — a ladder and a list of offices — and
			    a change of ground is what says so without a rule over it. */}
			{media?.lguGuide ? (
				<section className='bg-[var(--paper-2)]'>
					<div className='bb-container bb-section'>
						<ModuleHead
							index={nextIndex()}
							eyebrow='The directory'
							title='Who governs your barangay, town, and province.'
							split
							description='From the region down to the barangay: what each unit is, which posts are on the ballot, and how many of each the Bangsamoro actually has.'
						/>
						<DiscoverLguGuide />
					</div>
				</section>
			) : null}

			{/* No rule and no top padding on this one. The module above it closes on
			    a full step of section rhythm already, and a hairline in the middle of
			    that space marked a division the change of subject makes on its own. */}
			{media?.tribeGuide ? (
				<section>
					<div className='bb-container pb-10 lg:pb-12'>
						<ModuleHead
							index={nextIndex()}
							eyebrow='Food and culture, by people'
							title='Not one cuisine. Five.'
							split
							tightGap
							description='Tiyula itum is Tausug. Pastil is Maguindanaon. Piaparan is Meranao. Okoh-okoh is what Tawi-Tawi pulls out of the water that morning. Listed together they read as one regional menu, which is the flattening this guide exists to undo — so here they are set out people by people, with what each one weaves and plays alongside what it cooks.'
						/>
						<div>
							<DiscoverTribeGuide />
						</div>
					</div>
				</section>
			) : null}

			{/* No rule over this section. Each group inside it already opens on a
			    full-width hairline, so a second line above the first of them read as a
			    double rule with a heading trapped between. */}
			{topic.peopleGroups ? (
				<section>
					{/* A shorter run-out, as on the other modules that end a chapter: the
					    block after this one carries padding of its own. */}
					<div className='bb-container bb-section-top pb-14 lg:pb-16'>
						<ModuleHead
							index={nextIndex()}
							eyebrow='People and communities'
							title='Who the Bangsamoro are.'
							split
							description={
								<>
									The{' '}
									<a
										href='https://bcpch.bangsamoro.gov.ph/'
										target='_blank'
										rel='noreferrer'
										className='rule-link'
									>
										Bangsamoro Commission for the Preservation of Cultural Heritage
									</a>{' '}
									(BCPCH) is the regional body that documents, preserves, and promotes Bangsamoro
									cultural heritage. Its Bangsamoro People page groups the region&rsquo;s communities
									into Islamized ethnolinguistic groups, Indigenous peoples, and settler communities.
									Each note below is written as a short public guide and points back to BCPCH where a
									source page is available.
								</>
							}
						/>
						<PeopleGroups groups={topic.peopleGroups} groupPhotos={media?.groupPhotos} />
					</div>
				</section>
			) : null}

			{/* No picture wall here. It lives once, on the front of Discover, where
			    it is the section that says "this is what the region looks like". A
			    chapter already carries its photographs where they belong — in the
			    hero, beside the lede, on the timeline's eras, on the detail cards —
			    and a wall of the same pictures at the foot of every one of the five
			    turned a specific argument into a slideshow, five times over. */}
		</div>
	)
}

/**
 * Detail cards, with a photograph where one exists for that card.
 *
 * The cards with pictures lead — a reader arriving at a wall of twenty
 * institutions needs somewhere for the eye to land first, and a building they
 * can recognise does that better than the first alphabetical entry. The rest
 * follow as a dense text grid, which is the right form for a directory.
 */
function DetailCards({
	cards,
	cardPhotos,
}: {
	cards: DiscoverBarmmDetailCard[]
	cardPhotos?: Record<string, DiscoverPhotoKey>
}) {
	const withPhoto = cards.filter((card) => cardPhotos?.[card.title])
	const plain = cards.filter((card) => !cardPhotos?.[card.title])
	// Four lead cards on Government, five on Culture & Places — neither divides
	// into three, and a fixed three-column grid left one card stranded on a row
	// of its own. Packing gives four two rows of two, and five a row of two over
	// a row of three.
	const leadSpans = packRows(withPhoto.length)

	return (
		<div>
			{withPhoto.length > 0 ? (
				<div className='grid gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-6'>
					{withPhoto.map((card, index) => {
						const photo = discoverPhotos[cardPhotos![card.title]]

						return (
							<article
								key={`${card.label}-${card.title}`}
								className={`group flex h-full flex-col ${COL_SPAN[leadSpans[index]]}`}
							>
								{/* A height rather than a ratio. These cards are packed into rows of
								    unequal spans, so at a fixed 4:3 a card two columns wide came out
								    two thirds the height of the one beside it and the row read as a
								    mistake. One height crops each picture to its own width instead. */}
								<PhotoFrame
									photo={photo}
									className='h-[clamp(13rem,21vw,19rem)]'
									sizes={`(min-width: 768px) ${Math.round((leadSpans[index] / 6) * 88)}vw, (min-width: 640px) 47vw, 100vw`}
									zoom
									delay={index * 0.07}
								>
									<span className='bb-locator'>{card.value ?? card.label}</span>
								</PhotoFrame>

								{/* The column continues inside the animation wrapper: without it the
								    wrapper is one flex child holding everything, and the source link
								    lands wherever the description happens to end. Cards in a row are
								    the same height, so their footers should share a line. */}
								<Rise delay={0.1} distance={14} className='flex flex-1 flex-col'>
									<p className='bb-label mt-7'>{card.label}</p>
									<h3 className='mt-4 text-[1.3rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
										{card.title}
									</h3>
									<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>{card.description}</p>

									{card.href ? (
										<a
											href={card.href}
											target='_blank'
											rel='noreferrer'
											className='mt-6 flex items-center justify-between gap-4 border-t border-[var(--brass-line)] pt-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
										>
											<span>{card.sourceLabel ?? 'Source'}</span>
											<span aria-hidden='true'>&rarr;</span>
										</a>
									) : null}
								</Rise>
							</article>
						)
					})}
				</div>
			) : null}

			{plain.length > 0 ? (
				<Stagger
					gap={0.05}
					className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
						withPhoto.length > 0 ? 'mt-16' : ''
					}`}
				>
					{plain.map((card) => (
						<StaggerItem key={`${card.label}-${card.title}`} distance={14}>
							<Tilt max={3.5} className='h-full'>
								<article className='bb-plate relative flex h-full flex-col p-6 lg:p-7'>
									<OkirCorner position='top-right' className='m-1.5 size-5 opacity-45' />

									<div className='flex items-baseline justify-between gap-3'>
										<p className='bb-label'>{card.label}</p>
										{card.value ? (
											<p className='font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]'>
												{card.value}
											</p>
										) : null}
									</div>

									<h3 className='mt-5 text-[1.15rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
										{card.title}
									</h3>
									<p className='mt-2.5 flex-1 bb-body text-[var(--ink-2)]'>
										{card.description}
									</p>

									{card.href ? (
										<a
											href={card.href}
											target='_blank'
											rel='noreferrer'
											className='mt-6 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
										>
											<span>{card.sourceLabel ?? 'Source'}</span>
											<span aria-hidden='true'>&rarr;</span>
										</a>
									) : null}
								</article>
							</Tilt>
						</StaggerItem>
					))}
				</Stagger>
			) : null}
		</div>
	)
}

/**
 * People groups, each opening with a photograph and its own count.
 *
 * The category header is sticky on desktop, so the reader always knows whether
 * the name they are looking at is a Moro group, an Indigenous people, or a
 * settler community — the distinction the whole section turns on, and the one
 * easiest to lose twenty names into a grid.
 */
function PeopleGroups({
	groups,
	groupPhotos,
}: {
	groups: DiscoverBarmmPeopleGroup[]
	groupPhotos?: Record<string, DiscoverPhotoKey>
}) {
	return (
		<div>
			{groups.map((group, groupIndex) => {
				const key = groupPhotos?.[group.category]
				const photo = key ? discoverPhotos[key] : undefined

				return (
					<section key={group.category} className='mt-16 first:mt-0 lg:mt-24 lg:first:mt-0'>
						<div className='grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14'>
							<div className='lg:sticky lg:top-24 lg:self-start'>
								{photo ? (
									<PhotoFrame
										photo={photo}
										className='mb-6 aspect-[5/4]'
										sizes='(min-width: 1024px) 20rem, 100vw'
										delay={0.06}
									/>
								) : null}

								<Rise delay={0.08} distance={14}>
									{/* The count leads and the number closes the row, ranged right against
									    the column's own edge. `.bb-kicker` colours its first child brass —
									    that is the number wherever this appears — so the order in the
									    markup stays as it was and the two are placed by the flex rules
									    instead. */}
									<p className='bb-kicker justify-between'>
										<span className='order-2'>{String(groupIndex + 1).padStart(2, '0')}</span>
										<span className='order-1'>
											{group.people.length} {group.people.length === 1 ? 'group' : 'groups'}
										</span>
									</p>

									<h3 className='mt-5 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
										{group.category}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>
										{group.description}
									</p>
								</Rise>
							</div>

							<Stagger gap={0.04} className='grid border-t border-[var(--rule)] sm:grid-cols-2'>
								{group.people.map((person, index) => (
									<StaggerItem
										key={person.name}
										as='article'
										distance={12}
										className='group flex flex-col border-b border-[var(--rule)] py-7 transition hover:bg-[var(--paper-2)] sm:px-7 sm:[&:nth-child(odd)]:border-r'
									>
										{/* The name leads and the number closes the row, the way the group
										    counter above these cards reads. A card is narrow enough that the
										    two still pair at a glance. */}
										<div className='flex items-baseline justify-between gap-3'>
											<h4 className='text-[19px] font-extrabold tracking-[-0.03em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
												{person.name}
											</h4>
											<span className='num shrink-0 text-[11px] font-semibold text-[var(--brass)]'>
												{String(index + 1).padStart(2, '0')}
											</span>
										</div>

										<p className='mt-2.5 flex-1 bb-body text-[var(--ink-2)]'>
											{person.description}
										</p>

										{person.href ? (
											<a
												href={person.href}
												target='_blank'
												rel='noreferrer'
												className='mt-4 flex items-center justify-between gap-4 border-t border-[var(--rule-soft)] pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:text-[var(--accent)]'
											>
												<span>BCPCH source</span>
												<span aria-hidden='true'>&rarr;</span>
											</a>
										) : null}
									</StaggerItem>
								))}
							</Stagger>
						</div>
					</section>
				)
			})}
		</div>
	)
}

/**
 * A chapter link rendered as a photograph you walk into.
 *
 * Used for previous/next at the foot of a chapter. The image is dimmed until
 * hover, so the pair reads as navigation rather than as two more articles.
 */
export function ChapterLinkCard({
	label,
	title,
	photoKey,
	align = 'left',
}: {
	label: string
	title: string
	photoKey: DiscoverPhotoKey
	align?: 'left' | 'right'
}) {
	const photo = discoverPhotos[photoKey]

	return (
		<span className='bb-frame relative block aspect-[16/9] w-full sm:aspect-[2/1]'>
			<Image
				src={photo.src}
				alt=''
				sizes='(min-width: 640px) 50vw, 100vw'
				placeholder='blur'
				className='size-full object-cover brightness-[0.42] transition duration-700 group-hover:scale-105 group-hover:brightness-[0.6]'
			/>
			<span
				className={`absolute inset-0 flex flex-col justify-end p-7 lg:p-9 ${
					align === 'right' ? 'items-end text-right' : ''
				}`}
			>
				<span className='font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brass)]'>
					{label}
				</span>
				<span className='mt-2.5 max-w-[16ch] text-2xl font-extrabold leading-tight tracking-[-0.035em] text-white sm:text-3xl'>
					{title}
				</span>
			</span>
		</span>
	)
}
