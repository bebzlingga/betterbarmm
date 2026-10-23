/* What the preparedness map's browser code needs: the hazards, their classes and
   colours, and the area names. Nothing here reads a dataset, so a client component
   can import it without pulling the region's exposure into the browser. */

export type HazardId = 'flood' | 'landslide' | 'surge'

export const HAZARDS: { id: HazardId; label: string; scenario: string; classes: [string, string, string]; note: string }[] = [
	{
		id: 'flood',
		label: 'Flood',
		scenario: 'a 100-year rain',
		classes: ['Knee-deep or less', 'Knee to neck', 'Above the neck, or fast water'],
		note: 'Flood depth and speed in a rain heavy enough to come once in 100 years. NOAH has no flood model for Tawi-Tawi.',
	},
	{
		id: 'landslide',
		label: 'Landslide',
		scenario: 'unstable slopes and debris flows',
		classes: ['Build only with monitoring', 'Build only with slope protection', 'No dwelling zone'],
		note: 'Shallow and structurally controlled landslides, and the paths of debris flows.',
	},
	{
		id: 'surge',
		label: 'Storm surge',
		scenario: 'Storm Surge Advisory 4, a surge above 4 m',
		classes: ['Knee-deep or less', 'Knee to neck', 'Above the neck, or fast water'],
		note: 'The worst of PAGASA’s four storm surge advisory levels, for the coasts it reaches.',
	},
]

/** NOAH's own colours for its three classes: yellow, orange, red. */
export const CLASS_COLORS = ['#f2c94c', '#f08c2e', '#d43a2f'] as const
export const CLASS_LABELS = ['Low', 'Medium', 'High'] as const

export const PROVINCE_NAMES: Record<string, string> = {
	basilan: 'Basilan',
	'lanao-del-sur': 'Lanao del Sur',
	'maguindanao-del-norte': 'Maguindanao del Norte',
	'maguindanao-del-sur': 'Maguindanao del Sur',
	'tawi-tawi': 'Tawi-Tawi',
	'cotabato-city': 'Cotabato City',
	'special-geographic-area': 'Special Geographic Area',
}
