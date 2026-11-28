import { CraftsCatalogue } from '../_components/crafts-catalogue'

// The crafts pages are in the site's own type now (user decision: the travel look); the book serif they once set
// their names in is no longer loaded.

/** The catalogue is always underneath; a craft (/crafts/[slug]) opens over it as a full-screen dialog. */
export default function CraftsLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<CraftsCatalogue />
			{children}
		</>
	)
}
