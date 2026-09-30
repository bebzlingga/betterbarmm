'use client'

import { CaretDownIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import {
	LanguageToggle,
	say,
	sayAll,
	useLang,
	type Text,
	type Texts,
} from '@betterbarmm/editorial'
import { createContext, useContext, useMemo, useState } from 'react'

export type FaqEntry = {
	group: Text
	q: Text
	/** The answer in the words somebody would use out loud. */
	a: Text
	/** What this does cover. */
	pays?: Texts
	/** What it does not, which is usually the confusing half. */
	notPays?: Texts
	/** One concrete case, because a definition is easier to check against one. */
	example?: Text
	/** The Act's own figure for it, where there is one. Not translated — it is
	    a peso amount and a fiscal year in both languages. */
	figure?: string
	/** Words somebody might search that the answer does not contain. Both
	    languages at once, so "sahod" finds the salary answer while reading
	    English and "salary" finds it while reading Filipino. */
	keywords?: string
}

const QueryContext = createContext<{
	query: string
	setQuery: (query: string) => void
	entries: FaqEntry[]
}>({ query: '', setQuery: () => {}, entries: [] })

/**
 * Holds the query, so the field and the list can sit apart.
 *
 * The search belongs in the head — it is the first thing a reader wants and
 * the head is where they are looking — and the list belongs on the page under
 * it. Those are two different components in two different bands, so the state
 * they share cannot live in either.
 */
export function FaqSearchProvider({
	entries,
	children,
}: {
	entries: FaqEntry[]
	children: React.ReactNode
}) {
	const [query, setQuery] = useState('')
	return (
		<QueryContext.Provider value={{ query, setQuery, entries }}>{children}</QueryContext.Provider>
	)
}

/** The field itself, for the masthead. */
export function FaqSearch() {
	const { query, setQuery, entries } = useContext(QueryContext)
	const { lang } = useLang()
	const found = useMemo(() => match(entries, query).length, [entries, query])

	return (
		<label className='mx-auto mt-9 flex max-w-[34rem] items-center gap-3 border border-[var(--rule)] bg-[var(--paper)]/10 px-4 py-3 text-left backdrop-blur-sm focus-within:border-[var(--ink)]'>
			<MagnifyingGlassIcon
				className='size-4 shrink-0 text-[var(--ink-3)]'
				aria-hidden='true'
				weight='bold'
			/>
			<span className='sr-only'>Search the questions</span>
			<input
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				type='search'
				autoComplete='off'
				spellCheck={false}
				placeholder={
					lang === 'fil'
						? 'Maghanap — “ambulansya”, “bonus”…'
						: 'Search — “ambulance”, “bonus”, “who approves”…'
				}
				className='min-w-0 flex-1 bg-transparent text-[14.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
			/>
			<span className='num shrink-0 font-mono text-[11px] font-semibold text-[var(--ink-3)]'>
				{query ? `${found}/${entries.length}` : entries.length}
			</span>
			<LanguageToggle className='shrink-0' />
		</label>
	)
}

/** Both languages in the haystack, not just the one being read. */
function match(entries: FaqEntry[], query: string): FaqEntry[] {
	const q = query.trim().toLowerCase()
	if (!q) return entries
	const terms = q.split(/\s+/)
	return entries.filter((entry) => {
		const hay = [
			entry.q.en,
			entry.q.fil,
			entry.a.en,
			entry.a.fil,
			entry.example?.en ?? '',
			entry.example?.fil ?? '',
			entry.keywords ?? '',
			...(entry.pays?.en ?? []),
			...(entry.pays?.fil ?? []),
			...(entry.notPays?.en ?? []),
			...(entry.notPays?.fil ?? []),
		]
			.join(' ')
			.toLowerCase()
		return terms.every((term) => hay.includes(term))
	})
}

/**
 * Every question, filterable.
 *
 * A glossary is only used twice: once end to end by somebody learning the
 * vocabulary, and a hundred times by somebody who met one word on another page
 * and wants that word. The filter is for the second reader, which is most of
 * them, so it matches the answer and the examples as well as the question —
 * "ambulance" is in none of the headings and is the fastest way to the
 * difference between MOOE and capital outlay.
 *
 * Collapsed to the questions, on native `details` rather than state. A browser
 * will open a `details` to show a find-in-page hit inside it, which is the one
 * thing a hand-rolled accordion silently takes away — and it still opens for a
 * reader with no JavaScript at all.
 *
 * A search opens every match. Filtering to four questions and leaving all four
 * shut is asking the reader to click through the answer they just described.
 *
 * Set on a reading column rather than the full page width. These are sentences
 * to read, not figures to scan across, and prose stops being work somewhere
 * short of the full measure — though the covers/does-not table wants room for
 * a sentence beside its yes, which is what holds the floor here.
 */
export function FaqList() {
	const { query, entries } = useContext(QueryContext)
	const { lang } = useLang()

	const shown = useMemo(() => match(entries, query), [entries, query])

	const groups = useMemo(() => {
		const out: { title: string; items: FaqEntry[] }[] = []
		for (const entry of shown) {
			const title = say(entry.group, lang)
			const last = out[out.length - 1]
			if (last?.title === title) last.items.push(entry)
			else out.push({ title, items: [entry] })
		}
		return out
	}, [shown, lang])

	return (
		<div className='mx-auto max-w-[54rem]'>
			{groups.map((group) => (
				<section key={group.title} className='mt-16 first:mt-2'>
					{/* A heading, not a label — `bb-label` is the mark that sits over a
					    column of figures and read as a caption on the first question
					    rather than as the start of a group. Set at 18px rather than the
					    display scale: it has to out-rank the questions under it, which
					    are 15.5, and nothing more. */}
					<h2 className='border-b-2 border-[var(--accent)] pb-3 text-[18px] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>
						{group.title}
					</h2>

					<div className='mt-2'>
						{group.items.map((entry) => (
							<details
								key={entry.q.en}
								open={query.trim().length > 0}
								className='group border-b border-[var(--rule-soft)]'
							>
								<summary className='flex cursor-pointer list-none items-start justify-between gap-5 py-7 transition-colors duration-150 hover:text-[var(--accent)]'>
									<span className='text-[15.5px] font-semibold leading-snug tracking-[-0.015em] text-[var(--ink)] group-hover:text-[var(--accent)]'>
										{say(entry.q, lang)}
									</span>
									<CaretDownIcon
										aria-hidden='true'
										weight='bold'
										className='mt-1 size-3.5 shrink-0 text-[var(--ink-3)] transition-transform duration-300 group-open:rotate-180'
									/>
								</summary>

								<div className='pb-9'>
									<p className='max-w-3xl text-[16px] leading-[1.7] text-[var(--ink-2)]'>{say(entry.a, lang)}</p>

									{entry.pays || entry.notPays ? (
										/* One row an item, not two columns of pairs. The two lists are
										   different lengths and nothing in the sixth "yes" answers the
										   fourth "no" — set side by side as a grid they would read as
										   pairs and invent a correspondence that is not there. */
										<table className='mt-6 w-full border-collapse text-left'>
											<caption className='sr-only'>
												{lang === 'fil'
													? 'Kasama at hindi kasama'
													: 'What this covers and what it does not'}
											</caption>
											<tbody>
												{sayAll(entry.pays, lang).map((item) => (
													<tr key={item} className='border-b border-[var(--rule-soft)]'>
														<td className='w-14 py-3 pr-4 align-top'>
															<span className='inline-flex items-center justify-center bg-[var(--accent)] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white'>
																{lang === 'fil' ? 'Oo' : 'Yes'}
															</span>
														</td>
														<td className='py-3 text-[14.5px] leading-[1.65] text-[var(--ink-2)]'>
															{item}
														</td>
													</tr>
												))}
												{sayAll(entry.notPays, lang).map((item) => (
													<tr key={item} className='border-b border-[var(--rule-soft)]'>
														<td className='w-14 py-3 pr-4 align-top'>
															<span className='inline-flex items-center justify-center border border-[var(--rule)] px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[var(--ink-3)]'>
																{lang === 'fil' ? 'Hindi' : 'No'}
															</span>
														</td>
														<td className='py-3 text-[14.5px] leading-[1.65] text-[var(--ink-3)]'>
															{item}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									) : null}

									{/* The same block the process page gives its "why this matters"
									    note: accent edge, tinted ground, a mono label above it. An
									    example is doing the same job there and should not look like a
									    different kind of thing here. */}
									{entry.example ? (
										<div className='mt-6 max-w-3xl border-l-2 border-[var(--accent)] bg-[var(--paper-2)] px-6 py-5'>
											<p className='font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]'>
												{lang === 'fil' ? 'Halimbawa' : 'For example'}
											</p>
											<p className='mt-3 text-[14.5px] leading-[1.7] text-[var(--ink-2)]'>
												{say(entry.example, lang)}
											</p>
										</div>
									) : null}

									{entry.figure ? (
										<p className='num mt-4 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--brass)]'>
											{entry.figure}
										</p>
									) : null}
								</div>
							</details>
						))}
					</div>
				</section>
			))}

			{shown.length === 0 ? (
				<p className='py-16 text-center text-[14px] text-[var(--ink-3)]'>
					{lang === 'fil'
						? `Walang tumutugma sa “${query.trim()}”. Subukan ang mas simpleng salita.`
						: `Nothing here matches “${query.trim()}”. Try a plainer word — the answers are written in them.`}
				</p>
			) : null}
		</div>
	)
}
