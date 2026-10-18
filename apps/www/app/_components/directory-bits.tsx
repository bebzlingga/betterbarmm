import type { Icon } from '@phosphor-icons/react'
import { ArrowUpRightIcon, FireIcon, FirstAidIcon, HouseIcon, PhoneIcon, ShieldIcon, SirenIcon } from '@phosphor-icons/react/ssr'
import { LINE_LABEL, telHref, type Line } from '../_lib/directory'
import { PhotoCredit } from './discover-figure'
import { Masthead } from './masthead'

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

/** Emergency and service lines as cards: what the office is, its numbers, where the numbers were read. */
export function Lines({ lines, empty }: { lines: Line[]; empty: string }) {
	if (!lines.length) return <p className='mt-3 text-[13.5px] text-[var(--ink-3)]'>{empty}</p>
	// Each card draws its own hairline, overlapping its neighbour's, so a row the cards do not fill shows the page, not a grey block.
	return (
		<ul className='mt-4 grid pt-px pl-px sm:grid-cols-2 lg:grid-cols-3'>
			{lines.map((l) => {
				const Glyph = LINE_ICON[l.kind]
				return (
					<li key={l.kind + l.name} className='-mt-px -ml-px border border-[var(--rule)] bg-[var(--paper)] p-5'>
						<p className='flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]'>
							<Glyph size={15} weight='fill' aria-hidden='true' /> {LINE_LABEL[l.kind]}
						</p>
						<p className='mt-1.5 text-[14.5px] font-semibold leading-snug'>{l.name}</p>
						<ul className='mt-2 space-y-1 text-[14px]'>
							{l.phones.map((p) => (
								<Phone key={p} number={p} />
							))}
						</ul>
						<a href={l.source} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-0.5 text-[11.5px] text-[var(--ink-3)] hover:text-[var(--accent)]'>
							Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
						</a>
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

type HeadPhoto = { src: string; alt: string; credit: { credit: string; license: string; source: string } }
type HeadLogo = { src: string; alt: string; title: string }

/** A directory dialog's band: its label and name over the crimson ground, the place's or the office's photograph
 * blended into that ground where there is one, and its logo or seal on the right. */
export function DirectoryHead({ label, name, photo, logo }: { label: string; name: string; photo: HeadPhoto | null; logo: HeadLogo | null }) {
	return (
		<Masthead
			brand
			label={label}
			lines={[name]}
			backdrop={
				photo ? (
					<span className='absolute inset-0'>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={photo.src} alt={photo.alt} className='absolute inset-0 size-full object-cover opacity-45 mix-blend-luminosity' />
						{/* The crimson comes back over the left, so the name reads; the photograph shows through on the right. */}
						<span aria-hidden='true' className='absolute inset-0 bg-[linear-gradient(90deg,var(--paper)_20%,color-mix(in_srgb,var(--paper)_55%,transparent)_65%,transparent)]' />
						<span className='[&_.dsc-credit]:z-10'>
							<PhotoCredit photo={photo.credit} />
						</span>
					</span>
				) : null
			}
			aside={
				logo ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={logo.src} alt={logo.alt} title={logo.title} className='mr-12 size-[4.5rem] shrink-0 object-contain md:mr-14 md:size-[6.5rem]' />
				) : null
			}
		/>
	)
}
