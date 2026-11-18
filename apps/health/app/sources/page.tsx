import type { Metadata } from 'next'
import { Masthead } from '../_components/parts'
import { BUDGET_URL, countsSource, mapSource, years } from '../_lib/health'

export const metadata: Metadata = {
	title: 'Sources',
	description: 'Where the Health workspace’s figures come from, and what each record cannot tell you.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'

export default function SourcesPage() {
	return (
		<>
			<Masthead kicker='Health · Bangsamoro' name='Sources' note='The public records behind every page here, each kept as its publisher printed it.' />
			<div className='bb-container bb-section max-w-[52rem] [&>section+section]:mt-14'>
				<section>
					<h2 className={H2}>The money</h2>
					<p className={P}>
						What each General Appropriations Act of the Bangsamoro, FY {years[0]} to FY {years.at(-1)}, gives the Ministry of
						Health, its programs and the hospitals it names, read from the{' '}
						<a href={BUDGET_URL} className='rule-link'>
							Budget workspace&rsquo;s extraction
						</a>{' '}
						of the Acts. An appropriation is money set aside, not money spent. The Acts still fund Sulu&rsquo;s health office and
						hospitals, which left the region in 2024, and they are shown as printed.
					</p>
				</section>
				<section>
					<h2 className={H2}>The facilities</h2>
					<p className={P}>
						The Department of Health&rsquo;s National Health Facility Registry: how many facilities of each type, government and
						private, it counted in each city and municipality as of January 27, 2021, as published by OCHA Philippines on the{' '}
						<a href={countsSource.via} className='rule-link'>
							Humanitarian Data Exchange
						</a>
						. The registry&rsquo;s own site sits behind a check that turns automated readers away, so it is read through that
						copy. Towns are matched by their PSGC code, so Cotabato City is counted although the registry files it under
						Region XII. Sulu is left out.
					</p>
					<p className={P}>
						What it cannot tell you: the count is from 2021, before the Special Geographic Area&rsquo;s towns were created, and
						the ministry has built and upgraded facilities since. It is a count, not a list, and does not say whether a facility
						is open, staffed or supplied.
					</p>
				</section>
				<section>
					<h2 className={H2}>The hospitals on the map</h2>
					<p className={P}>
						Hospitals named as such on OpenStreetMap, from the{' '}
						<a href={mapSource.url} className='rule-link'>
							Humanitarian OpenStreetMap Team&rsquo;s export
						</a>{' '}
						of the Philippines&rsquo; health facilities. Map data © OpenStreetMap contributors, available under the Open Database
						License. Volunteers map what they know, so many hospitals are missing.
					</p>
				</section>
				<section>
					<h2 className={H2}>Town by town</h2>
					<p className={P}>
						Each town&rsquo;s people and barangays are the{' '}
						<a href='https://lgu.betterbarmm.com' className='rule-link'>
							Local Government workspace
						</a>
						&rsquo;s, from the Philippine Statistics Authority&rsquo;s latest census and its list of barangays. They are set beside the
						2021 facility count, so a ratio such as people per health station mixes two years, and a station can serve more than one
						barangay.
					</p>
				</section>
				<section>
					<h2 className={H2}>The map</h2>
					<p className={P}>
						Every hospital and health centre or clinic volunteers have placed on OpenStreetMap inside the region, each set in the barangay
						that holds it, the same record as the{' '}
						<a href='https://betterbarmm.com/preparedness' className='rule-link'>
							Preparedness
						</a>{' '}
						map. Map data © OpenStreetMap contributors, under the Open Database License. It holds only what someone has mapped.
					</p>
				</section>
				<section>
					<h2 className={H2}>Against the plan</h2>
					<p className={P}>
						The targets of the 2nd Bangsamoro Development Plan 2023–2028 for health, water and sanitation, and the latest figure for
						each, as gathered for{' '}
						<a href='https://betterbarmm.com/plan' className='rule-link'>
							the plan scorecard
						</a>{' '}
						from the plan, its midterm update and the Bangsamoro Development Reports. Each card links to the page its figure is printed
						on. Most of the ministry&rsquo;s figures come from its facility reporting, not from surveys; stunting is from a national
						survey.
					</p>
				</section>
				<section>
					<h2 className={H2}>Programs and services</h2>
					<p className={P}>
						What the Ministry of Health and other offices list for health in their citizen&rsquo;s charters and on their sites, from the{' '}
						<a href='https://betterbarmm.com/services' className='rule-link'>
							Programs &amp; services
						</a>{' '}
						record on betterbarmm.com, where each item&rsquo;s requirements, fee and source are.
					</p>
				</section>
				<section>
					<h2 className={H2}>Who buys</h2>
					<p className={P}>
						The ministry&rsquo;s, its hospitals&rsquo; and the provincial health offices&rsquo; bid notices on PhilGEPS since 2019,
						counted from the{' '}
						<a href='https://procurement.betterbarmm.com' className='rule-link'>
							Procurement workspace
						</a>
						&rsquo;s record. Each office links to its page there, where every notice is listed.
					</p>
				</section>
			</div>
		</>
	)
}
