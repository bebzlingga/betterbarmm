'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { peso, type Project } from '@betterbarmm/budget-data'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterMenu } from './filter-menu'
import { useCarriedYear } from './year-link'
import { useEffect, useMemo, useState } from 'react'

/* ============================================================
   The 258 named projects, searchable by the place they are in

   This is the page an ordinary reader came for, and the search
   that matters is not "roads" — it is the name of their own
   barangay. The Act writes each project as a sentence with the
   place inside it ("Construction of Road at Brgy. Langil, Hadji
   Mohammad Ajul"), so a plain substring search over that sentence
   finds a municipality and a barangay alike without any of it
   having to be parsed out into fields that would be wrong a tenth
   of the time.

   The two filters are the coarse cut; the field is the fine one.
   They are checkboxes in a menu rather than chips in a row (user
   decision), which buys the thing chips could not do here: the
   chips each wrote their own label into the search box, so a
   reader could hold exactly one of them at a time and "every
   bridge in Maguindanao" was not a question the page could be
   asked. Several boxes can be ticked at once, and the text field
   goes back to being only a text field.
   ============================================================ */

const PAGE = 50


export function ProjectBrowser({
	projects,
	areas,
	kinds,
	fiscalYear,
}: {
	projects: Project[]
	areas: { province: string; count: number; total: number }[]
	/** What is being built — "Road", "Bridge", "Water System". */
	kinds: { kind: string; count: number; total: number }[]
	/** Named in the empty state, so it says which Act found nothing. Passed in
	    rather than read from the data module: this runs in the browser, and
	    importing a year's figures to print its number would put both Acts in
	    the bundle. */
	fiscalYear: number
}) {
	const router = useRouter()
	const params = useSearchParams()
	const fy = useCarriedYear()
	const [query, setQuery] = useState(params.get('q') ?? '')
	const [pickedAreas, setPickedAreas] = useState<Set<string>>(new Set())
	const [pickedKinds, setPickedKinds] = useState<Set<string>>(new Set())
	const [shownCount, setShownCount] = useState(PAGE)

	/* Toggling returns a new Set rather than mutating the old one: React compares
	   by reference, and a mutated Set is the same reference, so the list would
	   not re-render. */
	const toggle = (setter: typeof setPickedAreas) => (value: string) => {
		setter((current) => {
			const next = new Set(current)
			if (next.has(value)) next.delete(value)
			else next.add(value)
			return next
		})
		setShownCount(PAGE)
	}

	useEffect(() => {
		const id = setTimeout(() => {
			/* Both parameters, not just the one being typed. This rewrites the
			   whole query string, so building it from `q` alone dropped the
			   reader's `?fy=` and sent them back to the current year on the first
			   keystroke. */
			const next = new URLSearchParams()
			if (query.trim()) next.set('q', query.trim())
			if (fy) next.set('fy', fy)
			const search = next.toString()
			router.replace(`/projects${search ? `?${search}` : ''}`, { scroll: false })
		}, 250)
		return () => clearTimeout(id)
	}, [query, fy, router])

	const hits = useMemo(() => {
		const term = query.trim().toLowerCase()
		// An empty filter means "all", not "none" — so each clause passes when
		// nothing in it is ticked.
		return projects.filter((project) => {
			if (pickedAreas.size > 0 && !pickedAreas.has(project.province)) return false
			// A project can be several things at once (a road with a bridge on it),
			// so any tick it matches is enough.
			if (pickedKinds.size > 0 && !project.kinds.some((kind) => pickedKinds.has(kind))) return false
			if (!term) return true
			return (
				project.project.toLowerCase().includes(term) ||
				project.province.toLowerCase().includes(term) ||
				project.kinds.some((kind) => kind.toLowerCase().includes(term))
			)
		})
	}, [projects, query, pickedAreas, pickedKinds])

	const shown = hits.slice(0, shownCount)
	const found = hits.reduce((sum, project) => sum + project.amount, 0)

	return (
		<div>
			<div className='flex flex-col gap-5 pb-6 lg:flex-row lg:items-center lg:justify-between'>
				<label className='finder-field w-full lg:max-w-xl'>
					<MagnifyingGlassIcon className='size-4 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
					<span className='sr-only'>Search projects</span>
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value)
							setShownCount(PAGE)
						}}
						type='search'
						autoComplete='off'
						spellCheck={false}
						placeholder='Your barangay, your town, “bridge”, “school building”…'
						className='min-w-0 flex-1 bg-transparent text-[14.5px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)] [&::-webkit-search-cancel-button]:hidden'
					/>
				</label>

				{/* Where and what, as two menus on one row. They are different
				    questions — a reader asking for every bridge is not narrowing a
				    province, they are ignoring provinces — and now they can be asked
				    together, which two rows of single-select chips could not do. */}
				<div className='flex shrink-0 flex-wrap items-center gap-2'>
					<FilterMenu
						label='Area'
						options={areas.map((area) => ({ value: area.province, count: area.count }))}
						selected={pickedAreas}
						onToggle={toggle(setPickedAreas)}
						onClear={() => {
							setPickedAreas(new Set())
							setShownCount(PAGE)
						}}
					/>

					<FilterMenu
						label='What is built'
						options={kinds.map((one) => ({ value: one.kind, count: one.count }))}
						selected={pickedKinds}
						onToggle={toggle(setPickedKinds)}
						onClear={() => {
							setPickedKinds(new Set())
							setShownCount(PAGE)
						}}
					/>
				</div>
			</div>

			<p
				aria-live='polite'
				className='mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]'
			>
				<span className='money text-[var(--ink)]'>{hits.length}</span> of {projects.length} projects
				· <span className='money text-[var(--brass)]'>{peso(found)}</span>
			</p>

			<div className='mt-3'>
				{shown.map((project) => (
					<article
						key={project.id}
						className='grid items-center gap-x-10 gap-y-2 border-t border-[var(--rule)] py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,9rem)]'
					>
						<div className='min-w-0'>
							<p className='bb-label'>
								{project.province}
								{project.kinds.length ? ` · ${project.kinds.join(', ')}` : ''}
							</p>
							{/* +2px, and held to nine tenths of its cell: the Act writes a project as
							    a whole sentence, so at the larger size the longest of them ran
							    right up to the amount beside it. */}
							<h2 className='mt-2.5 text-[16.5px] font-medium leading-relaxed text-[var(--ink)] lg:max-w-[90%]'>
								{project.project}
							</h2>
						</div>

						<p
							className='money text-[15px] font-bold tracking-[-0.02em] text-[var(--ink)] lg:text-right'
						>
							{peso(project.amount)}
						</p>
					</article>
				))}

				{hits.length === 0 ? (
					<p className='border-t border-[var(--rule)] py-16 text-center text-[13.5px] leading-7 text-[var(--ink-3)]'>
						Nothing in the FY {fiscalYear} list is in “{query.trim()}”. That may simply mean
						no project there was funded this year — this is one year of one ministry&rsquo;s
						construction, not every public work in the region. Spellings also vary: try the
						barangay without “Brgy.”, or just the town.
					</p>
				) : null}
			</div>

			{shownCount < hits.length ? (
				/* Centerd: it is the one control under a column of 50 rows, and ranged
				   left it read as the start of another row rather than as the end of
				   the list. `bb-btn` is inline-flex, so the centring goes on a wrapper
				   — `mx-auto` on the button itself would do nothing. */
				<div className='mt-8 flex justify-center'>
					<button
						type='button'
						onClick={() => setShownCount((current) => current + PAGE * 2)}
						className='bb-btn bb-btn-ghost'
					>
						Show the remaining {hits.length - shownCount}
					</button>
				</div>
			) : null}
		</div>
	)
}
