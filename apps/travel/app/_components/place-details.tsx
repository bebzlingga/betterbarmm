'use client'

import { ArrowSquareOutIcon, CaretLeftIcon, CaretRightIcon, CheckIcon, ForkKnifeIcon, InfoIcon, MapPinIcon, NavigationArrowIcon, XIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TileMap } from './tile-map'

export type Contact = { phone?: string | null; facebook?: string | null; instagram?: string | null; website?: string | null; email?: string | null; hours?: string | null }

export type About = { about?: string | null; why_go?: string | null; tips?: string[]; specialties?: string[]; services?: string[]; opened?: number | null; branches?: string[] }

const LINKS = [
	{ key: 'facebook', label: 'Facebook' },
	{ key: 'instagram', label: 'Instagram' },
	{ key: 'website', label: 'Website' },
	{ key: 'email', label: 'Email' },
] as const

/** "facebook.com/halabirahalalfoods" for a link's label. */
const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const DL = 'mt-6 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-t border-[var(--rule)] pt-5 text-[0.875rem] leading-snug'

type Photo = { url: string; caption: string; author: string; license: string; page: string; width?: number; height?: number }

/** Everything the dialog shows, worked out on the server so no dataset ships to the browser. */
export type PlaceDetail = {
	name: string
	kindLine: string
	note: string | null
	address: string | null
	town: string
	halal: string | null
	asOf: string
	source: string
	sourceHost: string
	/** The lead photo first, then the gallery. */
	photos: Photo[]
	pin: { lat: number; lon: number; placed: 'place' | 'street' | 'barangay' | 'town' } | null
	/** As the place's own page lists them; each may be missing. */
	contact: Contact
	/** The longer description, what it is known for and what it offers; each may be missing. */
	about: About
}

/* How exact the pin is, said plainly, and how close the map opens on it. */
const PLACED = {
	place: { zoom: 17, says: 'The pin is the place itself, as OpenStreetMap has it.' },
	street: { zoom: 16, says: 'The pin is on its street; the place is somewhere along it.' },
	barangay: { zoom: 15, says: 'The pin is the centre of its barangay; the place is nearby.' },
	town: { zoom: 13, says: 'The pin is the centre of the town; the exact spot is not mapped yet.' },
}

const month = (asOf: string) => new Date(`${asOf}-01T00:00:00Z`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * A card's name as a button that covers the whole card (the card is `relative`), opening a dialog with the larger
 * photo and its gallery, the address and town, what its source says of halal, a map with its pin, and links to directions and the
 * source. A native <dialog>: Escape closes it, and so does a click on the dimmed page around it.
 */
export function PlaceDetails({ detail }: { detail: PlaceDetail }) {
	const dialog = useRef<HTMLDialogElement>(null)
	const [open, setOpen] = useState(false)
	// The dialog goes to the end of the page, not inside the card's bold name (a <p>), once the page is in the browser.
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])
	const query = [detail.name, detail.address, detail.town].filter(Boolean).join(', ')
	const placed = detail.pin ? PLACED[detail.pin.placed] : null
	const photos = detail.photos
	const c = detail.contact
	const about = detail.about
	const [shown, setShown] = useState(0)
	const photo = photos[shown]
	const go = (step: number) => setShown((i) => (i + step + photos.length) % photos.length)

	return (
		<>
			<button
				type='button'
				onClick={() => {
					setOpen(true)
					dialog.current?.showModal()
				}}
				className='cursor-pointer text-left before:absolute before:inset-0 before:content-[""] hover:text-[var(--accent)]'
			>
				{detail.name}
			</button>

			{mounted ? createPortal(
			<dialog
				ref={dialog}
				onClose={() => setOpen(false)}
				onKeyDown={(e) => photos.length > 1 && (e.key === 'ArrowLeft' ? go(-1) : e.key === 'ArrowRight' ? go(1) : null)}
				onClick={(e) => e.target === dialog.current && dialog.current.close()}
				aria-label={detail.name}
				className='m-auto max-h-[calc(100dvh-2rem)] w-[min(88rem,calc(100vw-2rem))] max-w-none overflow-y-auto bg-[var(--paper)] p-0 text-[var(--ink)] shadow-[0_28px_60px_-28px_rgba(0,0,0,0.5)] backdrop:bg-black/50'
			>
				{/* The title bar: what it is, its name and town on the left; the ways there and close on the right. */}
				<div className='sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-[var(--rule)] bg-[var(--paper)] px-5 py-5 md:px-8 md:py-6'>
					<div className='min-w-0'>
						<p className='tv-kind'>{detail.kindLine}</p>
						<h2 className='mt-1.5 !font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold leading-[1.1] tracking-[-0.03em]'>{detail.name}</h2>
						<p className='mt-1.5 flex items-center gap-1.5 text-[0.875rem] text-[var(--ink-3)]'>
							<MapPinIcon size={14} weight='fill' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
							{detail.town}
						</p>
					</div>
					<div className='flex items-center gap-2'>
						<a
							href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`}
							target='_blank'
							rel='noreferrer'
							className='inline-flex h-9 items-center gap-2 bg-[var(--accent)] px-3.5 text-[0.8125rem] font-semibold text-white transition hover:opacity-90'
						>
							<NavigationArrowIcon size={15} weight='fill' aria-hidden='true' />
							Directions
						</a>
						<a
							href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
							target='_blank'
							rel='noreferrer'
							className='inline-flex h-9 items-center gap-2 border border-[var(--rule)] px-3.5 text-[0.8125rem] font-semibold transition hover:border-[var(--ink)]'
						>
							<MapPinIcon size={15} weight='fill' aria-hidden='true' />
							<span className='max-sm:hidden'>Open in Google Maps</span>
							<span className='sm:hidden'>Map</span>
						</a>
					<button
						type='button'
						autoFocus
						onClick={() => dialog.current?.close()}
						aria-label='Close'
						className='grid size-9 cursor-pointer place-items-center border border-[var(--rule)] transition hover:border-[var(--ink)]'
					>
						<XIcon size={16} weight='bold' />
					</button>
					</div>
				</div>

				<div className='grid gap-8 p-5 md:grid-cols-[35%_minmax(0,1fr)] md:gap-16 lg:gap-20 md:p-8'>
					{/* Left: the photo shown, the arrows and count over it, its caption and the gallery under it. */}
					<div className='min-w-0'>
						{photo ? (
							<figure className='m-0'>
								<div className='relative bg-[var(--paper-2)]'>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={photo.url} alt={photo.caption} width={photo.width} height={photo.height} className='aspect-[4/3] w-full object-contain' />
									{photos.length > 1 ? (
										<>
											<button type='button' onClick={() => go(-1)} aria-label='Previous photo' className='absolute left-2 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center bg-black/55 text-white transition hover:bg-black/75'>
												<CaretLeftIcon size={16} weight='bold' />
											</button>
											<button type='button' onClick={() => go(1)} aria-label='Next photo' className='absolute right-2 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center bg-black/55 text-white transition hover:bg-black/75'>
												<CaretRightIcon size={16} weight='bold' />
											</button>
											<span className='absolute bottom-2 right-2 bg-black/55 px-2 py-0.5 font-mono text-[0.6875rem] text-white'>
												{shown + 1} / {photos.length}
											</span>
										</>
									) : null}
								</div>
								<figcaption className='mt-2 text-[0.75rem] leading-snug text-[var(--ink-3)]'>
									{photo.caption}.{' '}
									<a href={photo.page} target='_blank' rel='noreferrer' className='underline-offset-2 hover:text-[var(--accent)] hover:underline'>
										{photo.author} · {photo.license}
									</a>
								</figcaption>
							</figure>
						) : (
							<div className='grid aspect-[4/3] place-items-center bg-[var(--paper-2)] text-[0.8125rem] text-[var(--ink-mute)]'>No photo yet</div>
						)}
						{photos.length > 1 ? (
							<ul className='mt-4 grid grid-cols-5 gap-2' aria-label='Gallery'>
								{photos.map((p, i) => (
									<li key={p.url}>
										<button
											type='button'
											onClick={() => setShown(i)}
											aria-label={`Photo ${i + 1}: ${p.caption}`}
											aria-current={i === shown}
											className={`block aspect-square w-full cursor-pointer overflow-hidden outline-offset-2 transition ${i === shown ? 'outline outline-2 outline-[var(--accent)]' : 'opacity-75 hover:opacity-100'}`}
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img src={p.url} alt='' loading='lazy' className='size-full object-cover' />
										</button>
									</li>
								))}
							</ul>
						) : null}
					</div>

					{/* Right: what it serves, its longer description, what it is known for and offers, how to reach it, what its source says, and the map. */}
					<div className='min-w-0'>
						{detail.note ? <p className='text-[1.0625rem] font-medium leading-7 text-[var(--ink)]'>{detail.note}</p> : null}
						{about.why_go ? (
							<p className='mt-5 border-l-[3px] border-[var(--accent)] bg-[var(--paper-2)] px-4 py-3 text-[0.9375rem] leading-6'>
								<span className='tv-kind mb-1 block'>Why go</span>
								{about.why_go}
							</p>
						) : null}
						{about.about ? <p className='mt-5 text-[0.9375rem] leading-7 text-[var(--ink-2)]'>{about.about}</p> : null}

						{about.specialties?.length ? (
							<section className='mt-6'>
								<h3 className='tv-kind'>Known for</h3>
								<ul className='mt-2.5 flex flex-wrap gap-2'>
									{about.specialties.map((dish) => (
										<li key={dish} className='inline-flex items-center gap-1.5 bg-[var(--paper-2)] px-3 py-1.5 text-[0.8125rem] font-semibold'>
											<ForkKnifeIcon size={13} className='text-[var(--brass)]' aria-hidden='true' />
											{dish}
										</li>
									))}
								</ul>
							</section>
						) : null}

						{about.tips?.length ? (
							<section className='mt-6'>
								<h3 className='tv-kind'>Good to know</h3>
								<ul className='mt-2.5 grid gap-1.5 text-[0.875rem] leading-6 text-[var(--ink-2)]'>
									{about.tips.map((tip) => (
										<li key={tip} className='flex gap-2'>
											<InfoIcon size={15} className='mt-1 shrink-0 text-[var(--brass)]' aria-hidden='true' />
											{tip}
										</li>
									))}
								</ul>
							</section>
						) : null}

						{about.services?.length ? (
							<section className='mt-6'>
								<h3 className='tv-kind'>Services</h3>
								<ul className='mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.875rem] sm:grid-cols-3'>
									{about.services.map((service) => (
										<li key={service} className='flex items-center gap-2'>
											<CheckIcon size={14} weight='bold' className='shrink-0 text-[var(--accent)]' aria-hidden='true' />
											{service}
										</li>
									))}
								</ul>
							</section>
						) : null}

						<dl className={DL}>
							{detail.address ? (
								<>
									<dt className='text-[var(--ink-3)]'>Address</dt>
									<dd>{detail.address}</dd>
								</>
							) : null}
							<dt className='text-[var(--ink-3)]'>Town</dt>
							<dd>{detail.town}</dd>
							{about.opened ? (
								<>
									<dt className='text-[var(--ink-3)]'>Opened</dt>
									<dd>{about.opened}</dd>
								</>
							) : null}
							{about.branches?.length ? (
								<>
									<dt className='text-[var(--ink-3)]'>Branches</dt>
									<dd>{about.branches.join('; ')}</dd>
								</>
							) : null}
							{c.hours ? (
								<>
									<dt className='text-[var(--ink-3)]'>Hours</dt>
									<dd>{c.hours}</dd>
								</>
							) : null}
							{c.phone ? (
								<>
									<dt className='text-[var(--ink-3)]'>Phone</dt>
									<dd className='flex flex-col'>
										{c.phone.split(' / ').map((n) => (
											<a key={n} href={`tel:${n.replace(/[^+\d]/g, '')}`} className='font-semibold hover:text-[var(--accent)]'>
												{n}
											</a>
										))}
									</dd>
								</>
							) : null}
							{LINKS.map(({ key, label }) =>
								c[key] ? (
									<div key={key} className='contents'>
										<dt className='text-[var(--ink-3)]'>{label}</dt>
										<dd className='min-w-0'>
											<a href={key === 'email' ? `mailto:${c[key]}` : c[key]!} target={key === 'email' ? undefined : '_blank'} rel='noreferrer' className='inline-flex max-w-full items-center gap-1 font-semibold hover:text-[var(--accent)]'>
												<span className='truncate'>{key === 'email' ? c[key] : /profile\.php/.test(c[key]!) ? 'Facebook page' : shortUrl(c[key]!)}</span>
												{key === 'email' ? null : <ArrowSquareOutIcon size={13} className='shrink-0' aria-hidden='true' />}
											</a>
										</dd>
									</div>
								) : null,
							)}
							{detail.halal ? (
								<>
									<dt className='text-[var(--ink-3)]'>Halal</dt>
									<dd>{detail.halal}</dd>
								</>
							) : null}
							<dt className='text-[var(--ink-3)]'>Last seen open</dt>
							<dd>{month(detail.asOf)}</dd>
							<dt className='text-[var(--ink-3)]'>Source</dt>
							<dd>
								<a href={detail.source} target='_blank' rel='noreferrer' className='inline-flex items-center gap-1 font-semibold hover:text-[var(--accent)]'>
									{detail.sourceHost}
									<ArrowSquareOutIcon size={13} aria-hidden='true' />
								</a>
							</dd>
						</dl>

						{/* The map mounts only while the dialog is open: a closed one has no size to fit the pin to. */}
						{detail.pin && placed && open ? (
							<div className='mt-6'>
								<TileMap
									pins={[{ id: 'here', name: detail.name, lat: detail.pin.lat, lon: detail.pin.lon, category: 'here', note: detail.address ?? detail.town }]}
									categories={[{ key: 'here', label: detail.name, color: '#8a2418' }]}
									height={240}
									minZoom={6}
									fitZoom={placed.zoom}
									legend={false}
								/>
								<p className='mt-2 text-[0.75rem] text-[var(--ink-3)]'>{placed.says}</p>
							</div>
						) : null}
					</div>
				</div>
			</dialog>,
			document.body,
			) : null}
		</>
	)
}
