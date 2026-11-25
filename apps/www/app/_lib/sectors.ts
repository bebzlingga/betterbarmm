import type { Category } from './services'

/* ============================================================
   Sector workspaces

   One page per sector a resident thinks in — welfare, business, jobs —
   gathered from records the site already holds: the offices answerable
   for it, what they offer, the plan's targets, the jobs and grants open,
   the bids out and the news. Nothing here is a new record; a sector is
   a filter over the ones that exist.

   Hidden outside development until they are reviewed (user decision).
   ============================================================ */

export const SECTORS_LIVE = process.env.NODE_ENV === 'development'
/** On the front page's list. Off everywhere for now (user decision). */
export const SECTORS_LISTED = false

export type Sector = {
	slug: string
	title: string
	lead: string
	/** Offices answerable for the sector, from the services dataset. */
	offices: string[]
	/** Items other offices list on these shelves join the sector too. */
	categories: Category[]
	/** Development plan areas, as the scorecard names them. */
	planAreas: string[]
	/** PhilGEPS procuring entities, by name. */
	procurement: RegExp
	/** Headlines that belong here. */
	news: RegExp
	/** Headlines the words above catch that do not. */
	newsNot?: RegExp
	/** Every open government job, rather than only the sector offices'. */
	allJobs?: boolean
	/** Workspaces elsewhere on the site that go deeper. */
	related: { label: string; href: string }[]
}

export const sectors: Sector[] = [
	{
		slug: 'social-welfare',
		title: 'Social & Welfare',
		lead: 'Cash aid, relief, housing and protection for families, children, women, older people, persons with disability and indigenous communities.',
		offices: [
			'ministry-of-social-services-and-development',
			'ministry-of-human-settlements-and-development',
			'bangsamoro-women-commission',
			'bangsamoro-youth-commission',
			'ministry-of-indigenous-peoples-affairs',
			'office-for-settler-communities',
		],
		categories: ['assistance', 'housing'],
		planAreas: ['Poverty and income', 'Social protection', 'Housing'],
		procurement: /SOCIAL SERVICES|HUMAN SETTLEMENTS|WOMEN COMMISSION|YOUTH COMMISSION|INDIGENOUS|SETTLER/i,
		news: /\b(4Ps|pantawid|MSSD|social (services|welfare|pension)|ayuda|cash (aid|assistance)|indigents?|orphans?|senior citizens?|PWDs?|persons with disabilit\w+|housing|MHSD|shelter|children|orphanage|solo parents?|indigenous peoples?)\b/i,
		related: [{ label: 'Preparedness', href: '/preparedness' }],
	},
	{
		slug: 'business-economy',
		title: 'Business & Economy',
		lead: 'Starting and growing a business in the region: permits, investment incentives, cooperatives, trade fairs and the science offices that help small firms.',
		offices: ['ministry-of-trade-investments-and-tourism', 'bangsamoro-board-of-investments', 'cooperatives-and-social-enterprise-authority', 'ministry-of-science-and-technology'],
		categories: ['business'],
		planAreas: ['Economy', 'Trade, industry and tourism'],
		procurement: /TRADE, INVESTMENTS|BOARD OF INVESTMENTS|COOPERATIVE|SCIENCE AND TECHNOLOGY/i,
		newsNot: /\b(killed|shot|shooting|arrested|ambush\w*)\b|Business Mirror/i,
		news: /\b(invest\w*|business\w*|MSMEs?|trade|BBOI|MTIT|cooperatives?|econom\w+|halal|exports?|entrepreneurs?|GDP|GRDP|tourism)\b/i,
		related: [{ label: 'Travel & Places', href: 'https://travel.betterbarmm.com' }],
	},
	{
		slug: 'taxes-finance',
		title: 'Taxes & Finance',
		lead: 'How the regional government raises and manages its money: taxes and fees, the budget, the treasury and the audits of how it was spent.',
		offices: ['ministry-of-finance-and-budget-and-management'],
		categories: ['taxes'],
		planAreas: ['Government and finance'],
		procurement: /FINANCE AND BUDGET/i,
		news: /\b(tax\w*|revenues?|budget|MFBM|block grant|appropriations?|audit\w*|COA|finance|fiscal)\b/i,
		related: [
			{ label: 'Budget', href: 'https://budget.betterbarmm.com' },
			{ label: 'Procurement', href: 'https://procurement.betterbarmm.com' },
		],
	},
	{
		slug: 'labor-employment',
		title: 'Labor & Employment',
		lead: 'Jobs, skills training, livelihood help and the rights of workers in the region, including those working overseas.',
		offices: ['ministry-of-labor-and-employment', 'development-academy-of-the-bangsamoro'],
		categories: ['livelihood'],
		planAreas: ['Jobs'],
		procurement: /LABOR AND EMPLOYMENT/i,
		news: /\b(jobs?|employment|MOLE|TESD\w*|workers?|OFWs?|livelihood|skills? training|hiring|job fair|unemploy\w+|wages?)\b/i,
		allJobs: true,
		related: [{ label: 'Opportunities', href: '/opportunities' }],
	},
	{
		slug: 'law-justice',
		title: 'Law & Justice',
		lead: 'The region’s laws, its legal counsel and human rights body, and where to turn for legal help or to file a complaint.',
		offices: ['bangsamoro-attorney-general-s-office', 'bangsamoro-human-rights-commission'],
		categories: ['legal'],
		planAreas: [],
		procurement: /HUMAN RIGHTS COMMISSION|ATTORNEY/i,
		newsNot: /\b(covered|basketball) courts?\b/i,
		news: /\b(courts?|Shari'?ah|justice|attorney|human rights|BHRC|ombudsman|Supreme Court|ruling|lawsuit|petition|acquitted|convicted|sentenced)\b/i,
		related: [
			{ label: 'Legislation', href: 'https://legislation.betterbarmm.com' },
			{ label: 'Directory', href: '/directory' },
		],
	},
	{
		slug: 'agriculture-environment',
		title: 'Agriculture & Environment',
		lead: 'Farming, fishing and land reform, and the forests, seas, water and energy the region depends on.',
		offices: ['ministry-of-agriculture-fisheries-and-agrarian-reform', 'ministry-of-environment-natural-resources-and-energy', 'bangsamoro-agriculture-and-fisheries-training-institute'],
		categories: ['farming'],
		planAreas: ['Agriculture and food', 'Environment and climate', 'Water, sanitation and electricity'],
		procurement: /AGRICULTURE|ENVIRONMENT AND NATURAL|IRRIGATION/i,
		news: /\b(farm\w*|agri\w*|fish\w*|MAFAR|MENRE|rice|corn|coconut|banana|environment\w*|forests?|mangroves?|climate|seaweed|livestock|irrigation|energy|power supply|electricity)\b/i,
		related: [{ label: 'Preparedness', href: '/preparedness' }],
	},
]

export const sectorBySlug = (slug: string) => sectors.find((s) => s.slug === slug)
