import type { Project } from '../_components/project-list'
import type { Workspace } from '../_components/workspace-index'

/** Every workspace, in the order the front page shows them. */
export const workspaces: Workspace[] = [
	{
		label: 'Budget',
		href: 'https://budget.betterbarmm.com',
		blurb:
			'Every enacted appropriation by sector, office, program and project, traced to the page of the Act it was printed on.',
		measure: 'GAAB FY 2020–2026',
		state: 'live',
	},
	{
		label: 'Local government',
		href: 'https://lgu.betterbarmm.com',
		blurb:
			'Every province, city, municipality and barangay in the region — population, land area, and the officials elected to each.',
		measure: 'LGU directory',
		state: 'live',
	},
	{
		label: 'Legislation',
		href: 'https://legislation.betterbarmm.com',
		blurb:
			'Bills, autonomy acts, resolutions, committees, and the members who filed them — with the stage each measure has reached.',
		measure: 'Bangsamoro Parliament',
		state: 'live',
	},
	{
		label: 'Election',
		href: 'https://election.betterbarmm.com',
		blurb:
			'Parties, candidates, districts, and sectoral seats for the 2026 Parliamentary Elections, with the source record behind each one.',
		measure: '2026 Parliament',
		state: 'live',
	},
	{
		label: 'Public works',
		blurb: 'Infrastructure projects, their cost, their contractor, and whether they were finished.',
		measure: 'Infrastructure',
		state: 'planned',
	},
	{
		label: 'Procurement',
		href: 'https://procurement.betterbarmm.com',
		blurb:
			'Every bid notice a BARMM government office has posted on PhilGEPS since 2019, its approved budget, and who won the contract.',
		measure: 'PhilGEPS 2019–2026',
		state: 'live',
	},
	{
		label: 'Public services',
		blurb: 'Which office handles what, what it costs, and what you need to bring.',
		measure: 'Service finder',
		state: 'planned',
	},
	{
		label: 'Travel',
		href: '/soon',
		blurb:
			'A written guide to the seven areas — what there is to see, what to eat, where lodging actually exists, and an honest account of the security picture in each.',
		measure: 'Seven areas',
		// The only workspace here that is written rather than captured, and the
		// blurb says so: everything else on this index promises a record traced
		// to the body that published it, and this one cannot make that promise.
		state: 'soon',
	},
	{
		label: 'Source layer',
		blurb: 'The documents and datasets underneath every workspace, openable on their own.',
		measure: 'PDFs and JSON',
		state: 'planned',
	},
]

/** The projects: records of a different kind, each a page on this site rather than a workspace of its own. */
export const projects: Project[] = [
	{
		key: 'accidents',
		label: 'Incident Watch',
		href: '/accidents',
		measure: 'Since 2019',
		blurb: 'Road crashes, sea mishaps, fires, floods and shootings across the region, mapped from the news, every report linked.',
		state: 'live',
	},
	{
		key: 'crafts',
		label: 'Crafts',
		href: '/crafts',
		measure: 'Weaves, brass, gongs',
		blurb: 'The weaves, mats, brass and gongs of the region: where each is made, who makes it, and where to see it.',
		state: 'live',
	},
	{
		key: 'services',
		label: 'Programs & services',
		measure: 'Citizen’s Charters',
		blurb: 'What each office offers, who it is for, and what to bring, from its own Citizen’s Charter.',
		state: 'soon',
	},
]
