import type { Metadata } from 'next'
import { boardWinners, lguData, lguProvinces, personName, winners, type Contest } from '@betterbarmm/lgu-data'
import { officialsHistory, type OfficeHolder } from '@betterbarmm/lgu-data/history'
import { LguMasthead } from '../_components/lgu-parts'
import { OfficialsExplorer, type OfficialRow } from '../_components/officials-explorer'

export const metadata: Metadata = {
	title: 'Local officials — Local government directory',
	description:
		'Every elected governor, vice-governor, provincial board member, mayor, vice-mayor and council member in BARMM, by term from 2001, with party and votes. Search and filter by province, level, position and party.',
}

/* ============================================================
   Local officials

   One row per person elected, for one term at a time (the term is
   the URL's). The 2025-2028 term is COMELEC's canvass in the
   directory; earlier terms are OpenHalalan's record, a canvass with
   votes for some terms and a list of winners only for others.

   A winner is the top `seats` of a contest. Where the record does
   not fix the number of seats (the provincial boards in 2025),
   nobody is marked elected, as on the province page.
   ============================================================ */

const CURRENT = lguData.officials?.currentTermId ?? '2025-2028'

const label = (id: string) => id.replace('-', '–')

/** Every term on record, newest first. */
const TERMS = [
	...new Set([
		CURRENT,
		...Object.values(officialsHistory.units).flatMap((unit) => Object.keys(unit ?? {})),
		...Object.values(officialsHistory.provinces).flatMap((province) => Object.keys(province ?? {})),
	]),
]
	.sort()
	.reverse()
	.map((id) => ({ id, label: label(id) }))

type Office = Contest | Contest[] | OfficeHolder | OfficeHolder[] | undefined

/** The people one office's record names as elected, with their tally where there is one. */
type Person = { name: string; party: string | null; votes: number | null; pct: number | null }

function elected(office: Office): Person[] {
	if (!office) return []
	const list = Array.isArray(office) ? office : [office]
	return list.flatMap((item): Person[] =>
		'ranked' in item
			? winners(item).map((c) => ({ name: c.name, party: c.party ?? null, votes: c.votes ?? null, pct: c.percentage ?? null }))
			: [{ name: item.name, party: item.party ?? null, votes: null, pct: null }],
	)
}

function officialsFor(term: string): OfficialRow[] {
	const rows: OfficialRow[] = []
	const add = (
		office: Office,
		position: string,
		unit: { key: string; lgu: string; href: string; area: string; level: OfficialRow['level'] },
	) => {
		elected(office).forEach((person, i) =>
			rows.push({
				key: `${unit.key}:${position}:${i}`,
				name: personName(person.name),
				position,
				lgu: unit.lgu,
				href: unit.href,
				area: unit.area,
				level: unit.level,
				party: person.party,
				votes: person.votes,
				pct: person.pct,
			}),
		)
	}
	const undivided = new Set<string>()

	for (const province of lguProvinces) {
		if (province.kind === 'Province') {
			const record =
				term === CURRENT
					? (province.officials?.[term] as Record<string, Office> | undefined)
					: (officialsHistory.provinces[province.slug]?.[term] as (Record<string, Office> & { undivided?: string }) | undefined)
			// Before Maguindanao divided, both halves carry the one governor it had; list him once.
			const once = (record as { undivided?: string } | undefined)?.undivided
			if (record && !(once && undivided.has(once))) {
				if (once) undivided.add(once)
				const unit = { key: province.slug, lgu: once ?? province.name, href: `/${province.slug}`, area: province.name, level: 'Province' as const }
				add(record.governor, 'Governor', unit)
				add(record.viceGovernor, 'Vice-Governor', unit)
				// The 2025 record has no seat counts; COMELEC's per district fill them in.
				const board = term === CURRENT ? boardWinners(province.slug, record.board as Contest[] | undefined) : null
				if (board) {
					board.districts.forEach(({ district, members }) =>
						members.forEach((member, i) =>
							rows.push({
								key: `${unit.key}:board:${district}:${i}`,
								name: personName(member.name),
								position: 'Provincial board member',
								lgu: unit.lgu,
								href: unit.href,
								area: unit.area,
								level: 'Province',
								party: member.party ?? null,
								votes: member.votes ?? null,
								pct: member.percentage ?? null,
							}),
						),
					)
				} else add(record.board, 'Provincial board member', unit)
			}
		}
		for (const town of province.municipalities) {
			const record =
				term === CURRENT
					? (town.officials?.[term] as Record<string, Office> | undefined)
					: (officialsHistory.units[town.slug]?.[term] as Record<string, Office> | undefined)
			if (!record) continue
			const unit = {
				key: `${province.slug}/${town.slug}`,
				lgu: province.name === town.name ? town.name : `${town.name}, ${province.name}`,
				href: `/${province.slug}/${town.slug}`,
				area: province.name,
				level: town.isCity ? ('City' as const) : ('Municipality' as const),
			}
			add(record.mayor, 'Mayor', unit)
			add(record.viceMayor, 'Vice-Mayor', unit)
			add(record.council, 'Council member', unit)
		}
	}
	return rows
}

export default async function OfficialsPage({ searchParams }: { searchParams: Promise<{ term?: string | string[] }> }) {
	const asked = (await searchParams).term
	const term = typeof asked === 'string' && TERMS.some((t) => t.id === asked) ? asked : CURRENT
	const officials = officialsFor(term)

	return (
		<>
			<LguMasthead
				kicker='The people · Bangsamoro'
				name='Local officials'
				noteBeside
				noteEnd
				note='Every governor, vice-governor, provincial board member, mayor, vice-mayor and council member elected in BARMM, term by term from 2001. Pick a term, filter, then sort any column.'
			/>

			<section className='bb-container bb-section'>
				<OfficialsExplorer terms={TERMS} term={term} officials={officials} />

				<div className='mt-10 space-y-2 text-[13px] leading-6 text-[var(--ink-3)]'>
					<p>
						The 2025–2028 term is from COMELEC&rsquo;s 2025 Certificates of Canvass. Earlier terms are from{' '}
						<a href={officialsHistory.source.href} target='_blank' rel='noreferrer' className='rule-link'>
							{officialsHistory.source.label}
						</a>
						; for some of them only the winners survive, so there are no votes. The 2025 provincial boards are filled at COMELEC&rsquo;s seats per district (Resolutions 11050 and 11085);
						where an older record does not say how many seats a council had, its members are not listed.
					</p>
					<p>
						Barangay officials are elected separately and are not here. Office-holders change after an election;
						where this differs from an official record, the official record is right.
					</p>
				</div>
			</section>
		</>
	)
}
