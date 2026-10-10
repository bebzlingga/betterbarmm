import type { Metadata } from 'next'
import Link from 'next/link'
import { lguReferences } from '@betterbarmm/lgu-data'
import { DocLayout } from '../_components/doc-layout'
import type { TocItem } from '../_components/doc-toc'
import { LguMasthead } from '../_components/lgu-parts'

export const metadata: Metadata = {
	title: 'How devolution works',
	description:
		'What the Bangsamoro Local Governance Code hands down from the region to its provinces, cities, municipalities and barangays: how a power moves, who already has it, the services each level owes, and the offices that deliver them.',
}

/* ============================================================
   How devolution works

   Read from the operative sections of the Code (datasets/bills/
   blgc.json) and its implementing rules (blgc-irr.json), each
   cited. The services are what a level is responsible for under
   the Code, not an inventory of what any town runs today; the
   offices are what the Code requires, not who is in them.

   Where the Code and the IRR disagree the Code prevails, and the
   page follows it: the Devolution Committee's chair, and the
   offices a municipality must fill, which the IRR's lists keep
   shorter.
   ============================================================ */

type Field = { field: string; what?: string }

const BARANGAY: Field[] = [
	{ field: 'Agriculture', what: 'Farm-to-market roads, and a register of farmers and fishers.' },
	{ field: 'Health', what: 'The barangay health station, and its barangay health workers.' },
	{ field: 'Social services', what: 'The Violence Against Women desk, the Barangay Council for the Protection of Children, and child development centers.' },
	{ field: 'Environment', what: 'Waste segregation, and a materials recovery facility.' },
	{ field: 'Infrastructure', what: 'Barangay roads, footbridges, water supply, plazas and markets.' },
	{ field: 'Disaster risk reduction', what: 'A barangay risk map and an early-warning system.' },
	{ field: 'Public order', what: 'Tanods, who are civilians and may not carry firearms, and the katarungang pambarangay.' },
	{ field: 'Education', what: 'A library or reading center, and the palarong barangay.' },
	{ field: 'Trade', what: 'The barangay clearance a business needs for its permit.' },
	{ field: 'Tourism' },
	{ field: 'Labour', what: 'The kasambahay registry, and a help desk for overseas workers.' },
	{ field: 'Transport', what: 'Franchises for pedal-powered traysikad.' },
	{ field: 'Cooperatives' },
	{ field: 'Human rights', what: 'A Barangay Human Rights Action Center.' },
	{ field: 'Culture and the arts' },
]

const MUNICIPALITY: Field[] = [
	{ field: 'Agriculture', what: 'Seed farms, communal irrigation, post-harvest facilities and slaughterhouses; fishery laws in municipal waters, and licences for fishing vessels of 3 tons or less.' },
	{ field: 'Health', what: 'Municipal health centers, and a medical assistance program.' },
	{ field: 'Social services', what: 'The Persons with Disabilities Affairs Office, the Office of Senior Citizens’ Affairs and the Local Youth Development Office.' },
	{ field: 'Environment', what: 'The solid waste management board and plan, a materials recovery facility, communal forests of up to 50 square kilometres, and a climate change action plan.' },
	{ field: 'Infrastructure', what: 'Municipal roads and markets, through to public cemeteries.' },
	{ field: 'Disaster risk reduction' },
	{ field: 'Public order', what: 'The People’s Law Enforcement Board, and mechanisms to settle rido.' },
	{ field: 'Education', what: 'The municipal school board.' },
	{ field: 'Trade', what: 'Negosyo Centers, the Business One-Stop Shop, and certificates for barangay micro business enterprises.' },
	{ field: 'Tourism' },
	{ field: 'Labour', what: 'The Public Employment Service Office.' },
	{ field: 'Transport', what: 'Tricycle franchises, and permits for telecommunication towers.' },
	{ field: 'Housing', what: 'The comprehensive land use plan and the zoning ordinances.' },
	{ field: 'Science and technology' },
	{ field: 'Tax modernisation' },
	{ field: 'Cooperatives' },
	{ field: 'Human rights', what: 'A municipal Human Rights Action Center.' },
	{ field: 'Culture and the arts' },
]

const PROVINCE: Field[] = [
	{ field: 'Agriculture', what: 'Dairy farms, breeding stations, irrigation that crosses municipalities, and the provincial agriculture database.' },
	{ field: 'Health', what: 'Provincial and district hospitals, and other tertiary care.' },
	{ field: 'Social services', what: 'Topping up what its cities and municipalities provide, and licensing social welfare agencies with the Ministry of Social Services and Development.' },
	{ field: 'Environment', what: 'Chairing the provincial solid waste management board, enforcing forestry laws, regulating small-scale mining, and quarry permits of up to 5 hectares.' },
	{ field: 'Infrastructure', what: 'Provincial roads and bridges, piers, jails, and waterworks that cross municipalities.' },
	{ field: 'Disaster risk reduction' },
	{ field: 'Public order', what: 'Settling rido between residents of different municipalities.' },
	{ field: 'Education', what: 'The provincial school board.' },
	{ field: 'Trade and investment' },
	{ field: 'Tourism' },
	{ field: 'Labour' },
	{ field: 'Transport' },
	{ field: 'Housing', what: 'Reviewing and approving the land use plans of its cities and municipalities.' },
	{ field: 'Science and technology' },
	{ field: 'Tax modernisation' },
	{ field: 'Cooperatives' },
	{ field: 'Human rights' },
	{ field: 'Culture and the arts' },
]

/** R required, O optional, — not provided for at that level. */
type Need = 'R' | 'O' | '—'

const OFFICES: { office: string; province: Need; city: Need; municipality: Need; cite: string; note?: string }[] = [
	{ office: 'Secretary to the sanggunian', province: 'R', city: 'R', municipality: 'R', cite: 's. 523' },
	{ office: 'Treasurer', province: 'R', city: 'R', municipality: 'R', cite: 's. 524' },
	{ office: 'Assessor', province: 'R', city: 'R', municipality: 'R', cite: 's. 526' },
	{ office: 'Accountant', province: 'R', city: 'R', municipality: 'R', cite: 's. 528' },
	{ office: 'Budget officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 529' },
	{ office: 'Planning and development coordinator', province: 'R', city: 'R', municipality: 'R', cite: 's. 530' },
	{ office: 'Engineer', province: 'R', city: 'R', municipality: 'R', cite: 's. 531', note: 'also the building official in a city or municipality' },
	{ office: 'Health officer', province: 'R', city: 'R', municipality: 'R', cite: 'ss. 481, 532' },
	{ office: 'Civil registrar', province: '—', city: 'R', municipality: 'R', cite: 's. 533' },
	{ office: 'Administrator', province: 'R', city: 'R', municipality: 'R', cite: 's. 534' },
	{ office: 'Legal officer', province: 'R', city: 'R', municipality: 'O', cite: 's. 535' },
	{ office: 'Agriculturist', province: 'R', city: 'R', municipality: 'R', cite: 's. 536' },
	{ office: 'Social welfare and development officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 537' },
	{ office: 'Environment and natural resources officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 538' },
	{ office: 'Information officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 540' },
	{ office: 'Cooperatives development officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 541' },
	{ office: 'Veterinarian', province: 'R', city: 'R', municipality: 'O', cite: 's. 543' },
	{ office: 'General services officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 544' },
	{ office: 'Nutrition action officer', province: 'R', city: 'R', municipality: 'R', cite: 's. 548' },
	{ office: 'Tourism officer', province: 'R', city: 'O', municipality: 'O', cite: 's. 546', note: 'required where there are major tourism industries' },
	{ office: 'ICT officer', province: 'O', city: 'O', municipality: 'O', cite: 's. 545' },
	{ office: 'Local women’s development officer', province: 'O', city: 'O', municipality: 'O', cite: 's. 547' },
	{ office: 'Librarian', province: 'O', city: 'O', municipality: 'O', cite: 's. 549' },
]

const NEED: Record<Need, string> = { R: 'Required', O: 'Optional', '—': '—' }

const TOC: TocItem[] = [
	{ id: 'introduction', label: 'Introduction', depth: 1 },
	{ id: 'how-a-power-moves', label: 'How a power moves', depth: 1 },
	{ id: 'five-years', label: '5 years, after an assessment', depth: 2 },
	{ id: 'devolution-committee', label: 'The Devolution Committee', depth: 2 },
	{ id: 'what-moves', label: 'What moves with it', depth: 2 },
	{ id: 'the-people', label: 'The people already in the job', depth: 2 },
	{ id: 'already-devolved', label: 'Who already has it', depth: 1 },
	{ id: 'who-answers', label: 'Who answers to whom', depth: 1 },
	{ id: 'services', label: 'What each level does', depth: 1 },
	{ id: 'barangay', label: 'The barangay', depth: 2 },
	{ id: 'municipality', label: 'The municipality', depth: 2 },
	{ id: 'city', label: 'The city', depth: 2 },
	{ id: 'province', label: 'The province', depth: 2 },
	{ id: 'offices', label: 'The offices that deliver it', depth: 1 },
	{ id: 'barangay-offices', label: 'In a barangay', depth: 2 },
	{ id: 'appointed-offices', label: 'In a province, city or municipality', depth: 2 },
]

const H2 = 'scroll-mt-32 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const H3 = 'scroll-mt-32 text-[1.1rem] font-semibold tracking-[-0.01em] text-[var(--ink)]'
const P = 'text-[15px] leading-8 text-[var(--ink-2)]'
const CITE = 'ml-3 text-[13px] font-normal text-[var(--ink-3)]'

const label = (id: string) => TOC.find((item) => item.id === id)!.label

function Section({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<section className='mt-20 first:mt-0'>
			<h2 id={id} className={H2}>
				{label(id)}
			</h2>
			{children}
		</section>
	)
}

function Topic({ id, cite, children }: { id: string; cite?: string; children: React.ReactNode }) {
	return (
		<div className='mt-10'>
			<h3 id={id} className={H3}>
				{label(id)}
				{cite ? <span className={CITE}>{cite}</span> : null}
			</h3>
			<div className={`mt-3 space-y-5 ${P}`}>{children}</div>
		</div>
	)
}

function Fields({ fields }: { fields: Field[] }) {
	return (
		<ol className='mt-2'>
			{fields.map((row) => (
				<li
					key={row.field}
					className='grid gap-x-6 border-b border-[var(--rule-soft)] py-3 text-[15px] leading-8 sm:grid-cols-[12rem_minmax(0,1fr)]'
				>
					<span className='font-semibold text-[var(--ink)]'>{row.field}</span>
					<span className='text-[var(--ink-2)]'>{row.what}</span>
				</li>
			))}
		</ol>
	)
}

export default function DevolutionPage() {
	return (
		<>
			<LguMasthead kicker='The guide · Bangsamoro' name='How devolution works' />

			<DocLayout
				toc={TOC}
				narrow
				summary='Devolution moves a power, and the staff, assets and money that go with it, from the Bangsamoro Government down to its provinces, cities, municipalities and barangays. The Code gives the region’s ministries 5 years to finish it, after assessing what each unit can carry. Basilan, Marawi and Cotabato City already have it in full.'
			>
				<Section id='introduction'>
					<p className={`mt-5 ${P}`}>
						A road, a health station or a business permit is somebody’s job. Devolution decides whose. It is the
						transfer of a power from a higher government to a lower one, together with the work, the people and the
						money that carry it out. Under the Bangsamoro Local Governance Code it runs one way: from the Bangsamoro
						Government down to its constituent local governments, gradually and systematically (Sec. 2).
					</p>
					<p className={`mt-5 ${P}`}>
						A local government holds two kinds of power. The first it already has: what the law grants it outright,
						what is necessarily implied, and what is essential to the general welfare, from health and sanitation to
						peace and order in its territory (Sec. 17). The second is handed down to it under Book III of the Code,
						level by level.
					</p>
					<p className={`mt-5 ${P}`}>
						The national code of 1991 and the ARMM’s code of 1994 listed what was devolved as “basic services and
						facilities”. This Code frames it by function, competence and authority instead (Secs. 17–18). A
						municipality is not only given a health center to run; it is given the job of health in its territory,
						and the offices to do it.
					</p>
					<p className={`mt-5 ${P}`}>
						What it devolves is paid for mainly from each unit’s share of national taxes and its own revenues (Sec.
						18), which is why the{' '}
						<Link href='/stats' className='rule-link'>
							finances
						</Link>{' '}
						of a town say so much about what it can actually deliver.
					</p>
				</Section>

				<Section id='how-a-power-moves'>
					<Topic id='five-years' cite='Secs. 18, 592'>
						<p>
							The region’s ministries have 5 years from the Code taking effect to hand the powers, functions and
							services down. They do not hand them down all at once or to everyone alike: each transfer follows a
							comprehensive assessment of the unit’s financial viability and technical capacity. A municipality that
							cannot yet run a service is not left holding it.
						</p>
					</Topic>
					<Topic id='devolution-committee' cite='Sec. 592 · IRR art. 684'>
						<p>
							The Chief Minister was to convene a Devolution Committee within a month of the Code’s approval. It is
							chaired by the Senior Minister with the Minister of the Interior and Local Government as vice chair, and
							seats the Cabinet, the chair of the Parliament’s Committee on Local Government, 5 Members of
							Parliament, and one representative each of the provinces, the municipalities and the barangays.
						</p>
						<p>
							It supervises the transfer of powers, functions, assets and liabilities. Its technical working group had
							6 months to assess whether units could carry the devolved functions and 3 months more to submit a
							devolution plan. An initial ₱10,000,000 was set aside for its work. The implementing rules name the
							Interior and Local Government Minister as its chair; where the rules and the Code differ, the Code
							prevails.
						</p>
					</Topic>
					<Topic id='what-moves' cite='IRR arts. 367, 372'>
						<p>
							A service does not move alone. The personnel, assets, equipment and records that belong to it go down
							with it. The Ministry of the Interior and Local Government monitors each unit and certifies how far its
							devolution has gone.
						</p>
					</Topic>
					<Topic id='the-people' cite='Secs. 588, 596'>
						<p>
							Appointive officials who held permanent posts before the Code keep them, without reappointment and
							without losing status, rank or salary grade, though they cannot be promoted unless they meet the
							requirements of the higher post. Anyone separated by a reorganisation under the Code gets the retirement
							benefits they are owed, or, if not yet eligible to retire, at least 1 month’s salary for every year of
							service on top of their leave credits.
						</p>
					</Topic>
				</Section>

				<Section id='already-devolved'>
					<p className={`mt-5 ${P}`}>
						Three places do not wait. Marawi City, Cotabato City and the province of Basilan, with its component
						municipalities and Lamitan City, keep the full devolution they already held before the Code (Sec. 19;
						IRR art. 372). The Bangsamoro Government may still open its own offices there to deliver its own
						services.
					</p>
				</Section>

				<Section id='who-answers'>
					<p className={`mt-5 ${P}`}>
						Devolving a power is not letting go of it. The Chief Minister supervises provinces, highly urbanised
						cities and independent component cities directly; component cities and municipalities through their
						province; and barangays through their city or municipality, whose mayor keeps a barangay’s acts within
						its powers (Secs. 29, 37).
					</p>
					<p className={`mt-5 ${P}`}>
						There is one way for a power to come back up, and it is temporary. In an epidemic or other widespread
						danger to public health, the Minister of Health may, on the Chief Minister’s direction and after
						consulting the unit, take direct control of its health operations for the emergency, never for more
						than 6 months in all without the unit’s agreement (Sec. 117).
					</p>
				</Section>

				<Section id='services'>
					<p className={`mt-5 ${P}`}>
						What each level is responsible for under Book III. This is the job the Code gives it, not a list of what
						any particular town runs today. The Code’s own lists are longer; these are the parts a resident is most
						likely to meet.
					</p>

					<Topic id='barangay' cite='Secs. 400, 408'>
						<p>
							The basic political unit, and the primary planning and implementing unit in the community: the place
							where people’s views are heard and disputes are settled first. 15 fields.
						</p>
					</Topic>
					<Fields fields={BARANGAY} />

					<Topic id='municipality' cite='Secs. 475, 480'>
						<p>
							A group of barangays, and the general-purpose government that coordinates and delivers basic, regular
							and direct services in its territory. 18 fields.
						</p>
					</Topic>
					<Fields fields={MUNICIPALITY} />

					<Topic id='city' cite='Secs. 492–496'>
						<p>
							A city does both jobs. It performs the same powers and functions, and delivers the same services, as a
							municipality and a province together. A highly urbanised city, at least 200,000 people and ₱50,000,000
							in annual income at 1991 prices, and an independent component city, whose voters do not vote for the
							province, stand apart from the province. A component city remains part of the province it sits in.
						</p>
					</Topic>

					<Topic id='province' cite='Secs. 511, 512'>
						<p>
							The unit that drives development across its cities and municipalities and does what is too large for
							any one of them. 18 fields.
						</p>
					</Topic>
					<Fields fields={PROVINCE} />
				</Section>

				<Section id='offices'>
					<p className={`mt-5 ${P}`}>
						A devolved function needs someone to carry it. The Code fixes the offices each level must have, so the
						structure is the same in every unit of its kind; who holds them is up to the unit. The people in them
						for each town are on its{' '}
						<Link href='/' className='rule-link'>
							profile
						</Link>
						.
					</p>

					<Topic id='barangay-offices' cite='Secs. 413, 414'>
						<p>
							A punong barangay, 7 sangguniang barangay members and the sangguniang kabataan chairperson, all
							elected, with an appointed secretary and treasurer. Beside them sit the lupon tagapamayapa, child
							development center teachers, barangay health workers, purok leaders and local farm technicians. A
							purok is a division of at least 20 households. Tanods number 1 for every 200 inhabitants, and never
							more than 30.
						</p>
					</Topic>

					<Topic id='appointed-offices' cite='Secs. 481, 513, 523–549'>
						<p>
							Every province, city and municipality elects a chief executive, a vice and a council. Under them sit
							the appointed department heads below. The Code also requires a disaster risk reduction and
							management officer, a youth development officer and a persons with disability affairs officer in a
							province and a municipality, and a senior citizens affairs officer in a municipality, where a fourth to
							sixth class municipality may name a focal person for persons with disability instead. An architect, a
							population officer and a human resources officer are among the posts it may add.
						</p>
					</Topic>

					<div className='mt-6 overflow-x-auto'>
						<table className='w-full min-w-[34rem] border-collapse text-left text-[14px]'>
							<thead>
								<tr className='border-b border-[var(--ink)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
									<th className='py-3 pr-4 font-semibold'>Office</th>
									<th className='px-3 py-3 text-center font-semibold'>Province</th>
									<th className='px-3 py-3 text-center font-semibold'>City</th>
									<th className='px-3 py-3 text-center font-semibold'>Municipality</th>
								</tr>
							</thead>
							<tbody>
								{OFFICES.map((row) => (
									<tr key={row.office} className='border-b border-[var(--rule-soft)] align-top'>
										<td className='py-3 pr-4'>
											<span className='font-semibold text-[var(--ink)]'>{row.office}</span>
											<span className='block text-[12.5px] text-[var(--ink-3)]'>
												{row.note ? `${row.note} · ` : ''}
												{row.cite}
											</span>
										</td>
										{([row.province, row.city, row.municipality] as Need[]).map((need, i) => (
											<td
												key={i}
												className={`px-3 py-3 text-center ${need === 'R' ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]'}`}
											>
												{NEED[need]}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<p className='mt-14 border-t border-[var(--rule)] pt-6 text-[13px] leading-6 text-[var(--ink-3)]'>
						Read from the Code and its implementing rules, section by section. Where this page and the Act differ,
						the Act is right. Read{' '}
						<a href={lguReferences.localGovernanceCode.href} target='_blank' rel='noreferrer' className='rule-link'>
							{lguReferences.localGovernanceCode.label}
						</a>{' '}
						and its{' '}
						<a href={lguReferences.implementingRules.href} target='_blank' rel='noreferrer' className='rule-link'>
							implementing rules
						</a>
						. The rest of the Code is on{' '}
						<Link href='/governance-code' className='rule-link'>
							Governance Code
						</Link>
						.
					</p>
				</Section>
			</DocLayout>
		</>
	)
}
