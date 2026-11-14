import { lguData } from '@betterbarmm/lgu-data'
import { discoverBarmmTopics, type DiscoverBarmmTopic } from '@betterbarmm/primer-data'
import type { ChapterCard } from '../_components/chapter-grid'
import { photo, type DiscoverPhotoKey } from '../_components/discover-media'

/* The primer's chapters as cards, in the primer's own order, so a chapter is numbered the same on the front page,
   the Discover index and its own page. One list: the photograph and what each holds were kept in three places. */

const PHOTO: Record<string, DiscoverPhotoKey> = {
	history: 'makhdumMosque',
	governance: 'parliamentBuilding',
	people: 'singkil',
	'culture-places': 'budBongao',
	'local-government': 'cotabatoPlaza',
}

/** What a chapter holds, in the reader's terms — what they will find, not what the page is about. */
function contains(topic: DiscoverBarmmTopic): string[] {
	switch (topic.slug) {
		case 'history':
			return [`${topic.timeline?.length ?? 0} moments`, 'Sultanates', 'Peace process', 'Organic Law']
		case 'governance':
			return ['Parliament', 'Chief Minister', `${topic.detailCards?.length ?? 0} institutions`, 'Ministries']
		case 'local-government':
			// From the directory dataset, not the PSA totals that still count Sulu.
			return [`${lguData.totals.barangays.toLocaleString('en-US')} barangays`, `${lguData.totals.lgus} cities and towns`, 'Demographics', 'Services']
		case 'people':
			return [`${topic.peopleGroups?.[0]?.people.length ?? 0} Moro groups`, 'Indigenous peoples', 'Settlers', 'Languages']
		default:
			return ['Mosques', 'Islands', 'Food', 'Textiles']
	}
}

export const chapterCards: (ChapterCard & { slug: string })[] = discoverBarmmTopics.map((topic) => ({
	slug: topic.slug,
	href: `/discover/${topic.slug}`,
	title: topic.navTitle ?? topic.label,
	blurb: topic.description,
	photo: photo(PHOTO[topic.slug] ?? 'panampangan'),
	contains: contains(topic),
}))
