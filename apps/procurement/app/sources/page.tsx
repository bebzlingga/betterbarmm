import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { entities, meta, notices } from '../_lib/philgeps'

export const metadata: Metadata = {
	title: 'Sources',
	description: 'Where the procurement figures come from, how they were read, and what they cannot tell you.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 text-[15px] leading-7 text-[var(--ink-2)]'

export default function SourcesPage() {
	return (
		<>
			<Masthead kicker='Procurement · Bangsamoro' name='Sources' note={`Read from PhilGEPS on ${meta.generatedAt}: ${notices.length.toLocaleString('en-PH')} notices from ${entities.length} procuring entities.`} />
			<div className='bb-container bb-section max-w-[52rem] [&>section+section]:mt-14'>
				<section>
					<h2 className={H2}>Where it comes from</h2>
					<p className={P}>
						Every figure here is the government&rsquo;s own, from the{' '}
						<a href='https://philgeps.gov.ph/CmsHomePages/open-data' target='_blank' rel='noreferrer' className='rule-link'>
							PhilGEPS open data dashboards
						</a>{' '}
						run by the Procurement Service of the Department of Budget and Management. Every office that buys with
						public money must post its bids there. We read the &ldquo;Bids and Awards&rdquo; and &ldquo;Merchants&rdquo;
						dashboards through the same public queries the pages make, and kept every office PhilGEPS files under
						BARMM.
					</p>
				</section>
				<section>
					<h2 className={H2}>What the words mean</h2>
					<p className={P}>
						A <strong>bid notice</strong> is an office announcing what it means to buy. Its <strong>approved budget</strong>{' '}
						is the most it may pay. An <strong>award</strong> is the contract it signed with the winning supplier, for
						the <strong>awarded amount</strong>. None of these is a payment: what was actually paid is in each
						office&rsquo;s books, not on PhilGEPS.
					</p>
				</section>
				<section>
					<h2 className={H2}>What it cannot tell you</h2>
					<p className={P}>
						PhilGEPS holds only what an office posts; a purchase never posted is not here. Titles and procurement
						modes are published only for notices that reached an award, or were posted on the modernized PhilGEPS
						since 2024; the rest show only their category. Awards on the modernized system are not yet published by
						office. A few offices are filed under the wrong type, and names are as PhilGEPS writes them.
					</p>
					<p className={P}>
						Sulu&rsquo;s province and towns, out of BARMM since 2024, are left out, as is Isabela City, which PhilGEPS
						files under BARMM but is part of Region IX. Offices of the region&rsquo;s ministries in Sulu remain.
					</p>
				</section>
			</div>
		</>
	)
}
