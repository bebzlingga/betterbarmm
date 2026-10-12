import { measureEvents, rssResponse } from '../../../_lib/feeds'
import { getMember } from '../../../_lib/members-data'
import { getOfficialMeasuresForAuthor } from '../../../_lib/official-measures'

/* Every measure one member filed or co-authored, as it moves. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const member = getMember(slug)
	if (!member) return new Response('No such member', { status: 404 })
	const measures = getOfficialMeasuresForAuthor(member.rosterName).map(({ measure }) => measure)
	return rssResponse(
		{
			title: `${member.displayName} — measures in the Bangsamoro Parliament`,
			path: `/members/${slug}/feed.xml`,
			description: `Each bill and resolution ${member.displayName} filed or co-authored, as it moves through Parliament.`,
		},
		measureEvents(measures),
	)
}
