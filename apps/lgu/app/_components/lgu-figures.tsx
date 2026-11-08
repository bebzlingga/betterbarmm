import { formatNumber } from '@betterbarmm/lgu-data'

/* ============================================================
   A town in figures

   The profile's numbers as cards and small charts: the headline
   figures in a row, then one card per question a reader brings
   (is it growing, where do its people live, how big is it next to
   its neighbours, what does it get from the national treasury).
   Every bar is drawn from zero, one series per card, so one hue;
   the figure is printed beside its bar and the exact one is in
   the hover title. Server-rendered; no chart library.
   ============================================================ */

const peso = (value: number) =>
	value >= 1e9 ? `₱${(value / 1e9).toFixed(2)}B` : `₱${(value / 1e6).toFixed(1)}M`
const pct = (part: number, whole: number) => `${Math.round((part / whole) * 1000) / 10}%`
const track = 'bg-[color-mix(in_oklab,var(--brass)_16%,transparent)]'

export type FigureCard = { label: string; value: string; detail?: string | null; tone?: 'accent' | 'brass' }

export function FigureCards({ cards }: { cards: FigureCard[] }) {
	return (
		<dl className='grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] sm:gap-x-8'>
			{cards.map((card) => (
				<div key={card.label} className='border-t border-[var(--rule)] pt-4'>
					<dt className='min-h-[1.9rem]'>
						<span className='bb-label'>{card.label}</span>
					</dt>
					<dd
						className={`num mt-3 break-words text-[1.45rem] font-extrabold leading-tight tracking-[-0.02em] ${
							card.tone === 'accent' ? 'text-[var(--accent)]' : card.tone === 'brass' ? 'text-[var(--brass)]' : 'text-[var(--ink)]'
						}`}
					>
						{card.value}
					</dd>
					{card.detail ? <dd className='mt-1 text-[0.71875rem] leading-5 text-[var(--ink-3)]'>{card.detail}</dd> : null}
				</div>
			))}
		</dl>
	)
}

export function ChartCard({
	title,
	note,
	source,
	wide,
	children,
}: {
	title: string
	note?: React.ReactNode
	source?: React.ReactNode
	wide?: boolean
	children: React.ReactNode
}) {
	return (
		<figure className={`m-0 flex flex-col border-t border-[var(--rule)] pt-6 ${wide ? 'lg:col-span-2' : ''}`}>
			<figcaption>
				<h3 className='text-[1.0625rem] font-semibold leading-snug text-[var(--ink)]'>{title}</h3>
				{note ? <p className='mt-1 text-[0.8125rem] leading-6 text-[var(--ink-3)]'>{note}</p> : null}
			</figcaption>
			<div className='mt-6 flex-1'>{children}</div>
			{source ? <p className='mt-5 text-[0.71875rem] leading-5 text-[var(--ink-mute)]'>{source}</p> : null}
		</figure>
	)
}

/** The two censuses as two bars, newest on top. */
export function CensusChart({ before, now }: { before: number; now: number }) {
	const top = Math.max(before, now)
	const change = Math.round(((now - before) / before) * 1000) / 10
	return (
		<>
			<ul className='space-y-5'>
				{[
					{ label: '2024 census', value: now, strong: true },
					{ label: '2020 census', value: before, strong: false },
				].map((row) => (
					<li key={row.label}>
						<div className='flex items-baseline justify-between gap-4 text-[0.84375rem]'>
							<span className='text-[var(--ink)]'>{row.label}</span>
							<span className={`num ${row.strong ? 'text-[var(--accent)]' : 'text-[var(--ink-2)]'}`}>{formatNumber(row.value)} residents</span>
						</div>
						<div className={`mt-2 h-2.5 ${track}`}>
							<div
								className='h-full bg-[var(--accent)]'
								style={{ width: `${(row.value / top) * 100}%`, opacity: row.strong ? 1 : 0.5 }}
							/>
						</div>
					</li>
				))}
			</ul>
			<p className='mt-6 border-l-2 border-[var(--accent)] pl-4 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
				<span className='font-semibold text-[var(--ink)]'>
					{change > 0 ? '+' : ''}
					{change}%
				</span>{' '}
				between the two counts, {change >= 0 ? 'a gain' : 'a fall'} of {formatNumber(Math.abs(now - before))} people.
			</p>
		</>
	)
}

/** Labelled horizontal bars, largest first. */
export function RankedBars({ rows }: { rows: { label: string; value: number; title?: string }[] }) {
	const top = Math.max(...rows.map((row) => row.value), 1)
	return (
		<ol className='space-y-2.5'>
			{rows.map((row, i) => (
				<li key={row.label} className='grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_auto] items-center gap-3' title={row.title}>
					<span className='truncate text-right text-[0.78125rem] text-[var(--ink-2)]'>
						<span className='num mr-1.5 text-[var(--ink-mute)]'>{i + 1}</span>
						{row.label}
					</span>
					<span className={`h-4 ${track}`}>
						<span className='block h-full bg-[var(--accent)]' style={{ width: `${(row.value / top) * 100}%` }} />
					</span>
					<span className='num w-16 text-right text-[0.78125rem] text-[var(--ink)]'>{formatNumber(row.value)}</span>
				</li>
			))}
		</ol>
	)
}

/** Every town in the province as a thin column, this one in the accent. */
export function AmongTowns({ towns, current }: { towns: { name: string; value: number }[]; current: string }) {
	const sorted = [...towns].sort((a, b) => b.value - a.value)
	const top = sorted[0]?.value ?? 1
	const rank = sorted.findIndex((town) => town.name === current) + 1
	return (
		<>
			<p className='text-[0.84375rem] text-[var(--ink-2)]'>
				<span className='num text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--accent)]'>#{rank}</span>{' '}
				of {sorted.length} by people
			</p>
			<div className='mt-4 flex h-40 items-end gap-[2px] border-b border-[var(--rule)]'>
				{sorted.map((town) => (
					<div
						key={town.name}
						className='min-w-0 flex-1'
						style={{
							height: `${Math.max((town.value / top) * 100, 1)}%`,
							background: town.name === current ? 'var(--accent)' : 'color-mix(in oklab, var(--brass) 30%, transparent)',
						}}
						title={`${town.name}: ${formatNumber(town.value)}`}
					/>
				))}
			</div>
			<div className='mt-2 flex justify-between text-[0.6875rem] text-[var(--ink-mute)]'>
				<span>{sorted[0]?.name}</span>
				<span>{sorted.at(-1)?.name}</span>
			</div>
		</>
	)
}

/** One year's allotment split between the town hall and its barangays. */
export function NtaSplit({ own, barangays, isCity }: { own: number; barangays: number | null; isCity: boolean }) {
	const total = own + (barangays ?? 0)
	const parts = [
		{ label: isCity ? 'City government' : 'Municipal government', value: own, color: 'var(--accent)' },
		...(barangays ? [{ label: 'Its barangays', value: barangays, color: 'var(--brass)' }] : []),
	]
	return (
		<>
			<p className='num text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--ink)]'>{peso(total)}</p>
			<div className='mt-4 flex h-4 gap-[2px] overflow-hidden'>
				{parts.map((part) => (
					<div key={part.label} style={{ width: pct(part.value, total), background: part.color }} title={`${part.label}: ${peso(part.value)}`} />
				))}
			</div>
			<ul className='mt-4 space-y-2'>
				{parts.map((part) => (
					<li key={part.label} className='flex items-center justify-between gap-4 text-[0.8125rem]'>
						<span className='flex items-center gap-2 text-[var(--ink-2)]'>
							<span className='size-2.5' style={{ background: part.color }} aria-hidden='true' />
							{part.label}
						</span>
						<span className='num text-[var(--ink)]'>
							{peso(part.value)} <span className='text-[var(--ink-3)]'>· {pct(part.value, total)}</span>
						</span>
					</li>
				))}
			</ul>
			<p className='mt-5 border-l-2 border-[var(--brass)] pl-4 text-[0.8125rem] leading-6 text-[var(--ink-2)]'>
				At least 20% of the {isCity ? 'city' : 'town'}&rsquo;s own share, <span className='num font-semibold text-[var(--ink)]'>{peso(own * 0.2)}</span>, is
				set aside by law for development projects (Local Government Code, Section 287).
			</p>
		</>
	)
}

/** The barangays ranked by people, each with its share of the town as a bar. */
export function BarangayCards({
	rows,
	total,
	whole,
}: {
	rows: { key: string; name: string; captain?: string | null; population: number | null }[]
	total: number | null
	/** "city" or "town", for "4.1% of the city". */
	whole: string
}) {
	const counted = rows.filter((row) => row.population != null).sort((a, b) => b.population! - a.population!)
	const rest = rows.filter((row) => row.population == null).sort((a, b) => a.name.localeCompare(b.name))
	const top = counted[0]?.population ?? 1
	return (
		<ol className='grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3'>
			{[...counted, ...rest].map((row, i) => (
				<li key={row.key} className='border-b border-[var(--rule-soft)] py-3'>
					<div className='flex items-baseline justify-between gap-3'>
						<span className='min-w-0 text-[0.875rem] font-semibold leading-snug text-[var(--ink)]'>
							{row.population != null ? <span className='num mr-1 font-normal text-[var(--ink-mute)]'>{i + 1}.</span> : null}
							{row.name}
						</span>
						<span className='num shrink-0 text-[0.84375rem] text-[var(--accent)]'>
							{row.population != null ? formatNumber(row.population) : '—'}
						</span>
					</div>
					<div className='mt-1 flex items-baseline justify-between gap-3 text-[0.71875rem] text-[var(--ink-3)]'>
						<span className='min-w-0 truncate'>{row.captain ?? ''}</span>
						<span className='shrink-0'>
							{row.population != null && total ? `${pct(row.population, total)} of the ${whole}` : 'No 2024 count'}
						</span>
					</div>
					<div className={`mt-2 h-1.5 ${track}`}>
						{row.population != null ? (
							<div className='h-full bg-[var(--accent)]' style={{ width: `${(row.population / top) * 100}%` }} />
						) : null}
					</div>
				</li>
			))}
		</ol>
	)
}
