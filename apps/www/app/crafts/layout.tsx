import { Alegreya } from 'next/font/google'
import { CraftsCatalogue } from '../_components/crafts-catalogue'

// The crafts pages set their names in a book serif, the one place on the site that does:
// they are a catalogue to browse, not a record to check.
const alegreya = Alegreya({ subsets: ['latin'], variable: '--font-craft', display: 'swap' })

/** The catalogue is always underneath; a craft (/crafts/[slug]) opens over it as a full-screen dialog. */
export default function CraftsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className={alegreya.variable}>
			<CraftsCatalogue />
			{children}
		</div>
	)
}
