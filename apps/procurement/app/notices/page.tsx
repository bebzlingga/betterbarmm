import type { Metadata } from 'next'
import { NoticesExplorer } from '../_components/notices-explorer'
import { Masthead } from '../_components/parts'
import { funds, groups, modeGroups, openNotices, years } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Bid notices',
	description: 'Every bid notice a BARMM government office has posted on PhilGEPS since 2019, searchable by title, reference, category and supplier.',
}

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ supplier?: string; stage?: string }> }) {
	const { supplier, stage } = await searchParams
	return (
		<>
			<Masthead
				kicker='Procurement · Bangsamoro'
				name='Bid notices'
				note={`Every notice, newest first, ${openNotices.length} of them still open for bids. A notice is an office saying what it means to buy and how much it has set aside; where PhilGEPS records the contract, the winner and the amount are under it.`}
			/>
			<section className='bb-container bb-section'>
				<NoticesExplorer key={`${supplier ?? ''}-${stage ?? ''}`} supplier={supplier} stage={stage} years={years} groups={groups} modes={modeGroups} funds={funds} />
			</section>
		</>
	)
}
