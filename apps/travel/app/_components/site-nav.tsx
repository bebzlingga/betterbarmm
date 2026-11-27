'use client'

import { CaretDownIcon, HandHeartIcon, HeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, BrandLogo, UtilityMenuLinks } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import { travelAreas } from '@betterbarmm/travel-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { GUIDE_PAGES } from '../_lib/guide'
import { DESTINATIONS } from '../_lib/discover'

const areaName = new Map(travelAreas.map((area) => [area.slug, area.name]))

const guide = [
	{ href: '/routes', label: 'Routes' },
	{ href: '/food', label: 'Food' },
	{ href: '/stays', label: 'Where to sleep' },
	{ href: '/plan', label: 'Plan a trip' },
] as const

/**
 * A menu that opens on click and closes on Escape or any pointer landing
 * outside it. A dropdown that only closes by clicking its own trigger feels
 * broken, and the panel is mounted and unmounted rather than hidden so it can
 * play out — one that vanishes on the frame you release the mouse reads as a
 * mis-click.
 */
function Menu({
	label,
	active,
	width,
	children,
}: {
	label: string
	active?: boolean
	width: string
	children: (close: () => void) => React.ReactNode
}) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		const onPointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false)
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)

		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				aria-expanded={open}
				aria-haspopup='menu'
				onClick={() => setOpen((current) => !current)}
				data-active={active}
				data-open={open}
				className='nav-item flex cursor-pointer items-center gap-1.5'
			>
				{label}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.3, ease: EASE }}
					className='text-[var(--ink-mute)]'
				>
					<CaretDownIcon size={13} weight='bold' aria-hidden='true' />
				</motion.span>
			</button>

			<AnimatePresence>
				{open ? (
					<motion.div
						initial={{ opacity: 0, y: -6, scaleY: 0.96 }}
						animate={{ opacity: 1, y: 0, scaleY: 1 }}
						exit={{ opacity: 0, y: -6, scaleY: 0.96 }}
						transition={{ duration: 0.24, ease: EASE }}
						style={{ originY: 0 }}
						className={`absolute right-0 top-full z-40 mt-1  border border-[var(--rule)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						{children(() => setOpen(false))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

export function SiteNav() {
	const pathname = usePathname()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const closeMenu = () => setIsMenuOpen(false)

	// Pages with a photograph header run it under both bars (user decision): clear, on a hairline. The bar
	// does not follow the reader down (user decision: not sticky in this workspace), so it is only ever over the photograph.
	// Every page with a photograph header (PageHero): the explorer, the list pages, the guide's, a destination, a place,
	// an area and its towns. An address that is none of these (a page not found) keeps the solid bar.
	const overlay =
		['/', '/eat', '/calendar', '/flights', '/ferries', '/saved', '/routes', '/food', '/stays', '/plan'].includes(pathname) ||
		pathname.startsWith('/discover/') ||
		pathname.startsWith('/guide/') ||
		pathname.startsWith('/places/') ||
		travelAreas.some((area) => pathname === `/${area.slug}` || pathname.startsWith(`/${area.slug}/`))
	const clear = overlay && !isMenuOpen

	const isGuideActive = guide.some((item) => pathname.startsWith(item.href))

	return (
		<>
			{/* The estate's strip, above the workspace's own bar. Not sticky:
			    it belongs to the top of the document, and the navigation a
			    reader actually needs mid-page is the bar under it. */}
			<UtilityBar
				base='https://betterbarmm.com'
				current='travel'
				className={`bb-strip ${overlay ? 'tv-over' : 'bg-[var(--paper-2)]'}`}
				switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
				end={
					<>
						<ThemeToggle />
						{/* Phones have no room for it in the strip; the wrapper hides it. */}
						<span className='hidden self-stretch sm:flex'>
							<a
								href='https://betterbarmm.com/contribute'
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-accent !px-4 !py-0 !text-[0.59375rem]'
							>
								<HandHeartIcon size={13} weight='fill' aria-hidden='true' />
								Contribute
							</a>
						</span>
					</>
				}
			/>

			{/* In this workspace the masthead stays at the top of the page and scrolls away with it (user decision): not
			    sticky, and so not ducking in and out either. `--sticky-top` is 0 here (globals.css) to match. */}
		<header
			data-clear={clear}
			className='relative z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'
		>
			<div className='mx-auto max-w-[var(--bb-page-width)] px-6 lg:px-8'>
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2'>
					<div className='flex min-w-0 items-center gap-3'>
						<a href='https://betterbarmm.com' onClick={closeMenu} className='w-fit shrink-0'>
							<BrandLogo className='text-[var(--ink)]' />
						</a>
						<span aria-hidden='true' className='hidden h-5 w-px bg-[var(--rule)] sm:block' />
						{/* The wordmark says BetterBARMM; this says which of its
						    workspaces you are in. */}
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden whitespace-nowrap font-[family-name:var(--font-display)] text-[0.65625rem] font-semibold uppercase leading-none tracking-[0.14em] text-[var(--brass)] transition hover:text-[var(--ink)] sm:block'
						>
							Travel &amp; Places
						</Link>
					</div>

					<nav className='hidden items-center justify-end gap-1 md:flex'>
						{/* Discover (user decision): every place, browsed like stays, then each destination's own page. */}
						<Menu label='Discover' active={pathname === '/' || pathname.startsWith('/places') || pathname.startsWith('/discover')} width='w-[17rem]'>
							{(close) => (
								<>
									<Link href='/' onClick={close} className='nav-menu-item'>
										All places
									</Link>
									<p className='px-3 pb-1 pt-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>Destinations</p>
									{DESTINATIONS.map(({ slug }) => (
										<Link key={slug} href={`/discover/${slug}`} onClick={close} className='nav-menu-item'>
											{areaName.get(slug)}
										</Link>
									))}
								</>
							)}
						</Menu>


						{/* Getting here (user decision: flights and ferries as one item, a menu of the two). */}
						<Menu label='Getting here' active={pathname === '/flights' || pathname === '/ferries' || pathname.startsWith('/guide/')} width='w-[17rem]'>
							{(close) => (
								<>
									<Link href='/flights' onClick={close} className='nav-menu-item'>
										Flights
									</Link>
									<Link href='/ferries' onClick={close} className='nav-menu-item'>
										Ferries &amp; boats
									</Link>
									{/* A travel guide per area (user decision): how to get in, around, sleep, when to go, safety. */}
									<p className='px-3 pb-1 pt-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]'>Travel guides</p>
									{travelAreas.map((area) => (
										<Link key={area.slug} href={`/guide/${area.slug}`} onClick={close} className='nav-menu-item'>
											{area.name}
										</Link>
									))}
								</>
							)}
						</Menu>
						<Link href='/calendar' data-active={pathname === '/calendar'} className='nav-item'>
							Calendar
						</Link>
						<Link href='/eat' data-active={pathname === '/eat'} className='nav-item'>
							Where to eat
						</Link>

						{GUIDE_PAGES ? (
						<Menu label='The guide' active={isGuideActive} width='w-[15rem]'>
								{(close) =>
									guide.map((item) => (
										<Link key={item.href} href={item.href} onClick={close} className='nav-menu-item'>
											{item.label}
										</Link>
									))
								}
							</Menu>
						) : null}
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						{/* The places this browser has hearted. */}
						<Link
							href='/saved'
							data-active={pathname === '/saved'}
							aria-label='Saved places'
							className='nav-item inline-flex items-center gap-1.5'
						>
							<HeartIcon size={15} weight={pathname === '/saved' ? 'fill' : 'bold'} aria-hidden='true' />
							<span className='hidden lg:inline'>Saved</span>
						</Link>

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='travel-mobile-menu'
							onClick={() => setIsMenuOpen((current) => !current)}
							className='inline-flex size-9 cursor-pointer items-center justify-center border border-[var(--ink)] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] md:hidden'
						>
							<span className='sr-only'>{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
							<span aria-hidden='true' className='flex h-2.5 w-4 flex-col justify-between'>
								<motion.span
									animate={isMenuOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={{ opacity: isMenuOpen ? 0 : 1 }}
									transition={{ duration: 0.2 }}
									className='block h-px bg-current'
								/>
								<motion.span
									animate={isMenuOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
									transition={{ duration: 0.3, ease: EASE }}
									className='block h-px bg-current'
								/>
							</span>
						</button>
					</div>
				</div>
			</div>

			<AnimatePresence initial={false}>
				{isMenuOpen ? (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.34, ease: EASE }}
						className='overflow-hidden border-t border-[var(--rule)] bg-[var(--paper)] md:hidden'
					>
						<nav
							id='travel-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[var(--bb-page-width)] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							<div className='grid'>
								<Link href='/' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Explore places
								</Link>
								{DESTINATIONS.map(({ slug }) => (
									<Link key={slug} href={`/discover/${slug}`} onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 pl-4 text-[var(--ink)]'>
										Discover {areaName.get(slug)}
									</Link>
								))}
								<p className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>Getting here</p>
								<Link href='/flights' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 pl-4 text-[var(--ink)]'>
									Flights
								</Link>
								<Link href='/ferries' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 pl-4 text-[var(--ink)]'>
									Ferries &amp; boats
								</Link>
								{travelAreas.map((area) => (
									<Link key={area.slug} href={`/guide/${area.slug}`} onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 pl-4 text-[var(--ink)]'>
										Travel guide: {area.name}
									</Link>
								))}
								<Link href='/calendar' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Calendar
								</Link>
								<Link href='/eat' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Where to eat
								</Link>
								<Link href='/saved' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Saved
								</Link>
							</div>


							{GUIDE_PAGES ? (
								<>
							<p className='bb-label mt-7'>The guide</p>
							<div className='mt-3 grid'>
								{guide.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										className='border-b border-[var(--rule-soft)] py-2.5'
									>
										{item.label}
									</Link>
								))}
							</div>
								</>
							) : null}

							<UtilityMenuLinks base='https://betterbarmm.com' onNavigate={closeMenu} />
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			<ScrollProgress />
		</header>
		</>
	)
}
