import type { Icon } from '@phosphor-icons/react'
import { ArrowUpRightIcon, EnvelopeSimpleIcon, FireIcon, FirstAidIcon, HouseIcon, PhoneIcon, ShieldIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import { LINE_LABEL, telHref, type Line, type LguEmail } from '../_lib/directory'
import type { DiscoverPhotoKey } from './discover-media'
import { BRAND_HEAD, HeroPattern } from './photo-hero'

/* The pieces every directory page shares: a number you can tap, a block of service lines, a crumb trail. */

export const linkClass = 'underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]'

export function Phone({ number }: { number: string }) {
	return (
		<li className='flex gap-2'>
			<PhoneIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
			<a href={telHref(number)} className={`tabular-nums ${linkClass}`}>
				{number}
			</a>
		</li>
	)
}

const LINE_ICON: Record<Line['kind'], Icon> = { drrm: SirenIcon, police: ShieldIcon, fire: FireIcon, health: FirstAidIcon, hall: HouseIcon, other: PhoneIcon }

// Kept as written when a name is in capitals: the offices' acronyms, roman numerals and initials ("B.").
const ACRONYM = /^(RHU|BHS|BHU|PNP|BFP|EMS|ER|OPD|MDRRMO|PDRRMO|CDRRMO|MDRRMC|DRRMO|MHO|PHO|CHO|LGU|MPS|CPS|PPO|AFP|DOH|DSWD|MSWD|MSWDO|BARMM|II|III|IV|[A-Z]\.)$/

/** A name the source prints in capitals ("SOUTH UBIAN RHU"), set in ordinary case with its acronyms kept ("South Ubian RHU"). */
function plainCase(name: string) {
	if (name !== name.toUpperCase() || !/[A-Z]{3}/.test(name)) return name
	return name
		.split(/(\s+|-|\/)/)
		.map((w, i, parts) => {
			if (ACRONYM.test(w) || !/[A-Z]/.test(w)) return w
			// The short end of a hyphenated name stays small: Ditsa-an.
			if (parts[i - 1] === '-' && w.length <= 2) return w.toLowerCase()
			return w.charAt(0) + w.slice(1).toLowerCase()
		})
		.join('')
}

/** One office once: the same office listed for each of its numbers becomes one row with all of them, and a
 *  number written two ways (0906-219-3489, 09062193489) is one number. */
function mergeLines(lines: Line[]) {
	const byOffice = new Map<string, Line & { sources: string[] }>()
	for (const l of lines) {
		const key = `${l.kind}|${l.name.trim().toLowerCase()}`
		const row = byOffice.get(key) ?? { ...l, name: plainCase(l.name.trim()), phones: [], sources: [] }
		const digits = new Set(row.phones.map((p) => p.replace(/\D/g, '')))
		for (const p of l.phones) {
			const d = p.replace(/\D/g, '')
			if (digits.has(d)) continue
			row.phones.push(p)
			digits.add(d)
		}
		if (!row.sources.includes(l.source)) row.sources.push(l.source)
		byOffice.set(key, row)
	}
	return [...byOffice.values()]
}

/** Emergency and service lines as a list: what the office is, its numbers to tap, and where they were read. */
export function Lines({ lines, empty }: { lines: Line[]; empty: string }) {
	if (!lines.length) return <p className='mt-3 text-[0.84375rem] text-[var(--ink-3)]'>{empty}</p>
	return (
		<ul className='mt-3 divide-y divide-[var(--rule-soft,var(--rule))] border-y border-[var(--rule)]'>
			{mergeLines(lines).map((l) => {
				const Glyph = LINE_ICON[l.kind]
				return (
					<li key={l.kind + l.name} className='flex gap-3 py-3'>
						<Glyph size={16} weight='fill' className='mt-0.5 shrink-0 text-[var(--accent)]' aria-hidden='true' />
						<div className='min-w-0 flex-1'>
							<p className='text-[0.875rem] font-semibold leading-snug'>
								{l.name} <span className='ml-1 text-[0.75rem] font-medium text-[var(--ink-3)]'>{LINE_LABEL[l.kind]}</span>
							</p>
							<p className='mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.8125rem]'>
								{l.phones.map((p) => (
									<a key={p} href={telHref(p)} className={`tabular-nums ${linkClass}`}>
										{p}
									</a>
								))}
							</p>
						</div>
						<span className='flex shrink-0 flex-col items-end gap-0.5 pt-0.5'>
							{l.sources.map((src, i) => (
								<a key={src} href={src} target='_blank' rel='noreferrer' className='inline-flex items-center gap-0.5 text-[0.71875rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
									Source{l.sources.length > 1 ? ` ${i + 1}` : ''} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							))}
						</span>
					</li>
				)
			})}
		</ul>
	)
}

/** "2026-08" or "2026" as "August 2026" or "2026". */
export function monthYear(d: string | null) {
	if (!d) return null
	const [y, m] = d.split('-').map(Number)
	return m ? new Date(Date.UTC(y!, m - 1, 1)).toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : String(y)
}

/** A local government's email, with the page that prints it. */
export function LguEmailBlock({ email, className = 'mt-8' }: { email: LguEmail | null; className?: string }) {
	if (!email) return null
	return (
		<div className={className}>
			<p className='mb-1.5 font-[family-name:var(--font-display)] text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-3)]'>Email</p>
			<ul className='space-y-1 text-[0.875rem] leading-6'>
				{email.emails.map((e) => (
					<li key={e} className='flex gap-2'>
						<EnvelopeSimpleIcon size={15} className='mt-1 shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
						<a href={`mailto:${e}`} className={`break-all ${linkClass}`}>
							{e}
						</a>
					</li>
				))}
			</ul>
			<a href={email.source} target='_blank' rel='noreferrer' className='mt-1 inline-flex items-center gap-0.5 text-[0.75rem] text-[var(--ink-3)] hover:text-[var(--accent)]'>
				{email.office ?? 'Source'} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
			</a>
		</div>
	)
}

type HeadPhoto = { src: string; alt: string; credit: { credit: string; license: string; source: string } }
/** `className` sizes the logo where the default is too big for it, as a seal is. */
type HeadLogo = { src: string; alt: string; title: string; className?: string }

/** A directory dialog's header, in the travel look with the pattern header (user decision: no photographs behind the
 * directory's headers): the brand crimson and its lattice, its seal or logo on a white tile at the top left of its
 * name. Compact, since it opens inside a panel with no bars over it. `photo` and `discover` are still accepted, as the
 * pages pass them, but no longer drawn. */
export function DirectoryHead({
	label,
	name,
	logo,
}: {
	label: string
	name: string
	photo?: HeadPhoto | null
	logo: HeadLogo | null
	discover?: DiscoverPhotoKey
}) {
	return (
		<header className={`${BRAND_HEAD} relative isolate overflow-hidden text-white`}>
			<HeroPattern />
			<div className='bb-container relative flex items-end pb-12 pt-16 md:pb-16 md:pt-20'>
				<div className='flex w-full items-start gap-4 sm:gap-6'>
					{logo ? (
						<span className='grid shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.7)] sm:p-2.5'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={logo.src} alt={logo.alt} title={logo.title} className={`object-contain ${logo.className ?? 'size-14 md:size-20'}`} />
						</span>
					) : null}
					<div className='min-w-0 flex-1'>
						<p className='font-[family-name:var(--font-display)] text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#f1c453]'>{label}</p>
						<h1 className='mt-2 text-balance font-[family-name:var(--font-display)] text-[clamp(1.875rem,3.6vw,3.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white'>
							{name}
						</h1>
					</div>
				</div>
			</div>
		</header>
	)
}
