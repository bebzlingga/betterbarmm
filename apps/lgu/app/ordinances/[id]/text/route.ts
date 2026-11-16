import { ordinanceText, ordinances } from '@betterbarmm/lgu-data/ordinances'

/* An ordinance's text as plain text, for the Copy button and for anyone who wants the file. Built once per ordinance. */

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
	return ordinances.map((o) => ({ id: o.id }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const text = ordinanceText(id)
	if (!text) return new Response('Not found', { status: 404 })
	return new Response(text.replace(/\f/g, '\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
