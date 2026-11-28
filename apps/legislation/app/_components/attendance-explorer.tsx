'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { SearchField, Select } from '@betterbarmm/editorial'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Attendance, Mark } from '../_lib/attendance-data'
import { MemberAvatar } from './member-avatar'
import { BandSectionTitle } from './registry-band'

/* ============================================================
   Attendance, Member by Member

   One page for the record the journals keep: a figure for the
   whole chamber, the sittings one by one, then every Member with
   their rate and their run of sittings. The filters narrow both:
   which Authority, which year's sittings, whose name, how often
   present, and whether they held the seat the whole term. Rates
   are worked out again over just the sittings left in view, so
   "2020" means a Member's 2020.
   ============================================================ */

type Data = { key: Attendance['parliament']; label: string; years: string; attendance: Attendance }[]

const COLOR: Record<Exclude<Mark, null>, string> = { present: 'var(--tone-done-fg)', absent: 'var(--accent)', excused: 'var(--ochre)' }
const WORD: Record<Exclude<Mark, null>, string> = { present: 'Present', absent: 'Absent', excused: 'On leave or official business' }
const BANDS = [
	{ key: 'all', label: 'Any rate', test: () => true },
	{ key: 'perfect', label: '100%', test: (r: number) => r === 100 },
	{ key: '90', label: '90–99%', test: (r: number) => r >= 90 && r < 100 },
	{ key: '75', label: '75–89%', test: (r: number) => r >= 75 && r < 90 },
	{ key: '50', label: '50–74%', test: (r: number) => r >= 50 && r < 75 },
	{ key: 'low', label: 'Under 50%', test: (r: number) => r < 50 },
] as const
const SORTS = { best: 'Best attendance', worst: 'Worst attendance', absent: 'Most absences', name: 'Name, A–Z' } as const

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0)

function Cell({ mark, title, tall }: { mark: Mark; title: string; tall?: boolean }) {
	return (
		<span
			title={title}
			className={`block rounded-[2px] ${tall ? 'h-5 min-w-0 flex-1' : 'size-3 flex-none'}`}
			style={mark ? { background: COLOR[mark], opacity: mark === 'present' ? 0.5 : 1 } : { boxShadow: 'inset 0 0 0 1px var(--rule)' }}
		/>
	)
}

export function AttendanceExplorer({ data }: { data: Data }) {
	const [which, setWhich] = useState(data[0]!.key)
	const [year, setYear] = useState('all')
	const [query, setQuery] = useState('')
	const [band, setBand] = useState<(typeof BANDS)[number]['key']>('all')
	const [tenure, setTenure] = useState<'all' | 'whole' | 'part'>('all')
	const [sort, setSort] = useState<keyof typeof SORTS>('best')

	const parliament = data.find((d) => d.key === which)!
	const { sittings, members, unmatched } = parliament.attendance
	const years = [...new Set(sittings.map((s) => s.date.slice(0, 4)))]
	const cols = sittings.map((s, i) => i).filter((i) => year === 'all' || sittings[i]!.date.startsWith(year))

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase()
		return members
			.map((m) => {
				const marks = cols.map((i) => m.marks[i]!)
				const seated = marks.filter(Boolean).length
				const present = marks.filter((x) => x === 'present').length
				return {
					...m,
					view: marks,
					seated,
					present,
					absent: marks.filter((x) => x === 'absent').length,
					excused: marks.filter((x) => x === 'excused').length,
					rate: pct(present, seated),
					whole: m.marks.every(Boolean),
				}
			})
			.filter((m) => m.seated > 0)
			.filter((m) => !q || m.name.toLowerCase().includes(q))
			.filter((m) => BANDS.find((b) => b.key === band)!.test(m.rate))
			.filter((m) => tenure === 'all' || (tenure === 'whole') === m.whole)
			.sort((a, b) =>
				sort === 'name'
					? a.name.localeCompare(b.name)
					: sort === 'worst'
						? a.rate - b.rate || b.absent - a.absent
						: sort === 'absent'
							? b.absent - a.absent || a.rate - b.rate
							: b.rate - a.rate || b.present - a.present || a.name.localeCompare(b.name),
			)
	}, [members, cols.join(), query, band, tenure, sort])

	// The whole chamber, whoever the list below is narrowed to: only the year changes it.
	const perSitting = cols.map((i) => {
		const seated = members.filter((m) => m.marks[i]).length
		const present = members.filter((m) => m.marks[i] === 'present').length
		const absent = members.filter((m) => m.marks[i] === 'absent').length
		return { s: sittings[i]!, seated, present, absent, excused: seated - present - absent, rate: pct(present, seated) }
	})
	const filtered = year !== 'all' || query || band !== 'all' || tenure !== 'all'
	const reset = () => {
		setYear('all')
		setQuery('')
		setBand('all')
		setTenure('all')
	}

	return (
		<section className='bb-container py-[clamp(3.5rem,6vw,5.5rem)]'>
			{/* Which Authority, as tabs over the figures they change: everything under them follows the choice. */}
			<div role='tablist' aria-label='Transition Authority' className='flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]'>
				{data.map((d) => (
					<button
						key={d.key}
						type='button'
						role='tab'
						aria-selected={d.key === which}
						onClick={() => {
							setWhich(d.key)
							setYear('all')
						}}
						className={`shrink-0 cursor-pointer rounded-2xl border px-5 py-3.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${d.key === which ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--rule)] bg-[var(--paper)] hover:border-[color-mix(in_srgb,var(--ink)_35%,var(--rule))]'}`}
					>
						<span className={`block font-[family-name:var(--font-display)] text-[1.0625rem] font-extrabold tracking-[-0.015em] ${d.key === which ? 'text-white' : 'text-[var(--ink)]'}`}>{d.label}</span>
						<span className={`mt-0.5 block text-[0.75rem] ${d.key === which ? 'text-white/75' : 'text-[var(--ink-mute)]'}`}>
							{d.years} · {d.attendance.sittings.length} sittings
						</span>
					</button>
				))}
			</div>


			<div className='mt-[clamp(3rem,5vw,4.5rem)] rounded-[var(--dv-r)] border border-[var(--rule)] p-6 sm:p-8'>
				<BandSectionTitle title='Sitting by sitting' lead='Everyone holding a seat at each sitting with a published journal, the whole chamber: present, on leave, absent.' />
				<p className='mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.6875rem] text-[var(--ink-3)]'>
					{(['present', 'excused', 'absent'] as const).map((m) => (
						<span key={m} className='inline-flex items-center gap-1.5'>
							<span className='size-3 rounded-[2px]' style={{ background: COLOR[m] }} />
							{m === 'excused' ? 'On leave or official business' : WORD[m]}
						</span>
					))}
				</p>
				<div className='relative mt-4 flex h-48 items-stretch gap-[3px] sm:gap-1 sm:pr-9'>
					<span aria-hidden='true' className='pointer-events-none absolute inset-x-0 z-[1] border-t border-dashed border-white/70' style={{ bottom: '50%' }}>
						<span className='num absolute -top-2 right-0 hidden text-[0.5625rem] leading-none text-[var(--ink-mute)] sm:inline'>50%</span>
					</span>
					{perSitting.map(({ s, seated, present, absent, excused, rate }) => (
						<Link
							key={s.key}
							href={s.url}
							title={`${s.label} · ${present} present, ${absent} absent${excused ? `, ${excused} on leave` : ''} of ${seated} (${rate}% present)`}
							className='group flex h-full min-w-0 flex-1 flex-col-reverse gap-[2px] opacity-85 transition-opacity hover:opacity-100'
						>
							{([['present', present], ['excused', excused], ['absent', absent]] as const).map(([k, n]) =>
								n ? <span key={k} className='block w-full first:rounded-b-[2px] last:rounded-t-[3px]' style={{ height: `${(n / seated) * 100}%`, background: COLOR[k] }} /> : null,
							)}
						</Link>
					))}
				</div>
				<div className='mt-2 flex justify-between pr-9 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-[var(--ink-mute)]'>
					<span>{perSitting[0]?.s.label}</span>
					<span>{perSitting.at(-1)?.s.label}</span>
				</div>
			</div>

			<div className='mt-[clamp(3rem,5vw,4.5rem)]'>
				<BandSectionTitle title='Every Member' count={rows.length} />

				{/* The estate's filter row, as every other explorer draws it: the search, then a labelled select a choice. */}
				<div className='mt-6 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,22rem)_1fr_10rem_13rem_10rem_12rem] lg:items-end lg:gap-4'>
					<div className='col-span-2 lg:col-span-1'>
						<SearchField value={query} onChange={setQuery} placeholder='Member’s name' />
					</div>
					<span className='hidden lg:block' />
					<Select label='Year' value={year} onChange={setYear} options={[['all', 'All years'], ...years.map((y): [string, string] => [y, `${y} · ${sittings.filter((s) => s.date.startsWith(y)).length} sittings`])]} />
					<Select label='Term' value={tenure} onChange={(v) => setTenure(v as typeof tenure)} options={[['all', 'Any term'], ['whole', 'Seated the whole term'], ['part', 'Joined or left partway']]} />
					<Select label='Attendance' value={band} onChange={(v) => setBand(v as typeof band)} options={BANDS.map((b): [string, string] => [b.key, b.label])} />
					<Select label='Sort' value={sort} onChange={(v) => setSort(v as keyof typeof SORTS)} options={Object.entries(SORTS)} />
				</div>

				<div className='mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3'>
					<p className='flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.6875rem] text-[var(--ink-3)]'>
						{(['present', 'absent', 'excused'] as const).map((m) => (
							<span key={m} className='inline-flex items-center gap-1.5'>
								<Cell mark={m} title='' />
								{m === 'excused' ? 'On leave' : WORD[m]}
							</span>
						))}
						<span className='inline-flex items-center gap-1.5'>
							<Cell mark={null} title='' />
							No seat
						</span>
						{filtered ? (
							<button type='button' onClick={reset} className='inline-flex cursor-pointer items-center gap-1.5 font-semibold text-[var(--accent)]'>
								<ArrowCounterClockwiseIcon size={12} weight='bold' aria-hidden='true' />
								Clear filters
							</button>
						) : null}
					</p>
				</div>

				{rows.length ? (
					<div className='mt-6 overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)]'>
						<p className='hidden grid-cols-[minmax(0,22rem)_4.5rem_minmax(0,1fr)] gap-x-4 lg:gap-x-8 border-b border-[var(--rule)] bg-[var(--paper-2)] px-6 py-3 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-mute)] lg:grid'>
							<span className='flex gap-3'>
								<span className='w-5'>#</span>
								<span>Member</span>
							</span>
							<span className='text-right'>Rate</span>
							<span className='flex justify-between lg:pl-8'>
								<span>{perSitting[0]?.s.label}</span>
								<span>Sittings, oldest first</span>
								<span>{perSitting.at(-1)?.s.label}</span>
							</span>
						</p>
						<ol>
							{rows.map((m, i) => (
								<li key={m.slug} className='grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-4 gap-y-2 border-b border-[var(--rule-soft)] px-4 py-3.5 transition-colors last:border-0 hover:bg-[var(--paper-2)] sm:px-6 lg:grid-cols-[minmax(0,22rem)_4.5rem_minmax(0,1fr)] lg:gap-x-8'>
									<span className='flex min-w-0 items-center gap-3 leading-tight'>
										<span className='num w-5 shrink-0 text-[0.6875rem] text-[var(--ink-mute)]'>{String(i + 1).padStart(2, '0')}</span>
										<MemberAvatar name={m.name} src={m.photoUrl} size='xs' />
										<span className='min-w-0'>
										<Link href={`/members/${m.slug}`} className='block truncate text-[0.9375rem] font-bold text-[var(--ink)] hover:text-[var(--accent)]'>
											{m.name}
										</Link>
										<span className='mt-0.5 block truncate text-[0.75rem] text-[var(--ink-3)]'>
											{m.absent} absent{m.excused ? ` · ${m.excused} on leave` : ''} · {m.seated} sittings
											{m.role ? ` · ${m.role}` : ''}
										</span>
										</span>
									</span>
									<span className='num text-right text-[0.9375rem] font-black tracking-[-0.02em]' style={{ color: m.rate >= 75 ? 'var(--ink)' : m.rate >= 50 ? 'var(--ochre)' : 'var(--accent)' }}>
										{m.rate}%
									</span>
									<span className='col-span-2 flex gap-1 pl-8 lg:col-span-1 lg:col-start-auto lg:gap-1.5 lg:pl-8'>
										{m.view.map((mark, j) => (
											<Cell key={j} tall mark={mark} title={`${sittings[cols[j]!]!.label} · ${mark ? WORD[mark] : 'No seat'}`} />
										))}
									</span>
								</li>
							))}
						</ol>
					</div>
				) : (
					<p className='mt-6 rounded-[var(--dv-r)] border border-dashed border-[var(--rule)] px-5 py-12 text-center text-[0.875rem] text-[var(--ink-3)]'>
						No Member matches those filters.{' '}
						<button type='button' onClick={reset} className='cursor-pointer font-semibold text-[var(--accent)]'>
							Clear them
						</button>
					</p>
				)}
			</div>

			<div className='mt-12 grid gap-3 border-t border-[var(--rule-soft)] pt-8 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
				<p>
					Each journal’s roll call names every Member: present in the hall or virtually, appeared after the roll call, absent, or
					on leave or official business. Someone who arrived after the roll call is counted present, so a sitting’s count here can
					run above the quorum the journal declared. A Member the roll call does not name held no seat that day. A Member’s rate is
					taken over the sittings they were named at. Only sittings with a published journal are counted:
					Parliament has posted none since March 2023, and none yet for the First Parliament.
				</p>
				{unmatched.length ? <p>Named in the journals but not on this Authority’s roster, and so left out: {unmatched.join(', ')}.</p> : null}
			</div>
		</section>
	)
}
