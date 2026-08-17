/**
 * The six record classes the Bangsamoro Parliament publishes.
 *
 * This list is the spine of the app: navigation, the hub grid, and each
 * category route all read from it, so adding a dataset is a one-line
 * status flip here plus a loader in `legislation-data.ts`.
 */

export type CategorySlug =
	| 'acts'
	| 'bills'
	| 'resolutions'
	| 'adopted-resolutions'
	| 'proposed-resolutions'
	| 'journal'
	| 'irr'

export type CategoryDefinition = {
	slug: CategorySlug
	href: string
	/** Short label for navigation and chips. */
	label: string
	/** The Parliament's own name for the class. */
	officialLabel: string
	/** Prefix shown on each record, e.g. "BAA 89". */
	abbreviation: string
	/** One line, plain language: what this class of document actually is. */
	blurb: string
	/** Longer framing for the category page header. */
	description: string
	/** Where the records come from. */
	sourceUrl: string
	/** `live` = dataset loaded; `pending` = route exists, data not compiled yet. */
	status: 'live' | 'pending'
}

export const categories: CategoryDefinition[] = [
	{
		slug: 'acts',
		href: '/acts',
		label: 'Autonomy Acts',
		officialLabel: 'Bangsamoro Autonomy Acts',
		abbreviation: 'BAA',
		blurb: 'Bills that made it all the way through — these are the region’s laws.',
		description:
			'A Bangsamoro Autonomy Act is a bill that passed all three readings and was signed into law. Every act here carries its official title, date, authors, source documents, and a plain-language summary of what it changes.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/baa-new/',
		status: 'live',
	},
	{
		slug: 'bills',
		href: '/bills',
		label: 'Bills',
		officialLabel: 'Bills',
		abbreviation: 'Bill',
		blurb: 'Proposed laws still moving through Parliament — not yet in force.',
		description:
			'A bill is a proposed law under consideration. It moves through first reading, committee study, second reading, and third reading before it can become a Bangsamoro Autonomy Act. Tracking bills shows what Parliament is working on right now, and what stalled.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/bills/',
		status: 'live',
	},
	{
		slug: 'resolutions',
		href: '/resolutions',
		label: 'Resolutions',
		officialLabel: 'Resolutions',
		abbreviation: 'Res.',
		blurb: 'Parliament’s formal positions — adopted and still pending, in one list.',
		description:
			'Resolutions express the will of Parliament — commending, urging, inquiring, or setting internal rules — without creating law the way an act does. Parliament publishes the adopted ones and the pending ones as two indexes; they are read together here, and the filters split them again.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/adopted-resolutions/',
		status: 'live',
	},
	{
		slug: 'journal',
		href: '/journal',
		label: 'Journal',
		officialLabel: 'Journal',
		abbreviation: 'J',
		blurb: 'The official minutes — who showed up, what was said, how they voted.',
		description:
			'The Journal is Parliament’s official record of each session: attendance, motions, debate, and voting. It is the primary source for holding members accountable to what they actually did on the floor.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/journal/',
		status: 'pending',
	},
	{
		slug: 'irr',
		href: '/irr',
		label: 'Implementing Rules',
		officialLabel: 'Implementing Rules and Regulations',
		abbreviation: 'IRR',
		blurb: 'The fine print that decides how a law actually works in practice.',
		description:
			'An IRR translates a passed act into operational rules — who administers it, what the deadlines are, how money moves. A law’s real-world effect usually lives here rather than in the act itself.',
		sourceUrl:
			'https://officialgazette.bangsamoro.gov.ph/category/bangsamoro-autonomy-acts-irrs/',
		status: 'pending',
	},
]

/**
 * The two lists Parliament publishes separately.
 *
 * To a reader a resolution is a resolution, adopted or not, so the two are
 * read as one category and neither appears on its own in navigation. Their
 * definitions stay here because every record still knows which list it came
 * from — that is what the adopted/proposed filter narrows on — and both point
 * at the merged page so any link built from a category lands in the right
 * place.
 */
const sourceCategories: CategoryDefinition[] = [
	{
		slug: 'adopted-resolutions',
		href: '/resolutions',
		label: 'Adopted Resolutions',
		officialLabel: 'Adopted Resolutions',
		abbreviation: 'Res.',
		blurb: 'Formal positions Parliament has already voted to adopt.',
		description:
			'Resolutions express the will of Parliament — commending, urging, inquiring, or setting internal rules — without creating law the way an act does. Adopted resolutions have cleared a vote.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/adopted-resolutions/',
		status: 'live',
	},
	{
		slug: 'proposed-resolutions',
		href: '/resolutions',
		label: 'Proposed Resolutions',
		officialLabel: 'Proposed Resolutions',
		abbreviation: 'Res.',
		blurb: 'Resolutions filed and pending — the debate hasn’t closed yet.',
		description:
			'Proposed resolutions have been filed by members but not yet adopted. They signal what issues members are raising, including inquiries into executive conduct and calls for action on regional concerns.',
		sourceUrl: 'https://parliament.bangsamoro.gov.ph/proposed-resolutions/',
		status: 'live',
	},
]

export const categoryBySlug = new Map(
	[...categories, ...sourceCategories].map((item) => [item.slug, item]),
)

export function getCategory(slug: CategorySlug): CategoryDefinition {
	const category = categoryBySlug.get(slug)

	if (!category) {
		throw new Error(`Unknown legislation category: ${slug}`)
	}

	return category
}
