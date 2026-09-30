import { FISCAL_YEARS, budgetFor, formatNumber } from '@betterbarmm/budget-data'

/**
 * The files behind the workspace, and the only ones the download route will
 * serve.
 *
 * Three files per year: the Act by office, the Act line by line, and the Act
 * itself as published. All seven years are extracted — FY 2020 to FY 2026 —
 * and their files have the same shape: same keys, the same 38-sector taxonomy,
 * a source page on every row.
 *
 * It is an allow-list, not a directory listing: the route joins the name onto
 * a path on the server, and a route that serves whatever it is handed serves
 * whatever is above that path too. Generated from a fixed table rather than
 * read off disk, so it stays one.
 *
 * The descriptions count off the data rather than stating figures in prose. A
 * count written into a sentence is a count nothing recomputes, and this is the
 * page whose whole job is that its figures can be checked.
 */
export type DownloadFile = {
	file: string
	relativePath: string
	year: string
	kind: 'Extracted data' | 'The Act'
	role: string
	contentType: string
}

/** The extraction behind each year, and the PDF it was read from. */
const ACTS: Record<number, { prefix: string; pdf: string }> = {
	2026: { prefix: 'BAA85_FY2026', pdf: 'FY-2026-GAAB.pdf' },
	2025: { prefix: 'BAA65_FY2025', pdf: 'FY-2025-GAAB.pdf' },
	2024: { prefix: 'BAA56_FY2024', pdf: 'FY-2024-GAAB.pdf' },
	2023: { prefix: 'BAA32_FY2023', pdf: 'FY-2023-GAAB.pdf' },
	2022: { prefix: 'BAA23_FY2022', pdf: 'FY-2022-GAAB.pdf' },
	2021: { prefix: 'BAA15_FY2021', pdf: 'FY-2021-GAAB.pdf' },
	/* The first Bangsamoro budget, and the only one whose file is not named
	   "GAAB" — it was published as the Bangsamoro Autonomy Act itself. */
	2020: { prefix: 'BAA03_FY2020', pdf: 'FY-2020-BAA.pdf' },
}

const JSON_TYPE = 'application/json; charset=utf-8'

const extracted = FISCAL_YEARS.flatMap((fy): DownloadFile[] => {
	const { prefix, pdf } = ACTS[fy]!
	const { budget } = budgetFor(fy)
	const count = (n: number, one: string, many = `${one}s`) =>
		`${formatNumber(n)} ${n === 1 ? one : many}`

	return [
		{
			file: `${prefix}_budget.json`,
			relativePath: `${prefix}_budget.json`,
			year: String(fy),
			kind: 'Extracted data',
			role: `FY ${fy} by office: ${count(budget.officeCount, 'agency', 'agencies')} and ${count(
				budget.fundCount,
				'special purpose fund',
			)} with their totals, program tables and object-of-expenditure trees, with the source page on each.`,
			contentType: JSON_TYPE,
		},
		{
			file: `${prefix}_line_items.json`,
			relativePath: `${prefix}_line_items.json`,
			year: String(fy),
			kind: 'Extracted data',
			role: `FY ${fy} line by line: ${count(budget.programCount, 'program')}, ${count(
				budget.provisionCount,
				'special provision',
			)} and ${count(
				budget.projectCount,
				'named project',
			)}, each tagged to one of ${budget.sectorCount} sectors, with the source page on each.`,
			contentType: JSON_TYPE,
		},
		{
			file: pdf,
			relativePath: `GAAB/${pdf}`,
			year: String(fy),
			kind: 'The Act',
			/* The one line printed on the card, so it says what the year is rather
			   than what the file is. FY 2022 is the year that does not add up, and a
			   downloads page is exactly where that belongs. */
			role: budget.reconciles
				? `${budget.actLong}, as published. Read line by line for the two files beside it; its parts add to the ${budget.act} Section 1 figure.`
				: `${budget.actLong}, as published. Read line by line for the two files beside it. Its own printed section totals do not add to its Section 1 figure — the gap is in the Act, and both numbers are served as printed.`,
			contentType: 'application/pdf',
		},
	]
})

/* The one file that is not a year: the year-on-year series built from all
   seven Acts, which is the question none of them can answer on its own. */
const TRENDS: DownloadFile = {
	file: 'trends.json',
	relativePath: 'trends.json',
	year: 'All years',
	kind: 'Extracted data',
	role: `Year on year, FY ${FISCAL_YEARS[FISCAL_YEARS.length - 1]} to FY ${FISCAL_YEARS[0]}: what each office, sector and area was given in every Act, as three sets of series. Built from the seven files above and checked against them.`,
	contentType: JSON_TYPE,
}

/* Every year is extracted now, so there is no longer a second list of Acts
   published for reference only. */
export const DOWNLOADS: DownloadFile[] = [...extracted, TRENDS]
