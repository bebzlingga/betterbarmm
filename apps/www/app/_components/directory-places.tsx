import { ArrowRightIcon, PhoneIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { commonsThumb } from '../_lib/commons'
import { LINE_LABEL, localGovernments, placePhoto, provinceLines, telHref, townLines, type Line, type PlacePhoto } from '../_lib/directory'
import { PhotoCredit } from './discover-figure'

/* The directory's provinces and towns, laid out in full: each province under a
   photograph of it, with its governor and its own lines, then every town as a
   card with its photograph, its mayor and the numbers to call. A place with no
   free photograph yet shows a quiet tint and its initial instead. On a phone
   the towns become rows with a small picture, so the list stays scannable. */

/** The first two lines worth calling, a town hall or disaster office before the rest. */
const PRIORITY: Line['kind'][] = ['hall', 'drrm', 'police', 'fire', 'health', 'other']
const topLines = (lines: Line[], n = 2) => [...lines].sort((a, b) => PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind)).slice(0, n)

function Picture({ photo, name, size }: { photo: PlacePhoto | null; name: string; size: 250 | 500 | 960 | 1280 }) {
	if (!photo)
		return (
			<span aria-hidden='true' className='grid size-full place-items-center bg-[linear-gradient(135deg,var(--paper-2),color-mix(in_srgb,var(--accent)_14%,var(--paper-2)))] text-[28px] font-extrabold text-[color-mix(in_srgb,var(--accent)_45%,transparent)]'>
				{name.slice(0, 1)}
			</span>
		)
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={commonsThumb(photo.url, size)} alt={photo.caption || name} loading='lazy' className='size-full object-cover' />
	)
}

const credit = (p: PlacePhoto) => ({ credit: p.author, license: p.license, source: p.page })

export function DirectoryPlaces() {
	return (
		<div className='mt-10 space-y-16'>
			{localGovernments.map((g) => {
				const photo = placePhoto(g.slug)
				const lines = provinceLines(g.slug)
				const single = g.units.length === 1
				return (
					<section key={g.slug} id={`area-${g.slug}`} aria-labelledby={`area-${g.slug}-title`} className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						{/* The province under its photograph. */}
						<div className='bb-frame relative isolate h-56 overflow-hidden rounded-[8px] bg-[#3a1a14] sm:h-64'>
							{photo ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={commonsThumb(photo.url, 1280)} alt='' loading='lazy' className='absolute inset-0 -z-10 size-full object-cover' />
							) : null}
							<span aria-hidden='true' className='absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,8,4,0.85),rgba(20,8,4,0.25)_60%,rgba(20,8,4,0.05))]' />
							<div className='flex h-full flex-col justify-end p-5 text-white sm:p-7'>
								<p className='font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/75'>{g.kind}</p>
								<h3 id={`area-${g.slug}-title`} className='mt-1 text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[34px]'>
									<Link scroll={false} href={g.href} className='hover:underline hover:decoration-white/50 hover:underline-offset-4'>
										{g.name}
									</Link>
								</h3>
								<p className='mt-1.5 text-[14px] text-white/85'>
									{g.governor ? (
										<>
											Governor <span className='font-semibold text-white'>{g.governor}</span>
											{g.viceGovernor ? <span className='hidden sm:inline'> · Vice governor {g.viceGovernor}</span> : null}
										</>
									) : single && g.units[0]!.head ? (
										<>
											Mayor <span className='font-semibold text-white'>{g.units[0]!.head}</span>
										</>
									) : (
										`${g.units.length} towns`
									)}
								</p>
							</div>
							{photo ? <PhotoCredit photo={credit(photo)} /> : null}
						</div>

						{/* Its own lines, then where to find the rest. */}
						<div className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]'>
							{topLines(lines, 4).map((l, i) => (
								<a key={i} href={telHref(l.phones[0]!)} className='inline-flex items-center gap-1.5 hover:text-[var(--accent)]'>
									<PhoneIcon size={14} className='text-[var(--ink-3)]' aria-hidden='true' />
									<span className='text-[var(--ink-3)]'>{LINE_LABEL[l.kind]}</span>
									<span className='font-semibold tabular-nums'>{l.phones[0]}</span>
								</a>
							))}
							<Link scroll={false} href={g.href} className='ml-auto inline-flex items-center gap-1 font-semibold hover:text-[var(--accent)]'>
								{lines.length ? 'All its lines and governors since 2007' : 'Its page and governors since 2007'} <ArrowRightIcon size={13} weight='bold' aria-hidden='true' />
							</Link>
						</div>

						{/* Every town. */}
						<ul className='mt-6 grid border-t border-[var(--rule)] sm:grid-cols-2 sm:gap-4 sm:border-t-0 lg:grid-cols-3 xl:grid-cols-4'>
							{g.units.map((u) => {
								const tp = placePhoto(g.slug, u.slug)
								const tl = topLines(townLines(g.slug, u.slug))
								return (
									<li key={u.slug} className='bb-frame relative flex gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:rounded-[6px] sm:border sm:border-[var(--rule)] sm:py-0'>
										<span className='relative size-16 shrink-0 overflow-hidden rounded-[4px] sm:h-32 sm:w-full sm:rounded-none'>
											<Picture photo={tp} name={u.name} size={500} />
											{tp ? (
												<span className='hidden sm:contents'>
													<PhotoCredit photo={credit(tp)} />
												</span>
											) : null}
										</span>
										<div className='min-w-0 flex-1 sm:p-4'>
											<p className='flex items-baseline gap-2'>
												<Link scroll={false} href={u.href} className='truncate text-[15.5px] font-bold hover:text-[var(--accent)]'>
													{u.name}
												</Link>
												{u.isCity ? <span className='font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]'>City</span> : null}
											</p>
											<p className='mt-0.5 truncate text-[13px] text-[var(--ink-2)]'>
												{u.head ? (
													<>
														<span className='text-[var(--ink-3)]'>Mayor</span> {u.head}
													</>
												) : (
													<span className='text-[var(--ink-3)]'>Mayor not in the canvass</span>
												)}
											</p>
											{u.deputy ? (
												<p className='hidden truncate text-[13px] text-[var(--ink-3)] sm:block'>
													Vice mayor <span className='text-[var(--ink-2)]'>{u.deputy}</span>
												</p>
											) : null}
											{tl.length ? (
												<ul className='mt-2 space-y-0.5 text-[12.5px]'>
													{tl.map((l, i) => (
														<li key={i} className='truncate'>
															<a href={telHref(l.phones[0]!)} className='inline-flex items-center gap-1.5 hover:text-[var(--accent)]'>
																<PhoneIcon size={12} className='shrink-0 text-[var(--ink-3)]' aria-hidden='true' />
																<span className='text-[var(--ink-3)]'>{LINE_LABEL[l.kind]}</span>
																<span className='font-semibold tabular-nums'>{l.phones[0]}</span>
															</a>
														</li>
													))}
												</ul>
											) : null}
										</div>
									</li>
								)
							})}
						</ul>
					</section>
				)
			})}
		</div>
	)
}
