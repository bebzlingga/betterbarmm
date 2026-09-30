/* ============================================================
   The one endpoint the assistant answers on

   Every app mounts this at /api/ask, so the panel posts to its own
   origin wherever it is opened and there is no cross-site anything
   to arrange.

   There is no sign-in on this estate, which makes this a public
   POST that spends money on each call. Two gates stand in front of
   the model: what arrived has to be a short conversation rather
   than a novel, and one address only gets so many questions an
   hour.
   ============================================================ */

import { answer, type Turn } from './answer'

/** The longest conversation that may be sent, and the longest thing said in it. */
const MOST_TURNS = 12
const MOST_LETTERS = 600

/** What one address may ask, and over how long. */
const MOST_ASKS = 20
const WINDOW = 60 * 60 * 1000

// ponytail: one counter per server instance, held in memory. A platform that
// runs several instances multiplies the cap by however many are warm, and a
// deploy forgets it. That is a soft ceiling on a bill, not a security control;
// move it to a store the instances share if the bill says so.
const asked = new Map<string, number[]>()

function tooMany(who: string): boolean {
	const now = Date.now()
	const recent = (asked.get(who) ?? []).filter((at) => now - at < WINDOW)
	recent.push(now)
	asked.set(who, recent)

	// Whoever is counted is also the sweeper: nothing else runs here, and a
	// map of every address that ever asked would otherwise only grow.
	if (asked.size > 5_000) {
		for (const [key, times] of asked) if (times.every((at) => now - at >= WINDOW)) asked.delete(key)
	}

	return recent.length > MOST_ASKS
}

export async function POST(request: Request): Promise<Response> {
	const body = await request.json().catch(() => null)
	const turns = readTurns((body as { turns?: unknown } | null)?.turns)
	if (typeof turns === 'string') return Response.json({ ok: false, error: turns }, { status: 400 })

	const who = (request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown').split(',')[0]!.trim()
	if (tooMany(who)) {
		return Response.json({ ok: false, error: 'That is a lot of questions in an hour. Try again later.' }, { status: 429 })
	}

	return Response.json(await answer(turns))
}

/** The conversation, checked — or the sentence to show instead. */
function readTurns(input: unknown): Turn[] | string {
	if (!Array.isArray(input) || input.length === 0) return 'There was nothing to send.'
	if (input.length > MOST_TURNS) return 'This conversation has run long. Start a new one.'

	const turns: Turn[] = []
	for (const raw of input) {
		const turn = (raw && typeof raw === 'object' ? raw : {}) as { role?: unknown; text?: unknown }
		if (turn.role !== 'user' && turn.role !== 'assistant') return 'That did not arrive whole. Reload the page.'
		const text = typeof turn.text === 'string' ? turn.text.trim().slice(0, MOST_LETTERS) : ''
		if (!text) return 'Ask something first.'
		turns.push({ role: turn.role, text })
	}

	return turns[turns.length - 1]!.role === 'user' ? turns : 'That did not arrive whole. Reload the page.'
}
