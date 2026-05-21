import type { Metadata } from 'next'
import { Google_Sans_Flex, Oswald } from 'next/font/google'
import './globals.css'

const googleSansFlex = Google_Sans_Flex({
	subsets: ['latin'],
	weight: 'variable',
	variable: '--font-google-sans-flex',
	display: 'swap',
	adjustFontFallback: false,
})

const oswald = Oswald({
	subsets: ['latin'],
	weight: 'variable',
	variable: '--font-oswald',
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'BetterBARMM Budget Explorer',
	description: 'Public BARMM budget explorer with year-over-year comparisons and source traceability.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang='en'
			className={`${googleSansFlex.variable} ${oswald.variable} h-full bg-[var(--paper)] text-[var(--ink)]`}
		>
			<body className='min-h-full bg-[var(--paper)] antialiased'>{children}</body>
		</html>
	)
}
