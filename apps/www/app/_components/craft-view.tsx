import { ArrowUpRightIcon, EnvelopeSimpleIcon, MapPinIcon, SealCheckIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { toneVars } from '../_lib/craft-tone'
import { cropStyle } from '../_lib/commons'
import { GROUP, PROVINCE, commonsThumb, related, type Craft } from '../_lib/crafts'
import { craftTowns, festivalsFor, placesFor } from '../_lib/craft-places'
import { CraftCard } from './craft-card'
import { CraftSpecs } from './craft-specs'
import { CraftStage } from './craft-stage'
import { monthYear } from './directory-bits'

/* One craft, in the full-screen dialog over the catalogue: the showroom
   card filling the screen, then how it is made and where to see it. The palette is its own,
   the same in light and dark: warm brown and cream. */

// Important: the shared base styles set the body face on p, li and dd outside any layer.
const serif = 'font-[family-name:var(--font-craft)]!'
const label = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'
/** A link as its reader would name it: a book by its title (and Pusaka by its page), anything else by its site. */
const sourceLabel = (s: string) => {
	const page = s.match(/BARMM-CTB.*#page=(\d+)/)?.[1]
	if (page) return `Pusaka (BCPCH), p. ${page}`
	// The National Library's scan of the CCP Encyclopedia of Philippine Art.
	if (s.includes('NLP00VM052mcd')) return 'CCP Encyclopedia of Philippine Art (1994)'
	return new URL(s).hostname.replace(/^www\./, '')
}
const source = 'inline-flex items-center gap-0.5 text-[11.5px] text-[#8a6d5c] hover:text-[#5a3424]'
const BUY_KIND = { fair: 'Fair', centre: 'Centre', shop: 'Shop', otop: 'One Town, One Product', cooperative: 'Cooperative', online: 'Online' }
const peso = (n: number) => `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
/** A short email to the site about this craft, its subject and a skeleton filled in. */
const mailto = (c: Craft) =>
	`mailto:support@betterbarmm.com?subject=${encodeURIComponent(`Crafts: ${c.name}`)}&body=${encodeURIComponent(
		`About ${c.name} (betterbarmm.com/crafts/${c.slug})\n\nWhat to add or correct (a maker, a place to buy it, a price, a photo you took):\n\nThe source (a link, a document, or how you know):\n`,
	)}`

export function CraftView({ c }: { c: Craft }) {
	const others = related(c, 4)
	const towns = craftTowns(c)
	const fests = festivalsFor(c)
	const places = placesFor(c)
	const prices = [...(c.prices ?? [])].sort((a, b) => b.as_of.localeCompare(a.as_of))
	const next = others[0]!
	const made = [c.towns.join(', '), PROVINCE[c.province]].filter(Boolean).join(', ')
	const specs = (
		[
			['Made in', made],
			['Materials', c.materials],
			['Worn or used', c.uses],
		] as const
	).filter(([, v]) => v)

	return (
		<>
		{/* The card takes its colours from the photo on show; the stage repaints them when another is picked. */}
			<section data-craft-tone style={toneVars(c.images[0]?.tone)} className='craft-tone flex min-h-dvh items-center bg-[linear-gradient(90deg,var(--tone-out-l)_0_63%,var(--tone-out-r)_63%_100%)] px-4 py-16 sm:px-6 lg:py-14'>
			<div className='relative mx-auto flex w-full max-w-[84rem] flex-col overflow-hidden rounded-[10px] shadow-[0_40px_80px_-30px_rgba(30,12,5,0.7)] lg:grid lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[63fr_37fr]'>
				<div className='flex flex-col bg-[radial-gradient(ellipse_at_70%_15%,var(--tone-glow),var(--tone-panel)_55%,var(--tone-edge))] p-7 text-[#f4e8dc] sm:p-12'>
					<p className={`${serif} flex flex-wrap items-center gap-x-3 text-[26px] font-bold sm:text-[32px]`}>
						<Link href='/crafts' replace className='hover:text-white'>
							Crafts of the Bangsamoro
						</Link>
						<span className='text-[#d9bba6]'>·</span>
						<span className='text-[#d9bba6]'>{GROUP[c.group]}</span>
					</p>

					<div className='my-auto max-w-[34rem] py-10 lg:pt-0 lg:pb-32'>
						<p className={`${label} text-[#e7c9a9]`}>
							{c.people} · {PROVINCE[c.province]}
						</p>
						{/* A short name is set large; a long one steps down so it keeps to two or three lines. */}
						<h1 className={`${serif} mt-3 font-bold leading-[1.05] ${c.name.length > 18 ? 'text-[36px] sm:text-[44px] lg:text-[52px]' : 'text-[44px] sm:text-[60px] lg:text-[72px]'}`}>{c.name}</h1>
						<p className={`${serif} mt-1 text-[17px] italic text-[#e7c9a9]`}>{c.local_name}</p>
						{c.heritage?.length ? (
							<ul className='mt-4 flex flex-wrap gap-2'>
								{c.heritage.map((h) => (
									<li key={h.status}>
										<a href={h.source} target='_blank' rel='noreferrer' title={h.note} className='inline-flex items-center gap-1.5 rounded-full border border-[#e7c9a9]/50 px-3 py-1 text-[12px] font-semibold text-[#f4e8dc] hover:border-[#f4e8dc]'>
											<SealCheckIcon size={14} weight='fill' aria-hidden='true' /> {h.status} · {h.body}
										</a>
									</li>
								))}
							</ul>
						) : null}
						<p className={`${serif} mt-5 text-[16px] leading-[1.6] text-[#ecdccd]`}>{c.summary}</p>
						{/* The newest price here; every price, dated, sits below with where to buy. */}
						{prices[0] ? (
							<p className='mt-4 text-[13px] text-[#e7c9a9]'>
								{prices[0].text}{' '}
								<a href={prices[0].source} target='_blank' rel='noreferrer' className='underline underline-offset-2 hover:text-white'>
									as of {monthYear(prices[0].as_of)}
								</a>
								{prices.length > 1 ? <span className='text-[#d9bba6]'> · {prices.length - 1} more below</span> : null}
							</p>
						) : null}
					</div>

					<CraftSpecs specs={specs} labelClass={serif} />
				</div>

				<div className='flex flex-col bg-[var(--tone-paper)] p-6 sm:p-10'>
					<CraftStage
						key={c.slug}
						name={c.name}
						colors={c.colors}
						// The three-dimensional studies are off for now; c.model turns them back on.
						model={null}
						images={c.images}
						className='h-[26rem] lg:absolute lg:top-20 lg:right-10 lg:bottom-48 lg:left-[49%] lg:h-auto'
					/>
					<Link href={`/crafts/${next.slug}`} replace className='group mt-8 block lg:mt-auto'>
						<p className={`${serif} text-[14px] text-[#8a6d5c]`}>More like it</p>
						<span className='mt-2 flex items-center gap-4 bg-white p-3'>
							{next.images[0] ? (
								<span className='relative size-16 shrink-0 overflow-hidden'>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={commonsThumb(next.images[0].url, 250)} alt='' loading='lazy' style={cropStyle(next.images[0], 1) ?? undefined} className='size-full object-cover' />
								</span>
							) : (
								<span className='size-16 shrink-0' style={{ background: `linear-gradient(135deg, ${next.colors.join(', ')})` }} />
							)}
							<span className='min-w-0'>
								<span className={`${serif} block text-[15px] font-bold leading-snug group-hover:text-[#7b4a35]`}>{next.name}</span>
								<span className='block truncate text-[12px] text-[#8a6d5c]'>
									{next.people} · {PROVINCE[next.province]}
								</span>
							</span>
						</span>
					</Link>
				</div>
			</div>
		</section>

		<section className='mx-auto grid max-w-[84rem] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-x-24 lg:py-20'>
			<div>
				{c.how_made ? (
					<>
						<h2 className={`${serif} text-[26px] font-bold`}>How it is made</h2>
						<p className={`${serif} mt-3 max-w-2xl text-[17px] leading-[1.7] text-[#5a3d2e]`}>{c.how_made}</p>
					</>
				) : null}
				{c.motifs?.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Motifs</h3>
						<ul className='mt-3 space-y-2 text-[14.5px] leading-[1.6] text-[#5a3d2e]'>
							{c.motifs.map((m) => (
								<li key={m.name} className='border-l-2 border-[#c89b4a] pl-3'>
									<span className='font-semibold italic text-[#3b2419]'>{m.name}</span>
									{m.meaning ? `, ${m.meaning}` : null}
								</li>
							))}
						</ul>
					</>
				) : null}
				{c.makers.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Makers</h3>
						<ul className='mt-3 grid gap-4 sm:grid-cols-2'>
							{c.makers.map((m) => (
								<li key={m.name} className='rounded-[4px] bg-white p-4'>
									{m.honour ? <p className='mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6a4f]'>{m.honour}</p> : null}
									<p className={`${serif} text-[16px] font-bold`}>{m.name}</p>
									{m.town ? <p className='text-[12.5px] text-[#8a6d5c]'>{m.town}</p> : null}
									<p className='mt-1 text-[13.5px] leading-[1.55] text-[#5a3d2e]'>{m.note}</p>
									<a href={m.source} target='_blank' rel='noreferrer' className={`mt-2 ${source}`}>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</>
				) : null}
				{towns.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Where it is made</h3>
						<ul className='mt-3 flex flex-wrap gap-2'>
							{towns.map(({ label: t, town }) => (
								<li key={t}>
									{town?.href ? (
										<Link href={town.href} className='inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] text-[#5a3d2e] hover:text-[#3b2419]'>
											<MapPinIcon size={13} aria-hidden='true' /> {t} <span className='text-[#8a6d5c]'>· {town.province}</span>
										</Link>
									) : (
										<span className='inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] text-[#5a3d2e]'>
											<MapPinIcon size={13} aria-hidden='true' /> {t}
										</span>
									)}
								</li>
							))}
						</ul>
						<p className='mt-2 text-[12px] text-[#8a6d5c]'>Each town opens in the Directory: its mayor, its offices and how to reach them.</p>
					</>
				) : null}
				{c.heritage?.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Heritage</h3>
						<ul className='mt-3 space-y-3'>
							{c.heritage.map((h) => (
								<li key={h.status} className='border-l-2 border-[#c89b4a] pl-3 text-[14px] leading-[1.6] text-[#5a3d2e]'>
									<span className='font-semibold text-[#3b2419]'>
										{h.status}, {h.body}.
									</span>{' '}
									{h.note}{' '}
									<a href={h.source} target='_blank' rel='noreferrer' className={source}>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</>
				) : null}
			</div>

			<div>
				<h2 className={`${serif} text-[26px] font-bold`}>Where to see it</h2>
				{c.where_to_see.length ? (
					<ul className='mt-4 divide-y divide-[#e4d8cb] border-y border-[#e4d8cb]'>
						{c.where_to_see.map((w) => (
							<li key={w.name} className='py-4'>
								<p className={`${serif} text-[17px] font-bold`}>{w.name}</p>
								<p className='mt-0.5 flex items-center gap-1 text-[13px] text-[#8a6d5c]'>
									<MapPinIcon size={13} aria-hidden='true' /> {[w.place, w.month].filter(Boolean).join(' · ')}
								</p>
								<p className='mt-1.5 text-[14px] leading-[1.6] text-[#5a3d2e]'>{w.note}</p>
								<a href={w.source} target='_blank' rel='noreferrer' className={`mt-1.5 ${source}`}>
									Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</li>
						))}
					</ul>
				) : (
					<p className='mt-3 text-[14px] text-[#8a6d5c]'>Made in {made}; no shop, centre or festival for it found in a source yet.</p>
				)}
				{fests.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Festivals nearby</h3>
						<ul className='mt-2 divide-y divide-[#e4d8cb] border-y border-[#e4d8cb]'>
							{fests.map((f) => (
								<li key={f.name} className='py-3'>
									<p className={`${serif} text-[16px] font-bold`}>{f.name}</p>
									<p className='text-[12.5px] text-[#8a6d5c]'>{[f.month, f.place].filter(Boolean).join(' · ')}</p>
									<a href={f.source} target='_blank' rel='noreferrer' className={`mt-1 ${source}`}>
										Source <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</>
				) : null}

				<h2 className={`${serif} mt-12 text-[26px] font-bold`}>Where to buy it</h2>
				{c.buy?.length ? (
					<ul className='mt-4 divide-y divide-[#e4d8cb] border-y border-[#e4d8cb]'>
						{c.buy.map((b) => (
							<li key={b.name + b.place} className='py-4'>
								<p className='font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6a4f]'>{BUY_KIND[b.kind]}</p>
								<p className={`${serif} text-[17px] font-bold`}>{b.url ? <a href={b.url} target='_blank' rel='noreferrer' className='hover:text-[#7b4a35]'>{b.name}</a> : b.name}</p>
								<p className='mt-0.5 flex items-center gap-1 text-[13px] text-[#8a6d5c]'>
									<MapPinIcon size={13} aria-hidden='true' /> {b.place}
								</p>
								<p className='mt-1.5 text-[14px] leading-[1.6] text-[#5a3d2e]'>{b.note}</p>
								<a href={b.source} target='_blank' rel='noreferrer' className={`mt-1.5 ${source}`}>
									Source, {monthYear(b.as_of)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
								</a>
							</li>
						))}
					</ul>
				) : (
					<p className='mt-3 text-[14px] text-[#8a6d5c]'>No shop, fair or cooperative selling it found in a source yet.</p>
				)}

				{prices.length > 1 ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Prices</h3>
						<ul className='mt-2 space-y-2.5'>
							{prices.map((pr) => (
								<li key={pr.source + pr.text} className='text-[13.5px] leading-[1.55] text-[#5a3d2e]'>
									{pr.text}.{' '}
									<a href={pr.source} target='_blank' rel='noreferrer' className={source}>
										{monthYear(pr.as_of)} <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</>
				) : null}

				{places.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>While you are there</h3>
						<ul className='mt-2 space-y-1.5 text-[14px]'>
							{places.map((pl) => (
								<li key={pl.slug}>
									<Link href={`/places/${pl.slug}`} className='text-[#7b4a35] underline decoration-[#e4d8cb] underline-offset-4 hover:decoration-[#7b4a35]'>
										{pl.name}
									</Link>{' '}
									<span className='text-[12.5px] text-[#8a6d5c]'>· {pl.municipality}</span>
								</li>
							))}
						</ul>
					</>
				) : null}

				{c.spend?.length ? (
					<>
						<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Public money</h3>
						<ul className='mt-2 space-y-3'>
							{c.spend.map((x) => (
								<li key={x.source} className='text-[13.5px] leading-[1.55] text-[#5a3d2e]'>
									{x.title}. <span className='text-[#8a6d5c]'>{x.by}, {monthYear(x.date.slice(0, 7))}{x.amount ? `, ${peso(x.amount)}` : ''}.</span>{' '}
									<a href={x.source} target='_blank' rel='noreferrer' className={source}>
										Bid notice <ArrowUpRightIcon size={10} weight='bold' aria-hidden='true' />
									</a>
								</li>
							))}
						</ul>
					</>
				) : null}

				<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Read more</h3>
				<ul className='mt-2 space-y-1.5 text-[13px]'>
					{c.sources.map((s) => (
						<li key={s}>
							<a href={s} target='_blank' rel='noreferrer' className='break-all text-[#7b4a35] underline decoration-[#e4d8cb] underline-offset-4 hover:decoration-[#7b4a35]'>
								{sourceLabel(s)}
							</a>
						</li>
					))}
				</ul>

				<div className='mt-10 rounded-[6px] bg-white p-5'>
					<p className={`${serif} text-[17px] font-bold`}>Know more about the {c.name.toLowerCase().startsWith('the ') ? c.name.slice(4) : c.name}?</p>
					<p className='mt-1 text-[13.5px] leading-[1.6] text-[#5a3d2e]'>A maker, a place to buy it, a price, a photo you took, or a correction. Send it with a source and it is checked before it goes up.</p>
					<a href={mailto(c)} className='mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#7b4a35] hover:text-[#3b2419]'>
						<EnvelopeSimpleIcon size={15} aria-hidden='true' /> Send it
					</a>
				</div>
			</div>
		</section>

		<section className='bg-[#efe6dc]'>
			<div className='mx-auto max-w-[84rem] px-4 py-20 sm:px-6 lg:py-28'>
				<h2 className={`${serif} text-[22px] font-bold`}>More from the region</h2>
				<ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
					{others.map((o) => (
						<li key={o.slug}>
							<CraftCard c={o} replace plain />
						</li>
					))}
				</ul>
			</div>
		</section>
		</>
	)
}
