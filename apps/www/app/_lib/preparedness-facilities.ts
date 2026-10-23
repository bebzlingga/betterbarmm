import file from '../../../../datasets/preparedness/facilities.json'

/* The facilities on the preparedness map: OpenStreetMap's, each placed in the
   barangay that holds it and linked to its own record. The official registers
   are not open (see facilities.json's note), and the page says so beside them. */

export type FacilityRecord = {
	id: string
	kind: string
	name: string
	lon: number
	lat: number
	barangay: string
	psgc: string
	town: string | null
	prov: string | null
	detail: string | null
	source: { label: string; url: string }
}

export const facilities = file.facilities as FacilityRecord[]
export const facilitiesMeta = { generatedAt: file.generatedAt, note: file.note, counts: file.counts as Record<string, number> }

/** Colours kept clear of the hazards' yellow, orange and red. */
export const facilityKinds = [
	{ id: 'evacuation', label: 'Evacuation centres (mapped)', color: '#1d4ed8', defaultOn: true },
	{ id: 'school', label: 'Schools, often used as evacuation sites', color: '#7a52cc', defaultOn: true },
	{ id: 'hospital', label: 'Hospitals', color: '#0f8a4f', defaultOn: true },
	{ id: 'health', label: 'Health centres and clinics', color: '#3fb27f', defaultOn: true },
	{ id: 'drrm', label: 'Disaster risk reduction offices', color: '#0e7490', defaultOn: true },
	{ id: 'police', label: 'Police stations', color: '#334155', defaultOn: true },
	{ id: 'fire', label: 'Fire stations', color: '#9a3412', defaultOn: true },
]

export const facilitySources = [
	{
		label: 'OpenStreetMap',
		url: 'https://www.openstreetmap.org/copyright',
		note: 'Every facility on the map, read through the Overpass API and placed in the barangay that holds it (ODbL). It is mapped by volunteers and is not an official register.',
	},
	{
		label: 'DILG master list of evacuation centres',
		url: 'https://www.foi.gov.ph/',
		note: 'The official list with coordinates (2023) is released only on request through FOI, so it is not on the map. Few of the region’s evacuation centres are on OpenStreetMap; schools stand in because they are what LGUs most often designate, but a school shown here is not thereby a designated centre.',
	},
	{
		label: 'DOH National Health Facility Registry',
		url: 'https://nhfr.doh.gov.ph/',
		note: 'The official register of hospitals and health facilities. It refuses automated access, so the health facilities shown are OpenStreetMap’s.',
	},
	{
		label: 'PSA 2024 Census of Population, by barangay',
		url: 'https://psa.gov.ph/classification/psgc',
		note: 'As PSA prints it beside each barangay in the PSGC, read through the psgc package (github.com/yng-me/psgc). Three barangays of the Special Geographic Area that PSA has since moved between towns have no figure.',
	},
]
