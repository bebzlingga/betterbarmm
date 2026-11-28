import {
	type DiscoverBarmmDetailCard,
	type DiscoverBarmmPeopleGroup,
	type DiscoverBarmmTimelineEvent,
	type DiscoverBarmmTopic,
} from '@betterbarmm/primer-data'
import { PhotoFigure, PhotoFrame } from './discover-figure'
import { COL_SPAN, packRows } from './discover-grid'
import { DiscoverLguGuide } from './discover-lgu-guide'
import { DiscoverTribeGuide } from './discover-tribe-guide'
import { discoverPhotos, type DiscoverPhotoKey } from './discover-media'
import { type DiscoverTopicMedia } from './discover-topic-media'
import { Rise, Stagger, StaggerItem } from '@betterbarmm/editorial'
import { Timeline } from './topic-timeline'
import { GovernmentFlow, InstitutionList } from './discover-government'

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
	// The travel look (user decision): a small accent eyebrow, the title as travel's section heads, the line under or
	// beside it. The module's number is dropped with the brass rule it sat on.
	void index
	const kicker = <p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>{eyebrow}</p>
	const heading = (topClass: string) => <h2 className={`dv-title ${topClass} max-w-[22ch]`}>{title}</h2>

	if (split) {
		return (
			<div className={tightGap ? 'mb-10' : 'mb-12 lg:mb-14'}>
				{kicker}
				<div className='mt-4 grid gap-4 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-16'>
					{heading('mt-0')}
					{description ? <p className='text-[0.9375rem] leading-[1.75] text-[var(--ink-3)] lg:pt-1.5'>{description}</p> : null}
				</div>
			</div>
		)
	}

	return (
		<div className='mb-12'>
			{kicker}
			{heading('mt-4')}
			{description ? <p className='dv-lede'>{description}</p> : null}
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
			{/* The first section under the chapter bar opens a little nearer it (user decision). */}
			{lede ? (
				<section className='bb-container dv-section !pt-[clamp(4rem,7.5vw,7rem)]'>
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
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
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
			{/* Government: how the parts connect, before the parts. */}
			{topic.slug === 'governance' && topic.detailCards ? (
				<section>
					{/* Half the usual space at its foot: the cards below follow straight on, over a hairline (user decision: the
					    two plain sections' paddings had stacked into one big gap). */}
					<div className={`bb-container dv-section !pb-[clamp(3.5rem,6vw,5.5rem)] ${lede ? '' : '!pt-[clamp(4rem,7.5vw,7rem)]'}`}>
						<ModuleHead
							index={nextIndex()}
							eyebrow='How it fits together'
							title='Who chooses whom.'
							split
							description='The Bangsamoro is governed the way a parliament is: the voters elect the Parliament, the Parliament chooses the Chief Minister, and the Chief Minister leads a Cabinet of ministers who run the region’s offices.'
						/>
						<GovernmentFlow cards={topic.detailCards.filter((c) => !media?.cardPhotos?.[c.title])} />
					</div>
				</section>
			) : null}

			{topic.detailCards ? (
				<section>
					{topic.slug === 'governance' ? (
						<div aria-hidden='true' className='bb-container'>
							<div className='border-t border-[var(--rule)]' />
						</div>
					) : null}
					<div className={`bb-container dv-section ${topic.slug === 'governance' ? '!pt-[clamp(3.5rem,6vw,5.5rem)]' : ''}`}>
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
						<DetailCards
							cards={
								// On Government the photograph cards lead here; the rest are the list below.
								topic.slug === 'governance' ? topic.detailCards.filter((c) => media?.cardPhotos?.[c.title]) : topic.detailCards
							}
							cardPhotos={media?.cardPhotos}
						/>
					</div>
				</section>
			) : null}

			{topic.slug === 'governance' && topic.detailCards ? (
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
						<ModuleHead
							index={nextIndex()}
							eyebrow='The directory'
							title='Every ministry and office.'
							split
							description='What each one is for, who heads it now, and the way to its contacts. Heads are as the directory last confirmed them against an official source.'
						/>
						<InstitutionList cards={topic.detailCards.filter((c) => !media?.cardPhotos?.[c.title])} />
					</div>
				</section>
			) : null}

			{/* On the tinted ground rather than the page's own, the way the story band
			    is. This module is a directory — a ladder and a list of offices — and
			    a change of ground is what says so without a rule over it. */}
			{media?.lguGuide ? (
				<section className='tv-wash'>
					<div className='bb-container dv-section'>
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
					<div className='bb-container dv-section !pb-10 lg:!pb-12'>
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
					<div className='bb-container dv-section'>
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
 * can recognize does that better than the first alphabetical entry. The rest
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
									<p className='mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>{card.label}</p>
									<h3 className='mt-2 font-[family-name:var(--font-display)] text-[1.3rem] font-bold leading-tight tracking-[-0.025em] text-[var(--ink)]'>
										{card.title}
									</h3>
									<p className='mt-3 flex-1 bb-body text-[var(--ink-2)]'>{card.description}</p>

									{card.href ? (
										<a
											href={card.href}
											target='_blank'
											rel='noreferrer'
											className='mt-5 inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'
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
							<article className='tv-card h-full !p-6 lg:!p-7'>

									<div className='flex items-baseline justify-between gap-3'>
										<p className='text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>{card.label}</p>
										{card.value ? (
											<p className='font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--accent)]'>
												{card.value}
											</p>
										) : null}
									</div>

									<h3 className='mt-4 font-[family-name:var(--font-display)] text-[1.15rem] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]'>
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
											className='mt-5 inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'
										>
											<span>{card.sourceLabel ?? 'Source'}</span>
											<span aria-hidden='true'>&rarr;</span>
										</a>
									) : null}
								</article>
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
							<div className='lg:sticky lg:top-8 lg:self-start'>
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
									    the column's own edge. `.bb-kicker` colors its first child brass —
									    that is the number wherever this appears — so the order in the
									    markup stays as it was and the two are placed by the flex rules
									    instead. */}
									<p className='inline-flex rounded-full bg-[color-mix(in_srgb,var(--accent)_9%,var(--paper))] px-3 py-1 text-[0.75rem] font-semibold text-[var(--accent)]'>
										{group.people.length} {group.people.length === 1 ? 'group' : 'groups'}
										<span className='sr-only'> · {groupIndex + 1}</span>
									</p>

									<h3 className='mt-4 font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'>
										{group.category}
									</h3>
									<p className='mt-3 bb-body text-[var(--ink-2)]'>
										{group.description}
									</p>
								</Rise>
							</div>

							<Stagger gap={0.04} className='grid content-start gap-3 sm:grid-cols-2'>
								{group.people.map((person, index) => (
									<StaggerItem
										key={person.name}
										as='article'
										distance={12}
										className='group tv-card !p-6 hover:border-[color-mix(in_srgb,var(--ink)_30%,var(--rule))]'
									>
										{/* The name leads and the number closes the row, the way the group
										    counter above these cards reads. A card is narrow enough that the
										    two still pair at a glance. */}
										<div className='flex items-baseline justify-between gap-3'>
											<h4 className='font-[family-name:var(--font-display)] text-[1.1875rem] font-bold tracking-[-0.03em] text-[var(--ink)] transition group-hover:text-[var(--accent)]'>
												{person.name}
											</h4>
											<span className='num shrink-0 text-[0.6875rem] font-semibold text-[var(--brass)]'>
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
												className='mt-4 inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-semibold text-[var(--ink-2)] transition hover:text-[var(--accent)]'
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

