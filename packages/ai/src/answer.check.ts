/* ============================================================
   Does the assistant still get the answers right?

   `search.check.ts` is the offline half: it asks whether the
   right rows come back, and it runs anywhere for nothing.
   This is the other half — whether the model, given those rows,
   writes the figure that is in them.

   It needs a key and it spends money: ten questions, two model
   turns each, twenty calls a run. So it is not part of any
   pipeline and nothing imports it. Run it by hand when the model
   changes, which is the one time the answer can quietly get
   worse without a single test failing.

       AI_URL=… AI_KEY=… bun packages/ai/src/answer.check.ts
       AI_MODEL=gpt-4o-mini bun packages/ai/src/answer.check.ts

   A case is a question and the shape its answer has to contain,
   never an exact string: two correct answers to "how long is a
   term" differ in every word but the number. What is pinned is
   the figure, because the figure is the part `grounded()` is
   there to protect.

   Measured on the corpus as it stood in September 2026, three
   passes each:

     gpt-5.6-luna   30/30   2.6–4.4s a question   ← the default
     gpt-5.6-terra  30/30   2.5–4.3s a question
     gpt-5.6-sol    29/30   said nothing at all on the recall
                            threshold, once
     gpt-4.1-mini   30/30   the previous default
     gpt-4o-mini    28/30   answers the recall threshold with the
                            bottom of the sliding scale, 10%, which
                            is right only in the largest cities and
                            wrong in most of the region

   The 5.6 family will not take function tools on this endpoint
   without `reasoning_effort: 'none'`; `model.ts` adds it when a
   host asks for it.
   ============================================================ */

import { answer } from './answer'

/** A question, and what any correct answer to it has to carry. */
const CASES: [question: string, wants: RegExp][] = [
	['how many kagawad does a barangay elect?', /\bseven\b|\b7\b/i],
	['how much is the cedula?', /₱?20\b/],
	['is the anti dynasty rule in effect yet?', /2028/],
	['how many signatures are needed to recall a mayor?', /25\s?(per cent|%)/i],
	['how long does barangay mediation take?', /15\s?days/i],
	['how much does a barangay captain get paid?', /5,000/],
	['how many barangays are in marawi?', /\b96\b/],
	['how many tanods can a barangay have?', /\b30\b/],
	['when is the deadline to pay real property tax?', /march|31/i],
	['what is the term of a mayor?', /three|3\b/i],
]

const model = process.env.AI_MODEL || 'the configured model'
let right = 0
let spent = 0
const missed: string[] = []

for (const [question, wants] of CASES) {
	const started = Date.now()
	let said = ''
	try {
		const reply = await answer([{ role: 'user', text: question }])
		said = (reply as { say?: string }).say ?? ''
	} catch (error) {
		said = `threw — ${String(error).slice(0, 60)}`
	}
	spent += Date.now() - started
	if (wants.test(said)) right += 1
	else missed.push(`  ${question}\n    → ${said.slice(0, 90) || '(said nothing)'}`)
}

console.log(`${model} — ${right}/${CASES.length} correct, ${Math.round(spent / CASES.length)}ms a question`)
for (const miss of missed) console.log(miss)

// One wrong answer is a bad run; three is a model that cannot do this job.
if (right < CASES.length - 2) {
	console.error(`\n${CASES.length - right} of ${CASES.length} wrong — this model is not answering from the records.`)
	process.exit(1)
}
