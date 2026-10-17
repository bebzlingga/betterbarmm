import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { OrgStructure, OrgUnit } from '../_lib/directory'
import { monthYear } from './directory-bits'

/* An office's organizational structure as a tree: each unit, the person who
   heads it where a source names one, and that source. The top level opens
   in full; a bureau's divisions sit under it, indented along a rule. */

const count = (units: OrgUnit[]): { all: number; named: number } =>
	units.reduce((n, u) => {
		const c = count(u.units ?? [])
		return { all: n.all + 1 + c.all, named: n.named + (u.head ? 1 : 0) + c.named }
	}, { all: 0, named: 0 })

function Unit({ u, depth }: { u: OrgUnit; depth: number }) {
	const source = u.head?.source ?? u.source
	return (
		<li className={depth ? 'border-l border-[var(--rule)] pl-4' : ''}>
			<div className='grid gap-x-6 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
				<p className={`${depth ? 'text-[14px] font-semibold' : 'text-[15px] font-bold'} leading-snug`}>
					{u.name}
					{u.source_kind === 'law' ? <span className='ml-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>By law</span> : null}
				</p>
				<p className='text-[14px] leading-snug'>
					{u.head ? (
						<>
							<span className='font-semibold'>{u.head.name}</span>
							{u.head.title ? <span className='text-[var(--ink-3)]'>, {u.head.title}</span> : null}
						</>
					) : (
						<span className='text-[var(--ink-mute)]'>Head not named in a source</span>
					)}
					{source ? (
						<a href={source} target='_blank' rel='noreferrer' className='ml-2 inline-flex items-center gap-0.5 align-baseline text-[11.5px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
							Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
						</a>
					) : null}
				</p>
			</div>
			{u.units?.length ? (
				<ul className='mb-2 ml-1'>
					{u.units.map((c, i) => (
						<Unit key={i} u={c} depth={depth + 1} />
					))}
				</ul>
			) : null}
		</li>
	)
}

export function OfficeStructure({ org }: { org: OrgStructure }) {
	const { all, named } = count(org.units)
	return (
		<section aria-labelledby='structure' className='mt-14'>
			<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
				<h2 id='structure' className='text-[20px] font-extrabold'>
					How it is organized <span className='text-[var(--ink-mute)]'>{all}</span>
				</h2>
				<p className='text-[12.5px] text-[var(--ink-3)]'>
					{named} of {all} units with a named head{org.as_of ? `, as of ${monthYear(org.as_of)}` : ''}
				</p>
			</div>
			<ul className='mt-3 divide-y divide-[var(--rule-soft)] border-y border-[var(--rule)]'>
				{org.units.map((u, i) => (
					<Unit key={i} u={u} depth={0} />
				))}
			</ul>
			{org.sources.length ? (
				<p className='mt-3 text-[12.5px] leading-6 text-[var(--ink-3)]'>
					From{' '}
					{org.sources.map((s, i) => (
						<span key={s.url}>
							{i ? '; ' : ''}
							<a href={s.url} target='_blank' rel='noreferrer' className='underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]'>
								{s.label}
							</a>
						</span>
					))}
					. {org.note ?? ''}
				</p>
			) : null}
		</section>
	)
}
