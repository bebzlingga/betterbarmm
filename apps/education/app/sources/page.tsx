import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { BUDGET_URL, countBy, historyById, placedCounts, schoolsSource, years } from '../_lib/education'

export const metadata: Metadata = {
	title: 'Sources',
	description: 'Where the Education workspace’s figures come from, and what each record cannot tell you.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'

export default function SourcesPage() {
	return (
		<>
			<Masthead kicker='Education · Bangsamoro' name='Sources' note='Public records, each kept as its publisher printed it, and what schools tell us themselves.' />
			<div className='bb-container bb-section max-w-[52rem] [&>section+section]:mt-14'>
				<section>
					<h2 className={H2}>The money</h2>
					<p className={P}>
						What each General Appropriations Act of the Bangsamoro, FY {years[0]} to FY {years.at(-1)}, gives the Ministry of
						Basic, Higher and Technical Education, and the programs it lists under it, read from the{' '}
						<a href={BUDGET_URL} className='rule-link'>
							Budget workspace&rsquo;s extraction
						</a>{' '}
						of the Acts. An appropriation is money set aside, not money spent. The Acts still list the Division of Sulu, which
						left the region in 2024, and its lines are shown as printed.
					</p>
				</section>
				<section>
					<h2 className={H2}>The schools</h2>
					<p className={P}>
						{countBy('source', 'deped').toLocaleString('en-PH')} public schools from the Department of Education&rsquo;s school masterlist,
						2019 edition, as cleaned and published by the OpenStreetMap Philippines community as{' '}
						<a href={schoolsSource.url} className='rule-link'>
							OSMaPaaralan
						</a>{' '}
						(also on the{' '}
						<a href={schoolsSource.via} className='rule-link'>
							Humanitarian Data Exchange
						</a>
						). Each is placed in the directory&rsquo;s town by the town the list names. Four of those names are matched by hand: two
						old names (Sultan Gumander, now Picong; Bumbaran, now Amai Manabilang), one without its middle initial and one
						misspelt. Sulu&rsquo;s schools are left out, as the directory follows the region since 2024. The list filed Cotabato
						City&rsquo;s schools under Region XII; they are kept with the city. The Special Geographic Area&rsquo;s schools are the
						ones the list files under the Cotabato-province towns its 63 barangays came from, picked out by barangay (or, where the
						list leaves the barangay blank, by a school named after one) and placed in the SGA town the barangay is now in.
					</p>
					<p className={P}>
						What it cannot tell you: the list is from 2019, so schools opened since are missing and some may have closed or been
						renamed. It holds public schools only, not madaris, community learning centers or private schools. The Ministry of
						Basic, Higher and Technical Education keeps its own, newer records; we have not found them published.
					</p>
					<p className={P}>
						The whole list, as this site holds it, is yours to take:{' '}
						<a href='/schools.csv' className='rule-link'>
							download it as a spreadsheet (CSV)
						</a>
						, one row a school with its ID, kind, town, district, pupils and coordinates. The districts and divisions the public schools
						answer to are set out on{' '}
						<Link href='/districts' className='rule-link'>
							their own page
						</Link>
						.
					</p>
				</section>
				<section>
					<h2 className={H2}>Private schools, madaris, colleges and universities</h2>
					<p className={P}>
						DepEd&rsquo;s list holds public schools only, and no list of the region&rsquo;s private schools is published that we have
						found. So {countBy('source', 'openstreetmap')} more come from{' '}
						<a href='https://data.humdata.org/dataset/hotosm_phl_education_facilities' className='rule-link'>
							OpenStreetMap
						</a>
						: the schools it names as private or religious, madaris and Islamic schools, and colleges and universities, that are not
						already on DepEd&rsquo;s list. Its government schools are not added, so a public school written two ways is not counted
						twice. Campus buildings and offices it names are left out.
					</p>
					<p className={P}>
						Whether a school is public or private is OpenStreetMap&rsquo;s own tag where it has one. Otherwise a name decides it only
						where it leaves no doubt: a foundation or an incorporated school, or a Notre Dame or other church school, is private; a state
						university or college, or a school the education ministry funds by name, is public. The rest are marked &ldquo;not
						stated&rdquo;. Its kind (elementary, high school, college or university, madrasah) is read from OpenStreetMap and from the
						name. This is far from every private school, madrasah or college in the region: only those volunteers have mapped.
					</p>
				</section>
				<section>
					<h2 className={H2}>Colleges added by hand</h2>
					<p className={P}>
						{countBy('source', 'wikipedia')} more are added from{' '}
						<a href='https://en.wikipedia.org/wiki/List_of_colleges_and_universities_in_the_Philippines' className='rule-link'>
							Wikipedia&rsquo;s list of the country&rsquo;s colleges and universities
						</a>
						, its Bangsamoro section: the state college campuses and private colleges neither DepEd&rsquo;s list nor OpenStreetMap has, each
						placed at its town, or where Wikidata records its coordinates. Whether one is public or private is the list&rsquo;s own section.
						A few schools with a Wikipedia article of their own are added the same way (datasets/education/school-additions.json).
					</p>
				</section>
				<section>
					<h2 className={H2}>Photographs and histories</h2>
					<p className={P}>
						Photographs are freely licensed files on Wikimedia Commons, credited on each page; few schools in the region have one
						yet. {historyById.size ? `${historyById.size} schools have a short history, ` : 'Short histories, where a school has one, are '}
						written from the sources listed under it: the school&rsquo;s own pages, the laws that created or converted it, government
						agencies and news reports.
					</p>
				</section>
				<section>
					<h2 className={H2}>Where each school is</h2>
					<p className={P}>
						{placedCounts.exact.toLocaleString('en-PH')} schools are pinned where they stand: by the coordinates on DepEd&rsquo;s list
						where it has them, and otherwise by the one school of the same name in the same town on{' '}
						<a href='https://data.humdata.org/dataset/hotosm_phl_education_facilities' className='rule-link'>
							OpenStreetMap
						</a>{' '}
						(map data © OpenStreetMap contributors, Open Database License). The other {placedCounts.town.toLocaleString('en-PH')} are
						shown at their town&rsquo;s centre, drawn as a ring rather than a dot, and their pages say so. The base map is CARTO&rsquo;s.
					</p>
				</section>
				<section>
					<h2 className={H2}>What schools need</h2>
					<p className={P}>
						Posted by teachers, school heads, students, parents and people in the community, through the form on this site. Each is
						checked by a BetterBARMM editor before it appears: that it is about a real school and names no child. A poster may leave an
						email or a number; only editors can see it, and it is never published. An editor marks a need met when told it has been
						filled. These are what people report, not an official inventory.
					</p>
				</section>
				<section>
					<h2 className={H2}>Who buys</h2>
					<p className={P}>
						The education offices&rsquo; bid notices on PhilGEPS since 2019, counted from the{' '}
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
