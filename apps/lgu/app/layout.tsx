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
