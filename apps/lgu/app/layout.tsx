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

export const metadata: Metadata = {
	title: {
		default: 'BetterBARMM Local Government',
		template: '%s / BetterBARMM Local Government',
	},
	description:
		'Every province, city, municipality and barangay in the Bangsamoro — population, land area, the officials elected to each, and the services each rung is responsible for.',
	/* Absolute, because everything below it is relative. Without a
	   `metadataBase` the generated card resolves to a path rather than a URL,
	   and a platform scraping the page has nothing to fetch — which is why a
	   shared link unfurled as a bare line of text. */
	metadataBase: new URL('https://lgu.betterbarmm.com'),
	applicationName: 'BetterBARMM Local Government',

	/* One estate across four addresses: every card names the estate, then the
	   workspace. `openGraph.images` is left unset so the generated
	   `opengraph-image` beside this file fills it in — naming it here would
	   override the per-route cards a page can bring of its own. */
	openGraph: {
		type: 'website',
		siteName: 'BetterBARMM',
		locale: 'en_PH',
		url: 'https://lgu.betterbarmm.com',
		title: 'BetterBARMM Local Government',
		description:
			'Every province, city, municipality and barangay in the Bangsamoro — population, land area, the officials elected to each, and the services each rung is responsible for.',
	},

	/* The canonical address, and permission to index it.
	   Four apps on four subdomains serve overlapping subjects — an act appears
	   on the registry and is linked from the election workspace — so each page
	   naming its own address is what stops a crawler treating a link as a
	   duplicate of the page it points at. */
	alternates: { canonical: 'https://lgu.betterbarmm.com' },
	robots: { index: true, follow: true },
	authors: [{ name: 'BetterBARMM', url: 'https://betterbarmm.com' }],
	creator: 'BetterBARMM',
	publisher: 'BetterBARMM',
	/* A page of act numbers, seat counts and dates is full of strings a phone
	   will turn into telephone links if it is not told otherwise. */
	formatDetection: { telephone: false, date: false, address: false, email: false },

	twitter: {
		card: 'summary_large_image',
		title: 'BetterBARMM Local Government',
		description:
			'Every province, city, municipality and barangay in the Bangsamoro — population, land area, the officials elected to each, and the services each rung is responsible for.',
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
			</body>
		</html>
	)
}
