import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Shell } from './_components/shell'
import { themeInitScript } from './_components/theme-toggle'
import './globals.css'

// DM Sans reads the body copy, Outfit sets headings, buttons and labels.
// Both are variable, so every weight the design uses comes from one file each.
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' })

export const metadata: Metadata = {
	title: {
		default: 'BetterBARMM Legislation',
		template: '%s / BetterBARMM Legislation',
	},
	description:
		'A public, searchable record of the Bangsamoro Parliament — autonomy acts, bills, and resolutions with sources, sectors, status, and plain-language notes.',
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
			</head>
			<body className='min-h-full bg-[var(--paper)] antialiased'>
				{/* The shell lives in the layout so the header and footer stay mounted
				    across navigations — only the page content transitions. */}
				<Shell>{children}</Shell>
				<Analytics />
			</body>
		</html>
	)
}
