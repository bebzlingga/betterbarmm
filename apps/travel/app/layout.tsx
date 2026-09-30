import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AskDock } from '@betterbarmm/ai/dock'
import { MotionProvider } from '@betterbarmm/editorial'
import { Shell } from './_components/shell'
import { themeInitScript } from './_components/theme-toggle'
import './globals.css'

// DM Sans reads the body copy, Outfit sets headings, buttons and labels.
// Both are variable, so every weight the design uses comes from one file each.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

const DESCRIPTION =
	'A written guide to traveling the Bangsamoro — the seven areas, what there is to see in each, what to eat, where lodging actually exists, and an honest account of the security picture.'

export const metadata: Metadata = {
	title: {
		default: 'BetterBARMM Travel',
		template: '%s / BetterBARMM Travel',
	},
	description: DESCRIPTION,
	/* Absolute, because everything below it is relative. Without a
	   `metadataBase` the generated card resolves to a path rather than a URL,
	   and a platform scraping the page has nothing to fetch. */
	metadataBase: new URL('https://travel.betterbarmm.com'),
	applicationName: 'BetterBARMM Travel',

	/* One estate across several addresses: every card names the estate, then
	   the workspace. `openGraph.images` is left unset so the generated
	   `opengraph-image` beside this file fills it in — naming it here would
	   override the per-route cards a page can bring of its own. */
	openGraph: {
		type: 'website',
		siteName: 'BetterBARMM',
		locale: 'en_PH',
		url: 'https://travel.betterbarmm.com',
		title: 'BetterBARMM Travel',
		description: DESCRIPTION,
	},

	alternates: { canonical: 'https://travel.betterbarmm.com' },
	robots: { index: true, follow: true },
	authors: [{ name: 'BetterBARMM', url: 'https://betterbarmm.com' }],
	creator: 'BetterBARMM',
	publisher: 'BetterBARMM',
	formatDetection: { telephone: false, date: false, address: false, email: false },

	twitter: {
		card: 'summary_large_image',
		title: 'BetterBARMM Travel',
		description: DESCRIPTION,
	},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${dmSans.variable} ${outfit.variable} h-full bg-[var(--paper)] text-[var(--ink)]`}
		>
			<head>
				{/* Sets data-theme before the first paint, so a dark-mode reader never
				    sees a white flash. suppressHydrationWarning above is because this
				    script writes to <html> ahead of React. */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

				{/* Motion renders an animation's opening frame into the server's HTML.
				    Without JavaScript nothing advances past that frame, and an
				    `opacity: 0` inline style is a blank page — so every primitive that
				    starts hidden carries `data-anim`, and this releases all of them.
				    `!important` because the styles it overrides are inline. */}
				<noscript>
					<style>{`[data-anim]{opacity:1 !important;transform:none !important;}`}</style>
				</noscript>
			</head>
			<body className='min-h-full bg-[var(--paper)] antialiased'>
				<MotionProvider>
					<Shell>{children}</Shell>
				</MotionProvider>
				<Analytics />
				<AskDock />
			</body>
		</html>
	)
}
