'use client'

import Link from 'next/link'
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
	const [pendingYear, setPendingYear] = useState<number | null>(null)
	const maxTotal = Math.max(...rows.map((row) => row.total), 1)
	const displayYear = pendingYear ?? selectedYear

	useEffect(() => {
		setPendingYear(null)
	}, [selectedYear])

	return (
		<section className='mb-10'>
			<div className={`${flushTop ? '-mt-9' : 'mt-8'} grid border-y border-[var(--rule)] py-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7`}>
				{rows.map((row) => {
					const isActive = row.year === displayYear
					const isPending = row.year === pendingYear
					const barWidth = `${Math.max(2, Math.round((row.total / maxTotal) * 100))}%`

					return (
						<Link
							key={row.year}
							href={`${hrefBasePath}?year=${row.year}`}
							aria-current={isActive ? 'date' : undefined}
							aria-busy={isPending}
							onClick={(event) => {
								if (isNormalClick(event) && row.year !== selectedYear) setPendingYear(row.year)
							}}
							className={`num relative border-b border-r border-[var(--rule)] px-5 transition last:border-r-0 hover:bg-[var(--paper-2)] xl:border-b-0 ${
								isActive ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink)]!' : 'bg-[var(--paper)]'
							}`}
						>
							{isPending ? (
								<span
									aria-label='Loading fiscal year'
									className='absolute right-4 top-4 size-3 animate-spin rounded-full border-2 border-[var(--paper-2)] border-t-[var(--accent)]'
								/>
							) : null}
							<p className='text-3xl font-extrabold uppercase leading-none tracking-normal'>FY {row.year}</p>
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
