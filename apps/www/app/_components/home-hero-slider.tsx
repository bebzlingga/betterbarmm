'use client'

import { useEffect, useState } from 'react'

const heroSlides = [
	{
		id: 'budget',
		eyebrow: 'Budget transparency layer',
		titleLines: ['Make public', 'money readable.'],
		description:
			'BetterBARMM turns appropriations, offices, programs, and source documents into civic infrastructure: searchable, traceable, and built for anyone who wants to follow how public money moves.',
		action: {
			label: 'Open budget portal',
			href: 'https://budget.betterbarmm.com',
		},
	},
	{
		id: 'bills',
		eyebrow: 'Legislative transparency layer',
		titleLines: ['Bangsamoro Laws,', 'Simplified.'],
		description: 'Track proposed measures, authors, committees, readings, and legislative movement as public records mature into laws, policies, and public accountability.',
		action: {
			label: 'Track public bills',
			href: 'https://bills.betterbarmm.com',
		},
	},
]

export function HomeHeroSlider() {
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const interval = window.setInterval(() => {
			setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length)
		}, 6500)

		return () => window.clearInterval(interval)
	}, [])

	return (
		<div className='relative grid'>
			{heroSlides.map((slide, slideIndex) => {
				const isActive = activeIndex === slideIndex

				return (
					<div
						key={slide.id}
						aria-hidden={!isActive}
						className={`home-hero-copy ${isActive ? 'home-hero-copy--active' : ''}`}
					>
						<p className='eyebrow home-hero-kicker'>{slide.eyebrow}</p>
						<h1 className='mt-5 max-w-6xl text-6xl font-extrabold tracking-[-0.045em] sm:text-8xl lg:text-[9rem]'>
							{slide.titleLines.map((line, lineIndex) => (
								<span
									key={line}
									className='home-hero-title-line block sm:whitespace-nowrap'
									style={{ transitionDelay: isActive ? `${120 + lineIndex * 90}ms` : '0ms' }}
								>
									{line}
								</span>
							))}
						</h1>
						<p
							className='home-hero-description mt-7 max-w-3xl text-lg leading-7! text-[var(--ink-2)] sm:text-xl sm:leading-9'
							style={{ transitionDelay: isActive ? '340ms' : '0ms' }}
						>
							{slide.description}
						</p>
						<div
							className='home-hero-actions mt-16 flex flex-wrap items-center gap-3'
							style={{ transitionDelay: isActive ? '460ms' : '0ms' }}
						>
							<a
								href={slide.action.href}
								className='inline-flex border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--paper)] transition hover:bg-[var(--accent)]'
							>
								{slide.action.label}
							</a>
						</div>
					</div>
				)
			})}
		</div>
	)
}
