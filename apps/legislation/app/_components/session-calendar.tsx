'use client'

import { ArrowUpRightIcon, CalendarPlusIcon, CheckIcon } from '@phosphor-icons/react'
import { Fragment, useEffect, useState } from 'react'
import { BandSectionTitle } from './registry-band'

/* ============================================================
   The calendar of sessions

   Three readings of one resolution. A card on the band's edge with
   the next sitting, how far off it is, and how much of the session
   has been sat. The whole session as one strip of days, a column a
   week, so its rhythm shows: two sitting weeks a month, and the long
   gaps. Then every sitting by month, with how long Parliament stood
   adjourned before the next. "Today" is read in the browser, in
   Manila time, so the page is built once and still says what is next.
   ============================================================ */

export type CalendarData = {
	meta: {
		parliament: string
		session: string
		period: { start: string; end: string }
		source: { title: string; introduced_by: string; received: string; status: string; file: string }
		basis: string[]
		note: string
	}
	sittings: { start: string; end: string; label: string; note?: string }[]
}

type Sitting = CalendarData['sittings'][number]

const DAY = 864e5
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`)
const iso = (d: Date) => d.toISOString().slice(0, 10)
const shift = (s: string, n: number) => iso(new Date(utc(s).getTime() + n * DAY))
const between = (a: string, b: string) => Math.round((utc(b).getTime() - utc(a).getTime()) / DAY)
const fmt = (s: string, o: Intl.DateTimeFormatOptions) => utc(s).toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' })
const daysOf = (a: string, b: string) => Array.from({ length: between(a, b) + 1 }, (_, i) => shift(a, i))
const range = (a: string, b: string, year = true) => {
	const y: Intl.DateTimeFormatOptions = year ? { year: 'numeric' } : {}
	if (a === b) return fmt(a, { day: 'numeric', month: 'long', ...y })
	return a.slice(0, 7) === b.slice(0, 7)
		? `${fmt(a, { day: 'numeric' })}–${fmt(b, { day: 'numeric', month: 'long', ...y })}`
		: `${fmt(a, { day: 'numeric', month: 'long' })} – ${fmt(b, { day: 'numeric', month: 'long', ...y })}`
}
const gap = (days: number) => (days < 14 ? `${days} days` : `${Math.round(days / 7)} weeks`)

function useToday() {
	const [today, setToday] = useState<string | null>(null)
	useEffect(() => setToday(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })), [])
	return today
}

/** Every sitting as an all-day event, for any calendar app. */
function download(data: CalendarData) {
	const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
	const d = (s: string) => s.replace(/-/g, '')
	const events = data.sittings.map((s) =>
		[
			'BEGIN:VEVENT',
			`UID:${s.start}-bangsamoro-parliament@betterbarmm.com`,
			`DTSTAMP:${stamp}`,
			`DTSTART;VALUE=DATE:${d(s.start)}`,
			`DTEND;VALUE=DATE:${d(shift(s.end, 1))}`,
			`SUMMARY:Bangsamoro Parliament: ${s.label}`,
			`DESCRIPTION:${(s.note ?? `${data.meta.parliament}, ${data.meta.session}`).replace(/[,;]/g, '\\$&')}`,
			'LOCATION:Bangsamoro Parliament\\, Cotabato City',
			'END:VEVENT',
		].join('\r\n'),
	)
	const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BetterBARMM//Session calendar//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n')
	const a = document.createElement('a')
	a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
	a.download = 'bangsamoro-parliament-sittings.ics'
	a.click()
	URL.revokeObjectURL(a.href)
}

/** The card on the band's edge: what is next, and how far the session has come. */
function NextUp({ data, today }: { data: CalendarData; today: string | null }) {
	const days = data.sittings.flatMap((s) => daysOf(s.start, s.end))
	const sat = today ? days.filter((d) => d < today).length : 0
	const next = today ? data.sittings.find((s) => s.end >= today) : undefined
	const now = !!(next && today && next.start <= today)
	const until = next && today && !now ? between(today, next.start) : 0
	const longest = data.sittings.slice(1).reduce((m, s, i) => Math.max(m, between(data.sittings[i]!.end, s.start) - 1), 0)

	return (
		<div className='relative z-10 -mt-14 grid overflow-hidden rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] shadow-[0_30px_60px_-40px_rgba(0,0,0,0.45)] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]'>
			<div className='p-6 sm:p-8'>
				<p className='bb-label'>{now ? 'Sitting now' : next || !today ? 'Next sitting' : 'The session has closed'}</p>
				<p className='mt-4 min-h-[1.1em] text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]'>
					{next ? range(next.start, next.end) : today ? range(data.meta.period.end, data.meta.period.end) : ''}
				</p>
				<div className='mt-5 flex min-h-8 flex-wrap items-center gap-2'>
					{next
						? daysOf(next.start, next.end).map((d) => (
								<span key={d} className={`inline-flex h-8 items-center rounded-full px-3 text-[0.75rem] font-semibold ${d === today ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
									{fmt(d, { weekday: 'long' })}
								</span>
							))
						: null}
					{next ? (
						<span className='ml-1 text-[0.875rem] text-[var(--ink-2)]'>
							{now ? 'in session today' : `in ${until} ${until === 1 ? 'day' : 'days'}`} · {next.label.toLowerCase()}
						</span>
					) : null}
				</div>
				<div className='mt-7 flex flex-wrap gap-3'>
					<button type='button' onClick={() => download(data)} className='dv-btn dv-btn-accent'>
						<CalendarPlusIcon size={15} weight='bold' aria-hidden='true' />
						Add to my calendar
					</button>
					<a href={data.meta.source.file} target='_blank' rel='noreferrer' className='dv-btn dv-btn-line'>
						The resolution
						<ArrowUpRightIcon size={13} weight='bold' aria-hidden='true' />
					</a>
				</div>
			</div>

			<div className='tv-wash grid grid-cols-3 lg:grid-cols-1'>
				{[
					[String(days.length), 'sitting days', `in ${data.sittings.length} sittings`],
					[today ? String(sat) : '–', 'sat so far', `${today ? Math.round((sat / days.length) * 100) : 0}% of the session`],
					[gap(longest), 'longest break', 'between two sittings'],
				].map(([n, a, b], i) => (
					<p key={a} className={`p-5 sm:p-6 ${i ? 'border-l border-[var(--rule-soft)] lg:border-l-0 lg:border-t' : ''}`}>
						<span className='num block text-[clamp(1.375rem,3vw,1.875rem)] font-black leading-none tracking-[-0.03em]'>{n}</span>
						<span className='mt-2 block text-[0.75rem] font-semibold text-[var(--ink-2)]'>{a}</span>
						<span className='block text-[0.6875rem] text-[var(--ink-mute)]'>{b}</span>
					</p>
				))}
			</div>

			{/* A segment per sitting day, filled as each is sat. */}
			<div className='flex gap-[3px] border-t border-[var(--rule)] px-6 py-4 sm:px-8 lg:col-span-2' aria-label={`${sat} of ${days.length} sitting days sat`}>
				{days.map((d) => (
					<span key={d} title={fmt(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} className='h-2 min-w-0 flex-1 rounded-[2px]' style={{ background: today && d < today ? 'var(--accent)' : d === today ? 'var(--ink)' : 'var(--paper-3)' }} />
				))}
			</div>
		</div>
	)
}

/** The whole session as one strip: a column per week, a cell per day. */
function YearStrip({ data, today }: { data: CalendarData; today: string | null }) {
	const sitting = new Set(data.sittings.flatMap((s) => daysOf(s.start, s.end)))
	const { start, end } = data.meta.period
	const first = shift(start, -utc(start).getUTCDay())
	const weeks = Array.from({ length: Math.ceil((between(first, end) + 1) / 7) }, (_, w) => Array.from({ length: 7 }, (_, d) => shift(first, w * 7 + d)))

	return (
		<div className='mt-8 rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-5 sm:p-7'>
			<div className='-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0'>
			<div className='flex min-w-[38rem] gap-[3px] sm:min-w-0 sm:gap-1'>
				{weeks.map((week, w) => {
					// The 1st of a month heads its week; the opening week is named only if the next week does not start a month.
					const month = week.find((d) => d.endsWith('-01')) ?? (w === 0 && !weeks[1]?.some((d) => d.endsWith('-01')) ? start : undefined)
					return (
						<div key={week[0]} className='flex min-w-0 flex-1 flex-col gap-[3px] sm:gap-1'>
							<span className='relative h-5'>
								{month ? <span className='absolute bottom-1 left-0 whitespace-nowrap font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-[var(--ink-3)]'>{fmt(month, { month: 'short' })}</span> : null}
							</span>
							{week.map((d) => {
								const inside = d >= start && d <= end
								const on = sitting.has(d)
								const past = today !== null && d < today
								return (
									<span
										key={d}
										title={inside ? `${fmt(d, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}${on ? ' · sitting' : ''}` : undefined}
										className={`block aspect-square w-full rounded-[2px] ${d === today ? 'ring-2 ring-[var(--ink)] ring-offset-1 ring-offset-[var(--paper)]' : ''}`}
										style={{ background: !inside ? 'transparent' : on ? (past ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'var(--accent)') : 'var(--paper-3)' }}
									/>
								)
							})}
						</div>
					)
				})}
			</div>
			</div>
			<p className='mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.75rem] text-[var(--ink-3)]'>
				{[
					['var(--accent)', 'Sitting day'],
					['color-mix(in srgb, var(--accent) 35%, transparent)', 'Already sat'],
					['var(--paper-3)', 'No sitting'],
				].map(([c, l]) => (
					<span key={l} className='inline-flex items-center gap-2'>
						<span className='size-3 rounded-[2px]' style={{ background: c }} />
						{l}
					</span>
				))}
				<span className='inline-flex items-center gap-2'>
					<span className='size-3 rounded-[2px] ring-2 ring-[var(--ink)] ring-offset-1 ring-offset-[var(--paper)]' />
					Today
				</span>
			</p>
		</div>
	)
}

/** Every sitting, a month at a time, with the break before each. */
function Sittings({ data, today }: { data: CalendarData; today: string | null }) {
	const next = today ? data.sittings.find((s) => s.end >= today) : undefined
	const months = new Map<string, Sitting[]>()
	for (const s of data.sittings) months.set(s.start.slice(0, 7), [...(months.get(s.start.slice(0, 7)) ?? []), s])
	let prev: Sitting | undefined

	return (
		<div className='mt-8 grid gap-3'>
			{[...months].map(([ym, list]) => (
				<section key={ym} className='grid gap-x-8 rounded-[var(--dv-r)] border border-[var(--rule)] p-5 sm:p-6 md:grid-cols-[11rem_minmax(0,1fr)]'>
					<h3 className='pb-3 text-[1.0625rem] font-extrabold tracking-[-0.015em] md:sticky md:top-8 md:self-start md:pb-0 md:pt-3'>
						{fmt(`${ym}-01`, { month: 'long' })} <span className='text-[var(--ink-mute)]'>{ym.slice(0, 4)}</span>
					</h3>
					<ol className='grid'>
						{list.map((s) => {
							const rest = prev ? between(prev.end, s.start) - 1 : 0
							prev = s
							const done = !!today && s.end < today
							const isNext = s === next
							const now = isNext && !!today && s.start <= today
							return (
								<Fragment key={s.start}>
									{rest > 2 ? (
										<li className='flex items-center gap-3 py-1.5 pl-3 text-[0.6875rem] text-[var(--ink-mute)]' aria-label={`Adjourned ${gap(rest)}`}>
											<span className='h-5 border-l border-dashed border-[var(--ink-mute)]' />
											Adjourned {gap(rest)}
										</li>
									) : null}
									<li
										className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-3 ${isNext ? 'bg-[var(--accent-soft)] shadow-[inset_3px_0_0_var(--accent)]' : ''}`}
									>
										<div className='min-w-0'>
											<p className={`text-[0.9375rem] font-bold ${done ? 'text-[var(--ink-3)]' : 'text-[var(--ink)]'}`}>
												{range(s.start, s.end, false)}
												<span className='ml-2 inline-flex gap-1 align-middle'>
													{daysOf(s.start, s.end).map((d) => (
														<span key={d} className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-[0.5625rem] font-bold uppercase ${done ? 'bg-[var(--paper-3)] text-[var(--ink-mute)]' : 'bg-[var(--accent)] text-white'}`}>
															{fmt(d, { weekday: 'short' }).slice(0, 2)}
														</span>
													))}
												</span>
											</p>
											<p className='mt-0.5 text-[0.78125rem] text-[var(--ink-3)]'>
												{s.label}
												{s.note ? ` · ${s.note}` : ''}
											</p>
										</div>
										<span className='text-[0.71875rem] font-semibold'>
											{done ? (
												<span className='inline-flex items-center gap-1 text-[var(--ink-mute)]'>
													<CheckIcon size={12} weight='bold' aria-hidden='true' />
													Sat
												</span>
											) : isNext ? (
												<span className='rounded-full bg-[var(--accent)] px-2.5 py-1 text-white'>{now ? 'Sitting now' : 'Next'}</span>
											) : null}
										</span>
									</li>
								</Fragment>
							)
						})}
					</ol>
				</section>
			))}
		</div>
	)
}

export function SessionCalendar({ data }: { data: CalendarData }) {
	const today = useToday()
	const { meta } = data
	return (
		<section className='bb-container pb-[clamp(3.75rem,7vw,6.5rem)]'>
			<NextUp data={data} today={today} />

			<div className='mt-[clamp(3.5rem,6vw,5rem)]'>
				<BandSectionTitle title='The session at a glance' lead='A column a week, a square a day, from the opening to the mandatory adjournment.' />
				<YearStrip data={data} today={today} />
			</div>

			<div className='mt-[clamp(3.5rem,6vw,5rem)]'>
				<BandSectionTitle title='Every sitting' count={data.sittings.length} lead='Each session week resumes and adjourns on the days the resolution sets.' />
				<Sittings data={data} today={today} />
			</div>

			<div className='mt-12 grid gap-8 rounded-[var(--dv-r)] bg-[var(--paper-2)] p-6 sm:p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12'>
				<div>
					<p className='eyebrow'>Source</p>
					<a href={meta.source.file} target='_blank' rel='noreferrer' className='rule-link mt-3 inline-flex items-start gap-1 text-[0.9375rem] font-semibold leading-snug text-[var(--ink)]'>
						{meta.source.title}
						<ArrowUpRightIcon size={13} className='mt-1 shrink-0' aria-hidden='true' />
					</a>
					<p className='mt-2 text-[0.8125rem] text-[var(--ink-3)]'>Introduced by {meta.source.introduced_by}.</p>
				</div>
				<div className='grid gap-3 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>
					<p>{meta.note}</p>
					<p>Basis: {meta.basis.join('; ')}.</p>
				</div>
			</div>
		</section>
	)
}
