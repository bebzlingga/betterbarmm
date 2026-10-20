import { brain } from '../_lib/brain'

// Built once at build time; the brain dialog fetches it the first time it opens.
export const dynamic = 'force-static'

export function GET() {
	return Response.json(brain())
}
