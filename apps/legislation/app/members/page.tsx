import type { Metadata } from 'next'
import { MemberBrowser } from '../_components/member-browser'
import { PageHeader } from '../_components/page-header'
import { Reveal } from '../_components/reveal'
import { getRosterDataset } from '../_lib/members-data'

export const metadata: Metadata = {
	title: 'Members',
	description:
		'Everyone who has served in the Bangsamoro Transition Authority — their term, the parliaments they sat in, the role they held, and the measures they are credited on.',
}

export default function MembersPage() {
	const dataset = getRosterDataset()
	const { stats } = dataset

	return (
		<>
			{/* The full display cut rather than the compact one: this masthead opens
			    a roster of 157 faces, and at compact size it read as a caption over
			    the grid rather than as the head of the page. */}
			<PageHeader
				emphasis='brand'
				align='left'
				eyebrow={`${stats.total.toLocaleString()} members on record`}
				title='The people who write'
				titleMuted='the region’s laws.'
				description={`The Bangsamoro Parliament is an appointed body: ${stats.total} people have held a seat across the three transition parliaments. This is the full roster — who served when, what role they held, and which measures carry their name.`}
			/>

			<MemberBrowser dataset={dataset} />

			{/* What the roster does not cover. Set as a two-column note — the claim
			    on the left, the caveats enumerated on the right — so the gaps read
			    as a numbered list of specific limits rather than a wall of small
			    grey text at the foot of the page. */}
			<section className='bb-container bb-section'>
				<Reveal>
					<div className='grid gap-8 border-t border-[var(--rule)] pt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12'>
						{/* Two fifths of the measure, and the text stops short of even that —
						    the room on the right holds the note apart from the list. */}
						<div className='lg:pr-12 xl:pr-24'>
							<p className='eyebrow'>Coverage</p>
							{/* The estate's section heading rather than a one-off size: this
							    is an h2 opening a block, the same job the heading over every
							    other section does, and it was the only one set in the body
							    face at body weight. `section-title-sm` is that primitive at
							    the step a two-fifths column can hold — the full cut runs to
							    3rem and would break this line four ways. */}
							<h2 className='section-title section-title-sm mt-3 text-[var(--ink)]'>
								Known gaps in this dataset
							</h2>
							<p className='mt-4 bb-body text-[var(--ink-2)]'>{dataset.coverageNote}</p>
							<p className='meta-sm mt-8'>
								Roster source: parliament.bangsamoro.gov.ph member listings, fetched{' '}
								{dataset.generatedAt}
							</p>
						</div>

						<ol className='grid content-start'>
							{dataset.knownGaps.map((gap, index) => (
								<li
									key={index}
									className='flex gap-4 border-b border-[var(--rule-soft)] py-4 first:pt-0 last:border-0 last:pb-0 sm:gap-6'
								>
									{/* Zero-padded so the numerals hold one column width. */}
									<span className='num shrink-0 bb-body text-[var(--ink-mute)]'>
										{String(index + 1).padStart(2, '0')}
									</span>
									<p className='bb-body text-[var(--ink-3)]'>{gap}</p>
								</li>
							))}
						</ol>
					</div>
				</Reveal>
			</section>
		</>
	)
}
