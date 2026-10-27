/* `node scripts/build-open-data.mjs` — turn the estate's datasets into the tables /data publishes. Each table
   is written twice, as CSV and as JSON, under public/data/files/<dataset>/, and the catalogue the pages read
   (every dataset, its tables, their columns, row counts and a few sample rows) goes to
   app/_generated/open-data.json. Both are build output: run before `next dev` and `next build`. */

import fs from 'node:fs'
import path from 'node:path'

const APP = path.resolve(import.meta.dirname, '..')
const DATA = path.resolve(APP, '../../datasets')
const OUT = path.join(APP, 'public/data/files')
const CATALOGUE = path.join(APP, 'app/_generated/open-data.json')

const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'))
/** The record files in a registry folder, which also holds its indexes. */
const readRecords = (dir, prefix) =>
	fs
		.readdirSync(path.join(DATA, dir))
		.filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
		.map((f) => read(path.join(dir, f)))
/** The Parliament's indexes write dates month first, 10/6/2026; the tables use ISO dates. */
const isoDate = (value) => {
	const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value ?? '').trim())
	return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : value || null
}
const list = (value) => (Array.isArray(value) ? value.filter((v) => v != null && v !== '').join('; ') : (value ?? null))
const winner = (contest) => contest?.ranked?.[0] ?? null

const CC_BY = 'CC BY 4.0'
const ODBL = 'ODbL 1.0'

/* ---- The datasets ----

   Every column is described, because a table nobody can read the header of is not open data. Descriptions
   say what a value is and, where it matters, what it is not. */

const datasets = [
	{
		slug: 'legislation',
		title: 'Legislation',
		summary: 'The Bangsamoro Parliament’s enacted laws, bills, resolutions, members and committees, as the Parliament publishes them.',
		source: { label: 'Bangsamoro Parliament, parliament.bangsamoro.gov.ph', href: 'https://parliament.bangsamoro.gov.ph/' },
		licence: CC_BY,
		coverage: 'February 2019 to October 2026, the Bangsamoro Transition Authority',
		workspace: 'https://legislation.betterbarmm.com',
		caveats: [
			'Statuses are as the Parliament’s indexes gave them on the date each record was read; a bill’s stage can be behind the floor.',
			'Authors of enacted acts were not captured; bills and resolutions carry theirs.',
		],
		tables: [
			{
				slug: 'acts',
				title: 'Bangsamoro Autonomy Acts',
				description: 'Every enacted regional law, one row per act.',
				columns: [
					['baa_number', 'number', 'Bangsamoro Autonomy Act number'],
					['short_title', 'text', 'Short title'],
					['official_title', 'text', 'Title as enacted'],
					['enacting_parliament', 'text', 'Which sitting of the Transition Authority passed it (BTA1, BTA2, BTA3)'],
					['status', 'text', 'Status as the Parliament lists it'],
					['date_passed', 'date', 'Date passed on third reading'],
					['date_ratified', 'date', 'Date ratified'],
					['date_approved', 'date', 'Date the Chief Minister approved it'],
					['approved_by', 'text', 'Who approved it'],
					['effectivity', 'text', 'When it takes effect, as the act says'],
					['principal_authors', 'list', 'Principal authors, semicolon-separated, as the roster names them'],
					['url', 'url', 'The act’s page on the Parliament’s site'],
				],
				rows: () => {
					const index = new Map(read('bills/bangsamoro_registry/baa/official_index.json').acts.map((a) => [a.number, a]))
					return readRecords('bills/bangsamoro_registry/baa', 'BAA-')
						.map(({ basic_information: b }) => ({
						baa_number: b.baa_number,
						short_title: b.short_title,
						official_title: b.official_title,
						enacting_parliament: b.enacting_parliament,
						status: b.current_status,
						date_passed: b.date_passed,
						date_ratified: b.date_ratified,
						date_approved: b.date_approved_by_chief_minister,
						approved_by: b.approved_by,
						effectivity: b.effectivity,
						principal_authors: list(index.get(b.baa_number)?.principal_authors),
						url: index.get(b.baa_number)?.url ?? null,
					}))
						.sort((x, y) => x.baa_number - y.baa_number)
				},
			},
			{
				slug: 'bills',
				title: 'Parliament bills',
				description: 'Every bill on the Parliament’s index, one row per bill.',
				columns: [
					['bill_number', 'number', 'Parliament Bill number'],
					['title', 'text', 'Title as filed'],
					['date_filed', 'date', 'Date filed, from the bill’s history'],
					['status', 'text', 'Stage reached, as the Parliament lists it'],
					['status_as_of', 'date', 'Date that stage was recorded'],
					['session', 'text', 'Session it was filed in'],
					['committee_referrals', 'text', 'Committees it was referred to'],
					['became_act', 'text', 'The act it became, if enacted'],
					['principal_authors', 'list', 'Principal authors, semicolon-separated, as the roster names them'],
					['co_authors', 'list', 'Co-authors, semicolon-separated'],
					['url', 'url', 'The bill’s page on the Parliament’s site'],
				],
				rows: () =>
					read('bills/bangsamoro_registry/bills/official_index.json')
						.bills.map((b) => {
							const filed = (b.history ?? []).map((h) => /^Filed\s*[–-]\s*(\S+)/.exec(h)).find(Boolean)
							return {
								bill_number: b.number,
								title: b.title,
								date_filed: filed ? isoDate(filed[1]) : null,
								status: b.status,
								status_as_of: isoDate(b.as_of),
								session: b.session,
								committee_referrals: b.committee_referrals || null,
								became_act: b.became_act || null,
								principal_authors: list(b.principal_authors),
								co_authors: list(b.co_authors),
								url: b.url,
							}
						})
						.sort((x, y) => x.bill_number - y.bill_number),
			},
			{
				slug: 'resolutions',
				title: 'Resolutions',
				description: 'Proposed and adopted resolutions, one row per resolution.',
				columns: [
					['kind', 'text', '“adopted” or “proposed”'],
					['number', 'number', 'Resolution number, within its kind'],
					['title', 'text', 'Title'],
					['status', 'text', 'Status as the Parliament lists it'],
					['as_of', 'date', 'Date that status was recorded'],
					['session', 'text', 'Session'],
					['principal_authors', 'list', 'Principal authors, semicolon-separated'],
					['co_authors', 'list', 'Co-authors, semicolon-separated'],
					['url', 'url', 'The resolution’s page on the Parliament’s site'],
				],
				rows: () =>
					['adopted', 'proposed'].flatMap((kind) =>
						read(`bills/bangsamoro_registry/resolutions/${kind}_official_index.json`).measures.map((m) => ({
							kind,
							number: m.number,
							title: m.title,
							status: m.status,
							as_of: isoDate(m.as_of),
							session: m.session,
							principal_authors: list(m.principal_authors),
							co_authors: list(m.co_authors),
							url: m.url,
						})),
					),
			},
			{
				slug: 'members',
				title: 'Members of the Transition Authority',
				description: 'Everyone who sat in the Bangsamoro Transition Authority, 2019 to 2026.',
				columns: [
					['name', 'text', 'Name as the roster gives it, SURNAME, GIVEN M.'],
					['term_of_office', 'text', 'Term as the roster gives it'],
					['sittings', 'list', 'Sittings served in (BTA1, BTA2, BTA3)'],
					['position', 'text', 'Position as the roster gives it'],
					['representation', 'text', 'Whom or where the member represents'],
					['gender', 'text', 'Gender as the roster gives it'],
					['bills_authored', 'number', 'Bills as principal author'],
					['bills_co_authored', 'number', 'Bills as co-author'],
					['resolutions', 'number', 'Resolutions credited'],
				],
				rows: () =>
					read('bills/bangsamoro_registry/members/_index.json').members.map((m) => ({
						name: m.name,
						term_of_office: m.term_of_office,
						sittings: list(m.phases_served),
						position: m.current_position,
						representation: m.representation,
						gender: m.gender,
						bills_authored: m.authored_bills?.length ?? 0,
						bills_co_authored: m.co_authored_bills?.length ?? 0,
						resolutions: m.resolutions?.length ?? 0,
					})),
			},
			{
				slug: 'committees',
				title: 'Committees',
				description: 'The Transition Authority’s committees, their officers and what each covers.',
				columns: [
					['slug', 'text', 'Identifier'],
					['name', 'text', 'Committee name'],
					['chairperson', 'text', 'Chairperson'],
					['vice_chairpersons', 'list', 'Vice-chairpersons, semicolon-separated'],
					['members', 'number', 'Regular members'],
					['ex_officio_members', 'number', 'Members seated by the office they hold'],
					['bills_referred', 'number', 'Bills referred to it'],
					['resolutions_referred', 'number', 'Resolutions referred to it'],
					['jurisdiction', 'text', 'What it covers, in the Rules’ words'],
					['url', 'url', 'Its page on the Parliament’s site'],
				],
				rows: () =>
					read('bills/bangsamoro_registry/committees/_index.json').committees.map((c) => ({
						slug: c.slug,
						name: c.name,
						chairperson: c.chairperson,
						vice_chairpersons: list(c.vice_chairpersons),
						members: c.members?.length ?? 0,
						ex_officio_members: c.ex_officio_members?.length ?? 0,
						bills_referred: c.referred_bills?.length ?? 0,
						resolutions_referred: c.referred_resolutions?.length ?? 0,
						jurisdiction: c.jurisdiction,
						url: c.url,
					})),
			},
		],
	},
	{
		slug: 'election',
		title: '2026 parliamentary election',
		summary: 'The result of the first regular Bangsamoro parliamentary election, 14 September 2026: the parties’ totals and the 80 members elected.',
		source: { label: 'Commission on Elections, the canvass of the 2026 Bangsamoro parliamentary election', href: 'https://comelec.gov.ph/' },
		licence: CC_BY,
		coverage: '14 September 2026',
		workspace: 'https://election.betterbarmm.com',
		caveats: ['Sectoral votes are the sum of five separate region-wide races, not one ballot.'],
		tables: [
			{
				slug: 'party-results',
				title: 'Results by party',
				description: 'Votes and seats for each party, by kind of seat.',
				columns: [
					['party', 'text', 'Party'],
					['party_representative_votes', 'number', 'Votes on the party-representative ballot'],
					['party_representative_seats', 'number', 'Party-representative seats won'],
					['district_votes', 'number', 'Votes for its district candidates'],
					['district_seats', 'number', 'District seats won'],
					['sectoral_votes', 'number', 'Votes for its sectoral candidates, summed across the five sectoral races'],
					['sectoral_seats', 'number', 'Sectoral seats won'],
					['total_seats', 'number', 'Seats won in all'],
				],
				rows: () =>
					read('election/election-results.json').party_totals.map((p) => ({
						party: p.label,
						party_representative_votes: p.party_representative_votes,
						party_representative_seats: p.party_representative_seats,
						district_votes: p.district_votes,
						district_seats: p.district_seats,
						sectoral_votes: p.sectoral_votes,
						sectoral_seats: p.sectoral_seats,
						total_seats: p.total_seats,
					})),
			},
			{
				slug: 'members-elected',
				title: 'Members elected',
				description: 'The 80 members of the first elected Bangsamoro Parliament, who take office on 30 October 2026.',
				columns: [
					['name', 'text', 'Name as on the ballot'],
					['roster_name', 'text', 'Name in roster form, SURNAME, GIVEN M.'],
					['seat', 'text', 'Kind of seat'],
					['district', 'text', 'District, for a district seat'],
					['sector', 'text', 'Sector, for a sectoral seat'],
					['party', 'text', 'Party'],
					['votes', 'number', 'Votes, where a seat is won by votes of its own'],
					['sex', 'text', 'Sex as recorded'],
				],
				rows: () =>
					read('bills/bangsamoro_registry/members/parliament-2026.json').members.map((m) => ({
						name: m.fullName || m.ballotName,
						roster_name: m.rosterName,
						seat: m.seatLabel,
						district: m.district,
						sector: m.sector,
						party: m.partyLabel,
						votes: m.votes,
						sex: m.sex,
					})),
			},
		],
	},
	{
		slug: 'budget',
		title: 'Regional budget',
		summary: 'Every line of the Bangsamoro’s seven enacted General Appropriations Acts, FY 2020 to FY 2026, traced to the page it was printed on.',
		source: { label: 'Bangsamoro Parliament, the General Appropriations Acts of the Bangsamoro (BAA 3, 15, 23, 32, 56, 65 and 85)', href: 'https://parliament.bangsamoro.gov.ph/' },
		licence: CC_BY,
		coverage: 'FY 2020 to FY 2026',
		workspace: 'https://budget.betterbarmm.com',
		caveats: [
			'An appropriation is not an expenditure: these are the amounts Parliament authorised, not what was spent.',
			'Sub-program rows are already counted in their program’s amount. Add up programs, or sub-programs, never both.',
		],
		tables: [
			{
				slug: 'line-items',
				title: 'Appropriation lines',
				description: 'One row per line of the appropriations tables, every year.',
				columns: [
					['fiscal_year', 'number', 'Fiscal year'],
					['act', 'text', 'The act that appropriated it'],
					['id', 'text', 'Line identifier within its year'],
					['item_type', 'text', '“program” or “sub_program”; a sub-program’s amount is already inside its program’s'],
					['budget_group', 'text', 'Budget group'],
					['sector', 'text', 'Sector'],
					['agency_code', 'text', 'Agency code as printed'],
					['agency', 'text', 'Ministry or office'],
					['office', 'text', 'Sub-office, where printed'],
					['cost_structure', 'text', 'Cost structure'],
					['program_path', 'text', 'The program and its parents'],
					['name', 'text', 'Line name as printed'],
					['personnel_services', 'peso', 'Personnel services, PHP'],
					['mooe', 'peso', 'Maintenance and other operating expenses, PHP'],
					['capital_outlays', 'peso', 'Capital outlays, PHP'],
					['amount', 'peso', 'Total, PHP'],
					['source_page', 'number', 'Page of the act it is printed on'],
				],
				rows: () =>
					fs
						.readdirSync(path.join(DATA, 'budget'))
						.filter((f) => /^BAA\d+_FY\d{4}_line_items\.json$/.test(f))
						.sort()
						.flatMap((f) => {
							const { metadata: m, line_items } = read(path.join('budget', f))
							return line_items.map((l) => ({
								fiscal_year: m.fiscal_year,
								act: m.source_document,
								id: l.id,
								item_type: l.item_type,
								budget_group: l.budget_group,
								sector: l.sector,
								agency_code: l.agency_code,
								agency: l.agency,
								office: l.office,
								cost_structure: l.cost_structure,
								program_path: l.program_path,
								name: l.name,
								personnel_services: l.personnel_services,
								mooe: l.mooe,
								capital_outlays: l.capital_outlays,
								amount: l.amount,
								source_page: l.source_page,
							}))
						}),
			},
		],
	},
	{
		slug: 'local-government',
		title: 'Local governments',
		summary: 'The region’s provinces, cities, municipalities and barangays, their population and land area, and the officials elected to each.',
		source: { label: 'PSA (PSGC and the 2024 census) and COMELEC (2025 election canvass)', href: 'https://psa.gov.ph/classification/psgc' },
		licence: CC_BY,
		coverage: 'PSA 2024 census; officials for the 2025–2028 term',
		workspace: 'https://lgu.betterbarmm.com',
		caveats: [
			'Sulu is not included: the Supreme Court removed it from the region.',
			'Codes are the PSA’s nine-digit PSGC as published with the barangay officials; the preparedness tables use the newer ten-digit codes.',
		],
		tables: [
			{
				slug: 'provinces',
				title: 'Provinces and areas',
				description: 'One row per province, Cotabato City and the Special Geographic Area.',
				columns: [
					['psgc', 'text', 'PSA geographic code'],
					['name', 'text', 'Name'],
					['kind', 'text', 'Kind of area'],
					['population_2024', 'number', 'Population, PSA 2024 census'],
					['population_2020', 'number', 'Population, PSA 2020 census'],
					['area_km2', 'number', 'Land area, km²'],
					['barangays', 'number', 'Barangays'],
					['governor', 'text', 'Governor elected for 2025–2028'],
					['vice_governor', 'text', 'Vice governor elected for 2025–2028'],
				],
				rows: () =>
					read('lgu/barmm-lgu.json').provinces.map((p) => ({
						psgc: p.psgc,
						name: p.name,
						kind: p.kind,
						population_2024: p.population,
						population_2020: p.population2020,
						area_km2: p.areaKm2,
						barangays: p.barangayCount,
						governor: winner(p.officials?.['2025-2028']?.governor)?.name ?? null,
						vice_governor: winner(p.officials?.['2025-2028']?.viceGovernor)?.name ?? null,
					})),
			},
			{
				slug: 'municipalities',
				title: 'Cities and municipalities',
				description: 'One row per city and municipality.',
				columns: [
					['psgc', 'text', 'PSA geographic code'],
					['province', 'text', 'Province or area'],
					['name', 'text', 'Name'],
					['is_city', 'boolean', 'Whether it is a city'],
					['is_capital', 'boolean', 'Whether it is the provincial capital'],
					['population_2024', 'number', 'Population, PSA 2024 census'],
					['population_2020', 'number', 'Population, PSA 2020 census'],
					['area_km2', 'number', 'Land area, km²'],
					['barangays', 'number', 'Barangays'],
					['mayor', 'text', 'Mayor elected for 2025–2028'],
					['mayor_party', 'text', 'The mayor’s party'],
					['vice_mayor', 'text', 'Vice mayor elected for 2025–2028'],
				],
				rows: () =>
					read('lgu/barmm-lgu.json').provinces.flatMap((p) =>
						p.municipalities.map((m) => {
							const term = m.officials?.['2025-2028']
							return {
								psgc: m.psgc,
								province: p.name,
								name: m.name,
								is_city: m.isCity,
								is_capital: m.isCapital,
								population_2024: m.population,
								population_2020: m.population2020,
								area_km2: m.areaKm2,
								barangays: m.barangays?.length ?? 0,
								mayor: winner(term?.mayor)?.name ?? null,
								mayor_party: winner(term?.mayor)?.party ?? null,
								vice_mayor: winner(term?.viceMayor)?.name ?? null,
							}
						}),
					),
			},
			{
				slug: 'barangays',
				title: 'Barangays',
				description: 'One row per barangay, with its punong barangay and SK chairperson.',
				columns: [
					['psgc', 'text', 'PSA geographic code'],
					['province', 'text', 'Province or area'],
					['municipality', 'text', 'City or municipality'],
					['name', 'text', 'Barangay'],
					['punong_barangay', 'text', 'Punong barangay, as DILG’s directory names them'],
					['sk_chairperson', 'text', 'Sangguniang Kabataan chairperson'],
				],
				rows: () => {
					const officials = read('lgu/barangay-officials.json').units
					const byCode = Object.assign({}, ...Object.values(officials))
					return read('lgu/barmm-lgu.json').provinces.flatMap((p) =>
						p.municipalities.flatMap((m) =>
							(m.barangays ?? []).map((b) => ({
								psgc: b.psgc,
								province: p.name,
								municipality: m.name,
								name: b.name,
								punong_barangay: byCode[b.psgc]?.punongBarangay?.name ?? null,
								sk_chairperson: byCode[b.psgc]?.skChairperson?.name ?? null,
							})),
						),
					)
				},
			},
		],
	},
	{
		slug: 'procurement',
		title: 'Procurement',
		summary: 'Every bid notice a BARMM government office has posted on PhilGEPS since 2019: what it set out to buy, its approved budget, and who won the contract.',
		source: { label: 'PhilGEPS Open Data, Bids and Awards', href: 'https://philgeps.gov.ph/CmsHomePages/open-data' },
		licence: CC_BY,
		coverage: '2019 to October 2026',
		workspace: 'https://procurement.betterbarmm.com',
		caveats: [
			'An approved budget for the contract is a ceiling, not the price paid; the award amount is the contract price.',
			'PhilGEPS publishes a notice’s title, mode and status only once it reaches an award or if it was posted on its modernized system since 2024; the fund and closing date only from that system. Most older notices carry none of them.',
		],
		tables: [
			{
				slug: 'notices',
				title: 'Bid notices',
				description: 'One row per notice; a notice awarded in several lots lists every award.',
				columns: [
					['reference', 'text', 'PhilGEPS reference number'],
					['date_posted', 'date', 'Date posted'],
					['procuring_entity', 'text', 'The office that put it out to bid'],
					['entity_type', 'text', 'Kind of office'],
					['category', 'text', 'PhilGEPS category'],
					['title', 'text', 'What it set out to buy'],
					['mode', 'text', 'Mode of procurement'],
					['classification', 'text', 'Goods, works or services'],
					['status', 'text', 'Status on PhilGEPS'],
					['approved_budget', 'peso', 'Approved budget for the contract, PHP'],
					['fund', 'text', 'Fund source'],
					['closing_date', 'date', 'Bid closing date'],
					['awardees', 'list', 'Who won, semicolon-separated'],
					['award_amount', 'peso', 'Total awarded, PHP'],
					['contract_numbers', 'list', 'Contract numbers, semicolon-separated'],
				],
				rows: () => {
					const g = read('procurement/philgeps.json')
					const at = (arr, i) => (i == null ? null : (arr[i] ?? null))
					return g.notices.map((n) => {
						const [ref, , date, entity, category, abc, title, mode, cls, status, awards, fund, closing] = n
						const e = at(g.entities, entity)
						return {
							reference: ref,
							date_posted: date,
							procuring_entity: e?.name ?? null,
							entity_type: e?.type ?? null,
							category: at(g.categorys, category),
							title,
							mode: at(g.modes, mode),
							classification: at(g.classes, cls),
							status: at(g.statuss, status),
							approved_budget: abc,
							fund: at(g.funds, fund),
							closing_date: closing,
							awardees: awards?.length ? list(awards.map((a) => at(g.awardees, a[0]))) : null,
							award_amount: awards?.length ? awards.reduce((s, a) => s + (a[1] ?? 0), 0) : null,
							contract_numbers: awards?.length ? list(awards.map((a) => a[3])) : null,
						}
					})
				},
			},
		],
	},
	{
		slug: 'services',
		title: 'Programs and services',
		summary: 'What each regional office, province, city and town offers the public, from their Citizen’s Charters: who it is for, what to bring, the fee and how long it takes.',
		source: { label: 'The offices’ and local governments’ Citizen’s Charters', href: 'https://betterbarmm.com/services' },
		licence: CC_BY,
		coverage: 'Charters published 2023 to 2026',
		workspace: 'https://betterbarmm.com/services',
		caveats: ['Only offices and towns that publish a Citizen’s Charter are here; most towns do not.'],
		tables: [
			{
				slug: 'services',
				title: 'Services',
				description: 'One row per service.',
				columns: [
					['provider', 'text', 'The office or local government offering it'],
					['provider_kind', 'text', 'Regional office, or the kind of local government'],
					['service', 'text', 'Service name as the charter prints it'],
					['summary', 'text', 'What it is, in ordinary words'],
					['category', 'text', 'Category'],
					['for', 'list', 'Who it is for, semicolon-separated'],
					['requirements', 'list', 'What to bring, semicolon-separated'],
					['fee', 'text', 'Fee as the charter gives it'],
					['time', 'text', 'Processing time as the charter gives it'],
					['where', 'text', 'Where to apply'],
					['source', 'url', 'The charter it is read from'],
				],
				rows: () => {
					const row = (provider, kind) => (s) => ({
						provider,
						provider_kind: kind,
						service: s.name,
						summary: s.summary,
						category: s.category,
						for: list(s.for),
						requirements: list(s.requirements),
						fee: s.fee,
						time: s.time,
						where: s.where,
						source: s.source,
					})
					return [
						...read('services/offices.json').offices.flatMap((o) => (o.services ?? []).map(row(o.name, 'Regional office'))),
						...read('services/lgus.json').lgus.flatMap((l) => (l.services ?? []).map(row(l.name, l.kind))),
					]
				},
			},
		],
	},
	{
		slug: 'directory',
		title: 'Directory',
		summary: 'The heads, addresses and phone lines of the regional offices, and the emergency lines of every province and town.',
		source: { label: 'The offices’ own sites and BARMM releases, each line with its source', href: 'https://betterbarmm.com/directory' },
		licence: CC_BY,
		coverage: 'As of October 2026',
		workspace: 'https://betterbarmm.com/directory',
		caveats: ['A head is as of the date given; offices change hands between releases.'],
		tables: [
			{
				slug: 'offices',
				title: 'Regional offices',
				description: 'One row per regional office.',
				columns: [
					['name', 'text', 'Office'],
					['acronym', 'text', 'Acronym'],
					['head', 'text', 'Head of office'],
					['head_title', 'text', 'The head’s title'],
					['head_as_of', 'date', 'Date the head was last confirmed'],
					['head_source', 'url', 'Where the head is named'],
					['address', 'text', 'Address'],
					['phones', 'list', 'Phone numbers, semicolon-separated'],
					['emails', 'list', 'Email addresses, semicolon-separated'],
					['website', 'url', 'Website'],
					['facebook', 'url', 'Facebook page'],
				],
				rows: () =>
					read('directory/offices.json').offices.map((o) => ({
						name: o.name,
						acronym: o.acronym,
						head: o.head?.name ?? null,
						head_title: o.head?.title ?? null,
						head_as_of: o.head?.as_of ?? null,
						head_source: o.head?.source ?? null,
						address: o.address,
						phones: list(o.phones),
						emails: list(o.emails),
						website: o.website,
						facebook: o.facebook,
					})),
			},
			{
				slug: 'emergency-lines',
				title: 'Emergency lines',
				description: 'Police, fire, health, disaster-response and town-hall lines, one row per line.',
				columns: [
					['province', 'text', 'Province or area (slug)'],
					['town', 'text', 'Town (slug); empty for a province-wide line'],
					['kind', 'text', 'Kind of line'],
					['name', 'text', 'Whose line it is'],
					['phones', 'list', 'Numbers, semicolon-separated'],
					['source', 'url', 'Where the number is published'],
				],
				rows: () => {
					const e = read('directory/emergency.json')
					const lines = (province, town) => (l) => ({ province, town, kind: l.kind, name: l.name, phones: list(l.phones), source: l.source })
					return [
						...e.provinces.flatMap((p) => p.lines.map(lines(p.slug, null))),
						...e.towns.flatMap((t) => t.lines.map(lines(t.province, t.slug))),
					]
				},
			},
		],
	},
	{
		slug: 'incidents',
		title: 'Incidents',
		summary: 'Road, sea, fire, flood and shooting incidents in the region since 2019, compiled from news reports, one record per incident.',
		source: { label: 'News reports: the outlets’ own sites, Google News and public Facebook posts, every report linked', href: 'https://betterbarmm.com/accidents' },
		licence: CC_BY,
		coverage: '2019 to October 2026',
		workspace: 'https://betterbarmm.com/accidents',
		caveats: [
			'Nobody publishes a register of incidents in the region: this is what was reported and indexed, and only that.',
			'Summaries are BetterBARMM’s; the reports they rest on are the outlets’.',
		],
		tables: [
			{
				slug: 'incidents',
				title: 'Incidents',
				description: 'One row per incident.',
				columns: [
					['id', 'text', 'Identifier'],
					['date', 'date', 'Date of the incident (a month alone where the day is not known)'],
					['type', 'text', 'Kind of incident'],
					['title', 'text', 'What happened, in one line'],
					['summary', 'text', 'What the reports say'],
					['province', 'text', 'Province or area'],
					['municipality', 'text', 'City or municipality'],
					['barangay', 'text', 'Barangay or place, where reported'],
					['deaths', 'number', 'Deaths'],
					['injured', 'number', 'Injured; empty where not reported'],
					['missing', 'number', 'Missing; empty where not reported'],
					['latitude', 'number', 'Latitude of the place it is pinned to'],
					['longitude', 'number', 'Longitude'],
					['placed_at', 'text', 'What the pin marks: the barangay, the town centre or the province centre'],
					['sources', 'list', 'The reports, semicolon-separated'],
				],
				rows: () =>
					read('accidents/accidents.json').incidents.map((r) => ({
						id: r.id,
						date: r.date,
						type: r.kind || r.type,
						title: r.title,
						summary: r.summary,
						province: r.province,
						municipality: r.municipality,
						barangay: r.barangay,
						deaths: r.deaths,
						injured: r.injured,
						missing: r.missing,
						latitude: r.lat,
						longitude: r.lon,
						placed_at: r.placed,
						sources: list(r.sources?.map((s) => s.url)),
					})),
			},
		],
	},
	{
		slug: 'preparedness',
		title: 'Hazard exposure',
		summary: 'How much of every barangay’s land lies in Project NOAH’s flood, landslide and storm surge hazard classes, with its population, and the emergency facilities OpenStreetMap maps.',
		source: { label: 'Project NOAH open data, PSA 2024 census and OpenStreetMap', href: 'https://noah.up.edu.ph/' },
		licence: ODBL,
		coverage: 'Hazard maps as Project NOAH publishes them; population PSA 2024',
		workspace: 'https://betterbarmm.com/preparedness',
		caveats: ['Project NOAH has no flood model for Tawi-Tawi.', 'Derived from ODbL sources, so it is shared under ODbL too.'],
		tables: [
			{
				slug: 'barangay-exposure',
				title: 'Barangay hazard exposure',
				description: 'One row per barangay: km² of its land in each hazard class.',
				columns: [
					['psgc', 'text', 'PSA geographic code (2023, ten digits)'],
					['barangay', 'text', 'Barangay'],
					['municipality', 'text', 'City or municipality'],
					['province', 'text', 'Province or area (slug)'],
					['area_km2', 'number', 'Land area, km²'],
					['population_2024', 'number', 'Population, PSA 2024 census'],
					['flood_low_km2', 'number', 'Land in low flood hazard, 100-year rain, km²'],
					['flood_medium_km2', 'number', 'Land in medium flood hazard, km²'],
					['flood_high_km2', 'number', 'Land in high flood hazard, km²'],
					['landslide_low_km2', 'number', 'Land in low landslide hazard, km²'],
					['landslide_medium_km2', 'number', 'Land in medium landslide hazard, km²'],
					['landslide_high_km2', 'number', 'Land in high landslide hazard, km²'],
					['surge_low_km2', 'number', 'Land in low storm surge hazard, Advisory 4, km²'],
					['surge_medium_km2', 'number', 'Land in medium storm surge hazard, km²'],
					['surge_high_km2', 'number', 'Land in high storm surge hazard, km²'],
				],
				rows: () => {
					const pop = read('preparedness/population.json').population
					return read('preparedness/exposure.json').barangays.map((b) => ({
						psgc: b.psgc,
						barangay: b.name,
						municipality: b.town,
						province: b.prov,
						area_km2: b.area,
						population_2024: pop[b.psgc] ?? null,
						flood_low_km2: b.flood?.[0] ?? null,
						flood_medium_km2: b.flood?.[1] ?? null,
						flood_high_km2: b.flood?.[2] ?? null,
						landslide_low_km2: b.landslide?.[0] ?? null,
						landslide_medium_km2: b.landslide?.[1] ?? null,
						landslide_high_km2: b.landslide?.[2] ?? null,
						surge_low_km2: b.surge?.[0] ?? null,
						surge_medium_km2: b.surge?.[1] ?? null,
						surge_high_km2: b.surge?.[2] ?? null,
					}))
				},
			},
			{
				slug: 'facilities',
				title: 'Emergency facilities',
				description: 'Evacuation centres, hospitals, fire and police stations and disaster offices that OpenStreetMap maps, one row per facility.',
				columns: [
					['id', 'text', 'OpenStreetMap element'],
					['kind', 'text', 'Kind of facility'],
					['name', 'text', 'Name'],
					['barangay', 'text', 'Barangay'],
					['psgc', 'text', 'The barangay’s PSA code'],
					['municipality', 'text', 'City or municipality'],
					['province', 'text', 'Province or area (slug)'],
					['latitude', 'number', 'Latitude'],
					['longitude', 'number', 'Longitude'],
					['source', 'url', 'The element on OpenStreetMap'],
				],
				rows: () =>
					read('preparedness/facilities.json').facilities.map((f) => ({
						id: f.id,
						kind: f.kind,
						name: f.name,
						barangay: f.barangay,
						psgc: f.psgc,
						municipality: f.town,
						province: f.prov,
						latitude: f.lat,
						longitude: f.lon,
						source: f.source?.url ?? null,
					})),
			},
		],
	},
	{
		slug: 'audits',
		title: 'Audit reports',
		summary: 'The Commission on Audit’s annual audit reports on the region’s local governments: the opinion, the findings counted, and how many past recommendations were acted on.',
		source: { label: 'Commission on Audit, Annual Audit Reports', href: 'https://www.coa.gov.ph/reports/annual-audit-reports/' },
		licence: CC_BY,
		coverage: 'Reports COA has published, 2019 on',
		workspace: 'https://lgu.betterbarmm.com',
		caveats: ['Only the reports COA has put online are here.'],
		tables: [
			{
				slug: 'reports',
				title: 'Annual audit reports',
				description: 'One row per audited entity and year.',
				columns: [
					['entity', 'text', 'Audited entity'],
					['entity_type', 'text', 'Kind of entity'],
					['area', 'text', 'Province or area (slug)'],
					['year', 'number', 'Year audited'],
					['opinion', 'text', 'Audit opinion'],
					['disallowances', 'peso', 'Disallowances, PHP, where reported'],
					['suspensions', 'peso', 'Suspensions, PHP, where reported'],
					['unliquidated_cash_advances', 'peso', 'Unliquidated cash advances, PHP, where reported'],
					['observations', 'number', 'Audit observations'],
					['recommendations', 'number', 'Recommendations'],
					['prior_recommendations', 'number', 'Recommendations from earlier years'],
					['prior_implemented', 'number', 'Of those, implemented'],
					['prior_partly_implemented', 'number', 'Partly implemented'],
					['prior_not_implemented', 'number', 'Not implemented'],
					['report', 'url', 'The report'],
				],
				rows: () =>
					read('coa/audit-reports.json').reports.map((r) => ({
						entity: r.entity,
						entity_type: r.entityType,
						area: r.area,
						year: r.year,
						opinion: r.opinion,
						disallowances: r.disallowances,
						suspensions: r.suspensions,
						unliquidated_cash_advances: r.unliquidatedCashAdvances,
						observations: r.observations,
						recommendations: r.recommendations,
						prior_recommendations: r.priorRecommendations?.total ?? null,
						prior_implemented: r.priorRecommendations?.implemented ?? null,
						prior_partly_implemented: r.priorRecommendations?.partial ?? null,
						prior_not_implemented: r.priorRecommendations?.notImplemented ?? null,
						report: r.pdf || r.document || r.listing || null,
					})),
			},
		],
	},
	{
		slug: 'crafts',
		title: 'Crafts',
		summary: 'Sixty crafts of the region in eleven kinds: who makes them, where, from what, and their heritage status.',
		source: { label: 'BCPCH Pusaka, the CCP Encyclopedia of Philippine Art and published research, each craft with its sources', href: 'https://betterbarmm.com/crafts' },
		licence: CC_BY,
		coverage: 'As researched to October 2026',
		workspace: 'https://betterbarmm.com/crafts',
		caveats: ['The photographs on the crafts pages carry their own licences and are not in this table.'],
		tables: [
			{
				slug: 'crafts',
				title: 'Crafts',
				description: 'One row per craft.',
				columns: [
					['slug', 'text', 'Identifier'],
					['name', 'text', 'Name'],
					['local_name', 'text', 'Name in the language of its makers'],
					['kind', 'text', 'Kind of craft'],
					['people', 'text', 'The people who make it'],
					['province', 'text', 'Province or area (slug)'],
					['towns', 'list', 'Towns, semicolon-separated'],
					['summary', 'text', 'What it is'],
					['materials', 'text', 'What it is made from'],
					['heritage_status', 'list', 'Heritage status and the body that gave it, semicolon-separated'],
					['sources', 'list', 'Sources, semicolon-separated'],
				],
				rows: () =>
					read('crafts/crafts.json').items.map((c) => ({
						slug: c.slug,
						name: c.name,
						local_name: c.local_name,
						kind: c.group,
						people: c.people,
						province: c.province,
						towns: list(c.towns),
						summary: c.summary,
						materials: c.materials,
						heritage_status: Array.isArray(c.heritage) ? list(c.heritage.map((h) => [h.status, h.body].filter(Boolean).join(', '))) : null,
						sources: list(c.sources),
					})),
			},
		],
	},
	{
		slug: 'news',
		title: 'News links',
		summary: 'The headlines about the region BetterBARMM lists, with the outlet, the date and a link to the story.',
		source: { label: 'The outlets’ RSS feeds and Google News', href: 'https://betterbarmm.com/news' },
		licence: 'Facts only',
		licenceNote: 'The outlet, date, headline and link are listed as facts about where a story is; the stories themselves are the outlets’, and their teasers are left out.',
		coverage: 'From 19 October 2026',
		workspace: 'https://betterbarmm.com/news',
		caveats: ['Dates are each outlet’s own, checked against its page.'],
		tables: [
			{
				slug: 'headlines',
				title: 'Headlines',
				description: 'One row per story.',
				columns: [
					['published_at', 'date', 'When the outlet published it'],
					['outlet', 'text', 'Outlet'],
					['headline', 'text', 'Headline, as the outlet wrote it'],
					['url', 'url', 'The story'],
				],
				rows: () =>
					read('news/news.json').items.map((n) => ({ published_at: n.published_at, outlet: n.source, headline: n.title, url: n.url })),
			},
		],
	},
]

/* ---- Writing ---- */

const csvCell = (value) => {
	if (value == null) return ''
	const s = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

fs.rmSync(OUT, { recursive: true, force: true })
const generatedAt = new Date().toISOString()
const catalogue = { generatedAt, datasets: [] }

for (const d of datasets) {
	const dir = path.join(OUT, d.slug)
	fs.mkdirSync(dir, { recursive: true })
	const tables = []
	for (const t of d.tables) {
		const rows = t.rows()
		const names = t.columns.map(([name]) => name)
		for (const row of rows) {
			const extra = Object.keys(row).filter((k) => !names.includes(k))
			if (extra.length) throw new Error(`${d.slug}/${t.slug}: undescribed columns ${extra.join(', ')}`)
		}
		// A byte-order mark, so a spreadsheet opens the file as UTF-8 and the ñ and ₱ survive.
		const csv = '﻿' + [names.join(','), ...rows.map((r) => names.map((n) => csvCell(r[n])).join(','))].join('\r\n') + '\r\n'
		const json = JSON.stringify({ dataset: d.title, table: t.title, source: d.source, licence: d.licence, generatedAt, columns: t.columns.map(([name, type, description]) => ({ name, type, description })), rows })
		fs.writeFileSync(path.join(dir, `${t.slug}.csv`), csv)
		fs.writeFileSync(path.join(dir, `${t.slug}.json`), json + '\n')
		tables.push({
			slug: t.slug,
			title: t.title,
			description: t.description,
			columns: t.columns.map(([name, type, description]) => ({ name, type, description })),
			rowCount: rows.length,
			sample: rows.slice(0, 5),
			files: {
				csv: { href: `/data/files/${d.slug}/${t.slug}.csv`, bytes: Buffer.byteLength(csv) },
				json: { href: `/data/files/${d.slug}/${t.slug}.json`, bytes: Buffer.byteLength(json) + 1 },
			},
		})
		console.log(`  ${d.slug}/${t.slug}: ${rows.length.toLocaleString('en-US')} rows`)
	}
	catalogue.datasets.push({ ...d, tables })
}

fs.mkdirSync(path.dirname(CATALOGUE), { recursive: true })
fs.writeFileSync(CATALOGUE, JSON.stringify(catalogue, null, 1) + '\n')
console.log(`open data: ${catalogue.datasets.length} datasets, ${catalogue.datasets.reduce((n, d) => n + d.tables.length, 0)} tables`)
