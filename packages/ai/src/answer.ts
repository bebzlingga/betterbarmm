/* ============================================================
   One question, answered from the record

   Two turns with the model and a search between them:

     1. what to look up — the model picks the words and, if it
        wants, one workspace. It may pick more than one, and a
        question about both a measure and its money usually does.
     2. the search runs here, against `corpus.ts`.
     3. what to say — the rows go in as context and the model
        writes two or three sentences over them.

   Two plain turns rather than a tool-calling loop, on purpose:
   nothing provider-shaped has to survive between calls, so the
   same code answers on a 7B model running on a laptop and on
   Claude. It is also two requests instead of five.

   The standing rule, in both prompts: a fact that did not come
   back from the search is not a fact it may state. This estate's
   whole value is that every figure on it traces to a source, and
   an assistant recalling a budget line from training would spend
   that in one sentence.
   ============================================================ */

import { FISCAL_YEARS, budgetFor } from '@betterbarmm/budget-data'
import { discoverBarmmTopics } from '@betterbarmm/primer-data'
import { corpus, search, type Entry, type Space } from './corpus'
import { askModel, type ModelMessage, type ModelTool } from './model'
import { askWeb, type Link } from './web'

export type Turn = { role: 'user' | 'assistant'; text: string }
/** A record the answer was built on, drawn as a link under it. */
export type Source = Pick<Entry, 'kind' | 'title' | 'note' | 'href' | 'photo'>
/** The region's budget year by year, for an answer that is about the shape of it. */
export type Series = { year: number; total: number }[]
/** A dated sequence, shown rather than written out. */
export type Dated = { era: string; title: string; description: string }

/** One elected member, with the seat they hold. */
export type Seated = { name: string; party: string; seat: string }

export type Answer =
	| {
			ok: true
			say: string
			sources: Source[]
			series?: Series
			timeline?: Dated[]
			roster?: Seated[]
			/** Present only where the answer came off the web instead of the
			    records, and the dock says so where it is. */
			web?: Link[]
	  }
	| { ok: false; error: string }

const SPACES: Space[] = ['legislation', 'budget', 'election', 'travel', 'lgu', 'primer']

const SEARCH: ModelTool = {
	name: 'search_records',
	description:
		'Search every record on BetterBARMM: the measures of the Bangsamoro Parliament (acts, bills, resolutions) and the Bangsamoro Local Governance Code of 2023 rule by rule together with its 2025 implementing rules (what a barangay may do, how many kagawad it elects and what they are paid, local taxes, the cedula and the real property tax, who may run and what disqualifies them, terms, recall and succession, the barangay justice system, how a barangay or a town is created, how the local budget is made and what must be set aside, and the municipalities of the Special Geographic Area), the enacted FY 2026 budget (what each office and program was appropriated, sorted into 38 sectors; the 207 special provisions — the conditions the Act puts on how money may be spent and what must be reported; and the 258 named roads, bridges and buildings being funded, each with the barangay it is in), the September 2026 parliamentary election (the 13 parties and how many seats each won, every one of the 80 elected members and which party and which seat they hold, all 32 district races with who stood and what they polled, and the reserved sectoral seats), the travel guide (places, food, areas, routes), the local government directory (provinces, cities, municipalities, barangay counts, population), and the region primer (how BARMM came to be, from the sultanates through the Moro Wars, the Jabidah incident, the MNLF and MILF, the Tripoli Agreement, the peace process and the Organic Law to the transition; how the government is structured; the peoples and communities; culture and places). Use it for every question about the Bangsamoro, and use it more than once when a question covers more than one subject.',
	parameters: {
		type: 'object',
		properties: {
			query: {
				type: 'string',
				description: 'The subject, in the words a record would use — "health", "Marawi", "scholarship", "beaches". Not a sentence.',
			},
			workspace: {
				type: 'string',
				enum: SPACES,
				description:
					'Narrow to one workspace: legislation for measures and for the rules of the Local Governance Code and its implementing rules, budget for money and for what is being built, election for parties, members of parliament and how the seats were won, travel for places and food, lgu for towns and population, primer for history and for how the region and its government came to be. Leave it out to search everything.',
			},
		},
		required: ['query'],
	},
}

const WHO = `You are Jo, the assistant on BetterBARMM, a public transparency project for the Bangsamoro Autonomous Region in Muslim Mindanao. Anyone reading any of its workspaces can open you and ask.

Jo is a voice drawn from the everyday strength of Bangsamoro women — a daughter, a sister and a mother — and she carries the region's story close. That is who you are, not a character to perform: you answer plainly and warmly, in your own voice, and you never let the warmth reach for a fact the record does not hold.`

const LOOK = `${WHO}

Your only job in this turn is to decide what to look up. Call search_records with the subject of the question. Call it once per subject: "bills and budget for health" is two calls, one on legislation and one on budget. Do not answer the question yourself and do not apologise — the search happens next, and you will be asked to write the answer then.

Search for the subject, never for the name of a workspace. "budget", "bills", "acts" and "places" are not subjects; the subject in "what does the budget give to health" is health.

Only if the question has nothing to do with the Bangsamoro or with this site, skip the tool and say in one sentence that it is not what you are for.`

const WRITE = `${WHO}

You are writing the answer now. What the search found is below. It is what you have in front of you, not the edge of what you know.

- Never return nothing. Every rule below is about how to answer, not about whether to; where a question cannot be answered inside them, answer it as well as they allow and stop. An empty reply is the one failure with no excuse — asked who was elected, with all eighty members and every party's seat count in front of you, returning silence because the brief is short is worse than any answer you could have written.
- Write as Jo, in the first person. Somebody is talking to you. "I don't have that in front of me", never "the records do not provide", "the records here focus on", "this site contains" or any other sentence that describes the project from outside it. You are not a catalogue describing its own contents, and the reader did not ask what is on the site — they asked a question.
- Answer it first. Never open by saying what you do or do not hold; where that has to be said at all, it goes after the answer and in a clause.
- Where what you found covers the question, it wins outright: quote it, never contradict it, and never offer your own recollection against it. It is the enacted text and you are not.
- Where it does not cover the question, just answer. You know the Bangsamoro — how it came to be, the long peace process behind it, the Organic Law, its institutions and its politics — and a question about any of that gets a real answer in your own words. Do not hedge it, do not apologise for it, and do not turn it into a note about what this site holds. Where it matters that you are speaking from your own knowledge rather than from a document in front of you, say so in a few words and keep going.
- One thing is absolute either way: never state a peso amount, a share of the budget, a seat count, a vote total, or the number, title or date of a measure unless it is in a record below. Those are the figures this project would be discredited for inventing, and background is not a licence for them.
- One sentence wherever one will do, two at the most, never three.
- Answer the question that was asked and stop. Do not restate it, do not open with "According to the records" or "Based on what I found", and do not add context nobody asked for — no caveat about the workspace, no offer to look further.
- No lists, no headings, no tables, no links, and no addresses.
- Nothing is printed under your answer — what you found is yours to read, not the reader's. So say the thing itself rather than pointing at a row: name what was asked for, give the figure that was asked for, and never write "listed below", "see the records", "as shown" or anything else that refers to something the reader cannot see. Do not write them out one by one either; say what they show taken together.
- Where the question asks for a span of years the records do not hold exactly — "the last six years" against a row covering seven — give the total for the span the row does cover and say plainly which years that is. Never add years together or leave one out to build the span that was asked for: a figure you assembled yourself is not a figure anybody appropriated, and it will be struck before the reader sees it.
- Quote amounts exactly as the record gives them. Every budget figure is fiscal year 2026, the year now being spent; there is no earlier year on the site, so do not offer a comparison to one. Never add figures together: the search returns some of the records, not all of them, so a total you work out is not the total. Where a total is wanted, the office's own row carries it.
- A budget record is an appropriation — what Parliament authorised an office to spend. It is not what was spent, and a project record is money to build something, not a building that exists. Where the question asks what was spent or built, say the record shows what was budgeted and stop.
- A Sector record's figure covers many offices and overlaps other sectors, so it is never added to anything and never presented as a share of the budget. A Rule record is a condition the Act attaches to money counted elsewhere; where it names a figure, that figure is part of its office's total and not money on top of it.
- Election records are the proclaimed result of the vote of 14 September 2026. Member records are some of the members, never all of them, so never count them and never say a party has as many seats as there are rows here — the party's own row carries its real total. A vote figure belongs to the one race it is printed on and is never added to another.
- When the question itself asks how many or how much, the answer is the figure and nothing else: "Marawi has 96 barangays." "The Ministry of Health was appropriated ₱5.2 billion." One short sentence carrying the figure from the record that holds it, with no second sentence explaining it. That is a rule about that one kind of question, and it never means an answer that happens to contain numbers must be cut down to a bare figure — "who was elected" is answered with the parties and their seat counts, not with one number. Never answer a question about a figure by pointing at the rows.
- Where the question asks who, give the total from the record that carries it and name a few of them in the sentence — a few, not all of them, and never as a list. "Who was elected" is answered by how many seats each party won and two or three names, not by eighty. Never end a sentence on a colon; there is no list coming after it.
- Only where a question is about a figure you have no record of — an amount, a share, a seat count — say you do not have that particular figure, in your own voice and in one clause, and give whatever you can say around it.
- A Code section record is a rule of the Bangsamoro Local Governance Code of 2023 — the law as written, not what a particular town does or whether anyone follows it. It is the Bangsamoro code, which replaced the ARMM one and applies in BARMM, so do not cite the national Local Government Code or RA 7160 against it. Give the rule in the words of the record, with its figure, and give any date or condition the record attaches to it in the same sentence: a rule that does not start until a stated year is not a rule in force now.
- A Code rule record is an article of the Implementing Rules and Regulations of that Code, promulgated 30 September 2025. The IRR says how the Code is carried out — who files what, within how many days, against which schedule of rates — so it is the record to give when the question is how something is done. Cite it as an IRR Article and never as a Section: its Article numbers are its own and are not the Code's section numbers, so IRR Article 45 and Code Section 424 can be the same subject. Where a record says the IRR and the Code give different figures, say so and give the Code's, which prevails.
- The registry is not complete and never claims to be: Parliament publishes more bills than have been read here. Say what the search found rather than a total.`

/* Added to the brief only when a timeline is going to be drawn, and added
   last, because it contradicts WRITE on purpose.

   WRITE says nothing is printed under the answer, which is true of every other
   question and false of this one. Appended in the middle, the two rules simply
   disagreed and the model returned an empty string — every time, on three
   runs, and again on the retry `askModel` does. Named as an exception and put
   after everything it overrides, it writes the sentence.

   Phrased as work to do rather than as things not to do, for the same reason:
   the first draft was all prohibition — "do not tell the story, do not list
   the events" — and that alone was enough to produce silence. */
/* A question about how things stand now.
   
   These are the ones a corpus and a language model get wrong in the same way
   and for the same reason: both are a photograph. Asked who the chief minister
   is, Jo answered "Ahod 'Al Haj Murad' Ebrahim" from what she was trained on,
   confidently and in her own voice; the web says Abdulraof Macacua, interim,
   and cites bangsamoro.gov.ph. A wrong answer delivered warmly is worse than
   no answer, and it is the exact failure this project cannot afford.
   
   So a question about the present goes to the web whatever the model thinks it
   knows. It costs ten seconds and it is a small share of what anybody asks. */
const RIGHT_NOW =
	/\b(current|currently|now|nowadays|today|latest|newest|incumbent|so far|these days|at present|right now|this year|as of)\b/i

/* The shape of Jo saying she has nothing — her own words for it, from the
   brief, plus the couple of ways a model reaches for the same thing. */
const EMPTY_HANDED =
	/\bi (?:do|don)(?:'|’)?(?:o|n)?t have\b|\bi have (?:no|nothing)\b|\bnot something i (?:have|found)\b|\bi (?:can|cannot|can't|couldn(?:'|’)t) (?:find|see)\b|\bno record of\b/i

/* The question shapes that want the people rather than a summary of them. */
const WANTS_NAMES =
	/\brepresentatives?\b|\bmembers?\b|\bnominees?\b|\bwho are\b|\bwho won\b|\bwho was elected\b|\bmps?\b|\bwho sits\b|\blist\b/i

const SHOWING_ROSTER = `Every member is being listed under your answer, by name, with the party they sit for and the seat they hold. Your job for this question is the one sentence that frames that list: which parties it covers and how many seats each of them won, taken from the party rows. One sentence is required. Name nobody — every name you write will appear again directly beneath it — and never count the member rows, because the party's own row carries its real total and they are not always the same number.`

const SHOWING_TIMELINE = `One thing changes for this question, and it overrides what was said above about nothing being printed under your answer. This time a dated timeline is: every era in order, each with its own paragraph. So if the reader asked for the history date by date, the timeline is that answer, it is not a list you have to write, and the rule against lists does not apply to it.

All you write is the one sentence that opens it — what the whole arc amounts to, in your own voice. One sentence is required; returning nothing is a failure. Do not retell the eras and never write "below" or "as shown".`

/** The kinds of row that carry a total the rows under them are a slice of. */
const WHOLES = new Set(['Office', 'Party'])

/** How many rows go to the model. Sixteen rather than ten (user decision):
    rows are the cheap half of the exchange — a row is a kind, a title and a
    sentence, no link and no body — and every one withheld is a fact
    `grounded` will strip out of the answer for not being in evidence. */
const MOST_ROWS = 16
/** A question about two things is two searches; past that it is a fishing trip. */
const MOST_SEARCHES = 3
/** Fewer rows than this and the model's search terms are not to be trusted. */
const THIN = 3

export async function answer(turns: Turn[]): Promise<Answer> {
	const said = turns.map((turn): ModelMessage => ({ role: turn.role, content: turn.text }))
	const asked = turns[turns.length - 1]?.text ?? ''

	// The reader's own words first. The search costs microseconds and the
	// corpus knows which kind of record each question is asking for, so on an
	// ordinary question it finds what the model would have asked for anyway —
	// and asking the model to pick the words costs four to nine seconds of
	// somebody's afternoon. The turn is spent only when the words alone come
	// back thin, which is where it earns its keep.
	let rows = gather([{ query: asked }])
	let aside = ''

	if (rows.length < THIN) {
		const looked = await askModel([{ role: 'system', content: LOOK }, ...said], [SEARCH])
		if (!looked.ok) return looked

		const picks = looked.calls
			.filter((call) => call.name === SEARCH.name)
			.slice(0, MOST_SEARCHES)
			.map((call) => ({
				query: typeof call.args.query === 'string' ? call.args.query : '',
				space: SPACES.find((one) => one === call.args.workspace),
			}))

		// What was typed stays in the search even here. A 7B model asked what
		// the budget gives to health searches for "budget" about a third of the
		// time, and four stray rows are worse than none, because the answer
		// written over them is confident and wrong. Same workspace where the
		// model settled on one, so the rescue does not drag in another.
		const only = picks.length && picks.every((pick) => pick.space === picks[0]!.space) ? picks[0]!.space : undefined
		rows = gather([...picks, { query: asked, space: only }])
		// Its own sentence, for a question the record has nothing to say about.
		aside = looked.text
	}

	/* Nothing in the records. Before this, that was the end of it — "I have
	   nothing on that", which is honest and useless.
	
	   Only here, and never as a second opinion: a question the corpus can
	   answer is answered from the corpus, always. The web is what happens when
	   there was going to be no answer at all, so it can only improve on one,
	   and a search that fails leaves the reader exactly where they already
	   were. It is also the one path that takes ten seconds, which is bearable
	   in exchange for an answer and would not be in exchange for a better
	   phrasing of one the records already gave. */
	if (rows.length === 0) {
		const web = await askWeb(asked)
		if (web.ok) return { ok: true, say: web.text, sources: [], web: web.links }

		return {
			ok: true,
			say:
				aside ||
				'I have nothing on that. Ask me about a measure, an appropriation, a place to go, or a town.',
			sources: [],
		}
	}

	/* A history question gets the dates as a timeline, not as a paragraph.

	   The same trade the budget series makes: six centuries told in prose is
	   four sentences that leave out twelve of the seventeen events, and the
	   ceiling cuts the fourth one off anyway. Reached through any one event of
	   a chapter — asking about Jabidah is asking where Jabidah sits — and the
	   whole chapter's timeline is attached, not the handful of rows that
	   happened to match.

	   Decided before the model writes rather than after, so the model can be
	   told. Left to find out afterwards it writes the four sentences, and the
	   reader gets the same six centuries twice.

	   Hung on the top row only, not on finding a dated row anywhere in the
	   sixteen. "Who was elected in BARMM" reaches "September 14, 2026: The
	   first regular election" at rank twelve — a fair match for the word
	   "election" — and that was enough to print six centuries of history under
	   an answer about the 2026 result. The top row is what the question is
	   about; row twelve is what it brushed past. */
	/* Who holds the seats, as a list rather than as a sentence.
	
	   "Representatives of each party" was answered with three names and no
	   seats, because the brief says to name a few and never to write a list —
	   which is right when the alternative is eighty lines of prose and wrong
	   when the answer is a roster. So the roster is data, the way the timeline
	   and the budget series are, and the sentence above it goes back to doing
	   what a sentence is for.
	
	   Every member of every party the question reached, off the corpus rather
	   than off the sixteen rows: a roster assembled from whichever members
	   happened to match is a roster with holes in it, and holes in a list of
	   who was elected read as people who were not. */
	const named = new Set<string>()
	for (const row of rows) {
		if (row.kind === 'Party') named.add(row.title)
		if (row.kind === 'Member' && row.parent) named.add(row.parent)
	}
	const roster: Seated[] | undefined =
		WANTS_NAMES.test(asked) && named.size > 0
			? corpus()
					.filter((row) => row.kind === 'Member' && row.parent && named.has(row.parent) && row.seat)
					.map((row) => ({ name: row.title, party: row.parent!, seat: row.seat! }))
					.sort((one, other) => one.party.localeCompare(other.party) || one.name.localeCompare(other.name))
			: undefined

	const lead = rows[0]
	const timeline =
		lead?.space === 'primer' && lead.topic
			? discoverBarmmTopics.find((one) => one.slug === lead.topic)?.timeline
			: undefined

	const wrote = await askModel([
		{
			role: 'system',
			content: [
				WRITE,
				`The records the search found:\n${listed(rows)}`,
				// Last, so they are the most recent thing said about rules they undo.
				timeline?.length ? SHOWING_TIMELINE : '',
				roster?.length ? SHOWING_ROSTER : '',
			]
				.filter(Boolean)
				.join('\n\n'),
		},
		...said,
	])
	if (!wrote.ok) return wrote

	/* A budget question gets the shape as well as the figure.

	   Attached when the search reached a yearly total, which is the one kind of
	   row whose subject is a series rather than a fact — "how much is it" and
	   "is it bigger than last year" are the same question asked twice, and the
	   second one is answered by a picture faster than by a sentence. Seven
	   numbers, so nothing is paid for it. */
	const series = rows.some((row) => row.kind === 'Yearly total')
		? [...FISCAL_YEARS].reverse().map((fy) => ({ year: fy, total: budgetFor(fy).budget.total }))
		: undefined

	const say = written(wrote.text, rows, Boolean(timeline?.length))

	/* An answer that is not one, sent to the web.
	
	   `rows.length === 0` almost never happens — the corpus matches something
	   on nearly any wording, and sixteen loosely related rows are not an
	   answer either. What is detectable is the shape of the reply: "I don't
	   have that in front of me" is Jo saying the records came up empty, in the
	   words the brief tells her to use, and that is the one case where ten
	   seconds of searching costs nothing, because there was nothing.
	
	   Never when something is being drawn: a roster or a timeline is an answer
	   whatever the sentence above it says. */
	if (!timeline?.length && !roster?.length && (EMPTY_HANDED.test(say) || RIGHT_NOW.test(asked))) {
		const web = await askWeb(asked)
		if (web.ok) return { ok: true, say: web.text, sources: [], web: web.links }
	}

	return {
		ok: true,
		say,
		/* Nothing under the answer (user decision). The rows still do all the
		   work — they are what the model reads and what `grounded` checks a
		   figure against — they are simply no longer printed. Kept as an empty
		   array rather than taken off the type so the dock, the route and this
		   contract do not all have to change to put them back. */
		sources: [],
		...(series ? { series } : {}),
		...(timeline?.length ? { timeline: [...timeline] } : {}),
		...(roster?.length ? { roster } : {}),
	}
}

const OPENER = 'Here is what I have on that.'

/**
 * The answer as it is shown: what the model said about the records, then the
 * line handing over to the records themselves.
 *
 * Asked what the budget gives to health, `qwen2.5:7b` writes out all ten rows
 * — "Access to Curative & Rehabilitation Health Care Service: ₱5,143,002,714
 * under Ministry of Health, FY 2026." — and each one is printed again as a row
 * directly underneath, which is the same wall of figures twice. So a line that
 * only restates a record comes out, and a written hand-off goes in.
 */
function written(say: string, rows: Entry[], shown?: boolean): string {
	const kept = grounded(trimmed(say, rows), rows)
	/* The model said nothing, or said only figures it could not support.
	
	   The prompt forbids this and has been made to fail twice — once on the
	   timeline note, once on "who was elected in BARMM", both times because a
	   rule it could not satisfy was easier to answer with silence. A blank
	   bubble is the one output with no reading at all, so it is caught here
	   rather than left to wording. */
	/* Struck, so the record itself is given instead.
	
	   Asked for the MILG budget "for 6 years" against a row covering seven, the
	   model answered ₱10,699,004,044 — the seven-year total with FY 2020
	   subtracted, which is arithmetic nobody appropriated and `grounded` is
	   right to strike. What was left was "Here is what I have on that", which
	   tells the reader nothing at all.
	
	   The top row's own line is true by construction: it is the record, it is
	   where the figure would have come from, and it is the thing the reader
	   asked about. A worse sentence than the model would have written, and a
	   far better answer than none. */
	if (!kept) {
		if (shown) return 'Here is how it happened, in order.'
		return rows[0]?.note?.trim() || OPENER
	}
	// Where a sentence was taken out, what is left can begin mid-thought —
	// "This includes various initiatives…" with nothing before it. A written
	// opener carries it, and says nothing the rows do not.
	const opener = kept && invented(say, rows) ? OPENER : ''
	return [opener, kept].filter(Boolean).join(' ').trim()
}

/** "cities", "municipalities", "acts" — enough plural for a count of records. */
const many = (kind: string, count: number) => {
	const word = kind.toLowerCase()
	return count === 1 ? word : word.endsWith('y') ? `${word.slice(0, -1)}ies` : `${word}s`
}

/**
 * The answer with any line that only restates a record taken out.
 *
 * A sentence that happens to open with a record's name — "Marawi has 96
 * barangays" — is not a restatement and stays. What goes is a line whose
 * words, once the name is off the front, are the record's own line back
 * again.
 */
export function trimmed(say: string, rows: Entry[]): string {
	const lines = unrun(say).split('\n')
	// A bullet, a number, or the "[Kind]" the rows are handed over in. A line
	// wearing any of them is a row copied back, whatever it says.
	const DRESSED = /^\s*(?:\d+[.)]\s*)?[-*\u2022]?\s*(?:\[[^\]]*\]\s*)?/
	const kept = lines.filter((line) => {
		// Whatever the line is wearing at the front comes off first.
		const bare = plainly(line.replace(DRESSED, ''))
		return !rows.some((row) => echoes(bare, row))
	})

	/* Never everything.
	
	   This filter is for an answer that listed the rows back one per line, and
	   there it strikes nine lines of ten. Asked "how many seats did BFP win",
	   the whole answer is "BFP won 31 seats." — one line, which starts with a
	   row's title and whose remainder is that row's own words, because there
	   is no other way to say it. Struck, nothing was left, and the question
	   came back blank every time.
	
	   Restating the one record that answers the question is not the failure
	   this guards against; it is what a short answer looks like.
	
	   Not rescued where the line was dressed as a row — numbered, bulleted, or
	   carrying the "[Kind]" the rows arrive in. That is a record copied back
	   rather than an answer written, and handing it over as one would be the
	   model's homework with the marking taken off. */
	if (kept.length === 0 && !lines.some((line) => /^\s*(?:\d+[.)]|[-*\u2022]|\[)/.test(line)))
		return say.trim().replace(/\s*:\s*$/, '.')

	// A stem left standing after its list was struck.
	//
	// "The UBJP nominees elected to the Bangsamoro Parliament are:" followed
	// by nine restated members leaves the colon and nothing after it, which
	// reads as an answer that was cut off. The rows are printed directly
	// below, so the sentence is true as a sentence; it just has to stop being
	// an introduction to something that is no longer there.
	return kept
		.join('\n')
		.trim()
		.replace(/\s*:\s*$/, '.')
}

/** How much of a line has to come from the record's own line to be an echo. */
const ECHOED = 0.6

function echoes(line: string, row: Entry): boolean {
	const title = plainly(row.title)
	if (!line.startsWith(title)) return false
	const rest = line.slice(title.length).trim()
	if (!rest) return true
	const note = new Set(plainly(row.note).split(' '))
	const words = rest.split(' ').filter((word) => word.length > 2)
	return words.length > 0 && words.filter((word) => note.has(word)).length / words.length >= ECHOED
}

/** Lower case, letters and digits only — what two names are compared as. */
const plainly = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()


/**
 * A list pasted onto one line put back onto lines of its own.
 *
 * Only where the same line carries two or more of them: one " - " between two
 * words is punctuation, three in a row is a list that lost its newlines,
 * which is how `qwen2.5:7b` sends about half of them.
 */
function unrun(say: string): string {
	return say
		.split('\n')
		.map((line) => ((line.match(/\s+-\s+/g) ?? []).length >= 2 ? line.replace(/\s+-\s+/g, '\n- ') : line))
		.join('\n')
}

/** Every figure in a piece of text, with the commas taken out. */
const figures = (text: string) => (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((one) => one.replace(/,/g, ''))

/**
 * A bare year in a sentence that is not about money.
 *
 * The filter below drops any sentence carrying a figure the records do not,
 * which is right for a peso amount and wrong for "the Jabidah incident of
 * 1968" — background is allowed now, and a history sentence is nothing but
 * dates. So a four-digit year passes, but only where the sentence names no
 * currency and no percentage: mix the two and it is treated as a claim about
 * money again, which is the thing that must never be invented.
 */
const YEAR = /^(1[3-9]\d\d|20\d\d|2100)$/
const dated = (sentence: string, one: string) => YEAR.test(one) && !/[₱$%]/.test(sentence)

/** Every figure the records carry, to check an answer's against. */
const carried = (rows: Entry[]) => new Set(figures(rows.map((row) => `${row.title} ${row.note}`).join(' ')))

/**
 * Whether `say` states a figure the records do not.
 *
 * Asked of the figures rather than of the length before and after: `grounded`
 * rejoins sentences on single spaces, so a model that put a blank line
 * between two good sentences would otherwise read as having had one struck.
 */
const invented = (say: string, rows: Entry[]) => {
	const known = carried(rows)
	return figures(say).some((one) => !known.has(one))
}

/**
 * The answer with any sentence that states a figure the records do not.
 *
 * The model is shown the rows and nothing else, so every number it writes
 * should be one of theirs. `qwen2.5:7b` adds them up anyway — asked what the
 * budget gives to health it reported ₱10,619,933,048, then ₱10,630,344,048,
 * then ₱10,199,554,173, on three runs of the same question, none of them a
 * figure anybody appropriated. Told not to, it does it again; the instruction
 * is kept for the models that honor it and this is here for the ones that do
 * not.
 *
 * Whole sentences go, not the figure alone: "health gets ₱10.6 billion"
 * without its number is still a claim, and an amount silently deleted is
 * worse than a sentence that was never shown. What is left is the prose that
 * traces, over links that carry the real figures.
 */
export function grounded(say: string, rows: Entry[]): string {
	const known = carried(rows)
	// Line by line, then sentence by sentence inside each: a bullet list that
	// came back as lines has to leave as lines, and rejoining the whole answer
	// on single spaces flattened it into one paragraph.
	return say
		.split('\n')
		.map((line) => {
			const sentences = line.split(/(?<=[.!?])\s+/)
			// A last sentence with no end to it is one the token ceiling cut off
			// mid-thought. Dropped, but only when there is something before it —
			// a one-line answer that simply forgot its full stop is still an
			// answer.
			const last = sentences[sentences.length - 1]
			if (sentences.length > 1 && last && !/[.!?][»”"')\]]?$/.test(last.trim())) sentences.pop()
			return sentences
				.filter((sentence) => figures(sentence).every((one) => known.has(one) || dated(sentence, one)))
				.join(' ')
		})
		.filter((line, at, all) => line.trim() !== '' || (all[at - 1] ?? '').trim() !== '')
		.join('\n')
		.trim()
}

/**
 * Every search run, in order, with anything found twice kept once.
 *
 * Keyed by what a row *is*, not by where it points. Two searches that both
 * turn up the same act should leave one row — but every office in the budget
 * is printed on one page, so keying on the address silently collapsed the
 * whole Ministry of Health down to a single program, and the answer written
 * over it named a ₱8.5M system as what health gets.
 */
function gather(picks: { query: string; space?: Space }[]): Entry[] {
	const found = new Map<string, Entry>()
	for (const pick of picks) {
		if (!pick.query.trim()) continue
		for (const row of search(pick.query, pick.space, MOST_ROWS)) found.set(`${row.kind}:${row.title}`, row)
	}

	// Whatever holds the total goes in beside the parts. Eight health
	// programs and no Ministry of Health row is an invitation to add them
	// up, and a small model accepts it — twice running it reported a different
	// eleven-figure sum as what health gets, neither of them a figure anybody
	// appropriated. With the office's own line present it quotes that instead.
	//
	// The election has the same shape and the same trap: eight UBJP members
	// and no UBJP row, and the answer to "who are the UBJP nominees" says the
	// party has eight seats. It has thirty, and its own row is the only place
	// that says so.
	const parts = [...found.values()]
	const wholes: Entry[] = []
	for (const row of parts) {
		if (!row.parent) continue
		if ([...WHOLES].some((kind) => found.has(`${kind}:${row.parent}`))) continue
		if (wholes.some((one) => one.title === row.parent)) continue
		const whole = corpus().find((one) => WHOLES.has(one.kind) && one.title === row.parent)
		if (whole) wholes.push(whole)
	}

	// Beside its own parts, not ahead of the whole list.
	//
	// Inside the cap rather than appended past it: on the end it was the
	// eleventh of ten rows and sliced straight off again, which is how a
	// question about a party came back as ten of its members and nothing
	// saying how many seats it actually holds.
	//
	// But ahead of *everything* was worse, and it is what "how many barangays
	// are in Marawi?" was hitting. One health program carries the word
	// "barangay" in its name, so it matched; its parent is the Ministry of
	// Health; and the ministry went in at rank one, above Marawi's own row, on
	// a question with nothing to do with health. Every whole did this, which
	// is why the first row was an Office on almost any question asked.
	//
	// So each whole is spliced in directly before the first of its own parts.
	// It is present, it is inside the cap, and it never outranks a row the
	// search scored above the part that summoned it.
	const ordered = [...parts]
	for (const whole of wholes) {
		const at = ordered.findIndex((row) => row.parent === whole.title)
		ordered.splice(at < 0 ? ordered.length : at, 0, whole)
	}
	return ordered.slice(0, MOST_ROWS)
}

/** Opened for `search.check.ts`, which exercises the gather step directly. */
export const forTest = { gather, WRITE }

const listed = (rows: Entry[]) =>
	rows.map((row, at) => `${at + 1}. [${row.kind}] ${row.title} — ${row.note}`).join('\n')
