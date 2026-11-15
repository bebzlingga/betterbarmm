import { DownloadSimpleIcon } from '@phosphor-icons/react/ssr'

/* ============================================================
   The files behind the workspace, one card per fiscal year

   A card per file put FY 2026 in three tiles and every other
   year in one, which said the 2026 data matters three times as
   much as the 2020 Act rather than that 2026 is the year that
   has been extracted. A card per year says the true thing: here
   are seven budgets, and here is what we hold of each.

   The download is a menu only where there is a choice to make.
   Six of the seven years are a single PDF, and a menu holding
   one item is a click asking to be told what it is for.
   ============================================================ */

export type SourceFile = { file: string; year: string; kind: string; role: string }

const href = (file: string) => `/sources/download?file=${encodeURIComponent(file)}`

/** The file's own extension, which is what a reader is choosing between. */
const format = (file: string) => (file.split('.').pop() ?? '').toUpperCase()

export function SourceFiles({ files }: { files: SourceFile[] }) {
	const years = [...new Set(files.map((one) => one.year))].sort((a, b) => Number(b) - Number(a))

	return (
		/* A card a year, as the landing site draws its cards (user decision): the year large, what it is, then every file
		   as its own download row, so nothing is behind a menu. */
		<div className='mt-8 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3'>
			{years.map((year) => {
				const mine = files.filter((one) => one.year === year)
				const act = mine.find((one) => one.kind === 'The Act') ?? mine[0]!

				return (
					<div key={year} className='flex h-full flex-col border border-[var(--rule)] bg-[var(--paper)] transition duration-300 hover:border-[var(--accent)] hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]'>
						<div className='flex flex-1 flex-col p-5 sm:p-6'>
							<div className='flex items-baseline justify-between gap-4'>
								<p className='num text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] text-[var(--ink)]'>{/^\d+$/.test(year) ? `FY ${year}` : year}</p>
								<span className='rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]'>
									{mine.length} {mine.length === 1 ? 'file' : 'files'}
								</span>
							</div>
							<p className='mt-3 text-[0.8125rem] leading-[1.6] text-[var(--ink-3)]'>{act.role}</p>
						</div>
						<ul className='divide-y divide-[var(--rule-soft)] border-t border-[var(--rule)]'>
							{mine.map((one) => (
								<li key={one.file}>
									<a href={href(one.file)} className='group/row flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--accent)] hover:text-white sm:px-6'>
										<DownloadSimpleIcon className='size-4 shrink-0 text-[var(--accent)] transition group-hover/row:translate-y-0.5 group-hover/row:text-white' aria-hidden='true' />
										<span className='min-w-0 flex-1'>
											<span className='block text-[0.84375rem] font-semibold'>{one.kind}</span>
											{/* The file's own name, which is what tells two data files of one year apart. */}
											<span className='block truncate font-mono text-[0.625rem] text-[var(--ink-3)] group-hover/row:text-white/75'>{one.file}</span>
										</span>
										<span className='num shrink-0 rounded-full bg-[var(--paper-2)] px-2 py-0.5 font-mono text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)] group-hover/row:bg-white/20 group-hover/row:text-white'>
											{format(one.file)}
										</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				)
			})}
		</div>
	)
}
