import type { Metadata } from 'next'
import { PlacesCatalogue } from '../_components/places-catalogue'

// Hidden for now: out of the menus and the sitemap, and kept out of search results, though the pages still answer.
export const metadata: Metadata = { robots: { index: false, follow: true } }

/** The catalogue is always underneath; a place (/places/[slug]) opens over it as a full-screen dialog. */
export default function PlacesLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<PlacesCatalogue />
			{children}
		</>
	)
}
