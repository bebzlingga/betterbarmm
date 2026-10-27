import { budgetFor, FISCAL_YEARS, pesoShort } from '@betterbarmm/budget-data'
import { Money } from './money'
import { HEAD_ROW, ROW, SUB, TABLE, TD, TD_NUM, TH, TH_NUM } from './table'

/* ============================================================
   The same project in more than one Act

   A road, a bridge or a flood wall is often built over several
   years, each phase appropriated in its own Act: "Construction of
   Flood Control Structure (Phase 3), Brgy. Buluan, Old Kaabakan".
   Read one Act at a time, phase three looks like a ₱88.5 million
   project; read across seven, it is the third payment toward a
   ₱186.8 million one.

   Two lines are the same project when their names match once the
   phase and the opening verb are set aside — "Concreting of" and
   "Construction of" the same road are one road. The barangay and
   town stay in the name, so two different roads in one town do
   not collapse into one. It is a match on the Act's own words, not
   a claim about the works: a project renamed between Acts is not
   joined, and two that share a generic name might be.
   ============================================================ */

export type Appearance = { year: number; id: string; name: string; amount: number; province: string }
export type RepeatGroup = { key: string; name: string; province: string; total: number; appearances: Appearance[] }

const VERB =
	/^(construction\/rehabilitation|construction and installation|road concreting|asphalt overlay|construction|concreting|rehabilitation|improvement|repair|upgrading|completion|continuation|installation|widening|paving)\s+(of|and)?\s*/

/** What two lines of the same project share: the name without its phase or its verb. */
export function projectKey(name: string): string {
	return name
		.toLowerCase()
		.replace(/\(\s*phase[^)]*\)/g, ' ')
		.replace(/\bphase\s*[ivx0-9]+\b/g, ' ')
		.replace(/\b(brgy|barangay)\.?\s*/g, 'brgy ')
		.trim()
		.replace(VERB, '')
		.replace(/[^a-z0-9 ]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

let cached: RepeatGroup[] | null = null

/** Every project named in two or more Acts, the costliest first. Worked out once, over all seven. */
export function repeatGroups(): RepeatGroup[] {
	if (cached) return cached
	const groups = new Map<string, Appearance[]>()
	for (const year of FISCAL_YEARS) {
		for (const p of budgetFor(String(year)).projects) {
			const key = projectKey(p.project)
			if (!key) continue
			const list = groups.get(key) ?? []
			list.push({ year, id: p.id, name: p.project, amount: p.amount, province: p.province })
			groups.set(key, list)
		}
	}
	cached = [...groups.entries()]
		.filter(([, list]) => new Set(list.map((a) => a.year)).size > 1)
		.map(([key, list]) => {
			const appearances = list.sort((a, b) => a.year - b.year || a.amount - b.amount)
			const latest = appearances[appearances.length - 1]!
			return { key, name: latest.name, province: latest.province, total: appearances.reduce((n, a) => n + a.amount, 0), appearances }
		})
		.sort((a, b) => b.total - a.total)
	return cached
}

/** For one year's list: each project that appears in other Acts, and which years. */
export function otherYearsFor(year: number): Record<string, number[]> {
	const out: Record<string, number[]> = {}
	for (const group of repeatGroups()) {
		const years = [...new Set(group.appearances.map((a) => a.year))]
		for (const a of group.appearances) if (a.year === year) out[a.id] = years.filter((y) => y !== year)
	}
	return out
}

/** Shown before the rest fold away. */
const SHOWN = 10

/** The two figure columns, the same width in the shown table and the folded one, so they line up. */
const ACTS_COL = 'w-[5rem]'
const TOTAL_COL = 'w-[9rem]'

function Row({ group }: { group: RepeatGroup }) {
	return (
		<tr className={ROW}>
			<th scope='row' className={`${TD} font-normal`}>
				<span className='block text-[0.90625rem] font-medium leading-snug text-[var(--ink)]'>{group.name}</span>
				<span className={SUB}>{group.province}</span>
				<ol className='mt-2.5 flex flex-wrap gap-1.5'>
					{group.appearances.map((a) => (
						<li key={`${a.year}-${a.id}`} title={a.name} className='border border-[var(--rule)] bg-[var(--paper)] px-2 py-0.5 text-[0.71875rem] text-[var(--ink-2)]'>
							<span className='font-semibold text-[var(--ink)]'>FY {a.year}</span> · <Money amount={a.amount} />
						</li>
					))}
				</ol>
			</th>
			<td className={`${TD_NUM} ${ACTS_COL} hidden font-mono text-[0.75rem] text-[var(--ink-3)] sm:table-cell`}>
				{new Set(group.appearances.map((a) => a.year)).size}
			</td>
			<td className={`${TD_NUM} ${TOTAL_COL}`}>
				<Money amount={group.total} />
			</td>
		</tr>
	)
}

/** The projects funded in more than one Act, with each Act's share and the whole. */
export function RepeatProjects() {
	const groups = repeatGroups()
	if (!groups.length) return null
	const total = groups.reduce((n, g) => n + g.total, 0)
	const rest = groups.slice(SHOWN)
	return (
		<div>
			<p className='max-w-3xl text-[0.84375rem] leading-[1.8] text-[var(--ink-2)]'>
				<strong className='font-semibold text-[var(--ink)]'>{groups.length} projects</strong> are named in two or more of
				the seven Acts, together {pesoShort(total)}: most are one work built in phases, each phase appropriated in its
				own year. Matched on the Act’s own words with the phase and the opening verb set aside, so a project renamed
				between Acts is missed and two that share a generic name could be joined.
			</p>
			<table className={`${TABLE} mt-6`}>
				<caption className='sr-only'>Projects named in more than one Act</caption>
				<thead>
					<tr className={HEAD_ROW}>
						<th scope='col' className={TH}>
							Project, and each Act’s share
						</th>
						<th scope='col' className={`${TH_NUM} ${ACTS_COL} hidden sm:table-cell`}>
							Acts
						</th>
						<th scope='col' className={`${TH_NUM} ${TOTAL_COL}`}>
							In all
						</th>
					</tr>
				</thead>
				<tbody>
					{groups.slice(0, SHOWN).map((group) => (
						<Row key={group.key} group={group} />
					))}
				</tbody>
			</table>
			{/* The rest in a table of their own inside the fold: a `details` cannot hold table rows. */}
			{rest.length ? (
				<details className='group'>
					<summary className='flex cursor-pointer list-none items-center py-5 text-[0.84375rem] font-semibold text-[var(--ink)] [&::-webkit-details-marker]:hidden'>
						<span className='rule-link group-open:hidden'>Show the other {rest.length}</span>
						<span className='rule-link hidden group-open:inline'>Show fewer</span>
					</summary>
					<table className={TABLE}>
						<caption className='sr-only'>The other projects named in more than one Act</caption>
						<tbody>
							{rest.map((group) => (
								<Row key={group.key} group={group} />
							))}
						</tbody>
					</table>
				</details>
			) : null}
		</div>
	)
}
