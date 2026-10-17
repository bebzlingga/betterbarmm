import { Alegreya } from 'next/font/google'

// The crafts pages set their names in a book serif, the one place on the site that does:
// they are a catalogue to browse, not a record to check.
const alegreya = Alegreya({ subsets: ['latin'], variable: '--font-craft', display: 'swap' })

/** modal: a craft opened from the catalogue, drawn full screen over it (see @modal). */
export default function CraftsLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	return (
		<div className={alegreya.variable}>
			{children}
			{modal}
		</div>
	)
}
