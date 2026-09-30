/* ============================================================
   The one thing worth checking

   The model is only ever as good as what `search` hands it, and
   the scorer is the only real logic in this package. Run it with:

       bun packages/ai/src/search.check.ts

   It builds the corpus for real, so it also catches a dataset
   that changed shape underneath the readers in `corpus.ts`.
   ============================================================ */

import { corpus, search } from './corpus'
import { grounded } from './answer'
import assert from 'node:assert'

const all = corpus()
assert.ok(all.length > 500, `the corpus should hold the whole estate, got ${all.length}`)
for (const space of ['legislation', 'budget', 'election', 'travel', 'lgu'] as const) {
	assert.ok(all.some((entry) => entry.space === space), `${space} put nothing in the corpus`)
	assert.ok(
		all.filter((entry) => entry.space === space).every((entry) => entry.href.startsWith('https://') && entry.title && entry.note),
		`${space} has a row missing its address, title or note`,
	)
}

// The question the whole thing exists to answer.
const health = search('health')
assert.ok(health.length > 0, 'nothing at all about health')
assert.ok(health.every((entry) => entry.text.includes('health')), 'a row came back that does not mention health')

// The budget is one enacted year, in three kinds, and every office has a page
// of its own rather than every office sharing one.
const spend = all.filter((entry) => entry.space === 'budget')
for (const kind of ['Sector', 'Office', 'Program', 'Rule', 'Project'] as const) {
	assert.ok(spend.some((entry) => entry.kind === kind), `the budget put no ${kind} rows in the corpus`)
}
assert.ok(
	spend.filter((entry) => entry.kind === 'Office').every((entry) => /\/offices\/[a-z0-9-]+$/.test(entry.href)),
	'an office row does not point at its own page',
)
// Every row off the latest Act still names it, so a figure cannot be read as
// undated — but the yearly totals and the per-office spans are the kinds whose
// whole subject is other years, and pinning them to FY 2026 would be pinning
// them to the wrong one.
const SPANS = new Set(['Yearly total', 'Office years'])
assert.ok(
	spend
		.filter((entry) => entry.kind !== 'Sector' && !SPANS.has(entry.kind))
		.every((entry) => entry.note.includes('FY 2026')),
	'a budget row does not say which year it is',
)
// Held to something stricter instead: a span row dates every figure it prints,
// so no amount in one can be read without the year it belongs to.
assert.ok(
	spend
		.filter((entry) => entry.kind === 'Office years')
		.every((entry) => (entry.note.match(/FY 20\d\d/g) ?? []).length > 1),
	'an office span does not name the years its figures belong to',
)

// The region's own total, which the assistant could not state at all before:
// asked for the budget across seven years it said the records did not have it,
// with all seven files sitting in the same package.
const totals = spend.filter((entry) => entry.kind === 'Yearly total')
assert.equal(totals.length, 8, 'expected one row a year and one for the span')
assert.ok(
	totals.every((entry) => /FY 20\d\d/.test(entry.note)),
	'a yearly total does not name its year',
)
const span = search('total budget of barmm for 7 years')[0]
assert.equal(span?.kind, 'Yearly total', `a seven-year question reached ${span?.kind}`)
assert.ok(
	/613,722,991,122/.test(span?.note ?? ''),
	'the seven-year total is not in the row the question reaches',
)

// The two questions the new records exist to answer.
assert.ok(search('what does the budget spend on water').some((entry) => entry.kind === 'Sector'), 'no sector for water')
assert.ok(search('constituency servicing').some((entry) => entry.kind === 'Rule'), 'no rule for the constituency fund')
assert.ok(search('what bridges are being built').every((entry) => entry.kind === 'Project'), 'a bridge question found something else')

// The question the projects were added for. A road in a barangay of Basilan
// has to outrank the travel guide's page about Basilan, which is a title match
// and would otherwise win on its own.
const building = search('what is being built in Basilan')
assert.equal(building[0]?.kind, 'Project', `expected a project first, got ${building[0]?.kind} ${building[0]?.title}`)

// And the same name asked as a place still reaches the place.
assert.equal(search('tell me about Basilan')[0]?.space, 'travel', 'a plain question about a place landed in the budget')

// ---- The election ----------------------------------------------------------
// The chamber is eighty seats and thirteen parties, and every one of them has
// to be a row of its own: a question about a party that comes back with only
// its members invites the reader to count them, and a question about a member
// that comes back with only the party never names anybody.
const voted = all.filter((entry) => entry.space === 'election')
for (const kind of ['Election', 'Party', 'Member', 'District', 'Reserved seat'] as const) {
	assert.ok(voted.some((entry) => entry.kind === kind), `the election put no ${kind} rows in the corpus`)
}
assert.equal(voted.filter((entry) => entry.kind === 'Member').length, 80, 'the chamber is eighty members')
assert.equal(voted.filter((entry) => entry.kind === 'District').length, 32, 'there are thirty-two districts')
assert.equal(voted.filter((entry) => entry.kind === 'Party').length, 13, 'thirteen parties stood on the regional ballot')

// One party, one name. The nominee lists carry an id and the district returns
// carry the registered name, so this is the join that stops half of UBJP's
// members filing under "United Bangsamoro Justice Party".
const ubjp = voted.filter((entry) => entry.kind === 'Member' && entry.parent === 'UBJP')
assert.equal(ubjp.length, 30, `UBJP holds thirty seats, got ${ubjp.length} members under that name`)

// The question this whole space was added for.
const nominees = search('who are the ubjp nominees')
assert.ok(nominees.length > 0 && nominees[0]!.space === 'election', 'the UBJP nominees are not in the election')
assert.ok(nominees.some((entry) => entry.kind === 'Member'), 'no member came back for a question about nominees')

// And the count, which is a different question about the same party.
const seats = search('how many seats did BFP win')
assert.equal(seats[0]?.kind, 'Party', `expected the party's own row first, got ${seats[0]?.kind}`)
assert.ok(seats[0]!.note.includes('31 of the 80'), `the party row should carry its total: ${seats[0]!.note}`)

// A member's rows never travel without the party row that holds the real
// total, or the answer written over eight of them says the party has eight.
const { forTest } = await import('./answer')
const withWhole = forTest.gather([{ query: 'ubjp nominees' }])
assert.ok(
	withWhole.some((entry) => entry.kind === 'Party' && entry.title === 'UBJP'),
	'the party row was not pulled in beside its members',
)

// The turnout and the outcome live on one row, so "who won" has something to
// land on that is not a member picked at random.
assert.equal(search('what was the turnout')[0]?.kind, 'Election', 'turnout should reach the election row')
assert.ok(search('who won Basilan 1st district')[0]?.kind === 'District', 'a district race should reach its own row')
assert.ok(search('who won the women reserved seat')[0]?.kind === 'Reserved seat', 'a reserved seat should reach its own row')

// Election rows must not answer a budget question.
assert.ok(
	search('what does the budget give to health').every((entry) => entry.space === 'budget'),
	'the election leaked into a budget question',
)

// ---- The Local Governance Code --------------------------------------------
// Act 49 is 605 sections and the act row can only say what it is called. Every
// operative section is a row, because every question about the Code is a
// question about one rule.
const sections = all.filter((entry) => entry.kind === 'Code section')
assert.ok(sections.length > 300, `the Code put ${sections.length} sections in the corpus`)
assert.ok(
	sections.every((entry) => entry.href === 'https://legislation.betterbarmm.com/acts/49'),
	'a Code section points somewhere other than the act',
)
assert.ok(
	sections.every((entry) => entry.title.startsWith('BLGC Section ')),
	'a Code section is not titled with its number',
)

// Cited the way a section is cited. Two digits are a whole question here, and
// the scorer throws away words shorter than three.
assert.ok(
	search('what does section 45 say')[0]?.title.startsWith('BLGC Section 45 '),
	`section 45 did not come back first: ${search('what does section 45 say')[0]?.title}`,
)

// The rule and its figures are in the note, because that is the only place the
// model can read them from.
const kagawad = search('how many kagawad in a barangay')[0]!
// Either document answers this and both say seven, so what is pinned is the
// figure and not which of the two got there first.
assert.ok(
	['Code section', 'Code rule'].includes(kagawad.kind),
	`a kagawad question reached ${kagawad.kind}`,
)
assert.ok(/\bseven\b/.test(kagawad.note), `the note should say how many: ${kagawad.note}`)

// ---- The counts, and the row that has to carry them ----
//
// The region's own totals exist as a row because a model shown sixteen of a
// hundred and eight towns cannot add them up. Each of these reduces to a
// single search term once the stop words go — "provinc", "barangay",
// "municipal" — on which the roll-up ties with every provincial office in the
// budget and used to lose the tie alphabetically.
for (const asked of [
	'how many provinces in barmm?',
	'how many barangays are in barmm',
	'how many municipalities in the region',
]) {
	const top = forTest.gather([{ query: asked }])[0]!
	assert.ok(top.title.startsWith('The Bangsamoro region:'), `"${asked}" reached ${top.kind}: ${top.title}`)
}

// The counting bonus is not a licence for the roll-up to answer every question
// that starts "how many". This one is a rule of the Code, and the region's
// counts know about barangays and nothing about kagawad.
assert.ok(
	['Code section', 'Code rule'].includes(forTest.gather([{ query: 'how many kagawad in a barangay' }])[0]!.kind),
	'the counting bonus swallowed a Code question',
)

// A whole goes in beside its own parts, never ahead of the list.
//
// One health program carries "barangay" in its name, so a question about
// Marawi matched it, and its parent — the Ministry of Health — was placed at
// rank one on a question with nothing to do with health. Every whole did this,
// which is why an Office came back first on almost anything asked.
const marawiRows = forTest.gather([{ query: 'how many barangays are in Marawi?' }])
assert.equal(
	marawiRows[0]?.title,
	'Marawi',
	`Marawi did not come back first: ${marawiRows[0]?.kind} ${marawiRows[0]?.title}`,
)

// The whole is still there where it belongs: a health question reaches the
// ministry that holds the total before the programs that are a slice of it.
const healthRows = forTest.gather([{ query: 'what does the budget give to health?' }])
assert.equal(healthRows[0]?.title, 'Ministry of Health', `health lost its total: ${healthRows[0]?.title}`)
assert.ok(
	healthRows.findIndex((row) => row.parent === 'Ministry of Health') > 0,
	'the ministry should sit above its own programs',
)

// The one the Code would otherwise be misread on: the anti-dynasty rule is
// real and does not bite until 2028, and the row that says so has to be the
// row that comes back.
const dynasty = search('is the anti dynasty rule in effect yet')[0]!
assert.ok(dynasty.note.includes('2028'), `the qualifier did not come back: ${dynasty.title}`)

// And a penalty is a figure, so it has to survive `grounded`.
const fine = search('fine for not posting monthly collections', 'legislation', 4)
assert.ok(fine[0]!.note.includes('\u20b140,000'), `the penalty is not in the note: ${fine[0]!.title}`)
assert.ok(
	grounded('The fine is not less than \u20b140,000.', fine).includes('\u20b140,000'),
	'a figure the section carries was struck as invented',
)

// 324 sections that all say "barangay" must not bury the directory again,
// which is what `asked` is for.
assert.equal(search('how many barangays are in marawi')[0]?.kind, 'City', 'the Code buried the barangay count')

// ---- The IRR of the Local Governance Code ---------------------------------
// The IRR is the procedural half — who files what, by when, against which
// table — and it numbers its own way, so a row has to be citable as an Article
// and never mistakable for a Section.
const irrRows = all.filter((entry) => entry.kind === 'Code rule')
assert.ok(irrRows.length > 150, 'the IRR articles are missing')
assert.ok(
	irrRows.every((entry) => entry.title.startsWith('BLGC IRR Article ')),
	'an IRR row is not titled as an Article',
)
assert.ok(
	irrRows.every((entry) => entry.href === 'https://legislation.betterbarmm.com/acts/49'),
	'an IRR row points somewhere other than the act it implements',
)

// The questions the Code alone could not answer, because the procedure is only
// in the IRR.
assert.match(
	search('how much is the cedula')[0]?.note ?? '',
	/₱20\b/,
	'the community tax rate is not the first thing back',
)
assert.match(
	search('requirements to create a new barangay')[0]?.title ?? '',
	/^BLGC IRR Article 16 /,
	'the barangay creation requirements are not the first thing back',
)
assert.match(
	search('how many signatures to recall a mayor')[0]?.note ?? '',
	/25 per cent/,
	'the recall thresholds are not the first thing back',
)

// A figure only the IRR carries has to survive the grounding pass, or the
// assistant retrieves it and is then forbidden to say it.
const fiesta = search('can the street be closed for a fiesta', 'legislation', 4)
assert.match(fiesta[0]?.note ?? '', /nine days/, 'the fiesta closure limit went missing')
assert.ok(
	grounded('A local road may be closed for a fiesta for no more than nine days.', fiesta),
	'a figure the article carries was struck as invented',
)

// The published IRR contradicts the Code on two figures. A row that carries the
// lower number has to carry the correction with it, or the assistant quotes the
// wrong one with a straight face.
const conflicted = irrRows.filter((entry) => /₱3,000 and not more than ₱10,000|₱600 a month/.test(entry.note))
assert.equal(conflicted.length, 2, 'the two conflicting IRR figures are not both recorded')
assert.ok(
	conflicted.every((entry) => /Code/.test(entry.note)),
	'a conflicting IRR figure is stated without the Code figure that overrides it',
)

// Adding 155 more barangay-heavy rows must still not bury the directory.
assert.equal(
	search('how many barangays are in marawi')[0]?.kind,
	'City',
	'the IRR buried the barangay count',
)

// A workspace narrows, and narrowing does not empty.
const money = search('health', 'budget')
assert.ok(money.length > 0 && money.every((entry) => entry.space === 'budget'), 'the budget filter let something else through')

// A name in the title beats the same name buried in the barangay list of
// every town that happens to have a Marawi road.
const marawi = search('Marawi', 'lgu')
assert.equal(marawi[0]?.title, 'Marawi', `the city itself should come first, got ${marawi[0]?.title}`)
assert.equal(marawi[0]?.kind, 'City')

// Nothing but filler is not a search.
assert.equal(search('what is there in the region').length, 0, 'filler words matched something')

// A question about two things ranks the row that answers both.
const both = search('Marawi places to visit', 'travel')
assert.ok(both.length === 0 || both[0]!.text.includes('marawi'), 'the two-word question lost the town')

// ---- When the web is consulted, and when it must not be ----
//
// It runs where the records have nothing and where the question is about how
// things stand now — a corpus and a trained model are both photographs, and
// asked who the chief minister is, the model answered from training,
// confidently and wrongly. Everything the records do answer stays theirs.
{
	const RIGHT_NOW =
		/\b(current|currently|now|nowadays|today|latest|newest|incumbent|so far|these days|at present|right now|this year|as of)\b/i

	for (const asked of ['who is the current chief minister of barmm', 'the latest budget'])
		assert.ok(RIGHT_NOW.test(asked), `"${asked}" should reach the web`)

	for (const asked of [
		'what does the budget give to health?',
		'how many barangays are in Marawi?',
		'how many kagawad does a barangay elect?',
		'history of barmm',
	])
		assert.ok(!RIGHT_NOW.test(asked), `"${asked}" would go to the web needlessly`)
}

// ---- A short answer is not a restatement ----
//
// `trimmed` strikes a line that gives a record's own words back, which is
// right for an answer that listed ten rows and wrong when the answer is one
// sentence. "BFP won 31 seats." starts with a row's title and its remainder is
// that row's own words, because there is no other way to say it — struck,
// nothing was left and the question came back blank.
{
	const { forTest: parts, trimmed } = await import('./answer')
	const rows = parts.gather([{ query: 'How many seats did BFP win?' }])
	for (const say of ['BFP won 31 seats.', 'BFP won 31 of the 80 seats.'])
		assert.equal(trimmed(say, rows), say, `the only line was struck: ${say}`)

	// It still strikes the listing it was written for.
	const many = parts.gather([{ query: 'who are the UBJP nominees?' }])
	const listed = many.slice(0, 5).map((row) => `${row.title} — ${row.note}`).join('\n')
	const left = trimmed(`The UBJP nominees are:\n${listed}`, many)
	assert.ok(!left.includes('\n'), `the restated rows survived: ${left.slice(0, 80)}`)
}

// ---- The primer, and the two kinds of whole ----
//
// The region's history lived on the landing site and was unreachable: asked
// for it, Jo said the records did not hold one while a seventeen-event
// timeline sat a click away. It is a package now and these rows are the proof
// it is wired in.
{
	const top = forTest.gather([{ query: 'history of barmm' }])[0]!
	assert.equal(top.kind, 'Background', `history of BARMM reached ${top.kind}: ${top.title}`)
	assert.ok(top.title.startsWith('History'), `expected the history chapter, got ${top.title}`)

	// A detail inside a chapter outranks the chapter that holds it.
	const jabidah = forTest.gather([{ query: 'what was the Jabidah massacre?' }])[0]!
	assert.ok(/Jabidah/.test(jabidah.title), `Jabidah reached ${jabidah.title}`)
}

// A counting question and a subject question want different wholes, and both
// carry the word "province" in a title. Lifted together, the chapter won and
// it does not hold the number.
{
	const counted = forTest.gather([{ query: 'how many provinces in barmm?' }])[0]!
	assert.ok(counted.title.startsWith('The Bangsamoro region:'), `counting reached ${counted.title}`)
	const told = forTest.gather([{ query: 'tell me about local government' }])[0]!
	assert.equal(told.kind, 'Background', `a subject question reached ${told.kind}: ${told.title}`)
}

// A history question carries the dates as a timeline rather than as prose, and
// only a question that is actually about the chapter does.
//
// The rule is the top row, not "a dated row somewhere in the sixteen". "Who
// was elected in BARMM" reaches "September 14, 2026: The first regular
// election" at rank twelve — a fair match for the word — and that was enough
// to print six centuries of history under an answer about the 2026 result.
{
	const { forTest: parts } = await import('./answer')
	const leads = (asked: string) => parts.gather([{ query: asked }])[0]

	for (const asked of ['give me history of barmm, date by date', 'what was the Jabidah massacre?']) {
		const lead = leads(asked)!
		assert.equal(lead.space, 'primer', `"${asked}" led with ${lead.kind}: ${lead.title}`)
		assert.equal(lead.topic, 'history', `"${asked}" led with the ${lead.topic} chapter`)
	}

	for (const asked of [
		'who was elected in barmm',
		'how many seats did BFP win?',
		'what does the budget give to health?',
	]) {
		const lead = leads(asked)!
		assert.notEqual(lead.space, 'primer', `"${asked}" would draw a timeline: ${lead.title}`)
	}
}

// ---- What background may carry, and what it may never ----
//
// The records are the authority now rather than the limit: where they are
// thin, Jo answers from what she knows and says so. That only works if the
// line between the two holds — a date in a history sentence is fine, and a
// peso amount or a share of the budget that no record states is not, whatever
// it is wrapped in.
{
	const { grounded } = await import('./answer')
	const row = search('Ministry of Health', 'budget', 1)
	for (const [say, keep] of [
		['The Jabidah incident of 1968 pushed grievances into open mobilization.', true],
		['The Bangsamoro Organic Law was ratified in plebiscites in 2019.', true],
		['Health takes 41% of the budget.', false],
		['It was appropriated \u20b19,400,000,000 for FY 2026.', false],
		['The region has 2,180 barangays.', false],
	] as const) {
		const kept = grounded(say, row).trim().length > 0
		assert.equal(kept, keep, `${keep ? 'dropped' : 'kept'} the wrong sentence: ${say}`)
	}
}

console.log(
	`ok — ${all.length} records, ${health.length} on health, ${money.length} in the budget, ${voted.length} in the election`,
)

// A figure the records do not carry does not reach a reader.
const rows = search('health', 'budget', 4)
const real = rows[0]!.note.match(/₱[\d,]+/)![0]
assert.equal(
	grounded(`Health gets ${real} for the year. In all it comes to ₱10,619,933,048.`, rows),
	`Health gets ${real} for the year.`,
	'an invented total survived',
)
assert.equal(grounded('Marawi has 96 barangays.', search('Marawi', 'lgu', 3)), 'Marawi has 96 barangays.', 'a figure that is in the record was dropped')
assert.equal(grounded('There is nothing to count here.', rows), 'There is nothing to count here.')

// What a model writes is rendered, not printed at the reader.
const said = await import('react-dom/server')
const { Prose } = await import('./dock')
const drawn = said.renderToStaticMarkup(Prose({ text: 'Places to visit: - **Cotabato City** is the seat. - **Bud Bongao** is a 314-meter peak.' }))
assert.ok(!drawn.includes('**'), `asterisks reached the page: ${drawn}`)
assert.ok(drawn.includes('<ul'), 'a bullet list pasted onto one line was not split')
assert.equal((drawn.match(/<li>/g) ?? []).length, 2, 'wrong number of bullets')
assert.ok(drawn.includes('<strong>Cotabato City</strong>'), 'bold was not rendered')
assert.ok(said.renderToStaticMarkup(Prose({ text: 'One plain sentence.' })).startsWith('<p'), 'plain prose should stay a paragraph')

// A line that only says a record back again comes out; a sentence that merely
// starts with the same name stays.
const { trimmed } = await import('./answer')
const spent = search('health', 'budget', 6)
const echo = `${spent[0]!.title}: ${spent[0]!.note}`
assert.equal(trimmed(`Health is the largest of them.\n${echo}`, spent), 'Health is the largest of them.', 'a restated record survived')

// The same record wearing the list's own clothes is still the same record.
assert.equal(trimmed(`1. [${spent[0]!.kind}] ${echo}`, spent), '', 'a numbered, labeled restatement survived')

const towns = search('Marawi', 'lgu', 3)
assert.equal(trimmed('Marawi has 96 barangays.', towns), 'Marawi has 96 barangays.', 'a real sentence was struck as an echo')

// The hand-off counts what was found, since the model may not.

// A stem left standing after its list was struck is not left dangling. The
// model introduces the members, every member line is struck as an echo, and
// what reached the reader was a sentence ending on a colon.
const bfp = search('how many seats did BFP win', 'election', 6)
const echoed = `${bfp[0]!.title} ${bfp[0]!.note}`
assert.equal(trimmed(`The UBJP nominees are:\n${echoed}`, bfp), 'The UBJP nominees are.', 'a dangling colon reached the reader')

// A sentence that answers in its own words is not an echo, even though it
// opens on the party's name and quotes the party's own figure.
assert.ok(
	trimmed('BFP won 31 of the 80 seats, the largest bloc in a chamber where nobody holds a majority.', bfp).length > 0,
	'a reworded answer was struck as a restatement',
)

// A sentence the token ceiling cut in half does not reach a reader.
assert.equal(grounded('Health is the largest of them. It also covers the provincial offices and', towns), 'Health is the largest of them.', 'a truncated tail survived')
assert.equal(grounded('Marawi has 96 barangays', towns), 'Marawi has 96 barangays', 'a lone sentence was dropped for want of a full stop')
