import type { Metadata } from 'next'
import Link from 'next/link'
import { lguReferences } from '@betterbarmm/lgu-data'
import { LguMasthead } from '../_components/lgu-parts'
import { DocToc, type TocItem } from '../_components/doc-toc'

export const metadata: Metadata = {
	title: 'The Bangsamoro Local Governance Code',
	description:
		'A reader’s guide to Bangsamoro Autonomy Act 49, the local government code of BARMM: what it devolves, who may run for office, how local money is raised and shared, what each level must have, and where it differs from the national Local Government Code of 1991.',
}

/* ============================================================
   The Bangsamoro Local Governance Code

   One page for understanding BAA 49, the code these provinces,
   cities, municipalities and barangays actually run on. It
   replaces "The two codes", whose comparison with RA 7160 is kept
   here as the last section.

   The topics are summarised from a briefing on the Code's salient
   features and cite the section each rests on, as that briefing
   does. The Act is the authority: the note at the foot says so and
   links it.
   ============================================================ */

type Point = { title: string; body: string; cite?: string }


const BOOKS = [
	{ book: 'Book I', title: 'General provisions', sections: 'Secs. 1–146' },
	{ book: 'Book II', title: 'Local taxation and fiscal matters', sections: 'Secs. 147–399' },
	{ book: 'Book III', title: 'Bangsamoro constituent units', sections: 'Secs. 400–570' },
	{ book: 'Book IV', title: 'Miscellaneous and final provisions', sections: 'Secs. 571–605' },
]

const TIMELINE = [
	{ when: '23 July 2020', what: 'Filed as Bill No. 58 in the first Bangsamoro Transition Authority. That Parliament closed with 31 acts passed, and this was not one of them.' },
	{ when: 'Second BTA', what: 'Refiled by the Government of the Day as Government Bill No. 30.' },
	{ when: 'Dec 2022 – Feb 2023', what: 'Public and expert consultations.' },
	{ when: 'Apr – Aug 2023', what: 'Deliberations and report of the Committee on Local Government.' },
	{ when: 'September 2023', what: 'Second and third reading in plenary; adopted and enacted.' },
]

const DEVOLUTION: Point[] = [
	{
		title: 'Powers and functions, not only services',
		body: 'Local governments keep the powers they already hold and take on those devolved to them under Book III. Where RA 7160 and the old ARMM code listed “basic services and facilities”, this Code frames devolution by function, competence and authority, set out level by level in Book III.',
		cite: 'Secs. 17–18',
	},
	{
		title: 'Gradual, from the region down',
		body: 'Decentralisation runs from the Bangsamoro Government to its local governments. Ministries are to hand over the powers, functions and services within five years of the Code taking effect, after an assessment of each unit’s financial viability and technical capacity.',
		cite: 'Secs. 2, 592',
	},
	{
		title: 'Three exceptions',
		body: 'Basilan, Marawi and Cotabato City keep the full devolution they already enjoy.',
		cite: 'Sec. 19',
	},
	{
		title: 'What “regulating the affairs” of LGUs means',
		body: 'The Parliament’s authority over local governments, exercised by law and regulation: how the Chief Minister supervises local officials and disciplines them, the framework for devolution and for how ministries work with local units, and how local governments raise revenue and share wealth, including transfers and assistance from the region.',
		cite: 'Sec. 28',
	},
]

const OFFICIALS: Point[] = [
	{
		title: 'Mandatory training',
		body: 'Every newly elected local official completes an eight-hour onboarding program on taking office and 32 hours of continuing training within the first two years. Deliberately skipping it is a ground for discipline and disqualifies the official from the next election until the training is done. In force from the May 2028 elections.',
		cite: 'Secs. 43, 595',
	},
	{
		title: 'No relatives on the same ballot',
		body: 'A person related within the second civil degree, by blood or marriage, to an incumbent local official running for office may not stand in the same election for a position in the same province, city, municipality or barangay. Also from May 2028.',
		cite: 'Secs. 45(g), 595',
	},
	{
		title: 'Other disqualifications',
		body: 'An incumbent may not run next for office in a different local government, except in the unit above or one within it. A chief executive may not seek the position immediately below. SK candidates may not be related within the second degree to any incumbent official in the locality.',
		cite: 'Sec. 45',
	},
	{
		title: 'Vacancies',
		body: 'Whoever refuses without reason to assume an office by succession faces discipline. Where a seat stays empty for 30 days and the unit cannot function, the Chief Minister or MILG appoints to it. Where a failure of elections runs past noon of 30 June, the Chief Minister (MILG, for a barangay) designates an officer-in-charge from the unit’s appointive officials.',
		cite: 'Secs. 52, 54',
	},
	{
		title: 'Leave',
		body: 'The Chief Minister approves leave for a governor or the mayor of an independent component or highly urbanised city; the governor for a municipal or component city mayor; the chief executive for the vice; the vice for sanggunian members; the mayor for a punong barangay; the punong barangay for barangay council members. A request not acted on in five days is deemed approved, and MILG is always furnished a copy.',
	},
	{
		title: 'Who hears a complaint',
		body: 'The Office of the Chief Minister, against officials of a province, highly urbanised or independent component city; the sangguniang panlalawigan, against those of a component city or municipality; the city or municipal council, against barangay officials. A complaint may also go straight to the Office of the Chief Minister where a fair hearing below is unlikely — a conflict of interest, or a case that would become moot.',
	},
]

const COUNCILS: Point[] = [
	{
		title: 'Ordinances online',
		body: 'As far as practicable, every local government keeps a website or official social media account where its sanggunian’s approved ordinances and resolutions, or their gist, are posted.',
	},
	{
		title: 'The Bangsamoro Register of Ordinances',
		body: 'MILG keeps a public, online register of every ordinance enacted by a sanggunian and filed with the local government operations officer.',
	},
	{
		title: 'Local boards',
		body: 'School boards follow the Bangsamoro Education Code, madaris included, and seat student representatives where practicable. Health boards draw members from the private sector and NGOs. Development councils are multi-sectoral, with a mandatory NGO seat and an indigenous peoples seat where the criteria are met. Peace and order councils may form ad hoc bodies of traditional and religious leaders, women and others to settle disputes and rido. Disaster risk councils should be at least 40% women, as far as practicable.',
	},
	{
		title: 'Other councils',
		body: 'Councils for the protection of children, against drug abuse, for youth, women, culture and the arts, the elderly, persons with disabilities, and internally displaced persons.',
	},
	{
		title: 'Indigenous peoples and settler communities at the table',
		body: 'Representation of indigenous peoples in local bodies is mandatory where they are at least 5% of the population but no more than half of its elected officials, or where a MIPA-recognised native title lies in the unit. Settler communities are guaranteed representation on the same 5% and 50% thresholds.',
	},
]

const MONEY: Point[] = [
	{
		title: 'The power to tax',
		body: 'Each local government may create its own sources of revenue and levy taxes, fees and charges, consistent with the Bangsamoro Organic Law. They accrue to the local government alone.',
		cite: 'Sec. 148',
	},
	{
		title: 'Avoiding riba',
		body: 'A sanggunian may adopt Shari’ah-compliant rules for unpaid or late taxes, fees and charges, in place of interest.',
	},
	{
		title: 'Real property tax exemptions',
		body: 'Besides government property: mosques, churches, cemeteries and land used for religious, charitable or educational purposes, madaris and Tahfidz Al-Qur’an institutions included; certified ancestral domains, except portions used for large-scale commercial purposes or titled privately; land declared inaccessible through force majeure, civil disturbance or armed conflict, for up to a year at a time; and property displaced persons left behind, as a Parliament law on IDPs may provide.',
	},
	{
		title: 'Development and livelihood',
		body: 'Shares a local government receives are appropriated for local development and livelihood projects, and at least 80% of what comes from hydrothermal, geothermal and other energy sources goes to lowering electricity costs where the source is.',
		cite: 'Sec. 316',
	},
]

const UPDATED_AMOUNTS = [
	{ tax: 'Professional tax', before: '₱300', now: '₱1,300' },
	{ tax: 'Annual fixed tax, delivery trucks or vans', before: '₱500', now: '₱2,200 – ₱6,600' },
	{ tax: 'Community tax (base)', before: '₱5', now: '₱20' },
]

const SHARES = [
	{
		title: 'Natural resources',
		lead: '70% of the Bangsamoro Government’s share goes to local governments; 30% stays with the region.',
		rows: [
			['Half, shared by all', 'Provinces 20% · cities 15% · municipalities 20% · barangays 15%'],
			['Half, where the resource is — in a province', 'Province 20% · city or municipality 45% · barangay 35%'],
			['Half, where the resource is — in an HUC or ICC', 'City 65% · barangay 35%'],
		],
	},
	{
		title: 'National taxes collected in BARMM',
		lead: '40% of the Bangsamoro Government’s share goes to local governments (BOL Art. XII, Sec. 13).',
		rows: [
			['Half, where it was collected — in a province', 'Province 40% · municipality 30% · barangay 30%'],
			['Half, where it was collected — in a city', 'City 60% · barangay 40%'],
			['Half, where it was collected — no province', 'Municipality 60% · barangay 40%'],
			['Half, shared by all', 'Provinces and cities 10% · municipalities 40% · barangays 50%'],
		],
	},
]

const BUDGET_RULES = [
	'Debt service may not exceed 20% of regular income.',
	'At least 20% of the annual NTA goes to development projects, with the development plan furnished to MILG.',
	'At least 5% of the budget goes to gender and development, with a GAD plan and budget submitted to MILG.',
	'At least 1% each for senior citizens, persons with disabilities, the local council for the protection of children, and local road maintenance.',
	'Sufficient funding for nutrition, AIDS prevention, drug rehabilitation, culture and heritage, coastal management, agriculture and fisheries, community-based monitoring, climate adaptation, health emergencies and solo parents.',
]

const LEVELS: { level: string; points: Point[] }[] = [
	{
		level: 'The barangay',
		points: [
			{ title: 'Revalidation', body: 'MILG revalidates every barangay, starting with those created under MMAA 25 that fell short of RA 7160’s standards. Those that meet them are entitled to the NTA; those that do not are merged with another by law or ordinance. New barangays must meet RA 7160’s requisites, not the lower MMAA 25 ones.' },
			{ title: 'Tribal barangays', body: 'Where non-Moro indigenous peoples are a minority in their city or municipality but native to it, a tribal barangay may be created by the Parliament or the provincial board without meeting the usual requisites, if the area is contiguous and they are its predominant population.' },
			{ title: 'Officials', body: 'Punong barangay, seven council members, an indigenous peoples or settler representative where the thresholds are met, the SK chairperson, a secretary and a treasurer. Also mandatory: a lupon tagapamayapa, child development teachers, barangay health workers, purok leaders and farm technicians. Tanods are optional, one per 200 people and no more than 30.' },
			{ title: 'Pay', body: 'The punong barangay at least ₱5,000 a month, up to the first step of salary grade 14; council members, secretary, treasurer, SK chair and the IP or settler representative at least ₱3,000, up to salary grade 10. MILG subsidises a barangay that cannot pay, for up to five years. Tanods, purok leaders, child development teachers and health workers at least ₱1,000; lupon members no more than ₱2,000 a month in all.', cite: 'Sec. 424' },
		],
	},
	{
		level: 'The municipality',
		points: [
			{ title: 'Creation', body: 'New municipalities must meet RA 7160’s requisites, not the lower MMAA 25 ones. A tribal municipality may be created by the Parliament for non-Moro indigenous peoples who are a minority in their province, with at least 20,000 people, and is funded by the region until it qualifies for the NTA.' },
			{ title: 'The council', body: 'Mayor, vice mayor and the sangguniang bayan: regular members, the liga and SK federation presidents, and three sectoral seats — women, agricultural or industrial workers, and one from the urban poor, indigenous communities or persons with disabilities (indigenous peoples where the thresholds are met). Settler communities get a further seat on the same thresholds.' },
			{ title: 'Who must be appointed', body: 'A long list of offices, from treasurer, assessor and accountant to a disaster risk officer, youth development officer and persons with disability affairs officer — a focal person suffices for that last in 4th to 6th class municipalities. A tourism officer is mandatory where tourism is a major industry.' },
		],
	},
	{
		level: 'The city',
		points: [
			{ title: 'No new cities from the region', body: 'The old ARMM code’s rules on creating and abolishing cities are dropped, after the Supreme Court held that autonomous regions cannot create cities. A city does what both a municipality and a province do.' },
			{ title: 'The council', body: 'Mayor, vice mayor and the sangguniang panlungsod, with the same three sectoral seats and settler seat as a municipality, and a list of mandatory offices that adds a legal officer, veterinarian and general services officer.' },
		],
	},
	{
		level: 'The province',
		points: [
			{ title: 'The board', body: 'Governor, vice governor and the sangguniang panlalawigan: regular members, the liga and SK federation presidents, the president of the federation of municipal and city council members, and the three sectoral seats.' },
			{ title: 'Population offices', body: 'A provincial population officer becomes optional, but provinces that already have the office keep it for five years.' },
		],
	},
	{
		level: 'Every chief executive',
		points: [
			{ title: 'Visits and reporting', body: 'Visit every component unit at least once every six months, and may hold an “Ulat sa Bayan” on achievements, finances and the proposed land use plan.' },
			{ title: 'Spending close to home', body: 'Meetings and conferences a local government pays for are held within its own territory, or the nearest place in BARMM, and outside the region only with MILG approval. Governors and city mayors sit on the Council of Leaders and the Bangsamoro Economic and Development Council.' },
		],
	},
]

const IMPLEMENTATION: Point[] = [
	{ title: 'Penalties', body: 'The offences largely mirror the national code, gender and development offences aside, with fines raised to the scale of RA 10951.' },
	{ title: 'Review before amendment', body: 'The Parliament’s Committee on Local Government oversees the Code and reviews it ten years after enactment and at least every three years after. It may only be amended on the results of that review.' },
	{ title: 'The Devolution Committee', body: 'Convened within a month by the Chief Minister: the Senior Minister in the chair, the Minister of the Interior and Local Government as vice, the Cabinet, the chair of the Committee on Local Government with five Members, and one representative each of the provinces, municipalities and barangays. It assesses local capacity within six months and submits a devolution plan within the next three.' },
	{ title: 'Implementing rules', body: 'MILG promulgates them in consultation with the region and local governments. They came on 30 September 2025: 696 articles.' },
]

type Difference = { subject: string; national: string; bangsamoro: string; basis: string }

const DIFFERENCES: Difference[] = [
	{
		subject: 'Who supervises the unit',
		national: 'The President supervises local government units through the DILG, and a province answers upward to Malacañang.',
		bangsamoro: 'The Chief Minister supervises them through the Ministry of the Interior and Local Government. A complaint against a provincial or highly urbanised city official is filed with the Office of the Chief Minister, and a governor’s leave is approved there — not in Manila.',
		basis: 'Code ss. 55, 196 · IRR art. 196',
	},
	{
		subject: 'What a barangay captain is paid',
		national: 'A punong barangay gets an honorarium of not less than ₱1,000 a month and a sangguniang barangay member ₱600 — figures set in 1991 and never raised.',
		bangsamoro: 'Not less than ₱5,000 a month for the punong barangay, up to the first step of salary grade 14; not less than ₱3,000 for council members, the secretary, the treasurer and the SK chairperson. Where a barangay cannot afford it, the Bangsamoro Government subsidises the difference through MILG.',
		basis: 'Code s. 424 · IRR art. 45',
	},
	{
		subject: 'Political dynasties',
		national: 'No prohibition. The constitutional ban has never been given a statute.',
		bangsamoro: 'A candidate related within the second civil degree to an incumbent elective official of the same unit is disqualified. It does not bite until the May 2028 elections.',
		basis: 'Code ss. 45(g), 595 · IRR arts. 184, 690',
	},
	{
		subject: 'Training as a condition of office',
		national: 'Encouraged, and attached to nothing.',
		bangsamoro: 'Onboarding on taking office and continuing training within two years; skipping it is a ground for discipline and disqualification from the next election. Also from May 2028.',
		basis: 'Code ss. 43, 595 · IRR art. 99',
	},
	{
		subject: 'Who fills a vacant council seat',
		national: 'The President appoints to a provincial board or a highly urbanised city council; the Governor to a component city or municipal council.',
		bangsamoro: 'The Chief Minister appoints to a sangguniang panlalawigan or the council of a highly urbanised or independent component city. Below that the chain is the same.',
		basis: 'Code s. 50 · IRR art. 192',
	},
	{
		subject: 'What a violation costs',
		national: 'The general penalty runs to a fine in the low thousands — the figures have not moved since 1991.',
		bangsamoro: 'Imprisonment of one to six months or a fine of ₱40,000 to ₱1,200,000, or both, and dismissal with perpetual disqualification where the offender holds office.',
		basis: 'Code s. 574 · IRR art. 415',
	},
	{
		subject: 'Custom and tradition',
		national: 'Customs and traditions may be resorted to in barangay dispute settlement, and little beyond that.',
		bangsamoro: 'Where neither law nor jurisprudence applies, local custom and tradition may be resorted to as a general rule of interpretation, alongside the Code’s principle of moral governance.',
		basis: 'Code ss. 2, 5 · IRR art. 5',
	},
	{
		subject: 'The Special Geographic Area',
		national: 'Nothing. The area was in North Cotabato when the code was written.',
		bangsamoro: 'The 63 barangays that voted to join in 2019 are provided for directly, and until a province is constituted for them their eight municipalities may levy the real property tax and the professional tax, which ordinarily belong to a province.',
		basis: 'Code ss. 600, 601 · IRR arts. 691–693',
	},
]

const SAME = [
	'A three-year term and a three-term limit, at every level including the barangay.',
	'The levels themselves — province, city or municipality, barangay.',
	'Doubt about a power is resolved in favour of the unit, and a tax ordinance against the unit that wrote it.',
	'Automatic succession: the vice takes over, then the highest-ranking council member.',
	'Recall on loss of confidence, on the same thresholds and once per term.',
	'The katarungang pambarangay, its lupon of 10 to 20, and the certificate to file action.',
	'Civil service coverage for appointive staff, and the Commission on Audit over the money.',
]

/** A heading's anchor: lowercase words joined by hyphens. */
const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[’'“”"()]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')

/* What each section is called, what it says first, and the topics under it —
   one list feeds both the headings and "On this page", so the two cannot drift. */
const OUTLINE: { id: string; title: string; topics: string[] }[] = [
	{ id: 'introduction', title: 'Introduction', topics: [] },
	{ id: 'history', title: 'How it came to be', topics: [] },
	{ id: 'structure', title: 'How the Code is organised', topics: [] },
	{ id: 'devolution', title: 'Devolution', topics: DEVOLUTION.map((p) => p.title) },
	{ id: 'officials', title: 'Officials', topics: OFFICIALS.map((p) => p.title) },
	{ id: 'councils', title: 'Ordinances and councils', topics: COUNCILS.map((p) => p.title) },
	{
		id: 'money',
		title: 'Local money',
		topics: [...MONEY.map((p) => p.title), 'Amounts brought up to date', ...SHARES.map((s) => s.title), 'What every local budget must carry'],
	},
	{ id: 'levels', title: 'Each level', topics: LEVELS.map((l) => l.level) },
	{ id: 'implementation', title: 'Putting it in force', topics: IMPLEMENTATION.map((p) => p.title) },
	{ id: 'differences', title: 'Versus RA 7160', topics: ['Where it differs', 'What stayed the same'] },
]

const TOC: TocItem[] = OUTLINE.flatMap((section) => [
	{ id: section.id, label: section.title, depth: 1 as const },
	...section.topics.map((topic) => ({ id: slug(topic), label: topic, depth: 2 as const })),
])

const H2 = 'scroll-mt-32 border-t border-[var(--rule)] pt-12 text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] first:border-t-0 first:pt-0'
const H3 = 'scroll-mt-32 text-[1.1rem] font-semibold tracking-[-0.01em] text-[var(--ink)]'
const P = 'text-[15.5px] leading-8 text-[var(--ink-2)]'

function Topic({ title, cite, children }: { title: string; cite?: string; children: React.ReactNode }) {
	return (
		<div className='mt-10'>
			<h3 id={slug(title)} className={H3}>
				{title}
				{cite ? <span className='ml-3 text-[13px] font-normal text-[var(--ink-3)]'>{cite}</span> : null}
			</h3>
			<div className={`mt-3 ${P}`}>{children}</div>
		</div>
	)
}

function Points({ points }: { points: Point[] }) {
	return points.map((point) => (
		<Topic key={point.title} title={point.title} cite={point.cite}>
			<p>{point.body}</p>
		</Topic>
	))
}

function Section({ id, lead, children }: { id: string; lead?: string; children: React.ReactNode }) {
	const title = OUTLINE.find((section) => section.id === id)!.title
	return (
		<section className='mt-16 first:mt-0'>
			<h2 id={id} className={H2}>
				{title}
			</h2>
			{lead ? <p className={`mt-5 ${P}`}>{lead}</p> : null}
			{children}
		</section>
	)
}

export default function GovernanceCodePage() {
	return (
		<>
			<LguMasthead
				kicker='The law · Bangsamoro'
				name='The Bangsamoro Local Governance Code'
			/>

			{/* Read like documentation: one column of text, and "On this page"
			    beside it on a wide screen, folded above it on a phone. */}
			<div className='bb-container bb-section grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16'>
				<p className='bg-[var(--paper-2)] px-6 py-5 text-[15px] leading-7 text-[var(--ink-2)] sm:px-8 sm:py-6 lg:col-span-2'>
					Bangsamoro Autonomy Act 49, enacted in September 2023, is the code every province, city, municipality and
					barangay in BARMM runs on. It creates their offices, fixes their terms and pay, sets how they raise and share
					money, and devolves the region’s powers to them. The national Local Government Code applies only where it is
					silent.
				</p>
				<details className='border border-[var(--rule)] bg-[var(--paper-2)] px-5 py-4 lg:hidden'>
					<summary className='cursor-pointer text-[14px] font-semibold text-[var(--ink)]'>On this page</summary>
					<ol className='mt-3'>
						{TOC.map((item) => (
							<li key={item.id}>
								<a href={`#${item.id}`} className={`block py-1 text-[13.5px] text-[var(--ink-2)] ${item.depth === 2 ? 'pl-4' : 'font-medium'}`}>
									{item.label}
								</a>
							</li>
						))}
					</ol>
				</details>

				<article className='min-w-0 max-w-[48rem]'>
					<Section id='introduction'>
						<p className={`mt-5 ${P}`}>
							Every province, city, municipality and barangay in the Philippines is governed by a local government
							code: the law that creates its offices, sets who may hold them and for how long, decides what it may tax
							and what it must spend on, and spells out what it owes the people who live there. For the rest of the
							country that law is the Local Government Code of 1991, Republic Act 7160.
						</p>
						<p className={`mt-5 ${P}`}>
							The Bangsamoro is different. When the Organic Law created the region in 2019, it gave the Bangsamoro
							Government the authority to regulate its own local governments, “in accordance with this Organic Law and a
							Bangsamoro local government code to be enacted by the Parliament”, on one condition: nothing the local
							governments already enjoyed under RA 7160 could be taken away (BOL Art. VI, Sec. 10).
						</p>
						<p className={`mt-5 ${P}`}>
							The Bangsamoro Local Governance Code, Bangsamoro Autonomy Act 49, is that law. It replaced the ARMM’s
							local government code of 1994, Muslim Mindanao Autonomy Act 25, and overrides the Bangsamoro
							Administrative Code where the two disagree. RA 7160 still applies inside the region, but only where the
							Bangsamoro code is silent.
						</p>
						<p className={`mt-5 ${P}`}>
							Its promise is in its second section: “genuine and meaningful local autonomy”, pursued under the principle
							of moral governance, by handing local governments “more powers, authority, responsibilities, and
							resources in a gradual and systematic approach”, from the region down (Sec. 2). The rest of this page
							follows how the Code keeps that promise.
						</p>
					</Section>

					<Section id='history' lead='It took two Parliaments.'>
						<ol className='mt-6'>
							{TIMELINE.map((step) => (
								<li key={step.when} className='grid gap-x-4 border-b border-[var(--rule-soft)] py-3 text-[15px] leading-7 text-[var(--ink-2)] sm:grid-cols-[10rem_minmax(0,1fr)]'>
									<span className='font-semibold text-[var(--ink)]'>{step.when}</span>
									<span>{step.what}</span>
								</li>
							))}
						</ol>
					</Section>

					<Section id='structure' lead='605 sections in four books, read in order: the rules that apply to every local government, then how they are funded, then what each level is and must do, then how the Code is put into force.'>
						<ul className='mt-6'>
							{BOOKS.map((book) => (
								<li key={book.book} className='grid grid-cols-[5rem_minmax(0,1fr)_auto] gap-4 border-b border-[var(--rule-soft)] py-3 text-[15px] text-[var(--ink-2)]'>
									<span className='font-semibold text-[var(--ink)]'>{book.book}</span>
									<span>{book.title}</span>
									<span className='num text-[13px] text-[var(--ink-3)]'>{book.sections}</span>
								</li>
							))}
						</ul>
					</Section>

					<Section id='devolution'>
						<Points points={DEVOLUTION} />
					</Section>

					<Section id='officials'>
						<Points points={OFFICIALS} />
					</Section>

					<Section id='councils'>
						<Points points={COUNCILS} />
					</Section>

					<Section id='money' lead='Book II. Local taxes stay local; the region’s shares of natural resources and national taxes are passed down by formula; and every local budget carries minimum allocations.'>
						<Points points={MONEY} />
						<Topic title='Amounts brought up to date'>
							<table className='w-full border-collapse text-[15px]'>
								<thead>
									<tr className='border-b border-[var(--ink)] text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)]'>
										<th className='py-2.5 pr-4 font-semibold'>Tax</th>
										<th className='py-2.5 pr-4 text-right font-semibold'>MMAA 25 / RA 7160</th>
										<th className='py-2.5 text-right font-semibold'>BAA 49</th>
									</tr>
								</thead>
								<tbody>
									{UPDATED_AMOUNTS.map((row) => (
										<tr key={row.tax} className='border-b border-[var(--rule-soft)]'>
											<td className='py-2.5 pr-4'>{row.tax}</td>
											<td className='num py-2.5 pr-4 text-right text-[var(--ink-3)]'>{row.before}</td>
											<td className='num py-2.5 text-right font-semibold text-[var(--ink)]'>{row.now}</td>
										</tr>
									))}
								</tbody>
							</table>
						</Topic>
						{SHARES.map((share) => (
							<Topic key={share.title} title={share.title}>
								<p>{share.lead}</p>
								<dl className='mt-3'>
									{share.rows.map(([label, split]) => (
										<div key={label} className='border-b border-[var(--rule-soft)] py-2.5'>
											<dt className='text-[13px] text-[var(--ink-3)]'>{label}</dt>
											<dd className='text-[15px] text-[var(--ink)]'>{split}</dd>
										</div>
									))}
								</dl>
							</Topic>
						))}
						<Topic title='What every local budget must carry' cite='Sec. 348'>
							<ul className='list-disc space-y-2 pl-5'>
								{BUDGET_RULES.map((rule) => (
									<li key={rule}>{rule}</li>
								))}
							</ul>
						</Topic>
					</Section>

					<Section id='levels'>
						{LEVELS.map((level) => (
							<Topic key={level.level} title={level.level}>
								<dl className='space-y-5'>
									{level.points.map((point) => (
										<div key={point.title}>
											<dt className='font-semibold text-[var(--ink)]'>
												{point.title}
												{point.cite ? <span className='ml-2 text-[13px] font-normal text-[var(--ink-3)]'>{point.cite}</span> : null}
											</dt>
											<dd className='mt-1'>{point.body}</dd>
										</div>
									))}
								</dl>
							</Topic>
						))}
					</Section>

					<Section id='implementation'>
						<Points points={IMPLEMENTATION} />
					</Section>

					<Section id='differences' lead='Each row is the same question put to both codes, with the Bangsamoro answer cited to its section and implementing rule.'>
						<Topic title='Where it differs'>
							{DIFFERENCES.map((row) => (
								<div key={row.subject} className='border-t border-[var(--rule)] py-5'>
									<p className='font-semibold text-[var(--ink)]'>{row.subject}</p>
									<p className='mt-2 text-[var(--ink-3)]'>
										<span className='text-[13px]'>RA 7160 · </span>
										{row.national}
									</p>
									<p className='mt-3 border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-5 py-4'>
										<span className='text-[13px] text-[var(--accent)]'>BAA 49 · </span>
										{row.bangsamoro}
										<span className='mt-1 block text-[13px] text-[var(--ink-3)]'>{row.basis}</span>
									</p>
								</div>
							))}
						</Topic>
						<Topic title='What stayed the same'>
							<ul className='list-disc space-y-2 pl-5'>
								{SAME.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</Topic>

						<p className='mt-14 border-t border-[var(--rule)] pt-6 text-[13px] leading-6 text-[var(--ink-3)]'>
							The topics above summarise the Code’s salient features and cite its sections as a briefing on the Code
							does; the comparison is read from the Code, its implementing rules and RA 7160. Where this page and the
							Act differ, the Act is right. Read{' '}
							<a href={lguReferences.localGovernanceCode.href} target='_blank' rel='noreferrer' className='rule-link'>
								{lguReferences.localGovernanceCode.label}
							</a>
							, its{' '}
							<a href={lguReferences.implementingRules.href} target='_blank' rel='noreferrer' className='rule-link'>
								implementing rules
							</a>{' '}
							and{' '}
							<a href={lguReferences.nationalCode.href} target='_blank' rel='noreferrer' className='rule-link'>
								{lguReferences.nationalCode.label}
							</a>
							. What each level does day to day is on{' '}
							<Link href='/how-it-works' className='rule-link'>
								How it works
							</Link>
							.
						</p>
					</Section>
				</article>

				<aside className='hidden lg:block'>
					<div className='sticky top-[calc(var(--sticky-top)+2rem)] max-h-[calc(100vh-var(--sticky-top)-4rem)] overflow-y-auto transition-[top] duration-300'>
						<DocToc items={TOC} />
					</div>
				</aside>
			</div>
		</>
	)
}
