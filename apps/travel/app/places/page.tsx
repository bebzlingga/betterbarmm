import { redirect } from 'next/navigation'

/* The places are the front page now (user decision: Travel & Places, browsed like stays), so the old list sends
   readers there, with any filter it was given. */
export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ kind?: string; area?: string }> }) {
	const { kind, area } = await searchParams
	const query = new URLSearchParams(Object.entries({ kind, area }).filter((e): e is [string, string] => Boolean(e[1])))
	redirect(`/${query.size ? `?${query}` : ''}`)
}
