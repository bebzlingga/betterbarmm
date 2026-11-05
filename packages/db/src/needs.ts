/* No imports: the form that posts a need runs in the browser and takes these from `@betterbarmm/db/needs`. */

/* ---- What schools need -------------------------------------------------- */

/** What a school can post that it needs, in the order the form offers them. */
export const NEED_KINDS = [
	{ value: 'classrooms', label: 'Classrooms' },
	{ value: 'seats', label: 'Chairs and desks' },
	{ value: 'books', label: 'Books and learning materials' },
	{ value: 'teachers', label: 'Teachers' },
	{ value: 'water', label: 'Water' },
	{ value: 'electricity', label: 'Electricity' },
	{ value: 'toilets', label: 'Toilets' },
	{ value: 'internet', label: 'Devices and internet' },
	{ value: 'repairs', label: 'Repairs' },
	{ value: 'supplies', label: 'School supplies' },
	{ value: 'other', label: 'Something else' },
] as const

export type NeedKind = (typeof NEED_KINDS)[number]['value']

/** Who is posting. */
export const NEED_POSTERS = [
	{ value: 'teacher', label: 'A teacher' },
	{ value: 'school_head', label: 'The school head' },
	{ value: 'student', label: 'A student' },
	{ value: 'parent', label: 'A parent' },
	{ value: 'community', label: 'Someone in the community' },
] as const

export type NeedPoster = (typeof NEED_POSTERS)[number]['value']

export const needKindLabel = (value: string) => NEED_KINDS.find((k) => k.value === value)?.label ?? value
export const needPosterLabel = (value: string) => NEED_POSTERS.find((p) => p.value === value)?.label ?? value

/** A need as the public may see it: no contact detail. */
export type SchoolNeed = {
	id: string
	school_id: string
	school_name: string
	area: string
	town: string
	town_name: string
	kind: NeedKind
	poster: NeedPoster
	title: string
	details: string
	quantity: number | null
	status: 'new' | 'approved' | 'declined' | 'met'
	note: string
	reviewed_at: string | null
	met_at: string | null
	created_at: string
}

/** A need as an editor sees it, with the contact detail and who reviewed it. */
export type SchoolNeedReview = SchoolNeed & { contact: string | null; reviewed_by_email: string }

/** The columns the anon key may read. `*` would ask for the contact detail, which it may not. */
export const PUBLIC_NEED_COLUMNS = 'id,school_id,school_name,area,town,town_name,kind,poster,title,details,quantity,status,note,reviewed_at,met_at,created_at'
