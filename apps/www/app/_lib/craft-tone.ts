/** A photo's dominant hue and saturation (worked out offline from the Commons thumbnail), or null for a grey one. */
export type Tone = [hue: number, saturation: number] | null

// The house brown, for a photo with no colour to speak of.
const HOUSE: [number, number] = [18, 0.4]

/** The craft card's colours from one photo: its hue at fixed lightness, so cream text on the panel always reads. */
export function toneVars(tone: Tone | undefined): Record<string, string> {
	const [h, raw] = tone ?? HOUSE
	const s = Math.min(0.55, Math.max(0.22, raw)) * 100
	return {
		'--tone-glow': `hsl(${h} ${s}% 46%)`,
		'--tone-panel': `hsl(${h} ${s}% 33%)`,
		'--tone-edge': `hsl(${h} ${s}% 26%)`,
		'--tone-out-l': `hsl(${h} ${s * 0.9}% 19%)`,
		'--tone-out-r': `hsl(${h} ${s * 0.8}% 44%)`,
		'--tone-paper': `hsl(${h} 35% 94%)`,
	}
}
