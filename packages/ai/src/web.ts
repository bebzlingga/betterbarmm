/* ============================================================
   The web, for what the records do not hold

   Everything else in this package answers from `corpus.ts`, and
   that is the point of it: a figure traces to a page of a
   document somebody is accountable for. This file is the other
   case — a question the records have nothing on at all.

   Before it existed, those questions got "I have nothing on
   that. Ask me about a measure, an appropriation, a place to go,
   or a town." Which is honest, and useless.

   Three rules hold the line between the two.

   · It runs ONLY when the corpus returned nothing. A question
     the records can answer is answered from the records, always,
     and the web is never consulted to second-guess them.

   · Every answer comes back with the pages it was read from, and
     the dock prints them under a label saying so. The estate
     tells a transcribed Act from a web page by where the file
     lives; a web answer lives nowhere, so it has to be marked.

   · It may not state a Bangsamoro figure. Appropriations, seat
     counts, vote totals and the numbers of measures are the
     things this project would be discredited for getting wrong,
     they are exactly what a stale web page gets wrong, and the
     corpus already holds all of them. A question about one of
     those is a question the corpus should have answered.

   `gpt-5-search-api` because it is the only search model this
   key can reach — `gpt-4o-search-preview` and its mini are both
   deprecated and answer 404. It takes about ten seconds, which
   is why nothing else on this path waits for it.
   ============================================================ */

/** A page the answer was read from. */
export type Link = { title: string; href: string }

export type WebReply = { ok: true; text: string; links: Link[] } | { ok: false }

const WHERE = 'https://api.openai.com/v1'
const MODEL = 'gpt-5-search-api'

const BRIEF = `You are Jo, the assistant on BetterBARMM, a public transparency project for the Bangsamoro Autonomous Region in Muslim Mindanao.

Jo is a voice drawn from the everyday strength of Bangsamoro women — a daughter, a sister and a mother. You answer plainly and warmly, in the first person, and you never let the warmth reach for a fact you do not have.

This question is one the project's own records do not cover, so you are answering from the web. Two sentences at most. Say what you found, plainly, and say in a clause that it is from the web rather than from the records this site holds.

Never state a Bangsamoro appropriation, a share of a budget, a seat count, a vote total, or the number, title or date of a Bangsamoro measure. Those live in this project's own records, they are checked there, and a page on the internet is not where they are read from. If that is what was asked, say it is not something you found here and stop.`

/**
 * Whatever the web says, with the pages it says it from.
 *
 * Failure is quiet on purpose: this is the path taken when there was no answer
 * anyway, so a search that errors or times out leaves the caller exactly where
 * it already was rather than turning a thin answer into an error page.
 */
export async function askWeb(question: string): Promise<WebReply> {
	const key = process.env.AI_KEY || process.env.OPENAI_API_KEY || ''
	if (!key || key.startsWith('sk-ant-')) return { ok: false }

	try {
		const response = await fetch(`${WHERE}/chat/completions`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
			// Long: the search itself takes about ten seconds before a word is written.
			signal: AbortSignal.timeout(40_000),
			body: JSON.stringify({
				model: process.env.AI_WEB_MODEL || MODEL,
				max_completion_tokens: 400,
				messages: [
					{ role: 'system', content: BRIEF },
					{ role: 'user', content: question },
				],
			}),
		})

		if (!response.ok) {
			console.error('The web search answered', response.status, await response.text().catch(() => ''))
			return { ok: false }
		}

		const body = (await response.json()) as {
			choices?: { message?: { content?: string; annotations?: Annotation[] } }[]
		}
		const said = body.choices?.[0]?.message
		const text = plain(said?.content ?? '')
		if (!text) return { ok: false }

		return { ok: true, text, links: cited(said?.annotations ?? []) }
	} catch (error) {
		console.error('The assistant could not reach the web search', error)
		return { ok: false }
	}
}

type Annotation = { type?: string; url_citation?: { title?: string; url?: string } }

/**
 * The pages, deduplicated by address and capped.
 *
 * A single sentence comes back citing the same Wikipedia article three times
 * where three clauses of it were read from three paragraphs.
 */
function cited(annotations: Annotation[]): Link[] {
	const seen = new Map<string, Link>()
	for (const one of annotations) {
		const url = one.url_citation?.url
		if (one.type !== 'url_citation' || !url) continue
		// The tracking parameter the API appends to every citation it returns.
		const href = url.replace(/[?&]utm_source=openai\b/, '')
		if (!seen.has(href)) seen.set(href, { title: one.url_citation?.title || host(href), href })
	}
	return [...seen.values()].slice(0, 6)
}

const host = (href: string) => {
	try {
		return new URL(href).hostname.replace(/^www\./, '')
	} catch {
		return href
	}
}

/**
 * The citation markup taken out of the prose.
 *
 * The model writes its sources inline — "took effect on 10 August 2018
 * ([en.wikipedia.org](https://…))" — which is a link the reader cannot click,
 * in the middle of a sentence, repeating what is already printed underneath.
 */
function plain(text: string): string {
	return text
		.replace(/\s*\(\[[^\]]*\]\([^)]*\)(?:,\s*\[[^\]]*\]\([^)]*\))*\)/g, '')
		.replace(/\s+([.,;:])/g, '$1')
		.replace(/[ \t]{2,}/g, ' ')
		.trim()
}
