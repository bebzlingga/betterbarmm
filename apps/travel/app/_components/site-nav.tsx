'use client'

import { CaretDownIcon, HandHeartIcon, HeartIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { EASE, ScrollProgress, UtilityBar, useHeaderScroll, BrandLogo, UtilityMenuLinks } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import { travelAreas } from '@betterbarmm/travel-data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { GUIDE_PAGES } from '../_lib/guide'

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
						className={`absolute right-0 top-full z-40 mt-1  border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
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
	const { past, hidden } = useHeaderScroll(isMenuOpen)
	const closeMenu = () => setIsMenuOpen(false)

	const isAreaActive = travelAreas.some((area) => pathname.startsWith(`/${area.slug}`))
	const isGuideActive = guide.some((item) => pathname.startsWith(item.href))

	return (
		<>
			{/* The estate's strip, above the workspace's own bar. Not sticky:
			    it belongs to the top of the document, and the navigation a
			    reader actually needs mid-page is the bar under it. */}
			<UtilityBar
				base='https://betterbarmm.com'
				current='travel'
				className='bb-strip bg-[var(--paper-2)]'
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

			{/* The estate's masthead behaviour, the same on every workspace: it
			    takes a ground once the reader has left the top, and ducks out of the
			    way when they are reading down. `useHeaderScroll` also publishes the
			    flag the shared stylesheet reads to drop `--sticky-top`, so anything
			    sticking under this bar follows it up instead of leaving a band of
			    empty page. */}
		<motion.header
			animate={{ y: hidden ? '-100%' : '0%' }}
			transition={{ duration: 0.42, ease: EASE }}
			data-solid={past}
			className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'
		>
			<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
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
						{/* The places, browsed like stays: the front page. */}
						<Link href='/' data-active={pathname === '/' || pathname.startsWith('/places')} className='nav-item'>
							Explore
						</Link>

						<Menu label='Areas' active={isAreaActive} width='w-[19rem]'>
							{(close) =>
								travelAreas.map((area) => (
									<Link
										key={area.slug}
										href={`/${area.slug}`}
										onClick={close}
										className='nav-menu-item'
									>
										<span>{area.name}</span>
										<span className='text-[0.65625rem] text-[var(--ink-mute)]'>{area.base}</span>
									</Link>
								))
							}
						</Menu>

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
							className='mx-auto max-w-[88rem] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain'
						>
							<div className='grid'>
								<Link href='/' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Explore places
								</Link>
								<Link href='/saved' onClick={closeMenu} className='border-b border-[var(--rule-soft)] py-2.5 font-semibold text-[var(--ink)]'>
									Saved
								</Link>
							</div>

							<p className='bb-label mt-7'>Areas</p>
							<div className='mt-3 grid'>
								{travelAreas.map((area) => (
									<Link
										key={area.slug}
										href={`/${area.slug}`}
										onClick={closeMenu}
										className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5'
									>
										{area.name}
										<span className='text-[0.6875rem] text-[var(--ink-mute)]'>{area.base}</span>
									</Link>
								))}
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
		</motion.header>
		</>
	)
}
