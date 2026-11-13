import { areaNameOf, districtLabel, enrolmentYears, schools } from '../_lib/education'

/* The school list as a spreadsheet: every column the JSON has that a reader can use, one row a school. */

const COLUMNS = ['id', 'name', 'type', 'level', 'management', 'sector', 'source', 'area', 'town', 'district', 'founded', 'pupils2012', 'pupils2015', 'lat', 'lon', 'placed'] as const

const cell = (v: unknown) => {
	const s = v == null ? '' : String(v)
	return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function GET() {
	// The learners in each school year DepEd's files cover go after the 2019 list's counts: "learners_2025-26".
	const rows = schools.map((s) =>
		[...COLUMNS.map((c) => cell(c === 'area' ? areaNameOf(s.area) : c === 'town' ? s.townName : c === 'district' ? districtLabel(s) : s[c])), ...enrolmentYears.map((y) => cell(s.enrolment[y]))].join(','),
	)
	return new Response([[...COLUMNS, ...enrolmentYears.map((y) => `learners_${y}`)].join(','), ...rows].join('\n') + '\n', {
		headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="bangsamoro-schools.csv"' },
	})
}
