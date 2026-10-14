/* The long-form guides each workspace already carries, listed here so the
   Explainers page is a map of every plain-language guide on the estate —
   short explainers from the admin sit beside them as they are published. */

/** The small picture on a guide's card: what kind of thing it explains. */
export type Motif = 'chamber' | 'questions' | 'cycle' | 'stack' | 'levels' | 'flow' | 'document' | 'ring' | 'ladder' | 'steps' | 'peso'

export type Guide = { workspace: string; category: string; title: string; summary: string; href: string; motif: Motif }

const LEG = 'https://legislation.betterbarmm.com'
const LGU = 'https://lgu.betterbarmm.com'
const BUDGET = 'https://budget.betterbarmm.com'
const PROC = 'https://procurement.betterbarmm.com'

export const GUIDES: Guide[] = [
	{
		workspace: 'Legislation',
		category: 'legislation',
		title: 'How Parliament works',
		motif: 'chamber',
		summary: 'What the Bangsamoro Parliament can and cannot do, how a bill becomes law, how it votes and where an ordinary person can take part.',
		href: `${LEG}/how-parliament-works`,
	},
	{
		workspace: 'Legislation',
		category: 'legislation',
		title: 'Common questions about Parliament',
		motif: 'questions',
		summary: 'Who its members are, how a law is made, why so few votes are on the record, and what a committee can compel.',
		href: `${LEG}/questions`,
	},
	{
		workspace: 'Budget',
		category: 'budget',
		title: 'The budget process',
		motif: 'cycle',
		summary: 'How a Bangsamoro budget is prepared, enacted, released and audited, as a sequence you can follow.',
		href: `${BUDGET}/process`,
	},
	{
		workspace: 'Budget',
		category: 'budget',
		title: 'Budget words, explained',
		motif: 'stack',
		summary: 'What Personnel Services, MOOE and capital outlay pay for, what a GAAB is, and what a special purpose fund does.',
		href: `${BUDGET}/faq`,
	},
	{
		workspace: 'Local government',
		category: 'lgu',
		title: 'What each level does',
		motif: 'levels',
		summary: 'Province, city or municipality, barangay: who you elect at each, what each does for you and what it may charge you.',
		href: `${LGU}/what-each-level-does`,
	},
	{
		workspace: 'Local government',
		category: 'lgu',
		title: 'How devolution works',
		motif: 'flow',
		summary: 'What the Local Governance Code hands down from the region to its local governments, and the services each level owes.',
		href: `${LGU}/devolution`,
	},
	{
		workspace: 'Local government',
		category: 'lgu',
		title: 'The Bangsamoro Local Governance Code',
		motif: 'document',
		summary: 'A reader’s guide to Autonomy Act 49: who may run, how local money is raised and shared, and where it differs from the national code.',
		href: `${LGU}/governance-code`,
	},
	{
		workspace: 'Local government',
		category: 'lgu',
		title: 'Local budgets',
		motif: 'ring',
		summary: 'Where a local government’s money comes from, what the law makes it spend first, and the dates its budget must clear.',
		href: `${LGU}/local-budgets`,
	},
	{
		workspace: 'Local government',
		category: 'lgu',
		title: 'Salaries and benefits',
		motif: 'ladder',
		summary: 'What the code pays a governor, a mayor, a council member and a barangay captain, and what limits a local payroll.',
		href: `${LGU}/salaries`,
	},
	{
		workspace: 'Procurement',
		category: 'general',
		title: 'How government procurement works',
		motif: 'steps',
		summary: 'The law, who decides, public bidding step by step, the other ways to buy, and the amounts that trigger each rule.',
		href: `${PROC}/how-it-works`,
	},
	{
		workspace: 'Procurement',
		category: 'general',
		title: 'Follow the peso',
		motif: 'peso',
		summary: 'Each regional office’s budget to buy with, set beside what it put out to bid and what was awarded.',
		href: `${PROC}/follow-the-peso`,
	},
]
