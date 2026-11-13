import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { SchoolExplorer } from '../_components/school-explorer'
import { latestSY, mapSchools, placedCounts, schoolAreas, schools } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Map',
	description: 'Every school in the region on a map, public and private, coloured by kind: elementary and high schools, madaris, colleges and universities.',
}

/* The Map page is the map: it opens at once, full screen, and closing it goes to the overview. The masthead
   behind it is what a reader sees for the moment before it opens, and what a search engine reads. */
export default function MapPage() {
	return (
		<>
			<Masthead
				kicker='Education · Bangsamoro'
				name='The schools on a map'
				note={`${schools.length.toLocaleString('en-PH')} schools, coloured by kind. ${placedCounts.exact.toLocaleString('en-PH')} are pinned where they stand; the rest are shown at their town’s centre until someone maps them.`}
			/>
			<SchoolExplorer year={latestSY} schools={mapSchools} areas={schoolAreas.filter((a) => a.total).map((a) => ({ slug: a.slug, name: a.name }))} startOpen closeHref='/' />
		</>
	)
}
