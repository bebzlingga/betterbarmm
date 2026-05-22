import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { BudgetWorkInProgressDialog } from './_components/budget-work-in-progress-dialog'
import './globals.css'

export const metadata: Metadata = {
	title: 'BetterBARMM Budget Explorer',
	description: 'Public BARMM budget explorer with year-over-year comparisons and source traceability.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang='en'
			className='h-full bg-[var(--paper)] text-[var(--ink)]'
		>
			<head>
				<link
					rel='preconnect'
					href='https://fonts.googleapis.com'
				/>
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin=''
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap'
					rel='stylesheet'
				/>
			</head>
			<body className='min-h-full bg-[var(--paper)] antialiased'>
				<BudgetWorkInProgressDialog />
				{children}
				<Analytics />
			</body>
		</html>
	)
}
