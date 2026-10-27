import { Skeleton, SkeletonLine } from '@betterbarmm/editorial'
import { HEAD_ROW, ROW, TABLE, TD, TD_NUM, TH, TH_NUM } from './table'

/* ============================================================
   The projects and programs browsers, in grey

   Shown while a browser waits on its Suspense boundary (user decision:
   skeletons, matching the spacing). Built from the browsers' own
   pieces — the controls row, the count line, and a real table on the
   shared table classes — so every row is the height and every column
   the width of the one that replaces it.
   ============================================================ */

const WIDTHS = [78, 62, 86, 70, 56, 82, 66, 74, 60, 80]

/** The `SUB` line's type, without its `block`: a skeleton line is a flex row. */
const SUB_TEXT = 'mt-1 text-[0.75rem] leading-snug'

type Column = { label: string; className?: string; numeric?: boolean }

const SHAPES = {
	projects: {
		controls: 'pb-6',
		filters: ['w-[5.8rem]', 'w-[8.8rem]'],
		columns: [
			{ label: 'Project' },
			{ label: 'Area', className: 'hidden md:table-cell' },
			{ label: 'What is built', className: 'hidden lg:table-cell' },
			{ label: 'Amount', numeric: true },
		] as Column[],
	},
	programs: {
		controls: 'pb-8',
		filters: ['w-[6.4rem]'],
		columns: [
			{ label: 'Program' },
			{ label: 'Office', className: 'hidden lg:table-cell' },
			{ label: 'Amount', numeric: true },
			{ label: 'Of the budget', className: 'hidden sm:table-cell', numeric: true },
		] as Column[],
	},
} as const

export function BrowserSkeleton({ kind, label }: { kind: keyof typeof SHAPES; label: string }) {
	const shape = SHAPES[kind]
	return (
		<div role='status'>
			<span className='sr-only'>{label}</span>
			<div className={`flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between ${shape.controls}`}>
				{/* The search field and the filter menus, at their own heights. */}
				<Skeleton className='h-[3.35rem] w-full lg:max-w-xl' />
				<div className='flex shrink-0 gap-2'>
					{shape.filters.map((width) => (
						<Skeleton key={width} className={`h-[3.15rem] ${width}`} />
					))}
				</div>
			</div>
			<SkeletonLine className='mt-5 font-mono text-[0.625rem] uppercase tracking-[0.16em]' width='14rem' />
			<table aria-hidden='true' className={`${TABLE} mt-3`}>
				<thead>
					<tr className={HEAD_ROW}>
						{shape.columns.map((column) => (
							<th key={column.label} scope='col' className={`${column.numeric ? TH_NUM : TH} ${column.className ?? ''}`}>
								<SkeletonLine width={`${Math.min(column.label.length * 0.55, 6)}rem`} />
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{WIDTHS.map((width, i) => (
						<tr key={i} className={ROW}>
							{shape.columns.map((column, j) =>
								j === 0 ? (
									<th key={column.label} scope='row' className={`${TD} font-normal`}>
										{kind === 'programs' ? (
											/* The program row opens with its plus mark, then the name and the line under it. */
											<span className='flex items-start gap-2.5'>
												<Skeleton className='mt-1 size-3 shrink-0' />
												<span className='min-w-0 flex-1'>
													<SkeletonLine className='text-[0.90625rem] leading-snug' width={`${width}%`} />
													<SkeletonLine className={SUB_TEXT} width={`${width / 2}%`} />
												</span>
											</span>
										) : (
											<>
												<SkeletonLine className='text-[0.90625rem] leading-snug' width={`${width}%`} />
												<SkeletonLine className={`${SUB_TEXT} md:hidden`} width={`${width / 2}%`} />
											</>
										)}
									</th>
								) : column.numeric ? (
									<td key={column.label} className={`${TD_NUM} ${column.className ?? ''}`}>
										<SkeletonLine width={j === shape.columns.length - 1 && kind === 'programs' ? '3rem' : '5.5rem'} />
									</td>
								) : (
									<td
										key={column.label}
										className={`${TD} ${kind === 'programs' ? 'w-[16rem] text-[0.78125rem] leading-snug' : 'w-[11rem] text-[0.8125rem]'} ${column.className ?? ''}`}
									>
										<SkeletonLine width={`${40 + ((i * 7) % 5) * 10}%`} />
										{/* A program's office cell carries its sector under it. */}
										{kind === 'programs' ? <SkeletonLine className={SUB_TEXT} width='35%' /> : null}
									</td>
								),
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
