import booksData from '../../../../datasets/library/books.json'
import authorsData from '../../../../datasets/library/authors.json'
import publishersData from '../../../../datasets/library/publishers.json'
import magazinesData from '../../../../datasets/library/magazines.json'

/* ============================================================
   A library of the Bangsamoro

   Four records, kept in datasets/library and read whole here:

     · the books: every book we have found about the Bangsamoro and
       its peoples, with where each can be bought, borrowed or read;
     · the authors, each with a short life;
     · the publishers, each with what it is and where;
     · the magazines, newsletters and reports the region's own
       offices put out, issue by issue where we have found them.
   ============================================================ */

export type Link = { label: string; url: string }

export type Availability = 'for-sale' | 'open-access' | 'library' | 'private'

export type Book = {
	slug: string
	title: string
	subtitle?: string | null
	/** Slugs into the authors record. */
	authors: string[]
	/** How the named people stand to the book. */
	role?: 'author' | 'editor' | 'translator' | 'compiler'
	/** Slug into the publishers record. */
	publisher: string
	year: number
	/** A later edition worth knowing about. */
	edition?: string | null
	pages?: number | null
	isbn?: string | null
	language: string
	kind: string
	subjects: string[]
	/** What the book is about, in our words: a sentence or two. */
	summary: string
	/** The publisher's or a reader's longer description, from Open Library, where it has one. */
	blurb?: string | null
	/** A longer account of the book, in paragraphs split by a blank line, from the sources it lists. */
	overview?: string | null
	overviewSources?: string[] | null
	cover?: { file: string; source: string; url: string } | null
	availability: Availability
	/** Where to get it: the first link is the one the shelf shows. */
	links: Link[]
	note?: string | null
}

export type Author = {
	slug: string
	name: string
	/** Surname first, for sorting. */
	sort: string
	bio: string
	born?: string | null
	died?: string | null
	from?: string | null
	roles: string[]
	/** Born in the region or made their life and work there. */
	local?: 'bangsamoro' | 'mindanao' | null
	photo?: { file: string; source: string; url: string; author?: string; license?: string } | null
	links: Link[]
}

export type Publisher = {
	slug: string
	name: string
	kind: string
	based: string
	founded?: number | null
	about: string
	url?: string | null
	/** A logo from the press's own site, or null for a lettered mark. */
	logo?: string | null
}

export type Issue = { label: string; date?: string | null; url: string }

export type Magazine = {
	slug: string
	title: string
	/** The office that puts it out. */
	office: string
	acronym?: string | null
	kind: string
	about: string
	since?: number | null
	frequency?: string | null
	url?: string | null
	cover?: { file: string; source: string; url: string } | null
	issues: Issue[]
}

export const books = (booksData as { books: Book[] }).books
export const authors = (authorsData as { authors: Author[] }).authors
export const publishers = (publishersData as { publishers: Publisher[] }).publishers
export const magazines = (magazinesData as { magazines: Magazine[] }).magazines

export const authorBySlug = new Map(authors.map((a) => [a.slug, a]))
export const publisherBySlug = new Map(publishers.map((p) => [p.slug, p]))
export const bookBySlug = new Map(books.map((b) => [b.slug, b]))
export const magazineBySlug = new Map(magazines.map((m) => [m.slug, m]))

export const booksBy = (author: string) => books.filter((b) => b.authors.includes(author)).sort((a, b) => a.year - b.year)
export const booksFrom = (publisher: string) => books.filter((b) => b.publisher === publisher).sort((a, b) => a.year - b.year)

/** "Cesar Adib Majul, Samuel K. Tan" or "ed. Wilfredo Magno Torres III". */
export const byline = (book: Book) => {
	const names = book.authors.map((s) => authorBySlug.get(s)?.name ?? s)
	const list = names.length > 3 ? `${names.slice(0, 3).join(', ')} and others` : names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0] ?? publisherBySlug.get(book.publisher)?.name ?? ''
	const role = book.role === 'editor' ? (names.length > 1 ? 'eds. ' : 'ed. ') : book.role === 'translator' ? 'tr. ' : book.role === 'compiler' ? 'comp. ' : ''
	return role + list
}

export const AVAILABILITY: Record<Availability, { label: string; short: string; note: string }> = {
	'for-sale': { label: 'In print', short: 'Buy', note: 'Still in print: the link goes to a shop that sells it.' },
	'open-access': { label: 'Free to read', short: 'Read free', note: 'Published free: the link opens the whole book.' },
	library: { label: 'Out of print', short: 'Find a copy', note: 'No longer sold new: look for it in a library, or for a used copy.' },
	private: { label: 'Self-published', short: 'From the author', note: 'Printed by the author or a very small press, sold direct or on demand: the link goes to where they offer it.' },
}

export const SUBJECTS: Record<string, string> = {
	history: 'History',
	'colonial-period': 'Colonial period',
	'peace-process': 'Peace process',
	conflict: 'War and conflict',
	politics: 'Politics and governance',
	culture: 'Culture and arts',
	literature: 'Literature',
	religion: 'Islam and religion',
	anthropology: 'Peoples and ways of life',
	economy: 'Economy and development',
	memoir: 'Memoir and biography',
	language: 'Language',
	education: 'Education',
	women: 'Women',
	children: 'For children',
	reference: 'Reference',
}

export const subjectName = (s: string) => SUBJECTS[s] ?? s

/** The subjects that have books, largest shelf first. */
export const subjects = Object.keys(SUBJECTS)
	.map((slug) => ({ slug, name: SUBJECTS[slug]!, count: books.filter((b) => b.subjects.includes(slug)).length }))
	.filter((s) => s.count)
	.sort((a, b) => b.count - a.count)

export const coverSrc = (book: Pick<Book, 'cover'>) => (book.cover ? `/covers/${book.cover.file}` : null)

const fold = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()

/** Title, subtitle, author, publisher or year. */
export const matches = (book: Book, q: string) => {
	const hay = fold([book.title, book.subtitle ?? '', byline(book), publisherBySlug.get(book.publisher)?.name ?? '', String(book.year), book.isbn ?? ''].join(' '))
	return fold(q)
		.split(/\s+/)
		.filter(Boolean)
		.every((w) => hay.includes(w))
}

export const decade = (year: number) => `${Math.floor(year / 10) * 10}s`

export const LOCAL_LABEL = { bangsamoro: 'From the Bangsamoro', mindanao: 'From Mindanao' } as const

/** Writers from the region itself, Bangsamoro first. */
export const localAuthors = authors.filter((a) => a.local).sort((a, b) => (a.local === b.local ? a.sort.localeCompare(b.sort) : a.local === 'bangsamoro' ? -1 : 1))

/** A book with at least one author from the region. */
export const isLocal = (book: Book) => book.authors.some((s) => authorBySlug.get(s)?.local)
