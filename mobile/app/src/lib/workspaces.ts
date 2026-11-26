/* Every BetterBARMM workspace and project, as the website lists them (apps/www/app/_lib/workspaces.ts). Three
   have native screens — Parliament, Places, and incidents on Home; the rest open from Explore as their own site.
   Only live workspaces are here: planned ones (public works) and the sector workspaces the site still hides are
   left out until the site shows them. `icon` names a 3D icon (icons3d.ts) and a Phosphor one (icons.tsx). */

export type Workspace = {
	id: string; title: string; blurb: string; measure: string; icon: string; group: string; url: string
	/** The tab that shows it natively, if any. */
	tab?: 'parliament' | 'places' | 'index'
}

export const GROUPS = [
	{ id: 'government', title: 'Laws & elections' },
	{ id: 'money', title: 'Public money' },
	{ id: 'services', title: 'Services & safety' },
	{ id: 'places', title: 'Places & culture' },
	{ id: 'data', title: 'Data' },
]

export const WORKSPACES: Workspace[] = [
	{ id: 'legislation', title: 'Legislation', blurb: 'Bills, autonomy acts and the members who filed them, with the stage each has reached.', measure: 'Bangsamoro Parliament', icon: 'bank', group: 'government', url: 'https://legislation.betterbarmm.com', tab: 'parliament' },
	{ id: 'lgu', title: 'Local government', blurb: 'Every province, city, municipality and barangay — population, land area and the officials elected to each.', measure: 'LGU directory', icon: 'buildings', group: 'government', url: 'https://lgu.betterbarmm.com' },
	{ id: 'election', title: 'Election', blurb: 'Parties, candidates, districts and sectoral seats for the 2026 Parliamentary Elections.', measure: '2026 Parliament', icon: 'check-square', group: 'government', url: 'https://election.betterbarmm.com' },
	{ id: 'budget', title: 'Budget', blurb: 'Every enacted appropriation by sector, office, program and project, traced to the page of the Act.', measure: 'GAAB FY 2020–2026', icon: 'coins', group: 'money', url: 'https://budget.betterbarmm.com' },
	{ id: 'procurement', title: 'Procurement', blurb: 'Every bid notice BARMM offices posted on PhilGEPS since 2019, its budget, and who won.', measure: 'PhilGEPS 2019–2026', icon: 'shopping-cart', group: 'money', url: 'https://procurement.betterbarmm.com' },
	{ id: 'plan', title: 'Development Plan Scorecard', blurb: 'The regional plan’s targets for poverty, jobs, schools, health and peace, beside the latest figure.', measure: 'BDP 2023–2028', icon: 'chart-line-up', group: 'money', url: 'https://betterbarmm.com/development-plan' },
	{ id: 'incidents', title: 'Incident Watch', blurb: 'Road crashes, sea mishaps, fires, floods and shootings across the region, from the news.', measure: 'Since 2019', icon: 'warning', group: 'services', url: 'https://betterbarmm.com/accidents', tab: 'index' },
	{ id: 'preparedness', title: 'Preparedness', blurb: 'Flood, landslide and storm surge hazard for every barangay, with the nearest evacuation sites.', measure: 'Project NOAH hazards', icon: 'lifebuoy', group: 'services', url: 'https://betterbarmm.com/preparedness' },
	{ id: 'services', title: 'Public services', blurb: 'What each office offers the public: who it is for, what to bring, the fee and how long it takes.', measure: 'Citizen’s Charters', icon: 'handshake', group: 'services', url: 'https://betterbarmm.com/services' },
	{ id: 'education', title: 'Education', blurb: 'Every school in the region on a map, with its learners each year, scholarships and the budget.', measure: 'DepEd · MBHTE', icon: 'graduation-cap', group: 'services', url: 'https://education.betterbarmm.com' },
	{ id: 'travel', title: 'Travel & Places', blurb: 'Beaches, islands, lakes, mosques and heritage sites, with where to stay and eat and how to get there.', measure: '104 places', icon: 'map-trifold', group: 'places', url: 'https://travel.betterbarmm.com', tab: 'places' },
	{ id: 'library', title: 'Library', blurb: 'Books about the Bangsamoro and its peoples, where to buy, borrow or read them free.', measure: 'Books · Authors · Magazines', icon: 'books', group: 'places', url: 'https://library.betterbarmm.com' },
	{ id: 'crafts', title: 'Crafts', blurb: 'The weaves, mats, brass and gongs of the region: where each is made and who makes it.', measure: 'Weaves, brass, gongs', icon: 'yarn', group: 'places', url: 'https://betterbarmm.com/crafts' },
	{ id: 'data', title: 'Open Data', blurb: 'The records under every workspace as tables anyone can download, each with its source.', measure: 'CSV and JSON', icon: 'database', group: 'data', url: 'https://betterbarmm.com/data' },
]
