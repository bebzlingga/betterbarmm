export type BudgetDataFile = {
	file: string
	relativePath: string
	year: string
	type: 'JSON' | 'PDF'
	role: string
	contentType: string
}

export const budgetDataFiles: BudgetDataFile[] = [
	{
		file: 'barmm_fy2020_2026.min.json',
		relativePath: 'barmm_fy2020_2026.min.json',
		year: '2020-2026',
		type: 'JSON',
		role: 'Compiled normalized dataset',
		contentType: 'application/json; charset=utf-8',
	},
	...[
		['FY-2020-BAA.pdf', '2020'],
		['FY-2021-GAAB.pdf', '2021'],
		['FY-2022-GAAB.pdf', '2022'],
		['FY-2023-GAAB.pdf', '2023'],
		['FY-2024-GAAB.pdf', '2024'],
		['FY-2025-GAAB.pdf', '2025'],
		['FY-2026-GAAB.pdf', '2026'],
	].map(([file, year]) => ({
		file,
		relativePath: `GAAB/${file}`,
		year,
		type: 'PDF' as const,
		role: 'Primary GAAB extraction source',
		contentType: 'application/pdf',
	})),
]
