'use client'

import { CaretDownIcon, HandHeartIcon } from '@phosphor-icons/react'
import { EASE, Magnetic, ScrollProgress } from '@betterbarmm/editorial'
import { AnimatePresence, motion } from 'motion/react'
import { lguProvinces } from '@betterbarmm/lgu-data'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

const workspaces = [
	{ href: 'https://election.betterbarmm.com', label: 'Election' },
	{ href: 'https://legislation.betterbarmm.com', label: 'Legislation' },
	{ href: 'https://budget.betterbarmm.com', label: 'Budget' },
	{ href: 'https://betterbarmm.com/discover', label: 'Discover BARMM' },
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
						className={`absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2 border border-[var(--ink)] bg-[var(--paper)] p-1 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] ${width}`}
					>
						<span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-[var(--brass)]' />
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

	const isProvinceActive = lguProvinces.some((province) => pathname.startsWith(`/${province.slug}`))

	return (
		<header className='sticky top-0 z-30 border-b border-[var(--brass-line)] bg-[var(--paper)]/86 backdrop-blur-xl'>
			<div className='mx-auto max-w-[88rem] px-6 lg:px-8'>
				<div className='grid h-[calc(var(--site-header-h)-1px)] grid-cols-[1fr_auto_1fr] items-center gap-4'>
					<div className='flex min-w-0 items-center gap-3'>
						<Link href='/' onClick={closeMenu} className='w-fit shrink-0'>
							<Image
								src='/logo.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-light'
								style={{ height: 26, width: 'auto' }}
							/>
							<Image
								src='/logo-dark.png'
								alt='BetterBARMM'
								width={142}
								height={26}
								priority
								className='logo-dark'
								style={{ height: 26, width: 'auto' }}
							/>
						</Link>
						{/* The wordmark says BetterBARMM; this says which of its
						    workspaces you are in. */}
						<Link
							href='/'
							onClick={closeMenu}
							className='hidden font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brass)] transition hover:text-[var(--ink)] sm:block'
						>
							Local government
						</Link>
					</div>

					<nav className='hidden items-center gap-1 md:flex'>
						<Menu label='Provinces' active={isProvinceActive} width='w-[17rem]'>
							{(close) =>
								lguProvinces.map((province) => (
									<Link
										key={province.slug}
										href={`/${province.slug}`}
										onClick={close}
										className='nav-menu-item'
									>
										<span>{province.name}</span>
										<span className='num text-[10.5px] text-[var(--ink-mute)]'>
											{province.municipalities.length}
										</span>
									</Link>
								))
							}
						</Menu>

						<Menu label='Workspaces' width='w-[17rem]'>
							{(close) =>
								workspaces.map((item) => (
									<a key={item.href} href={item.href} onClick={close} className='nav-menu-item'>
										{item.label}
									</a>
								))
							}
						</Menu>
					</nav>

					<div className='flex items-center justify-end gap-1.5'>
						<ThemeToggle />
						<span className='w-1.5' aria-hidden='true' />

						<Magnetic strength={0.22} className='hidden sm:inline-flex'>
							<a
								href='https://betterbarmm.com/contribute'
								target='_blank'
								rel='noreferrer'
								className='bb-btn bb-btn-accent !px-4 !py-2.5 !text-[10px]'
							>
								<HandHeartIcon size={15} weight='fill' aria-hidden='true' />
								Contribute
							</a>
						</Magnetic>

						<button
							type='button'
							aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
							aria-expanded={isMenuOpen}
							aria-controls='lgu-mobile-menu'
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
							id='lgu-mobile-menu'
							aria-label='Mobile navigation'
							className='mx-auto max-w-[88rem] px-6 py-6 text-sm text-[var(--ink-2)] lg:px-8'
						>
							<p className='bb-label'>Provinces</p>
							<div className='mt-3 grid'>
								{lguProvinces.map((province) => (
									<Link
										key={province.slug}
										href={`/${province.slug}`}
										onClick={closeMenu}
										className='flex items-center justify-between gap-3 border-b border-[var(--rule-soft)] py-2.5'
									>
										{province.name}
										<span className='num text-[11px] text-[var(--ink-mute)]'>
											{province.municipalities.length}
										</span>
									</Link>
								))}
							</div>

							<p className='bb-label mt-7'>Workspaces</p>
							<div className='mt-3 grid'>
								{workspaces.map((item) => (
									<a
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										className='border-b border-[var(--rule-soft)] py-2.5'
									>
										{item.label}
									</a>
								))}
							</div>
						</nav>
					</motion.div>
				) : null}
			</AnimatePresence>

			<ScrollProgress />
		</header>
	)
}
