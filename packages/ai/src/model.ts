/* ============================================================
   One turn with whichever model is configured

   The default is an open-weights model on the machine serving the
   app: Ollama with `qwen2.5:7b`, which is free, private, and runs
   on a laptop. The call is plain `fetch` against the
   OpenAI-compatible chat endpoint, and that is the whole reason
   three environment variables are the entire story — Ollama,
   vLLM, llama.cpp, Groq, OpenRouter, Together and OpenAI itself
   all answer the same shape, so changing where the thinking
   happens is configuration rather than code.

       AI_URL    where to post      (default OpenAI with a key, Ollama without)
       AI_MODEL  which model        (default gpt-5.6-luna with a key, qwen2.5:7b without)
       AI_KEY    the key, if any    (default none — a local model wants none)

   A key beginning `sk-ant-` is answered by Anthropic's own API
   through its SDK instead: Claude is not an OpenAI-compatible
   endpoint, and the shims for it drop tool-use blocks.

   Callers hand in plain messages and get back plain text and
   whichever tools were named. Nothing provider-shaped crosses
   this boundary, which is what lets `answer.ts` stay one piece of
   code for both.
   ============================================================ */

import Anthropic from '@anthropic-ai/sdk'

export type ModelTool = { name: string; description: string; parameters: Record<string, unknown> }
export type ModelMessage = { role: 'system' | 'user' | 'assistant'; content: string }
/** A tool the model asked for, with its arguments already parsed. */
export type ModelCall = { name: string; args: Record<string, unknown> }
export type ModelReply = { ok: true; text: string; calls: ModelCall[] } | { ok: false; error: string }

const LOCAL = 'http://localhost:11434/v1'
/* Where a key goes when nothing says otherwise. A key means somebody is paying
   a host, and the host they are paying is almost never a laptop — defaulting
   to Ollama in that case meant a configured deployment quietly talking to a
   machine that is not there. */
const OPENAI = 'https://api.openai.com/v1'

/**
 * The longest answer worth generating.
 *
 * Two sentences is the brief and fifty tokens is what two sentences cost; this
 * is the ceiling on a model that runs long, not the target. It was 200, which
 * left room the brief never asked for and every token of it was billed. Everything
 * generated past the point a reader stops caring is time they spent watching a
 * spinner. `grounded` drops a sentence the ceiling cut in half.
 */
const MOST_WORDS = 120

/** What a host has told us it will not take, and the one thing it insists on. */
type Drop = {
	temperature?: boolean
	maxTokens?: boolean
	keepAlive?: boolean
	/** Add `reasoning_effort: 'none'` — GPT-5.6 will not take tools without it. */
	needsEffort?: boolean
}

export async function askModel(messages: ModelMessage[], tools: ModelTool[] = []): Promise<ModelReply> {
	// `||`, not `??`: an empty string in the environment means "not chosen".
	const key =
		process.env.AI_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || ''
	if (key.startsWith('sk-ant-')) return askClaude(messages, tools, key)

	/* ChatGPT is the default wherever there is a key (user decision), and the
	   laptop is the fallback only when there is none.
	   
	   `gpt-5.6-luna` of the three 5.6 variants, measured on `answer.check.ts`
	   rather than chosen: luna and terra both answered 30/30 across three
	   passes and sol 29/30 — it returned nothing at all on the recall
	   threshold. Luna and terra are within noise of each other on speed
	   (2.6–4.4s a question, either one faster depending on the pass), so the
	   tie went to luna, which was fastest on the first clean pass. */
	const where = (process.env.AI_URL || (key ? OPENAI : LOCAL)).replace(/\/$/, '')
	const model = process.env.AI_MODEL || (key ? 'gpt-5.6-luna' : 'qwen2.5:7b')
	const local = /localhost|127\.0\.0\.1/.test(where)

	/* What this family needs, sent up front rather than discovered.
	
	   GPT-5.6 refuses function tools without `reasoning_effort`, and — less
	   obviously — refuses any temperature but the default unless the same
	   parameter is present. Left to the retry below, the first call of every
	   turn is spent finding that out, and the turn that carries no tools never
	   hits the tools error at all: it 400s on temperature, retries without it,
	   and still sends no effort. That is the shape of the bug where a long
	   brief came back as an empty answer.
	
	   Matched on the name rather than probed, and only for the families known
	   to want it. Anything else still learns from the refusal. */
	const preset: Drop = /^gpt-5\.[6-9]|^gpt-[6-9]/.test(model) ? { needsEffort: true } : {}

	/* Parameters the newer hosted models refuse, one at a time. A reasoning
	   model takes no `temperature` at all, and the GPT-5 family renamed
	   `max_tokens` to `max_completion_tokens` — ask with either and it answers
	   400 naming the one it did not like. They are dropped on demand rather
	   than up front, because the local models this falls back to want
	   `max_tokens` and are happy with a temperature.
	   
	   One goes the other way. The GPT-5.6 family refuses function tools on
	   this endpoint altogether — "Function tools with reasoning_effort are not
	   supported ... use /v1/responses or set reasoning_effort" — and answers
	   400 until `reasoning_effort: 'none'` is sent. It is the only parameter
	   here that has to be added rather than taken away, and it is added only
	   when a host has asked for it: every model before 5.6 refuses it as
	   unknown. 'minimal' and 'low' are both rejected; 'none' is the one that
	   works. */
	const post = (drop: Drop = {}) =>
		fetch(`${where}/chat/completions`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Bearer ${key || 'local'}` },
			// Long enough for a laptop to load a model it has not used today.
			signal: AbortSignal.timeout(120_000),
			body: JSON.stringify({
				model,
				// Two or three sentences is the whole brief. Without a ceiling a
				// small model writes ten lines, nine of which are struck before
				// anybody sees them — paid for in the time somebody spent
				// waiting.
				...(drop.maxTokens
					? { max_completion_tokens: MOST_WORDS }
					: { max_tokens: MOST_WORDS }),
				// Ollama unloads a model after five idle minutes, and the next
				// question then waits for it to load again.
				//
				// Sent only to a local host. It is Ollama's own extension, not
				// part of the shape everyone else implements, and OpenAI does
				// not ignore what it does not recognize — it refuses the whole
				// request with a 400 naming it. Sending it to every host made
				// the assistant unreachable on any OpenAI key at all.
				...(local && !drop.keepAlive ? { keep_alive: '30m' } : {}),
				// Low, not zero: the same question should get the same answer
				// twice running. `plain` leaves it out, for a model that refuses
				// to be told.
				...(drop.temperature ? {} : { temperature: 0.3 }),
				...(drop.needsEffort ? { reasoning_effort: 'none' } : {}),
				...(tools.length ? { tools: tools.map((tool) => ({ type: 'function', function: tool })) } : {}),
				messages,
			}),
		})

	let response: Response
	try {
		response = await post(preset)
	} catch (error) {
		console.error('The assistant could not reach the model', error)
		return {
			ok: false,
			error: local
				? 'The assistant cannot reach the model on this machine. Start it with `ollama serve`, then ask again.'
				: 'The assistant cannot reach the model. Try again in a moment.',
		}
	}

	// Asked again without whichever parameter was named, rather than making the
	// choice of model a code change. Twice at most, because a host can refuse
	// both — GPT-5 rejects `max_tokens` first and `temperature` on the retry —
	// and the dropped ones accumulate so the second attempt does not reinstate
	// what the first one removed.
	let refused = response.ok ? '' : await response.text().catch(() => '')
	const drop: Drop = { ...preset }
	for (let attempt = 0; attempt < 4 && response.status === 400; attempt += 1) {
		if (refused.includes('reasoning_effort')) drop.needsEffort = true
		else if (refused.includes('keep_alive')) drop.keepAlive = true
		else if (refused.includes('max_tokens')) drop.maxTokens = true
		else if (refused.includes('temperature')) drop.temperature = true
		else break
		response = await post(drop).catch(() => response)
		refused = response.ok ? '' : await response.text().catch(() => '')
	}

	if (!response.ok) {
		console.error('The model answered', response.status, refused)
		return { ok: false, error: refusal(response.status, refused, model, local) }
	}

	let turn = await read(response)
	// Nothing at all — no call and no words. A small model does this to a very
	// short message; it is a failed turn rather than a considered silence, so
	// it is asked once more. Once: a model that has said nothing twice has
	// nothing to say.
	if (!turn.text && turn.calls.length === 0) {
		const again = await post(drop).catch(() => null)
		if (again?.ok) turn = await read(again)
	}

	return { ok: true, ...turn }
}

function refusal(status: number, said: string, model: string, local: boolean): string {
	const body = said.toLowerCase()
	// Every host words it differently, and OpenAI says it as a 429 rather than
	// a 402 — so it is read off the body, where the word itself is.
	if (/insufficient_quota|credit balance|no credits|out of credit|billing/.test(body)) {
		return 'The account behind the assistant is out of credit.'
	}
	if (status === 401 || status === 403) {
		return local ? 'The assistant is not set up properly here.' : 'The key in AI_KEY was refused.'
	}
	if (status === 402) return 'The account behind the assistant is out of credit.'
	if (status === 429) return 'Too many questions at once. Wait a moment and ask again.'
	if (status === 404) {
		return local
			? `The model “${model}” is not there. Pull it with \`ollama pull ${model}\`, or set AI_MODEL to one that is.`
			: `The host has no model called “${model}”. Set AI_MODEL to one this key can use.`
	}
	if (status === 400) return 'That question was not something this could send. Try saying it differently.'
	return 'That did not come back. Try again.'
}

async function read(response: Response): Promise<{ text: string; calls: ModelCall[] }> {
	const body = (await response.json().catch(() => null)) as {
		choices?: { message?: { content?: string | null; tool_calls?: { function?: { name?: string; arguments?: unknown } }[] } }[]
	} | null
	const message = body?.choices?.[0]?.message

	const calls: ModelCall[] = []
	for (const one of message?.tool_calls ?? []) {
		if (!one.function?.name) continue
		try {
			// A string by the spec; some hosts send the object itself.
			const raw = one.function.arguments
			const args = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw
			calls.push({ name: one.function.name, args: args && typeof args === 'object' ? (args as Record<string, unknown>) : {} })
		} catch (error) {
			console.error('The model sent arguments that are not JSON', error)
		}
	}

	return { text: spoken(message?.content ?? ''), calls }
}

/**
 * The words worth showing from a turn.
 *
 * A small model often narrates *and* pastes the call it already made, fenced
 * as ```json — so the answer on screen ends mid-sentence with a code fence and
 * a wall of arguments. Fenced blocks come out; whatever prose sat around them
 * stays. An unterminated fence takes the rest of the message with it, which is
 * the usual shape of this.
 */
function spoken(said: string): string {
	return said
		.replace(/```[\s\S]*?(?:```|$)/g, ' ')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

/**
 * The same turn, asked of Claude.
 *
 * `claude-opus-5` unless AI_MODEL says otherwise, with the server-side
 * fallbacks on so a declined request is re-run rather than coming back empty.
 */
async function askClaude(messages: ModelMessage[], tools: ModelTool[], key: string): Promise<ModelReply> {
	const model = process.env.AI_MODEL || 'claude-opus-5'
	const client = new Anthropic({ apiKey: key })

	let reply: Anthropic.Beta.BetaMessage
	try {
		reply = await client.beta.messages.create({
			model,
			max_tokens: MOST_WORDS,
			betas: ['server-side-fallback-2026-07-01'],
			fallbacks: 'default',
			// Picking a search term and writing three sentences from what comes
			// back is not hard work, and this is answered while somebody waits.
			output_config: { effort: 'low' },
			system: messages
				.filter((one) => one.role === 'system')
				.map((one) => one.content)
				.join('\n\n'),
			messages: messages
				.filter((one) => one.role !== 'system')
				.map((one) => ({ role: one.role as 'user' | 'assistant', content: one.content })),
			...(tools.length
				? { tools: tools.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.parameters as Anthropic.Beta.BetaTool['input_schema'] })) }
				: {}),
		})
	} catch (error) {
		console.error('Claude refused the request', error)
		if (error instanceof Anthropic.AuthenticationError) return { ok: false, error: 'The key in AI_KEY was refused.' }
		if (error instanceof Anthropic.RateLimitError) return { ok: false, error: 'Too many questions at once. Wait a moment and ask again.' }
		if (error instanceof Anthropic.NotFoundError) return { ok: false, error: `There is no model called “${model}”. Set AI_MODEL to one this key can use.` }
		if (error instanceof Anthropic.APIError && error.status === 400 && error.message.toLowerCase().includes('credit balance')) {
			return { ok: false, error: 'The account behind the assistant is out of credit.' }
		}
		return { ok: false, error: 'That did not come back. Try again in a moment.' }
	}

	// A decline after the fallbacks have had their turn: the whole chain said no.
	if (reply.stop_reason === 'refusal') return { ok: false, error: 'That one was declined. Ask it another way.' }

	return {
		ok: true,
		text: reply.content
			.filter((block) => block.type === 'text')
			.map((block) => block.text)
			.join('\n')
			.trim(),
		calls: reply.content
			.filter((block) => block.type === 'tool_use')
			.map((block) => ({ name: block.name, args: (block.input ?? {}) as Record<string, unknown> })),
	}
}
