import { PlacesCatalogue } from '../_components/places-catalogue'

/** The catalogue is always underneath; a place (/places/[slug]) opens over it as a full-screen dialog. */
export default function PlacesLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<PlacesCatalogue />
			{children}
		</>
	)
}
