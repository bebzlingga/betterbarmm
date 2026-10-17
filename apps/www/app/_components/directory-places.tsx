import { ArrowRightIcon, PhoneIcon } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { commonsThumb } from '../_lib/commons'
import { LINE_LABEL, localGovernments, placePhoto, provinceLines, telHref, townLines, type Line, type PlacePhoto } from '../_lib/directory'
import { barmmBoundaries, lguProvinces, sameUnit } from '@betterbarmm/lgu-data'
import { PhotoCredit } from './discover-figure'
import { photo as discoverPhoto, type DiscoverPhotoKey } from './discover-media'

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

/** The numbers of an absolute M/L path, as [x, y] pairs. */
const points = (d: string) => {
	const n = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? []
	const out: [number, number][] = []
	for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i]!, n[i + 1]!])
	return out
}
const box = (ds: string[]) => {
	const ps = ds.flatMap(points)
	const xs = ps.map((p) => p[0])
	const ys = ps.map((p) => p[1])
	const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
	const pad = Math.max(x1 - x0, y1 - y0) * 0.06
	return `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`
}

/** A town without a photograph is drawn instead: its province's towns in outline and itself filled, from the PSA boundaries. */
function townMap(province: string, town: string) {
	const unit = lguProvinces.find((p) => p.slug === province)?.municipalities.find((m) => m.slug === town)
	if (!unit) return null
	const shapes = barmmBoundaries.units.filter((u) => u.area === province)
	const own = shapes.find((u) => sameUnit(u.psgc, unit.psgc, u.name, unit.name))
	if (!own) return null
	return { viewBox: box(shapes.map((u) => u.d)), others: shapes.filter((u) => u !== own).map((u) => u.d), own: own.d }
}

function TownMap({ province, town, name }: { province: string; town: string; name: string }) {
	const m = townMap(province, town)
	if (!m) return <Picture photo={null} name={name} size={500} />
	return (
		<svg viewBox={m.viewBox} preserveAspectRatio='xMidYMid meet' role='img' aria-label={`Where ${name} lies in its province`} className='size-full bg-[var(--paper-2)] p-2'>
			{m.others.map((d, i) => (
				<path key={i} d={d} fill='var(--paper)' stroke='var(--rule)' strokeWidth='0.6' vectorEffect='non-scaling-stroke' />
			))}
			<path d={m.own} fill='var(--accent)' fillOpacity='0.85' stroke='var(--accent)' strokeWidth='1' vectorEffect='non-scaling-stroke' />
		</svg>
	)
}

const credit = (p: PlacePhoto) => ({ credit: p.author, license: p.license, source: p.page })

/** Where a province has no Commons photograph yet, the site's own Discover photograph of it, already credited. */
const AREA_FALLBACK: Record<string, DiscoverPhotoKey> = { 'tawi-tawi': 'budBongao', 'cotabato-city': 'cotabatoPlaza', 'lanao-del-sur': 'lakeLanao', basilan: 'yakanWeaving' }
function bannerPhoto(slug: string) {
	const p = placePhoto(slug)
	if (p) return { src: commonsThumb(p.url, 1280), credit: credit(p) }
	const key = AREA_FALLBACK[slug]
	if (!key) return null
	const d = discoverPhoto(key)
	return { src: d.src.src, credit: d }
}

export function DirectoryPlaces() {
	return (
		<div className='mt-10 space-y-16'>
			{localGovernments.map((g) => {
				const banner = bannerPhoto(g.slug)
				const lines = provinceLines(g.slug)
				const single = g.units.length === 1
				return (
					<section key={g.slug} id={`area-${g.slug}`} aria-labelledby={`area-${g.slug}-title`} className='scroll-mt-[calc(var(--site-header-h)+1rem)]'>
						{/* The province under its photograph. */}
						<div className='bb-frame relative isolate h-56 overflow-hidden bg-[#3a1a14] sm:h-64'>
							{banner ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={banner.src} alt='' loading='lazy' className='absolute inset-0 -z-10 size-full object-cover' />
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
											{g.viceGovernor ? (
												<span className='hidden sm:inline'>
													{' '}
													· Vice governor <span className='font-semibold text-white'>{g.viceGovernor}</span>
												</span>
											) : null}
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
							{banner ? <PhotoCredit photo={banner.credit} /> : null}
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
									<li key={u.slug} className='bb-frame relative flex gap-4 border-b border-[var(--rule-soft)] bg-transparent! py-3 sm:flex-col sm:gap-0 sm:overflow-hidden sm:border sm:border-[var(--rule)] sm:py-0'>
										<span className='relative size-16 shrink-0 overflow-hidden sm:h-32 sm:w-full sm:rounded-none'>
											{tp ? <Picture photo={tp} name={u.name} size={500} /> : <TownMap province={g.slug} town={u.slug} name={u.name} />}
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
														<span className='text-[var(--ink-3)]'>Mayor</span> <span className='font-semibold text-[var(--ink)]'>{u.head}</span>
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
