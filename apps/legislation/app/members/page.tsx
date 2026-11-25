import Link from 'next/link'
import type { Metadata } from 'next'
import { MemberBrowser } from '../_components/member-browser'
import { RegistryBand } from '../_components/registry-band'
import { Reveal } from '../_components/reveal'
import { getRosterDataset } from '../_lib/members-data'

export const metadata: Metadata = {
	title: 'Bangsamoro Transition Authority',
	description:
		'Everyone who has served in the Bangsamoro Transition Authority — their term, the parliaments they sat in, the role they held, and the measures they are credited on.',
}

export default function MembersPage() {
	const dataset = getRosterDataset()
	const { stats } = dataset

	return (
		<>
			<RegistryBand
				label='Bangsamoro Transition Authority, 2019 to 2025'
				title='Bangsamoro Transition Authority'
				lead={
					<>
						<span className='font-semibold text-[var(--ink)]'>{stats.total.toLocaleString()} members on record. </span>
						The people who wrote the region’s laws before the First Parliament: their term, the parliaments they sat in, the role
						they held, and the measures they are credited on.
					</>
				}
			>
				<div className='mt-8'>
					<Link href='/attendance' className='bb-btn bb-btn-solid !px-5 !py-3 !text-[0.65625rem]'>
						Attendance, Member by Member
					</Link>
				</div>
			</RegistryBand>

			<MemberBrowser dataset={dataset} />

			{/* What the roster does not cover. Set as a two-column note — the claim
			    on the left, the caveats enumerated on the right — so the gaps read
			    as a numbered list of specific limits rather than a wall of small
			    grey text at the foot of the page. */}
			<section className='bb-container py-[clamp(3.75rem,7vw,6.5rem)]'>
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
