import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Places of the Bangsamoro',
	description: 'Islands, beaches, lakes, mosques, falls and heritage sites across BARMM: what is there, how to get there, and what to know before you go.',
	path: '/places',
})

/** The catalogue itself is drawn by the layout; with no place open there is nothing more to draw. */
export default function PlacesPage() {
	return null
}
