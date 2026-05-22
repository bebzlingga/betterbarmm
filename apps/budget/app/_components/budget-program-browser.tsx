'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { type ProgramRow } from '../_lib/budget-view-model'
import { BudgetProgramTable } from './budget-program-table'
import { BudgetSelectField, type BudgetSelectGroup } from './budget-select-field'

interface BudgetProgramBrowserProps {
	programs: ProgramRow[]
	total: number
	label: string
	year: number
	categoryGroups: BudgetSelectGroup[]
	officeGroups: BudgetSelectGroup[]
	initialCategory?: string
	initialAgencyId?: string
	initialQuery?: string
}

function matchesFilter(value: string, selected: string) {
	return selected === '' || value === selected
}

function matchesSearch(program: ProgramRow, query: string) {
	const normalizedQuery = query.trim().toLowerCase()

	if (!normalizedQuery) return true

	return [program.program_name, program.agency_name, program.agency_id, program.category, program.source].join(' ').toLowerCase().includes(normalizedQuery)
}

function programsUrl({ year, category, agencyId, query }: { year: number; category: string; agencyId: string; query: string }) {
	const params = new URLSearchParams({ year: String(year) })

	if (category) params.set('category', category)
	if (agencyId) params.set('agency', agencyId)
	if (query.trim()) params.set('q', query.trim())

	return `/programs?${params.toString()}`
}

export function BudgetProgramBrowser({ programs, total, label, year, categoryGroups, officeGroups, initialCategory = '', initialAgencyId = '', initialQuery = '' }: BudgetProgramBrowserProps) {
	const [selectedCategory, setSelectedCategory] = useState(initialCategory)
	const [selectedAgencyId, setSelectedAgencyId] = useState(initialAgencyId)
	const [selectedQuery, setSelectedQuery] = useState(initialQuery)
	const filteredPrograms = useMemo(
		() => programs.filter((program) => matchesFilter(program.category, selectedCategory) && matchesFilter(program.agency_id, selectedAgencyId) && matchesSearch(program, selectedQuery)),
		[programs, selectedAgencyId, selectedCategory, selectedQuery],
	)

	function syncUrl() {
		window.history.replaceState(
			null,
			'',
			programsUrl({
				year,
				category: selectedCategory,
				agencyId: selectedAgencyId,
				query: selectedQuery,
			}),
		)
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		syncUrl()
	}

	function clearFilters() {
		setSelectedCategory('')
		setSelectedAgencyId('')
		setSelectedQuery('')
		window.history.replaceState(null, '', `/programs?year=${year}`)
	}

	return (
		<>
			<section className='mt-12 sm:mt-24'>
				<form
					action='/programs'
					className='grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end'
					onSubmit={handleSubmit}
				>
					<input
						type='hidden'
						name='year'
						value={year}
					/>
					<div>
						<span className='eyebrow'>Section category</span>
						<BudgetSelectField
							id='program-category-filter'
							name='category'
							value={selectedCategory}
							onChange={(event) => setSelectedCategory(event.target.value)}
							label='Section category'
							placeholder='All categories'
							groups={categoryGroups}
							wrapperClassName='mt-2'
						/>
					</div>
					<div>
						<span className='eyebrow'>Office</span>
						<BudgetSelectField
							id='program-office-filter'
							name='agency'
							value={selectedAgencyId}
							onChange={(event) => setSelectedAgencyId(event.target.value)}
							label='Office'
							placeholder='All offices'
							groups={officeGroups}
							wrapperClassName='mt-2'
						/>
					</div>
					<label className='block'>
						<span className='eyebrow'>Search</span>
						<input
							name='q'
							type='search'
							value={selectedQuery}
							onChange={(event) => setSelectedQuery(event.target.value)}
							placeholder='Program, office, or source'
							className='mt-2 h-12 w-full border border-[var(--ink)] bg-[var(--paper)] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] sm:text-[12px] sm:tracking-[0.12em]'
						/>
					</label>
					<button
						type='submit'
						className='inline-flex h-12 w-full items-center justify-center gap-2 border border-[var(--ink)] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] lg:w-auto'
					>
						<SlidersHorizontal
							className='size-3.5'
							aria-hidden='true'
						/>
						Filter
					</button>
					<button
						type='button'
						onClick={clearFilters}
						className='inline-flex h-12 w-full items-center justify-center gap-2 border border-[var(--rule)] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] transition hover:border-[var(--ink)] hover:text-[var(--ink)] lg:w-auto'
					>
						<X
							className='size-3.5'
							aria-hidden='true'
						/>
						Clear
					</button>
				</form>
			</section>

			<BudgetProgramTable
				programs={filteredPrograms}
				total={total}
				label={label}
			/>
		</>
	)
}
