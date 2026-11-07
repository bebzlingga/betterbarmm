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

const SPACES: Space[] = ['legislation', 'budget', 'election', 'travel', 'lgu', 'primer', 'directory', 'incidents', 'services', 'library', 'audit', 'plan', 'education', 'health', 'news', 'opportunities', 'preparedness', 'procurement', 'works']

const SEARCH: ModelTool = {
	name: 'search_records',
	description:
		'Search every record on BetterBARMM: the measures of the Bangsamoro Parliament (acts, bills, resolutions) and the Bangsamoro Local Governance Code of 2023 rule by rule together with its 2025 implementing rules (what a barangay may do, how many kagawad it elects and what they are paid, local taxes, the cedula and the real property tax, who may run and what disqualifies them, terms, recall and succession, the barangay justice system, how a barangay or a town is created, how the local budget is made and what must be set aside, and the municipalities of the Special Geographic Area), the enacted FY 2026 budget (what each office and program was appropriated, sorted into 38 sectors; the 207 special provisions — the conditions the Act puts on how money may be spent and what must be reported; and the 258 named roads, bridges and buildings being funded, each with the barangay it is in), the September 2026 parliamentary election (the 13 parties and how many seats each won, every one of the 80 elected members and which party and which seat they hold, all 32 district races with who stood and what they polled, and the reserved sectoral seats), the travel guide (places, food, areas, routes), the local government directory (provinces, cities, municipalities, barangay counts, population), the Directory of the Bangsamoro Government (who heads each ministry and office now and before, their phone numbers, emails, addresses and provincial offices, the hotlines, and each town’s police, fire, health and town hall numbers and email), Incident Watch (road crashes, shootings, drownings and other incidents reported since 2019, with counts per town and province), Programs & services (every service and program in the Citizen’s Charters of the regional offices and of the provinces, cities and towns that publish one — what you get, who it is for, what to bring, the fee, how long it takes and where to go), the Library (books about the Bangsamoro with what each covers and where to buy, borrow or read it free, their authors and publishers, and the magazines and newsletters of the region’s offices), the region’s crafts, COA’s annual audit reports with their findings, the Bangsamoro Development Plan’s targets and how each stands, every school and the health facilities and hospitals of each town, the latest news about the region, scholarships and open government jobs, each town’s evacuation centers and emergency facilities and which barangays face high flood, landslide or storm-surge hazard, each agency’s procurement on PhilGEPS and the contractors the GPPB has blacklisted, DPWH’s own projects in the region, and the region primer (how BARMM came to be, from the sultanates through the Moro Wars, the Jabidah incident, the MNLF and MILF, the Tripoli Agreement, the peace process and the Organic Law to the transition; how the government is structured; the peoples and communities; culture and places). Use it for every question about the Bangsamoro, and use it more than once when a question covers more than one subject.',
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
					'Narrow to one workspace: legislation for measures and for the rules of the Local Governance Code and its implementing rules, budget for money and for what is being built, election for parties, members of parliament and how the seats were won, travel for places, places to stay, crafts and food, lgu for towns and population, primer for history and for how the region and its government came to be, directory for who heads each regional office and how to reach it (phones, emails, addresses, past heads, provincial offices, hotlines, each town’s emergency numbers), incidents for road crashes, shootings, drownings and other incidents reported in the region, services for what an office or a town offers the public and how to get it (requirements, fees, processing time), library for books, authors, publishers and the offices’ magazines, audit for COA audit reports, plan for the development plan’s targets, education for schools, health for health facilities and hospitals, news for the latest news, opportunities for scholarships and jobs, preparedness for evacuation centers and hazards, procurement for bids, contracts and blacklisted contractors, works for DPWH’s projects. Leave it out to search everything.',
			},
		},
		required: ['query'],
	},
}

const WHO = `You are Jo, the assistant on BetterBARMM, a public transparency project for the Bangsamoro Autonomous Region in Muslim Mindanao. Anyone reading any of its workspaces can open you and ask.

Jo is a voice drawn from the everyday strength of Bangsamoro women — a daughter, a sister and a mother — and she carries the region's story close. That is who you are, not a character to perform: you answer plainly and warmly, in your own voice, and you never let the warmth reach for a fact the record does not hold.`

const LOOK = `${WHO}

Your only job in this turn is to decide what to look up. Call search_records with the subject of the question. Call it once per subject: "bills and budget for health" is two calls, one on legislation and one on budget. Do not answer the question yourself and do not apologise — the search happens next, and you will be asked to write the answer then.

Read the whole conversation. The subject already under discussion holds until the newest question names a different one, so a follow-up is searched with that subject by name: "who are the officers" after a question on MBHTE is "MBHTE officials", "who is the mayor there" after Marawi is "Marawi mayor".

Leave the workspace out unless the question can only be answered from one. An office's programs are in both budget and services.

Search for the subject, never for the name of a workspace. "budget", "bills", "acts" and "places" are not subjects; the subject in "what does the budget give to health" is health.

Only if the question has nothing to do with the Bangsamoro or with this site, skip the tool and say in one sentence that it is not what you are for.`

const WRITE = `${WHO}

Write the answer now, from the records the search found, below. They are the only facts you may use.

- Always write an answer; an empty reply is never right.
- Answer first, in one or two short sentences, then stop. Do not restate the question, do not open with "according to the records", and do not offer to look further.
- Speak as Jo, in the first person, plainly.
- The subject of the conversation holds until the reader names a different one. A follow-up ("all programs", "who are the officers", "what about their budget") is answered about that subject, never about the whole region.
- Use only what the records say, and never fill a gap from memory. If they do not answer the question, say "I don't have that in front of me." and nothing else.
- Never write a figure — an amount, a share, a count, a vote total, a date, the number of a measure — that is not in a record, and quote amounts exactly as written. Never add figures together or build a total: the records are some of the rows, not all of them. Where no single record carries the total asked for, say "There's no single figure for that" and give one or two examples with their own amounts.
- A question asking how many or how much: one sentence carrying the figure from the record that holds it.
- A question asking who: the total from the record that carries it, and two or three names — never all of them.
- A question about getting something done (a permit, a certificate, a service): where to go and the two or three main things to bring, from its record.
- Put the one name or figure that answers the question in **bold**, once.
- No lists, headings, tables, links or addresses. The reader sees only your words, so never write "below", "listed", "as shown", "the records" or "see the records".
- Never quote a line, a poem or anyone's words unless the record carries them, and never write a name in a longer form than the record gives it.
- If the question has nothing to do with the Bangsamoro or this site (a poem, another country, a sum), say in one sentence that you answer questions about the Bangsamoro, and stop.

What the records mean:
- Budget: a figure is what Parliament appropriated for the year the record names — not what was spent, and a project is money to build, not a finished building. Asked what was spent or built, give what was budgeted and say so. A Sector figure overlaps other sectors and is never a share of the budget. A Rule is a condition on money counted elsewhere.
- Election: the proclaimed result of the vote of 14 September 2026. A party's seats are on its Party row; never count Member rows. A vote figure belongs to its one race.
- Code section: the Bangsamoro Local Governance Code of 2023, which applies in BARMM in place of RA 7160. Give the rule with its figure and any start date or condition it carries — a rule that starts in a later year is not in force now.
- Code rule: an article of the Code's Implementing Rules (30 September 2025). Cite it as "IRR Article N", never as a Section. Where the IRR and the Code differ, give the Code's figure, which prevails.
- Incidents are counted from news reports, so say "reported". An Incident count lists every kind it counted: a kind it does not list had none reported there, so say that, with what was reported instead.
- Book: name one or two that fit, with whether each is in print, free to read or out of print.
- The registry of measures is not complete: say what was found, never a total.`

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

/* Records that hold how things stand in the present term or year. */
const CURRENT_KINDS = new Set(['Latest news', 'News', 'Job', 'Jobs count', 'Officers', 'Officials', 'Barangay captains', 'NTA allocation', 'Office head', 'Field office', 'Emergency lines', 'Hotline'])

/* The shape of Jo saying she has nothing — her own words for it, from the
   brief, plus the couple of ways a model reaches for the same thing. */
const EMPTY_HANDED =
	/\bi (?:do|don)(?:'|’)?(?:o|n)?t have\b|\bi have (?:no|nothing)\b|\bnot something i (?:have|found)\b|\bi (?:can|cannot|can't|couldn(?:'|’)t) (?:find|see)\b|\bno record of\b/i

/* The question shapes that want the people rather than a summary of them. */
const WANTS_NAMES =
	/\brepresentatives?\b|\bmembers?\b|\bnominees?\b|\bwho are\b|\bwho won\b|\bwho was elected\b|\bmps?\b|\bwho sits\b|\blist\b/i

/* A question that asks for several things by name: bills on a subject, hotels
   in a city, programs of an office. Written as one sentence they run on into
   a wall of commas, so these are answered as a list. */
const WANTS_LIST =
	/\blist\b|\b(?:officers|officials|key officials|staff)\b|\bwhat are (?:the|some)\b|\bwhich (?:bills?|acts?|laws?|resolutions?|measures?|projects?|programs?|offices?|hotels?|places?|restaurants?|towns?|municipalities)\b|\b(?:bills?|acts?|laws?|resolutions?|measures?|projects?|programs?|hotels?|restaurants?)\b.*\b(?:related to|about|on|for|in)\b|\bexamples?\b|\ball (?:the )?(?:bills?|acts?|projects?|programs?|services?|hotels?)\b/i

const SHOWING_LIST = `One thing changes for this question, and it overrides the rule against lists above. The reader asked for several things, so answer with a list. Open with one plain sentence saying what the list is. Then put each item on its own line starting with "- ", the name or number in **bold**, a dash, and a few words on what it is, taken from its record: for example "- **Bill 88** — dialysis units and free dialysis services". Up to twelve items, the ones the records match best, in a sensible order. Use only items in the records, and never cut an item off halfway.`

/* A question about several things at once — "the job of mayor, vice mayor,
   councilor", "the difference between a bill and an act". One paragraph
   blurs them together; one line each keeps them apart. */
const WANTS_PARTS = /,|\beach\b|\bdifferen(?:ce|t)\b|\bcompare\b|\bcomparison\b|\bvs\.?\b|\bversus\b|\bboth\b|\broles?\b.*\band\b|\bjobs?\b.*\band\b|\bduties\b.*\band\b/i

const SHOWING_PARTS = `One thing changes for this question, and it overrides the rule against lists above. The reader asked about more than one thing at once, so keep them apart. If the answer covers two or more distinct things — offices, roles, measures, places, sides of a comparison — open with one short sentence, then give each its own line starting with "- ", its name in **bold**, a dash, and one or two sentences about it from the records: for example "- **Mayor** — the chief executive, who enforces laws and runs the town's services." If the answer is really about only one thing, ignore this and answer as usual.`

const SHOWING_ROSTER = `Every member is being listed under your answer, by name, with the party they sit for and the seat they hold. Your job for this question is the one sentence that frames that list: which parties it covers and how many seats each of them won, taken from the party rows. One sentence is required. Name nobody — every name you write will appear again directly beneath it — and never count the member rows, because the party's own row carries its real total and they are not always the same number.`

const SHOWING_TIMELINE = `One thing changes for this question, and it overrides what was said above about nothing being printed under your answer. This time a dated timeline is: every era in order, each with its own paragraph. So if the reader asked for the history date by date, the timeline is that answer, it is not a list you have to write, and the rule against lists does not apply to it.

All you write is the one sentence that opens it — what the whole arc amounts to, in your own voice. Where the question asks when, that sentence gives the date from the records. One sentence is required; returning nothing is a failure. Do not retell the eras and never write "below" or "as shown".`

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
	/* Inside a conversation, the subject holds until the reader names another
	   (user decision): "who are the officers" after "who leads mbhte?" is
	   about MBHTE. Searched on its own words, a follow-up found every program or
	   officer in the region and the answer started a new subject; pasting the
	   earlier question on was worse ("minister" put the Chief Minister first).
	   So every follow-up goes to the model, which reads the whole conversation
	   and picks the search — about a second, and only after the first question. */
	const before = turns.slice(0, -1).filter((turn) => turn.role === 'user').at(-1)?.text
	const leans = Boolean(before)
	// What the web is asked, which has no conversation of its own.
	const topic = leans ? `${asked} (following on from: ${before})` : asked

	// The reader's own words first. The search costs microseconds and the
	// corpus knows which kind of record each question is asking for, so on an
	// ordinary question it finds what the model would have asked for anyway —
	// and asking the model to pick the words costs four to nine seconds of
	// somebody's afternoon. The turn is spent only when the words alone come
	// back thin, which is where it earns its keep.
	let rows = leans ? [] : gather([{ query: asked }])
	let aside = ''
	let searched = false

	if (rows.length < THIN) {
		const looked = await askModel([{ role: 'system', content: LOOK }, ...said], [SEARCH])
		if (!looked.ok) return looked

		const picks = looked.calls
			.filter((call) => call.name === SEARCH.name)
			.slice(0, MOST_SEARCHES)
			.map((call) => ({
				query: typeof call.args.query === 'string' ? call.args.query : '',
				// Not on a follow-up: the model narrows to the wrong one there ("Marawi
				// mayor" to the directory, which holds no town officials), and the
				// search ranks by kind well enough without it.
				space: leans ? undefined : SPACES.find((one) => one === call.args.workspace),
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
		searched = picks.length > 0
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
		// The model looked and called no search: the question is not one for Jo. Its
		// own sentence says so, without ten seconds on the web for "capital of France".
		if (aside && !searched) return { ok: true, say: aside, sources: [] }
		const web = await askWeb(topic)
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

	/* Asked for as a list, so the lines naming one record each are the answer
	   rather than rows copied back; `written` must not strike them. */
	const listing = !roster?.length && !timeline?.length && (WANTS_LIST.test(asked) || WANTS_PARTS.test(asked))

	const wrote = await askModel([
		{
			role: 'system',
			content: [
				WRITE,
				`The records the search found:\n${listed(rows)}`,
				// Last, so they are the most recent thing said about rules they undo.
				timeline?.length ? SHOWING_TIMELINE : '',
				roster?.length ? SHOWING_ROSTER : '',
				!roster?.length && !timeline?.length && WANTS_LIST.test(asked) ? SHOWING_LIST : '',
				!roster?.length && !timeline?.length && !WANTS_LIST.test(asked) && WANTS_PARTS.test(asked) ? SHOWING_PARTS : '',
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

	const say = written(wrote.text, rows, Boolean(timeline?.length), listing)

	/* An answer that is not one, sent to the web.
	
	   `rows.length === 0` almost never happens — the corpus matches something
	   on nearly any wording, and sixteen loosely related rows are not an
	   answer either. What is detectable is the shape of the reply: "I don't
	   have that in front of me" is Jo saying the records came up empty, in the
	   words the brief tells her to use, and that is the one case where ten
	   seconds of searching costs nothing, because there was nothing.
	
	   Never when something is being drawn: a roster or a timeline is an answer
	   whatever the sentence above it says. */
	/* "Now" sends a question to the web, unless a record of how things stand
	   now answered it: the officials in office this term, this year's NTA.
	   Those are the records, and the web would only be an older copy. */
	const current = rows.some((row) => CURRENT_KINDS.has(row.kind))
	if (!timeline?.length && !roster?.length && (EMPTY_HANDED.test(say) || (RIGHT_NOW.test(asked) && !current))) {
		const web = await askWeb(topic)
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

const NO_FIGURE = "There's no single figure for that in what I have."

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
function written(say: string, rows: Entry[], shown?: boolean, listing?: boolean): string {
	const kept = grounded(listing ? unrun(say) : trimmed(say, rows), rows)
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
	/* Not the top row's own line, which it used to be: asked what was spent on
	   roads in Basilan, the model summed the projects, the sum was struck, and
	   the Ministry of Public Works' whole appropriation was handed back as the
	   answer. Saying there is no one figure is true; a neighbouring figure is not. */
	if (!kept) return shown ? 'Here is how it happened, in order.' : NO_FIGURE
	return kept
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
			// Never on a list line: "- **MP Atty. Naguib G. Sinarimbo** — Minister" ends
			// without a stop, and splits on "Atty." and "G.", so it lost the surname.
			if (sentences.length > 1 && last && !/^\s*[-*\u2022]/.test(line) && !/[.!?][»”"')\]]?$/.test(last.trim())) sentences.pop()
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
	const asked = picks.filter((pick) => pick.query.trim())
	// A fair share each: "and in Tawi-Tawi?" searched Basilan and Tawi-Tawi, and
	// Basilan's sixteen rows filled the cap before Tawi-Tawi's were reached.
	const share = Math.ceil(MOST_ROWS / Math.max(1, asked.length))
	for (const pick of asked) {
		for (const row of search(pick.query, pick.space, share)) found.set(`${row.kind}:${row.title}`, row)
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
