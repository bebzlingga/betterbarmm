import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MemberIdentity } from '../../_components/member-profile'
import { MemberRecord } from '../../_components/member-record'
import { getCommitteesForMember } from '../../_lib/committees-data'
import { Reveal } from '../../_components/reveal'
import { getMember, getMemberSlugs, getMembersDataset } from '../../_lib/members-data'

export function generateStaticParams() {
	return getMemberSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const member = getMember(slug)

	if (!member) return { title: 'Member not found' }

	const role = member.roleTitle ? `${member.roleTitle}, ` : ''

	return {
		title: member.displayName,
		description: `${member.displayName} — ${role}Bangsamoro Transition Authority, ${member.termOfOffice}. Measures they are credited on, drawn from the Bangsamoro Legislative Registry.`,
	}
}

/**
 * One member's profile. Two columns: who they are on the left, everything
 * the registry can link to their name on the right.
 */
export default async function MemberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const member = getMember(slug)

	if (!member) notFound()

	const { stats } = getMembersDataset()

	// Committee seats are matched on the roster name, so a member links to the
	// committees they actually sit on rather than to a search for their name.
	const committees = getCommitteesForMember(member.rosterName).map(({ committee, role }) => ({
		slug: committee.slug,
		name: committee.name,
		role,
		jurisdiction: committee.jurisdiction,
	}))

	return (
		<section className='mx-auto max-w-[88rem] px-6 pb-24 pt-12 lg:px-8 lg:pb-32 lg:pt-16'>
			{/* Two columns: the person, then the record. Held well apart — the
			    left column runs biography and the right runs a list of measures,
			    and at a narrow gutter the two read as one column of text.

			    The single column is stated rather than left implicit, because an
			    implicit track is sized `auto` and an `auto` track never shrinks below
			    its contents' min-content width. The record's tab row is a nowrap flex
			    strip about 470px across; it carries `overflow-x: auto` so it can
			    scroll, but a scroll container still reports that full width upward, so
			    the track took it and every paragraph on the page — both columns — set
			    itself to 470 and ran off the side of a phone. `grid-cols-1` is
			    `minmax(0,1fr)`, which lets the track be the width it is given and
			    leaves the tab row to scroll, which is what it was built to do. */}
			<div className='grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-24 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-32'>
				<Reveal>
					<MemberIdentity member={member} />
				</Reveal>

				<Reveal delay={80}>
					<MemberRecord
						member={member}
						committees={committees}
						credited={stats.measuresCredited}
						total={stats.measuresTotal}
					/>
				</Reveal>
			</div>
		</section>
	)
}
