import { measureEvents, rssResponse } from '../../../_lib/feeds'
import { getOfficialBill } from '../../../_lib/official-measures'

/* One bill's moves: follow it and hear when it is read, referred or passed. */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
	const { number } = await params
	const bill = getOfficialBill(Number(number))
	if (!bill) return new Response('No such bill', { status: 404 })
	return rssResponse(
		{ title: `Bill ${bill.number} — Bangsamoro Parliament`, path: `/bills/${bill.number}/feed.xml`, description: bill.title },
		measureEvents([bill]),
	)
}
