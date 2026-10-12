import { measureEvents, rssResponse } from '../_lib/feeds'
import { getOfficialMeasuresByCategory } from '../_lib/official-measures'

/* Every move of every bill and resolution, newest first. */
export function GET() {
	const measures = (['bills', 'proposed-resolutions', 'adopted-resolutions', 'acts'] as const).flatMap(getOfficialMeasuresByCategory)
	return rssResponse(
		{
			title: 'Bangsamoro Parliament — every bill and resolution',
			path: '/feed.xml',
			description: 'Each bill and resolution of the Bangsamoro Parliament as it is filed, referred, read and adopted.',
		},
		measureEvents(measures),
	)
}
