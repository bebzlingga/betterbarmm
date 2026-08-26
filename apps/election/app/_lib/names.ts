/**
 * A person's name, set the way the page sets every other name.
 *
 * The two candidate lists arrive in two different shapes. The regional
 * certified list gives sectoral nominees in ordinary case — "Muhammad Nadzir
 * Saludin Ebil" — while the district filings come through in the capitals a
 * COMELEC form is filled out in: "ABRAR JAINUDDIN HATAMAN". Printed side by
 * side, a hundred district filers shout at thirty sectoral ones, and the
 * difference reads as emphasis rather than as what it is, which is two
 * clerks' keyboards.
 *
 * So the record keeps what was reported and the page prints it consistently.
 * A name that already carries lower-case letters is left exactly as it came:
 * whoever typed "de los Santos" or "bin Ahmad" meant it, and re-casing a name
 * that was already cased is how a project like this starts inventing spellings.
 */

/** Suffixes and particles that are not simply Capitalised. */
const ROMAN = /^(II|III|IV|V|VI)\.?$/i
const LOWER_PARTICLES = new Set(['bin', 'binti', 'al', 'bte'])

function capitalise(word: string): string {
	if (word.length === 0) return word

	// An initial keeps its stop and its capital: "P." stays "P.".
	if (/^[A-Za-z]\.?$/.test(word)) return word.toUpperCase()

	// Suffixes: "JR." → "Jr.", "III" stays "III".
	if (ROMAN.test(word)) return word.toUpperCase()

	const lower = word.toLowerCase()

	// Names hyphenated or apostrophised carry a capital on each part —
	// "NUR-JAMIL" → "Nur-Jamil", "D'SOUZA" → "D'Souza".
	if (/[-']/.test(lower)) {
		return lower
			.split(/([-'])/)
			.map((part) => (part === '-' || part === "'" ? part : capitalise(part)))
			.join('')
	}

	if (LOWER_PARTICLES.has(lower)) return lower

	return lower.charAt(0).toUpperCase() + lower.slice(1)
}

export function displayName(name: string): string {
	if (!name) return name

	// Already cased by whoever entered it. Leave it alone.
	if (/[a-z]/.test(name)) return name.trim()

	return name
		.trim()
		.split(/\s+/)
		.map(capitalise)
		.join(' ')
}
