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

/** A suffix that belongs after the surname, however the form was filled in. */
const SUFFIX = /^(jr|sr|ii|iii|iv|v|vi)\.?$/i

/** Particles that belong to the surname rather than standing as a middle name. */
const PARTICLES = new Set(['de', 'del', 'dela', 'delos', 'los', 'da', 'van', 'von', 'bin', 'binti', 'al', 'bte'])

/**
 * The middle name as an initial — but only where there is exactly one of them.
 *
 * The lists print the same person three ways: "HABBAS SABPA CAMENDAN" from a
 * COMELEC form, "Susana Salvador Anayatin" from the certified list, "BADRUDIN
 * S. MAMAD" from a filing where the clerk abbreviated. Set in one column they
 * read as three different conventions rather than as a roster, and the middle
 * name is the part that varies — nobody is looking a candidate up by it.
 *
 * One middle word only. Beyond that the shapes stop being reliable: "Mary Ann
 * Madroño Arnado" carries a two-word given name, "Dayang Rajsidana K.
 * Amilbangsa" opens on a title, and "USMAN JR M. SARANGANI" has a suffix
 * filed in the middle of the name. A rule that initialised every inside word
 * would turn the first into "Mary A. M. Arnado" and the second into someone
 * else entirely. A name this workspace cannot read confidently is printed as
 * it was reported, which is the same rule the casing follows.
 */
function abbreviateMiddle(words: string[]): string[] {
	const suffixes: string[] = []
	const core = [...words]
	while (core.length > 0 && SUFFIX.test(core[core.length - 1])) {
		suffixes.unshift(core.pop() as string)
	}

	if (core.length !== 3) return [...core, ...suffixes]

	const [given, middle, surname] = core

	// Already an initial, a particle of the surname, or too short to be a name
	// in its own right — all left exactly as they were reported.
	if (/^[A-Za-z]\.?$/.test(middle)) return [...core, ...suffixes]
	if (PARTICLES.has(middle.toLowerCase())) return [...core, ...suffixes]

	return [given, `${middle.charAt(0).toUpperCase()}.`, surname, ...suffixes]
}

export function displayName(name: string): string {
	if (!name) return name

	const trimmed = name.trim()

	// A name written in the comma order — "Ampatuan, Baintan A." — is already
	// abbreviated by whoever filed it, and re-cutting it risks reading the
	// surname as a given name.
	if (trimmed.includes(',')) return trimmed

	// Already cased by whoever entered it: the casing is left alone, but the
	// middle name is still brought to the roster's one shape.
	const words = /[a-z]/.test(trimmed)
		? trimmed.split(/\s+/)
		: trimmed.split(/\s+/).map(capitalise)

	return abbreviateMiddle(words).join(' ')
}
