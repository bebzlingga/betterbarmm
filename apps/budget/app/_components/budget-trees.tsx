import { percent, peso, type ObjectLine, type ProgramLine } from '@betterbarmm/budget-data'

/* ============================================================
   The two tables the Act prints for every office

   Both are trees, and both are drawn here as flat rows indented
   by depth rather than as nested tables. A nested table puts the
   figures in a different column at every level, which is exactly
   the thing that makes the printed Act hard to read; one column
   of right-ranged figures with the names stepped in under each
   other keeps the comparison down the page.

   Rows that the Act prints with no figures against them — the
   group headings — are drawn as headings rather than as rows with
   an em dash where the money should be. Their children hold the
   amounts.
   ============================================================ */

const STEP = 1.15

/**
 * What an office is funded to do: cost structures, programs, sub-programs.
 *
 * This is the table most readers want and the one the old workspace buried
 * behind a year picker. "Operations → Health Facilities Program →
 * Construction of Barangay Health Stations" is a sentence about what the money
 * is for, and it is readable straight down the left edge.
 */
export function ProgramTree({ lines, depth = 0 }: { lines: ProgramLine[]; depth?: number }) {
	return (
		<>
			{lines.map((line) => {
				const bare = line.group_header_only || line.total == null

				return (
					<div key={`${depth}-${line.name}`}>
						<div className='tree-row' data-depth={depth}>
							<p
								className={
									depth === 0
										? 'text-[14px] font-bold tracking-[-0.02em] text-[var(--ink)]'
										: depth === 1
											? 'text-[13.5px] font-semibold text-[var(--ink)]'
											: 'text-[13px] text-[var(--ink-2)]'
								}
								style={{ paddingInlineStart: `${depth * STEP}rem` }}
							>
								{line.name}
							</p>

							<span className='tree-leader' aria-hidden='true' />

							{bare ? (
								<span className='font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-mute)]'>
									see below
								</span>
							) : (
								<p
									className='money whitespace-nowrap text-[13.5px] font-semibold tabular-nums text-[var(--ink)]'
								>
									{peso(line.total)}
								</p>
							)}
						</div>

						{line.children?.length ? <ProgramTree lines={line.children} depth={depth + 1} /> : null}
					</div>
				)
			})}
		</>
	)
}

/**
 * What the money is actually spent on: salaries, fuel, buildings, vehicles.
 *
 * Folded away behind a disclosure on the office pages, because it is five
 * levels deep and answers a question most readers will not ask — but the ones
 * who do ask it are the ones this site exists for, and "Traveling Expenses,
 * ₱18,400,000" is the line that gets quoted.
 */
export function ObjectTree({
	lines,
	depth = 0,
	whole,
}: {
	lines: ObjectLine[]
	depth?: number
	whole: number
}) {
	return (
		<>
			{lines.map((line) => (
				<div key={`${depth}-${line.name}`}>
					<div className='tree-row' data-depth={depth}>
						<p
							className={
								depth === 0
									? 'text-[16px] font-black tracking-[-0.02em] text-[var(--ink)]'
									: depth === 1
										? 'text-[13px] font-semibold text-[var(--ink)]'
										: 'text-[12.5px] text-[var(--ink-2)]'
							}
							style={{ paddingInlineStart: `${depth * STEP}rem` }}
						>
							{line.name}
							{line.amount_derived_from_children ? (
								<span
									className='ml-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-mute)]'
									title='The Act prints no subtotal on this line; it is the sum of the lines under it.'
								>
									summed
								</span>
							) : null}
						</p>

						<span className='tree-leader' aria-hidden='true' />

						<p className='flex items-baseline gap-3 whitespace-nowrap'>
							<span
							className={`money tabular-nums text-[var(--ink)] ${
								depth === 0 ? 'text-[16px] font-black' : 'text-[13px] font-semibold'
							}`}
						>
								{line.amount == null ? '—' : peso(line.amount)}
							</span>
							{depth === 0 && line.amount != null && whole > 0 ? (
								<span className='money font-mono text-[11px] font-semibold text-[var(--ink-3)]'>
									{percent((line.amount / whole) * 100)}
								</span>
							) : null}
						</p>
					</div>

					{line.children?.length ? (
						<ObjectTree lines={line.children} depth={depth + 1} whole={whole} />
					) : null}
				</div>
			))}
		</>
	)
}
