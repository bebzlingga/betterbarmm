/* A table as CSV, for the download buttons. Quoted where a value needs it;
   a BOM up front so Excel reads the peso sign and accents as UTF-8. */

type Cell = string | number | null | undefined

const cell = (v: Cell) => {
	if (v == null) return ''
	const s = String(v)
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(header: string[], rows: Cell[][]): string {
	return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}

/** A Response that downloads as `name`.csv. */
export function csvResponse(name: string, header: string[], rows: Cell[][]) {
	return new Response(toCsv(header, rows), {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${name}.csv"`,
		},
	})
}
