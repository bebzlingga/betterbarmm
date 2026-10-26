import { ArrowUpRightIcon, CaretRightIcon } from '@phosphor-icons/react/ssr'
import type { OrgSource, OrgStructure, OrgUnit } from '../_lib/directory'
import { monthYear } from './directory-bits'

/* An office's organizational structure as a tree: each unit, the person who
   heads it where a source names one, and that source. The top level opens
   in full; a bureau's divisions fold under it, indented along a rule. */

/** A source as a link: a PDF opens at its page. */
const href = (s: OrgSource) => (typeof s === 'string' ? s : s.page && /\.pdf($|\?)/i.test(s.url) ? `${s.url}#page=${s.page}` : s.url)
const when = (s: OrgSource) => (typeof s === 'string' || !s.date ? null : monthYear(s.date.slice(0, 7)))

const count = (units: OrgUnit[]): { all: number; named: number } =>
	units.reduce((n, u) => {
		const c = count(u.units ?? [])
		return { all: n.all + 1 + c.all, named: n.named + (u.head ? 1 : 0) + c.named }
	}, { all: 0, named: 0 })

/** A name or title the source printed in capitals, in the page's own case; one already in mixed case is left alone. */
const SMALL = new Set(['of', 'and', 'the', 'for', 'in', 'del', 'de', 'sa', 'a'])
const KEEP = /^(RSW|MPA|MD|PhD|CPA|BARMM|PSWO|IPHO|MSSD|MOH|DDS|II|III|IV|V|VI|JR\.?|SR\.?)$/i
function tidy(s: string | null | undefined) {
	if (!s) return s ?? ''
	// A trailing "Jr." in mixed case does not stop a name otherwise in capitals from counting as capitals.
	const core = s.replace(/\b(Jr|Sr)\.?/g, '')
	if (core !== core.toUpperCase() || !/[A-Z]{3}/.test(core)) return s
	return s
		.toLowerCase()
		.split(/(\s+|-)/)
		.map((w, i) => {
			const up = w.toUpperCase()
			// An acronym in brackets, as in "(PPB)", stays in capitals.
			if (/^\([a-z]{2,8}\)[,.]?$/.test(w)) return up
			if (KEEP.test(up.replace(/[,.]$/, ''))) return /^(JR|SR)/.test(up) ? up[0] + up.slice(1).toLowerCase() : up
			if (i && SMALL.has(w)) return w
			return w.charAt(0).toUpperCase() + w.slice(1)
		})
		.join('')
}

function Head({ u }: { u: OrgUnit }) {
	if (!u.head) return <span className='text-[var(--ink-mute)]'>–</span>
	const source = u.head.source ?? u.source
	return (
		<>
			<span className='font-semibold'>{tidy(u.head.name)}</span>
			{u.head.title ? <span className='text-[var(--ink-3)]'>, {tidy(u.head.title)}</span> : null}
			{source ? (
				<a href={href(source)} target='_blank' rel='noreferrer' className='ml-2 inline-flex items-center gap-0.5 align-baseline text-[0.6875rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
					{when(source) ?? 'Source'} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
				</a>
			) : null}
		</>
	)
}

function Row({ u, depth }: { u: OrgUnit; depth: number }) {
	return (
		<div className='grid gap-x-6 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
			<p className={`${depth ? 'text-[0.8125rem] font-semibold' : 'text-[0.875rem] font-bold'} leading-snug`}>
				{tidy(u.name)}
				{u.source_kind === 'law' ? <span className='ml-2 font-mono text-[0.5625rem] font-semibold whitespace-nowrap uppercase tracking-[0.12em] text-[var(--ink-mute)] opacity-60'>By law</span> : null}
				{u.units?.length ? <span className='ml-2 text-[0.71875rem] font-normal text-[var(--ink-mute)]'>{count(u.units).all}</span> : null}
			</p>
			<p className='text-[0.8125rem] leading-snug'>
				<Head u={u} />
			</p>
		</div>
	)
}

/** A unit; one with units of its own folds them away behind its row, so a large office stays one screen at first. */
function Unit({ u, depth }: { u: OrgUnit; depth: number }) {
	const kids = u.units ?? []
	return (
		<li className={depth ? 'border-l border-[var(--rule)] pl-4' : ''}>
			{kids.length ? (
				<details className='group'>
					<summary className='flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden'>
						<CaretRightIcon size={13} weight='bold' className='mt-[0.9rem] shrink-0 text-[var(--ink-3)] transition group-open:rotate-90' aria-hidden='true' />
						<span className='min-w-0 flex-1'>
							<Row u={u} depth={depth} />
						</span>
					</summary>
					<ul className='mb-2 ml-[5px]'>
						{kids.map((c, i) => (
							<Unit key={i} u={c} depth={depth + 1} />
						))}
					</ul>
				</details>
			) : (
				<div className='pl-[21px]'>
					<Row u={u} depth={depth} />
				</div>
			)}
		</li>
	)
}

export function OfficeStructure({ org }: { org: OrgStructure }) {
	const { all, named } = count(org.units)
	return (
		<section aria-labelledby='structure' className='mt-14'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 id='structure' className='text-[1.25rem] font-extrabold'>
					{/* Counts the people named, not the units: the line beside it says how many units have one. */}
					Officials <span className='text-[var(--ink-mute)]'>{named}</span>
				</h2>
				<p className='text-[0.78125rem] text-[var(--ink-3)]'>
					{named} of {all} units with a named head{org.as_of ? `, as of ${monthYear(org.as_of)}` : ''}
				</p>
			</div>
			<ul className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
				{org.units.map((u, i) => (
					<Unit key={i} u={u} depth={0} />
				))}
			</ul>
			{org.sources.length ? (
				<p className='mt-3 text-[0.78125rem] leading-6 text-[var(--ink-mute)] opacity-70'>
					From{' '}
					{org.sources.map((s, i) => (
						<span key={s.url}>
							{i ? '; ' : ''}
							<a href={s.url} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
								{s.label}
							</a>
						</span>
					))}
					.
				</p>
			) : null}
		</section>
	)
}

/** How the structure was read from its sources, for the section at the foot of the office's dialog. */
export function OrgNote({ org }: { org: OrgStructure }) {
	return org.note ? <p>{org.note}</p> : null
}
