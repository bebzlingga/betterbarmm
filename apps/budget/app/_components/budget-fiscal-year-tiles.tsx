'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type MouseEvent } from 'react'

export interface BudgetFiscalYearTileRow {
	year: number
	total: number
}

interface BudgetFiscalYearTilesProps {
	rows: BudgetFiscalYearTileRow[]
	selectedYear: number
	flushTop?: boolean
	hrefBasePath?: string
}

function trimNumber(value: number, digits = 1) {
	return value.toFixed(digits).replace(/\.0$/, '')
}

function formatBillions(value: number, digits = 1) {
	return `${trimNumber(value / 1_000_000_000, digits)}B`
}

function appropriationSourceLabel(_year: number) {
	return 'GAAB'
}

function isNormalClick(event: MouseEvent<HTMLAnchorElement>) {
	return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey
}

export function BudgetFiscalYearTiles({ rows, selectedYear, flushTop = false, hrefBasePath = '/by-year' }: BudgetFiscalYearTilesProps) {
	const router = useRouter()
	const [pendingYear, setPendingYear] = useState<number | null>(null)
	const maxTotal = Math.max(...rows.map((row) => row.total), 1)
	const displayYear = pendingYear ?? selectedYear
	const selectedRow = rows.find((row) => row.year === displayYear)

	function yearHref(year: number) {
		return `${hrefBasePath}?year=${year}`
	}

	function handleYearChange(nextYear: number) {
		if (nextYear !== selectedYear) setPendingYear(nextYear)
		router.push(yearHref(nextYear))
	}

	useEffect(() => {
		setPendingYear(null)
	}, [selectedYear])

	return (
		<section className='mb-10'>
			<div className={`${flushTop ? '-mt-4 sm:-mt-9' : 'mt-8'} border-y border-[var(--rule)] py-3 sm:hidden`}>
				<label
					htmlFor='budget-fiscal-year-select'
					className='relative block'
				>
					<span className='eyebrow'>Fiscal year</span>
					<select
						id='budget-fiscal-year-select'
						value={displayYear}
						onChange={(event) => handleYearChange(Number(event.target.value))}
						className='mt-2 h-12 w-full appearance-none border border-[var(--ink)] bg-[var(--paper)] py-0 pl-4 pr-10 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] outline-none transition focus:border-[var(--accent)]'
					>
						{rows.map((row) => (
							<option
								key={row.year}
								value={row.year}
							>
								{`FY ${row.year} / ${formatBillions(row.total, 2)} ${appropriationSourceLabel(row.year)}`}
							</option>
						))}
					</select>
					<ChevronDown
						className='pointer-events-none absolute bottom-4 right-3 size-3.5 text-[var(--ink)]'
						aria-hidden='true'
					/>
				</label>
				<div className='mt-3 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-3)]'>
					<p>{selectedRow ? `${formatBillions(selectedRow.total, 2)} GAAB` : 'GAAB'}</p>
					{pendingYear ? (
						<span
							aria-label='Loading fiscal year'
							className='size-3 animate-spin rounded-full border-2 border-[var(--rule)] border-t-[var(--accent)]'
						/>
					) : null}
				</div>
			</div>

			<div className={`${flushTop ? '-mt-4 sm:-mt-9' : 'mt-8'} hidden border-y border-[var(--rule)] py-3 sm:grid sm:grid-cols-2 sm:py-4 lg:grid-cols-4 xl:grid-cols-7`}>
				{rows.map((row) => {
					const isActive = row.year === displayYear
					const isPending = row.year === pendingYear
					const barWidth = `${Math.max(2, Math.round((row.total / maxTotal) * 100))}%`

					return (
						<Link
							key={row.year}
							href={yearHref(row.year)}
							aria-current={isActive ? 'date' : undefined}
							aria-busy={isPending}
							onClick={(event) => {
								if (isNormalClick(event) && row.year !== selectedYear) setPendingYear(row.year)
							}}
							className={`num relative border-b border-[var(--rule)] px-4 py-3 transition last:border-b-0 hover:bg-[var(--paper-2)] sm:border-r sm:px-5 xl:border-b-0 xl:last:border-r-0 ${
								isActive ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]!' : 'bg-[var(--paper)]'
							}`}
						>
							{isPending ? (
								<span
									aria-label='Loading fiscal year'
									className='absolute right-4 top-4 size-3 animate-spin rounded-full border-2 border-[var(--paper-2)] border-t-[var(--accent)]'
								/>
							) : null}
							<p className='text-2xl font-extrabold uppercase leading-none tracking-normal sm:text-3xl'>FY {row.year}</p>
							<p className={`relative -top-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] ${isActive ? 'text-[var(--paper-2)]' : 'text-[var(--ink-3)]'}`}>
								{formatBillions(row.total, 2)} {appropriationSourceLabel(row.year)}
							</p>
							<div
								aria-hidden='true'
								className={`mt-3 h-1 ${isActive ? 'bg-[var(--ink-2)]' : 'bg-[var(--rule)]'}`}
							>
								<div
									className='h-full bg-[var(--accent)]'
									style={{ width: barWidth }}
								/>
							</div>
						</Link>
					)
				})}
			</div>
		</section>
	)
}
