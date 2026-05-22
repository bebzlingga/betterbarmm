'use client'

import { useEffect, useMemo, useState } from 'react'
import type { BillRecord } from '../_lib/bills-data'

type BillActionType = {
	value: string
	label: string
}

type BillBrowserProps = {
	bills: BillRecord[]
	categories: string[]
	actionTypes: BillActionType[]
}

const formatAuthors = (authors: string[]) => {
	if (authors.length === 0) {
		return 'Author pending'
	}

	if (authors.length === 1) {
		return authors[0]
	}

	return `${authors[0]} + ${authors.length - 1} more`
}

const sourceLabel = (value: string) =>
	value
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ')

const titleCaseText = (value: string) => value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

const confidenceExplanation = (bill: BillRecord) => {
	const basis = bill.readingBasis && bill.readingBasis !== 'Basis pending' ? `Basis: ${bill.readingBasis}.` : 'Basis: available source links and extracted metadata.'
	const improvement = bill.dataQualityNotes
		? `What can improve: resolve this data note — ${bill.dataQualityNotes}`
		: 'What can improve: cross-check the official PDF or full text and confirm author, date, and source metadata.'

	if (bill.confidence.toLowerCase() === 'high') {
		return `The core title, date, category, and source trail are strongly supported. ${basis} ${improvement}`
	}

	if (bill.confidence.toLowerCase() === 'medium') {
		return `The record is usable for discovery, but some source extraction, author metadata, or full-text review may be incomplete. ${basis} ${improvement}`
	}

	return `This record needs additional review before citation. ${basis} ${improvement}`
}

export function BillBrowser({ bills, categories, actionTypes }: BillBrowserProps) {
	const [search, setSearch] = useState('')
	const [category, setCategory] = useState('all')
	const [actionType, setActionType] = useState('all')
	const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null)

	const filteredBills = useMemo(() => {
		const query = search.trim().toLowerCase()

		return bills.filter((bill) => {
			const matchesSearch =
				query.length === 0 ||
				[bill.display, bill.titleShort, bill.titleOfficial, bill.category, bill.actionTypeLabel, bill.gist, bill.principalAuthors.join(' '), bill.coAuthors.join(' ')]
					.join(' ')
					.toLowerCase()
					.includes(query)

			const matchesCategory = category === 'all' || bill.category === category
			const matchesAction = actionType === 'all' || (bill.actionType || 'general') === actionType

			return matchesSearch && matchesCategory && matchesAction
		})
	}, [actionType, bills, category, search])

	useEffect(() => {
		if (!selectedBill) {
			return
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setSelectedBill(null)
			}
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			document.body.style.overflow = previousOverflow
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [selectedBill])

	return (
		<>
			<section className='mx-auto max-w-7xl px-6 py-14 pb-24! sm:px-8 sm:py-16 lg:py-24 lg:pb-32!'>
				<div className='grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:items-end'>
					<label className='grid gap-2'>
						<span className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>Search</span>
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder='Search title, BAA number, author, category'
							className='h-12 min-w-0 border border-[var(--rule)] bg-transparent px-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-mute)] focus:border-[var(--ink)]'
						/>
					</label>

					<label className='grid gap-2'>
						<span className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>Category</span>
						<span className='relative block'>
							<select
								value={category}
								onChange={(event) => setCategory(event.target.value)}
								className='h-12 w-full min-w-0 appearance-none border border-[var(--rule)] bg-[var(--paper)] px-4 pr-10 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--ink)]'
							>
								<option value='all'>All Categories</option>
								{categories.map((item) => (
									<option
										key={item}
										value={item}
									>
										{titleCaseText(item)}
									</option>
								))}
							</select>
							<svg
								className='pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink)]'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								aria-hidden='true'
							>
								<path d='m6 9 6 6 6-6' />
							</svg>
						</span>
					</label>

					<label className='grid gap-2'>
						<span className='font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]'>Type</span>
						<span className='relative block'>
							<select
								value={actionType}
								onChange={(event) => setActionType(event.target.value)}
								className='h-12 w-full min-w-0 appearance-none border border-[var(--rule)] bg-[var(--paper)] px-4 pr-10 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--ink)]'
							>
								<option value='all'>All Types</option>
								{actionTypes.map((item) => (
									<option
										key={item.value}
										value={item.value}
									>
										{item.label}
									</option>
								))}
							</select>
							<svg
								className='pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--ink)]'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								aria-hidden='true'
							>
								<path d='m6 9 6 6 6-6' />
							</svg>
						</span>
					</label>

					<button
						type='button'
						onClick={() => {
							setSearch('')
							setCategory('all')
							setActionType('all')
						}}
						className='h-12 border border-[var(--rule)] px-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)]'
					>
						Clear
					</button>
				</div>

				<div className='mt-5 flex flex-col justify-between gap-2 border-b border-[var(--ink)] pb-6 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)] sm:flex-row'>
					<p>
						{filteredBills.length.toLocaleString()} of {bills.length.toLocaleString()} acts shown
					</p>
					<p>Click a row to inspect source notes</p>
				</div>

				<div className='border-b border-[var(--ink)]'>
					{filteredBills.map((bill) => (
						<button
							key={bill.id}
							type='button'
							onClick={() => setSelectedBill(bill)}
							className='group grid w-full cursor-pointer gap-4 border-t border-[var(--rule-soft)] py-5 text-left transition hover:bg-[var(--paper-2)] sm:gap-6 sm:px-4 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(18rem,1.4fr)_minmax(12rem,0.85fr)_minmax(3rem,0.2fr)] lg:items-center lg:gap-8'
						>
							<div>
								<p className='num text-2xl font-extrabold leading-none tracking-[-0.03em] sm:text-3xl'>BAA {bill.baaNumber}</p>
								<p className='mt-2  font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]'>{bill.category}</p>
								<p className='font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]'>
									{bill.actionTypeLabel} / {bill.dateDisplay}
								</p>
							</div>

							<div>
								<h2 className='text-lg font-extrabold leading-tight tracking-[-0.02em]'>{bill.titleShort}</h2>
								<p className='mt-2 line-clamp-2 max-w-3xl text-xs leading-normal text-[var(--ink-2)]'>{bill.titleOfficial}</p>
							</div>

							<div>
								<p className='mt-2 text-sm leading-6 text-[var(--ink-2)]'>{formatAuthors(bill.principalAuthors)}</p>
							</div>

							<div className='flex items-center justify-end gap-4 lg:block lg:text-right'>
								<p className='font-mono text-xl text-[var(--accent)] lg:mt-2'>→</p>
							</div>
						</button>
					))}

					{filteredBills.length === 0 ? (
						<div className='border-t border-[var(--rule-soft)] py-16 text-center'>
							<p className='text-2xl font-extrabold tracking-[-0.02em]'>No bills match this view.</p>
							<p className='mt-2 text-sm text-[var(--ink-3)]'>Try clearing filters or searching a broader term.</p>
						</div>
					) : null}
				</div>
			</section>

			{selectedBill ? (
				<div
					className='fixed inset-0 z-50 flex bg-black/55 p-0 sm:items-center sm:p-6'
					role='presentation'
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setSelectedBill(null)
						}
					}}
				>
					<section
						role='dialog'
						aria-modal='true'
						aria-labelledby='bill-dialog-title'
						className='h-[100dvh] max-h-[100dvh] w-[100dvw] overflow-y-auto bg-[var(--paper)] text-[var(--ink)] sm:mx-auto sm:h-auto sm:max-h-[94vh] sm:w-[calc(100vw-3rem)] sm:max-w-none sm:border sm:border-[var(--ink)] sm:shadow-2xl lg:w-[min(96vw,86rem)] xl:w-[min(94vw,92rem)]'
					>
						<div className='sticky top-0 z-10 flex items-center justify-between gap-4 bg-[var(--paper)] px-5 py-4 sm:px-8 lg:px-16'>
							<p className='eyebrow mt-1 min-w-0 leading-5'>{selectedBill.display}</p>
							<button
								type='button'
								onClick={() => setSelectedBill(null)}
								className='cursor-pointer shrink-0 border border-[var(--rule)] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition hover:border-[var(--ink)] hover:bg-[var(--paper-2)]'
							>
								Close
							</button>
						</div>

						<div className='px-5 pb-10 sm:px-8 lg:px-16'>
							<div className='grid border-y border-[var(--ink)] lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]'>
									<div className='border-b border-[var(--rule)] py-6 lg:border-b-0 lg:border-r lg:pr-8'>
										<h2
											id='bill-dialog-title'
											className='-ml-1 max-w-4xl text-3xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-5xl'
									>
										{selectedBill.titleShort}
									</h2>
									<p className='mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-3)]'>Official title</p>
									<p className='mt-3 max-w-5xl text-lg font-extrabold leading-snug tracking-[-0.02em] sm:text-xl'>{selectedBill.titleOfficial}</p>
								</div>
									<div className='grid content-start'>
										<div className='grid md:grid-cols-3'>
										{[
											['Date', selectedBill.dateDisplay],
											['Category', titleCaseText(selectedBill.category)],
											['Type', titleCaseText(selectedBill.actionTypeLabel)],
										].map(([label, value], index) => (
											<div
												key={label}
													className={`border-[var(--rule)] py-5 md:px-5 ${index < 2 ? 'border-b md:border-b-0 md:border-r' : ''}`}
											>
												<p className='font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>{label}</p>
												<p className='mt-3 text-sm font-bold leading-5'>{value}</p>
											</div>
										))}
									</div>
									<div className='border-t border-[var(--rule)] py-5 md:px-5'>
										<p className='font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--ink-3)]'>Confidence</p>
										<p className='mt-3 text-sm font-bold'>
											{titleCaseText(selectedBill.confidence)}
											<span className='font-normal'>. {confidenceExplanation(selectedBill)}</span>
										</p>
									</div>
								</div>
							</div>

							<div className='mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:gap-24'>
								<div className='space-y-8'>
									<div>
										<p className='eyebrow'>Plain-language analysis</p>
										<p className='mt-4 text-base leading-7 text-[var(--ink-2)]'>{selectedBill.gist}</p>
									</div>

									{selectedBill.keyEffects.length > 0 ? (
										<div>
											<p className='eyebrow'>Key effects</p>
											<div className='mt-4 grid gap-3'>
												{selectedBill.keyEffects.map((effect, index) => (
													<div
														key={`${selectedBill.id}-effect-${index}`}
														className='grid gap-3 border-t border-[var(--rule-soft)] pt-3 sm:grid-cols-[3rem_1fr]'
													>
														<p className='num text-sm font-bold text-[var(--accent)]'>0{index + 1}</p>
														<p className='text-sm leading-6 text-[var(--ink-2)]'>{effect}</p>
													</div>
												))}
											</div>
										</div>
									) : null}
								</div>

								<aside className='grid content-start gap-8'>
									{selectedBill.appropriationAmount || selectedBill.fiscalYear ? (
										<div>
											<p className='eyebrow'>Budget reference</p>
											{selectedBill.appropriationAmount ? <p className='mt-4 num text-3xl font-extrabold tracking-[-0.03em]'>{selectedBill.appropriationAmount}</p> : null}
											{selectedBill.fiscalYear ? <p className='mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]'>Fiscal year {selectedBill.fiscalYear}</p> : null}
										</div>
									) : null}

									<div>
										<p className='eyebrow'>Principal authors</p>
										<p className='mt-4 text-sm leading-6 text-[var(--ink-2)]'>{selectedBill.principalAuthors.join(', ') || 'Author pending'}</p>
									</div>

									{selectedBill.coAuthors.length > 0 ? (
										<div>
											<p className='eyebrow'>Co-authors</p>
											<p className='mt-4 text-sm leading-6 text-[var(--ink-2)]'>{selectedBill.coAuthors.join(', ')}</p>
										</div>
									) : null}

									<div>
										<p className='eyebrow'>Review status</p>
										<p className='mt-4 text-sm leading-6 text-[var(--ink-2)]'>{selectedBill.readingStatus}</p>
										<p className='mt-4 text-sm leading-6 text-[var(--ink-3)]'>{selectedBill.readingBasis}</p>
									</div>

									{selectedBill.relatedBaaNumbers.length > 0 ? (
										<div>
											<p className='eyebrow'>Related BAAs</p>
											<p className='mt-4 font-mono text-sm uppercase tracking-[0.12em] text-[var(--ink-2)]'>{selectedBill.relatedBaaNumbers.map((number) => `BAA ${number}`).join(' / ')}</p>
										</div>
									) : null}

									{selectedBill.dataQualityNotes ? (
										<div>
											<p className='eyebrow'>Data note</p>
											<p className='mt-4 text-sm leading-6 text-[var(--ink-2)]'>{selectedBill.dataQualityNotes}</p>
										</div>
									) : null}
								</aside>
							</div>

							{selectedBill.sourceLinks.length > 0 ? (
								<div className='mt-16 border-t border-[var(--rule)] py-5 text-sm font-bold leading-7 text-[var(--ink)]'>
									<span>References: </span>
									{selectedBill.sourceLinks.map((source, index) => {
										const label = sourceLabel(source.type)
										const content = source.url ?? source.fileName ?? label

										return (
											<span key={`${selectedBill.id}-source-${index}`}>
												{source.url ? (
													<a
														href={source.url}
														target='_blank'
														rel='noreferrer'
														className='rule-link'
													>
														{label}
													</a>
												) : (
													<span className='border-b border-[var(--accent)]'>{content}</span>
												)}
												{index < selectedBill.sourceLinks.length - 1 ? ', ' : ''}
											</span>
										)
									})}
								</div>
							) : null}
						</div>
					</section>
				</div>
			) : null}
		</>
	)
}
