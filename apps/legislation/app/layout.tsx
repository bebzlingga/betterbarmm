import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { MotionProvider } from '@betterbarmm/editorial'
import { Shell } from './_components/shell'
import { themeInitScript } from './_components/theme-toggle'
import './globals.css'

// DM Sans reads the body copy, Outfit sets headings, buttons and labels.
// Both are variable, so every weight the design uses comes from one file each.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

const DESCRIPTION =
	'A public, searchable record of the Bangsamoro Parliament — autonomy acts, bills, and resolutions with sources, sectors, status, and plain-language notes.'

export const metadata: Metadata = {
	/* Absolute, because everything below it is relative.
	 *
	 * Without a `metadataBase` the generated card resolves to a path rather
	 * than a URL, and a platform scraping the page has nothing to fetch — which
	 * is why a shared link unfurled as a bare line of text. */
	metadataBase: new URL('https://legislation.betterbarmm.com'),
	title: {
		default: 'BetterBARMM Legislation',
		template: '%s / BetterBARMM Legislation',
	},
	description: DESCRIPTION,
	applicationName: 'BetterBARMM Legislation',

	/* The estate is one site across four addresses, so every card names the
	   estate and then the workspace. `openGraph.images` is left unset: the
	   generated `opengraph-image` beside this file fills it in, and naming it
	   here as well would override the per-route cards a page can bring. */
	openGraph: {
		type: 'website',
		siteName: 'BetterBARMM',
		locale: 'en_PH',
		url: 'https://legislation.betterbarmm.com',
		title: 'BetterBARMM Legislation',
		description: DESCRIPTION,
	},

	twitter: {
		card: 'summary_large_image',
		title: 'BetterBARMM Legislation',
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
				{/* Sets data-theme before the first paint, so a dark-mode reader
				    never sees a white flash. suppressHydrationWarning above is
				    because this script writes to <html> ahead of React. */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

				{/* Motion renders an animation's opening frame into the server's HTML —
				    that is what stops the flash of un-animated content on hydration.
				    The cost is that without JavaScript nothing ever advances past that
				    opening frame, and an `opacity: 0` inline style is a blank page.

				    So every primitive that starts hidden carries `data-anim`, and this
				    rule releases all of them at once. It has to be `!important`: the
				    styles it is overriding are inline, and an ordinary declaration in a
				    stylesheet loses to those. */}
				<noscript>
					<style>{`[data-anim]{opacity:1 !important;transform:none !important;}`}</style>
				</noscript>
			</head>
			<body className='min-h-full bg-[var(--paper)] antialiased'>
				{/* The shell lives in the layout so the header and footer stay mounted
				    across navigations — only the page content transitions. */}
				<MotionProvider>
					<Shell>{children}</Shell>
				</MotionProvider>
				<Analytics />
			</body>
		</html>
	)
}
