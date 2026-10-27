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
		href: '/services',
		blurb: 'What each regional office, province, city and town offers the public: who it is for, what to bring, the fee and how long it takes.',
		measure: 'Citizen’s Charters',
		state: 'live',
	},
	{
		label: 'Travel & Places',
		href: 'https://travel.betterbarmm.com',
		blurb:
			'Beaches, islands, lakes, mosques and heritage sites to browse like stays, with what to do and eat, where to sleep, how to get there and an honest account of the security picture in each area.',
		measure: '104 places, seven areas',
		// The only workspace here that is written rather than captured, and its
		// pages say so: everything else on this index promises a record traced to
		// the body that published it, and this one cannot make that promise.
		state: 'live',
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
		key: 'preparedness',
		label: 'Preparedness',
		href: '/preparedness',
		measure: 'Project NOAH Hazards',
		blurb: 'Flood, landslide and storm surge hazard for every barangay, with the evacuation sites, hospitals and offices nearest each.',
		state: 'live',
	},
	{
		key: 'crafts',
		label: 'Crafts',
		href: '/crafts',
		measure: 'Weaves, Brass, Gongs',
		blurb: 'The weaves, mats, brass and gongs of the region: where each is made, who makes it, and where to see it.',
		state: 'live',
	},
	{
		key: 'data',
		label: 'Open Data',
		href: '/data',
		measure: 'CSV and JSON',
		blurb: 'The records underneath every workspace as tables anyone can download, each with its source and every column described.',
		state: 'live',
	},
	{
		key: 'services',
		label: 'Programs & Services',
		measure: 'Citizen’s Charters',
		blurb: 'What each office offers, who it is for, and what to bring, from its own Citizen’s Charter.',
		state: 'soon',
	},
]
