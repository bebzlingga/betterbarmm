'use client'

import { CaretDownIcon, HandHeartIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { EASE, Magnetic, ScrollProgress } from '@betterbarmm/editorial'
import { ThemeToggle } from './theme-toggle'

type SiteHeaderProps = {
	activeItem?: 'discover' | 'about' | 'contribute'
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

const workspaces = [
	{ label: 'Election', href: 'https://election.betterbarmm.com', open: true },
	{ label: 'Legislation', href: 'https://legislation.betterbarmm.com', open: true },
	{ label: 'Budget', href: '/soon', open: false },
	{ label: 'Local government', href: '/soon', open: false },
] as const

const secondaryLinks = [{ key: 'about', href: '/about', label: 'About' }] as const

/** Marks a workspace whose site exists but whose data isn't published yet. */
function SoonBadge() {
	return <span className='badge badge-plain badge-idle shrink-0'>Soon</span>
}

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
						className={`nav-menu absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						{/* The brass hairline at the head of the panel is the same mark the
						    section kickers use, so a dropdown reads as part of the page's
						    own vocabulary rather than as a browser widget. */}
						<span
							aria-hidden='true'
							className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]'
						/>
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
	// `past` is "the reader has left the top of the page", which is what decides
	// whether an overlay bar has earned a background yet.
	const [past, setPast] = useState(false)
	const [hidden, setHidden] = useState(false)
	const closeMenu = () => setIsMenuOpen(false)

	const { scrollY } = useScroll()
	const lastY = useRef(0)

	useMotionValueEvent(scrollY, 'change', (y) => {
		setPast(y > 24)

		// Hide going down, reveal coming up. The threshold is what stops a
		// trackpad's one-pixel jitter from flickering the bar, and the bar never
		// hides near the top of the document — there is nothing to reclaim there,
		// and a masthead that ducks away on the first scroll reads as a fault.
		const delta = y - lastY.current
		if (Math.abs(delta) > 6) {
			setHidden(delta > 0 && y > 260 && !isMenuOpen)
			lastY.current = y
		}
	})

	// Anything that sticks under this bar has to know where its underside is, and
	// the bar moves: it ducks away going down and comes back coming up. The state
	// is published on the document element so a sticky element can offset itself
	// in CSS — `--sticky-top` below — rather than every one of them subscribing to
	// the same scroll handler.
	useEffect(() => {
		document.documentElement.dataset.headerHidden = hidden ? 'true' : 'false'
	}, [hidden])

	const solid = !overlay || past

	return (
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
			    of colours work over every crop — it costs nothing on a dark
			    photograph and is the whole difference on a bright one. */}
			<div
				className={
					overlay && !solid
						? '[&_*:not(.nav-menu,.nav-menu_*)]:!text-white [&_*:not(.nav-menu,.nav-menu_*)]:[text-shadow:0_1px_14px_rgba(8,8,6,0.6)]'
						: ''
				}
			>
				<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
					{/* Three tracks so the links sit on the true centre of the header
					    rather than wherever the mark and controls leave room.

					    Two on a phone, where the centre track holds a nav that is not
					    rendered at all. Three equal-ish tracks with nothing in the middle
					    one gave the mark half the row and the controls the other half,
					    and the mark is a fixed-width image: the moment its share fell
					    below its natural width it was squeezed narrower while its height
					    stayed put, which is a wordmark rendered out of proportion. An
					    `auto` track gives it exactly what it measures and hands the rest
					    to the controls. */}
					<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[1fr_auto_1fr]'>
						<div className='flex items-center gap-3'>
							<Link href='/' onClick={closeMenu} className='w-fit shrink-0'>
								{/* The mark ships in two cuts: the dark-ink one for a light
								    ground, the light-ink one for a dark ground. Normally the
								    theme picks between them. Over a photograph the ground is
								    dark whatever the theme is, so that page takes the light-ink
								    cut outright and the pair is not rendered at all.

								    `priority` because the mark sits at the top of every page;
								    lazy-loading it leaves a gap on first paint. The explicit
								    style is what stops Next warning that one dimension was
								    overridden and the other left to the intrinsic size. */}
								{overlay && !solid ? (
									<Image
										src='/logo-dark.png'
										alt='BetterBARMM'
										width={142}
										height={26}
										priority
										className='max-w-none'
										style={{ height: 26, width: 'auto' }}
									/>
								) : (
									<>
										<Image
											src='/logo.png'
											alt='BetterBARMM'
											width={142}
											height={26}
											priority
											className='logo-light max-w-none'
											style={{ height: 26, width: 'auto' }}
										/>
										<Image
											src='/logo-dark.png'
											alt='BetterBARMM'
											width={142}
											height={26}
											priority
											className='logo-dark max-w-none'
											style={{ height: 26, width: 'auto' }}
										/>
									</>
								)}
							</Link>
						</div>

						{/* No frame or fill — the links are grouped by proximity alone. */}
						<nav className='hidden items-center gap-1 md:flex'>
							<Menu label='Discover BARMM' active={activeItem === 'discover'} width='w-[15rem]'>
								{(close) =>
									discoverSections.map((item) => (
										<Link key={item.href} href={item.href} onClick={close} className={menuItemClass}>
											{item.label}
										</Link>
									))
								}
							</Menu>

							<Menu label='Workspaces' width='w-[17rem]'>
								{(close) =>
									workspaces.map((item) =>
										item.open ? (
											<a key={item.href} href={item.href} onClick={close} className={menuItemClass}>
												{item.label}
											</a>
										) : (
											<span
												key={item.href}
												className={`${menuItemClass} nav-menu-item-idle`}
											>
												{item.label}
												<SoonBadge />
											</span>
										),
									)
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
							{/* The theme switch is a desktop control here. On a phone the row
							    is a mark, a call to action and a way into the site, and a fourth
							    icon between them read as clutter — it is a setting, which is
							    what the menu panel is for. It moves there rather than being
							    duplicated, so there is only ever one of it. */}
							<div className='hidden items-center md:flex'>
								<ThemeToggle />
								<span className='w-1.5' aria-hidden='true' />
							</div>

							<Magnetic strength={0.22} className='hidden sm:inline-flex'>
								<Link
									href='/contribute'
									className='bb-btn bb-btn-accent !px-4 !py-2.5 !text-[10px]'
								>
									<HandHeartIcon size={15} weight='fill' aria-hidden='true' />
									Contribute
								</Link>
							</Magnetic>

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
							className='mx-auto max-w-[88rem] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8'
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

							<p className='bb-label mt-7'>Workspaces</p>
							<div className='mt-3 grid'>
								{workspaces.map((item) =>
									item.open ? (
										<a
											key={item.href}
											href={item.href}
											onClick={closeMenu}
											className='border-b border-[var(--rule-soft)] py-2.5'
										>
											{item.label}
										</a>
									) : (
										<span
											key={item.href}
											className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5 text-[var(--ink-mute)]'
										>
											{item.label}
											<SoonBadge />
										</span>
									),
								)}
							</div>

							<p className='bb-label mt-7'>Project</p>
							<div className='mt-3 grid'>
								{secondaryLinks.map((item) => (
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
								<Link
									href='/contribute'
									onClick={closeMenu}
									data-active={activeItem === 'contribute'}
									className='py-2.5 data-[active=true]:text-[var(--accent)]'
								>
									Contribute
								</Link>
							</div>

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
	)
}
