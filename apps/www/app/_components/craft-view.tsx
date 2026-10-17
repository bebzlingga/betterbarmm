import { ArrowUpRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { GROUP, PROVINCE, commonsThumb, related, type Craft } from '../_lib/crafts'
import { CraftCard } from './craft-card'
import { CraftStage } from './craft-stage'
import { monthYear } from './directory-bits'

/* One craft, in the full-screen dialog over the catalogue: the showroom
   card filling the screen, then how it is made and where to see it. The palette is its own,
   the same in light and dark: warm brown and cream. */

// Important: the shared base styles set the body face on p, li and dd outside any layer.
const serif = 'font-[family-name:var(--font-craft)]!'
const label = 'font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]'
const source = 'inline-flex items-center gap-0.5 text-[11.5px] text-[#8a6d5c] hover:text-[#5a3424]'

export function CraftView({ c }: { c: Craft }) {
	const others = related(c)
	const next = others[0]!
	const made = [c.towns.join(', '), PROVINCE[c.province]].filter(Boolean).join(', ')

	return (
		<>
		<section className='flex min-h-dvh items-center bg-[linear-gradient(90deg,#4a2c22_0_63%,#9a6a4f_63%_100%)] px-4 py-16 sm:px-6 lg:py-14'>
			<div className='relative mx-auto flex w-full max-w-[84rem] flex-col overflow-hidden rounded-[10px] shadow-[0_40px_80px_-30px_rgba(30,12,5,0.7)] lg:grid lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[63fr_37fr]'>
				<div className='flex flex-col bg-[radial-gradient(ellipse_at_70%_15%,#a7694c,#7b4a35_55%,#64392a)] p-7 text-[#f4e8dc] sm:p-12'>
					<p className={`${serif} flex flex-wrap items-center gap-x-3 text-[22px] font-bold sm:text-[26px]`}>
						<Link href='/crafts' replace className='hover:text-white'>
							Crafts of the Bangsamoro
						</Link>
						<span className='text-[#d9bba6]'>·</span>
						<span className='text-[#d9bba6]'>{GROUP[c.group]}</span>
					</p>

					<div className='my-auto max-w-md py-10 lg:py-16'>
						<p className={`${label} text-[#e7c9a9]`}>
							{c.people} · {PROVINCE[c.province]}
						</p>
						{/* A short name is set large; a long one steps down so it keeps to two or three lines. */}
						<h1 className={`${serif} mt-3 font-bold leading-[1.05] ${c.name.length > 18 ? 'text-[36px] sm:text-[44px] lg:text-[52px]' : 'text-[44px] sm:text-[60px] lg:text-[72px]'}`}>{c.name}</h1>
						<p className={`${serif} mt-1 text-[17px] italic text-[#e7c9a9]`}>{c.local_name}</p>
						<p className={`${serif} mt-5 text-[16px] leading-[1.6] text-[#ecdccd]`}>{c.summary}</p>
						{c.price ? (
							<p className='mt-4 text-[13px] text-[#e7c9a9]'>
								{c.price.text}{' '}
								<a href={c.price.source} target='_blank' rel='noreferrer' className='underline underline-offset-2 hover:text-white'>
									as of {monthYear(c.price.as_of)}
								</a>
							</p>
						) : null}
					</div>

					<dl className='grid gap-x-10 gap-y-6 text-[13.5px] leading-[1.6] sm:grid-cols-3 lg:w-4/5'>
						<div>
							<dt className={`${serif} text-[17px] font-bold text-[#f4e8dc]`}>Made in</dt>
							<dd className='mt-2 text-[#e2cbb8]'>{made}</dd>
						</div>
						<div>
							<dt className={`${serif} text-[17px] font-bold text-[#f4e8dc]`}>Materials</dt>
							<dd className='mt-2 text-[#e2cbb8]'>{c.materials}</dd>
						</div>
						<div>
							<dt className={`${serif} text-[17px] font-bold text-[#f4e8dc]`}>Worn or used</dt>
							<dd className='mt-2 text-[#e2cbb8]'>{c.uses}</dd>
						</div>
					</dl>
				</div>

				<div className='flex flex-col bg-[#f4efe8] p-6 sm:p-10'>
					<CraftStage
						key={c.slug}
						name={c.name}
						// The three-dimensional studies are off for now; c.model turns them back on.
						model={null}
						images={c.images}
						className='h-[26rem] lg:absolute lg:top-20 lg:right-10 lg:bottom-48 lg:left-[44%] lg:h-auto'
					/>
					<Link href={`/crafts/${next.slug}`} replace className='group mt-8 block lg:mt-auto'>
						<p className={`${serif} text-[14px] text-[#8a6d5c]`}>More like it</p>
						<span className='mt-2 flex items-center gap-4 bg-white p-3'>
							{next.images[0] ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={commonsThumb(next.images[0].url, 250)} alt='' loading='lazy' className='size-16 shrink-0 object-cover' />
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

		<section className='mx-auto grid max-w-[84rem] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:py-20'>
			<div>
				<h2 className={`${serif} text-[26px] font-bold`}>How it is made</h2>
				<p className={`${serif} mt-3 max-w-2xl text-[17px] leading-[1.7] text-[#5a3d2e]`}>{c.how_made}</p>
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
									<p className={`${serif} text-[16px] font-bold`}>{m.name}</p>
									<p className='mt-1 text-[13.5px] leading-[1.55] text-[#5a3d2e]'>{m.note}</p>
									<a href={m.source} target='_blank' rel='noreferrer' className={`mt-2 ${source}`}>
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
				<h3 className={`${label} mt-10 text-[#8a6d5c]`}>Read more</h3>
				<ul className='mt-2 space-y-1.5 text-[13px]'>
					{c.sources.map((s) => (
						<li key={s}>
							<a href={s} target='_blank' rel='noreferrer' className='break-all text-[#7b4a35] underline decoration-[#e4d8cb] underline-offset-4 hover:decoration-[#7b4a35]'>
								{new URL(s).hostname.replace(/^www\./, '')}
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>

		<section className='border-t border-[#e4d8cb] bg-[#efe6dc]'>
			<div className='mx-auto max-w-[84rem] px-4 py-20 sm:px-6 lg:py-28'>
				<h2 className={`${serif} text-[22px] font-bold`}>More from the region</h2>
				<ul className='mt-6 grid gap-5 sm:grid-cols-3'>
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
