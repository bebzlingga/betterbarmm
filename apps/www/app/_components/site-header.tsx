'use client'

import { CaretDownIcon, HandHeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
// import { MapTrifoldIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { EASE, Magnetic, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo, UtilityMenuLinks, ESTATE_LINKS } from '@betterbarmm/editorial'
// import { MapDialog } from './map-dialog'
import { ThemeToggle } from './theme-toggle'

type SiteHeaderProps = {
	activeItem?: 'discover' | 'this-week' | 'news' | 'accidents' | 'services' | 'directory' | 'crafts' | 'places' | 'explainers' | 'jo' | 'about' | 'contribute'
	/**
	 * Sit over the page rather than on top of it.
	 *
	 * Pages that open on a full-bleed photograph want the bar transparent until
	 * the reader has scrolled past the picture — a solid strip across the top of
	 * a masthead photograph cuts the sky off. Everywhere else the bar is opaque
	 * from the first pixel, because there is nothing behind it worth seeing.
	 */
	overlay?: boolean
}

const discoverSections = [
	/* The index itself, first. The trigger above this menu is a button rather
	   than a link — it opens the panel and goes nowhere — so without this entry
	   there was no way into Discover's own front page from the bar at all. */
	{ label: 'All chapters', href: '/discover' },
	{ label: 'History', href: '/discover/history' },
	{ label: 'Government', href: '/discover/governance' },
	{ label: 'Local Government', href: '/discover/local-government' },
	{ label: 'People', href: '/discover/people' },
	{ label: 'Culture & Places', href: '/discover/culture-places' },
] as const

const secondaryLinks = [
	// This week is hidden for now; the page still builds at /this-week.
	// { key: 'this-week', href: '/this-week', label: 'This week' },
	// Latest news is hidden for now; the page still builds at /news.
	// { key: 'news', href: '/news', label: 'Latest news' },
	// Incident Watch and Crafts are reached through the strip's Projects switch, not the bar; phones get a row each in the menu below.
	{ key: 'directory', href: '/directory', label: 'Directory' },
	// Programs & services is hidden for now; the pages still build at /services.
	// { key: 'services', href: '/services', label: 'Programs & services' },
	{ key: 'explainers', href: '/explainers', label: 'Explainers' },
	// Opens the brain dialog over whatever page is open.
	{ key: 'brain', href: '#brain', label: 'Brain' },
	{ key: 'about', href: '/about', label: 'About' },
] as const

/**
 * A menu that opens on click and closes on Escape or any pointer landing
 * outside it.
 *
 * Written once because the header carries two, and a dropdown that only closes
 * by clicking its own trigger feels broken. The panel is mounted and unmounted
 * rather than hidden, so `AnimatePresence` can play it out — a menu that
 * vanishes on the frame you release the mouse reads as a mis-click.
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
						className={`nav-menu absolute right-0 top-full z-40 mt-1 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						{/* The brass hairline at the head of the panel is the same mark the
						    section kickers use, so a dropdown reads as part of the page's
						    own vocabulary rather than as a browser widget. */}
						{children(() => setOpen(false))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

const menuItemClass = 'nav-menu-item'

export function SiteHeader({ activeItem, overlay = false }: SiteHeaderProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const closeMenu = () => setIsMenuOpen(false)

	// `past` is "the reader has left the top of the page", which is what decides
	// whether an overlay bar has earned a background yet. Both it and the ducking
	// live in the shared hook now, because five other workspaces want the same
	// bar and were each going without.
	const { past, hidden } = useHeaderScroll(isMenuOpen)

	const solid = !overlay || past

	return (
		<>
			{/* Not on the overlay pages. The strip has a ground of its own, and the
			    whole point of the overlay cut is that nothing opaque sits between
			    the top of the document and the photograph — a 34px band above a
			    full-bleed hero crops the sky exactly as a solid bar would. The two
			    Discover pages carry these links in the menu and the footer. */}
			{overlay ? null : (
				<UtilityBar
					current='home'
					project={activeItem === 'accidents' || activeItem === 'crafts' || activeItem === 'places' ? activeItem : undefined}
					className='bb-strip bg-[var(--paper-2)]'
					switchIcon={<SquaresFourIcon size={13} weight='bold' aria-hidden='true' />}
					end={
						<>
							<ThemeToggle />
							{/* Phones have no room for it in the strip; the wrapper hides it. */}
							<span className='hidden self-stretch sm:flex'>
								<Link href='/contribute' className='bb-btn bb-btn-accent !px-4 !py-0 !text-[9.5px]'>
									<HandHeartIcon size={13} weight='fill' aria-hidden='true' />
									Contribute
								</Link>
							</span>
						</>
					}
				/>
			)}

		<motion.header
			animate={{ y: hidden ? '-100%' : '0%' }}
			transition={{ duration: 0.42, ease: EASE }}
			data-solid={solid}
			// `fixed` on the overlay pages, `sticky` everywhere else. A sticky bar
			// still occupies a row in the flow, so on a page that opens on a
			// full-bleed photograph it pushes the picture down and sits above it
			// rather than on it — the whole point of the overlay cut. Taking it out
			// of the flow lets the hero start at the top of the document, which is
			// where a masthead photograph has to start.
			className={`z-30 border-b transition-colors duration-500 ${
				overlay ? 'fixed inset-x-0 top-0' : 'sticky top-0'
			} ${
				solid
					? 'border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'
					: 'border-transparent bg-transparent'
			}`}
		>
			{/* Over a photograph the bar has no ground of its own, so the links take
			    the picture's scrim instead — set on a wrapper rather than on each
			    link, so the whole row lifts or drops together.

			    Full white with a shadow under it, not 85%. The heroes it sits over
			    are not all dark: Culture & Places opens on a pale sandbar and the
			    Discover index on the same picture, where a dimmed white lands within
			    a few points of the sky behind it. The shadow is what makes one set
			    of colors work over every crop — it costs nothing on a dark
			    photograph and is the whole difference on a bright one. */}
			<div
				className={
					overlay && !solid
						? '[&_*:not(.nav-menu,.nav-menu_*)]:!text-white [&_*:not(.nav-menu,.nav-menu_*)]:[text-shadow:0_1px_14px_rgba(8,8,6,0.6)]'
						: ''
				}
			>
				<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
					{/* Three tracks so the links sit on the true center of the header
					    rather than wherever the mark and controls leave room.

					    Two on a phone, where the center track holds a nav that is not
					    rendered at all. Three equal-ish tracks with nothing in the middle
					    one gave the mark half the row and the controls the other half,
					    and the mark is a fixed-width image: the moment its share fell
					    below its natural width it was squeezed narrower while its height
					    stayed put, which is a wordmark rendered out of proportion. An
					    `auto` track gives it exactly what it measures and hands the rest
					    to the controls. */}
					<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-2'>
						<div className='flex items-center gap-3'>
							<Link href='/' onClick={closeMenu} className='w-fit shrink-0'>
								{/* Over a photograph the ground is dark whatever the theme is,
								    so the name goes white there; otherwise it follows the ink. */}
								<BrandLogo className={overlay && !solid ? 'text-white' : 'text-[var(--ink)]'} />
							</Link>
						</div>

						{/* No frame or fill — the links are grouped by proximity alone. */}
						<nav className='hidden items-center justify-end gap-1 md:flex'>
							<Menu label='Discover BARMM' active={activeItem === 'discover'} width='w-[15rem]'>
								{(close) =>
									discoverSections.map((item) => (
										<Link key={item.href} href={item.href} onClick={close} className={menuItemClass}>
											{item.label}
										</Link>
									))
								}
							</Menu>

							{secondaryLinks.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									data-active={activeItem === item.key}
									className='nav-item'
								>
									{item.label}
								</Link>
							))}
						</nav>

						<div className='flex items-center justify-end gap-2 md:gap-1.5'>
							{/* The theme switch and Contribute live in the strip; on the overlay
							    pages, which have no strip, they stay in the bar. */}
							{overlay ? (
								<div className='hidden items-center md:flex'>
									<ThemeToggle />
									<span className='w-1.5' aria-hidden='true' />
								</div>
							) : null}

							{/* Map hidden for now — restore with the imports above.
							<MapDialog className='bb-btn bb-btn-ghost hidden cursor-pointer !px-4 !py-2.5 !text-[10px] md:inline-flex'>
								<MapTrifoldIcon size={15} weight='bold' aria-hidden='true' />
								Map
							</MapDialog> */}

							{overlay ? (
								<Magnetic strength={0.22} className='hidden sm:inline-flex'>
									<Link
										href='/contribute'
										className='bb-btn bb-btn-accent !px-4 !py-2.5 !text-[10px]'
									>
										<HandHeartIcon size={15} weight='fill' aria-hidden='true' />
										Contribute
									</Link>
								</Magnetic>
							) : null}

							<button
								type='button'
								aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
								aria-expanded={isMenuOpen}
								aria-controls='site-mobile-menu'
								onClick={() => setIsMenuOpen((current) => !current)}
								className='inline-flex size-9 cursor-pointer items-center justify-center border border-current text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] md:hidden'
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
			</div>

			{/* Mobile menu. Height is animated through a grid track rather than a
			    max-height guess, so a menu that grows by one link still opens to
			    exactly its own height. */}
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
							id='site-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[88rem] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							<p className='bb-label'>Discover BARMM</p>
							<div className='mt-3 grid'>
								{discoverSections.map((item) => (
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

							<p className='bb-label mt-7'>Project</p>
							<div className='mt-3 grid'>
								{[...secondaryLinks, { key: 'accidents', href: '/accidents', label: 'Incident Watch' } as const, { key: 'crafts', href: '/crafts', label: 'Crafts' } as const, { key: 'places', href: '/places', label: 'Places' } as const].map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										data-active={activeItem === item.key}
										className='border-b border-[var(--rule-soft)] py-2.5 data-[active=true]:text-[var(--accent)]'
									>
										{item.label}
									</Link>
								))}
								{/* Map hidden for now.
								<MapDialog
									className='cursor-pointer border-b border-[var(--rule-soft)] py-2.5 text-left'
								>
									Interactive map
								</MapDialog> */}
								<Link
									href='/contribute'
									onClick={closeMenu}
									data-active={activeItem === 'contribute'}
									className='py-2.5 data-[active=true]:text-[var(--accent)]'
								>
									Contribute
								</Link>
							</div>

							<UtilityMenuLinks links={ESTATE_LINKS.filter((link) => link.href !== '/about')} onNavigate={closeMenu} />

							{/* Last, under the links: the one row here that changes the page
							    rather than leaving it. The button carries the icon and the
							    label says which control it is, since an icon alone in a list
							    of words has nothing to read it against. The pull to the right
							    is the button's own padding, so the glyph lines up with the
							    rows above it rather than the box around it. */}
							<p className='bb-label mt-7'>Appearance</p>
							<div className='mt-3 flex items-center justify-between gap-3 py-1'>
								Theme
								<span className='-mr-2 flex'>
									<ThemeToggle />
								</span>
							</div>
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* How far down the document the reader is. Only drawn once the bar has
			    a ground under it — a progress hairline floating over a photograph
			    with nothing behind it reads as a stray rule. */}
			{solid ? <ScrollProgress /> : null}
		</motion.header>
		</>
	)
}
