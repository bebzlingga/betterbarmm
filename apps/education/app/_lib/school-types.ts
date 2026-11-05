/* The kinds of school, each with the colour its dot takes on the map. No imports:
   the map runs in the browser and takes these from here.

   Hues kept apart from each other and from the base map's greys, each one
   named in the legend and in every card, so a reader never has to tell two
   schools apart by colour alone. */

export const SCHOOL_TYPES = [
	{ label: 'Kindergarten', light: '#c98a12', dark: '#e2a93a' },
	{ label: 'Elementary', light: '#8b1e1a', dark: '#e0604c' },
	{ label: 'High school', light: '#1f63a8', dark: '#5ea0e6' },
	{ label: 'College or university', light: '#6b3fa0', dark: '#a985d8' },
	{ label: 'Madrasah or Islamic school', light: '#1d7f52', dark: '#4fbf87' },
	{ label: 'Other school', light: '#6f6a60', dark: '#a8a296' },
] as const

export type SchoolType = (typeof SCHOOL_TYPES)[number]['label']

export const MANAGEMENT = ['Public', 'Private', 'Not stated'] as const
export type Management = (typeof MANAGEMENT)[number]

export const typeColour = (type: string, dark = false) => {
	const t = SCHOOL_TYPES.find((x) => x.label === type) ?? SCHOOL_TYPES.at(-1)!
	return dark ? t.dark : t.light
}

/** What the map and its panel know of a school. It travels to the browser, so it is kept small. */
export type MapSchool = {
	id: string
	name: string
	type: string
	level: string
	management: string
	area: string
	areaName: string
	townName: string
	pupils: number | null
	exact: boolean
	lat: number
	lon: number
	image: { url: string; author: string; license: string; page: string } | null
}
