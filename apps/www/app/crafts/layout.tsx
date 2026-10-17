import { Alegreya } from 'next/font/google'

// The crafts pages set their names in a book serif, the one place on the site that does:
// they are a catalogue to browse, not a record to check.
const alegreya = Alegreya({ subsets: ['latin'], variable: '--font-craft', display: 'swap' })

export default function CraftsLayout({ children }: { children: React.ReactNode }) {
	return <div className={alegreya.variable}>{children}</div>
}
