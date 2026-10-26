import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { works, workYears } from '../_lib/works'

export const metadata: Metadata = {
	title: 'Sources',
	description: 'Where the public works come from, how each is placed and typed, and how a likely bid notice is found.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'

export default function SourcesPage() {
	return (
		<>
			<Masthead
				kicker='Public works · Bangsamoro'
				name='Sources'
				note={`${works.length.toLocaleString('en-PH')} projects from ${workYears.length} General Appropriations Acts of the Bangsamoro, FY ${workYears[0]} to FY ${workYears.at(-1)}.`}
			/>
			<div className='bb-container bb-section max-w-[52rem] [&>section+section]:mt-14'>
				<section>
					<h2 className={H2}>Where it comes from</h2>
					<p className={P}>
						Each year&rsquo;s General Appropriations Act of the Bangsamoro lists, under the Ministry of Public Works, the
						infrastructure projects it funds one by one, grouped by province or district, each with its amount. These are
						read from the{' '}
						<a href='https://budget.betterbarmm.com/sources' className='rule-link'>
							Budget workspace&rsquo;s extraction
						</a>{' '}
						of the Acts, with the page each is printed on. Nothing is re-totalled: the amounts are the Acts&rsquo;.
					</p>
				</section>
				<section>
					<h2 className={H2}>What it cannot tell you</h2>
					<p className={P}>
						An appropriation is money set aside, not money spent, and not a road built. Whether a project was bid out,
						awarded, finished or abandoned is not in the Act. Projects the ministry funds from lump sums, or that other
						offices build, are not itemised and so are not here.
					</p>
				</section>
				<section>
					<h2 className={H2}>How each project is placed and typed</h2>
					<p className={P}>
						A project&rsquo;s town is the one its own name mentions, matched against the local government directory within
						the province the Act lists it under. Before Maguindanao was split in 2022 the Acts list its two districts; their
						projects are placed in Maguindanao del Norte or del Sur by town, and stay under &ldquo;Maguindanao&rdquo; where
						no town is named. Its kind (road, bridge, water, flood control, building and so on) is read from the words of
						its name.
					</p>
				</section>
				<section>
					<h2 className={H2}>How a likely bid notice is found</h2>
					<p className={P}>
						From the{' '}
						<a href='https://procurement.betterbarmm.com' className='rule-link'>
							Procurement workspace
						</a>
						&rsquo;s PhilGEPS record, every Ministry of Public Works notice with a title. A notice is offered as a project&rsquo;s
						likely notice when it shares at least four in five of the project&rsquo;s distinctive words (words that appear
						in few project names, such as barangay and sitio names), was posted in the project&rsquo;s year or the next, and
						its approved budget is between half and 110% of the project&rsquo;s amount. Only notices that reached an award,
						or were posted on PhilGEPS&rsquo;s newer system, carry titles, so many projects that were bid out have no
						match here. A match is a lead to check against the notice itself.
					</p>
				</section>
			</div>
		</>
	)
}
