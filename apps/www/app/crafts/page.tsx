import type { Metadata } from 'next'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Crafts of the Bangsamoro',
	description: 'The weaves, mats, brass, gongs and carving of the Bangsamoro: where each is made, who makes it, and where a visitor can see it.',
	path: '/crafts',
})

/** The catalogue itself is drawn by the layout; with no craft open there is nothing more to draw. */
export default function CraftsPage() {
	return null
}
