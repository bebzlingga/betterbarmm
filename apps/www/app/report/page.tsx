import type { Metadata } from 'next'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { pageMeta } from '../_lib/seo'
import { ReportForm } from './report-form'
import { GetInvolved } from '../_components/get-involved'

export const metadata: Metadata = pageMeta({
	title: 'Report an error',
	description: 'Tell BetterBARMM about a wrong figure, name or date. An editor checks it against the source and fixes it.',
	path: '/report',
	index: false,
})

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ url?: string; title?: string }> }) {
	const { url = '', title = '' } = await searchParams
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader />
			<Masthead
				brand
				label='Report an error'
				lines={['Spotted something', 'wrong?']}
				muted={[1]}
				standfirst='A figure, a name, a date that does not match the source. Tell us where, and an editor checks it against the official document and fixes it in the open.'
			/>
			<section className='bb-container bb-section max-w-[44rem]'>
				<ReportForm url={url.slice(0, 500)} title={title.slice(0, 200)} />
			</section>
			<GetInvolved />
		</main>
	)
}
