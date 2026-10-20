import type { Metadata } from 'next'
import { BrainMap } from '../_components/brain-map'
import { GetInvolved } from '../_components/get-involved'
import { Masthead } from '../_components/masthead'
import { SiteHeader } from '../_components/site-header'
import { brain } from '../_lib/brain'
import { pageMeta } from '../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'The brain of BetterBARMM',
	description: 'A live map of BetterBARMM: the sources it reads, the datasets it keeps, the workspaces it publishes, how they join, and Jo, who answers from all of it.',
	path: '/brain',
})

/** The map, read from the datasets at build time. */
export default function BrainPage() {
	const { nodes, edges, threads } = brain()
	const datasets = nodes.filter((n) => n.kind === 'dataset')
	const records = datasets.reduce((n, d) => n + (d.count ?? 0), 0)
	return (
		<main className='min-h-screen bg-[var(--paper)] text-[var(--ink)]'>
			<SiteHeader activeItem='about' />
			<Masthead
				brand
				label='How it all connects'
				lines={['The brain of BetterBARMM']}
				standfirst={`${nodes.filter((n) => n.kind === 'source').length} sources, ${datasets.length} datasets, ${nodes.filter((n) => n.kind === 'workspace').length} workspaces and one assistant, joined by the same code for every town and the same ID for every office. Every count on this map is read from the data itself.`}
				facts={[
					{ value: records.toLocaleString('en-PH'), label: 'Records mapped' },
					{ value: String(edges.filter((e) => e.kind === 'join').length), label: 'Joins between workspaces' },
					{ value: String(threads.length), label: 'Towns to follow' },
				]}
			/>
			<section className='relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#3d0f18_0%,#1a0609_60%,#110406_100%)] py-10 lg:py-14'>
				<div className='bb-container'>
					<BrainMap nodes={nodes} edges={edges} threads={threads} />
				</div>
			</section>
			<GetInvolved />
		</main>
	)
}
