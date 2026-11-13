import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { NEEDS_LIVE } from '../_lib/needs'
import { BUDGET_URL, countBy, enrolmentYears, goneSince2019, historyById, pinsSource, placedCounts, schoolsSource, syLabel, years } from '../_lib/education'

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
						{countBy('source', 'deped').toLocaleString('en-PH')} schools, public and private, from the Department of Education&rsquo;s{' '}
						<a href={schoolsSource.url} className='rule-link'>
							Project Bukas
						</a>{' '}
						files: its school-level enrolment for school years {enrolmentYears.map(syLabel).join(', ')}, downloaded on 13 November 2026.
						The list is the latest year&rsquo;s; each school carries its learners for every year. Credit for the data is DepEd&rsquo;s,
						under its terms of use; DepEd has no part in this site. Sulu&rsquo;s schools are left out, as the directory follows the region
						since 2024. The Special Geographic Area&rsquo;s schools, which DepEd still files under their old North Cotabato towns, are
						placed in the SGA town their barangay is now in.
					</p>
					<p className={P}>
						Where each school stands, the year it was founded and its pupils in 2012–13 and 2015–16 come from DepEd&rsquo;s 2019 masterlist, as
						cleaned and published by the OpenStreetMap Philippines community as{' '}
						<a href={pinsSource.url} className='rule-link'>
							OSMaPaaralan
						</a>{' '}
						(also on the{' '}
						<a href={pinsSource.via} className='rule-link'>
							Humanitarian Data Exchange
						</a>
						), matched by school ID, or by name in the same town for a school DepEd has since renumbered. A school new since 2019 is shown
						at its town&rsquo;s centre until someone maps it. {goneSince2019.length.toLocaleString('en-PH')} schools on the 2019 list are
						not on the latest one: closed, merged, or renumbered past matching.
					</p>
					<p className={P}>
						What it cannot tell you: learners are formal schooling only, not the Alternative Learning System or community learning
						centres, and madaris outside the public schools are only those OpenStreetMap names. The Ministry of Basic, Higher and
						Technical Education publishes no list of its own; its figures, as it and the Parliament have stated them, are on the
						overview.
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
				{NEEDS_LIVE ? (
				<section>
					<h2 className={H2}>What schools need</h2>
					<p className={P}>
						Posted by teachers, school heads, students, parents and people in the community, through the form on this site. Each is
						checked by a BetterBARMM editor before it appears: that it is about a real school and names no child. A poster may leave an
						email or a number; only editors can see it, and it is never published. An editor marks a need met when told it has been
						filled. These are what people report, not an official inventory.
					</p>
				</section>
				) : null}
			</div>
		</>
	)
}
