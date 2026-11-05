import type { Metadata } from 'next'
import Link from 'next/link'
import { Masthead } from '../_components/parts'
import { authors, books, magazines, publishers } from '../_lib/library'

export const metadata: Metadata = {
	title: 'Sources',
	description: 'How the library was put together, what each record comes from, and what it cannot tell you.',
}

const H2 = 'text-[1.5rem] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)]'
const P = 'mt-4 text-[0.9375rem] leading-7 text-[var(--ink-2)]'

export default function SourcesPage() {
	const covers = books.filter((b) => b.cover).length
	const free = books.filter((b) => b.availability === 'open-access').length
	return (
		<>
			<Masthead kicker='Library · Bangsamoro' name='Sources' note='A catalogue compiled by hand from library records, publishers’ pages and the offices’ own websites, and what it cannot tell you.' />
			<div className='bb-container bb-section max-w-[52rem] [&>section+section]:mt-14'>
				<section>
					<h2 className={H2}>The books</h2>
					<p className={P}>
						{books.length} books, chosen by hand: histories of the sultanates and of American and Philippine rule, the studies and reports behind the
						peace process, ethnographies of the Maranao, Maguindanaon, Tausug, Sama and Yakan, dictionaries and readers of their languages, the
						epics and folktales, and the memoirs and novels of the wars. The shelf started from a search of{' '}
						<a href='https://openlibrary.org' className='rule-link'>
							Open Library
						</a>
						, the Internet Archive’s catalogue, for every title it holds under the Bangsamoro’s peoples, places and movements, which gave the
						publishers, years, page counts and ISBNs, and {covers} of the covers. Titles it lacks were added from the publishers’ own lists and
						from the citations the books make of one another. Each summary is ours, written from the book, its publisher’s description, or
						the reviews.
					</p>
					<p className={P}>
						What it cannot tell you: whether a book is good. The shelf holds the standard works and the obscure ones alike, colonial
						officers’ memoirs beside the histories written against them, and says what each is rather than what to think of it. Every book is about the Bangsamoro, its peoples or its
						places, or is the work of a Bangsamoro writer; books about Mindanao as a whole are left out unless the Bangsamoro is their subject, as
						are articles, theses and pamphlets. Writers born in the region or elsewhere in Mindanao are marked as such on their pages.
					</p>
				</section>
				<section>
					<h2 className={H2}>Where to get each</h2>
					<p className={P}>
						Each book is marked in print, free to read, out of print, or self-published, from its publisher’s page and the booksellers’
						listings as of the date the shelf was last checked. {free} are free to read in full, from publishers who put the text online or
						from the Internet Archive’s scans of books out of copyright. A book marked in print links first to a shop that sells it, usually its
						publisher’s; an out-of-print book links to its library record on Open Library and WorldCat, which show the libraries holding it
						and, often, where used copies turn up. Prices change and shops sell out, so the links are a start, not a promise.
					</p>
				</section>
				<section>
					<h2 className={H2}>The authors and publishers</h2>
					<p className={P}>
						{authors.length} authors and {publishers.length} publishers. Where an author has a Wikipedia article, the life in brief is
						taken from its opening, under Wikipedia’s{' '}
						<a href='https://creativecommons.org/licenses/by-sa/4.0/' className='rule-link'>
							CC BY-SA licence
						</a>
						, and linked; the rest, and every publisher’s note, are ours, written from the books’ own author notes and the institutions’ pages, and
						say no more than those do.
					</p>
				</section>
				<section>
					<h2 className={H2}>The magazines</h2>
					<p className={P}>
						{magazines.length} magazines, newsletters, journals and reports, found by reading every Bangsamoro Government ministry, office and
						agency website for a publications page, and the sites of the agencies and institutes around the government. Every issue links to
						the office’s own copy; none is stored here. An office that publishes on Facebook alone, or on paper alone, is missing, and so are
						issues an office has not put online.
					</p>
				</section>
				<section>
					<h2 className={H2}>Help the shelf grow</h2>
					<p className={P}>
						A book we have missed, a cover, a better link, an author’s life:{' '}
						<Link href='https://betterbarmm.com/contribute' className='rule-link'>
							tell us
						</Link>
						. The catalogue is a set of plain files anyone can read and correct.
					</p>
				</section>
			</div>
		</>
	)
}
