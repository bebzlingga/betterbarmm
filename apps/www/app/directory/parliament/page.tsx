import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import parliament from '../../../../../datasets/bills/bangsamoro_registry/members/parliament-2026.json'
import { linkClass } from '../../_components/directory-bits'
import { memberId } from '../../_lib/directory'
import { Masthead } from '../../_components/masthead'
import { DirectoryDialog } from '../../_components/directory-dialog'
import { pageMeta } from '../../_lib/seo'

export const metadata: Metadata = pageMeta({
	title: 'Members of Parliament — Directory',
	description: 'The 80 Members of the first elected Bangsamoro Parliament, by seat: district, party, sectoral and indigenous peoples representatives, each linked to their profile.',
	path: '/directory/parliament',
})

type Member = {
	fullName: string
	rosterName: string
	seat: string
	seatLabel: string
	district: string | null
	sector: string | null
	partyLabel: string | null
	photo?: { file: string } | null
}

const LEGISLATION = 'https://legislation.betterbarmm.com'
const members = parliament.members as Member[]
const ORDER = ['District representative', 'Party representative', 'Sectoral representative', 'Non-Moro indigenous peoples representative']
const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter((w) => /^[A-Z]/.test(w))
		.slice(0, 2)
		.map((w) => w[0])
		.join('')

export default function ParliamentDirectoryPage() {
	const groups = ORDER.map((label) => ({ label, list: members.filter((m) => m.seatLabel === label) })).filter((g) => g.list.length)

	return (
		<DirectoryDialog id={'parliament'} name={'Members of Parliament'}>
			<Masthead brand label='Directory' lines={['Members of Parliament']} />

			<section className='bb-container bb-section'>
				<p className='text-[14.5px] leading-[1.7] text-[var(--ink-2)]'>
					The {members.length} Members elected on 14 September 2026, who take office on 30 October 2026. Their offices in Parliament are not yet published; until they are, write through the{' '}
					<a href='https://parliament.bangsamoro.gov.ph/' target='_blank' rel='noreferrer' className={linkClass}>
						Bangsamoro Parliament
					</a>
					. Each name opens the full profile on the{' '}
					<a href={`${LEGISLATION}/members/elected`} className={linkClass}>
						legislation workspace
					</a>
					.
				</p>

				{groups.map((g) => (
					<section key={g.label} aria-label={g.label} className='mt-12'>
						<h2 className='text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-3)]'>
							{g.label}s <span className='text-[var(--ink-mute)]'>{g.list.length}</span>
						</h2>
						<ul className='mt-4 grid pt-px pl-px sm:grid-cols-2 lg:grid-cols-4'>
							{g.list.map((m) => (
								<li key={m.rosterName} id={memberId(m)} className='-mt-px -ml-px scroll-mt-[calc(var(--site-header-h)+1rem)] border border-[var(--rule)] bg-[var(--paper)] target:bg-[var(--paper-2)] target:outline-2 target:outline-[var(--accent)]'>
									<a href={`${LEGISLATION}/members/elected`} className='group flex h-full items-center gap-3 p-4 hover:bg-[var(--paper-2)]'>
										{m.photo ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={`${LEGISLATION}/images/members/elected/${m.photo.file}`} alt='' loading='lazy' className='size-12 shrink-0 rounded-full object-cover' />
										) : (
											<span aria-hidden='true' className='flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--paper-2)] text-[13px] font-bold text-[var(--ink-3)]'>
												{initials(m.fullName)}
											</span>
										)}
										<span className='min-w-0'>
											<span className='block text-[14px] font-semibold leading-snug group-hover:text-[var(--accent)]'>{m.fullName}</span>
											<span className='block text-[12px] leading-5 text-[var(--ink-3)]'>{[m.district ?? m.sector, m.partyLabel].filter(Boolean).join(' · ')}</span>
										</span>
										<ArrowUpRightIcon size={12} className='ml-auto shrink-0 text-[var(--ink-3)] group-hover:text-[var(--accent)]' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</section>
				))}
			</section>
		</DirectoryDialog>
	)
}
