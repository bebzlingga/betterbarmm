import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { Stagger, StaggerItem } from '@betterbarmm/editorial'
import { bangsamoroParliament, type DiscoverBarmmDetailCard } from '@betterbarmm/primer-data'
import { directoryOffices } from '../_lib/directory'
import { headPhoto, officeLogo } from '../_lib/images'
import { InstitutionBrowser, type Institution } from './institution-browser'

/* ============================================================
   The Government chapter's own modules

   Two things the chapter's cards could not say on their own: how
   the parts connect — who elects whom, who answers to whom — and,
   among thirty institutions, which are ministries and which are the
   commissions, authorities and offices beside them. Each institution
   is joined to its directory entry by acronym, so the row carries
   the office's own logo and current head, and opens on its page.
   ============================================================ */

const isMinistry = (card: DiscoverBarmmDetailCard) => card.title.startsWith('Ministry')

const officeFor = (card: DiscoverBarmmDetailCard) => {
	const a = card.value?.toUpperCase()
	return a ? directoryOffices.find((o) => o.acronym?.toUpperCase() === a) : undefined
}

/** Who chooses whom, in four steps, left to right: the line authority runs along. */
export function GovernmentFlow({ cards }: { cards: DiscoverBarmmDetailCard[] }) {
	// The same split as the list below: the cards given are the ministries and the offices beside them.
	const ministries = cards.filter(isMinistry).length
	const offices = cards.length - ministries
	const p = bangsamoroParliament

	const steps = [
		{
			who: 'The voters',
			figure: '2 votes',
			text: 'One for a party and one for their district\'s member of Parliament.',
			verb: 'elect',
		},
		{
			who: 'The Parliament',
			figure: `${p.totalSeats} seats`,
			text: `${p.partyRepresentativeSeats} by party, ${p.districtSeats} by district, ${p.reservedSeats} reserved. It makes the region's laws and passes its budget.`,
			verb: 'chooses',
		},
		{
			who: 'The Chief Minister',
			figure: `${p.majorityThreshold} votes`,
			text: 'Elected by a majority of Parliament, from among its members, and answerable to it.',
			verb: 'leads',
		},
		{
			who: 'The Cabinet and its offices',
			figure: `${ministries} ministries`,
			text: `With ${offices} commissions, authorities and offices beside them, which deliver the region's services.`,
		},
	]

	return (
		<Stagger gap={0.1} className='grid gap-px overflow-hidden rounded-[3px] border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-4'>
			{steps.map((s, i) => (
				<StaggerItem key={s.who} className='relative flex flex-col bg-[var(--paper)] p-6 lg:p-7'>
					<span className='num font-mono text-[0.625rem] font-semibold tracking-[0.16em] text-[var(--accent)]'>
						{String(i + 1).padStart(2, '0')}
					</span>
					<p className='mt-4 text-[1.125rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--ink)]'>{s.who}</p>
					<p className='bb-figure-sm mt-5 text-[var(--ink)]'>{s.figure}</p>
					<p className='mt-3 flex-1 text-[0.875rem] leading-[1.6] text-[var(--ink-2)]'>{s.text}</p>
					{s.verb ? (
						<p className='mt-6 inline-flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-[var(--brass)]'>
							{s.verb}
							<ArrowRightIcon className='size-3.5 rotate-90 md:rotate-0' weight='bold' aria-hidden='true' />
						</p>
					) : null}
				</StaggerItem>
			))}
		</Stagger>
	)
}

/** The institutions, prepared for the browser: each card joined to its directory entry for its logo, head and page. */
export function InstitutionList({ cards }: { cards: DiscoverBarmmDetailCard[] }) {
	// Ministries first, then the offices beside them, as the filter lists them.
	const items: Institution[] = [...cards.filter(isMinistry), ...cards.filter((c) => !isMinistry(c))].map((card) => {
		const office = officeFor(card)
		return {
			title: card.title,
			acronym: card.value ?? null,
			description: card.description,
			kind: isMinistry(card) ? 'ministry' : 'office',
			logo: office ? officeLogo(office.slug) : null,
			head: office?.head
				? { title: office.head.title.replace(/\s*\(.*\)$/, ''), name: office.head.name, photo: headPhoto(office.slug) }
				: null,
			directoryHref: office ? `/directory/office/${office.slug}` : null,
			href: card.href ?? null,
			hrefLabel: card.sourceLabel && card.sourceLabel !== card.value ? card.sourceLabel : 'Website',
		}
	})
	return <InstitutionBrowser items={items} />
}
